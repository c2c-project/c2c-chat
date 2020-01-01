import React from 'react';
import { Redirect } from 'react-router-dom';
import useJwt from '../hooks/useJwt';

// eslint-disable-next-line
export default function LoggedIn({ children }) {
    const [jwt] = useJwt();
    return jwt ? children : <Redirect to='/logout' />;
}
