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
import UserMessageActions from './UserMessageActions';
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

const checkIsOwner = (user, messageUserId) => {
    return user._id === messageUserId;
}

function Messages({ messages, variant }) {
    const classes = useStyles();
    const lastMessageRef = React.useRef(null);
    const [jwt, user] = useJwt();
    const [isModerator, setModerator] = React.useState(false);
    //const [isOwner, setOwner] = React.useState(false);
    const [targetMsg, setTargetMsg] = React.useState(null);
    const Actions = variant === 'questions' ? QuestionActions : MessageActions;
    const firstRender = React.useRef(true);
    const scrollToBottom = () => {
        lastMessageRef.current.scrollIntoView({
            behavior: firstRender.current ? 'smooth' : 'auto'
        });
        firstRender.current = !messages.length;
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
                {messages.map(
                    ({
                        username = 'author',
                        message = 'message',
                        _id,
                        userId
                    } = {}) => (
                        <ListItem
                        // TODO: Johan
                        /**
                         * below is the button logic, I explained this before, and wanted to write it here again
                         * we want to make a the list item a button every time the user is the owner of the question
                         * so we'd want something like isModerator || isOwner, isOwner is the logic you'd have to write
                         * 
                         * to make this inline we'd instead have to do a conditional render https://reactjs.org/docs/conditional-rendering.html
                         * Where instead of rendering the message, denoted below as COND RENDER HERE, we render the textbox with the existing text
                         * this would require testing to make sure the user can still edit the question while new emssages are being sent
                         * of course, the inline rendering is completely optional/up to you if you wanan give it a go
                         * 
                         * Here's the process stated in a more procedural/logical way
                         * 1. If user is owner, ListItem should be a button
                         * 2. If user clicks on the ListItem and owns that message/it is a button, one of two things will happen:
                         *  a. The modal will pop up (like you already showed me)
                         *  b. You will change a state, lets call it editState, to reflect that the user is currently editing the clicked message
                         * 3. On Press enter or clicking some sort of confirm, the UI will go back to normal
                         * 
                         * Let me know if you have any questions here
                         */
                         /*
                            Implement a boolean operation that checks if the userId of the message is the same as 
                            the _id of the current user
                         */
                            button={isModerator || checkIsOwner(user, userId)}
                            onClick={() => {
                                if (isModerator || checkIsOwner(user, userId)) {
                                    setTargetMsg({
                                        _id,
                                        message,
                                        username,
                                        userId
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
                                    {/* COND RENDER HERE */}
                                    <Typography
                                        color='textPrimary'
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
                        {targetMsg && isModerator && (
                            <Actions
                                targetMsg={targetMsg}
                                onClick={() => setTargetMsg(null)}
                            />
                        )}

                        {targetMsg && !isModerator && (
                            <UserMessageActions
                                targetMsg={targetMsg}
                                onClick={() => setTargetMsg(null)}
                            />
                        )}
                    </Grid>
                </Container>
            </Dialog>
        </div>
    );
}

Messages.defaultProps = {
    messages: []
};

Messages.propTypes = {
    messages: PropTypes.array,
    variant: PropTypes.oneOf(['questions', 'messages']).isRequired
};

export default Messages;
