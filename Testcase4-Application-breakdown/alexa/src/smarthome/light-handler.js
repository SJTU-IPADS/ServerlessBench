/*
 * Copyright 2020 Institution of Parallel and Distributed Systems 
 *
 * This file is modified from the original file (lambda/custom/index.js)
 * from https://github.com/alexa/skill-sample-nodejs-fact.
 * Changes include:
 *     Adding light controller logics for smarthome-skill.
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
// Smart home skill -- light controller
//

// sets up dependencies
const {
    SkillBuilders,
    getRequestType
} = require('ask-sdk-core');
const LocalizationInterceptor = require('./infra/language').LocalizationInterceptor;
const net = require('./net')


// core functionality for light control
const OpenLightHandler = {
  canHandle(handlerInput) {
    const requestEnv = handlerInput.requestEnvelope;

    // checks request type
    return getRequestType(requestEnv) === 'LaunchRequest';
  },
  async handle(handlerInput) {
    console.log('request: ' + JSON.stringify(handlerInput.requestEnvelope.request));

    var body = {'req_switch': 'ON'};
    var speakOutput = await net.SendRequest('http://' + handlerInput.requestEnvelope.IP + ':' + handlerInput.requestEnvelope.PORT, body);
    return speakOutput;
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
    OpenLightHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  //.lambda();
  .create();

