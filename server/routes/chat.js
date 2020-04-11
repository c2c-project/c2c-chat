import express from 'express';
import passport from 'passport';
import Messages from '../db/collections/messsages';
import { moderate } from '../lib/socket-io';

const router = express.Router();

// NOTE: only care if the user is logged in to see chat messages
router.get(
    '/:roomId',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { roomId } = req.params;
        Messages.findMessages({ sessionId: roomId })
            .then(r => res.json(r))
            .catch(next);
    }
);

router.get(
    '/find-messages/:sessionId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { sessionId } = req.params;
        Chat.countMessagesBySession(sessionId).then(r => res.json(r));
    }

);

router.post(
    '/remove-message/:roomId/:messageId',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { user } = req;
        const { messageId, roomId } = req.params;
        const removeMessage = Messages.privilegedActions('REMOVE_MESSAGE', user);
        removeMessage(messageId)
            .then(() => {
                moderate(roomId, messageId);
                res.status(200).send();
            })
            .catch(next);
    }
);

// Will get to this get request once chat is implemented

module.exports = router;
