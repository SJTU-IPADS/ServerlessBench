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

var request = require('request');
var HttpStatus = require('http-status-codes');
var constants = require('./constants.js');
var authHandler = require('./authHandler');

module.exports = function(logger, triggerDB, redisClient) {

    var retryAttempts = constants.RETRY_ATTEMPTS;
    var filterDDName = constants.FILTERS_DESIGN_DOC;
    var viewDDName = constants.VIEWS_DESIGN_DOC;
    var triggersByWorker = constants.TRIGGERS_BY_WORKER;
    var redisKeyPrefix = process.env.REDIS_KEY_PREFIX || triggerDB.config.db;
    var self = this;

    this.triggers = {};
    this.endpointAuth = process.env.ENDPOINT_AUTH;
    this.routerHost = process.env.ROUTER_HOST || 'localhost';
    this.worker = process.env.WORKER || 'worker0';
    this.host = process.env.HOST_INDEX || 'host0';
    this.hostPrefix = this.host.replace(/\d+$/, '');
    this.activeHost = `${this.hostPrefix}0`; //default value on init (will be updated for existing redis)
    this.db = triggerDB;
    this.redisClient = redisClient;
    this.redisKey = redisKeyPrefix + '_' + this.worker;
    this.redisField = constants.REDIS_FIELD;
    this.uriHost ='https://' + this.routerHost;
    this.monitorStatus = {};

    // Add a trigger: listen for changes and dispatch.
    this.createTrigger = function(triggerData) {
        var method = 'createTrigger';

        var couchdbConnection = require('nano')(process.env.DB_URL);

        try {
            var triggeredDB = couchdbConnection.use(triggerData.dbname);

            // Listen for changes on this database.
            var feed = triggeredDB.follow({since: triggerData.since, include_docs: false});
            if (triggerData.filter) {
                feed.filter = triggerData.filter;
            }
            if (triggerData.query_params) {
                feed.query_params = triggerData.query_params;
            }

            triggerData.feed = feed;
            self.triggers[triggerData.id] = triggerData;

            feed.on('change', function (change) {
                var triggerHandle = self.triggers[triggerData.id];
                if (triggerHandle && shouldFireTrigger(triggerHandle) && hasTriggersRemaining(triggerHandle)) {
                    logger.info(method, 'Trigger', triggerData.id, 'got change from', triggerData.dbname);
                    try {
                        fireTrigger(triggerData.id, change);
                    } catch (e) {
                        logger.error(method, 'Exception occurred while firing trigger', triggerData.id, e);
                    }
                }
            });

            feed.follow();

            return new Promise(function(resolve, reject) {
                feed.on('error', function (err) {
                    logger.error(method,'Error occurred for trigger', triggerData.id, '(db ' + triggerData.dbname + '):', err);
                    reject(err);
                });

                feed.on('confirm', function () {
                    logger.info(method, 'Added couchdb data trigger', triggerData.id, 'listening for changes in database', triggerData.dbname);
                    if (isMonitoringTrigger(triggerData.monitor, triggerData.id)) {
                        self.monitorStatus.triggerStarted = "success";
                    }
                    resolve(triggerData.id);
                });
            });

        } catch (err) {
            logger.info(method, 'caught an exception for trigger', triggerData.id, err);
            return Promise.reject(err);
        }

    };

    function initTrigger(newTrigger) {
        var maxTriggers = newTrigger.maxTriggers || constants.DEFAULT_MAX_TRIGGERS;

        var trigger = {
            id: newTrigger.id,
            host: newTrigger.host,
            port: newTrigger.port,
            protocol: newTrigger.protocol || 'https',
            dbname: newTrigger.dbname,
            user: newTrigger.user,
            pass: newTrigger.pass,
            apikey: newTrigger.apikey,
            since: newTrigger.since || 'now',
            maxTriggers: maxTriggers,
            triggersLeft: maxTriggers,
            filter: newTrigger.filter,
            query_params: newTrigger.query_params,
            additionalData: newTrigger.additionalData,
            iamApiKey: newTrigger.iamApiKey,
            iamUrl: newTrigger.iamUrl
        };

        return trigger;
    }

    function shouldDisableTrigger(statusCode) {
        return ((statusCode >= 400 && statusCode < 500) &&
            [HttpStatus.REQUEST_TIMEOUT, HttpStatus.TOO_MANY_REQUESTS, HttpStatus.CONFLICT].indexOf(statusCode) === -1);
    }

    function shouldFireTrigger(trigger) {
        return trigger.monitor || self.activeHost === self.host;
    }

    function hasTriggersRemaining(trigger) {
        return !trigger.maxTriggers || trigger.maxTriggers === -1 || trigger.triggersLeft > 0;
    }

    function isMonitoringTrigger(monitor, triggerIdentifier) {
        return monitor && self.monitorStatus.triggerName === parseQName(triggerIdentifier).name;
    }

    function disableTrigger(id, statusCode, message) {
        var method = 'disableTrigger';

        triggerDB.get(id, function (err, existing) {
            if (!err) {
                if (!existing.status || existing.status.active === true) {
                    var updatedTrigger = existing;
                    var status = {
                        'active': false,
                        'dateChanged': Date.now(),
                        'reason': {'kind': 'AUTO', 'statusCode': statusCode, 'message': message}
                    };
                    updatedTrigger.status = status;

                    triggerDB.insert(updatedTrigger, id, function (err) {
                        if (err) {
                            logger.error(method, 'there was an error while disabling', id, 'in database. ' + err);
                        }
                        else {
                            logger.info(method, 'trigger', id, 'successfully disabled in database');
                        }
                    });
                }
            }
            else {
                logger.info(method, 'could not find', id, 'in database');
                //make sure it is removed from memory as well
                deleteTrigger(id);
            }
        });
    }

    // Delete a trigger: stop listening for changes and remove it.
    function deleteTrigger(triggerIdentifier, monitorTrigger) {
        var method = 'deleteTrigger';

        if (self.triggers[triggerIdentifier]) {
            if (self.triggers[triggerIdentifier].feed) {
                self.triggers[triggerIdentifier].feed.stop();
            }

            delete self.triggers[triggerIdentifier];
            logger.info(method, 'trigger', triggerIdentifier, 'successfully deleted from memory');

            if (isMonitoringTrigger(monitorTrigger, triggerIdentifier)) {
                self.monitorStatus.triggerStopped = "success";
            }
        }
    }

    function fireTrigger(triggerIdentifier, change) {
        var method = 'fireTrigger';

        var triggerData = self.triggers[triggerIdentifier];
        var triggerObj = parseQName(triggerData.id);

        var form = change;
        form.dbname = triggerData.dbname;

        logger.info(method, 'firing trigger', triggerData.id, 'with db update');

        var host = 'https://' + self.routerHost;
        var uri = host + '/api/v1/namespaces/' + triggerObj.namespace + '/triggers/' + triggerObj.name;

        postTrigger(triggerData, form, uri, 0)
        .then(triggerId => {
            logger.info(method, 'Trigger', triggerId, 'was successfully fired');
            if (isMonitoringTrigger(triggerData.monitor, triggerId)) {
                self.monitorStatus.triggerFired = "success";
            }
            if (triggerData.triggersLeft === 0) {
                if (triggerData.monitor) {
                    deleteTrigger(triggerId, triggerData.monitor);
                }
                else {
                    disableTrigger(triggerId, undefined, 'Automatically disabled after reaching max triggers');
                    logger.warn(method, 'no more triggers left, disabled', triggerId);
                }
            }
        })
        .catch(err => {
            logger.error(method, err);
        });
    }

    function postTrigger(triggerData, form, uri, retryCount) {
        var method = 'postTrigger';

        return new Promise(function(resolve, reject) {

            // only manage trigger fires if they are not infinite
            if (triggerData.maxTriggers !== -1) {
                triggerData.triggersLeft--;
            }

            self.authRequest(triggerData, {
                method: 'post',
                uri: uri,
                json: form
            }, function(error, response) {
                try {
                    var statusCode = !error ? response.statusCode : error.statusCode;
                    logger.info(method, triggerData.id, 'http post request, STATUS:', statusCode);
                    if (error || statusCode >= 400) {
                        // only manage trigger fires if they are not infinite
                        if (triggerData.maxTriggers !== -1) {
                            triggerData.triggersLeft++;
                        }
                        logger.error(method, 'there was an error invoking', triggerData.id, statusCode || error);
                        if (statusCode && shouldDisableTrigger(statusCode)) {
                            var message;
                            try {
                                message = error.error.errorMessage;
                            } catch (e) {
                                message = `Received a ${statusCode} status code when firing the trigger`;
                            }
                            disableTrigger(triggerData.id, statusCode, `Trigger automatically disabled: ${message}`);
                            reject(`Disabled trigger ${triggerData.id}: ${message}`);
                        }
                        else {
                            if (retryCount < retryAttempts ) {
                                var timeout = statusCode === 429 && retryCount === 0 ? 60000 : 1000 * Math.pow(retryCount + 1, 2);
                                logger.info(method, 'attempting to fire trigger again', triggerData.id, 'Retry Count:', (retryCount + 1));
                                setTimeout(function () {
                                    postTrigger(triggerData, form, uri, (retryCount + 1))
                                    .then(triggerId => {
                                        resolve(triggerId);
                                    })
                                    .catch(err => {
                                        reject(err);
                                    });
                                }, timeout);
                            } else {
                                reject('Unable to reach server to fire trigger ' + triggerData.id);
                            }
                        }
                    } else {
                        logger.info(method, 'fired', triggerData.id, triggerData.triggersLeft, 'triggers left');
                        resolve(triggerData.id);
                    }
                }
                catch(err) {
                    reject('Exception occurred while firing trigger ' + err);
                }
            });
        });
    }

    this.initAllTriggers = function() {
        var method = 'initAllTriggers';

        //follow the trigger DB
        setupFollow('now');

        logger.info(method, 'resetting system from last state');
        triggerDB.view(viewDDName, triggersByWorker, {reduce: false, include_docs: true, key: self.worker}, function(err, body) {
            if (!err) {
                body.rows.forEach(function (trigger) {
                    var triggerIdentifier = trigger.id;
                    var doc = trigger.doc;

                    if (!(triggerIdentifier in self.triggers)) {
                        //check if trigger still exists in whisk db
                        var triggerObj = parseQName(triggerIdentifier);
                        var host = 'https://' + self.routerHost;
                        var triggerURL = host + '/api/v1/namespaces/' + triggerObj.namespace + '/triggers/' + triggerObj.name;

                        logger.info(method, 'Checking if trigger', triggerIdentifier, 'still exists');
                        self.authRequest(doc, {
                            method: 'get',
                            url: triggerURL
                        }, function (error, response) {
                            //disable trigger in database if trigger is dead
                            if (!error && shouldDisableTrigger(response.statusCode)) {
                                var message = 'Automatically disabled after receiving a ' + response.statusCode + ' status code on init trigger';
                                disableTrigger(triggerIdentifier, response.statusCode, message);
                                logger.error(method, 'trigger', triggerIdentifier, 'has been disabled due to status code:', response.statusCode);
                            }
                            else {
                                self.createTrigger(initTrigger(doc))
                                .then(triggerIdentifier => {
                                    logger.info(method, triggerIdentifier, 'created successfully');
                                })
                                .catch(err => {
                                    var message = 'Automatically disabled after receiving exception on init trigger: ' + err;
                                    disableTrigger(triggerIdentifier, undefined, message);
                                    logger.error(method, 'Disabled trigger', triggerIdentifier, 'due to exception:', err);
                                });
                            }
                        });
                    }
                });
            } else {
                logger.error(method, 'could not get latest state from database', err);
            }
        });
    };

    function setupFollow(seq) {
        var method = 'setupFollow';

        try {
            var feed = triggerDB.follow({
                since: seq,
                include_docs: true,
                filter: filterDDName + '/' + triggersByWorker,
                query_params: {worker: self.worker}
            });

            feed.on('change', (change) => {
                var triggerIdentifier = change.id;
                var doc = change.doc;

                if (self.triggers[triggerIdentifier]) {
                    if (doc.status && doc.status.active === false) {
                        deleteTrigger(triggerIdentifier);
                    }
                }
                else {
                    //ignore changes to disabled triggers
                    if (!doc.status || doc.status.active === true) {
                        self.createTrigger(initTrigger(doc))
                        .then(triggerIdentifier => {
                            logger.info(method, triggerIdentifier, 'created successfully');
                        })
                        .catch(err => {
                            var message = 'Automatically disabled after receiving exception on create trigger: ' + err;
                            disableTrigger(triggerIdentifier, undefined, message);
                            logger.error(method, 'Disabled trigger', triggerIdentifier, 'due to exception:', err);
                        });
                    }
                }
            });

            feed.on('error', function (err) {
                logger.error(method, err);
            });

            feed.follow();
        }
        catch (err) {
            logger.error(method, err);
        }
    }

    this.authorize = function(req, res, next) {
        var method = 'authorize';

        if (self.endpointAuth) {
            if (!req.headers.authorization) {
                res.set('www-authenticate', 'Basic realm="Private"');
                res.status(HttpStatus.UNAUTHORIZED);
                return res.send('');
            }

            var parts = req.headers.authorization.split(' ');
            if (parts[0].toLowerCase() !== 'basic' || !parts[1]) {
                return sendError(method, HttpStatus.BAD_REQUEST, 'Malformed request, basic authentication expected', res);
            }

            var auth = new Buffer(parts[1], 'base64').toString();
            auth = auth.match(/^([^:]*):(.*)$/);
            if (!auth) {
                return sendError(method, HttpStatus.BAD_REQUEST, 'Malformed request, authentication invalid', res);
            }

            var uuid = auth[1];
            var key = auth[2];
            var endpointAuth = self.endpointAuth.split(':');
            if (endpointAuth[0] === uuid && endpointAuth[1] === key) {
                next();
            }
            else {
                logger.warn(method, 'Invalid key');
                return sendError(method, HttpStatus.UNAUTHORIZED, 'Invalid key', res);
            }
        }
        else {
            next();
        }
    };

    function sendError(method, code, message, res) {
        logger.error(method, message);
        res.status(code).json({error: message});
    }

    function parseQName(qname, separator) {
        var parsed = {};
        var delimiter = separator || ':';
        var defaultNamespace = '_';
        if (qname && qname.charAt(0) === delimiter) {
            var parts = qname.split(delimiter);
            parsed.namespace = parts[1];
            parsed.name = parts.length > 2 ? parts.slice(2).join(delimiter) : '';
        } else {
            parsed.namespace = defaultNamespace;
            parsed.name = qname;
        }
        return parsed;
    }

    this.initRedis = function() {
        var method = 'initRedis';

        return new Promise(function(resolve, reject) {

            if (redisClient) {
                var subscriber = redisClient.duplicate();

                //create a subscriber client that listens for requests to perform swap
                subscriber.on('message', function (channel, message) {
                    logger.info(method, message, 'set to active host in channel', channel);
                    self.activeHost = message;
                });

                subscriber.on('error', function (err) {
                    logger.error(method, 'Error connecting to redis', err);
                    reject(err);
                });

                subscriber.subscribe(self.redisKey);

                redisClient.hgetAsync(self.redisKey, self.redisField)
                .then(activeHost => {
                    return initActiveHost(activeHost);
                })
                .then(() => {
                    process.on('SIGTERM', function onSigterm() {
                        if (self.activeHost === self.host) {
                            var redundantHost = self.host === `${self.hostPrefix}0` ? `${self.hostPrefix}1` : `${self.hostPrefix}0`;
                            self.redisClient.hsetAsync(self.redisKey, self.redisField, redundantHost)
                            .then(() => {
                                self.redisClient.publish(self.redisKey, redundantHost);
                            })
                            .catch(err => {
                                logger.error(method, err);
                            });
                        }
                    });
                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
            }
            else {
                resolve();
            }
        });
    };

    function initActiveHost(activeHost) {
        var method = 'initActiveHost';

        if (activeHost === null) {
            //initialize redis key with active host
            logger.info(method, 'redis hset', self.redisKey, self.redisField, self.activeHost);
            return redisClient.hsetAsync(self.redisKey, self.redisField, self.activeHost);
        }
        else {
            self.activeHost = activeHost;
            return Promise.resolve();
        }
    }

    this.authRequest = function(triggerData, options, cb) {
        var method = 'authRequest';

        authHandler.handleAuth(triggerData, options)
        .then(requestOptions => {
            request(requestOptions, cb);
        })
        .catch(err => {
            logger.error(method, err);
            cb(err);
        });
    };

};
