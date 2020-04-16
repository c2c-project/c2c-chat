import express from 'express';
import passport from 'passport';
import Questions from '../db/collections/questions';
import Accounts from '../lib/accounts';
import io from '../socket-io';
import TensorFlow from '../lib/tf';

const router = express.Router();

router.post(
    '/submit-question',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        const { user } = req;
        const { form, sessionId } = req.body;
        // anyone can ask a question as long as they're logged in, so no need for additional checks atm
        try {
            const mongoCursor = await Questions.createQuestion({
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
            });

            const questionDoc = mongoCursor.ops[0];
            io.of('/questions').to(sessionId).emit('question', questionDoc);
            res.status(200).send();
            TensorFlow.tfToxicityQuestion(questionDoc, sessionId);
            TensorFlow.tfUseQuestion(questionDoc, sessionId);
        } catch (e) {
            next(e);
        }
    }
);

router.get(
    '/:roomId',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        const { user } = req;
        const { roomId } = req.params;
        try {
            const questionHistory = Questions.privilegedActions(
                'QUESTION_HISTORY',
                user
            );
            const docs = await questionHistory(roomId);
            res.status(200).json(docs);
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/set-asked/:roomId',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        const { user } = req;
        const { roomId } = req.params;
        const { question } = req.body;
        // TODO: move this to the privileged actions code
        if (
            Accounts.isAllowed(user.roles, {
                requiredAny: ['moderator', 'admin'],
            })
        ) {
            try {
                await Questions.updateQuestionAsked({
                    questionId: question._id,
                    asked: true,
                });
                io.of('/questions').to(roomId).emit('asked', question._id);
                res.status(200).send();
            } catch (e) {
                next(e);
            }
        }
    }
);

module.exports = router;
