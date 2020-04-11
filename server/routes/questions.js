import express from 'express';
import passport from 'passport';
import Questions from '../db/collections/questions';
import Toxicity from '../lib/tf';
import io from '../lib/socket-io';

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
            toxicityReason: []
        })
            .then(r => {
                const questionDoc = r.ops[0];
                io.of('/questions')
                    .to(sessionId)
                    .emit('question', questionDoc);
                res.send({ success: true });
                Toxicity.tfToxicityQuestion(questionDoc);
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

module.exports = router;
