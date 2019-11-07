#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Module dependencies.
 */
import debug from 'debug';
import http from 'http';
import socketio from 'socket.io';
import app from '../app';

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (Number.isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

const debugServer = debug('server:server');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', error => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});
server.on('listening', () => {
    const addr = server.address();
    const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    debugServer(`Listening on ${bind}`);
});

/**
 *  Create Socket IO
 */
const io = socketio(server);

/**
 * listen
 */
io.on('connection', function(socket) {
    console.log('new connection');
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function(data) {
        console.log(data);
    });
});

const chat = io.of('/chat').on('connection', function(socket) {
    socket.emit('a message', {
        that: 'only',
        '/chat': 'will get'
    });
    chat.emit('a message', {
        everyone: 'in',
        '/chat': 'will get'
    });
});
