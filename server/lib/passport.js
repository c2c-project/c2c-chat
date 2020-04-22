import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import Accounts from './accounts';
import Users from '../db/collections/users';

passport.use(
    'login',
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await Users.findByUsername({ username });
            if (!user) {
                // user does not exist
                return done(null, false);
            }
            const isVerified = await Accounts.verifyPassword(
                password,
                user.password
            );

            // password does not match
            if (!isVerified) {
                return done(null, false);
            }

            // password matches and we're good to go
            return done(null, user);
        } catch (e) {
            return done(e);
        }
    })
);

passport.use(
    'jwt',
    new JWTStrategy(
        {
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        async (jwtPayload, done) => {
            try {
                const user = await Users.findByUserId(jwtPayload._id);
                if (!user) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (e) {
                return done(e);
            }
        }
    )
);
