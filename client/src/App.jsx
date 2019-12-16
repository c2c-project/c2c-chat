import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter, Route } from 'react-router-dom';
import Layout from './layout';
import Pages from './pages';

function App() {
    return (
        <BrowserRouter>
            <CssBaseline />
            <Route path='/:title'>
                <Layout>
                    <Pages />
                </Layout>
            </Route>
        </BrowserRouter>
    );
}

export default App;
