import { ObjectID } from 'mongodb';
import { mongo } from '..';
import Accounts from '../../lib/accounts';
import { ClientError } from '../../lib/errors';

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

const findAllQuestions = () =>
    mongo.then(db =>
        db
            .collection('questions')
            .find()
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
    isCenter,
    clusterNumber,
    asked, 
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
            isCenter,
            clusterNumber, 
            asked,
            date: Date.now(),
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

const updateQuestionAsked = ({ questionId, asked}) =>
    mongo.then(db => {
        db.collection('questions').updateOne(
            { _id: new ObjectID(questionId) },
            { $set: { asked} }
        );
        // close();
    });

const updateIsCenter = ({ questionId, isCenter}) =>
    mongo.then(db => {
        db.collection('questions').updateOne(
            { _id: new ObjectID(questionId) },
            { $set: { isCenter} }
        );
        // close();
    });

const updateClusterNumber = ({ questionId, clusterNumber}) =>
    mongo.then(db => {
        db.collection('questions').updateOne(
            { _id: new ObjectID(questionId) },
            { $set: { clusterNumber} }
        );
        // close();
    });

const privilegedActions = (action, userDoc) => {
    const { roles } = userDoc;
    switch (action) {
        case 'QUESTION_HISTORY': {
            const requiredAny = ['moderator', 'admin'];
            return sessionId => {
                if (Accounts.isAllowed(roles, { requiredAny })) {
                    return findBySession({ sessionId });
                }
                return Promise.reject(
                    new ClientError('Missing permissions to do that.')
                );
            };
        }
        default: {
            throw new TypeError('Invalid Action');
        }
    }
};

export default {
    findById,
    createQuestion,
    findBySession,
    findAllQuestions,
    removeQuestion,
    updateQuestionToxicity,
    updateQuestionSentenceCode,
    updateQuestionRelaventWeight,
    updateQuestionAsked,
    updateIsCenter,
    updateClusterNumber,
    privilegedActions
};
