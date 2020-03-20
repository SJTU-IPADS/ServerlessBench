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
 * List design documents in Cloudant database:
 * https://docs.couchdb.com/design_documents.html
 **/

function main(message) {
  var couchdbOrError = getCouchdb(message);
  if (typeof couchdbOrError !== 'object') {
    return Promise.reject(couchdbOrError);
  }
  var couchdb = couchdbOrError;
  var dbName = message.dbname;
  var includeDocs = message.includedocs;
  var params = {};

  if(!dbName) {
    return Promise.reject('dbname is required.');
  }
  var couchdb = couchdb.use(dbName);
  //Add start and end key to get _design docs
  params.startkey = '_design'.toString();
  params.endkey = '_design0'.toString();

  //If includeDoc exists and is true, add field to additional params object
  includeDocs = includeDocs.toString().trim().toLowerCase();
  if(includeDocs === 'true') {
    params.include_docs = 'true';
  }

  return listDesignDocuments(couchdb, params);
}

/**
 * List design documents.
 **/
function listDesignDocuments(couchdb, params) {
  return new Promise(function(resolve, reject) {
    couchdb.list(params, function(error, response) {
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
