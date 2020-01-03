import { ObjectID } from 'mongodb';
import { mongo } from '..';
import Accounts from '../../lib/accounts';

/* DB LEVEL CRUD */
const addMessage = ({ message, userId, username, session }) =>
    mongo.then(
        db =>
            db.collection('messages').insertOne({
                message,
                userId,
                username,
                sessionId: session
            })
        // close();
    );

const removeMessage = ({ messageId, reason }) =>
    mongo.then(
        db =>
            db.collection('messages').updateOne(
                {
                    _id: new ObjectID(messageId)
                },
                { $set: { moderated: true, reason } }
            )
        // close();
    );

const updateMessage = ({ messageId, message }) =>
    mongo.then(db => {
        db.collection('messages').updateOne(
            { _id: messageId },
            { $set: message }
        );
        // close();
    });

const findMessages = ({ sessionId }) =>
    mongo.then(db =>
        db
            .collection('messages')
            .find({ sessionId })
            .toArray()
    );

/**
 * Actions that a non-owner may take and the permissions required to do so
 */
const privilegedActions = (action, userDoc) => {
    const { roles } = userDoc;
    switch (action) {
        case 'REMOVE_MESSAGE': {
            const requiredAny = ['admin', 'moderator'];
            return messageId => {
                if (Accounts.isAllowed(roles, { requiredAny })) {
                    return removeMessage({
                        messageId,
                        reason: 'Removed by moderator'
                    });
                }
                console.log('TODO:  not allowed but trying to moderate');
                return Promise.reject(Error('Not allowed'));
            };
        }
        default: {
            throw new TypeError('Invalid action');
        }
    }
};

export default {
    addMessage,
    removeMessage,
    updateMessage,
    findMessages,
    privilegedActions
};
