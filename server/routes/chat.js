import express from 'express';
import passport from 'passport';
import Chat from '../db/collections/chat';
import { moderate } from '../lib/socket-io';

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

// Create a POST Request route to update a message
// Figure out:
//      Do I need roomId?

router.post(
    // To do: Do research about getting information from the request (from the body)
    '/update-message',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        // console.log(req.body);
        const {messageId, newMessage} = req.body;
        // console.log(messageId);
        // console.log(newMessage);
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
        Chat.updateMessage({messageId, newMessage})
            .then(() => {
                // console.log(arg);
                res.send({success: true, editedMessage: newMessage})
            })
            .catch(err => {
                console.log(err);
                res.send({ success: false});
            });
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
