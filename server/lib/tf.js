import '@tensorflow/tfjs-node';
import * as toxicity from '@tensorflow-models/toxicity';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as math from 'mathjs';
import Chat from '../db/collections/chat';
import Questions from '../db/collections/questions';

const dataset = []; // Similarity storage
const toxicityThreshold = 0.9; // Will be change if the toxicity test is too sensitive.
const similarityThreshold = 0.5; // Will be change if the similarity test is too sensitive.
const toxicityLoad = toxicity.load(toxicityThreshold);// load toxicity 
const useLoad = use.load(); // Load universal sentence encoder
let sentenceCounter = 0;

function checkTfToxicity(question) {
    return new Promise(function(resolve) {
        const toxicityResult = {};
        const toxicityReason = [];
        let result = false;
        toxicityLoad
            .then(model => {
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
            })
            .catch(function(exception) {
                // eslint-disable-next-line no-console
                console.error(`Tf-Toxicity classifier fail: ${  exception.message}`);
            })
    });
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

function tfToxicityQuestion(questionDoc) {
    if (questionDoc) {
        checkTfToxicity(
            questionDoc.question
        ).then(tfToxicityResult =>{
            Questions.updateQuestionToxicity({
                questionId: questionDoc._id,
                result: tfToxicityResult.toxicity,
                toxicityReason: tfToxicityResult.reason
            });
        });
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
        });
    }
}

async function USEGenerater(sentence) {
    let data = [];
    console.log('Incoming sentencec:')
    console.log(sentence);
    await useLoad.then(async model => {
        // Embed an array of sentences. 
        await model.embed(sentence).then(async embeddings => { 
            // `embeddings` is a 2D tensor consisting of the 512-dimensional embeddings for each sentence. 
            // So in this example `embeddings` has the shape [2, 512]. 
            data = await embeddings.arraySync();
        });
    });
    return data[0];
}

async function tfUseQuestion(questionDoc) {
    let inserted = false;
    const questionCode = await USEGenerater(questionDoc.question); // return USE value
    for (let i = 0; i < dataset.length && inserted === false; i += 1) { // for each cluster, check with leader question
        let productrResult = math.dot(dataset[i][0].value,questionCode);
        if (productrResult > similarityThreshold) { // if productrResult over 0.85, suppose they are similar
            inserted = true; // flag to jump out the loop
            let questionWeight = 0;
            for (let j = 0; j < dataset[i].length; j += 1) { // for each sentence in the same cluster, renew the weight
                productrResult = math.dot(dataset[i][j].value, questionCode);
                dataset[i][j].weight += productrResult;
                questionWeight += productrResult;
            }
            dataset[i].push({
                'string' : questionDoc.question, 
                'id': sentenceCounter.toString(),
                'value':questionCode,
                'weight':questionWeight
            });
            sentenceCounter += 1;
            dataset[i].sort(function(first, second){
                return second.weight - first.weight;
            });
        }
    }
    if (inserted === false) {
        dataset.push([{
            'string' : questionDoc.question, 
            'id': sentenceCounter.toString(),
            'value':questionCode,
            'weight':0
        }]);
        sentenceCounter += 1;
    }
    // eslint-disable-next-line no-console
    console.log('Final dataset:');
    // eslint-disable-next-line no-console
    console.log(dataset);
}

export default {
    tfToxicityMessage,
    tfToxicityQuestion,
    tfUseQuestion
};
