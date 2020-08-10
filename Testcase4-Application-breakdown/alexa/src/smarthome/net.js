/*
 * Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
 * ServerlessBench is licensed under the Mulan PSL v1.
 * You can use this software according to the terms and conditions of the Mulan PSL v1.
 * You may obtain a copy of Mulan PSL v1 at:
 *     http://license.coscl.org.cn/MulanPSL
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
 * PURPOSE.
 * See the Mulan PSL v1 for more details.
 */

const request = require('request')

function SendRequest(url, body) {
    console.log('sending request to url: ' + url);
    return new Promise(function(resolve, reject) {
        request({
            'url': url,
            'method': 'POST',
            'json': true,
            'body': body
        }, function (error, response, body) {
            if(error) {
                reject(error);
            }
            console.log('device resp: ' + JSON.stringify(body));
            resolve(body);
        });

    });
}

exports.SendRequest = SendRequest
