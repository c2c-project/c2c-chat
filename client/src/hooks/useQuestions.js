import React from 'react';
import io from 'socket.io-client';
import useJwt from './useJwt';

function connect(roomId = 'chat') {
    const url = `${process.env.REACT_APP_SERVER}/questions`;
    return io.connect(url, { query: `roomId=${roomId}` });
}

function useQuestions(roomId = 'session') {
    const session = JSON.parse(localStorage.getItem('session'));
    console.log(session);
    const initialQuestion =
        session && session.questionHistory
            ? session.questionHistory[session.questionHistory.length - 1]
            : false;
    const [questions, setQuestions] = React.useState([]);
    const [current, setCurrent] = React.useState(initialQuestion);
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
        const question = connect(roomId);
        question.on('connect', function() {
            // TODO: login tokens here? or some kind of security?
            // chat.emit('new-user');
            console.log('it is in connect')
            if (isMounted) {
                setFunc(question);
            }
        });
        question.on('question', function(message) {
            console.log('it is in question')
            if (isMounted) {
                setQuestions(state => [...state, message]);
            }
        });
        question.on('disconnect', () => console.log('disconnected'));
        question.on('error', err => console.log(err));
        question.on('set-question', q => {
            console.log('set question');
            setCurrent(q);
        });
        // question.on('moderate', messageId => {
        //     if (isMounted) {
        //         setQuestions(curMessages =>
        //             curMessages.filter(msg => msg._id !== messageId)
        //         );
        //     }
        // });
        // FETCH
        fetch(`/api/questions/${roomId}`, {
            headers: {
                Authorization: `bearer ${jwt}`
            }
        }).then(r => {
            r.json().then(history => {
                if (isMounted) {
                    setQuestions(history.filter(m => !m.moderated));
                }
            });
        });

        // SOCKET IO CLEANUP
        return () => {
            console.log('closing');
            isMounted = false;
            question.close();
        };
    }, [roomId, jwt]);

    return [
        questions,
        question => {
            // prevent a blank message or a message with only spaces from being sent
            if (question.trim()) {
                sendFunc.emit('question', { jwt, question });
            }
        },
        // raw sendFunc so that privileged actions take place inside the components themselves, which are protected
        current
    ];
}

export default useQuestions;
