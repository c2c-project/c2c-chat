import socketio from 'socket.io';

const io = socketio();
io.serveClient(false);

// TODO: delete this probably

// io.on('connection', (socket) => {
//     // TODO: increment # of users connected here
//     // eslint-disable-next-line
//     socket.on('disconnect', (data) => {
//         // TODO: decrement # of users here
//     });
// });

export default io;
