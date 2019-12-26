import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Layout from './layout';
import Pages from './pages';
import LoginPage from './pages/LoginPage';

function App() {
    return (
        <BrowserRouter>
            <CssBaseline />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Switch>
                    <Route exact path='/'>
                        <Redirect to='/login' />
                    </Route>
                    <LoginPage />
                    <Route path='/:title'>
                        <Layout>
                            <Pages />
                        </Layout>
                    </Route>
                </Switch>
            </MuiPickersUtilsProvider>
        </BrowserRouter>
    );
}

export default App;
