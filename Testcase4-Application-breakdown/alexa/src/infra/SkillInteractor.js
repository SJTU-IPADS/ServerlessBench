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

class SkillInteractor {

    constructor(context) {
        this._context = context;
    }

    filter(requestFilter) {
        this.requestFilter = requestFilter;
    }

    async callSkill(serviceRequest, action) {
        // When the user utters an intent, we suspend for it
        // We do this first to make sure everything is in the right state for what comes next

        const requestJSON = serviceRequest.json();
        if (this.requestFilter) {
            this.requestFilter(requestJSON);
        }

        const result = await this.invoke(requestJSON, action);

        // If this was a session ended request, end the session in our internal state
        if (requestJSON.request.type === "SessionEndedRequest") {
            this._context.endSession();
        }

        return result;
    }

    invoke(requestJSON, action) {
        var openwhisk = require('openwhisk')
        var owoptions = {ignore_certs: true};
        var ow = openwhisk(owoptions)

		return new Promise(function (resolve, reject) {
            ow.actions.invoke({ actionName: 'alexa-'+action, result: true, blocking: true, params: requestJSON})
                      .then(result=> {
                        console.log('here is the invocation result: ', result)
                        resolve(result)
                      }).catch(err => {
                        console.error('failed to invoke actions', err)
                      })
            });

    }
}

exports.SkillInteractor = SkillInteractor
