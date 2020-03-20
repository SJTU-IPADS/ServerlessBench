const handler = require('./door-handler').handler

function main(args) {
    var date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + (date.getDate())).slice(-2);
    const hour = ("0" + (date.getHours())).slice(-2);
    const minute = ("0" + (date.getMinutes())).slice(-2);
    const second = ("0" + (date.getSeconds())).slice(-2);
    const millisecond = ("00" + (date.getMilliseconds())).slice(-3);

    var datestr = "[" + year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second + "." + millisecond + "Z]";

    var response = handler.invoke(args);

    console.log(`RESPONSE++++${JSON.stringify(response)}`);

    return response.then ( results => {
        results['startTimes'] = {"door-controller": datestr};
        return results;
    });
}

exports.main = main
