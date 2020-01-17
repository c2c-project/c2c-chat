import express from 'express';
import passport from 'passport';
import Questions from '../db/collections/questions';
import Accounts from '../lib/accounts';
import ioInterface from '../lib/socket-io';

const router = express.Router();

// TODO: add authentification here

router.post(
    '/submit-question',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { form, sessionId } = req.body;
        // anyone can ask a question as long as they're logged in, so no need for additional checks atm
        Questions.createQuestion({
            question: form.question,
            sessionId,
            username: user.username,
            userId: user._id
        })
            .then(r => {
                const questionDoc = r.ops[0];
                ioInterface
                    .io()
                    .of('/questions')
                    .to(sessionId)
                    .emit('question', questionDoc);
                res.send({ success: true });
            })
            .catch(console.error);
    }
);

router.get(
    '/:roomId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { roomId } = req.params;

        // TODO: move this to the privileged actions code
        if (
            Accounts.isAllowed(user.roles, {
                requiredAny: ['moderator', 'admin']
            })
        ) {
            Questions.findBySession({ sessionId: roomId }).then(docs => {
                res.json(docs);
            });
        }
    }
);

module.exports = router;
