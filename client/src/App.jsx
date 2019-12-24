import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter, Route } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Layout from './layout';
import Pages from './pages';

function App() {
    return (
        <BrowserRouter>
            <CssBaseline />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Route path='/:title'>
                    <Layout>
                        <Pages />
                    </Layout>
                </Route>
            </MuiPickersUtilsProvider>
        </BrowserRouter>
    );
}

export default App;
