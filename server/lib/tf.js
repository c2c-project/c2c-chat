// TODO: 193
/**
 * Stick all your tensorflow code here for now
 * If you need more files feel free to create them.
 *
 * One thing you'll have to do is add the appropriate packages.
 * Don't forget to use yarn instead of npm! If you're having trouble
 * just contact me.
 *
 * Also, make sure you are adding these packages to the server's package.json and not the root or client's.
 *
 */

import * as toxicity from '@tensorflow-models/toxicity';

const threshold = 0.9; // Will be change if the toxicity test is too sensitive.
async function tfToxicity(question) {
    const toxicityResult = {};
    const toxicityReason = [];
    await toxicity.load(threshold).then(async model => {
        await model.classify(question).then(async predictions => {
            await predictions.forEach(prediction => {
                // Remodel the value structure to a list of key-value pairs.
                toxicityResult[prediction.label] = prediction.results[0].match; 
            });
        });
    });
    if (toxicityResult.toxicity) {
        for (let i = 0; i < Object.keys(toxicityResult).length-1; i+=1){
            // if value of toxicityResult is true or null, we add its key to the toxicityReason.
            if (!Object.values(toxicityResult)[i]) {
                toxicityReason.push(Object.keys(toxicityResult)[i]);
            }
        }
        return [true, toxicityReason];
    }
    return [false];
}
export default { tfToxicity };
