import express from 'express';
import passport from 'passport';
import Sessions from '../db/collections/sessions';

const router = express.Router();

// TODO: add role checking here

router.get('/find', (req, res) => {
    Sessions.findAllSessions().then(r => res.json(r));
});

router.get('/find/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    Sessions.findSessionById(sessionId).then(r => {
        res.json(r);
    });
});

router.post('/create', (req, res) => {
    const { form } = req.body;
    Sessions.addSession(form)
        .then(() => res.send({ success: true }))
        .catch(err => {
            console.log(err);
            res.send({ success: false });
        });
});

router.post('/update', (req, res) => {
    const { sessionId, form } = req.body;
    Sessions.updateSession({ sessionId, changes: form })
        .then(r => {
            // console.log(r);
            if (r.modifiedCount === 1) {
                res.send({ success: true });
            }
        })
        .catch(err => console.log(err));
});

router.post('/delete', (req, res) => {
    const { sessionId } = req.body;
    Sessions.removeSession({ sessionId })
        .then(r => {
            if (r.modifiedCount === 1) {
                res.send({ success: true });
            } else {
                res.send({ success: false });
            }
        })
        .catch(err => console.log(err));
});

router.post(
    '/set-question/:sessionId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { sessionId } = req.params;
        
    }
);

module.exports = router;
