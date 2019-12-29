import bcrypt from 'bcrypt';
import Users from '../db/collections/users';

const SALT_ROUNDS = 10;

/**
 * @arg userRoles -- the array of string codes corresponding to the user's assigned roles
 * @arg requirements -- the object containing different role requirements for what they are trying to access
 */
const isAllowed = (
    userRoles,
    { requiredAll = [], requiredAny = [], requiredNot = [] } = {}
) => {
    const every = userRoles.every(role => requiredAll.includes(role));
    const any = userRoles.some(role => requiredAny.includes(role));
    const not = userRoles.every(role => !requiredNot.includes(role));
    return every && any && not;
};

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
    verifyPassword,
    isAllowed
};
