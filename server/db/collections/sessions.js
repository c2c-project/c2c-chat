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

const addSession = ({ speaker, moderator, description, date }) =>
    mongo.then(db =>
        db
            .collection('sessions')
            .insertOne({ speaker, moderator, description, date })
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

// const privilegedActions = (action, userDoc) => {
//     const { roles } = userDoc;
//     switch (action) {
//         case 'SET_QUESTION': {
//             const requiredAny = ['admin', 'moderator'];
//             return (sessionId, questionId) => {
//                 if (Accounts.isallowed(roles, { requiredAny })) {
//                     return updateSession();
//                 }
//             };
//         }
//     }
// };

export default {
    findAllSessions,
    findSessionById,
    addSession,
    removeSession,
    updateSession
};
