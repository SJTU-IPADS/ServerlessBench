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

const uuid = require('uuid');
const SlotValue = require('./SlotValue').SlotValue;

class RequestType {}
RequestType.INTENT_REQUEST = "IntentRequest";
RequestType.LAUNCH_REQUEST = "LaunchRequest";
RequestType.SESSION_ENDED_REQUEST = "SessionEndedRequest";

/**
 * Creates a the JSON for a Service Request programmatically
 * 
 * This class assists with setting all the values on the request.
 * 
 * Additionally, the raw JSON can be accessed with the .json() property.
 */
class SkillRequest {


    /**
     * The timestamp is a normal JS timestamp without the milliseconds
     */
    static timestamp() {
        const timestamp = new Date().toISOString();
        return timestamp.substring(0, 19) + "Z";
    }

    static requestID() {
        return "amzn1.echo-external.request." + uuid.v4();
    }

/*    private context: SkillContext;
    private _json: any;
*/    
    constructor(context) {
        this.context = context;
        this._json = this.baseRequest();
    }

    /**
     * Sets the dialog state for the request, as well as the internal dialog manager
     * @param state The dialog state
     */
    /*dialogState(state) {
        this.context.dialogManager().state(state);
        this._json.request.dialogState = state; 
        return this;
    }*/
    
    /**
     * Sets the intent for the request
     * @param intentName
     * @returns {SkillRequest}
     */
    //intent(intentName, confirmationStatus) {
    intent(intentName) {
        this.requestType(RequestType.INTENT_REQUEST);
        const isBuiltin = intentName.startsWith("AMAZON");
        if (!isBuiltin) {
            if (!this.context._interactionModel.hasIntent(intentName)) {
                throw new Error("Interaction model has no intentName named: " + intentName);
            }
        }

        this._json.request.intent = {
            //confirmationStatus: confirmationStatus,
            name: intentName,
            slots: {},
        };

        // Set default slot values - all slots must have a value for an intent
        const intent = this.context._interactionModel.intentSchema.intent(intentName);
        const intentSlots = intent.slots;
        
        if (intentSlots) {
            for (const intentSlot of intentSlots) {
                this._json.request.intent.slots[intentSlot.name] = {
                    name: intentSlot.name/*,
                    confirmationStatus: ConfirmationStatus.NONE*/
                }
            }
        }
/*
        if (this.context.interactionModel().dialogIntent(intentName)) {
            //Update the internal state of the dialog manager based on this request
            this.context.dialogManager().handleRequest(this);

            // Our slots can just be taken from the dialog manager now
            //  It has the complete current state of the slot values for the dialog intent
            this.json().request.intent.slots = this.context.dialogManager().slots();
        }
*/
        return this;
    }

    /**
     * Sets the confirmation status of the intent
     * @param confirmationStatus The confirmation status of the intent
     */
    /*/*intentStatus(confirmationStatus) {
        this._json.request.intent.confirmationStatus = confirmationStatus;
        return this;
    }*/

    /**
     * The raw JSON of the request. This can be directly manipulated to modify what is sent to the skill.
     */
    json() {
        return this._json;
    }

    /**
     * Creates a LaunchRequest request
     */
    launch() {
        this.requestType(RequestType.LAUNCH_REQUEST);
        return this;
    }

    /** @internal */
    requiresSession() {
        // LaunchRequests and IntentRequests both require a session
        // We also force a session on a session ended request, as if someone requests a session end
        //  we will make one first if there is not. It will then be ended.
        return (this._json.request.type === RequestType.LAUNCH_REQUEST
            || this._json.request.type === RequestType.DISPLAY_ELEMENT_SELECTED_REQUEST
            || this._json.request.type === RequestType.INTENT_REQUEST
            || this._json.request.type === RequestType.SESSION_ENDED_REQUEST);
    }

    requestType(requestType) {
        this._json.request.type = requestType;

        // If we have a session, set the info
        if (this.requiresSession()) {
            // Create a new session if there is not one
            if (!this.context.activeSession()) {
                this.context.newSession();
            }
            const applicationID = this.context.applicationID;

            const session = this.context.session();
            const newSession = session._new;
            const sessionID = session._id;
            const attributes = session._attributes;

            this._json.session = {
                application: {
                    applicationId: applicationID,
                },
                new: newSession,
                sessionId: sessionID,
                //user: this.userObject(this.context),
            };

            if (this._json.request.type !== RequestType.LAUNCH_REQUEST) {
                this._json.session.attributes = attributes;
            }

            /*if (this.context.accessToken() !== null) {
                this._json.session.user.accessToken = this.context.accessToken();
            }*/
        }

        return this;
    }
    
