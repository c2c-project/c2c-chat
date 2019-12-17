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
    root: {
        height: '100%'
    },
    chatbar: {
        padding: `${theme.spacing(2)}px 0 ${theme.spacing(2)}px 0`,
        height: '12vh'
    },
    paper: {
        padding: theme.spacing(2),
        height: '100%'
    },
    divider: {
        margin: `${theme.spacing(2)}px 0 0 0`
    },
    messages: {
        height: '75vh'
    }
}));

function ChatWindow({ roomId }) {
    const [messages, sendMsg] = useMessages(roomId);
    const classes = useStyles();

    return (
        <Grid container direction='column' className={classes.root}>
            <Paper className={classes.paper}>
                <div className={classes.messages}>
                    <Messages messages={messages} />
                </div>
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
