import express from 'express';
import passport from 'passport';
import Sessions from '../db/collections/sessions';
import ioInterface from '../lib/socket-io';

const router = express.Router();

// NOTE: remove passport auth if we don't want to require the user to be logged in
router.get(
    '/find',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Sessions.findAllSessions().then(r => res.json(r));
    }
);

// NOTE: remove passport auth if we don't want to require the user to be logged in
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

router.post(
    '/update',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { sessionId, form } = req.body;
        // TODO: add role checking
        Sessions.updateSession({ sessionId, changes: form })
            .then(r => {
                // console.log(r);
                if (r.modifiedCount === 1) {
                    res.send({ success: true });
                }
            })
            .catch(err => console.log(err));
    }
);

router.post(
    '/delete',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { sessionId } = req.body;
        // TODO: add role checking
        Sessions.removeSession({ sessionId })
            .then(r => {
                if (r.modifiedCount === 1) {
                    res.send({ success: true });
                } else {
                    res.send({ success: false });
                }
            })
            .catch(err => console.log(err));
    }
);

router.post(
    '/set-question/:sessionId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { sessionId } = req.params;
        const { question } = req.body;
        const setQuestion = Sessions.privilegedActions('SET_QUESTION', user);
        setQuestion(sessionId, question).then(() => {
            ioInterface
                .io()
                .of('/questions')
                .to(sessionId)
                .emit('set-question', question);
            res.send({ success: true });
        });
    }
);

router.get(
    '/session-summary',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Sessions.findAllSessions().then(r => res.json(r));
    }
);
router.get(
    '/session-summary/:sessionId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { sessionId } = req.params;
        Sessions.findSessionById(sessionId).then(r => {
            res.json(r);
        });
    }
);

// TODO: joseph
/**
 * It's up to you, whichever option you would want to use, the best option that's not listed is actually to use
 * graphql, but we have not implemented that at the moment.  Maybe that's something we can do after this feature.
 * Two options:
 * 
 * Option 1
 * Add a route here; maybe /session-summary/:sessionId
 * This route should return all the necessary information for the session summary page
 * so that the client can display accurate information
 * 
 * Option 2:
 * Add multiple routes; /session-data/user-count/:sessionId, /session-data/duration/:sessionId, etc.
 * Each route will return a part of the data necessary for the summary page
 * 
 * 
 * Key Differences:
 * 
 * Option 1 is for a page level fetch, meaning that as soon as the page renders, the page itself
 * will make a get request to the route specified in option 1
 * 
 * Option 2 is for component level fetches, meaning that as soon as the component renders
 * the component itself fetches the data
 * 
 * 
 * Tradeoffs:
 *  NOTE: these aren't all the tradeoffs, just some to think about
 * Option 1
 * Pros: called once
 * Cons: Components on client side are harder to re-use on different pages, because the page itself makes the request & may lead to overfetching
 * 
 * Option 2
 * Pros: easy to re-use the component wherever and the data is already fetched
 * Cons: on a page with a lot of these components, there could be many requests
 */

module.exports = router;
