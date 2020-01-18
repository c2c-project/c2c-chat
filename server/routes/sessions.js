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

module.exports = router;
