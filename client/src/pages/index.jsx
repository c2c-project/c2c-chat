import React from 'react';
import LoginPage from './LoginPage';
import Sessions from './Sessions';
import Chat from './Chat';

export default function Routes() {
    return (
        <>
            <LoginPage />
            <Sessions />
            <Chat />
        </>
    );
}
