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

const request = require('request');
const openwhisk = require('openwhisk');
const config = require('./config');

function requestHelper(url, input, method) {

    return new Promise(function(resolve, reject) {

        var options = {
            method : method,
            url : url,
            json: true,
            rejectUnauthorized: false
        };

        if (method === 'get') {
            options.qs = input;
        } else {
            options.body = input;
        }

        request(options, function(error, response, body) {

            if (!error && response.statusCode === 200) {
                resolve(body);
            }
            else {
                if (response) {
                    reject(body);
                }
                else {
                    reject(error);
                }
            }
        });
    });
}

function createWebParams(rawParams) {
    var namespace = process.env.__OW_NAMESPACE;
    var triggerName = ':' + namespace + ':' + parseQName(rawParams.triggerName, '/').name;

    var webparams = Object.assign({}, rawParams);
    delete webparams.lifecycleEvent;
    delete webparams.bluemixServiceName;
    delete webparams.apihost;

    webparams.triggerName = triggerName;
    config.addAdditionalData(webparams);

    return webparams;
}

function verifyTriggerAuth(triggerData, isDelete) {
    var owConfig = config.getOpenWhiskConfig(triggerData);
    var ow = openwhisk(owConfig);

    return new Promise(function(resolve, reject) {
        ow.triggers.get(triggerData.name)
        .then(() => {
            resolve();
        })
        .catch(err => {
           if (err.statusCode) {
               var statusCode = err.statusCode;
               if (!(isDelete && statusCode === 404)) {
                   reject(sendError(statusCode, 'Trigger authentication request failed.'));
               }
               else {
                   resolve();
               }
           }
           else {
               reject(sendError(400, 'Trigger authentication request failed.', err.message));
           }
        });
    });
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

function sendError(statusCode, error, message) {
    var params = {error: error};
    if (message) {
        params.message = message;
    }

    return {
        statusCode: statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: params
    };
}

function constructObject(data) {
    var jsonObject;
    if (data) {
        if (typeof data === 'string') {
            try {
                jsonObject = JSON.parse(data);
            }
            catch (e) {
                console.error('error parsing ' + data);
            }
        }
        if (typeof data === 'object') {
            jsonObject = data;
        }
    }
    return jsonObject;
}


module.exports = {
    'requestHelper': requestHelper,
    'createWebParams': createWebParams,
    'verifyTriggerAuth': verifyTriggerAuth,
    'parseQName': parseQName,
    'sendError': sendError,
    'constructObject': constructObject
};
