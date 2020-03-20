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
let similarityClusterCounter = 0; // Global variable to store similarity cluster number
let loadMemory = false;

function resumeMemory() {
    Questions
        .findAllQuestions()
        .then(docs => {
            const clusterQueue = [];
            for (let i = 1; i < docs.length; i += 1) {
                let clusterflag = false;
                const {_id, question, sessionId,  sentenceCode, relaventWeight, clusterNumber} = docs[i];
                for (let j = 0; j < clusterQueue.length && !clusterflag; j += 1) {
                    if (clusterNumber === clusterQueue[j] && clusterNumber !== 0) {
                        clusterflag = true;
                        dataset[j].push({
                            'string' : question, 
                            '_id': _id,
                            'sessionId': sessionId,
                            'value': sentenceCode,
                            'weight': relaventWeight,
                            'similarityCluster': clusterNumber
                        });
                    }
                }
                if (!clusterflag) {
                    clusterQueue.push(clusterNumber);
                    if (clusterNumber > similarityClusterCounter) { similarityClusterCounter = clusterNumber }
                    dataset.push([{
                        'string' : question, 
                        '_id': _id,
                        'sessionId': sessionId,
                        'value': sentenceCode,
                        'weight': relaventWeight,
                        'similarityCluster': clusterNumber
                    }]);
                }
            }
            // eslint-disable-next-line no-console
            // console.log('Final dataset:');
            // eslint-disable-next-line no-console
            // console.log(dataset);
        });
}

// Load memory only once.
if(!loadMemory){
    resumeMemory()
    loadMemory = true;
}

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
            if(tfToxicityResult.toxicity){
                console.log("the tf Toxicity Result is ")
                console.log(tfToxicityResult)
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

async function tfUseQuestion(questionDoc,sessionId) {
    let insertedFlag = false;
    const questionCode = await USEGenerater(questionDoc.question);
    Questions.updateQuestionSentenceCode({
        questionId: questionDoc._id,
        sentenceCode: questionCode
    });
    for (let i = 0; i < dataset.length && insertedFlag === false; i += 1) { 
        // for each cluster, check similarity between each center question and incoming question
        let productResult = math.dot(dataset[i][0].value,questionCode);
        if (productResult > similarityThreshold) {
            insertedFlag = true; // set flag to jump out the loop
            let questionWeight = 0;
            let clusterNumber = 0;
            let centerQuestionId = null;
            let subId = [];
            for (let j = 0; j < dataset[i].length; j += 1) { 
                // for each sentence in the same cluster, renew the weight, then set self weight
                productResult = math.dot(dataset[i][j].value, questionCode);
                dataset[i][j].weight += productResult;
                questionWeight += productResult;
                Questions.updateQuestionRelaventWeight({
                    questionId: dataset[i][j]._id, 
                    relaventWeight: dataset[i][j].weight 
                });
            }
            Questions.updateQuestionRelaventWeight({
                questionId: questionDoc._id, 
                relaventWeight: questionWeight
            });
            // add question to memory for quick operation
            dataset[i].push({
                'string' : questionDoc.question, 
                '_id': questionDoc._id,
                'sessionId': sessionId,
                'value': questionCode,
                'weight': questionWeight,
                'similarityCluster': clusterNumber
            });
            if (dataset[i].length === 2) {
                // when a cluster has two questions, it means a new cluster generated, renew both 
                similarityClusterCounter += 1;
                clusterNumber = similarityClusterCounter; 
                centerQuestionId = questionDoc._id;
                subId = [dataset[i][0]._id];
                // change database and socket-io dataset
                Questions.updateClusterNumber({
                    'questionId': centerQuestionId,
                    clusterNumber
                })
                ioInterface
                    .io()
                    .of('/questions')
                    .to(sessionId)
                    .emit('updateClusterNumber', centerQuestionId,clusterNumber)  
                Questions.updateClusterNumber({
                    'questionId': dataset[i][0]._id,
                    clusterNumber
                })
                ioInterface
                    .io()
                    .of('/questions')
                    .to(sessionId)
                    .emit('updateClusterNumber', dataset[i][0]._id,clusterNumber)  
                Questions.updateIsCenter({
                    'questionId': centerQuestionId,
                    'isCenter': true
                })
                ioInterface
                    .io()
                    .of('/questions')
                    .to(sessionId)
                    .emit('updateIsCenter', centerQuestionId,true)
                Questions.updateIsCenter({
                    'questionId': dataset[i][0]._id,
                    'isCenter': false
                })    
                ioInterface
                    .io()
                    .of('/questions')
                    .to(sessionId)
                    .emit('updateIsCenter',dataset[i][0]._id, false);  
                // change memory dataset
                dataset[i][0].similarityCluster = clusterNumber;
                dataset[i][1].similarityCluster = clusterNumber;
                // when a cluster a two question, suppose 2rd is center
                dataset[i] = [dataset[i][1], dataset[i][0]];
            } else {
                // when a cluster has three or more questions, unlock center question -> sort -> lock new center question 
                clusterNumber = dataset[i][0].similarityCluster;
                // change memory dataset
                dataset[i][dataset[i].length-1].similarityCluster = clusterNumber;
                // change database and socket-io dataset
                Questions.updateClusterNumber({
                    'questionId': questionDoc._id,
                    clusterNumber
                })
                ioInterface
                    .io()
                    .of('/questions')
                    .to(sessionId)
                    .emit('updateClusterNumber', questionDoc._id,clusterNumber)
                Questions.updateIsCenter({
                    'questionId': dataset[i][0]._id,
                    'isCenter': false
                })
                ioInterface
                    .io()
                    .of('/questions')
                    .to(sessionId)
                    .emit('updateIsCenter',dataset[i][0]._id,false)
                // sort the questions by weight from high to low
                dataset[i].sort(function(first, second){
                    return second.weight - first.weight;
                });
                centerQuestionId = dataset[i][0]._id;
                Questions.updateIsCenter({
                    'questionId': centerQuestionId,
                    'isCenter': true
                })
                ioInterface
                    .io()
                    .of('/questions')
                    .to(sessionId)
                    .emit('updateIsCenter',centerQuestionId,true)
                for (let j = 1; j < dataset[i].length; j += 1) {
                    subId.push(dataset[i][j]._id);
                }
            }
            // not sure how to use similarity table
            Similarity.updateSimilarityCluster({
                'clusterId': clusterNumber,
                'centerQuestionId': centerQuestionId,
                'subId': subId
            })
        }
        // eslint-disable-next-line no-console
        // console.log('Final dataset:');
        // eslint-disable-next-line no-console
        // console.log(dataset);
    }
    // if the dataset is empty or there is no similar question, create a new cluster with cluster #0
    if (insertedFlag === false) {
        // not sure how to use similarity table
        Similarity
            .createSimilarityCluster({
                'centerQuestionId': questionDoc._id,
                'subId': []
            })
            .then(() => {
                dataset.push([{
                    'string' : questionDoc.question, 
                    '_id': questionDoc._id,
                    'sessionId': sessionId,
                    'value': questionCode,
                    'weight': 0,
                    'similarityCluster': 0
                }]);
                // eslint-disable-next-line no-console
                // console.log('Final dataset:');
                // eslint-disable-next-line no-console
                // console.log(dataset);
            })
        Questions.updateIsCenter({
            'questionId': questionDoc._id,
            'isCenter': true
        })
        ioInterface
            .io()
            .of('/questions')
            .to(sessionId)
            .emit('updateIsCenter', questionDoc._id,true)  
    }
}

export default {
    tfToxicityMessage,
    tfToxicityQuestion,
    tfUseQuestion
};
