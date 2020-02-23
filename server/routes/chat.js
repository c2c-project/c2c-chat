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
    // To do: Do research about getting information from the request (from the body)
    '/update-message',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {

        console.log(req.body);
        const { user } = req;
        const {newMessage, messageDoc, roomId} = req.body;
        console.log(user);
        console.log(messageDoc);
        console.log(newMessage);
        console.log(roomId);
        // TODO: Johan
        /**
         * look how I get the user doc in the post route above this one
         * 
         * Here's what you want to change here:
         * Wrap the below code in an if statement
         * so if (Accounts.isOwner(user, messageDoc)) {
         * your current code here
         * } else {
         * not allowed message
         * }
         * Also, I actually unified how we send success messages in the branch I'm working on
         * so for a succsess just do res.status(200).send({your code here});
         * for a failure do res.status(400).send()
         * 
         */

        if (Accounts.isOwner(user._id,  messageDoc)){
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
            res.send({messageError: 'Not allowed message'});
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
