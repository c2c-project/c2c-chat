import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import RangeSlider from './RangeSlider';
import Fab from './Fab';
import FullScreenDialog from './Dialoag';

export default function ClipDialog({
    timeStamp,
    addClip,
    currentClip,
    editClips,
    editMode,
    editModeOff
}) {
    const initForm = {
        start: timeStamp,
        end: timeStamp + 30,
        question: ''
    };

    const [open, setOpen] = React.useState(editMode);
    const [form, setForm] = React.useState(
        editMode ? {
            start: currentClip.start,
            end: currentClip.end,
            question: currentClip.question,
        } : initForm
    );

    const [clipTime, setClipTime] = React.useState({
        start: currentClip.start,
        end: currentClip.end
    });

    // const [newQuestion, setQuestion] = React.useState('New Question');
    // const handleNewQuestion = event => {
    //     setQuestion(event.target.value);
    // };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        // create new clip
        editModeOff();
        setOpen(false);
    };


    function handleClipTime(x, y) {

        setForm({ ...form, start: x, end: y });
    }

    // e is pre-defined event object to stop form from refreshing.
    // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
    const handleSubmit = e => {
        e.preventDefault();

        if (editMode) {
            editClips(form);
        } else {
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
            addClip(newClip);
        }

        handleClose();
    };

    // add or edit clip
    // const confirmAction = () => {
    //     const newClip = {
    //         text: newQuestion,
    //         start: clipTime.start,
    //         end: clipTime.end,
    //         category: {
    //             tag: 'medium',
    //             color: '#018f69'
    //         },
    //         link: {
    //             text: 'Click Here'
    //         }
    //     };
    //     if (editMode) {
    //         // modify currentClip
    //         console.log(`editing the clip: ${currentClip.text}`);
    //         setClipTime({ ...clipTime, question: newQuestion });
    //         editClips(clipTime);
    //     } else {
    //         addClip(newClip);
    //     }

    //     handleClose();
    // };

    return (
        <div>
            {/* <Button variant='outlined' color='primary' onClick={handleClickOpen}>
        Clip v.2
            </Button> */}
            <Fab
                onClick={() => {
                    // create new initial clip.
                    setClipTime({
                        start: timeStamp,
                        end: timeStamp + 30
                    });
                    handleClickOpen();
                }}
            />
            <FullScreenDialog
                open={open || editMode}
                onClose={handleClose}
                aria-labelledby='form-dialog-title'
            >
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
                            defaultValue={currentClip.question}
                            onChange={event => {
                                const question = event.target.value;
                                setForm({ ...form, question });
                            }}
                            fullWidth
                        />
                        <RangeSlider
                            timeStamp={initForm}
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

ClipDialog.defaultProps = {
    timeStamp: 0,
    question: 'New Question TADA'
};

ClipDialog.propTypes = {
    timeStamp: PropTypes.number,
    question: PropTypes.string
};
