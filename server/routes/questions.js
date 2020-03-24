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
    (req, res, next) => {
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
            sentenceCode: [],
            relaventWeight: 0,
            isCenter: false,
            clusterNumber: 0,
            asked: false,
        })
            .then(r => {
                const questionDoc = r.ops[0];
                ioInterface
                    .of('/questions')
                    .to(sessionId)
                    .emit('question', questionDoc);
                res.send({ success: true });
                TensorFlow.tfToxicityQuestion(questionDoc,sessionId);
                TensorFlow.tfUseQuestion(questionDoc,sessionId);
            })
            .catch(next);
    }
);

router.get(
    '/:roomId',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        const { user } = req;
        const { roomId } = req.params;
        const questionHistory = Questions.privilegedActions(
            'QUESTION_HISTORY',
            user
        );
        questionHistory(roomId)
            .then(docs => {
                res.status(200).json(docs);
            })
            .catch(next);
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
            Questions.updateQuestionAsked({questionId: question._id, asked: true}).then(() =>{
                ioInterface
                    .of('/questions')
                    .to(roomId)
                    .emit('asked', question._id);
                res.send({ success: true });
            })
        }
    }
);

module.exports = router;
