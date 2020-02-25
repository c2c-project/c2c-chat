import express from 'express';
import passport from 'passport';
import Chat from '../db/collections/chat';
import { moderate, update } from '../lib/socket-io';
import Accounts from '../lib/accounts';

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
    '/remove-message/:roomId/:messageId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { messageId, roomId } = req.params;
        const removeMessage = Chat.privilegedActions('REMOVE_MESSAGE', user);
        removeMessage(messageId)    
            .then(() => {
                moderate(roomId, messageId);
                res.send({ success: true });
            })
            .catch(err => {
                console.log(err);
                res.send({ success: false });
            });
    }
);

router.post(
    '/update-message',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        const { user } = req;
        const {newMessage, message, roomId} = req.body;
        if (Accounts.isOwner(user._id, message)){
            Chat.updateMessage({ messageId: message._id , newMessage})
                .then(() => {
                    update(roomId, message._id, newMessage);
                    res.status(200).send({success: true});
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).send({success: false});
                });
        }
        else {
            res.status(400).send({ sucess: false });
        }
    }
)

router.post(
    '/delete-message/:roomId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { roomId } = req.params;
        const { message } = req.body;
        if (Accounts.isOwner(user._id, message)){
            Chat.deleteMessage({ messageId: message._id })    
                .then(() => {
                    // Reuse moderate event listener since it removes the message from the list of messages. 
                    // Disucess with David if this is okay
                    moderate(roomId, message._id);
                    res.status(200).send({ success: true });
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).send({ success: false });
                });
        }
        else {
            res.status(400).send({ sucess: false });
        }
    }
);

module.exports = router;
