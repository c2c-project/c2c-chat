import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Grow from '@material-ui/core/Grow';
import Grid from '@material-ui/core/Grid';

function SessionListItem({ headerProps, description }) {
    const { title, subheader, action } = headerProps;
    return (
        <Grid item xs={12}>
            <Card>
                <CardHeader
                    title={title}
                    subheader={subheader}
                    action={action}
                />
                <CardContent>{description}</CardContent>
            </Card>
        </Grid>
    );
}

SessionListItem.defaultProps = {
    description: ''
};

SessionListItem.propTypes = {
    headerProps: PropTypes.shape({
        title: PropTypes.string.isRequired,
        subheader: PropTypes.string,
        action: PropTypes.node
    }).isRequired,
    description: PropTypes.oneOfType([PropTypes.node, PropTypes.string])
};

const calcTimeout = idx => (idx + 1) * 200;

export default function SessionList({ sessions }) {
    return (
        <List>
            <Grid container justify='center'>
                {sessions.map(
                    ({ _id, speaker, moderator, description }, idx) => (
                        <Grow key={_id} in timeout={calcTimeout(idx)}>
                            <ListItem>
                                <SessionListItem
                                    headerProps={{
                                        title: speaker,
                                        subheader: `Moderator: ${moderator}`
                                    }}
                                    description={description}
                                />
                            </ListItem>
                        </Grow>
                    )
                )}
            </Grid>
        </List>
    );
}

SessionList.propTypes = {
    sessions: PropTypes.arrayOf(
        PropTypes.shape({
            speaker: PropTypes.string.isRequired,
            moderator: PropTypes.string.isRequired,
            description: PropTypes.string
        })
    ).isRequired
};
