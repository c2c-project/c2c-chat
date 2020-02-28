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
let sentenceCounter = 0; // Global variable to store sentence number
let similarityClusterCounter = 0; // Global variable to store similarity cluster number

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
    for (let i = 0; i < dataset.length && inserted === false; i += 1) { 
        // for each cluster, check similarity between each leader question and incoming question
        let productrResult = math.dot(dataset[i][0].value,questionCode);
        if (productrResult > similarityThreshold) {
            inserted = true; // flag to jump out the loop
            let questionWeight = 0;
            let clusterNumber = 0;
            for (let j = 0; j < dataset[i].length; j += 1) { 
                // for each sentence in the same cluster, renew the weight
                productrResult = math.dot(dataset[i][j].value, questionCode);
                dataset[i][j].weight += productrResult;
                questionWeight += productrResult;
                Questions.updateQuestionWeight({
                    questionId: dataset[i][j]._id,
                    weight: dataset[i][j].weight
                });
            } 
            // renew the incoming question weight
            Questions.updateQuestionWeight({
                questionId: questionDoc._id,
                weight: questionWeight
            });
            if (dataset[i].length === 1) { 
                // Every cluster with 2 questions are significent (from non-similarity to similarity cluster).
                // The length is 1 because the question has not been inserted to memory.
                similarityClusterCounter += 1;
                clusterNumber = similarityClusterCounter; 
                dataset[i][0].similarityCluster = similarityClusterCounter;
                Questions.updateQuestionSimilarity({
                    questionId: questionDoc._id,
                    similarity: true,
                    similarityCluster: clusterNumber
                });
                Questions.updateQuestionSimilarity({
                    questionId: dataset[i][0]._id,
                    similarity: true,
                    similarityCluster: clusterNumber
                });
            }else{
                // if the third or more questions join into the cluster, get the peer cluster number
                clusterNumber = dataset[i][0].similarityCluster; 
                Questions.updateQuestionSimilarity({
                    questionId: questionDoc._id,
                    similarity: true,
                    similarityCluster: clusterNumber
                });
            }
            dataset[i].push({
                'string' : questionDoc.question, 
                '_id': questionDoc._id,
                'id': sentenceCounter.toString(),
                'value': questionCode,
                'weight': questionWeight,
                'similarityCluster': clusterNumber
            });
            sentenceCounter += 1;
            // sort the questions by weight from high to low
            dataset[i].sort(function(first, second){
                return second.weight - first.weight;
            });
        }
    }
    // if the dataset is empty or there is no similar question, create a new cluster
    if (inserted === false) {
        dataset.push([{
            'string' : questionDoc.question, 
            '_id': questionDoc._id,
            'id': sentenceCounter.toString(),
            'value': questionCode,
            'weight': 0,
            'similarityCluster': null
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
