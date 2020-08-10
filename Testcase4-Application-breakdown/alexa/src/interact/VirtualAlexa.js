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

const InteractionModel = require('./infra/model/InteractionModel').InteractionModel;
const SkillContext = require('./infra/SkillContext').SkillContext;
const SkillRequest = require('./infra/SkillRequest').SkillRequest;
const SkillInteractor = require('./infra/SkillInteractor').SkillInteractor;
const Utterance = require('virtual-core').Utterance;

class VirtualAlexa {

    constructor(modelFile) {
        var model = InteractionModel.fromFile(modelFile);

        this._context = new SkillContext(model);
        this._context.newSession();

        this._interactor = new SkillInteractor(this._context);
    }

    // Invoke virtual alexa with constructed skill request
    // @internal
    call(skillRequest, skill/*, skillInteractor*/) {
        console.log("skillRequest: " + JSON.stringify(skillRequest.json(), null, 2));
        //this._interactor = skillInteractor;
        return this._interactor.callSkill(skillRequest, skill);
    }

    /**
     * Sends a SessionEndedRequest to the skill
     * Does not wait for a reply, as there should be none
     * @returns {Promise<any>}
     */
    endSession() {
        const serviceRequest = new SkillRequest(this._context);
        // Convert to enum value and send request
        serviceRequest.sessionEnded();
        return this.call(serviceRequest, this._interactor);
    }

	/**
     * Sends the specified intent, with the optional map of slot values
     * @param {string} intentName
     * @param {{[p: string]: string}} slots
     * @returns {SkillRequest}
     */
	intend(intentName, slots, skill) {
        return this.call(new SkillRequest(this._context).intent(intentName).slots(slots), skill);
    }

    /**
     * Get skill request instance to build a request from scratch.
     * 
     * Useful for highly customized JSON requests
     */
    request() {
        return new SkillRequest(this._context);
    }
    
    /**
     * Sends a launch request to the skill
     * @returns {SkillRequest}
     */
    launch(skill) {
        return this.call(new SkillRequest(this._context).launch(), skill);
    }

    /**
     * Sends the specified utterance as an Intent request to the skill
     * @param {string} utterance
     * @returns {SkillRequest}
     */
    utter(utteranceString, skill) {
        if (utteranceString === "exit") {
            return this.endSession();
        }

        let resolvedUtterance = utteranceString;
        const launchRequestOrUtter = this.parseLaunchRequest(utteranceString);
        if (launchRequestOrUtter === true) {
            return this.launch(skill);
        } else if (launchRequestOrUtter) {
            resolvedUtterance = launchRequestOrUtter;
        }

        const utterance = new Utterance(this._context._interactionModel, resolvedUtterance);
        // If we don't match anything, we use the default utterance - simple algorithm for this
        if (!utterance.matched()) {
            throw new Error("Unable to match utterance: " + resolvedUtterance
                + " to an intent. Try a different utterance, or explicitly set the intent");
        }

        const request = new SkillRequest(this._context)
            .intent(utterance.intent())
            .slots(utterance.toJSON());
        return this.call(request, skill);
    }

    
    parseLaunchRequest(utter) {
        const launchRequestRegex = /(ask|open|launch|talk to|tell).*/i;
        if (launchRequestRegex.test(utter)) {
            const launchAndUtterRegex = /^(?:ask|open|launch|talk to|tell) .* to (.*)/i;
            const result = launchAndUtterRegex.exec(utter);
            if (result && result.length) {
                return result[1];
            } else {
                return true;
            }
        }

        return undefined;
    }
}

//export type RequestFilter = (request: any) => void;
exports.VirtualAlexa = VirtualAlexa

