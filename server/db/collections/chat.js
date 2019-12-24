import { mongo } from '..';

const addMessage = ({ message, user, session }) => {
    mongo.then(db => {
        db.collection('messages').insertOne({
            message,
            userId: user,
            sessionId: session
        });
        // close();
    });
};

const removeMessage = ({ messageId, reason }) => {
    mongo.then(db => {
        db.collection('messages').updateOne(
            {
                _id: messageId
            },
            { $set: { moderated: true, reason } }
        );
        // close();
    });
};

const updateMessage = ({ messageId, message }) => {
    mongo.then(db => {
        db.collection('messages').updateOne(
            { _id: messageId },
            { $set: message }
        );
        // close();
    });
};

const findMessages = ({ sessionId }) =>
    mongo.then(db =>
        db
            .collection('messages')
            .find({ sessionId })
            .toArray()
    );

export default {
    addMessage,
    removeMessage,
    updateMessage,
    findMessages
};
