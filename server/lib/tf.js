import '@tensorflow/tfjs-node';
import * as toxicity from '@tensorflow-models/toxicity';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as math from 'mathjs';
import Chat from '../db/collections/chat';
import Questions from '../db/collections/questions';
import Similarity from '../db/collections/similarity';
import ioInterface from './socket-io';
const dataset = []; // Similarity storage
const toxicityThreshold = 0.9; // Will be change if the toxicity test is too sensitive.
const similarityThreshold = 0.5; // Will be change if the similarity test is too sensitive.
const toxicityLoad = toxicity.load(toxicityThreshold);// load toxicity 
const useLoad = use.load(); // Load universal sentence encoder

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

function tfToxicityQuestion(questionDoc,sessionId ) {
    if (questionDoc) {
        checkTfToxicity(
            questionDoc.question
        ).then(tfToxicityResult =>{
            Questions
                .updateQuestionToxicity({
                    questionId: questionDoc._id,
                    result: tfToxicityResult.toxicity,
                    toxicityReason: tfToxicityResult.reason
                });
            if(tfToxicityResult){
                ioInterface
                    .io()
                    .of('/questions')
                    .to(sessionId)
                    .emit('updateToxicity', questionDoc._id);   
            }
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

function USEGenerater(sentence) {
    return new Promise( function(resolve) {
        let data = [];
        useLoad
            .then( model => {
                // Embed an array of sentences. 
                model.embed(sentence).then( embeddings => { 
                    // `embeddings` is a 2D tensor consisting of the 512-dimensional embeddings for each sentence. 
                    // So in this example `embeddings` has the shape [2, 512]. 
                    data = embeddings.arraySync();
                    resolve(data[0]);
                });
            })
            .catch(function(exception) {
                // eslint-disable-next-line no-console
                console.error(`Tf-Universal sentence encoder fail: ${  exception.message}`);
            });
    });
}

async function tfUseQuestion(questionDoc) {
    let inserted = false;
    const questionCode = await USEGenerater(questionDoc.question);
    Questions.updateQuestionSentenceCode({
        questionId: questionDoc._id, 
        sentenceCode: questionCode
    });
    for (let i = 0; i < dataset.length && inserted === false; i += 1) { 
        // for each cluster, check similarity between each leader question and incoming question
        let productrResult = math.dot(dataset[i][0].value,questionCode);
        if (productrResult > similarityThreshold) {
            inserted = true; // flag to jump out the loop
            let questionWeight = 0;
            const clusterId = dataset[i][0].similarityCluster;
            let centerQuestionId = null;
            let subId = [];
            for (let j = 0; j < dataset[i].length; j += 1) { 
                // for each sentence in the same cluster, renew the weight
                productrResult = math.dot(dataset[i][j].value, questionCode);
                dataset[i][j].weight += productrResult;
                questionWeight += productrResult;
                Questions.updateQuestionRelaventWeight({
                    questionId: dataset[i][j]._id, 
                    relaventWeight: dataset[i][j].weight 
                });
            }
            Questions.updateQuestionRelaventWeight({
                questionId: questionDoc._id, 
                relaventWeight: questionWeight
            });
            dataset[i].push({
                'string' : questionDoc.question, 
                '_id': questionDoc._id,
                'value': questionCode,
                'weight': questionWeight,
                'similarityCluster': clusterId
            });
            // sort the questions by weight from high to low
            if (dataset[i].length === 2) {
                centerQuestionId = dataset[i][1]._id;
                subId = [dataset[i][0]._id];
            } else {
                dataset[i].sort(function(first, second){
                    return second.weight - first.weight;
                });
                centerQuestionId =  dataset[i][0]._id;
                for (let j = 1; j < dataset[i].length; j += 1) {
                    subId.push(dataset[i][j]._id);
                }
            }
            Similarity.updateSimilarityCluster({
                'clusterId': clusterId,
                'centerQuestionId': centerQuestionId,
                'subId': subId
            })
        }
        // eslint-disable-next-line no-console
        console.log('Final dataset:');
        // eslint-disable-next-line no-console
        console.log(dataset);
    }
    // if the dataset is empty or there is no similar question, create a new cluster
    if (inserted === false) {
        Similarity
            .createSimilarityCluster({
                'centerQuestionId': questionDoc._id,
                'subId': []
            })
            .then(r => {
                dataset.push([{
                    'string' : questionDoc.question, 
                    '_id': questionDoc._id,
                    'value': questionCode,
                    'weight': 0,
                    'similarityCluster': r.ops[0]._id
                }]);
                // eslint-disable-next-line no-console
                console.log('Final dataset:');
                // eslint-disable-next-line no-console
                console.log(dataset);
            })
    }
}

export default {
    tfToxicityMessage,
    tfToxicityQuestion,
    tfUseQuestion
};
