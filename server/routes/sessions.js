import express from 'express';
import passport from 'passport';
import Sessions from '../db/collections/sessions';
import { setCurrentQuestion } from '../lib/socket-io';
import { errorHandler } from '../lib/errors';

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
            .catch(err => errorHandler(err, res));
    }
);

router.post(
    '/update',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
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
            .catch(err => errorHandler(err, res));
    }
);

router.post(
    '/delete',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
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
            .catch(err => errorHandler(err, res));
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
        setQuestion(sessionId, question)
            .then(() => {
                setCurrentQuestion(sessionId, question);
                res.status(200).send();
            })
            .catch(err => errorHandler(err, res));
    }
);

module.exports = router;
