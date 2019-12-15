import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';

function SessionListItem({ headerProps, description }) {
    return (
        <Grid item xs={12}>
            <Card>
                <CardHeader {...headerProps} />
                <CardContent>{description}</CardContent>
            </Card>
        </Grid>
    );
}

SessionListItem.propTypes = {
    headerProps: PropTypes.shape({
        primary: PropTypes.string.isRequired,
        secondary: PropTypes.string,
        action: PropTypes.node
    }).isRequired,
    description: PropTypes.oneOfType([PropTypes.node, PropTypes.string])
};

export default function SessionList({ sessions }) {
    return (
        <List>
            <Grid container justify='center'>
                {sessions.map(({ speaker, moderator, description }) => (
                    <ListItem>
                        <SessionListItem
                            headerProps={{
                                primary: speaker,
                                secondary: moderator
                            }}
                            description={description}
                        />
                    </ListItem>
                ))}
            </Grid>
        </List>
    );
}
