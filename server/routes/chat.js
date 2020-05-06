import express from 'express';
import passport from 'passport';
import { moderate, unmoderate, update, remove } from '../socket-io/chat';
import Accounts from '../lib/accounts';
import Messages from '../db/collections/messsages';

const router = express.Router();

// NOTE: only care if the user is logged in to see chat messages
router.get(
    '/:roomId',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { roomId } = req.params;
        Messages.findMessages({ sessionId: roomId })
            .then((r) => res.json(r))
            .catch(next);
    }
);

router.get(
    '/find-messages/:sessionId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { sessionId } = req.params;
        Messages.countMessagesBySession(sessionId).then((r) => res.json(r));
    }
);

router.post(
    '/message-action/:roomId/:messageId',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { user } = req;
        const { moderateAction } = req.body;
        const { messageId, roomId } = req.params;
        const MessageAction =
            moderateAction === true
                ? Messages.privilegedActions('REMOVE_MESSAGE', user)
                : Messages.privilegedActions('RECOVER_MESSAGE', user);
        const message = Messages.findMessage({ messageId });
        MessageAction(messageId)
            .then(() => {
                console.log(moderateAction);
                if (moderateAction === true) {
                    moderate(roomId, messageId);
                    res.status(200).send();
                } else {
                    message
                        .then((r) => {
                            if (r != null) {
                                unmoderate(roomId, r);
                            } else {
                                console.log("Couldn't find the target message");
                                res.status(404).send();
                            }
                        })
                        .catch(next);
                }
                moderate(roomId, messageId);
                res.status(200).send();
            })
            .catch(next);
        res.status(200).send();
    }
);

router.post(
    '/update-message',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { newMessage, message, roomId } = req.body;
        if (Accounts.isOwner(user._id, message)) {
            Messages.updateMessage({
                messageId: message._id,
                message: newMessage,
            })
                .then(() => {
                    update(roomId, message._id, newMessage);
                    res.status(200).send({ success: true });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(400).send({ success: false });
                });
        } else {
            res.status(400).send({ success: false });
        }
    }
);

router.post(
    '/delete-message/:roomId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { roomId } = req.params;
        const { message } = req.body;
        if (Accounts.isOwner(user._id, message)) {
            Messages.deleteMessage({ messageId: message._id })
                .then(() => {
                    remove(roomId, message._id);
                    res.status(200).send({ success: true });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(400).send({ success: false });
                });
        } else {
            res.status(400).send({ success: false });
        }
    }
);

module.exports = router;
