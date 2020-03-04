import express from 'express';
import passport from 'passport';
import Chat from '../db/collections/chat';
import { moderate } from '../lib/socket-io';

const router = express.Router();

// NOTE: only care if the user is logged in to see chat messages
router.get(
    '/:roomId',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { roomId } = req.params;
        Chat.findMessages({ sessionId: roomId })
            .then(r => res.json(r))
            .catch(next);
    }
);

router.post(
    '/remove-message/:roomId/:messageId',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { user } = req;
        const { messageId, roomId } = req.params;
        const removeMessage = Chat.privilegedActions('REMOVE_MESSAGE', user);
        removeMessage(messageId)
            .then(() => {
                moderate(roomId, messageId);
                res.status(200).send();
            })
            .catch(next);
    }
);

module.exports = router;
