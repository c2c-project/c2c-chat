import { ObjectID } from 'mongodb';
import { mongo } from '..';
import Accounts from '../../lib/accounts';

/* DB LEVEL CRUD */
const createMessage = ({ message, userId, username, session }) =>
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


// TODO: joseph
/**
 * make a new function called countMessagesBySession where you use mongodb's count https://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#countDocuments
 * look at other functions to get an idea of how to query the collection
 */

/**
 * Actions that a non-owner may take and the permissions required to do so
 */
const privilegedActions = (action, userDoc) => {
    // TODO: 193
    /**
     * This is where you'll "remove" (really it's just hidden) the toxic messages
     * If you've gotten to this point, you probably should just contact me and I'll help out.
     * This part is kinda specific my coding/how I coded privileged actions
     */
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
    createMessage,
    removeMessage,
    updateMessage,
    findMessages,
    privilegedActions
};
