import React from 'react';
import { Route } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import SessionList from '../components/SessionList';
import Fab from '../components/Fab';
import Dialog from '../components/Dialoag';

function SessionForm() {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant='h4'>Session Form</Typography>
            </Grid>
            <Grid item xs={12}>
                <form>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                autoComplete='off'
                                id='speaker'
                                label='Speaker'
                                variant='outlined'
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                autoComplete='off'
                                id='moderator'
                                label='Moderator'
                                variant='outlined'
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                autoComplete='off'
                                id='date'
                                label='Date & Time'
                                variant='outlined'
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                autoComplete='off'
                                id='description'
                                label='Description'
                                variant='outlined'
                            />
                        </Grid>
                        <Grid container item xs={12} justify='flex-end'>
                            <Button type='submit' variant='contained'>
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Grid>
        </Grid>
    );
}

const useStyles = makeStyles(theme => ({
    dialogForm: {
        paddingTop: theme.spacing(3)
    }
}));

export default function Sessions() {
    const classes = useStyles();
    const [data, setData] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
        fetch('/api/sessions').then(res => {
            res.json().then(r => setData(r));
        });
    }, []);
    return (
        <Route path='/sessions'>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <Container maxWidth='lg' className={classes.dialogForm}>
                    <SessionForm />
                </Container>
            </Dialog>
            <SessionList sessions={data} />
            <Fab onClick={() => setOpen(true)} />
        </Route>
    );
}
