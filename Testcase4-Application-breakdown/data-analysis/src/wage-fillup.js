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

async function main(params) {
  console.log('[wage-fillup] entry');

  var total = {
                   'statistics': 
                   {
                       'total': 0,
                       'staff-number': 0,
                       'teamleader-number': 0,
                       'manager-number': 0
                   }
               };

  var base = {
                   'statistics': 
                   {
                       'staff': 0,
                       'teamleader': 0,
                       'manager': 0
                   }
               };

  var merit = {
                   'statistics': 
                   {
                       'staff': 0,
                       'teamleader': 0,
                       'manager': 0
                   }
               };

  var couchdb = require('nano')(params.COUCHDB_URL);
  var database = couchdb.db.use(params.COUCHDB_DATABASE);

  return new Promise( (resolve, reject) => {
      database.list().then( async (body) => {
          var rec = [];
          body.rows.forEach( (doc) => {
              var p = new Promise ( (resolve, reject) => {
                  database.get(doc.id, function(error, doc) {
                      if(!error) {
                          resolve(doc);
                      } else {
                          console.log('error getting doc: ', error);
                          reject(error);
                      }
                  });
              });
              rec.push(p);
          });
          records = await Promise.all(rec);

          records.forEach( doc => {
            console.log('record: ' + JSON.stringify(doc));
            total['statistics']['total'] += doc['wage-person']['total'];
            total['statistics'][doc['wage-person']['role']+'-number']++;
            base['statistics'][doc['wage-person']['role']] += doc['wage-person']['base'];
            merit['statistics'][doc['wage-person']['role']] += doc['wage-person']['merit'];
          });

          resolve( {'total': total, 'base': base, 'merit': merit, 'operator': params['wage-person']['operator']});
      });
  });
  
}


exports.main = main
