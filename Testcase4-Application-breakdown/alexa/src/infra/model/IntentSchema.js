/*import * as fs from "fs";
import {IIntentSchema, Intent, IntentSlot} from "virtual-core";
*/

const fs = require('fs')
const Intent = require('virtual-core').Intent
const IntentSlot = require('virtual-core').IntentSlot

class IntentSchema  {
    static fromFile(file) {
        const data = fs.readFileSync(file);
        const json = JSON.parse(data.toString());
        return IntentSchema.fromJSON(json);
    }

    static fromJSON(schemaJSON) {
        return new IntentSchema(schemaJSON);
    }

    constructor(schemaJSON) {
        this.schemaJSON = schemaJSON
    }

    intents() {
        const intentArray = [];
        for (const intentJSON of this.schemaJSON.intents) {
            const intent = new Intent(intentJSON.intent);
            if (intentJSON.slots !== undefined && intentJSON.slots !== null) {
                for (const slotJSON of intentJSON.slots) {
                    intent.addSlot(new IntentSlot(slotJSON.name, slotJSON.type));
                }
            }
            intentArray.push(intent);
        }
        return intentArray;
    }

    intent(intentString) {
        let intent = null;
        for (const o of this.intents()) {
            if (o.name === intentString) {
                intent = o;
                break;
            }
        }
        return intent;
    }

    hasIntent(intentString) {
        return this.intent(intentString) !== null;
    }

    addIntent(intent) {
        const matchIntentByName = function (item) {
            return item.intent === intent;
        };
        if (!this.schemaJSON.intents.some(matchIntentByName)){
            this.schemaJSON.intents.push({intent});
        }
    }
}

exports.IntentSchema = IntentSchema
