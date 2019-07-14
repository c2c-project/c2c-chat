import { WebApp } from 'meteor/webapp';
import SocketIO from 'socket.io';

Meteor.startup(() => {
    const io = SocketIO(WebApp.httpServer);

    io.on('connection', function(socket) {
        console.log('new socket client');
    });
});