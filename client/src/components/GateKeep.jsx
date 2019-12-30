import React from 'react';
import PropTypes from 'prop-types';

export default function GateKeep({ permissions, children }) {
    const [isLoading, setLoading] = React.useState(true);
    const [isAllowed, setAllowed] = React.useState(false);
    React.useEffect(() => {
        fetch('/api/users/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `bearer ${window.localStorage.jwt}`
            },
            body: JSON.stringify(permissions)
        }).then(res => {
            res.json().then(({ allowed }) => {
                setLoading(false);
                setAllowed(allowed);
            });
        });
    });
    return !isLoading && isAllowed ? children : <></>;
}

GateKeep.propTypes = {
    permissions: PropTypes.shape({
        requiredAny: PropTypes.arrayOf(PropTypes.string),
        requiredAll: PropTypes.arrayOf(PropTypes.string),
        requiredNot: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired
};
