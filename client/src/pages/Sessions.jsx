import React from 'react';
import PropTypes from 'prop-types';
import { Route, useHistory } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SessionList from '../components/SessionList';
import Fab from '../components/Fab';
import Dialog from '../components/Dialoag';
import DateTimePicker from '../components/DateTimePicker';
import PageContainer from '../layout/PageContainer';

function SessionForm({ type, onSubmit: cb, editTarget }) {
    const [state, setState] = React.useState({
        speaker: '',
        moderator: '',
        date: new Date(),
        description: ''
    });
    React.useEffect(() => {
        if (type === 'update') {
            fetch(`/api/sessions/find/${editTarget}`).then(res =>
                res.json().then(r => {
                    setState({
                        speaker: r.speaker,
                        moderator: r.moderator,
                        date: r.date,
                        descritpion: r.description
                    });
                })
            );
        }
    }, [type, editTarget]);
    const onSubmit = e => {
        e.preventDefault();
        fetch(`/api/sessions/${type}`, {
            method: 'POST',
            body:
                type === 'create'
                    ? JSON.stringify({ form: state })
                    : JSON.stringify({ form: state, sessionId: editTarget }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            // TODO: handle errors later
            cb();
        });
    };
    const handleChange = (e, key) => {
        const { value } = e.target;
        setState(prev => ({ ...prev, [key]: value }));
    };
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant='h4'>Session Form</Typography>
            </Grid>
            <Grid item xs={12}>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                autoComplete='off'
                                id='speaker'
                                label='Speaker'
                                variant='outlined'
                                value={state.speaker}
                                onChange={e => handleChange(e, 'speaker')}
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
                                value={state.moderator}
                                onChange={e => handleChange(e, 'moderator')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <DateTimePicker
                                fullWidth
                                required
                                autoComplete='off'
                                id='date'
                                label='Date & Time'
                                variant='outlined'
                                value={state.date}
                                onChange={e => handleChange(e, 'date')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                autoComplete='off'
                                id='description'
                                label='Description'
                                variant='outlined'
                                value={state.description}
                                onChange={e => handleChange(e, 'description')}
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

SessionForm.defaultProps = {
    type: 'create',
    onSubmit: () => {},
    editTarget: null
};

SessionForm.propTypes = {
    type: PropTypes.oneOf(['create', 'update']),
    onSubmit: PropTypes.func,
    editTarget: PropTypes.string
};

const useStyles = makeStyles(theme => ({
    dialogForm: {
        paddingTop: theme.spacing(3)
    }
}));

export default function Sessions() {
    const classes = useStyles();
    const history = useHistory();
    const [data, setData] = React.useState([]);
    const [isFormOpen, setFormOpen] = React.useState(false);
    const [formType, setFormType] = React.useState('create');
    const [force, refetch] = React.useReducer(x => x + 1, 0);
    const [anchorEl, setAnchor] = React.useState(null);
    const [target, setTarget] = React.useState(null);
    React.useEffect(() => {
        fetch('/api/sessions/find').then(res => {
            res.json().then(r => setData(r));
        });
    }, [force]);

    // this is the card vert menu in the card actions
    const handleSessionOptionsClick = (e, sessionId) => {
        e.preventDefault();
        setAnchor(e.currentTarget);
        // any menu action now has 'this' session as the target for any subsequent operations
        setTarget(sessionId);
    };
    const handleSessionOptionsClose = () => {
        setAnchor(null);
        setTarget(null);
    };

    // edit & delete are options inside the card actions
    const handleEdit = () => {
        // close the popout menu
        setAnchor(null);
        // set the form type
        setFormType('update');
        // open the form
        setFormOpen(true);
    };
    const handleDelete = () => {
        fetch('/api/sessions/delete', {
            method: 'POST',
            body: JSON.stringify({ sessionId: target }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            handleSessionOptionsClose();
            refetch();
        });
    };

    const goToSession = sessionId => {
        history.push(`/app/sessions/${sessionId}/live`);
    };
    // TODO: generate menu options based on user role
    // TODO: add ics download option w/ icon, probably inside the session component
    return (
        <Route path='/app/sessions/list'>
            <PageContainer>
                <Dialog open={isFormOpen} onClose={() => setFormOpen(false)}>
                    <Container maxWidth='lg' className={classes.dialogForm}>
                        <SessionForm
                            type={formType}
                            onSubmit={() => {
                                setFormOpen(false);
                                refetch();
                            }}
                            editTarget={target}
                        />
                    </Container>
                </Dialog>
                <SessionList
                    sessions={data}
                    onClickOptions={handleSessionOptionsClick}
                    onClickGoToSession={goToSession}
                />
                <Fab
                    onClick={() => {
                        setFormOpen(true);
                        setFormType('create');
                    }}
                />
                <Menu
                    id='session-options'
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleSessionOptionsClose}
                >
                    <MenuItem onClick={handleEdit}>Edit</MenuItem>
                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                    {/* <MenuItem onClick={handleSessionOptionsClose}>Logout</MenuItem> */}
                </Menu>
            </PageContainer>
        </Route>
    );
}
