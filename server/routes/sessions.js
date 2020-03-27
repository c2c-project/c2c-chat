import express from 'express';
import passport from 'passport';
import Sessions from '../db/collections/sessions';
import { setCurrentQuestion } from '../lib/socket-io';

const router = express.Router();

// NOTE: remove passport auth if we don't want to require the user to be logged in
// only need to verify that the user is logged in, req param does not matter
router.get(
    '/find',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        Sessions.findAllSessions()
            .then(r => res.json(r))
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
            .then(r => {
                res.json(r);
            })
            .catch(next);
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
            .then(mongoRes =>
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
            .then(mongoRes =>
                res
                    .status(200)
                    .send(
                        `Successfully updated ${mongoRes.modifiedCount} session!`
                    )
            )
            .catch(next);
    }
);

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
            .then(mongoRes =>
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

module.exports = router;
