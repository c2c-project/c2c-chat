import React from 'react';
import io from 'socket.io-client';
import useJwt from './useJwt';

function connect(roomId = 'chat') {
    const url = `${process.env.REACT_APP_SERVER}/chat`;
    return io.connect(url, { query: `roomId=${roomId}` });
}

function isModerator(jwt) {
    return new Promise(function (resolve) {
        fetch('/api/users/authenticate', {
            method: 'POST',
            body: JSON.stringify({ requiredAny: ['moderator', 'admin'] }),
            headers: {
                Authorization: `bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
        }).then((r) => {
            r.json().then((result) => {
                resolve(result.allowed);
            });
        });
    });
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
        chat.on('connect', function () {
            // TODO: login tokens here? or some kind of security?
            // chat.emit('new-user');
            if (isMounted) {
                setFunc(chat);
            }
        });
        chat.on('message', function (message) {
            if (isMounted) {
                setMessages((state) => [...state, message]);
            }
        });
        chat.on('disconnect', () => console.log('disconnected'));
        chat.on('error', (err) => console.log(err));
        chat.on('moderate', (messageId) => {
            if (isMounted) {
                setMessages((curMessages) => {
                    let message = curMessages;
                    isModerator(jwt).then((value) => {
                        if (value === true) {
                            message = curMessages.map((msg) => {
                                let copy = { ...msg };
                                if (copy._id === messageId) {
                                    copy.moderated = true;
                                }
                                return copy;
                            });
                        } else {
                            message = curMessages.filter(
                                (msg) => msg._id !== messageId
                            );
                        }
                    });
                    return message;
                });
            }
        });

        chat.on('unmoderate', (message) => {
            if (isMounted) {
                setMessages((curMessages) => {
                    // TODO: make sure this evaluates
                    if (isModerator(jwt)) {
                        console.log('is mod');
                        console.log(message);
                        return curMessages.map((msg) => {
                            if (msg._id === message._id) {
                                msg.moderated = false;
                            }
                            return msg;
                        });
                    }
                    curMessages.push(message);
                    return curMessages.sort(function (a, b) {
                        return a.sentOn - b.sendOn;
                    });
                });
            }
        });

        // FETCH
        fetch(`/api/chat/${roomId}`, {
            headers: {
                Authorization: `bearer ${jwt}`,
            },
        }).then((r) => {
            r.json().then((history) => {
                if (isMounted) {
                    setMessages(history);
                    // setMessages(history.filter(m => !m.moderated));
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
        (message) => {
            // prevent a blank message or a message with only spaces from being sent
            if (message.trim()) {
                sendFunc.emit('message', { jwt, message });
            }
        },
    ];
}

export default useMessages;
