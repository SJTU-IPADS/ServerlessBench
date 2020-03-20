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

const common = require('./lib/common');

function main(msg) {

    let eventMap = {
        CREATE: 'post',
        READ: 'get',
        UPDATE: 'put',
        DELETE: 'delete'
    };
    // for creation -> CREATE
    // for reading -> READ
    // for updating -> UPDATE
    // for deletion -> DELETE
    var lifecycleEvent = msg.lifecycleEvent;

    var endpoint = msg.host;
    var webparams = common.createWebParams(msg);

    var url = `https://${endpoint}/api/v1/web/guest/couchdbWeb/changesWebAction.http`;

    if (lifecycleEvent in eventMap) {
        var method = eventMap[lifecycleEvent];
        return common.requestHelper(url, webparams, method);
    } else {
        return Promise.reject('unsupported lifecycleEvent');
    }
}


exports.main = main;
