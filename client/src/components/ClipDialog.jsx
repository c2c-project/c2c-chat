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
 


export default function ClipDialog({timeStamp, question, addClip}) {
    
    const [open, setOpen] = React.useState(false);
    const [clipTime, setClipTime] = React.useState({
        start: 1,
        end: 30,
    });
    const [newQuestion, setQuestion] = React.useState(question);
    
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        // create new clip
        
        const newClip = {
            text: 'newQuestion',
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

        addClip(newClip);
        setOpen(false);
    };

    function handleClipTime(x,y){
        setClipTime({
            start:x,
            end: y,
        });
    } 

    return (
        <div>
            <Button variant='outlined' color='primary' onClick={handleClickOpen}>
        Open form dialog
            </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
                <DialogTitle id='form-dialog-title'>Subscribe</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Current Question:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin='dense'
                        id='name'
                        label='Email Address'
                        type='email'
                        fullWidth
                    />
                    <RangeSlider timeStamp={timeStamp} question={setQuestion} confirm={handleClipTime} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='primary'>
            Cancel
                    </Button>
                    <Button onClick={handleClose} color='primary'>
            Subscribe
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