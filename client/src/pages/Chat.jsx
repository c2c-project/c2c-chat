import React from 'react';
import { Route, useParams } from 'react-router-dom';
import ChatWindow from '../components/chat';

const ChatRoom = () => {
    const { roomId } = useParams();
    console.log(roomId);
    return <ChatWindow roomId={roomId} />;
};

export default function Chat() {
    return (
        <Route path='/chat/:roomId'>
            <ChatRoom />
        </Route>
    );
}
