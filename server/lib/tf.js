import '@tensorflow/tfjs-node';
import * as toxicity from '@tensorflow-models/toxicity';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as math from 'mathjs';
import Messages from '../db/collections/messsages';
import Questions from '../db/collections/questions';
import ioInterface from './socket-io';

const dataset = []; // Similarity storage
const toxicityThreshold = 0.9; // Will be change if the toxicity test is too sensitive.
const similarityThreshold = 0.85; // Will be change if the similarity test is too sensitive, recommend 0.5 for testing and 0.85 for using.
const toxicityLoad = toxicity.load(toxicityThreshold);// load toxicity 
const useLoad = use.load(); // Load universal sentence encoder
const similarityClusterCounter = []; // Global variable to store similarity cluster number
let loadMemory = false;

function resumeMemory() {
    Questions
        .findAllQuestions()
        .then(docs => {
            const clusterQueue = [];
            for (let i = 0; i < docs.length; i += 1) {
                let clusterflag = false;
                let sessionFlag = false;
                let relaventSessionId = null;
                const {_id, question, sessionId,  sentenceCode, relaventWeight, clusterNumber} = docs[i];
                for (let k = 0; k < dataset.length && dataset.length !== 0; k += 1) {
                    // check with dataset ith sesstion, first cluster, first sentence's sesstion id
                    if (sessionId === dataset[k][0][0].sessionId) {
                        sessionFlag = true;
                        relaventSessionId = k;
                    }
                }
                if (sessionFlag) {
                    for (let j = 0; j < clusterQueue[relaventSessionId].length && !clusterflag; j += 1) {
                        if (clusterNumber === clusterQueue[relaventSessionId][j] && clusterNumber !== 0) {
                            clusterflag = true;
                            dataset[relaventSessionId][j].push({
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
                        clusterQueue[relaventSessionId].push(clusterNumber);
                        if (clusterNumber > similarityClusterCounter[relaventSessionId]) { 
                            similarityClusterCounter[relaventSessionId] = clusterNumber 
                        }
                        dataset[relaventSessionId].push([{
                            'string' : question, 
                            '_id': _id,
                            'sessionId': sessionId,
                            'value': sentenceCode,
                            'weight': relaventWeight,
                            'similarityCluster': clusterNumber
                        }]);
                    }
                } else {
                    clusterQueue.push([clusterNumber]);
                    similarityClusterCounter.push(clusterNumber);
                    dataset.push([[{
                        'string' : question, 
                        '_id': _id,
                        'sessionId': sessionId,
                        'value': sentenceCode,
                        'weight': relaventWeight,
                        'similarityCluster': clusterNumber
                    }]]);
                }
            }
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
    Messages.updateMessageToxicity({
        messageId,
        result,
        toxicityReason: reason
    });
    const removeMessage = Messages.privilegedActions('AUTO_REMOVE_MESSAGE', '');
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
                ioInterface
                    .of('/questions')
                    .to(sessionId)
                    .emit('update-toxicity', questionDoc._id);   
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
    let sessionFlag = false;
    let relaventSessionId = null;
    const questionCode = await USEGenerater(questionDoc.question);
    Questions.updateQuestionSentenceCode({
        questionId: questionDoc._id,
        sentenceCode: questionCode
    });
    for (let i = 0; i < dataset.length && dataset.length !== 0; i += 1) {
        // check with dataset ith sesstion, first cluster, first sentence's sesstion id
        if (sessionId === dataset[i][0][0].sessionId) {
            sessionFlag = true;
            relaventSessionId = i;
        }
    }
    if (sessionFlag) {
        for (let i = 0; i < dataset[relaventSessionId].length && insertedFlag === false; i += 1) { 
            // for each cluster, check similarity between each center question and incoming question
            let productResult = math.dot(dataset[relaventSessionId][i][0].value,questionCode);
            if (productResult > similarityThreshold) {
                insertedFlag = true; // set flag to jump out the loop
                let questionWeight = 0;
                let clusterNumber = 0;
                let centerQuestionId = null;
                let subId = [];
                for (let j = 0; j < dataset[relaventSessionId][i].length; j += 1) { 
                    // for each sentence in the same cluster, renew the weight, then set self weight
                    productResult = math.dot(dataset[relaventSessionId][i][j].value, questionCode);
                    dataset[relaventSessionId][i][j].weight += productResult;
                    questionWeight += productResult;
                    Questions.updateQuestionRelaventWeight({
                        questionId: dataset[relaventSessionId][i][j]._id, 
                        relaventWeight: dataset[relaventSessionId][i][j].weight 
                    });
                }
                Questions.updateQuestionRelaventWeight({
                    questionId: questionDoc._id, 
                    relaventWeight: questionWeight
                });
                // add question to memory for quick operation
                dataset[relaventSessionId][i].push({
                    'string' : questionDoc.question, 
                    '_id': questionDoc._id,
                    'sessionId': sessionId,
                    'value': questionCode,
                    'weight': questionWeight,
                    'similarityCluster': clusterNumber
                });
                if (dataset[relaventSessionId][i].length === 2) {
                    // when a cluster has two questions, it means a new cluster generated, renew both 
                    similarityClusterCounter[relaventSessionId] += 1;
                    clusterNumber = similarityClusterCounter[relaventSessionId]; 
                    centerQuestionId = questionDoc._id;
                    subId = [dataset[relaventSessionId][i][0]._id];
                    // change database and socket-io dataset
                    Questions.updateClusterNumber({
                        'questionId': centerQuestionId,
                        clusterNumber
                    })
                    ioInterface
                        .of('/questions')
                        .to(sessionId)
                        .emit('update-cluster-number', centerQuestionId,clusterNumber)  
                    Questions.updateClusterNumber({
                        'questionId': dataset[relaventSessionId][i][0]._id,
                        clusterNumber
                    })
                    ioInterface
                        .of('/questions')
                        .to(sessionId)
                        .emit('update-cluster-number', dataset[relaventSessionId][i][0]._id,clusterNumber)  
                    Questions.updateIsCenter({
                        'questionId': centerQuestionId,
                        'isCenter': true
                    })
                    ioInterface
                        .of('/questions')
                        .to(sessionId)
                        .emit('update-is-center', centerQuestionId,true)
                    Questions.updateIsCenter({
                        'questionId': dataset[relaventSessionId][i][0]._id,
                        'isCenter': false
                    })    
                    ioInterface
                        .of('/questions')
                        .to(sessionId)
                        .emit('update-is-center',dataset[relaventSessionId][i][0]._id, false);  
                    // change memory dataset
                    dataset[relaventSessionId][i][0].similarityCluster = clusterNumber;
                    dataset[relaventSessionId][i][1].similarityCluster = clusterNumber;
                    // when a cluster a two question, suppose 2rd is center
                    dataset[relaventSessionId][i] = [dataset[relaventSessionId][i][1], dataset[relaventSessionId][i][0]];
                } else {
                    // when a cluster has three or more questions, unlock center question -> sort -> lock new center question 
                    clusterNumber = dataset[relaventSessionId][i][0].similarityCluster;
                    // change memory dataset
                    dataset[relaventSessionId][i][dataset[relaventSessionId][i].length-1].similarityCluster = clusterNumber;
                    // change database and socket-io dataset
                    Questions.updateClusterNumber({
                        'questionId': questionDoc._id,
                        clusterNumber
                    })
                    ioInterface
                        .of('/questions')
                        .to(sessionId)
                        .emit('update-cluster-number', questionDoc._id,clusterNumber)
                    Questions.updateIsCenter({
                        'questionId': dataset[relaventSessionId][i][0]._id,
                        'isCenter': false
                    })
                    ioInterface
                        .of('/questions')
                        .to(sessionId)
                        .emit('update-is-center',dataset[relaventSessionId][i][0]._id,false)
                    // sort the questions by weight from high to low
                    dataset[relaventSessionId][i].sort(function(first, second){
                        return second.weight - first.weight;
                    });
                    centerQuestionId = dataset[relaventSessionId][i][0]._id;
                    Questions.updateIsCenter({
                        'questionId': centerQuestionId,
                        'isCenter': true
                    })
                    ioInterface
                        .of('/questions')
                        .to(sessionId)
                        .emit('update-is-center',centerQuestionId,true)
                    for (let j = 1; j < dataset[relaventSessionId][i].length; j += 1) {
                        subId.push(dataset[relaventSessionId][i][j]._id);
                    }
                }
            }
        }
        // if the dataset is empty or there is no similar question, create a new cluster with cluster #0
        if (insertedFlag === false) {
            dataset[relaventSessionId].push([{
                'string' : questionDoc.question, 
                '_id': questionDoc._id,
                'sessionId': sessionId,
                'value': questionCode,
                'weight': 0,
                'similarityCluster': 0
            }]);
            Questions.updateIsCenter({
                'questionId': questionDoc._id,
                'isCenter': true
            })
            ioInterface
                .of('/questions')
                .to(sessionId)
                .emit('update-is-center', questionDoc._id,true)  
        }
    } else {
        similarityClusterCounter.push(0);
        dataset.push([[{
            'string' : questionDoc.question, 
            '_id': questionDoc._id,
            'sessionId': sessionId,
            'value': questionCode,
            'weight': 0,
            'similarityCluster': 0
        }]]);
        Questions.updateIsCenter({
            'questionId': questionDoc._id,
            'isCenter': true
        })
        ioInterface
            .of('/questions')
            .to(sessionId)
            .emit('update-is-center', questionDoc._id,true) 
    }
}

export default {
    tfToxicityMessage,
    tfToxicityQuestion,
    tfUseQuestion
};
