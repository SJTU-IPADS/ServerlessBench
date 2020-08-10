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
