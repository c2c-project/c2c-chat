import React from 'react';
import io from 'socket.io-client';

function connect(roomId = 'chat') {
    const url = `http://localhost:3001/${roomId}`;
    const chat = io.connect(url);
    chat.on('connect', function(something) {
        chat.emit('hi!');
        console.log(something);
    });
    chat.on('a message', function(message) {
        console.log(message);
    });
    // socket.on('news', function(data) {
    //     console.log(data);
    //     socket.emit('my other event', { my: 'data' });
    // });
}

function useMessages(roomId = '') {
    connect();
    React.useEffect(() => {
        // some subscription here for the room
        // return some cleanup function too
    }, []);
    // TODO: erase mock and have actual built in messages
    const mock = [
        {
            _id: 1,
            author: 'Mr. Foo',
            message: 'the message'
        },
        {
            _id: 2,
            author: 'Mrs. Bar',
            message: 'the message part 2'
        }
    ];
    return [
        mock,
        msg => {
            console.log(msg);
        }
    ];
}

export default useMessages;
