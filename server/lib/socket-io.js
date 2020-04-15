import socketio from 'socket.io';
// import JWT from 'jsonwebtoken';
import JWT from './jwt';
import Messages from '../db/collections/messsages';
import Log from './log';
import tf from './tf';
import { ClientError } from './errors';

/**
 * all socket io stuff happens here, note that the server is not attached until it is created in bin/www.js
 * NOTE: as this expands this may get broken up into diff files/folders, but it's < 100 lines at the time of this comment
 */

const io = socketio();
io.serveClient(false);

io.on('connection', (socket) => {
    // TODO: increment # of users connected here
    // eslint-disable-next-line
    socket.on('disconnect', (data) => {
        // TODO: decrement # of users here
    });
});

io.of('/chat').on('connection', (socket) => {
    // roomId is just the sessionId -- we have different chatrooms for every session
    const { roomId } = socket.handshake.query;
    if (roomId) {
        socket.join(roomId);
        socket.to(roomId).on('message', async ({ message, jwt }) => {
            try {
                const { username, _id } = await JWT.verify(
                    jwt,
                    process.env.JWT_SECRET
                );
                const mongoCursor = await Messages.createMessage({
                    message,
                    username,
                    userId: _id,
                    session: roomId,
                    toxicity: false,
                    toxicityReason: [],
                });
                const myMessage = mongoCursor.ops[0]; // the message is the first index in ops property
                io.of('/chat').to(roomId).emit('message', myMessage);
                tf.tfToxicityMessage(myMessage, io, roomId);
            } catch (e) {
                Log.err(e);
            }
        });
    } else {
        Log.err(new ClientError('No roomId'));
    }
});

export function moderate(roomId, messageId) {
    io.of('/chat').to(roomId).emit('moderate', messageId);
}

export function unmoderate(roomId, message) {
    io.of('/chat').to(roomId).emit('unmoderate', message);
}

io.of('/questions').on('connection', (socket) => {
    const { roomId } = socket.handshake.query;
    if (roomId) {
        socket.join(roomId);
    }
});

export function setCurrentQuestion(sessionId, question) {
    io.of('/questions').to(sessionId).emit('set-question', question);
}

export default io;
