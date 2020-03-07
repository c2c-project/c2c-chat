import express from 'express';
import passport from 'passport';
import Questions from '../db/collections/questions';
import Accounts from '../lib/accounts';
import ioInterface from '../lib/socket-io';
import TensorFlow from '../lib/tf';

const router = express.Router();

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
            userId: user._id,
            toxicity: false,
            toxicityReason: [],
            asked: false,
        })
            .then(r => {
                const questionDoc = r.ops[0];

                ioInterface
                    .io()
                    .of('/questions')
                    .to(sessionId)
                    .emit('question', questionDoc);
                res.send({ success: true });
                TensorFlow.tfToxicityQuestion(questionDoc,sessionId);
                TensorFlow.tfUseQuestion(questionDoc);
                
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


router.post(
    '/set-asked/:roomId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { roomId } = req.params;
        const { question } = req.body;
        // TODO: move this to the privileged actions code
        if (
            Accounts.isAllowed(user.roles, {
                requiredAny: ['moderator', 'admin']
            })
        ) {
            Questions.updateQuestionAsked(question._id)

            ioInterface
                .io()
                .of('/questions')
                .to(roomId)
                .emit('asked', question._id);
            res.send({ success: true });
        }
    }
);



module.exports = router;
