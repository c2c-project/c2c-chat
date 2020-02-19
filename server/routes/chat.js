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

module.exports = router;
