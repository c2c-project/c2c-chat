import React from 'react';
import io from 'socket.io-client';

function connect(roomId = 'chat') {
    const url = `${process.env.REACT_APP_SERVER}/${roomId}`;
    return io(url);
}

function useMessages(roomId = '') {
    const [messages, setMessages] = React.useState([]);
    const [sendFunc, setFunc] = React.useState(() => {
        // TODO: maybe have a message queue?
        // i.e. some way to save the messages they're trying to send before ocnnection
        // or just have a loading screen
        console.log('not connected');
    });

    React.useEffect(() => {
        const chat = connect();
        chat.on('connect', function() {
            // TODO: login tokens here? or some kind of security?
            chat.emit('new-user');
            setFunc(chat);
        });
        chat.on('loadHistory', history => {
            const formattedHistory = history.map(message => ({
                message
            }));
            setMessages(formattedHistory);
        });
        chat.on('message', function(message) {
            console.log(message);
            setMessages(state => [...state, { message }]);
        });
        chat.on('disconnect', () => console.log('disconnected'));
        chat.on('error', err => console.log(err));
        return () => {
            console.log('closing');
            chat.close();
        };
    }, []);

    return [
        messages,
        message => {
            sendFunc.emit('message', message, () => {
                setMessages(current => [...current, { message }]);
            });
        }
    ];
}

export default useMessages;
