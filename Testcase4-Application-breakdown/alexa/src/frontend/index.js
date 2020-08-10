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


function parseSkill(utter) {
    const regex = /(ask|open|launch|talk to|tell) (.*)/i;
    const result = regex.exec(utter);
    if (result && result.length) {
        console.log('result[0,1,2]: ' + result[0] + ', ' + result[1] + ', ' + result[2]);
        return result[2];
    } else {
        return undefined;
    }
}

function parseIntent(utter) {

    const openwhisk = require('openwhisk');
    var ow = openwhisk({ignore_certs: true});

    const regex = /(.*) to (.*)/i;
    const result = regex.exec(utter);
    if (result && result.length) {
        console.log('result[0,1,2]: ' + result[0] + ', ' + result[1] + ', ' + result[2]);
        return new Promise((resolve, reject) => {
            ow.actions.invoke({actionName: 'alexa-interact', result: true, blocking: true, params: {'skill': result[1], 'utter': 'open '+ utter}}).then(result => {
                    console.log('invocation result: ', result);
                    resolve(result);
                }).catch(err => {
                    console.error('failed to invoke actions', err);
                    reject('invoke action alexa-interact failed', err);
                });
                    
        });
    } else {
        return new Promise((resolve, reject) => {
            console.log('invoking alexa-interact');
            ow.actions.invoke({actionName: 'alexa-interact', result: true, blocking: true, params: {'skill': utter, 'utter': 'open ' + utter}})
                .then(result => {
                    console.log('invocation result: ', result);
                    resolve(result);
                }).catch(err => {
                    console.error('failed to invoke actions', err);
                    reject('invoke action alexa-interact failed', err);
                });
                    
        });
    }
}

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

    var utteranceString = params.utter;
    console.log('utter: ' + utteranceString);
    var skill = parseSkill(utteranceString);
    console.log('skill: ' + skill);
    if (skill === undefined) {
        console.log("cannot parse skill from utterance: " + utteranceString);
        return {'speakOutput' : 'i cannot understand you, please repeat'};
    }

    return parseIntent(skill).then( results => {
        results['startTimes'] = {"interact": results['startTimes'], "frontend": datestr};
        return results;
    });
}

exports.main = main
