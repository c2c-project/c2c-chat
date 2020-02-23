import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Sessions from './Sessions';
import Chat from './Chat';
import Logout from './Logout';
import Login from './Login';
import Layout from '../layout';
import LoggedIn from '../components/LoggedIn';
import LoginTemp from './LoginTemp';
import Register from './Register';
import Verification from './Verification';

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
            <Route exact path='/register'>
                <Register />
            </Route>
            <Route exact path='/login-temporary'>
                <LoginTemp />
            </Route>
            <Route exact path='/logout'>
                <Logout />
            </Route>
            <Route path='/verification/:userId' >
                <Verification />
            </Route>
            <Route path='/'>
                <Redirect to='/login' />
            </Route>
        </Switch>
    );
}
