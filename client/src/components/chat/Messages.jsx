import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    root: {
        height: '100%',
        width: '100%'
        // overflowY: 'scroll'
    },
    message: {
        width: '100%'
    }
});

// eslint-disable-next-line
const Bold = ({ children }) => (
    <Typography component='div'>
        <Box fontWeight='fontWeightBold'>{children}</Box>
    </Typography>
);

// eslint-disable-next-line
const SystemMessages = ({ children }) => (
    <Typography color='textSecondary' component='div'>
        <Box fontWeight='fontWeightBold'>{children}</Box>
    </Typography>
);

function Messages({ messages }) {
    const classes = useStyles();
    const lastMessageRef = React.useRef(null);
    const scrollToBottom = () => {
        lastMessageRef.current.scrollIntoView({
            behavior: 'smooth'
        });
    };
    React.useEffect(scrollToBottom, [messages]);
    // TODO: CHANGE KEY TO USE _ID INSTEAD OF INDEX
    return (
        <div className={classes.root}>
            <List dense>
                {messages.map(
                    (
                        { author = 'author', message = 'message', _id } = {},
                        index
                    ) => (
                        <ListItem key={index} className={classes.message}>
                            <Grid container>
                                <Grid item xs='auto'>
                                    <Bold>{`${author}:`}</Bold>
                                </Grid>
                                <Grid item xs='auto'>
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
        </div>
    );
}

Messages.defaultProps = {
    messages: []
};

Messages.propTypes = {
    messages: PropTypes.array
};

export default Messages;
