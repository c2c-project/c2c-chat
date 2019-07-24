import React from 'react';
import TextField from '@material-ui/core/TextField';

function Chatbar() {
    const [msg, setMsg] = React.useState('');
    const handleKeyPress = event => {
        if (event.key !== 'Enter') {
            return;
        }
        if (event.key === 'Enter' && event.shiftKey) {
            return;
        }
        event.preventDefault();
        console.log('Msg: ', msg);
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

export default Chatbar;
