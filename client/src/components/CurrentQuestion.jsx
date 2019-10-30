import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Paper, Grid, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(2)
    },
    item: {
        padding: `${theme.spacing(1)}px 0 ${theme.spacing(1)}px 0`
    }
}));

export default function CurrentQuestion({ title, question }) {
    const classes = useStyles();
    return (
        <Paper className={classes.root}>
            <Grid container>
                <Grid item xs={12} className={classes.item}>
                    <Typography align='center' variant='h5'>
                        {title}
                    </Typography>
                    <Divider />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                    <Typography variant='body2'>{question.text}</Typography>
                </Grid>
                <Grid item xs={12} className={classes.item}>
                    <Typography align='right' variant='body1'>
                        {`- ${question.author}`}
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    );
}

CurrentQuestion.propTypes = {
    title: PropTypes.string.isRequired,
    question: PropTypes.shape({
        text: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired
    }).isRequired
};
