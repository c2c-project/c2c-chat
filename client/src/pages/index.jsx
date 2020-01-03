import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Sessions from './Sessions';
import Chat from './Chat';
import Logout from './Logout';
import Login from './LoginPage';
import Layout from '../layout';
import LoggedIn from '../components/LoggedIn';

export default function Routes() {
    return (
        <Switch>
            <Route path='/app/:title'>
                <LoggedIn>
                    <Layout>
                        <Route path='/app/sessions/list'>
                            <Sessions />
                        </Route>
                        <Route path='/app/sessions/:roomId/live'>
                            <Chat />
                        </Route>
                    </Layout>
                </LoggedIn>
            </Route>
            <Route exact path='/login'>
                <Login />
            </Route>
            <Route exact path='/logout'>
                <Logout />
            </Route>
            <Route path='/'>
                <Redirect to='/login' />
            </Route>
        </Switch>
    );
}
