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
    // let userCount = 0;
    io.of('/chat').on('connection', function(socket) {
        const { roomId } = socket.handshake.query;
        if (roomId) {
            socket.join(roomId);
            socket.emit('loadHistory', mockdb);
            socket.to(roomId).on('message', (message, cb) => {
                mockdb.push(message);
                socket.broadcast.emit('message', message);
                cb();
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
