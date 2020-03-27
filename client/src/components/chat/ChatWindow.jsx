import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import useMessages from '../../hooks/useMessages';
import Messages from './Messages';
import Chatbar from './Chatbar';

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        flex: 1,
        height: '100%'
    },
    divider: {
        margin: `${theme.spacing(1)}px 0 ${theme.spacing(1)}px 0`
    },
    chatbar: {
        flexBasis: 0
    },
    messages: {
        flexBasis: 0,
        overflowY: 'scroll',
        flexGrow: 1
    }
}));

function ChatWindow({ roomId, title }) {
    const [messages, sendMsg] = useMessages(roomId);
    const classes = useStyles();

    return (
        <Paper className={classes.paper}>
            <Grid container direction='column' spacing={2}>
                <Grid item xs='auto'>
                    <Typography variant='h4'>{title}</Typography>
                </Grid>
                <Divider className={classes.divider} />
                <Grid item xs={12} className={classes.messages}>
                    <Messages messages={messages} variant='messages' />
                </Grid>
                <Divider className={classes.divider} />
                <Grid item xs={12} className={classes.chatbar}>
                    <Chatbar onMessageSend={sendMsg} />
                </Grid>
            </Grid>
        </Paper>
    );
}

ChatWindow.propTypes = {
    roomId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
};

export default ChatWindow;
