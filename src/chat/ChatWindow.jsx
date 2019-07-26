import React from 'react';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import Chatbar from './Chatbar';
import useMessages from '../hooks/useMessages';

// TODO: erase mock and have actual built in messages
const mock = [
    {
        _id: 1,
        author: 'David Silva',
        message: 'the message'
    },
    {
        _id: 2,
        author: 'Kevin Esterling',
        message: 'the message part 2'
    }
];

const useStyles = makeStyles(theme => ({
    messages: {
        marginBottom: theme.spacing(2)
    }
}));

// eslint-disable-next-line
const Bold = ({ children }) => (
    <Typography component='div'>
        <Box fontWeight='fontWeightBold'>{children}</Box>
    </Typography>
);

function ChatWindow() {
    const [messages, sendMsg] = useMessages();
    const classes = useStyles();

    return (
        <>
            <Paper className={classes.messages}>
                <List>
                    <ListItem alignItems='flex-start'>
                        <Grid container>
                            {mock.map(({ author, message, _id }) => (
                                <Grid item xs={12} key={_id}>
                                    <ListItemText
                                        secondaryTypographyProps={{
                                            variant: 'body1',
                                            color: 'textPrimary'
                                        }}
                                        primaryTypographyProps={{
                                            variant: 'subtitle1',
                                            component: Bold
                                        }}
                                        primary={author}
                                        secondary={message}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </ListItem>
                </List>
            </Paper>
            <Chatbar sendMsg={sendMsg} />
        </>
    );
}

export default ChatWindow;
