const uuid = require('uuid')
//const User = require('./User').User
const SkillSession = require('./SkillSession').SkillSession

/**
 * Manages state of the Alexa device interaction across sessions.
 *
 * Holds information about the user, the current session, as well as the AudioPlayer, if in use.
 *
 * To emulate a user with a linked account, set the access token property.
 */
class SkillContext {
    constructor(interactionModel) {
        this._apiAccessToken = "virtualAlexa.accessToken." + uuid.v4();
        this._apiEndpoint = "https://api.amazonalexa.com";
        this._interactionModel = interactionModel;
//        this._dialogManager = new DialogManager(this);
//        this._device = new Device();
//        this._user = new User();
        this._locale = "en-US"
    }

    interactionModel() {
        return this._interactionModel;
    }

    session() {
        return this._session;
    }

    newSession() {
        this._session = new SkillSession();
    }

    endSession() {
        //this.dialogManager().reset();
        this._session = undefined;
    }

    activeSession() {
        return this._session !== undefined;
    }
}

exports.SkillContext = SkillContext
