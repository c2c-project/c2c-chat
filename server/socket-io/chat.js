import io from '.';
import JWT from '../lib/jwt';
import Messages from '../db/collections/messsages';
import Log from '../lib/log';
import tf from '../lib/tf';
import { ClientError } from '../lib/errors';

const ioChat = io.of('/chat');
/**
 * @description moderate the chat message
 * @arg {String} roomId corresponds to sessionId of the session
 * @arg {String} messageId id of the message to moderate
 * @returns {undefined}
 */
export function moderate(roomId, messageId) {
    ioChat.to(roomId).emit('moderate', messageId);
}

/**
 * @description unmoderate a chat message
 * @arg {String} roomId corresponds to sessionId of the session
 * @arg {String} message id of the message to unmoderate
 * @returns {undefined}
 */
export function unmoderate(roomId, message) {
    ioChat.to(roomId).emit('unmoderate', message);
}

/**
 * @description updates a chat message
 * @arg {String} roomId corresponds to sessionId of the session
 * @arg {String} messageId id of the message to update
 * @arg {String} messageId new message
 * @returns {undefined}
 */
export function update(roomId, messageId, newMessage) {
    io.of('/chat').to(roomId).emit('update', { messageId, newMessage });
}

/**
 * @description removes a chat message
 * @arg {String} roomId corresponds to sessionId of the session
 * @arg {String} messageId id of the message to remove
 * @returns {undefined}
 */
// This remove function does the same as the moderate function. This was done on purpose, for code clarity purposes.
export function remove(roomId, messageId) {
    io.of('/chat').to(roomId).emit('remove', messageId);
}

/**
 * @description function that runs after server emits a new message to all clients
 * @arg {Object} message message document
 * @arg {Object} roomId id of the room
 */
const onMessageSend = function (message, roomId) {
    tf.tfToxicityMessage(message, io, roomId);
    // TODO: 193
    // return the tf toxicity instead and put some of the tf functions in this file instead
};

/**
 * @description function that runs whenever the server receives a message from a client
 * the function is curried to respect socketio requirements
 * @arg {String} roomId corresponds to the sessionId of the session
 */
const onMessageReceived = (roomId) => async ({ message, jwt }) => {
    try {
        const { username, _id } = await JWT.verify(jwt, process.env.JWT_SECRET);
        const mongoCursor = await Messages.createMessage({
            message,
            username,
            userId: _id,
            session: roomId,
            toxicity: false,
            toxicityReason: [],
        });
        const messageDoc = mongoCursor.ops[0]; // the message is the first index in ops property
        ioChat.to(roomId).emit('message', messageDoc);
        onMessageSend(messageDoc, roomId);
    } catch (e) {
        Log.err(e);
    }
};

/**
 * @description function to join a chatroom
 * @arg {String} roomId corresponds to sessionId of the session
 * @arg {Object} socket socket given by socketio
 */
function joinChatRoom(roomId, socket) {
    if (roomId) {
        socket.join(roomId);
        socket.to(roomId).on('message', onMessageReceived(roomId));
    } else {
        Log.err(new ClientError('No roomId'));
    }
}

/**
 * @description function run when a new user connects and joins the appropriate chatroom
 * @arg {Object} socket given by socketio
 */
function onConnection(socket) {
    // roomId is just the sessionId -- we have different chatrooms for every session
    const { roomId } = socket.handshake.query;
    joinChatRoom(roomId, socket);
    // TODO: load current question
    // TODO: 193
    // register that a user joined this chatroom
}

ioChat.on('connection', onConnection);

export default ioChat;