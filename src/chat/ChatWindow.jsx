import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Chatbar from './Chatbar';
import Messages from './Messages';
import useMessages from '../hooks/useMessages';

function ChatWindow({ roomId }) {
    const [messages, sendMsg] = useMessages(roomId);

    return (
        <Grid container direction='column'>
            <Messages messages={messages} />
            <Chatbar sendMsg={sendMsg} />
        </Grid>
    );
}

ChatWindow.propTypes = {
    roomId: PropTypes.string.isRequired
};

export default ChatWindow;
