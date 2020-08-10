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

function callDbWriter(requestJSON) {
    var openwhisk = require('openwhisk');
    var ow = openwhisk({ignore_certs: true});

    return new Promise( (resolve, reject) => {
        ow.actions.invoke({actionName: 'wage-db-writer', result: true, blocking: true, params: requestJSON})
                .then( result => {
                    console.log('invoke wage-db-writer result:', JSON.stringify(result));
                    resolve(result);
                }).catch( err => {
                    console.error('failed to invoke action:', err);
                    reject(err);
                });

    });
}

function main (params) {
    console.log('[wage-format] entry');
    const INSURANCE = require('./constances').INSURANCE;
    const TAX = require('./constances').TAX;
    params['INSURANCE'] = INSURANCE;

    var total = INSURANCE + params.base + params.merit;
    params['total'] = total;

    var realpay = (1-TAX) * (params.base + params.merit);
    params['realpay'] = realpay;
    console.log('formatted entry:', JSON.stringify(params));

    return callDbWriter(params);
}

exports.main = main
