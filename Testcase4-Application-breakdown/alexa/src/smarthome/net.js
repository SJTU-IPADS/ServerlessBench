const request = require('request')

function SendRequest(url, body) {
    console.log('sending request to url: ' + url);
    return new Promise(function(resolve, reject) {
        request({
            'url': url,
            'method': 'POST',
            'json': true,
            'body': body
        }, function (error, response, body) {
            if(error) {
                reject(error);
            }
            console.log('device resp: ' + JSON.stringify(body));
            resolve(body);
        });

    });
}

exports.SendRequest = SendRequest
