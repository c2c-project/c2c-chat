import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Chatbar from './Chatbar';
import Messages from './Messages';
import useMessages from '../../hooks/useMessages';

const useStyles = makeStyles(theme => ({
    chatbar: {
        padding: `${theme.spacing(2)}px 0 ${theme.spacing(2)}px 0`
    },
    paper: {
        padding: theme.spacing(2)
    },
    divider: {
        margin: `${theme.spacing(2)}px 0 0 0`
    }
}));

function ChatWindow({ roomId }) {
    const [messages, sendMsg] = useMessages(roomId);
    const classes = useStyles();

    return (
        <Grid container direction='column'>
            <Paper className={classes.paper}>
                <Messages messages={messages} />
                <Divider className={classes.divider} />
                <div className={classes.chatbar}>
                    <Chatbar onMessageSend={sendMsg} />
                </div>
            </Paper>
        </Grid>
    );
}

ChatWindow.propTypes = {
    roomId: PropTypes.string.isRequired
};

export default ChatWindow;
