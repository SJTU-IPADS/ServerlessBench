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

module.exports = function(logger, utils) {

    // Active Endpoint
    this.endPoint = '/active';

    var hostMachine = process.env.HOST_MACHINE;

    this.active = function(req, res) {
        var method = 'active';

        var response = {
            worker: utils.worker,
            host: utils.host,
            hostMachine: hostMachine,
            active: utils.host === utils.activeHost
        };

        if (req.query && req.query.active) {
            var query = req.query.active.toLowerCase();

            if (query !== 'true' && query !== 'false') {
                response.error = "Invalid query string";
                res.send(response);
                return;
            }

            var redundantHost = utils.host === `${utils.hostPrefix}0` ? `${utils.hostPrefix}1` : `${utils.hostPrefix}0`;
            var activeHost = query === 'true' ? utils.host : redundantHost;
            if (utils.activeHost !== activeHost) {
                if (utils.redisClient) {
                    utils.redisClient.hsetAsync(utils.redisKey, utils.redisField, activeHost)
                    .then(() => {
                        response.active = 'swapping';
                        utils.redisClient.publish(utils.redisKey, activeHost);
                        logger.info(method, 'Active host swap in progress');
                        res.send(response);
                    })
                    .catch(err => {
                        response.error = err;
                        res.send(response);
                    });
                }
                else {
                    response.active = utils.host === activeHost;
                    utils.activeHost = activeHost;
                    var message = 'The active state has changed';
                    logger.info(method, message, 'to', activeHost);
                    response.message = message;
                    res.send(response);
                }
            }
            else {
                res.send(response);
            }
        }
        else {
            res.send(response);
        }
    };

};
