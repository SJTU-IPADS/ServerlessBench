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
 * Delete a view from design document in Cloudant database:
 * https://docs.couchdb.com/design_documents.html
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
  var viewName = message.viewname;
  var params = {};

  if(!dbName) {
    return Promise.reject('dbname is required.');
  }
  if(!docId) {
    return Promise.reject('docid is required.');
  }
  var couchdb = couchdb.use(dbName);

  if(!viewName) {
    return Promise.reject('viewname is required.');
  }
  if (typeof message.params === 'object') {
    params = message.params;
  } else if (typeof message.params === 'string') {
    try {
      params = JSON.parse(message.params);
    } catch (e) {
      return Promise.reject('params field cannot be parsed. Ensure it is valid JSON.');
    }
  }

  return deleteViewFromDesignDoc(couchdb, docId, viewName, params);
}

function deleteViewFromDesignDoc(couchdb, docId, viewName, params) {
  //Check that doc id contains _design prefix
  if (docId.indexOf(DESIGN_PREFIX) !== 0) {
    docId = DESIGN_PREFIX + docId;
  }

  return getDocument(couchdb, docId)
    .then(function(document) {
        delete document.views[viewName];

        //Update the design document after removing the view
        return insert(couchdb, document, params);
    });
}

function getDocument(couchdb, docId) {
  return new Promise(function(resolve, reject) {
    couchdb.get(docId, function(error, response) {
      if (!error) {
        resolve(response);
      } else {
        reject(error);
      }
    });
  });
}

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
