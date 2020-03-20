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

/**
 * Query using a Cloudant Query index:
 * https://docs.couchdb.com/cloudant_query.html#finding-documents-using-an-index
 **/

function main(message) {
  var couchdbOrError = getCouchdb(message);
  if (typeof couchdbOrError !== 'object') {
    return Promise.reject(couchdbOrError);
  }
  var couchdb = couchdbOrError;
  var dbName = message.dbname;
  var query = message.query;

  if(!dbName) {
    return Promise.reject('dbname is required.');
  }
  if(!query) {
    return Promise.reject('query field is required.');
  }
  var couchdb = couchdb.use(dbName);

  if (typeof message.query === 'object') {
    query = message.query;
  } else if (typeof message.query === 'string') {
    try {
      query = JSON.parse(message.query);
    } catch (e) {
      return Promise.reject('query field cannot be parsed. Ensure it is valid JSON.');
    }
  } else {
    return Promise.reject('query field is ' + (typeof query) + ' and should be an object or a JSON string.');
  }

  return queryIndex(couchdb, query);

}

function queryIndex(couchdb, query) {
  return new Promise(function(resolve, reject) {
    couchdb.find(query, function(error, response) {
      if (!error) {
        resolve(response);
      } else {
        reject(error);
      }
    });
  });
}

function getCouchdb(message) {
    var couchdbUrl = message.url;

    return require('nano')({
        url: couchdbUrl
    });
}
