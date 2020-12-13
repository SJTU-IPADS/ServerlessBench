/*
 * Copyright 2020 Institution of Parallel and Distributed Systems 
 * 
 * This file is modified from the original file (lambda/custom/index.js)
 * from https://github.com/alexa/skill-sample-nodejs-fact.
 * Changes include: 
 *     Adding reminder-skill logics.
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
// Alexa Reminder Skill
//

// sets up dependencies
const {
    SkillBuilders,
    getRequestType,
    getIntentName,
    getSlotValue
} = require('ask-sdk-core');

const LocalizationInterceptor = require('./infra/language').LocalizationInterceptor;

function retrieveItem(place, url, dbname) {
    var couchdbOrError = require('nano')(url)

    if (typeof couchdbOrError !== 'object') {
        return Promise.reject(couchdbOrError);
    }

    var reminder = couchdbOrError.use(dbname);

    var speakOutput = 'please bring: ';

    return new Promise(function(resolve, reject) {
        reminder.get(place, function(error, body) {
            // get the document
            if (!error) {
                console.log('existing doc: ' + JSON.stringify(body));
                console.log('items: ' + JSON.stringify(body['items']));
                var i = null;
                for(i = 0; i < body['items'].length; i++) {
                    console.log('body[items][' + i + ']=' + body['items'][i]);
                    speakOutput += body['items'][i] + ', ';
                }
                resolve(speakOutput);
            } else {
                // document not exist.
                if (error.statusCode === 404) {
                    speakOutput += 'anything you want';
                    resolve(speakOutput);
                } else {
                    reject(error);
                }
            }
        });
    });
}

// core functionality for reminder skill
const RetrieveItemHandler = {
  canHandle(handlerInput) {
    const requestEnv = handlerInput.requestEnvelope;

    // checks request type
    return (getRequestType(requestEnv) === 'IntentRequest'
        && getIntentName(requestEnv) === 'RetrieveItemIntent');
  },
  async handle(handlerInput) {
    const place = getSlotValue(handlerInput.requestEnvelope, 'place');
    console.log('request: ' + JSON.stringify(handlerInput.requestEnvelope.request));

    const speakOutput = await retrieveItem(place, handlerInput.requestEnvelope.COUCHDB_URL, handlerInput.requestEnvelope.DATABASE);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
//      .withSimpleCard(requestAttributes.t('SKILL_NAME'), randomFact)
      .getResponse();
  },
};

function addItem(item, place, url, dbname) {
    var couchdbOrError = require('nano')(url)

    if (typeof couchdbOrError !== 'object') {
        return Promise.reject(couchdbOrError);
    }

    var reminder = couchdbOrError.use(dbname);

    var speakOutput;

    return new Promise(function(resolve, reject) {
        reminder.get(place, function(error, body) {
            // get the document (items array) and update
            if (!error) {
                console.log('existing doc: ' + JSON.stringify(body));
                console.log('items: ' + JSON.stringify(body['items']));
                // check if the item already in doc
                var exist = false;
                var i = null;
                for(i = 0; i < body['items'].length; i++) {
                    console.log('body[items][' + i + ']=' + body['items'][i]);
                    if(body['items'][i] === item) {
                        exist = true;
                        break;
                    }
                }
                if (!exist) {
                    console.log('item not already exists, append');
                    // item not already in doc, append it.
                    body['items'].push(item);
                    console.log('modified body: ' + JSON.stringify(body));
                    reminder.insert(body)
                        .then(function (response) {
                            speakOutput = place + ' is associated with items: ' + JSON.stringify(body['items']);
                            resolve(speakOutput);
                        })
                        .catch(function (err) {
                            reject(err);
                        })
                } else {
                    console.log('item already exists, return');
                    speakOutput = place + ' is associated with items: ' + JSON.stringify(body['items']);
                    resolve(speakOutput);
                }
            } else {
                // document not exist, insert a new entry.
                if (error.statusCode === 404) {
                    var items = {items: [ item ]};
                    console.log('inserting doc: ', JSON.stringify(items));
                    reminder.insert(items, place)
                        .then(function (response){
                            speakOutput = place + ' is associated with items: ' + JSON.stringify(items);
                            resolve(speakOutput);
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                } else {
                    reject(error);
                }
            }
        });
    });
}

// core functionality for reminder skill
const AddItemHandler = {
  canHandle(handlerInput) {
    const requestEnv = handlerInput.requestEnvelope;

    // checks request type
    return (getRequestType(requestEnv) === 'IntentRequest'
        && getIntentName(requestEnv) === 'AddItemIntent');
  },
  async handle(handlerInput) {
//    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const place = getSlotValue(handlerInput.requestEnvelope, 'place');
    const item = getSlotValue(handlerInput.requestEnvelope, 'item');
    console.log('request: ' + JSON.stringify(handlerInput.requestEnvelope.request));

    const speakOutput = await addItem(item, place, handlerInput.requestEnvelope.COUCHDB_URL, handlerInput.requestEnvelope.DATABASE);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
//      .withSimpleCard(requestAttributes.t('SKILL_NAME'), randomFact)
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
    AddItemHandler,
    RetrieveItemHandler,
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
