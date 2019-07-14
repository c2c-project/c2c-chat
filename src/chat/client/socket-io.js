
// Socket io client
const PORT = 3000;
const socket = require('socket.io-client')(`http://localhost:${PORT}`);

socket.on('connect', function() {
    console.log('Client connected');
});
socket.on('disconnect', function() {
    console.log('Client disconnected');
});
