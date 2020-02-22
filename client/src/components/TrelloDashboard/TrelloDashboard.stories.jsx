/* eslint-disable */
import React from 'react';
import TrelloDashboard from './Dashboard';

export default { title: 'Trello Dashboard' };

export function Board() {
    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <TrelloDashboard />
        </div>
    );
}
