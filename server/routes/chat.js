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
//      Do I need roomId?

router.post(
    // To do: Do research about getting information from the request (from the body)
    '/update-message',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        // const messageId = '5e38a0e849ea30241411b015';
        // const message = 'HELLO FROM API';
        // const removeMessage = Chat.privilegedActions('REMOVE_MESSAGE', user);

        // PROBLEM: DATABASE NOT UPDATING THE MESSAGE WITH DUMMY DATA
        Chat.updateMessage({messageId:  '5e4736cb6da33304d8d84975', newMessage: 'HELLO FROM API'})
            .then((arg) => {
                console.log(arg);
                res.send({success: true})
            })
            .catch(err => {
                console.log(err);
                res.send({ success: false});
            });
    }
)

module.exports = router;
