import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    root: {
        height: '100%',
        width: '100%',
        overflowY: 'scroll'
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

function Messages({ messages }) {
    const classes = useStyles();
    const lastMessageRef = React.useRef(null);
    const scrollToBottom = () => {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    };
    React.useEffect(scrollToBottom, [messages]);
    return (
        <div className={classes.root}>
            <List>
                {messages.map(({ author, message, _id }) => (
                    <ListItem key={_id} className={classes.message}>
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
                    </ListItem>
                ))}
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
