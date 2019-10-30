import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';

function Chatbar({ onMessageSend }) {
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
        onMessageSend(msg);
        setMsg('');
    };
    return (
        <TextField
            value={msg}
            id='chatbar'
            label='Message'
            variant='outlined'
            onKeyDown={handleKeyPress}
            onChange={e => setMsg(e.target.value)}
            multiline
            fullWidth
        />
    );
}

Chatbar.propTypes = {
    onMessageSend: PropTypes.func.isRequired
};

export default Chatbar;
