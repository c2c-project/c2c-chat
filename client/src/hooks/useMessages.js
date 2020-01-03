import React from 'react';
import io from 'socket.io-client';
import useJwt from './useJwt';

function connect(roomId = 'chat') {
    const url = `${process.env.REACT_APP_SERVER}/chat`;
    return io.connect(url, { query: `roomId=${roomId}` });
}

function useMessages(roomId = 'session') {
    const [messages, setMessages] = React.useState([]);
    const [jwt] = useJwt();
    const [sendFunc, setFunc] = React.useState(() => {
        // TODO: maybe have a message queue?
        // i.e. some way to save the messages they're trying to send before ocnnection
        // or just have a loading screen
        // console.log('not connected');
    });

    React.useEffect(() => {
        // SOCKET IO
        const chat = connect(roomId);
        chat.on('connect', function() {
            // TODO: login tokens here? or some kind of security?
            // chat.emit('new-user');
            setFunc(chat);
        });
        chat.on('message', function(message) {
            setMessages(state => [...state, message]);
        });
        chat.on('disconnect', () => console.log('disconnected'));
        chat.on('error', err => console.log(err));

        // FETCH
        fetch(`/api/chat/${roomId}`, {
            headers: {
                Authorization: `bearer ${jwt}`
            }
        }).then(r => {
            r.json().then(history => {
                setMessages(history.filter(m => !m.moderated));
            });
        });

        // SOCKET IO CLEANUP
        return () => {
            console.log('closing');
            chat.close();
        };
    }, [roomId, jwt]);

    return [
        messages,
        message => {
            // prevent a blank message or a message with only spaces from being sent
            if (message.trim()) {
                sendFunc.emit('message', { jwt, message });
            }
        }
    ];
}

export default useMessages;
