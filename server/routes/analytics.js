import express from 'express';
import passport from 'passport';
import Analytics from '../lib/analytics';

const router = express.Router();

router.get(
    '/session-summary/:sessionId',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { sessionId } = req.params;
        // aggregate data and 
        Analytics.summarizeSession(sessionId).then(summaryDetails => {
            console.log(summaryDetails);
            res.json(summaryDetails);
            // send details to client
        });
    }
);



// Will get to this get request once chat is implemented

module.exports = router;
