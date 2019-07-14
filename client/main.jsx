import React from 'react';
import { render } from 'react-dom';
import Chatbar from '/src/chat/client/Chatbar';
import '/src/chat/client/socket-io';

Meteor.startup(() => {
    render(<Chatbar />, document.getElementById('react-target'));
});
