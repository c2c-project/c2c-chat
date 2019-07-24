import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';

function Chatbar({ sendMsg }) {
    const [msg, setMsg] = React.useState('');
    const handleKeyPress = event => {
        if (event.key !== 'Enter') {
            return;
        }
        if (event.key === 'Enter' && event.shiftKey) {
            return;
        }
        event.preventDefault();
        // TODO: send this over the wire
        // console.log('Msg: ', msg);
        sendMsg(msg);
        setMsg('');
    };
    return (
        <TextField
            value={msg}
            id='chatbar'
            variant='outlined'
            onKeyDown={handleKeyPress}
            onChange={e => setMsg(e.target.value)}
            multiline
            fullWidth
        />
    );
}

Chatbar.propTypes = {
    sendMsg: PropTypes.func.isRequired
}

export default Chatbar;
