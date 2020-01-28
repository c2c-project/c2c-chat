import express from 'express';
import passport from 'passport';
import Questions from '../db/collections/questions';
import Accounts from '../lib/accounts';
import ioInterface from '../lib/socket-io';
import Toxicity from '../lib/tf';

const router = express.Router();

router.post(
    '/submit-question',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { form, sessionId } = req.body;
        const toxicity = false;
        let toxicityReason = [];
        // anyone can ask a question as long as they're logged in, so no need for additional checks atm
        Questions.createQuestion({
            question: form.question,
            sessionId,
            username: user.username,
            userId: user._id,
            toxicity,
            toxicityReason
        })
            .then( async r => {
                const questionDoc = r.ops[0];
                ioInterface
                    .io()
                    .of('/questions')
                    .to(sessionId)
                    .emit('question', questionDoc);
                res.send({ success: true });
                const questionId = questionDoc._id;
                try{
                    if(questionDoc){
                        const tfResult = await Toxicity.tfToxicity(questionDoc.question);
                        const result =  await tfResult[0];
                        if (result !== toxicity) {
                            try{
                                if(result) {
                                    toxicityReason =  await tfResult[1];
                                    await Questions.updateQuestionToxicity({questionId, result, toxicityReason})
                                } else {
                                    await Questions.updateQuestionToxicity({questionId, result})
                                }
                            }catch(e){
                                console.log(e)
                            }
                        }
                    }
                }catch(Exception){
                    console.log(Exception)
                }
                // TODO: 193
                /**
                 * @questionDoc is the question json
                 * Ideally, you'd just take the questionDoc
                 * and feed that into the text toxicity
                 */
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
