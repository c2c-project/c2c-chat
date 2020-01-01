import React from 'react';
import { Route, useParams } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Slide from '@material-ui/core/Slide';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles } from '@material-ui/core/styles';
import ChatWindow from '../components/chat';
import VideoPlayer from '../components/video-player';
import CurrentQuestion from '../components/CurrentQuestion';

const ChatRoom = () => {
    // roomId = sessionId
    const { roomId } = useParams();
    return <ChatWindow roomId={roomId} />;
};

const useVideoStyles = makeStyles({
    root: {
        width: '100%',
        display: 'flex',
        flex: 1,
        flexBasis: 'auto'
    },
    question: {
        width: '100%'
    }
});

const Video = () => {
    const classes = useVideoStyles();
    return (
        <Paper className={classes.paper}>
            <Grid container>
                <Grid container justify='center' item xs={12}>
                    <VideoPlayer />
                </Grid>
                <Hidden mdDown>
                    <Grid item xs={12} className={classes.question}>
                        <CurrentQuestion
                            title='Current Question'
                            question={{ text: 'hello', author: 'world' }}
                        />
                    </Grid>
                </Hidden>
            </Grid>
        </Paper>
    );
};

const useStyles = makeStyles(theme => ({
    root: {
        height: '100%',
        flex: 1
    },
    video: {
        [theme.breakpoints.down('sm')]: {
            maxHeight: '30vh'
        }
        // flexBasis: 'auto',
        // flexGrow: 0
    },
    chat: {
        // [theme.breakpoints.up('md')]: {
        //     height: '100%'
        // },
        // [theme.breakpoints.down('sm')]: {
        //     height: '50vh'
        // }
        flexBasis: '100%',
        flexGrow: 1
        // minHeight: '50vh'
    }
}));

export default function Chat() {
    const classes = useStyles();
    // NOTE: room id = session id
    return (
        <Grid container className={classes.root}>
            <Slide in direction='right' timeout={300}>
                <Grid item xs={12} md={6} className={classes.video}>
                    <Video />
                </Grid>
            </Slide>
            <Slide in direction='left' timeout={300}>
                <Grid item xs={12} md={6} className={classes.chat}>
                    <ChatRoom />
                </Grid>
            </Slide>
        </Grid>
    );
}
