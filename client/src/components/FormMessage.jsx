import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import useJwt from '../hooks/useJwt';
import useSnack from '../hooks/useSnack';

export default function FormMessage({ onSubmit, targetMsg }) {
    const [message, setMessage] = React.useState(targetMsg.message);
    const [jwt] = useJwt();
    const [snack] = useSnack();

    const handleSubmit = e => {
        e.preventDefault();
        fetch('/api/chat/update-message/', {
            method: 'POST',
            headers: {
                Authorization: `bearer ${jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    newMessage : message,
                    messageId : targetMsg._id
                }
            )
        })
            .then(r => {
                r.json().then(res => {
                    if (res.success){
                        snack('Message edited sucessfully', 'success');
                        onSubmit();
                    }
                    else {
                        snack('Something went wrong! Try again.', 'error');
                    }
                });
            })
            .catch(err => {
                console.log(err);
                snack('Something went wrong! Try again.', 'error');
            })
    };

    return (
        <form onSubmit={handleSubmit}>
            <Grid container justify='center' spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        label='Yor New Message Goes Here'
                        fullWidth
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
    );
}

FormMessage.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    targetMsg: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired
    }).isRequired,
};
