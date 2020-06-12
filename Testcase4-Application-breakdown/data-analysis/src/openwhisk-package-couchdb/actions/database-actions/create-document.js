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
 * Create a document in Cloudant database:
 * https://docs.couchdb.com/document.html#documentCreate
 **/

function main(message) {
  var couchdbOrError = getCouchdb(message);
  if (typeof couchdbOrError !== 'object') {
    return Promise.reject(couchdbOrError);
  }
  var couchdb = couchdbOrError;
  var dbName = message.dbname;
  var doc = message.doc;
  var params = {};

  if (!dbName) {
    return Promise.reject('dbname is required.');
  }
  if (!doc) {
    return Promise.reject('doc is required.');
  }

  if (typeof message.doc === 'object') {
    doc = message.doc;
  } else if (typeof message.doc === 'string') {
    try {
      doc = JSON.parse(message.doc);
    } catch (e) {
      return Promise.reject('doc field cannot be parsed. Ensure it is valid JSON.');
    }
  } else {
    return Promise.reject('doc field is ' + (typeof doc) + ' and should be an object or a JSON string.');
  }
  var couchdb = couchdb.use(dbName);

  if (typeof message.params === 'object') {
    params = message.params;
  } else if (typeof message.params === 'string') {
    try {
      params = JSON.parse(message.params);
    } catch (e) {
      return Promise.reject('params field cannot be parsed. Ensure it is valid JSON.');
    }
  }

  return insert(couchdb, doc, params);
}

/**
 * Create document in database.
 */
function insert(couchdb, doc, params) {
  return new Promise(function(resolve, reject) {
    couchdb.insert(doc, params, function(error, response) {
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
