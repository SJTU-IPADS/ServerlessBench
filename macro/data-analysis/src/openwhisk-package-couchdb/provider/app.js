/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Service which can be configured to listen for triggers from a provider.
 * The Provider will store, invoke, and POST whisk events appropriately.
 */
var URL = require('url').URL;
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var bluebird = require('bluebird');
var logger = require('./Logger');

var ProviderUtils = require('./lib/utils.js');
var ProviderHealth = require('./lib/health.js');
var ProviderRAS = require('./lib/ras.js');
var ProviderActivation = require('./lib/active.js');
var constants = require('./lib/constants.js');

// Initialize the Express Application
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('port', process.env.PORT || 8080);

// Allow invoking servers with self-signed certificates.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// If it does not already exist, create the triggers database.  This is the database that will
// store the managed triggers.
var dbUsername = process.env.DB_USERNAME;
var dbPassword = process.env.DB_PASSWORD;
var dbHost = process.env.DB_HOST;
var dbProtocol = process.env.DB_PROTOCOL;
var dbPrefix = process.env.DB_PREFIX;
var dbUrl = process.env.DB_URL;
var databaseName = dbPrefix + constants.TRIGGER_DB_SUFFIX;
var redisUrl = process.env.REDIS_URL;
var monitoringAuth = process.env.MONITORING_AUTH;
var monitoringInterval = process.env.MONITORING_INTERVAL || constants.MONITOR_INTERVAL;
var filterDDName = '_design/' + constants.FILTERS_DESIGN_DOC;
var viewDDName = '_design/' + constants.VIEWS_DESIGN_DOC;

// Create the Provider Server
var server = http.createServer(app);
server.listen(app.get('port'), function() {
    logger.info('server.listen', 'Express server listening on port ' + app.get('port'));
});

function createDatabase() {
    var method = 'createDatabase';
    logger.info(method, 'creating the trigger database');
    console.log('dbUrl=' + dbUrl);
    var couchdb = require('nano')(dbUrl);

    if (couchdb !== null) {
        logger.info(method, 'couchdb not null!');
        return new Promise(function (resolve, reject) {
            logger.info(method, 'creating database:', databaseName);
            couchdb.db.create(databaseName, function (err, body) {
                if (!err) {
                    logger.info(method, 'created trigger database:', databaseName);
                }
                else if (err.statusCode !== 412) {
                    logger.info(method, 'failed to create trigger database:', databaseName, err);
                }

                var viewDD = {
                    views: {
                        triggers_by_worker: {
                            map: function (doc) {
                                if (doc.maxTriggers && (!doc.status || doc.status.active === true)) {
                                    emit(doc.worker || 'worker0', 1);
                                }
                            }.toString(),
                            reduce: '_count'
                        }
                    }
                };

                createDesignDoc(couchdb.db.use(databaseName), viewDDName, viewDD)
                .then(db => {
                    var filterDD = {
                        filters: {
                            triggers_by_worker:
                                function (doc, req) {
                                    return doc.maxTriggers && ((!doc.worker && req.query.worker === 'worker0') ||
                                            (doc.worker === req.query.worker));
                                }.toString()
                        }
                    };
                    return createDesignDoc(db, filterDDName, filterDD);
                })
                .then(db => {
                    if (monitoringAuth) {
                        var filterDD = {
                            filters: {
                                canary_docs:
                                    function (doc, req) {
                                        return doc.isCanaryDoc && doc.host === req.query.host;
                                    }.toString()
                            }
                        };
                        return createDesignDoc(db, '_design/' + constants.MONITOR_DESIGN_DOC, filterDD);
                    }
                    else {
                        return Promise.resolve(db);
                    }
                })
                .then((db) => {
                    resolve(db);
                })
                .catch(err => {
                    reject(err);
                });

            });
        });
    }
    else {
        Promise.reject('couchdb provider did not get created.  check db URL: ' + dbHost);
    }
}

function createDesignDoc(db, ddName, designDoc) {
    var method = 'createDesignDoc';

    return new Promise(function(resolve, reject) {

        db.get(ddName, function (error, body) {
            if (error) {
                //new design doc
                db.insert(designDoc, ddName, function (error, body) {
                    if (error && error.statusCode !== 409) {
                        logger.error(method, error);
                        reject('design doc could not be created: ' + error);
                    }
                    else {
                        resolve(db);
                    }
                });
            }
            else {
                resolve(db);
            }
        });
    });
}

function createRedisClient() {
    var method = 'createRedisClient';

    return new Promise(function(resolve, reject) {
        if (redisUrl) {
            var client;
            var redis = require('redis');
            bluebird.promisifyAll(redis.RedisClient.prototype);
            if (redisUrl.startsWith('rediss://')) {
                // If this is a rediss: connection, we have some other steps.
                client = redis.createClient(redisUrl, {
                    tls: { servername: new URL(redisUrl).hostname }
                });
                // This will, with node-redis 2.8, emit an error:
                // "node_redis: WARNING: You passed "rediss" as protocol instead of the "redis" protocol!"
                // This is a bogus message and should be fixed in a later release of the package.
            } else {
                client = redis.createClient(redisUrl);
            }

            client.on('connect', function () {
                resolve(client);
            });

            client.on('error', function (err) {
                logger.error(method, 'Error connecting to redis', err);
                reject(err);
            });
        }
        else {
            resolve();
        }
    });
}

// Initialize the Provider Server
function init(server) {
    var method = 'init';
    var couchdb;
    var providerUtils;

    if (server !== null) {
        var address = server.address();
        if (address === null) {
            logger.error(method, 'Error initializing server. Perhaps port is already in use.');
            process.exit(-1);
        }
    }

    createDatabase()
    .then(db => {
        couchdb = db;
        return createRedisClient();
    })
    .then(client => {
        providerUtils = new ProviderUtils(logger, couchdb, client);
        return providerUtils.initRedis();
    })
    .then(() => {
        var providerRAS = new ProviderRAS();
        var providerHealth = new ProviderHealth(logger, providerUtils);
        var providerActivation = new ProviderActivation(logger, providerUtils);

        // RAS Endpoint
        app.get(providerRAS.endPoint, providerRAS.ras);

        // Health Endpoint
        app.get(providerHealth.endPoint, providerUtils.authorize, providerHealth.health);

        // Activation Endpoint
        app.get(providerActivation.endPoint, providerUtils.authorize, providerActivation.active);

        providerUtils.initAllTriggers();

        if (monitoringAuth) {
            setInterval(function () {
                providerHealth.monitor(monitoringAuth, monitoringInterval);
            }, monitoringInterval);
        }
    })
    .catch(err => {
        logger.error(method, 'The following connection error occurred:', err);
        process.exit(1);
    });

}

init(server);
