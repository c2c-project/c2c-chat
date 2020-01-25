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

const createQuestion = ({ question, sessionId, username, userId }) =>
    mongo.then(db =>
        db
            .collection('questions')
            .insertOne({ question, sessionId, username, userId })
    );

// TODO: joseph
/**
 *  read comment in chat.js first & do something similar here
 */

// TODO: 193
/**
 * Read the comment in chat.js first; I haven't created privileged actions for questions.js yet.
 */

export default {
    findById,
    createQuestion,
    findBySession
};
