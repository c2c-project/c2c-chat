import express from 'express';
import Sessions from '../db/collections/sessions';

const router = express.Router();

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
        .then(() => res.send('success'))
        .catch(err => {
            console.log(err);
            res.send('error');
        });
});

router.post('/update', (req, res) => {
    const { sessionId, form } = req.body;
    console.log(form);
    Sessions.updateSession({ sessionId, changes: form })
        .then(r => {
            // console.log(r);
            if (r.modifiedCount === 1) {
                res.send('success');
            }
        })
        .catch(err => console.log(err));
});

router.post('/delete', (req, res) => {
    const { sessionId } = req.body;
    Sessions.removeSession({ sessionId })
        .then(r =>
            r.modifiedCount === 1 ? res.send('success') : res.send('err')
        )
        .catch(err => console.log(err));
});

module.exports = router;
