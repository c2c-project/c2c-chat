import { ObjectID } from 'mongodb';
import { mongo } from '..';

const findById = id =>
    mongo.then(db =>
        db
            .collection('questions')
            .find({ _id: new ObjectID(id) })
            .toArray()
            .then(x => x[0])
    );

const findBySession = ({ sessionId }) =>
    mongo.then(db =>
        db
            .collection('questions')
            .find({ sessionId })
            .toArray()
    );

const createQuestion = ({
    question,
    sessionId,
    username,
    userId,
    toxicity,
    toxicityReason,
    sentenceCode,
    relaventWeight,
    similarity,
    similarityCluster,
    weight,
}) =>
    mongo.then(db =>
        db.collection('questions').insertOne({
            question,
            sessionId,
            username,
            userId,
            toxicity,
            toxicityReason,
            sentenceCode,
            relaventWeight,
            similarity,
            similarityCluster,
            weight,
        })
    );
// 193

const removeQuestion = ({ questionId, reason }) =>
    mongo.then(
        db =>
            db.collection('questions').updateOne(
                {
                    _id: new ObjectID(questionId)
                },
                { $set: { moderated: true, reason } }
            )
        // close();
    );

const updateQuestionToxicity = ({ questionId, result, toxicityReason }) =>
    mongo.then(db => {
        db.collection('questions').updateOne(
            { _id: questionId },
            { $set: { toxicity: result, toxicityReason } }
        );
        // close();
    });

const updateQuestionSentenceCode = ({ questionId, sentenceCode }) =>
    mongo.then(db => {
        db.collection('questions').updateOne(
            { _id: questionId },
            { $set: { sentenceCode } }
        );
        // close();
    });

const updateQuestionRelaventWeight = ({ questionId, relaventWeight }) =>
    mongo.then(db => {
        db.collection('questions').updateOne(
            { _id: questionId },
            { $set: { relaventWeight } }
        );
        // close();
    });

// TODO: 193
/**
 * Read the comment in chat.js first; I haven't created privileged actions for questions.js yet.
 */

export default {
    findById,
    createQuestion,
    findBySession,
    removeQuestion,
    updateQuestionToxicity,
    updateQuestionSentenceCode,
    updateQuestionRelaventWeight
};
