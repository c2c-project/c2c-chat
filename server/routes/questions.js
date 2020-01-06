import express from 'express';
import passport from 'passport';
import Questions from '../db/collections/questions';

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
            .then(() => {
                res.send({ success: true });
            })
            .catch(console.error);
    }
);

module.exports = router;
