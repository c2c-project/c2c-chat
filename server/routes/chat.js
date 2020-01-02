import express from 'express';
import passport from 'passport';
import Chat from '../db/collections/chat';

const router = express.Router();

router.get(
    '/:roomId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { roomId } = req.params;
        Chat.findMessages({ sessionId: roomId }).then(r => res.json(r));
    }
);

module.exports = router;
