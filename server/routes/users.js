import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import Accounts from '../lib/accounts';
import userConnection from '../lib/user-connection';
const router = express.Router();

router.post('/register', (req, res, next) => {
    const { form } = req.body;
    const { username, email, password, confirmPass } = form;
    Accounts.register(username, password, confirmPass, { email })
        .then(() => {
            res.status(200).send();
        })
        .catch(next);
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
                console.log(userConnection.connectingList.addUser(user));
                res.status(200).send({ jwt: token });
            }
        });
    }
);

// NOTE: unprotected route here
router.post('/login-temporary', (req, res, next) => {
    const { username } = req.body;
    Accounts.registerTemporary(username, { roles: ['user'] })
        .then(userDoc => {
            jwt.sign(userDoc, process.env.JWT_SECRET, {}, (err, token) => {
                if (!err) {
                    userConnection.connectingList.addUser(userDoc);
                    res.status(200).send({ jwt: token });
                } else {
                    console.log(err);
                    res.status(400).send();
                }
            });
        })
        .catch(next);
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

router.post('/verification', (req, res, next) => {
    const { userId } = req.body;
    Accounts.verifyUser(userId)
        .then(() => {
            res.status(200).send();
        })
        .catch(next);
});

//Call to send password reset email
router.post(
    '/request-password-reset', (req, res, next) => {
        if(req.body.form.email !== undefined) {
            Accounts.sendPasswordResetEmail(req.body.form.email).then(() => {
                res.status(200).send();
            }).catch(next)
        } else {
            res.statusText = 'Email Missing';
            res.status(400).send();
        }
    }
);

//Call to update to new password
router.post(
    '/consume-password-reset-token', (req, res, next) => {
        if(req.body.token !== undefined && req.body.form.password !== undefined && req.body.form.confirmPassword !== undefined) {
            const { token, form } = req.body;
            Accounts.updatePassword(token, form.password, form.confirmPassword).then(() => {
                res.status(200).send('Password Reset');
            }).catch(next)
        } else {
            if(req.body.token === undefined) {
                res.statusText = 'Token Missing';
                res.status(400).send();
            } else if(req.body.form.password === undefined || req.body.form.confirmPassword === undefined) {
                res.statusText = 'Invalid Password';
                res.status(400).send();
            } else {
                res.status(400).send();
            }
        }
    }
);

module.exports = router;
