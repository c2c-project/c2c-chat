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

const threshold = 0.9;
async function tfToxicity(question) {
    const returnValue = {};
    const reason = [];
    try {
        await toxicity.load(threshold).then(async model => {
            await model.classify(question).then(async predictions => {
                await predictions.forEach(prediction => {
                    returnValue[prediction.label] = prediction.results[0].match;
                });
                return returnValue;
            });
        });
    } catch (exception) {
        return { message: 'fail' };
    }
    if (returnValue !== {}) {
        if (returnValue.toxicity) {
            for (let i = 0; i < Object.keys(returnValue).length-1; i+=1){
                if (Object.values(returnValue)[i] || Object.values(returnValue)[i] === null) {
                    reason.push(Object.keys(returnValue)[i]);
                }
            }
            return [true, reason];
        }
        return [false];
    }
    return { message: 'fail' };
}
export default { tfToxicity };
