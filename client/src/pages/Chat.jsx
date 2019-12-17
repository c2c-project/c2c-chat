import React from 'react';
import { Route, useParams } from 'react-router-dom';
import ChatWindow from '../components/chat';

const ChatRoom = () => {
    const { roomId } = useParams();
    return (
        <div style={{ height: '100%', maxHeight: '88vh' }}>
            <ChatWindow roomId={roomId} />
        </div>
    );
};

export default function Chat() {
    return (
        <Route path='/chat/:roomId'>
            <ChatRoom />
        </Route>
    );
}
