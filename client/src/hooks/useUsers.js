import React from 'react';
import io from 'socket.io-client';
import useJwt from './useJwt';

function connect(roomId = 'users') {
    const url = `${process.env.REACT_APP_SERVER}/userList`;
    console.log(url)
    return io.connect(url, { query: `roomId=${roomId}`});
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

function useUsers(roomId = 'session') {
    const [userList, setUserList] = React.useState([]);
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
        const board = connect(roomId);
        board.on('connect', function () {
            if (isMounted) {
                setFunc(board);
            }
        });
        

        // FETCH
        fetch(`/api/userList/${roomId}`, {
            headers: {
                Authorization: `bearer ${jwt}`,
            },
        }).then((r) => {
            r.json().then((history) => {
                if (isMounted) {
                    setUserList(history);
                    // setMessages(history.filter(m => !m.moderated));
                }
            });
        });

        // SOCKET IO CLEANUP
        return () => {
            console.log('closing');
            isMounted = false;
            board.close();
        };
    }, [roomId, jwt]);

    return [
        userList
    ];
}

export default useUsers;
