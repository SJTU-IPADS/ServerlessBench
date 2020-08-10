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

/**
 * @param   params.COUCHDB_URL                    Couchdb url
 * @param   params.COUCHDB_DATABASE               Couchdb database to store the file to
 *
 * @return  Promise
 */
function main(params) {
  console.log('[wage-db-writer] entry');
  // Configure database connection
  var couchdb = require('nano')(params.COUCHDB_URL) 
  var database = couchdb.db.use(params.COUCHDB_DATABASE);

  return new Promise(function(resolve, reject) {
    delete params.COUCHDB_URL;
    delete params.COUCHDB_DATABASE;
    database.insert({
                '_id': 'id'+params.id,
                'wage-person': params
            }).then((response) => {
                console.log('couchdb insert success with', JSON.stringify(response));
                resolve(response);
            }).catch( err => {
                console.log('fail to insert', err);
                reject(err);
            });
    });         
}

exports.main = main
