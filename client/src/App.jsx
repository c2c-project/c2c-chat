import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Pages from './pages';

function App() {
    return (
        <BrowserRouter>
            <CssBaseline />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Pages />
            </MuiPickersUtilsProvider>
        </BrowserRouter>
    );
}

export default App;
