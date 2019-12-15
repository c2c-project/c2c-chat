import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
// import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter, Route } from 'react-router-dom';
// import Sessions

const useStyles = makeStyles(theme => ({
    root: {
        height: '100vh',
        width: '100vw',
        padding: theme.spacing(2)
    }
}));

function App() {
    const classes = useStyles();
    return (
        <Grid container className={classes.root}>
            <Chat roomId='home' />
        </Grid>
    );
}

export default App;
