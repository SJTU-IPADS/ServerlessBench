
const va = require('./VirtualAlexa');

function main(params) {
    var date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + (date.getDate())).slice(-2);
    const hour = ("0" + (date.getHours())).slice(-2);
    const minute = ("0" + (date.getMinutes())).slice(-2);
    const second = ("0" + (date.getSeconds())).slice(-2);
    const millisecond = ("00" + (date.getMilliseconds())).slice(-3);

    var datestr = "[" + year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second + "." + millisecond + "Z]";

    console.log('skill:', params.skill, ', utter:', params.utter);
    var alexa = new va.VirtualAlexa('./models/model-'+params.skill+'.json');
    return alexa.utter(params.utter, params.skill).then ( results => {
	results['startTimes'] = {"skill": results['startTimes'], "interact": datestr};
        return results;
    });
}

exports.main = main
