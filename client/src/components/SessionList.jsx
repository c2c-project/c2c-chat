/* eslint-disable react/jsx-curly-newline */
import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Grow from '@material-ui/core/Grow';
import Grid from '@material-ui/core/Grid';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CardActions from '@material-ui/core/CardActions';
// import ArrowRightIcon from '@material-ui/icons/ArrowRightAltOutlined';
import { makeStyles } from '@material-ui/core/styles';
import GateKeep from './GateKeep';

const useStyles = makeStyles({
    button: {
        marginLeft: 'auto'
    }
});

function SessionListItem({ headerProps, description, onClickGoToSession }) {
    const { title, subheader, action } = headerProps;
    const classes = useStyles();
    return (
        <Grid item xs={12}>
            <Card>
                <CardHeader
                    title={title}
                    subheader={subheader}
                    action={action}
                />
                <CardContent>{description}</CardContent>
                <CardActions>
                    <Button
                        color='primary'
                        // variant='outlined'
                        className={classes.button}
                        onClick={onClickGoToSession}
                    >
                        Go
                    </Button>
                    {/* <IconButton
                        className={classes.button}
                        onClick={onClickGoToSession}
                    >
                        <ArrowRightIcon />
                    </IconButton> */}
                </CardActions>
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
    description: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    onClickGoToSession: PropTypes.func.isRequired
};

const calcTimeout = idx => (idx + 1) * 200;

export default function SessionList({
    sessions,
    onClickOptions,
    onClickGoToSession
}) {
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
                                        subheader: `Moderator: ${moderator}`,
                                        action: (
                                            <GateKeep
                                                local
                                                permissions={{
                                                    requiredAny: [
                                                        'moderator',
                                                        'admin'
                                                    ]
                                                }}
                                            >
                                                <IconButton
                                                    onClick={e =>
                                                        onClickOptions(e, _id)
                                                    }
                                                    aria-label='session options'
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </GateKeep>
                                        )
                                    }}
                                    onClickGoToSession={() =>
                                        onClickGoToSession(_id)
                                    }
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
    ).isRequired,
    onClickOptions: PropTypes.func.isRequired,
    onClickGoToSession: PropTypes.func.isRequired
};
