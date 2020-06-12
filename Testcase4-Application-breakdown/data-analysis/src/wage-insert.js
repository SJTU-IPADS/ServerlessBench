const Validator = require('node-input-validator').Validator;
const ROLES = require('./constances').ROLES;

function callFormatter(requestJSON) {
    var openwhisk = require('openwhisk');
    var ow = openwhisk({ignore_certs: true});

    return new Promise( (resolve, reject) => {
        ow.actions.invoke({actionName: 'wage-format', result: true, blocking: true, params: requestJSON})
                .then( result => {
                    console.log('invoke wage-format result:', JSON.stringify(result));
                    resolve(result);
                }).catch( err => {
                    console.error('failed to invoke action:', err);
                    reject(err);
                });

    });
}

async function check (params) {
    // check format
    const v = new Validator(params, {
        id: 'required|numeric',
        name: 'required|string',
        role: 'required|string',
        base: 'required|decimal|digitsBetween:1,8',
        merit: 'required|decimal|digitsBetween:1,8',
        operator: 'required|numeric'
    });

    const matched = await v.check();

    if(!matched) {
        return {'result': 'fail: illegal params:'+JSON.stringify(params)};
    }
    
    // check role
    if (!ROLES.includes(params.role)) {
        return {'result': 'fail: invalid role:'+params.role};
    }
    
    return true;
}

function main (params) {
    console.log('[wage-insert] entry');

    check(params).then( passOrErr => {
        if (typeof passOrErr !== 'boolean') {
            console.log('check result:', passOrErr, ',type:', typeof passOrErr);
            return passOrErr;
        }

        console.log('Checks passed, calling formatter');

        return callFormatter(params);
    }).catch(err => {
        console.log('wage-check err:', err);
    });
}

exports.main = main
