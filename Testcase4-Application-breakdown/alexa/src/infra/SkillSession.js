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

const uuid = require('uuid')

/**
 * Information about the current open session on the Alexa emulator
 */
class SkillSession {

    constructor() {
        this._id = "SessionID." + uuid.v4();
        this._new = true;
        this._attributes = {};
    }

    updateAttributes(sessionAttributes) {
        if (sessionAttributes !== undefined && sessionAttributes !== null) {
            this._attributes = sessionAttributes;
        }

    }

    setID(id) {
        this._id = id;
    }

    isNew() {
        return this._new;
    }

    used() {
        this._new = false;
    }
}

exports.SkillSession = SkillSession
