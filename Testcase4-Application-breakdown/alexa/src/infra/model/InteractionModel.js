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

const fs = require('fs')
const SlotTypes = require('virtual-core').SlotTypes
const SampleUtterances = require('virtual-core').SampleUtterances
const SampleUtterancesBuilder = require('./SampleUtterancesBuilder').SampleUtterancesBuilder
const BuiltinSlotTypes = require('./BuiltinSlotTypes').BuiltinSlotTypes
const BuiltinUtterances = require('./BuiltinUtterances').BuiltinUtterances
const IntentSchema = require('./IntentSchema').IntentSchema

/**
 * Parses and interprets an interaction model
 * Takes in intentName schema and sample utterances from files
 * Then can take a phrase and create an intentName request based on it
 */
class InteractionModel {

    // Parse the all-in-one interaction model as a file
    static fromFile(interactionModelFile) {
        const data = fs.readFileSync(interactionModelFile);
        const json = JSON.parse(data.toString());
        return InteractionModel.fromJSON(json);
    }

    // Parse the all-in-one interaction model as JSON
    // Using this for reference:
    //  https://github.com/alexa/skill-sample-nodejs-team-lookup/blob/master/speech-assets/interaction-model.json
    static fromJSON(interactionModel) {
        const schemaJSON = {
            intents: [],
        };
        const sampleJSON = {};

        let languageModel = interactionModel;
        let promptsElement = interactionModel.prompts;
        let dialogElement = interactionModel.dialog;
        // For the official interaction model that is part of SMAPI,
        //  we pull the data off of the interactionModel.languageModel element
        if ("interactionModel" in interactionModel) {
            languageModel = interactionModel.interactionModel.languageModel;
            promptsElement = interactionModel.interactionModel.prompts;
            dialogElement = interactionModel.interactionModel.dialog;
        }

        // There is another version of the model from the interaction model builder
        if ("languageModel" in interactionModel) {
            languageModel = interactionModel.languageModel;
        }

        const intents = languageModel.intents;
        for (const intent of intents) {
            // The name of the intent is on the property "name" instead of "intent" for the unified model
            intent.intent = intent.name;
            schemaJSON.intents.push(intent);
            if (intent.samples) {
                sampleJSON[intent.intent] = intent.samples;
            }
        }

        let slotTypes;
        if (languageModel.types) {
            slotTypes = new SlotTypes(languageModel.types);
        }
        const schema = new IntentSchema(schemaJSON);
        const samples = SampleUtterancesBuilder.fromJSON(sampleJSON);

        let prompts;
        if (promptsElement) {
            prompts = [];
            for (const prompt of promptsElement) {
                prompts.push(SlotPrompt.fromJSON(prompt));
            }
        }

        let dialogIntents;
        if (dialogElement) {
            dialogIntents = [];
            for (const dialogIntent of dialogElement.intents) {
                dialogIntents.push(DialogIntent.fromJSON(interactionModel, dialogIntent));
            }
        }

        return new InteractionModel(schema, samples, slotTypes, prompts, dialogIntents);
    }

    fromLocale(locale) {
        const modelPath = "./models/" + locale + ".json";
        if (!fs.existsSync(modelPath)) {
            return undefined;
        }

        return InteractionModel.fromFile(modelPath);
    }

    hasIntent(intent) {
        return this.intentSchema.hasIntent(intent);
    }

	constructor(intentSchema, sampleUtterances, slotTypes, prompts, dialogIntents) {
        if (!this.slotTypes) {
            this.slotTypes = new SlotTypes([]);
        }

        // In bootstrapping the interaction model, we pass it to its children
        this.sampleUtterances = sampleUtterances;
        this.sampleUtterances.setInteractionModel(this);
/*
        if (this.dialogIntents) {
            for (const dialogIntent of this.dialogIntents) {
                dialogIntent.interactionModel = this;
            }
        }*/

        const builtinValues = BuiltinUtterances;

        this.intentSchema = intentSchema;
/*       const isAudioPlayerSupported = this.audioPlayerSupported(intentSchema);
        // We add each phrase one-by-one
        // It is possible the built-ins have additional samples defined
        for (const key of Object.keys(builtinValues)) {
            const isSupportedIntent = this.isSupportedIntent(isAudioPlayerSupported, key);
            if (isSupportedIntent) {
                intentSchema.addIntent(key);
                for (const phrase of builtinValues[key]) {
                    this.sampleUtterances.addSample(key, phrase);
                }
            }
        }
*/
        this.slotTypes.addTypes(BuiltinSlotTypes.values());
    }
    
    isSupportedIntent(isAudioPlayerSupported, intent) {
        const hasIntent = this.hasIntent(intent);
        const isAudioPlayerIntent = isAudioPlayerSupported && AudioPlayerIntents.indexOf(intent) >= 0;
        return hasIntent || isAudioPlayerIntent;
    }

    hasIntent(intent) {
        return this.intentSchema.hasIntent(intent);
    }
/*
    public dialogIntent(intentName: string): DialogIntent | undefined {
        if (!this.dialogIntents) {
            return undefined;
        }

        for (const dialogIntent of this.dialogIntents) {
            // If our intent matches a dialog intent, then we flip into dialog mode
            if (dialogIntent.name === intentName) {
                return dialogIntent;
            }
        }

        return undefined;
    }
*/
    prompt(id) {
        if (!this.prompts) {
            return undefined;
        }

        for (const prompt of this.prompts) {
            if (prompt.id === id) {
                return prompt;
            }
        }

        return undefined;
    }
/*
    public audioPlayerSupported(intentSchema: IntentSchema) : boolean {
        // Audio player must have pause and resume intents in the model
        return intentSchema.hasIntent("AMAZON.PauseIntent") && intentSchema.hasIntent("AMAZON.ResumeIntent");
    }
*/
}

exports.InteractionModel = InteractionModel
