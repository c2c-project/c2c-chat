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

function Messages({ messages, filter}) {
    const classes = useStyles();
    const lastMessageRef = React.useRef(null);
    const [jwt] = useJwt();
    const [isModerator, setModerator] = React.useState(false);
    const [targetMsg, setTargetMsg] = React.useState(null);
    const Actions = MessageActions;
    const firstRender = React.useRef(true);
    const scrollToBottom = () => {
        lastMessageRef.current.scrollIntoView({
            behavior: firstRender.current ? 'smooth' : 'auto'
        });
        firstRender.current = !messages.length;
    }
    const filterQuestions = () => {
        if (isModerator) {
            return messages.filter(m => {
                if (filter.moderated && m.moderated) { //show message that m.moderated === true
                    return true;
                }
                if (filter.normal && !m.moderated){
                    return true;
                }
            })
        }else{
            return messages.filter(m => !m.moderated)
        }
    }

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
                {filterQuestions().map(
                    ({
                        username = 'author',
                        message = 'message',
                        moderated = 'moderated',
                        _id
                    } = {}) => (
                        <ListItem
                            button={isModerator}
                            onClick={() => {
                                if (isModerator) {
                                    setTargetMsg({
                                        _id,
                                        message,
                                        username,
                                        moderated,
                                    });
                                }
                            }}
                            key={_id}
                            className={classes.message}
                        >
                            <Grid container>
                                <Grid item xs='auto'>
                                    <Bold>{`${username}:`}</Bold>
                                </Grid>
                                <Grid item xs='auto'>
                                    <Typography
                                        color={moderated === true? 'textSecondary':'textPrimary'}
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

Messages.defaultProps = {
    messages: [],
    filter: {
        moderated: false,
        normal: true
    }
};

Messages.propTypes = {
    messages: PropTypes.array,
    filter: PropTypes.object.isRequired,
};

export default Messages;
