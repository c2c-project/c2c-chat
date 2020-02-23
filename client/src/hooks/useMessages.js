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
        let isMounted = true;
        // SOCKET IO
        const chat = connect(roomId);
        chat.on('connect', function() {
            // TODO: login tokens here? or some kind of security?
            // chat.emit('new-user');
            if (isMounted) {
                setFunc(chat);
            }
        });
        chat.on('message', function(message) {
            if (isMounted) {
                setMessages(state => [...state, message]);
            }
        });
        chat.on('disconnect', () => console.log('disconnected'));
        chat.on('error', err => console.log(err));
        chat.on('moderate', messageId => {
            if (isMounted) {
                setMessages(curMessages =>
                    curMessages.filter(msg => msg._id !== messageId)
                );
            }
        });

        chat.on('update', message => {
            console.log("chat.on update called at useMessages file");
            console.log(message.messageId);
            if (isMounted) {
                // console.log(messages);
                // console.log(messages.find(msg => msg._id === message.messageId));
                setMessages(curMessages => 
                    // curMessages.filter(msg => msg._id !== messageId)
                    console.log(curMessages.find(msg => msg._id === message.messageId))
                );
            }
        });

        // FETCH
        fetch(`/api/chat/${roomId}`, {
            headers: {
                Authorization: `bearer ${jwt}`
            }
        }).then(r => {
            r.json().then(history => {
                if (isMounted) {
                    setMessages(history.filter(m => !m.moderated));
                }
            });
        });

        // SOCKET IO CLEANUP
        return () => {
            console.log('closing');
            isMounted = false;
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
