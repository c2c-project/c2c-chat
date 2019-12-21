import socketio from 'socket.io';
import Chat from './chat';

export default function init(server) {
    const io = socketio(server);

    io.on('connection', function(socket) {
        console.log('TODO: connect -- register user');
        socket.on('disconnect', function(data) {
            console.log('TODO: disconnect -- unregister user');
        });
    });
    // const mockdb = [];
    // let userCount = 0;
    io.of('/chat').on('connection', function(socket) {
        const { roomId } = socket.handshake.query;
        if (roomId) {
            socket.join(roomId);
            Chat.findMessages({ sessionId: 'session' }).then(r => {
                socket.emit('history', r);
            });
            socket.to(roomId).on('message', message => {
                // mockdb.push(message);
                Chat.addMessage({
                    message,
                    user: 'author',
                    session: 'session'
                });
                io.of('/chat')
                    .to(roomId)
                    .emit('message', message);
            });
        }
        // socket.emit('loadHistory', mockdb);
        // socket.on('message', (message, cb) => {
        //     mockdb.push(message);
        //     socket.broadcast.emit('message', message);
        //     cb();
        // });
    });
}
