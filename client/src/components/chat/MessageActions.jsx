import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { useParams } from 'react-router-dom';
import Dialog from '../Dialoag';
import FormMessage from '../FormMessage';
import Bold from '../Bold';
import useJwt from '../../hooks/useJwt';
import useSnack from '../../hooks/useSnack';

export default function MessageActions({ targetMsg, onClick }) {
    const [jwt] = useJwt();
    const [snack] = useSnack();
    const { roomId } = useParams();
    const [isEditOpen, setEditOpen] = React.useState(false);

    // // const newMessage = {message: 'test message'};
    // const handleEdit = () => {
    //     // Updates a message to  "test message". Data is passed in the body of the request
    //     fetch('/api/chat/update-message/', {
    //         method: 'POST',
    //         headers: {
    //             Authorization: `bearer ${jwt}`,
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(
    //             {
    //                 newMessage : 'Hello from Front end',
    //                 messageId : targetMsg._id
    //             }
    //         )
    //     })
    //         .then(r => {
    //             r.json().then(res => {
    //                 if (res.success){
    //                     // targetMsg.message = res.editedMessage
    //                     snack('Message edited sucessfully', 'success');
    //                     // Toggle the target message to close dialog window
    //                     onClick();
    //                 }
    //                 else {
    //                     snack('Something went wrong! Try again.', 'error');
    //                 }
    //             });
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             snack('Something went wrong! Try again.', 'error');
    //         })
    //     // To do Handle Promise( then and catch )
    // };

    const handleDelete = () => {
        fetch(`/api/chat/remove-message/${roomId}/${targetMsg._id}`, {
            method: 'POST',
            headers: {
                Authorization: `bearer ${jwt}`,
                'Content-Type': 'application/json'
            }
        })
            .then(r => {
                r.json().then(res => {
                    if (res.success) {
                        snack('Successfully moderated messsage', 'success');
                        onClick();
                    } else {
                        snack('Something went wrong! Try again.', 'error');
                    }
                });
            })
            .catch(err => {
                console.log(err);
                snack('Something went wrong! Try again.', 'error');
            });
    };
    // const handleSetCurrent = () => {
    // fetch(`/api/sessions/set-question/:${roomId}`, {
    //     method: 'POST',
    //     headers: {
    //         Authorization: `bearer ${jwt}`,
    //         'Content-Type': 'application/json'
    //     }    
    // }).then( res => {

    // });
    // };
    return (
        <Grid container justify='center' spacing={3}>
            <Grid item xs={12}>
                <Grid container>
                    <Grid container>
                        <Grid item xs='auto'>
                            <Bold>{`${targetMsg.username}:`}</Bold>
                        </Grid>
                        <Grid item xs='auto'>
                            <Typography color='textPrimary' variant='body1'>
                                {targetMsg.message}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {/* <Grid item xs={12}>
                <Button
                    color='secondary'
                    variant='contained'
                    fullWidth
                    onClick={handleSetCurrent}
                >
                    Set as Current Question
                </Button>
            </Grid> */}
            <Grid item xs={12}>
                <Button
                    color='secondary'
                    variant='contained'
                    fullWidth
                    onClick={() => setEditOpen(true)}
                >
                    Edit
                </Button>
                <Dialog open={isEditOpen} onClose={() => setEditOpen(false)}>
                    <Container
                        maxWidth='md'
                    >
                        <Typography variant='h4'>
                            Edit the Message
                        </Typography>
                        <FormMessage
                            onSubmit={() => setEditOpen(false)}
                            targetMsg={targetMsg}
                        />
                    </Container>
                </Dialog>
            </Grid>

            <Grid item xs={12}>
                <Button
                    color='secondary'
                    variant='contained'
                    fullWidth
                    onClick={handleDelete}
                >
                    Moderate/Hide
                </Button>
            </Grid>
        </Grid>
    );
}

MessageActions.defaultProps = {
    onClick: () => {}
};

MessageActions.propTypes = {
    targetMsg: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired
    }).isRequired,
    onClick: PropTypes.func
};
