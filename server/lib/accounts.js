import bcrypt from 'bcrypt';
import Users from '../db/collections/users';
import { ClientError } from './errors';

const SALT_ROUNDS = 10;
const BASE_USER = {
    roles: ['user'],
};

// TODO: use this when I allow promotion
// const makeModerator = user => ({
//     ...user,
//     roles: [...user.roles, 'moderator']
// });
// const makeAdmin = user => ({ ...user, roles: [...user.roles, 'admin'] });

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
    const isNull =
        requiredAll.length === 0 &&
        requiredAny.length === 0 &&
        requiredNot.length === 0;
    if (isNull) {
        return false;
    }
    const every =
        requiredAll.length > 0
            ? requiredAll.every((role) => userRoles.includes(role))
            : true;
    const any =
        requiredAny.length > 0
            ? userRoles.some((role) => requiredAny.includes(role))
            : true;
    const not =
        requiredNot.length > 0
            ? userRoles.every((role) => !requiredNot.includes(role))
            : true;

    return every && any && not;
};

const verifyPassword = (textPw, hash, cb) => {
    bcrypt.compare(textPw, hash, cb);
};

// always returns a promise
const register = (username, password, confirmPass, additionalFields = {}) => {
    const { email } = additionalFields;
    // if the user registered with an email & username, then find by username or email
    // because both should be unique, otherwise just find by username
    const query = email ? { $or: [{ email }, { username }] } : { username };
    if (password === confirmPass) {
        return Users.find(query).then((docArray) => {
            if (!docArray[0]) {
                return bcrypt
                    .hash(password, SALT_ROUNDS)
                    .then((hash) =>
                        Users.addUser({
                            username,
                            password: hash,
                            // BASE_USER before additionalFields so that way additionalFields can override defaults if necessary
                            ...BASE_USER,
                            ...additionalFields,
                        }).catch((err) => console.log(err))
                    )
                    .catch((err) => console.log(err));
            }
            console.log(docArray);
            throw new ClientError('Username or E-mail already exists');
        });
    }

    return Promise.reject(new ClientError('Passwords do not match'));
};

const registerTemporary = (username, additionalFields = {}) =>
    Users.findByUsername({ username }).then((doc) => {
        if (!doc) {
            return Users.addUser({
                username,
                ...additionalFields,
                temporary: true,
            }).catch((err) => console.log(err));
        }
        throw new ClientError('Username already exists');
    });

/**
 *  use whitelist method instead of blacklist
 * */

const filterSensitiveData = (userDoc) => {
    // okay fields to send to client via jwt or any given time
    const okayFields = ['_id', 'email', 'username', 'roles', 'name'];
    return Object.entries(userDoc).reduce((accum, [key, value]) => {
        if (okayFields.includes(key)) {
            return { ...accum, [key]: value };
        }
        return accum;
    }, {});
};

/**
 * all docs must have a userId field if they want to have a concept of ownership
 * Bug:
 * doc.userId field is of type string while userId is type object. For the comparison to work userId has to be converted to a string
 */
const isOwner = (userId = {}, doc = '') => {
    return doc.userId === String(userId);
};

export default {
    register,
    registerTemporary,
    verifyPassword,
    isAllowed,
    filterSensitiveData,
    isOwner,
};
