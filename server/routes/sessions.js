import express from 'express';
import Sessions from '../db/collections/sessions';

const router = express.Router();

router.get('/', (req, res) => {
    Sessions.findAllSessions().then(r => res.json(r));
});

module.exports = router;
