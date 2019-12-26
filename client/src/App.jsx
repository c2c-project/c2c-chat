import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Layout from './layout';
import Pages from './pages';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/Logout';

function App() {
    return (
        <BrowserRouter>
            <CssBaseline />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <LoginPage />
                <LogoutPage />
                <Route path='/app/:title'>
                    <Layout>
                        <Pages />
                    </Layout>
                </Route>
                <Route exact path='/'>
                    <Redirect to='/login' />
                </Route>
            </MuiPickersUtilsProvider>
        </BrowserRouter>
    );
}

export default App;
