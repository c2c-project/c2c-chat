import io from '.';
import JWT from '../lib/jwt';
import Messages from '../db/collections/messsages';
import Log from '../lib/log';
import tf from '../lib/tf';
import { ClientError } from '../lib/errors';
import chatRoomUsers from './chatRoomUsers';

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
async function onConnection(socket) {
    // roomId is just the sessionId -- we have different chatrooms for every session
    const { roomId, jwt } = socket.handshake.query;
    const { username, _id } = await JWT.verify(jwt, process.env.JWT_SECRET);
    joinChatRoom(roomId, socket);
    chatRoomUsers.AddNewUser(roomId, { username, _id, jwt });
    socket.on('disconnect', () => {
        chatRoomUsers.DisConnectUser(roomId, { username, _id, jwt });
    });
    // TODO: load current question
    // TODO: 193
    // register that a user joined this chatroom
}
ioChat.on('connection', onConnection);
ioChat.on('myCustomEvent', (data) => {
    console.log(data);
});
export default ioChat;
