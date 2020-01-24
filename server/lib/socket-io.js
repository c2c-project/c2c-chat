import socketio from 'socket.io';
import JWT from 'jsonwebtoken';
import Chat from '../db/collections/chat';
import Toxicity from './tf';
// NOTE: it's probably better to use a session rather than jwt's for a chat
// but not expecting high enough volume for it to  matter right now
export default (function socketioInterface() {
    let io = null;
    function initChat() {
        io.on('connection', function(socket) {
            // TODO: increment # of users connected here
            // eslint-disable-next-line
            socket.on('disconnect', function(data) {
                // TODO: decrement # of users here
            });
        });
        io.of('/chat').on('connection', socket => {
            const { roomId } = socket.handshake.query;
            if (roomId) {
                socket.join(roomId);
                socket.to(roomId).on('message', ({ message, jwt }) => {
                    JWT.verify(
                        jwt,
                        process.env.JWT_SECRET,
                        async (err, decodedJwt) => {
                            if (!err) {
                                const { username, _id } = decodedJwt;
                                try{
                                    await Chat.createMessage({
                                        message: message.toString(),
                                        username: username.toString(),
                                        userId: _id.toString(),
                                        session: roomId.toString()
                                    }).then(r => {
                                        const messageDoc = r.ops[0];
                                        io.of('/chat')
                                            .to(roomId)
                                            .emit('message', messageDoc);
                                        /*
                                        // TODO: 193
                                        try{
                                            if(messageDoc){
                                                const result = await Toxicity.tf_toxicity(messageDoc.message);
                                            }
                                        }catch(Exception){
                                            console.log(Exception)
                                        }
                                        */
                                        /**
                                         * @messageDoc is the message json
                                         * Ideally, you'd just take the messageDoc
                                         * and feed that into the text toxicity
                                         */
                                    });
                                }catch(Exception){console.log(Exception)}
                            }
                        }
                    );
                });
            }
        });
        io.of('/questions').on('connection', socket => {
            const { roomId } = socket.handshake.query;
            if (roomId) {
                socket.join(roomId);
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
