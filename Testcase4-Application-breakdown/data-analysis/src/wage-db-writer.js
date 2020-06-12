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
