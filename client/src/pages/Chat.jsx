import React from 'react';
import { Route, useParams } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import ChatWindow from '../components/chat';
import VideoPlayer from '../components/video-player';
import CurrentQuestion from '../components/CurrentQuestion';

const ChatRoom = () => {
    const { roomId } = useParams();
    return <ChatWindow roomId={roomId} />;
};

const useVideoStyles = makeStyles(theme => ({
    noBasis: {
        flexBasis: 0
        // [theme.breakpoints.up('md')]: {
        //     padding: `${theme.spacing(2)}px ${theme.spacing(
        //         2
        //     )}px 0 ${theme.spacing(2)}px`
        // }
    },
    question: {
        flexBasis: 0,
        width: '100%'
    }
}));

const Video = () => {
    const classes = useVideoStyles();
    return (
        <Grid container direction='column' alignItems='center'>
            {/* <Grid item xs={12}> */}
            <Grid item xs={12} md={10} className={classes.noBasis}>
                <VideoPlayer />
            </Grid>
            {/* <div className={classes.question}> */}
            <Grid item xs={12} md={10} className={classes.question}>
                <CurrentQuestion
                    title='Current Question'
                    question={{ text: 'hello', author: 'world' }}
                />
            </Grid>
            {/* </div> */}
            {/* </Grid> */}
        </Grid>
    );
};

const useStyles = makeStyles(theme => ({
    root: {
        height: '100%'
    },
    video: {
        [theme.breakpoints.down('sm')]: {
            height: '40vh'
        }
    },
    chat: {
        [theme.breakpoints.up('md')]: {
            height: '100%'
        },
        [theme.breakpoints.down('sm')]: {
            height: '50vh'
        }
    }
}));

export default function Chat() {
    const classes = useStyles();
    return (
        <Route path='/chat/:roomId'>
            <Grid container className={classes.root}>
                <Grid item xs={12} md={6} className={classes.video}>
                    <Video />
                </Grid>
                <Grid item xs={12} md={6} className={classes.chat}>
                    <ChatRoom />
                </Grid>
            </Grid>
        </Route>
    );
}
