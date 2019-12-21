import React from 'react';
import { Route } from 'react-router-dom';
import SessionList from '../components/SessionList';

// const hardCoded = [
//     { speaker: 'speaker', moderator: 'moderator', description: 'description' }
// ];

export default function Sessions() {
    const [data, setData] = React.useState([]);
    React.useEffect(() => {
        fetch('/api/sessions').then(res => {
            res.json().then(r => setData(r));
        });
    }, []);
    console.log(data);
    return (
        <Route path='/sessions'>
            <SessionList sessions={data} />
        </Route>
    );
}
