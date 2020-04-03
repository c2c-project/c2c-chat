import express from 'express';
import passport from 'passport';
import Messages from '../db/collections/messsages';
import { moderate, unmoderate } from '../lib/socket-io';

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

router.post(
    '/message-action/:roomId/:messageId',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { user } = req;
        const { moderateAction } = req.body;
        const { messageId, roomId } = req.params;
        const MessageAction = moderateAction === true ? Messages.privilegedActions('REMOVE_MESSAGE', user) : Messages.privilegedActions('RECOVER_MESSAGE', user);
        const message = Messages.findMessage({messageId});
        MessageAction(messageId)
            .then(() => {
                if (moderateAction === true) 
                {
                    moderate(roomId, messageId);
                    res.status(200).send(); 
                }else {
                    message.then(r => {
                        if(r != null){
                            unmoderate(roomId, r)
                        }else {
                            console.log("Couldn't find the target message")
                            res.status(404).send();
                        }
                    })
                    .catch(next)
                }
                moderate(roomId, messageId);
                res.status(200).send(); 
            })
            .catch(next);
        res.status(200).send(); 
    }
);

module.exports = router;
