import React from 'react';

function useMessages(roomId = '') {
    React.useEffect(() => {
        // some subscription here for the room
        // return some cleanup function too
    }, []);
    return [
        [],
        msg => {
            console.log(msg);
        }
    ];
}

export default useMessages;
