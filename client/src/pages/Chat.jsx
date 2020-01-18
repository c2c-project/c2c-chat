import React from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Slide from '@material-ui/core/Slide';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ChatWindow from '../components/chat';
import { QuestionWindow } from '../components/chat/ChatWindow';
import VideoPlayer from '../components/video-player';
import CurrentQuestion from '../components/CurrentQuestion';
import Dialog from '../components/Dialoag';
import FormQuestion from '../components/FormQuestion';
import Tabs from '../components/Tabs';
import GateKeep from '../components/GateKeep';
import Speaker from '../components/Speaker';
// import ModDashboard from '../components/ModDashboard';

const useVideoStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        display: 'flex',
        flex: 1,
        flexBasis: 'auto'
    },
    question: {
        width: '100%'
    },
    btn: {
        padding: theme.spacing(2)
    },
    questionContent: {
        paddingTop: theme.spacing(8)
    },
    title: {
        paddingBottom: theme.spacing(3)
    }
}));

// eslint-disable-next-line
const Video = ({ roomId, url }) => {
    const classes = useVideoStyles();
    const [isOpen, setOpen] = React.useState(false);
    return (
        <Paper className={classes.paper}>
            <Grid container>
                <Grid container justify='center' item xs={12}>
                    <VideoPlayer url={url} />
                </Grid>
                <Hidden mdDown>
                    <Grid item xs={12} className={classes.question}>
                        <CurrentQuestion roomId={roomId} />
                    </Grid>
                </Hidden>
                <Grid item xs={12}>
                    <div className={classes.btn}>
                        <Button
                            onClick={() => setOpen(true)}
                            fullWidth
                            variant='contained'
                            color='primary'
                        >
                            Ask a Question
                        </Button>
                    </div>
                    <Dialog open={isOpen} onClose={() => setOpen(false)}>
                        <Container
                            maxWidth='md'
                            className={classes.questionContent}
                        >
                            <Typography variant='h4' className={classes.title}>
                                Ask a Question
                            </Typography>
                            <FormQuestion
                                onSubmit={() => setOpen(false)}
                                roomId={roomId}
                            />
                        </Container>
                    </Dialog>
                </Grid>
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
        },
        [theme.breakpoints.up('md')]: {
            padding: `${theme.spacing(7)}px 0 ${theme.spacing(7)}px 0`
        },
        [theme.breakpoints.down('md')]: {
            maxWidth: '100vw'
        }
        // flexBasis: 'auto',
        // flexGrow: 0
    },
    chat: {
        [theme.breakpoints.down('md')]: {
            maxWidth: '100vw'
        },
        // [theme.breakpoints.up('md')]: {
        //     height: '100%'
        // },
        // [theme.breakpoints.down('sm')]: {
        //     height: '50vh'
        // }
        flexBasis: '100%',
        flexGrow: 1
        // border: '1px solid #80808029'
        // minHeight: '50vh'
    },
    modView: {
        padding: theme.spacing(2),
        width: '100%',
        height: '100%'
        // display: 'flex',
        // flex: 1
    }
}));

export default function Chat() {
    const classes = useStyles();
    const { roomId } = useParams();
    const sessionData = JSON.parse(localStorage.getItem('session'));
    const modView = (
        <Tabs
            pages={[
                {
                    label: 'User View',
                    component: (
                        <Grid
                            container
                            className={classes.root}
                            justify='flex-end'
                        >
                            <Slide in direction='right' timeout={300}>
                                <Grid
                                    container
                                    item
                                    xs={12}
                                    md={6}
                                    className={classes.height}
                                    justify='center'
                                >
                                    <Grid
                                        item
                                        xs={12}
                                        md={10}
                                        className={classes.video}
                                    >
                                        <Video
                                            roomId={roomId}
                                            url={sessionData.url}
                                        />
                                    </Grid>
                                </Grid>
                            </Slide>
                            <Slide in direction='left' timeout={300}>
                                <Grid
                                    item
                                    xs={12}
                                    md={6}
                                    className={classes.chat}
                                >
                                    <ChatWindow
                                        roomId={roomId}
                                        title='Discussion'
                                    />
                                </Grid>
                            </Slide>
                        </Grid>
                    )
                },
                {
                    label: 'Mod View',
                    component: (
                        <Grid container className={classes.modView}>
                            <Grid item xs={12}>
                                <QuestionWindow
                                    roomId={roomId}
                                    title='Incoming Questions'
                                />
                                {/* <Chat roomId={roomId} /> */}
                                {/* <ModDashboard data={data} /> */}
                            </Grid>
                        </Grid>
                    )
                }
            ]}
        />
    );
    const unprivilegedView = (
        <Grid container className={classes.root} justify='flex-end'>
            <Slide in direction='right' timeout={300}>
                <Grid
                    container
                    item
                    xs={12}
                    md={6}
                    className={classes.height}
                    justify='center'
                >
                    <Grid item xs={12} md={10} className={classes.video}>
                        <Video roomId={roomId} url={sessionData.url} />
                    </Grid>
                </Grid>
            </Slide>
            <Slide in direction='left' timeout={300}>
                <Grid item xs={12} md={6} className={classes.chat}>
                    <ChatWindow title='Discussion' roomId={roomId} />
                </Grid>
            </Slide>
        </Grid>
    );
    return (
        <GateKeep
            local
            permissions={{ requiredAny: ['moderator', 'admin'] }}
            elseRender={
                <GateKeep
                    local
                    permissions={{ requiredAny: ['speaker'] }}
                    elseRender={unprivilegedView}
                >
                    <Grid container className={classes.root}>
                        <Grid item xs={12}>
                            <Speaker />
                        </Grid>
                    </Grid>
                </GateKeep>
            }
        >
            {modView}
        </GateKeep>
    );
}
