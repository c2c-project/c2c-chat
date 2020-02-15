import { ObjectID } from 'mongodb';
import { mongo } from '..';
import Accounts from '../../lib/accounts';
import { ClientError } from '../../lib/errors';

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

const deleteSession = ({ sessionId }) =>
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
    const standardError = Promise.reject(
        new ClientError('Not allowed to do that!')
    );
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
                // TODO: log this properly?
                return standardError;
            };
        }
        case 'ADD_SESSION': {
            const requiredAny = ['admin', 'moderator'];
            return form => {
                const { speaker, moderator, description, date, url } = form;
                if (Accounts.isAllowed(roles, { requiredAny })) {
                    return addSession({
                        speaker,
                        moderator,
                        description,
                        date,
                        url
                    });
                }
                // TODO: log this properly?
                return standardError;
            };
        }
        case 'UPDATE_SESSION': {
            const requiredAny = ['admin', 'moderator'];
            return (sessionId, form) => {
                const { speaker, moderator, description, date, url } = form;
                if (Accounts.isAllowed(roles, { requiredAny })) {
                    return updateSession({
                        sessionId,
                        changes: { speaker, moderator, description, date, url }
                    });
                }
                return standardError;
            };
        }
        case 'DELETE_SESSION': {
            const requiredAny = ['admin', 'moderator'];
            return sessionId => {
                if (Accounts.isAllowed(roles, { requiredAny })) {
                    return deleteSession({ sessionId });
                }
                return standardError;
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
    deleteSession,
    updateSession,
    privilegedActions
};
