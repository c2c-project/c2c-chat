import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flex: 1,
        marginBottom: theme.spacing(2)
    },
    full: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flex: '1'
    }
}));

// eslint-disable-next-line
const Bold = ({ children }) => (
    <Typography component='div'>
        <Box fontWeight='fontWeightBold'>{children}</Box>
    </Typography>
);

function Messages({ messages }) {
    const classes = useStyles();
    return (
        <Paper className={classes.root}>
            <List className={classes.full}>
                <ListItem className={classes.full}>
                    <Grid
                        container
                        className={classes.full}
                        alignContent='flex-end'
                    >
                        {messages.map(({ author, message, _id }) => (
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
    );
}

Messages.defaultProps = {
    messages: []
};

Messages.propTypes = {
    messages: PropTypes.array
};

export default Messages;
