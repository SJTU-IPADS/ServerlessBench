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

function main(message) {

    var couchdbOrError = getCouchdb(message);

    if (typeof couchdbOrError !== 'object') {
        return Promise.reject(couchdbOrError);
    }

    var couchdb = couchdbOrError;
    var dbName = message.dbname;
    var doc = message.doc;
    var overwrite;

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


    if (typeof message.overwrite === 'boolean') {
        overwrite = message.overwrite;
    } else if (typeof message.overwrite === 'string') {
        overwrite = message.overwrite.trim().toLowerCase() === 'true';
    } else {
        overwrite = false;
    }

    var couchdb = couchdb.use(dbName);
    return insertOrUpdate(couchdb, overwrite, doc);
}

/**
 * If id defined and overwrite is true, checks if doc exists to retrieve version
 * before insert. Else inserts a new doc.
 */
function insertOrUpdate(couchdb, overwrite, doc) {
    if (doc._id) {
        if (overwrite) {
            return new Promise(function(resolve, reject) {
                couchdb.get(doc._id, function(error, body) {
                    if (!error) {
                        doc._rev = body._rev;
                        insert(couchdb, doc)
                            .then(function (response) {
                                resolve(response);
                            })
                            .catch(function (err) {
                               reject(err);
                            });
                    } else {
                        if(error.statusCode === 404) {
                            // If document not found, insert it
                            insert(couchdb, doc)
                                .then(function (response) {
                                    resolve(response);
                                })
                                .catch(function (err) {
                                    reject(err);
                                });
                        } else {
                            reject(error);
                        }
                    }
                });
            });
        } else {
            // May fail due to conflict.
            return insert(couchdb, doc);
        }
    } else {
        // There is no option of overwrite because id is not defined.
        return insert(couchdb, doc);
    }
}

/**
 * Inserts updated document into database.
 */
function insert(couchdb, doc) {
    return new Promise(function(resolve, reject) {
        couchdb.insert(doc, function(error, response) {
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
