import React from 'react';

function useMessages(roomId = '') {
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
