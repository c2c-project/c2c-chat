import jwtDecode from 'jwt-decode';
// import React from 'react';
// not technically a "hook" -- not stateful and no side effects but yeah
export default function useJwt() {
    const jwt = localStorage.getItem('jwt');
    // React.useEffect(() => {
    //     console.log('in here');
    //     window.onstorage = () => {
    //         console.log(window.localStorage);
    //     };
    // });
    // don't decode unless the token exists
    const rawToken = jwt ? jwtDecode(jwt) : null;
    return [jwt, rawToken];
}
