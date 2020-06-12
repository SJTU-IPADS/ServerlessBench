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
