/*import * as fs from "fs";
import {SampleUtterances} from "virtual-core";
*/

const fs = require('fs')
const SampleUtterances = require('virtual-core').SampleUtterances

class SampleUtterancesBuilder {
    static fromFile(file) {
        const data = fs.readFileSync(file);
        const utterances = new SampleUtterances();
        SampleUtterancesBuilder.parseFlatFile(utterances, data.toString());
        return utterances;
    }

    static fromJSON(sampleUtterancesJSON) {
        const sampleUtterances = new SampleUtterances();
        for (const intent of Object.keys(sampleUtterancesJSON)) {
            for (const sample of sampleUtterancesJSON[intent]) {
                sampleUtterances.addSample(intent, sample);
            }
        }
        return sampleUtterances;
    }

    parseFlatFile(utterances, fileData) {
        const lines = fileData.split("\n");
        for (const line of lines) {
            if (line.trim().length === 0) {
                // We skip blank lines - which is what Alexa does
                continue;
            }

            const index = line.indexOf(" ");
            if (index === -1) {
                throw Error("Invalid sample utterance: " + line);
            }

            const intent = line.substr(0, index);
            const sample = line.substr(index).trim();
            utterances.addSample(intent, sample);
        }
    }
}

exports.SampleUtterancesBuilder = SampleUtterancesBuilder
