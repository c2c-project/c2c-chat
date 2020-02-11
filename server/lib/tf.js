
import '@tensorflow/tfjs-node';
import * as toxicity from '@tensorflow-models/toxicity';
import Chat from '../db/collections/chat';
import Questions from '../db/collections/questions';

const threshold = 0.9; // Will be change if the toxicity test is too sensitive.

const toxicityLoad = toxicity.load(threshold);// load toxicity before hand

async function checkTfToxicity(question) {

    const promise = new Promise(function(resolve) {
        const toxicityResult = {};
        const toxicityReason = [];
        let result = false;
        toxicityLoad.then(model => {
            model.classify(question).then(predictions => {
                predictions.forEach(prediction => {
                    // Remodel the value structure to a list of key-value pairs.
                    toxicityResult[prediction.label] =
                        prediction.results[0].match;
                });
                if (toxicityResult.toxicity) {
                    for (let i = 0; i < Object.keys(toxicityResult).length - 1; i += 1) {
                        // if value of toxicityResult is true or null, we add its key to the toxicityReason.
                        if (!(Object.values(toxicityResult)[i] === false)) {
                            toxicityReason.push(Object.keys(toxicityResult)[i]);
                        }
                    }
                    result = true;
                }
                resolve({ toxicity: result, reason: toxicityReason })
            });
        });
    })
    return promise;
}

function AutoRemoveMessage(result, reason, messageId, io, roomId) {
    Chat.updateMessageToxicity({
        messageId,
        result,
        toxicityReason: reason
    });
    const removeMessage = Chat.privilegedActions('AUTO_REMOVE_MESSAGE', '');
    removeMessage(messageId).then(() => {
        io.of('/chat')
            .to(roomId)
            .emit('moderate', messageId);
    });
}

async function tfToxicityQuestion(questionDoc) {
    if (questionDoc) {
        checkTfToxicity(
            questionDoc.question
        ).then(tfToxicityResult =>{
            Questions.updateQuestionToxicity({
                questionId: questionDoc._id,
                result: tfToxicityResult.toxicity,
                toxicityReason: tfToxicityResult.reason
            })
        })    
    }
}

function tfToxicityMessage(messageDoc, io, roomId) {
    const messageId = messageDoc._id;
    if (messageDoc) {
        checkTfToxicity(messageDoc.message).then(tfToxicityResult =>{
            if (tfToxicityResult.toxicity) {
                AutoRemoveMessage(
                    tfToxicityResult.toxicity,
                    tfToxicityResult.reason,
                    messageId,
                    io,
                    roomId
                );
            }
        }
        );
    }
}

export default {
    tfToxicityMessage,
    tfToxicityQuestion
};
