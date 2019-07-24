import React from 'react';
import Chatbar from './Chatbar';
import useMessages from '../hooks/useMessages';

function ChatWindow() {
    const [messages, sendMsg] = useMessages();
    return <Chatbar sendMsg={sendMsg} />;
}

export default ChatWindow;
