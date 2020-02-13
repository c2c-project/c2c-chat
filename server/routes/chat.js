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
//      what is ioInterface for?
//      Do I need the user?
//      Do I need roomId?
// Reverse engineer the remove message route

// How to get information from the body of the request
router.post(
    // To do: Do research about getting information from the request (from the body)
    'update-message/:messageId',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        const {messageId} = req.params;
        const {message} = req.body;
        // const removeMessage = Chat.privilegedActions('REMOVE_MESSAGE', user);
        Chat.updateMessage(messageId, message)
            .then(() => {
                res.send({success: true})
            })
            .catch(err => {
                console.log(err);
                res.send({ success: false});
            });
    }
)

module.exports = router;
