import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import Accounts from '../lib/accounts';
import { errorHandler } from '../lib/errors';

const router = express.Router();

router.post('/register', (req, res) => {
    const { form } = req.body;
    const { username, email, password, confirmPass } = form;
    Accounts.register(username, password, confirmPass, { email })
        .then(() => {
            res.status(200).send();
        })
        .catch(e => {
            // not really sure if this is best practice
            if (e instanceof ClientError) {
                res.statusMessage = e.message;
            }
            res.status(400).send();
        });
});

router.post(
    '/login',
    passport.authenticate('login', { session: false }),
    (req, res) => {
        const { user } = req;
        const clientUser = Accounts.filterSensitiveData(user);
        jwt.sign(clientUser, process.env.JWT_SECRET, {}, (err, token) => {
            if (err) {
                // NOTE: maybe throw a server error?
                res.status(400).send();
            } else {
                res.status(200).send({ jwt: token });
            }
        });
    }
);

// NOTE: unprotected route here
router.post('/login-temporary', (req, res) => {
    const { username } = req.body;
    Accounts.registerTemporary(username, { roles: ['user'] })
        .then(userDoc => {
            jwt.sign(userDoc, process.env.JWT_SECRET, {}, (err, token) => {
                if (!err) {
                    res.status(200).send({ jwt: token });
                } else {
                    console.log(err);
                    res.status(400).send();
                }
            });
        })
        .catch(e => {
            if (e instanceof ClientError) {
                res.statusMessage = e.message;
            }
            res.status(400).send();
        });
});

router.post(
    '/authenticate',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { user } = req;
        const { requiredAny, requiredAll, requiredNot } = req.body;
        const allowed = Accounts.isAllowed(user.roles, {
            requiredAll,
            requiredAny,
            requiredNot
        });
        res.send({
            allowed
        });
    }
);

router.post(
    '/verification', (req, res) => {
        const {userId} = req.body;
        Accounts.verifyUser(userId).then(() => {
            res.status(200).send();
        }).catch(e => {
            console.error(e);
            if(e instanceof ClientError) {
                res.statusMessage = e.message;
            }
            res.status(400).send();
        })
    }
);

module.exports = router;
