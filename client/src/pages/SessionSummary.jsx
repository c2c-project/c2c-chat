// TODO: joseph 
/**
 * Use the components you made here and do the fetching here
 *  or at the component level depending on your design choice
 * Examples of fetch can be found by google
 *  public fetches with no auth src/pages/sessions.jsx
 * fetches with auth in src/components/chat/MessageActions.jsx
 * 
 */

import React from 'react';
import useJwt from '../hooks/useJwt';
import PageContainer from '../layout/PageContainer';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles({
    card: {
      maxWidth: 345,
    },
    media: {
      height: 140,
    },
  });

export default function SessionSummary() {
    const classes = useStyles();
    const history = useHistory();

    const [data, setData] = React.useState([]);
    const [force, refetch] = React.useReducer(x => x + 1, 0);
    const [jwt] = useJwt();

    const goToSession = (sessionId, messages, duration) => {
        // TODO: change this when I change how I get the session data
        localStorage.setItem(
            'session',
            JSON.stringify(data.find(session => sessionId === session._id))
        );
        history.push({
            pathname: `/app/sessions/${sessionId}/session-summary`,
            state: { 
                sent: messages.sent,
                asked: messages.asked,
                unanswered: messages.unanswered,
                duration: duration
            }
        });
    };

    React.useEffect(() => {
        fetch('/api/sessions/session-summary', {
            headers: {
                Authorization: `bearer ${jwt}`
            }
        }).then(res => {
            res.json().then(r => setData(r));
        });
    }, [force]);

      return(
        <PageContainer>{data.map(
            ({ _id, speaker, moderator, description, messages, duration }, idx) => ( 
                <Card className={classes.card}>
                    <CardActionArea>
                        <CardMedia
                        className={classes.media}
                        image="/static/images/cards/contemplative-reptile.jpg"
                        title="Contemplative Reptile"
                        />
                        <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            {speaker}'s Session
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            Details about this session
                        </Typography>
                        </CardContent>
                    </CardActionArea>
                    <CardActions>
                        <Button size="small" color="primary">
                        Share
                        </Button>
                        <Button 
                        size="small" 
                        color="primary"
                        onClick={() => goToSession(_id, messages, duration)}
                        >
                        View Summary
                        </Button>
                    </CardActions>
                </Card>
                )
        )}
        </PageContainer>
      );
   
}


/*
router.get(
    '/find/:sessionId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { sessionId } = req.params;
        Sessions.findSessionById(sessionId).then(r => {
            res.json(r);
        });
    }
);
    const onSubmit = e => {
        e.preventDefault();
        fetch(`/api/sessions/${type}`, {
            method: 'POST',
            body:
                type === 'create'
                    ? JSON.stringify({ form: state })
                    : JSON.stringify({ form: state, sessionId: editTarget }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            // TODO: handle errors later
            cb();
        });
    };
    this is sent from sessions.js from route
    router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { form } = req.body;
        // TODO: add role checking
        Sessions.addSession(form)
            .then(() => res.send({ success: true }))
            .catch(err => {
                console.log(err);
                res.send({ success: false });
            });
    }
);

    as you can see the type POST is sent to router.post and ${type} is create if
    passed as a prop and used to fill in that URL `/api/sessions/${type}`




*/