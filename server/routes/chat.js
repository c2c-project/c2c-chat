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
        const {newMessage, messageDoc, roomId} = req.body;
        if (Accounts.isOwner(user._id, messageDoc)){
            Chat.updateMessage({ messageId: messageDoc._id , newMessage})
                .then(() => {
                    update(roomId, messageDoc._id  , newMessage);
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

// TODO: Johan
/**
 * For deleting a question, make it a pseudo-delete
 * ie you'd basically be copying my moderate code, but instead it'd be a delete event
 * however, we want to keep that data in the database, so it will just be hidden
 * so instead of moderated: true, maybe make a deletedByUser: true & then we just check if that field is 
 * true client side & just skip it for rendering -- eventually we'll only serve to the client the non-moderated & non-deleted
 * messages, but we don't know everything yet so we're just doing the filtering on client for now
 */

module.exports = router;
