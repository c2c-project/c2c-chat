import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import useJwt from '../../hooks/useJwt';
import MessageActions from './MessageActions';
import QuestionActions from './QuestionActions';
import Dialog from '../Dialoag';
import Bold from '../Bold';


const useStyles = makeStyles({
    root: {
        height: '100%',
        width: '100%'
        // overflowY: 'scroll'
    },
    message: {
        width: '100%'
    },
    maxHeight: {
        height: '100%'
    }
});

// eslint-disable-next-line
const SystemMessages = ({ children }) => (
    <Typography color='textSecondary' component='div'>
        <Box fontWeight='fontWeightBold'>{children}</Box>
    </Typography>
);

function Question({ messages, variant, currentQuestion }) {
    const classes = useStyles();
    const lastMessageRef = React.useRef(null);
    const [jwt] = useJwt();
    const [isModerator, setModerator] = React.useState(false);
    const [targetMsg, setTargetMsg] = React.useState(null);
    const Actions = variant === 'questions' ? QuestionActions : MessageActions;
    const scrollToBottom = () => {
        lastMessageRef.current.scrollIntoView({
            behavior: 'smooth'
        });
    };
    
    
    React.useEffect(() => {
        let isMounted = true;
        fetch('/api/users/authenticate', {
            method: 'POST',
            body: JSON.stringify({ requiredAny: ['moderator', 'admin'] }),
            headers: {
                Authorization: `bearer ${jwt}`,
                'Content-Type': 'application/json'
            }
        }).then(r => {
            r.json().then(result => {
                if (isMounted) {
                    setModerator(result.allowed);
                }
            });
        });
        return () => {
            isMounted = false;
        };
    }, [jwt]);
    React.useEffect(scrollToBottom, [messages]);

    return (
        <div className={classes.root}>
            <List dense>
                {messages.sort(function(a, b){
                    if(a.clusterNumber > b.clusterNumber) return 1;
                    if(a.clusterNumber < b.clusterNumber) return -1;
                    if(a.isCenter) return -1;
                    else return 1;
                }).map(
                    ({
                        username = 'author',
                        message = 'message',
                        _id,
                        toxicity = 'toxicity',
                        asked = 'asked',
                        isCenter = 'isCenter',
                        clusterNumber = 'clusterNumber'
                    } = {}) => (
                        <ListItem
                            button={isModerator}
                            onClick={() => {
                                if (isModerator) {
                                    if(currentQuestion && currentQuestion._id !== _id){
                                        setTargetMsg({
                                            _id,
                                            message,
                                            username
                                        });
                                    }
                                }
                            }}
                            key={_id}
                            className={classes.message}
                        >
                            <Grid container>
                                <Grid item xs={isCenter === true ? 'auto': '1'}>
                                    
                                </Grid>
                                <Grid item xs='auto'>
                                    <Bold>{`${username}:`}</Bold>
                                </Grid>
                                <Grid item xs='auto'>
                                    <Typography
                                        color='textSecondary'
                                        variant='body1'
                                    >
                                        {toxicity === true ? ' (toxic) ' : ''}
                                    </Typography>   
                                </Grid>
                                <Grid item xs='auto'>
                                    <Typography
                                        color={
                                            // eslint-disable-next-line no-nested-ternary
                                            currentQuestion._id === _id? 'error'
                                                :
                                                asked? 'textSecondary':'textPrimary'
                                        }
                                        variant='body1'
                                    >
                                        {message}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </ListItem>
                    )
                )}
            </List>
            <div ref={lastMessageRef} />
            <Dialog
                open={Boolean(targetMsg)}
                onClose={() => setTargetMsg(null)}
            >
                <Container maxWidth='sm' className={classes.maxHeight}>
                    <Grid
                        container
                        className={classes.maxHeight}
                        alignContent='center'
                    >
                        {targetMsg && isModerator ? (
                            <Actions
                                targetMsg={targetMsg}
                                onClick={() => setTargetMsg(null)}
                                currentQuestion={currentQuestion}
                            />
                        ) : (
                            <></>
                        )}
                    </Grid>
                </Container>
            </Dialog>
        </div>
    );
}

Question.defaultProps = {
    messages: []
};

Question.propTypes = {
    messages: PropTypes.array,
    variant: PropTypes.oneOf(['questions', 'messages']).isRequired,
    currentQuestion: PropTypes.oneOf(['message', '_id']).isRequired
};

export default Question;
