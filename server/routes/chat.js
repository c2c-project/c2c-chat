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

router.post(
    '/remove-message/:messageId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { messageId } = req.params;
        const removeMessage = Chat.privilegedActions('REMOVE_MESSAGE', user);
        removeMessage(messageId)
            .then(() => res.send({ success: true }))
            .catch(err => {
                console.log(err);
                res.send({ success: false });
            });
    }
);

module.exports = router;
