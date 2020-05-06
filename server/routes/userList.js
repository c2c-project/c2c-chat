import express from 'express';
import passport from 'passport';
import chatRoomUsers from '../socket-io/chatRoomUsers';
import Accounts from '../lib/accounts';

const router = express.Router();

// NOTE: only care if the user is logged in to see chat messages
router.get(
    '/:roomId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { roomId } = req.params;
        if (
            Accounts.isAllowed(user.roles, {
                requiredAny: ['moderator', 'admin'],
            })
        ) {
            res.json(chatRoomUsers.GetChatRoom(roomId).getUserList());
            return;
        }
        res.json({ reject: 'no permission' });
    }
);

// Will get to this get request once chat is implemented

module.exports = router;
