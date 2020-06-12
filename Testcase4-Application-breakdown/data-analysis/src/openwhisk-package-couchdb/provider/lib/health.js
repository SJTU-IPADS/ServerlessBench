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

var si = require('systeminformation');
var v8 = require('v8');
var _ = require('lodash');
var URL = require('url').URL;
var constants = require('./constants.js');

module.exports = function(logger, utils) {

    // Health Endpoint
    this.endPoint = '/health';

    var triggerName;
    var canaryDocID;
    var monitorStatus;
    var monitorStages = ['triggerStarted', 'triggerFired', 'triggerStopped'];

    // Health Logic
    this.health = function (req, res) {

        var stats = {triggerCount: Object.keys(utils.triggers).length};

        // get all system stats in parallel
        Promise.all([
            si.mem(),
            si.currentLoad(),
            si.fsSize(),
            si.networkStats(),
            si.inetLatency(utils.routerHost)
        ])
        .then(results => {
            stats.triggerMonitor = monitorStatus;
            stats.memory = results[0];
            stats.cpu = _.omit(results[1], 'cpus');
            stats.disk = results[2];
            stats.network = results[3];
            stats.apiHostLatency = results[4];
            stats.heapStatistics = v8.getHeapStatistics();
            res.send(stats);
        })
        .catch(error => {
            stats.error = error;
            res.send(stats);
        });
    };

    this.monitor = function(apikey, monitoringInterval) {
        var method = 'monitor';

        if (triggerName) {
            monitorStatus = Object.assign({}, utils.monitorStatus);
            utils.monitorStatus = {};

            var monitorStatusSize = Object.keys(monitorStatus).length;
            if (monitorStatusSize < 5) {
                //we have a failure in one of the stages
                var stageFailed = monitorStages[monitorStatusSize - 2];
                monitorStatus[stageFailed] = 'failed';
            }
            var existingTriggerID = `:_:${triggerName}`;
            var existingCanaryID = canaryDocID;

            //delete the trigger
            var triggerData = {
                apikey: apikey,
                uri: utils.uriHost + '/api/v1/namespaces/_/triggers/' + triggerName,
                triggerID: existingTriggerID
            };
            deleteTrigger(triggerData, 0);

            //delete the canary doc
            deleteDocFromDB(existingCanaryID, 0);
        }

        //create new couchdb trigger and canary doc
        var docSuffix = utils.worker + utils.host + '_' + Date.now();
        triggerName = 'couchdb_' + docSuffix;
        canaryDocID = 'canary_' + docSuffix;

        //update status monitor object
        utils.monitorStatus.triggerName = triggerName;
        utils.monitorStatus.triggerType = 'changes';

        var triggerURL = utils.uriHost + '/api/v1/namespaces/_/triggers/' + triggerName;
        var triggerID = `:_:${triggerName}`;
        createTrigger(triggerURL, apikey)
        .then(info => {
            logger.info(method, triggerID, info);
            var newTrigger = createCouchdbTrigger(triggerID, apikey);
            utils.createTrigger(newTrigger);
            setTimeout(function () {
                var canaryDoc = {
                    isCanaryDoc: true,
                    host: utils.host
                };
                createDocInDB(canaryDocID, canaryDoc);
            }, monitoringInterval / 3);
        })
        .catch(err => {
            logger.error(method, triggerID, err);
        });
    };

    function createCouchdbTrigger(triggerID, apikey) {
        var method = 'createCouchdbTrigger';

        var dbURL = new URL(utils.db.config.url);
        var dbName = utils.db.config.db;

        var newTrigger = {
            apikey: apikey,
            id: triggerID,
            host: dbURL.hostname,
            port: dbURL.port,
            protocol: dbURL.protocol.replace(':', ''),
            dbname: dbName,
            user: dbURL.username,
            pass: dbURL.password,
            filter: constants.MONITOR_DESIGN_DOC + '/' + constants.DOCS_FOR_MONITOR,
            query_params: {host: utils.host},
            maxTriggers: 1,
            triggersLeft: 1,
            since: 'now',
            worker: utils.worker,
            monitor: utils.host
        };

        return newTrigger;
    }

    function createTrigger(triggerURL, apikey) {
        var method = 'createTrigger';

        return new Promise(function(resolve, reject) {
            utils.authRequest({apikey: apikey}, {
                method: 'put',
                uri: triggerURL,
                json: true,
                body: {}
            }, function (error, response) {
                if (error || response.statusCode >= 400) {
                    reject('monitoring trigger create request failed');
                }
                else {
                    resolve('monitoring trigger create request was successful');
                }
            });
        });
    }

    function createDocInDB(docID, doc) {
        var method = 'createDocInDB';

        utils.db.insert(doc, docID, function (err) {
            if (!err) {
                logger.info(method, docID, 'was successfully inserted');
            }
            else {
                logger.error(method, docID, err);
            }
        });
    }

    function deleteTrigger(triggerData, retryCount) {
        var method = 'deleteTrigger';

        var triggerID = triggerData.triggerID;
        utils.authRequest(triggerData, {
            method: 'delete',
            uri: triggerData.uri
        }, function (error, response) {
            logger.info(method, triggerID, 'http delete request, STATUS:', response ? response.statusCode : undefined);
            if (error || response.statusCode >= 400) {
                if (!error && response.statusCode === 409 && retryCount < 5) {
                    logger.info(method, 'attempting to delete trigger again', triggerID, 'Retry Count:', (retryCount + 1));
                    setTimeout(function () {
                        deleteTrigger(triggerData, (retryCount + 1));
                    }, 1000);
                } else {
                    logger.error(method, triggerID, 'trigger delete request failed');
                }
            }
            else {
                logger.info(method, triggerID, 'trigger delete request was successful');
            }
        });
    }

    function deleteDocFromDB(docID, retryCount) {
        var method = 'deleteDocFromDB';

        //delete from database
        utils.db.get(docID, function (err, existing) {
            if (!err) {
                utils.db.destroy(existing._id, existing._rev, function (err) {
                    if (err) {
                        if (err.statusCode === 409 && retryCount < 5) {
                            setTimeout(function () {
                                deleteDocFromDB(docID, (retryCount + 1));
                            }, 1000);
                        }
                        else {
                            logger.error(method, docID, 'could not be deleted from the database');
                        }
                    }
                    else {
                        logger.info(method, docID, 'was successfully deleted from the database');
                    }
                });
            }
            else {
                logger.error(method, docID, 'could not be found in the database');
            }
        });
    }

};
