import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export default function Logout() {
    return (
        <Route path='/logout'>
            <Redirect to='/login' />
        </Route>
    );
}
