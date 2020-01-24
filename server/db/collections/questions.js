import { ObjectID } from 'mongodb';
import { mongo } from '..';
import Accounts from '../../lib/accounts';

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

const createQuestion = ({ question, sessionId, username, userId, toxicity, reason }) =>
    mongo.then(db =>
        db
            .collection('questions')
            .insertOne({ question, sessionId, username, userId, toxicity, reason  })
    );

const updateQuestionToxicity = ({ questionId, result, reason}) =>
    mongo.then(db => {
        db.collection('questions').updateOne(
            { _id: questionId },
            { $set: { 'toxicity': result, 'reason': reason}}
        );
        // close();
    });

// TODO: 193
/**
 * Read the comment in chat.js first; I haven't created privileged actions for questions.js yet.
 */
const privilegedActions = (action, userDoc) => {
    const { roles } = userDoc;
    switch (action) {
        default: {
            throw new TypeError('Invalid action');
        }
    }
};

export default {
    findById,
    createQuestion,
    findBySession,
    updateQuestionToxicity,
    privilegedActions
};
