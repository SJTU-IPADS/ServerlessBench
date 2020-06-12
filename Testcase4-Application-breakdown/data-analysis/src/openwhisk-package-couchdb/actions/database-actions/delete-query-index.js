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
 * Delete a Cloudant index:
 * https://docs.couchdb.com/cloudant_query.html#deleting-an-index
 **/

var DESIGN_PREFIX = '_design/';

function main(message) {
  var couchdbOrError = getCouchdb(message);
  if (typeof couchdbOrError !== 'object') {
    return Promise.reject(couchdbOrError);
  }
  var couchdb = couchdbOrError;
  var dbName = message.dbname;
  var docId = message.docid;
  var indexName = message.indexname;
  var indexType = message.indextype;

  if (!dbName) {
    return Promise.reject('dbname is required.');
  }
  if (!docId) {
    return Promise.reject('docid is required.');
  }
  if (!indexName) {
    return Promise.reject('indexname is required.');
  }
  if (!indexType) {
    return Promise.reject('indextype is required.');
  }

  return deleteIndexFromDesignDoc(couchdb, docId, indexName, indexType, dbName);
}

function deleteIndexFromDesignDoc(couchdb, docId, indexName, indexType, dbName) {

  return new Promise(function(resolve, reject) {
    var path = "_index/" + encodeURIComponent(docId) + '/' + encodeURIComponent(indexType) +
        '/' + encodeURIComponent(indexName);

    couchdb.request({ db: encodeURIComponent(dbName),
        method : 'delete',
        path : path
      }, function(error, response) {
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
