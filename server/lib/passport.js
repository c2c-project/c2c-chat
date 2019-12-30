import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import Accounts from './accounts';
import Users from '../db/collections/users';

passport.use(
    'login',
    new LocalStrategy((username, password, done) => {
        Users.findByUsername({ username }).then(user => {
            if (!user) {
                done(null, false);
            } else {
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
            }
        });
    })
);

passport.use(
    'jwt',
    new JWTStrategy(
        {
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwtPayload, done) => {
            Users.findByUserId(jwtPayload._id).then(user => {
                if (!user) {
                    done(null, false);
                } else {
                    done(null, user);
                }
            });
        }
    )
);
