import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import Accounts from './accounts';
import Users from '../db/collections/users';

passport.use(
    'login',
    new LocalStrategy(async (username, password, done) => {
        const user = await Users.findByUsername({ username }).catch(done);
        if (!user) {
            // user does not exist
            done(null, false);
        } else {
            const isVerified = await Accounts.verifyPassword(
                password,
                user.password
            ).catch(done); // something went wrong in bcrypt fn

            // password does not match
            if (!isVerified) {
                done(null, false);
            }

            // password matches and we're good to go
            done(null, user);
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
            const user = await Users.findByUserId(jwtPayload._id).catch(done);
            if (!user) {
                done(null, false);
            } else {
                done(null, user);
            }
        }
    )
);
