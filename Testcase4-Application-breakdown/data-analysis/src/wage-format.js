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
