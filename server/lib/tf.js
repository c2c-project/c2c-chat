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
import Chat from '../db/collections/chat';
import Questions from '../db/collections/questions';


const threshold = 0.9; // Will be change if the toxicity test is too sensitive.
async function checkTfToxicity(question) {
    const toxicityResult = {};
    const toxicityReason = [];
    let result = false;
    try {
        await toxicity.load(threshold).then(async model => {
            await model.classify(question).then(async predictions => {
                await predictions.forEach(prediction => {
                    // Remodel the value structure to a list of key-value pairs.
                    toxicityResult[prediction.label] = prediction.results[0].match;
                });
                return toxicityResult;
            });
        });
    } catch (exception) {
        console.log({ message: 'check tf toxicity fail please checkout the tf connection' }) ;
    }
    if (toxicityResult !== {}) {
        if (toxicityResult.toxicity) {
            for (let i = 0; i < Object.keys(toxicityResult).length-1; i+=1){
                // if value of toxicityResult is true or null, we add its key to the toxicityReason.
                if (!Object.values(toxicityResult)[i]) {
                    toxicityReason.push(Object.keys(toxicityResult)[i]);
                }
            }
            result = true;
        }
    }
    return {toxicity: result, reason: toxicityReason};
}

async function AutoRemoveMessage(result, reason, messageId, io, roomId) {
    await Chat.updateMessageToxicity({messageId, result, toxicityReason: reason})
    const removeMessage = Chat.privilegedActions('AUTO_REMOVE_MESSAGE', '');
    removeMessage(messageId)
        .then(() => {
            io
                .of('/chat')
                .to(roomId)
                .emit('moderate', messageId);
        });
}

async function tfToxicityQuestion(questionDoc){
    try{
        if(questionDoc){
            const tfToxicityResult = await checkTfToxicity(questionDoc.question);
            await Questions.updateQuestionToxicity({questionId: questionDoc._id, result: tfToxicityResult.toxicity, toxicityReason: tfToxicityResult.reason})
        }
    }catch(Exception){
        console.log(Exception)
    }
}

async function tfToxicityMessage(messageDoc, io, roomId) {
    try{
        const messageId = messageDoc._id;
        if(messageDoc){
            const tfToxicityResult = await checkTfToxicity(messageDoc.message);
            await AutoRemoveMessage(tfToxicityResult.toxicity, tfToxicityResult.reason, messageId, io, roomId);
        }
    }catch(Exception){
        console.log(Exception)
    }
}

export default { 
    tfToxicityMessage,
    tfToxicityQuestion
};
