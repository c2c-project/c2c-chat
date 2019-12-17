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
        // console.log(socket.id);
        // setInterval(() => {
        //     socket.emit('message', 'hello world');
        // }, 1000);
        socket.emit('loadHistory', mockdb);
        socket.on('message', (message, cb) => {
            mockdb.push(message);
            socket.broadcast.emit('message', message);
            cb();
            // console.log('message', message);
        });
        // socket.on('new-user', () => {
        //     socket.emit('message', `User ${userCount}`);
        //     userCount += 1;
        // });
    });
}
