import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import useUsers from '../../hooks/useUsers';
const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        flex: 1,
        height: '100%'
    },
    divider: {
        margin: `${theme.spacing(1)}px 0 ${theme.spacing(1)}px 0`
    },
    chatbar: {
        flexBasis: 0
    },
    messages: {
        flexBasis: 0,
        overflowY: 'scroll',
        flexGrow: 1
    }
}));

export function UserListWindow({ title, roomId }) {
    const [userList] = useUsers(roomId);
    console.log(userList)
    const classes = useStyles();
    return (
        <Paper className={classes.paper}>
            <Grid container direction='column' spacing={2}>
                <Grid container direction='row' spacing={2} justify='center'>
                    <Grid item xs={5}>
                        <Typography variant='h4'>{title}</Typography>
                    </Grid>
                </Grid>
                <Grid item xs={5}>
                        { userList.map(user => (
                            <p>{user.username}</p>
                        ))}
                </Grid>
            </Grid>
        </Paper>
    );
}

UserListWindow.propTypes = {
    title: PropTypes.string.isRequired
};

export default UserListWindow;