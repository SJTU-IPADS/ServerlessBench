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

const SkillContext = require("./SkillContext").SkillContext;

class SlotValue {

    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    setEntityResolution(context, intentName) {
        const intent = context.interactionModel().intentSchema.intent(intentName);
        if (!intent.slots) {
            return;
        }
        const slot = intent.slotForName(this.name);
        const slotType = context.interactionModel().slotTypes.slotType(slot.type);
        // We only include the entity resolution for builtin types if they have been extended
        //  and for all custom slot types
        if (slotType && slotType.isCustom()) {
            const authority = "amzn1.er-authority.echo-sdk." + context.applicationID() + "." + slotType.name;

            this.resolutions = { resolutionsPerAuthority: [] };
            const matches = slotType.matchAll(this.value);
            let customMatch = false;
            // Possible to have multiple matches, where we have overlapping synonyms
            for (const match of matches) {
                // If this is not a builtin value, we add the entity resolution
                if (match.enumeratedValue && !match.enumeratedValue.builtin) {
                    customMatch = true;
                    const entityResolution = new EntityResolution(authority,
                        EntityResolutionStatus.ER_SUCCESS_MATCH,
                        new EntityResolutionValue(match.enumeratedValue.id, match.enumeratedValue.name.value));
                    this.addEntityResolution(entityResolution);
                }
            }

            // Add a ER_SUCCESS_NO_MATCH record if there are no matches on custom values for the slot
            if (!customMatch) {
                const entityResolution = new EntityResolution(authority, EntityResolutionStatus.ER_SUCCESS_NO_MATCH);
                this.addEntityResolution(entityResolution);
            }
        }
    }

    addEntityResolution(entityResolution) {
        let alreadyResolved = false;
        for (const existingResolution of this.resolutions.resolutionsPerAuthority) {
            // If we already have a resolution for this lot, add this value to the list of values
            if (existingResolution.authority === entityResolution.authority) {
                existingResolution.values.push(entityResolution.values[0]);
                alreadyResolved = true;
            }
        }

        if (!alreadyResolved) {
            this.resolutions.resolutionsPerAuthority.push(entityResolution);
        }
    }
}

class EntityResolution {
    constructor(authority, statusCodem, value) {
        if (value) {
            this.values.push({ value });
        }
    }
}

class EntityResolutionValue {
    constructor(id, name) {}
}

class EntityResolutionStatus {}

EntityResolutionStatus.ER_SUCCESS_MATCH = "ER_SUCCESS_MATCH";
EntityResolutionStatus.ER_SUCCESS_NO_MATCH = "ER_SUCCESS_NO_MATCH";
EntityResolutionStatus.ER_ERROR_TIMEOUT = "ER_ERROR_TIMEOUT";
EntityResolutionStatus.ER_ERROR_EXCEPTION = "ER_ERROR_EXCEPTION";

exports.EntityResolutionStatus = EntityResolutionStatus
exports.EntityResolution = EntityResolution
exports.SlotValue = SlotValue
exports.EntityResolutionValue = EntityResolutionValue
