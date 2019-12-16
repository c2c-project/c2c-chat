import React from 'react';
import { Route } from 'react-router-dom';
import SessionList from '../components/SessionList';

const hardCoded = [
    { speaker: 'speaker', moderator: 'moderator', description: 'description' }
];

export default function Sessions() {
    return (
        <Route path='/sessions'>
            <SessionList sessions={hardCoded} />
        </Route>
    );
}
