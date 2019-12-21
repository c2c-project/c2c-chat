import express from 'express';
import Sessions from '../db/collections/sessions';

const router = express.Router();

router.get('/', (req, res) => {
    Sessions.findAllSessions().then(r => res.json(r));
});

router.put('/new-session', (req, res) => {
    const { form } = req.body;
    Sessions.addSession(form)
        .then(() => res.send('success'))
        .catch(err => {
            console.log(err);
            res.send('error');
        });
});

module.exports = router;
