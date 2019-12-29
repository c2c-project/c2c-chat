import socketio from 'socket.io';
import Chat from '../db/collections/chat';

// TODO: send a jwt with the message
export default function init(server) {
    const io = socketio(server);

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
            socket.to(roomId).on('message', message => {
                // mockdb.push(message);
                Chat.addMessage({
                    message,
                    user: 'author',
                    session: roomId
                });
                io.of('/chat')
                    .to(roomId)
                    .emit('message', message);
            });
        }
    });
}
