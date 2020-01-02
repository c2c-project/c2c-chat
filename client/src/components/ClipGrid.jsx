import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
// import Card from '@material-ui/core/Card';
// import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary
    }
}));

// eslint-disable-next-line
export default function CenteredGrid({ clips, clipEvent }) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Grid container spacing={3}>
                {/* eslint-disable-next-line */}
                {clips.map((x, index) => (
                    <Grid item key={index} xs={4}>
                        {/* <Card className={classes.paper} hoverable>{x.clipTitle}
                                
                            </Card> */}
                        <button
                            type='button'
                            color='primary'
                            onClick={clipEvent}
                        >
                            {x.clipTitle}
                        </button>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}
