import { mongo } from '..';

const findAllSessions = () =>
    mongo.then(db =>
        db
            .collection('sessions')
            .find()
            .toArray()
    );

const addSession = ({ speaker, moderator, description, date }) =>
    mongo.then(db =>
        db
            .collection('sessions')
            .insertOne({ speaker, moderator, description, date })
    );

const removeSession = ({ sessionId }) =>
    mongo.then(db => db.collection('sessions').remove({ _id: sessionId }));

const editSession = ({ sessionId, changes }) =>
    mongo.then(db =>
        db
            .collection('sessions')
            .updateOne({ _id: sessionId }, { $set: changes })
    );

export default {
    findAllSessions,
    addSession,
    removeSession,
    editSession
};
