import socketio from 'socket.io';
import JWT from 'jsonwebtoken';
import Chat from '../db/collections/chat';

// NOTE: it's probably better to use a session rather than jwt's for a chat
// but not expecting high enough volume for it to  matter right now
export default (function socketioInterface() {
    let io = null;
    function initChat() {
        io.on('connection', function(socket) {
            console.log('TODO: connect -- register user');
            socket.on('disconnect', function(data) {
                console.log('TODO: disconnect -- unregister user');
            });
        });
        io.of('/chat').on('connection', socket => {
            const { roomId } = socket.handshake.query;
            if (roomId) {
                // socket.emit('history', [{ message: 'test' }]);
                socket.join(roomId);
                socket.to(roomId).on('message', ({ message, jwt }) => {
                    JWT.verify(
                        jwt,
                        process.env.JWT_SECRET,
                        (err, decodedJwt) => {
                            if (!err) {
                                const { username, _id } = decodedJwt;
                                Chat.addMessage({
                                    message,
                                    username,
                                    userId: _id,
                                    session: roomId
                                }).then(r => {
                                    const messageDoc = r.ops[0];
                                    io.of('/chat')
                                        .to(roomId)
                                        .emit('message', messageDoc);
                                });
                            }
                        }
                    );
                });
            }
        });
    }

    return {
        init: server => {
            io = socketio(server);
            initChat();
        },
        io: () => io
    };
})();
