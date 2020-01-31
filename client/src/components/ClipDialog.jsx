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
import { useEffect } from 'react';

 


export default function ClipDialog({timeStamp, addClip, currentClip, editClips, editMode, editModeOff}) {
    
    const [open, setOpen] = React.useState(editMode);
    const [clipTime, setClipTime] = React.useState({
        start: currentClip.start,
        end: currentClip.end,
    });

    const [newQuestion, setQuestion] = React.useState('New Question');
    const handleNewQuestion = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(event.target.value);
    };


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        // create new clip
        editModeOff();
        setOpen(false);
    };

    const handleAddingClip = () => {
        handleClickOpen();
    };

    function handleClipTime(x,y){
        setClipTime({
            start:x,
            end: y,
            question: newQuestion,
        });
    }

    //add or edit clip
    const confirmAction = () => {
            const newClip = {
                text: newQuestion,
                start: clipTime.start,
                end: clipTime.end,
                category: {
                    tag: 'medium',
                    color: '#018f69',
                },
                link: {
                    text: 'Click Here',
                }
            };
        if(editMode){
            //modify currentClip
            console.log(`editing the clip: ${currentClip.text}`);
            setClipTime({...clipTime, question: newQuestion});
            editClips(clipTime);
        }
        else{
            addClip(newClip);
        }

        handleClose();
    }



    return (
        <div>
            {/* <Button variant='outlined' color='primary' onClick={handleClickOpen}>
        Clip v.2
            </Button> */}
            <Fab  onClick={() =>{
                //create new initial clip. 
                setClipTime({
                    start: timeStamp,
                    end: timeStamp + 30,
                })
                handleClickOpen();

                
            }}/>
            <Dialog open={open || editMode} onClose={handleClose} aria-labelledby='form-dialog-title'>
                <DialogTitle id='form-dialog-title'>Subscribe</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Current Question:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='name'
                        label='edit question here'
                        type='email'
                        onChange={handleNewQuestion}
                        fullWidth
                    />
                    <RangeSlider timeStamp={clipTime} confirm={handleClipTime} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='primary'>
                        Cancel
                    </Button>
                    <Button onClick={confirmAction} color='primary'>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

ClipDialog.defaultProps = {
    timeStamp: 0,
    question: 'New Question TADA'
};

ClipDialog.propTypes = {
    timeStamp: PropTypes.number,
    question: PropTypes.string,
};