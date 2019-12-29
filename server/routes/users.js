import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import Accounts from '../lib/accounts';

const router = express.Router();

router.post('/register', function(req, res) {});

router.post(
    '/login',
    passport.authenticate('login', { session: false }),
    (req, res) => {
        const { user } = req;
        const clientUser = Accounts.filterSensitiveData(user);
        jwt.sign(clientUser, process.env.JWT_SECRET, {}, (err, token) => {
            res.status(200).send({ token });
        });
    }
);

router.post('/authenticate', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).send({ hello: 'world'});
});

module.exports = router;
