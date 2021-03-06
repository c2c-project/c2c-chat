import express from 'express';
import passport from 'passport';
import Sessions from '../db/collections/sessions';
import Questions from '../db/collections/questions';
import { setCurrentQuestion } from '../lib/socket-io';

const router = express.Router();

router.route('/').get((req, res) => {
    console.log('Getting sessions: ');
    Sessions.findAllSessions()
        .then((sess) => {
            res.json(sess);
        })
        .catch((err) => res.status(400).json(`Error: ${err}`));
});

// NOTE: remove passport auth if we don't want to require the user to be logged in
// only need to verify that the user is logged in, req param does not matter
router.get(
    '/find',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        Sessions.findAllSessions()
            .then((r) => res.json(r))
            .catch(next);
    }
);

// NOTE: remove passport auth if we don't want to require the user to be logged in
router.get(
    '/find/:sessionId',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { sessionId } = req.params;
        Sessions.findSessionById(sessionId)
            .then((r) => {
                res.json(r);
            })
            .catch(next);
    }
);

router.get(
    '/find-summary/:sessionId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { sessionId } = req.params;
        Questions.countQuestionsBySession(sessionId);
    }
);

router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { form } = req.body;
        const { user } = req;
        const addSession = Sessions.privilegedActions('ADD_SESSION', user);
        addSession(form)
            .then((mongoRes) =>
                res
                    .status(200)
                    .send(
                        `Successfully created ${mongoRes.modifiedCount} session!`
                    )
            )
            .catch(next);
    }
);

router.post(
    '/update',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { sessionId, form } = req.body;
        const { user } = req;
        const updateSession = Sessions.privilegedActions(
            'UPDATE_SESSION',
            user
        );
        updateSession(sessionId, form)
            .then((mongoRes) =>
                res
                    .status(200)
                    .send(
                        `Successfully updated ${mongoRes.modifiedCount} session!`
                    )
            )
            .catch(next);
    }
);
////
router.post(
    '/updateClips',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        console.log(req.body);
        const { sessionId, changes } = req.body;

        Sessions.updateSessionClips({ sessionId, changes })
            .then((r) => res.json(r))
            .catch((err) => console.log('Error', err));
    }
);
////
router.post(
    '/delete',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { sessionId } = req.body;
        const { user } = req;
        const deleteSession = Sessions.privilegedActions(
            'DELETE_SESSION',
            user
        );
        deleteSession(sessionId)
            .then((mongoRes) =>
                res
                    .status(200)
                    .send(
                        `Successfully deleted ${mongoRes.modifiedCount} document!`
                    )
            )
            .catch(next);
    }
);

router.post(
    '/set-question/:sessionId',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { user } = req;
        const { sessionId } = req.params;
        const { question } = req.body;
        const setQuestion = Sessions.privilegedActions('SET_QUESTION', user);
        setQuestion(sessionId, question)
            .then(() => {
                setCurrentQuestion(sessionId, question);
                res.status(200).send();
            })
            .catch(next);
    }
);

router.get(
    '/session-summary',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Sessions.findAllSessions().then((r) => {
            res.json(r);
        });
    }
);

// remove above
// create a router.post that will post the new data of start

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
