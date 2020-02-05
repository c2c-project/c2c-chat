import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import Accounts from '../lib/accounts';
import { ClientError } from '../lib/errors';

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
            res.status(500).send();
        });
});

router.post(
    '/login',
    passport.authenticate('login', { session: false }),
    (req, res) => {
        const { user } = req;
        const clientUser = Accounts.filterSensitiveData(user);
        jwt.sign(clientUser, process.env.JWT_SECRET, {}, (err, token) => {
            // let cookie = `jwt=${token}; HttpOnly; Domain=${process.env.ORIGIN}; SameSite=Strict;`;
            // if (process.env.NODE_ENV === 'production') {
            //     cookie = `${cookie} Secure;`;
            // }
            res.status(200)
                // .setHeader('Set-Cookie', cookie)
                .send({ jwt: token });
            // console.log(res.getHeader('Set-Cookie'));
            // res.send();
        });
    }
);

// NOTE: unprotected route here
router.post('/login-temporary', (req, res) => {
    const { username } = req.body;
    Accounts.registerTemporary(username, { roles: ['user'] }).then(userDoc => {
        jwt.sign(userDoc, process.env.JWT_SECRET, {}, (err, token) => {
            res.status(200).send({ jwt: token });
        });
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

module.exports = router;
