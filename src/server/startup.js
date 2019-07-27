import express from 'express';
import http from 'http';
import socketIO from 'socket.io';

const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;

io.on('connection', function(socket) {
    socket.emit('new', { hello: 'world' });
    socket.on('my other event', function(data) {
        console.log(data);
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
