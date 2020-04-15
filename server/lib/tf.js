import '@tensorflow/tfjs-node';
import * as toxicity from '@tensorflow-models/toxicity';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as math from 'mathjs';
import Messages from '../db/collections/messsages';
import Questions from '../db/collections/questions';
import ioInterface from './socket-io';

/**
 * A question
 * @typedef {Object} Question
 * @property {string} string -- content of question
 * @property {ObjectId} _id -- question database id
 * @property {number} sessionId -- sesstion id which question asked
 * @property {array} value -- USE array value, 512 numbers
 * @property {double} weight -- relavent weight in its cluster, center question has the most weight
 * @property {integer} similarityCluster -- cluster number its belongs to
 */

/**
 * Similarity dataset storage
 * @type {Array.<Array.<Array.<Question>>>} -- 3D array, 1. array of sessions; 2. array of clusters; 3. array of 'Questions'
 */
const dataset = [];

/**
 * Default value is 0.9, will be change if the toxicity test is too sensitive.
 * @type {number}
 */
const toxicityThreshold = 0.9;

/**
 * Default value is 0.85, will be change if the similarity test is too sensitive, recommend 0.5 when testing.
 * @type {number}
 */
const similarityThreshold = 0.85; 

/**
 * Load toxicity when system start
 * @type {Promise<toxicity.ToxicityClassifier>}
 */
const toxicityLoad = toxicity.load(toxicityThreshold);

/**
 * Load universal sentence encoder when system start
 * @type {use.UniversalSentenceEncoder}
 */
const useLoad = use.load();

/**
 * Global variable to store similarity cluster number
 * @type {Array.<number>}
 */
const similarityClusterCounter = [];

/**
 * A flag to load questions from database
 * @type {boolean}
 */
let loadMemory = false;

/**
 * Reload questions form databse for identify similarity purpose
 * @param {void}
 * @returns {void}
 */
function resumeMemory() {
    Questions
        .findAllQuestions()
        .then(docs => {
            /**
             * a backlog of which cluster has been visited
             * @type {Array.<number>}
             */
            const clusterQueue = [];
            for (let i = 0; i < docs.length; i += 1) {
                /**
                 * default is false, if the cluster id not found, create a cluster
                 * @type {boolean}
                 */
                let clusterflag = false;
                /**
                 * default is false, if the session id not found, create a session
                 * @type {boolean}
                 */
                let sessionFlag = false;
                /**
                 * if the session id found, save the iterator as a variable and insert a question in it
                 * @type {?number}
                 */
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

/**
 * Load memory if flag is false.
 * @param {boolean} loadMemory
 * @returns {void}
 */
if(!loadMemory){
    resumeMemory()
    loadMemory = true;
}

/**
 * Check the input question's toxicity
 * @param {string} question -- the string will test toxicity
 * @returns {boolean} boolean value tells the question is toxicity or not
 * @returns {Array.<string>} array tells the toxicity reasons 
 */
function checkTfToxicity(question) {
    return new Promise(function(resolve) {
        /**
         * record the test result of tf API
         * @type {Object.<string, boolean>}
         */
        const toxicityResult = {};
        /**
         * if value is true, save it's key to an array as toxicity reason 
         * @type {Array.<string>}
         */
        const toxicityReason = [];
        /**
         * default is false, assigned to true if any toxicity reason is true
         */
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

/**
 * the function called when message toxicity reauslt is true, auto remove message on user interface
 * @param {boolean} result 
 * @param {Array.<string>} reason 
 * @param {number} messageId 
 * @param {ioInterface} io 
 * @param {number} roomId 
 * @returns {void}
 */
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

/**
 * The interface function to test the question toxicity
 * @param {Object} questionDoc 
 * @param {number} sessionId 
 * @returns {void}
 */
function tfToxicityQuestion(questionDoc, sessionId) {
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

/**
 * The interface function to test the message toxicity
 * @param {Object} messageDoc 
 * @param {ioInterface} io 
 * @param {number} roomId 
 * @returns {void}
 */
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


/**
 * generate a universal sentence encoder result by tf API
 * @param {string} sentence 
 * @returns {Array.<number>}
 */
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

/**
 * The interface function to test the question similarity
 * @param {Object} questionDoc 
 * @param {number} sessionId 
 * @returns {void}
 */
async function tfUseQuestion(questionDoc,sessionId) {
    /**
     * default is false, if the question have a similar cluster, assigned to true
     * @type {boolean}
     */
    let insertedFlag = false;
    /**
     * default is false, if the session id not found, create a session
     * @type {boolean}
     */
    let sessionFlag = false;
    /**
     * if the session id found, save the iterator as a variable and insert a question in it
     * @type {?number}
     */
    let relaventSessionId = null;
    /**
     * an array of float numbers to represent the question content
     * @type {Array.<number>}
     */
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
            /**
             * the similarity result of two sentences, in range [0, 1]
             * @type {number}
             */
            let productResult = math.dot(dataset[relaventSessionId][i][0].value,questionCode);
            if (productResult > similarityThreshold) {
                insertedFlag = true; // set flag to jump out the loop
                /**
                 * default is 0, a sum of dot product with each question in the same cluster, the result is the weight of question
                 * @type {number}
                 */
                let questionWeight = 0;
                /**
                 * default is 0, a number represent the question similarity cluster id
                 * @type {number}
                 */
                let clusterNumber = 0;
                /**
                 * default is null, represent an id of the center question of a cluster
                 * @type {?boolean}
                 */
                let centerQuestionId = null;
                /**
                 * record the id of the non-center questions of a cluster
                 * @type {Array.<number>}
                 */
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
