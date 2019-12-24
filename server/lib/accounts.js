import bcrypt from 'bcrypt';
import Users from '../db/collections/users';

const SALT_ROUNDS = 10;

// exposed fns
const verifyPassword = (textPw, hash, cb) => {
    bcrypt.compare(textPw, hash, cb);
};
const register = (username, password, additionalFields = {}) =>
    Users.findByUsername({ username }).then(doc => {
        if (!doc) {
            bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
                if (!err) {
                    Users.addUser({
                        username,
                        password: hash,
                        ...additionalFields
                    });
                } else {
                    console.log(err);
                }
            });
        } else {
            console.log('non-unique username');
            console.log('TODO: send this back to client');
        }
    });

export default {
    register,
    verifyPassword
};
