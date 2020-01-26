import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import { useEffect } from 'react';

const useStyles = makeStyles({
    root: {
        width: 300,
    },
});


function valuetext(value) {
    const minutes = parseInt(value / 60, 10);
    const sec = value % 60;
    return `${minutes}:${sec}`;
}

export default function RangeSlider({timeStamp, question, confirm}) {
    const classes = useStyles();
    const curr = parseInt(timeStamp);
    const [value, setValue] = React.useState([curr, curr + 30]) ;
    useEffect(() => {
        confirm(value[0],value[1]);
    },[value]);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div className={classes.root}>
            <Typography id='range-slider' gutterBottom>
                Clip Time-Frame
            </Typography>
            <Slider
                min={0}
                max={curr + 60}
                value={value}
                onChange={handleChange}
                valueLabelDisplay='auto'
                aria-labelledby='range-slider'
                getAriaValueText={valuetext}
                valueLabelFormat={valuetext}
            />
        </div>
    );
}

RangeSlider.defaultProps = {
    timeStamp: 0,
    question: 'New Question Here',
};

RangeSlider.propTypes = {
    timeStamp: PropTypes.number,
    question: PropTypes.string,
    
}