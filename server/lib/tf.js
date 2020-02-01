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

const threshold = 0.9;
async function checkTfToxicity(question) {
    const returnValue = {};
    let result = false;
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
        console.log({ message: 'check tf toxicity fail please checkout the tf connection' }) ;
    }
    if (returnValue !== {}) {
        if (returnValue.toxicity) {
            for (let i = 0; i < Object.keys(returnValue).length-1; i+=1){
                if (Object.values(returnValue)[i] || Object.values(returnValue)[i] === null) {
                    reason.push(Object.keys(returnValue)[i]);
                }
            }
            result = true;
        }
    }
    return {toxicity: result, reason: reason};
}
async function AutoRemoveMessage(toxicity, reason, messageId, io, roomId) {
    await Chat.updateMessageToxicity({messageId, result: toxicity, toxicityReason: reason})
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
