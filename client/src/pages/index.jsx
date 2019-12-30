import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Sessions from './Sessions';
import Chat from './Chat';
import Logout from './Logout';
import Login from './LoginPage';
import Layout from '../layout';

export default function Routes() {
    return (
        <>
            <Route path='/app/:title'>
                <Layout>
                    <Route path='/app/sessions/list'>
                        <Sessions />
                    </Route>
                </Layout>
            </Route>
            <Chat />
            <Route path='/login'>
                <Login />
            </Route>
            <Route path='/logout'>
                <Logout />
            </Route>
            <Route exact path='/'>
                <Redirect to='/login' />
            </Route>
        </>
    );
}
