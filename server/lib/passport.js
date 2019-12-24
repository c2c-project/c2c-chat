import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy } from 'passport-jwt';
import Accounts from './accounts';
import Users from '../db/collections/users';

passport.use(
    new LocalStrategy((username, password, done) => {
        Users.findByUsername({ username }).then(user => {
            if (!user) {
                return done(null, false);
            }
            Accounts.verifyPassword(password, user.password, (e, res) => {
                if (e) {
                    done(e);
                }
                if (!res) {
                    done(null, false);
                } else {
                    done(null, user);
                }
            });
        });
    })
);
