import socketio from 'socket.io';

export default function init(server) {
    const io = socketio(server);

    io.on('connection', function(socket) {
        console.log('TODO: connect -- register user');
        socket.emit('news', { hello: 'world' });
        socket.on('disconnect', function(data) {
            console.log('TODO: disconnect -- unregister user');
        });
    });
    const mockdb = [];
    io.of('/chat').on('connection', function(socket) {
        socket.emit('loadHistory', mockdb);
        socket.on('message', message => {
            mockdb.push(message);
            socket.emit('message', message);
            console.log('message', message);
        });
    });
}
