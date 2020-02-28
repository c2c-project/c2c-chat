import { ObjectID } from 'mongodb';
import { mongo } from '..';
import Accounts from '../../lib/accounts';

const findAllSessions = () =>
    mongo.then(db =>
        db
            .collection('sessions')
            .find()
            .toArray()
    );

// TODO: joseph
/**
 * I think you should only need to use this to get basic session data
 * such as speaker, date & time, and I will eventually be storing duration in the session document too
 * if that changes I will let you know
 */
const findSessionById = id =>
    mongo.then(db =>
        db
            .collection('sessions')
            .find({ _id: new ObjectID(id) })
            .toArray()
            .then(x => x[0])
    );

const addSession = ({ speaker, moderator, description, date, url }) =>
    mongo.then(db =>
        db
            .collection('sessions')
            .insertOne({ speaker, moderator, description, date, url })
    );

const removeSession = ({ sessionId }) =>
    mongo.then(db =>
        db.collection('sessions').remove({ _id: new ObjectID(sessionId) })
    );

const updateSession = ({ sessionId, changes }) =>
    mongo.then(db =>
        db
            .collection('sessions')
            .updateOne({ _id: new ObjectID(sessionId) }, { $set: changes })
    );
////
const updateSessionClips = ({ sessionId, changes }) =>
    mongo.then(db =>
        db
            .collection('sessions')
            .updateOne({ _id: new ObjectID(sessionId) }, { $set: { clips: changes }}, {upsert: true})
    );
////
const privilegedActions = (action, userDoc) => {
    const { roles } = userDoc;
    switch (action) {
        case 'SET_QUESTION': {
            const requiredAny = ['admin', 'moderator'];
            return (sessionId, question) => {
                if (Accounts.isAllowed(roles, { requiredAny })) {
                    return mongo.then(db =>
                        db.collection('sessions').updateOne(
                            { _id: new ObjectID(sessionId) },
                            {
                                $push: {
                                    questionHistory: {
                                        ...question,
                                        timestamp: new Date()
                                    }
                                }
                            }
                        )
                    );
                }
                console.log(
                    'TODO:  not allowed but trying to set the question'
                );
                return Promise.reject(Error('Not allowed'));
            };
        }
        default: {
            throw new TypeError('Invalid action');
        }
    }
};

export default {
    findAllSessions,
    findSessionById,
    addSession,
    removeSession,
    updateSession,
    updateSessionClips,
    privilegedActions
};
