/*
 * Copyright 2020 Institution of Parallel and Distributed Systems 
 *
 *
 * This file is modified from the original file (lambda/custom/index.js)
 * from https://github.com/alexa/skill-sample-nodejs-fact.
 * Changes include:
 *     Adding smarthome-skill logics.
 *     Supporting skill holding in OpenWhisk instead of AWS Lambda.
 *     Moving language handling (LocalizationInterceptor) to ../infra/language.js.
 */

/*
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

//
// Alexa Smarthome Skill
//

// sets up dependencies
const {
    SkillBuilders,
    getRequestType,
    getIntentName,
    getSlotValue
} = require('ask-sdk-core');
const LocalizationInterceptor = require('./infra/language').LocalizationInterceptor;

const InteractionModel = require('./infra/model/InteractionModel').InteractionModel;
const SkillRequest = require('./infra/SkillRequest').SkillRequest;
const SkillInteractor = require('./infra/SkillInteractor').SkillInteractor;
const SkillContext = require('./infra/SkillContext').SkillContext;

async function enterHome(password) {
    // send command to each devices
    // TODO: construct context from caller instead of creating new one
    var model = InteractionModel.fromFile('./en-US.json');
    var context = new SkillContext(model);
    context.newSession();
    var interactor = new SkillInteractor(context);

    var req = new SkillRequest(context).launch();

    var ps = [
        interactor.callSkill(req, 'home-door'),
        interactor.callSkill(req, 'home-light'),
        interactor.callSkill(req, 'home-tv'),
        interactor.callSkill(req, 'home-air-conditioning'),
        interactor.callSkill(req, 'home-plug')
    ];
    
    var results = await Promise.all(ps);

    var speakOutput = results[0]['response'];
    speakOutput += ', ' + results[1]['response'];
    speakOutput += ', ' + results[2]['response'];
    speakOutput += ', ' + results[3]['response'];
    speakOutput += ', ' + results[4]['response'];

    /*var startTimes = [
            'door-controller': results[0]['startTimes']['door-controller'], 
            'light-controller': results[1]['startTimes']['light-controller'], 
            'tv-controller': results[2]['startTimes']['tv-controller'], 
            'air-conditioning-controller': results[3]['startTimes']['air-conditioning-controller'], 
            'plug-controller': results[4]['startTimes']['plug-controller']
    ];*/
    var startTimes = [results[0]['startTimes'], results[1]['startTimes'], results[2]['startTimes'], results[3]['startTimes'], results[4]['startTimes']];
    return [speakOutput, startTimes];
}

// core functionality for smarthome skill
const EnterHomeHandler = {
  canHandle(handlerInput) {
    const requestEnv = handlerInput.requestEnvelope;

    // checks request type
    return (getRequestType(requestEnv) === 'IntentRequest'
        && getIntentName(requestEnv) === 'EnterHomeIntent');
  },
  async handle(handlerInput) {
    console.log('request: ' + JSON.stringify(handlerInput.requestEnvelope.request));
    const password = getSlotValue(handlerInput.requestEnvelope, 'password');
    const smarthome_password = handlerInput.requestEnvelope.SMARTHOME_PASSWORD;

    var enterRes;
    var startTimes;
    if (password !== smarthome_password) {
        enterRes = 'wrong-token';
    }
    else {
        enterRes = await enterHome(password);
        startTimes = enterRes[1];
    }
    var speakOutput = enterRes[0];
    console.log('callSkill result: ' + speakOutput);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .withSimpleCard("startTimes", startTimes)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};


//const skillBuilder = Alexa.SkillBuilders.custom();
const skillBuilder = SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    EnterHomeHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  //.lambda();
  .create();
