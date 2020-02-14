import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
// import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import RangeSlider from './RangeSlider';
import FullScreenDialog from './Dialoag';


export default function ClipDialog({
    currentClip,
    confirm,
    openState,
    modeOff
}) {
    const [form, setForm] = React.useState(currentClip);
    useEffect(() => {
        console.log(`form: ${form.question} ${form.start} ${form.end}`);
        // console.log(`currClip: ${currentClip.question} ${currentClip.start} ${currentClip.end}`);
    }, [form]);

    const handleClose = () => {
        // create new clip
        modeOff();
    };

    // case: editing the timeframe without the question.
    function handleClipTime(start, end) {
        setForm({ ...form, start, end });
    }

    // e is pre-defined event object to stop form from refreshing.
    // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
    const handleSubmit = e => {
        e.preventDefault();

        // if (editMode) {
        //     editClips(form);
        // } else {
        // console.log(`Changed the question to ${form.question}`);
        const newClip = {
            question: form.question,
            start: form.start,
            end: form.end,
            category: {
                tag: 'medium',
                color: '#018f69'
            },
            link: {
                text: 'Click Here'
            }
        };
        confirm(newClip);
        // }

        handleClose();
    };

    return (
        <div>
            <FullScreenDialog
                open={false || openState}
                onClose={handleClose}
                aria-labelledby='form-dialog-title'
            >
                {/* with a form tag you don't need to create onClick events for your buttons */}
                <form onSubmit={handleSubmit}>
                    <DialogTitle id='form-dialog-title'>Subscribe</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Current Question:</DialogContentText>
                        <TextField
                            autoFocus
                            margin='dense'
                            id='name'
                            label='edit question here'
                            type='text'
                            defaultValue={currentClip.question || ''}
                            onChange={event => {
                                const question = event.target.value;
                                setForm({ ...form, question });
                            }}
                            fullWidth
                        />
                        <RangeSlider
                            timeStamp={currentClip}
                            confirm={handleClipTime}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color='primary'>
                            Cancel
                        </Button>
                        {/* no need for a onClick, a button inside a form tag will execute its onSubmit */}
                        <Button type='submit' color='primary'>
                            Confirm
                        </Button>
                    </DialogActions>
                </form>
            </FullScreenDialog>
        </div>
    );
}

// ClipDialog.defaultProps = {
//     currentClip: PropTypes.shape({
//         question: '',
//         start:2,
//         end: 23,
//     }),
// };

// ClipDialog.propTypes = {
//     currentClip: PropTypes.shape({
//         question: PropTypes.string,
//         start: PropTypes.number,
//         end: PropTypes.number,
//     }),
//     confirm: PropTypes.func.isRequired,
//     openState: PropTypes.bool.isRequired,
//     modeOff: PropTypes.func.isRequired,

// };