    /**
     * Creates a SessionEndedRequest request
     * @param reason The reason the session ended
     * @param errorData Error data, if any
     */
    sessionEnded() {
        this.requestType(RequestType.SESSION_ENDED_REQUEST);
        //this._json.request.reason = SessionEndedReason[SessionEndedReason.USER_INITIATED];
        this._json.request.reason = 0;
        if (errorData !== undefined && errorData !== null) {
            this._json.request.error = errorData;
        }
        return this;
    }

    /**
     * Convenience method to set properties on the request object - uses [lodash set]{@link https://lodash.com/docs/#set} under the covers.
     * Returns this for chaining
     * @param path The dot-notation path for the property to set
     * @param value The value to set it to
     */
    set(path, value) {
        _.set(this.json(), path, value);
        return this;
    }

    /**
     * Sets a slot value on the request
     * @param slotName 
     * @param slotValue 
     * @param confirmationStatus 
     */
    //slot(slotName, slotValue, confirmationStatus) {
    slot(slotName, slotValue) {
        const intent = this.context._interactionModel.intentSchema.intent(this.json().request.intent.name);
        console.log('slotName:', slotName, 'slotValue:', slotValue, 'intent.name:', intent.name);

        const intentSlots = intent.slots;
        if (!intentSlots) {
            throw new Error("Trying to add slot to intent that does not have any slots defined");
        }

        if (!intent.slotForName(slotName)) {
            throw new Error("Trying to add undefined slot to intent: " + slotName);   
        }
            
        //const slotValueObject = new SlotValue(slotName, slotValue, confirmationStatus);
        const slotValueObject = new SlotValue(slotName, slotValue);
        slotValueObject.setEntityResolution(this.context, this._json.request.intent.name);
        this._json.request.intent.slots[slotName] = slotValueObject;
        
  /*      if (this.context.interactionModel().dialogIntent(this._json.request.intent.name)) {
            //Update the internal state of the dialog manager based on this request
            this.context.dialogManager().updateSlot(slotName, slotValueObject);
        }
*/
        return this;
    }

    /**
     * Sets slot values as a dictionary of strings on the request
     */
    slots(slots) {
        if (slots) {
            for (const slot of Object.keys(slots)) {
                const slotValue = slots[slot];
                this.slot(slot, slotValue);
            }    
        }
        return this;
    }

    /**
     * For dialogs, updates the confirmation status of a slot - does not change the value
     * @param slotName 
     * @param confirmationStatus 
     */
    /*public slotStatus(slotName: string, confirmationStatus: ConfirmationStatus): SkillRequest {
        this.context.dialogManager().slots()[slotName].confirmationStatus = confirmationStatus;
        return this;
    }*/

    baseRequest() {
        const applicationID = this.context.applicationID;
        const requestID = SkillRequest.requestID();
        const timestamp = SkillRequest.timestamp();

        // First create the header part of the request
        const baseRequest = {
            context: {
                System: {
                    application: {
                        applicationId: applicationID,
                    },
                    /*device: {
                        supportedInterfaces: this.context.device().supportedInterfaces(),
                    },
                    user: this.userObject(this.context),*/
                },
            },
            request: {
                locale: this.context._locale,
                requestId: requestID,
                timestamp,
            },
            version: "1.0",
        };

        // If the device ID is set, we set the API endpoint and deviceId properties
        /*if (this.context.device().id()) {
            baseRequest.context.System.apiAccessToken = this.context.apiAccessToken();
            baseRequest.context.System.apiEndpoint = this.context.apiEndpoint();
            baseRequest.context.System.device.deviceId = this.context.device().id();
        }

        if (this.context.accessToken() !== null) {
            baseRequest.context.System.user.accessToken = this.context.accessToken();
        }*/

        // If display enabled, we add a display object to context
        /*if (this.context.device().displaySupported()) {
            baseRequest.context.Display = {};
        }*/
        return baseRequest;
    }

    /*userObject(context) {
        const o = {
            userId: context.user.id,
        };

        // If we have a device ID, means we have permissions enabled and a consent token
        if (context.device().id()) {
            o.permissions = {
                consentToken: uuid.v4(),
            };
        }
        return o;
    }*/
}


exports.SkillRequest = SkillRequest
