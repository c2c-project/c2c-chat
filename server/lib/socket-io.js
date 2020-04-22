import socketio from 'socket.io';
import JWT from 'jsonwebtoken';
import Messages from '../db/collections/messsages';
import tf from './tf';
import userConnection from '../db/collections/user-connection';
import passport from 'passport';
/**
 * all socket io stuff happens here, note that the server is not attached until it is created in bin/www.js
 * NOTE: as this expands this may get broken up into diff files/folders, but it's < 100 lines at the time of this comment
 */

const io = socketio();
io.serveClient(false);

io.on('connection', socket => {
    // TODO: increment # of users connected here
    // eslint-disable-next-line
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        console.log('running')
        const { user } = req;
        userConnection.userConnect(user._id);
    }
    socket.on('disconnect', data => {
        // TODO: decrement # of users here
        passport.authenticate('jwt', { session: false }),
        (req, res, next) => {
            const { user } = req;
            userConnection.userDisConnect(user._id);
        }
    });
});

/**
 * CHAT
 */

// jwt is sent with every single chat message
io.of('/chat').on('connection', socket => {
    // roomId is just the sessionId -- we have different chatrooms for every session
    const { roomId } = socket.handshake.query;
    // TODO: what happens if there's no roomId? maybe just explicitly nothing
    if (roomId) {
        socket.join(roomId);
        socket.to(roomId).on('message', ({ message, jwt }) => {
            JWT.verify(jwt, process.env.JWT_SECRET, (err, decodedJwt) => {
                // TODO: how could this error? if so what do I do? idk atm
                if (!err) {
                    const { username, _id } = decodedJwt;
                    Messages.createMessage({
                        message,
                        username,
                        userId: _id,
                        session: roomId,
                        toxicity: false,
                        toxicityReason : [],
                    })
                        .then(r => {
                            // r is just the general object returned by the mongo driver when mongodb finishes
                            // it has a property called ops, which is always an array of the inserted documents
                            // since I am inserting one doc, then I only care about the first element
                            // I want the object as returned by mongodb, so that I have the _id of the message in the db
                            const messageDoc = r.ops[0];
                            io.of('/chat')
                                .to(roomId)
                                .emit('message', messageDoc);
                            tf.tfToxicityMessage(messageDoc, io, roomId);
                        })
                        .catch(e => console.log(e));
                }
            });
        });
    }
});

export function moderate(roomId, messageId) {
    console.log(roomId, messageId);
    io.of('/chat')
        .to(roomId)
        .emit('moderate', messageId);
}

export function unmoderate(roomId, message) {
    io.of('/chat')
        .to(roomId)
        .emit('unmoderate', message);
}

/**
 * QUESTIONS
 */

io.of('/questions').on('connection', socket => {
    const { roomId } = socket.handshake.query;
    if (roomId) {
        socket.join(roomId);
    }
});

export function setCurrentQuestion(sessionId, question) {
    io.of('/questions')
        .to(sessionId)
        .emit('set-question', question);
}

export default io;
