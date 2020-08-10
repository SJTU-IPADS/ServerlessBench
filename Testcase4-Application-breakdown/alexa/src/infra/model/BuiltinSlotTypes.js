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

const SlotType = require('virtual-core').SlotType

class BuiltinSlotTypes {
    static values() {
        return [
            new NumberSlotType(),
        ];
    }
}

class BuiltinSlotType extends SlotType {
    constructor(name, values, regex) {
        super(name, values);
    }

    match(value) {
        value = value.trim();
        // Some slot types use regex - we use that if specified
        let slotMatch = new SlotMatch(false);
        if (this.regex) {
            const match = value.match(this.regex);
            if (match) {
                slotMatch = new SlotMatch(true, value);
            }
        }

        if (!slotMatch.matches) {
            slotMatch = super.match(value);
        }
        return slotMatch;
    }
}

class NumberSlotType extends BuiltinSlotType {

    constructor() {
        super("AMAZON.NUMBER", NumberSlotType.LONG_FORM_SLOT_VALUES(), "^[0-9]*$");

    }

    static LONG_FORM_SLOT_VALUES() {
        const slotValues = [];

        for (const key of Object.keys(NumberSlotType.LONG_FORM_VALUES)) {
            const values = NumberSlotType.LONG_FORM_VALUES[key];
            slotValues.push({id: key, builtin: true, name: {value: key, synonyms: values}});
        }
        return slotValues;
    }

    isEnumerated() {
        return true;
    }
}

NumberSlotType.LONG_FORM_VALUES = {
    1: ["one"],
    2: ["two"],
    3: ["three"],
    4: ["four"],
    5: ["five"],
    6: ["six"],
    7: ["seven"],
    8: ["eight"],
    9: ["nine"],
    10: ["ten"],
    11: ["eleven"],
    12: ["twelve"],
    13: ["thirteen"],
    14: ["fourteen"],
    15: ["fifteen"],
    16: ["sixteen"],
    17: ["seventeen"],
    18: ["eighteen"],
    19: ["nineteen"],
    20: ["twenty"],
};


exports.BuiltinSlotTypes = BuiltinSlotTypes
exports.NumberSlotType = NumberSlotType
