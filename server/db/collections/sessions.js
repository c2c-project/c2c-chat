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
    privilegedActions
};
