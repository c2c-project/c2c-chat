import bcrypt from 'bcrypt';
import Users from '../db/collections/users';

const SALT_ROUNDS = 10;

/**
 * Realistically, only one of the required's fields within the requirements object will be used at any given time
 * @arg userRoles -- the array of string codes corresponding to the user's assigned roles
 * @arg requirements -- the object containing different role requirements for what they are trying to access
 */
const isAllowed = (
    userRoles,
    { requiredAll = [], requiredAny = [], requiredNot = [] } = {}
) => {
    if (userRoles.length === 0) {
        return false;
    }
    const every =
        requiredAll.length > 0
            ? requiredAll.every(role => userRoles.includes(role))
            : true;
    const any =
        requiredAny.length > 0
            ? userRoles.some(role => requiredAny.includes(role))
            : true;
    const not =
        requiredNot.length > 0
            ? userRoles.every(role => !requiredNot.includes(role))
            : true;
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
