import bcrypt from 'bcrypt';
import mailgun from 'mailgun-js';
import jwt from 'jsonwebtoken';
import Users from '../db/collections/users';
import { ClientError } from './errors';
import Emails from './email';

const SALT_ROUNDS = 10;
const BASE_USER = {
    roles: ['user']
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

const verifyUser = (userId) => {
    return Users.findByUserId(userId).then(doc => {
        if(doc) {
            const verified = {$set: {'verified': true}};
            return Users.updateUser(doc, verified);
        } else {
            return Promise.reject(new ClientError('Invalid Link'));
        }
    }).catch(err => {
        console.error(err);
        if(err.message === 'Invalid Link') {
            return Promise.reject(new ClientError('Invalid Link'));
        } else {
            return Promise.reject(new ClientError('Server Error, Please Contact Support'));
        }
    });
}

/**
 * Function to send reset password link to user's email using jwt based on user's doc
 * @param {string} email -- user's email to send reset password link to
*/
const passwordReset = (email) => {
    return Users.findByEmail(email).then(doc => {
        if(doc) {
            //Filter doc
            const { _id } = doc;
            //const filteredDoc = filterSensitiveData(doc);
            return jwt.sign({_id}, process.env.JWT_SECRET, { expiresIn: '30m'}, (err, token) => {
                if(err) {
                    return Promise.reject(new ClientError('Invalid Email'));
                } else {
                    Emails.sendPasswordResetEmail(email, token);
                }
            });
        } else {
            return Promise.reject(new ClientError('Invalid Email'));
        }
    }).catch(err => {
        console.error(err);
        if(err.message === 'Invalid Email') {
            return Promise.reject(new ClientError('Invalid Email'));
        } else {
            return Promise.reject(new ClientError('Server Error, Please Contact Support'));
        }
    });
}

/**
 * Function to reset user's password in database
 * @param {string} token -- jwt token to be verified
 * @param {string} password -- new password
 * @param {string} confirmPassword -- new password confirmation
 */
const resetPassword = async (token, password, confirmPassword) => {
    return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {
            if(err.message === 'jwt expired') {
                return Promise.reject(new ClientError('Expired Link'));
            } else {
                return Promise.reject(new ClientError('Invalid Link'));
            }
        } else {
            const { _id } = decoded;
            //Find user in database then hash and update with new password
            if(password === confirmPassword) {
                return Users.findByUserId(_id).then(doc => {
                    return bcrypt.hash(password, SALT_ROUNDS).then(hash => {
                        const updatedPassword = {$set: {'password': hash}};
                        return Users.updateUser(doc, updatedPassword);
                    }).catch(err => console.error(err));
                }).catch(err => {
                    console.error(err);
                    return Promise.reject(new ClientError('Server Error, Please Contact Support'));
                })
            } else {
                return Promise.reject(new ClientError('Passwords do not match'));
            }
        }
    });
}

// always returns a promise
const register = (username, password, confirmPass, additionalFields = {}) => {
    const { email } = additionalFields;
    // if the user registered with an email & username, then find by username or email
    // because both should be unique, otherwise just find by username
    const query = email ? { $or: [{ email }, { username }] } : { username };
    if (password === confirmPass) {
        // returning a Promise here -- so register.then.catch will work
        return Users.find(query).then(docArray => {
            if (!docArray[0]) {
                return bcrypt
                    .hash(password, SALT_ROUNDS)
                    .then(hash =>
                        Users.addUser({
                            username,
                            password: hash,
                            // BASE_USER before additionalFields so that way additionalFields can override defaults if necessary
                            ...BASE_USER,
                            ...additionalFields
                        })
                            .then(userDoc => {
                                const { _id } = userDoc;
                                sendEmailVerification(email, _id);
                            })
                            .catch(err => console.log(err))
                    )
                    .catch(err => console.log(err));
            }
            console.log(docArray);
            throw new ClientError('Username or E-mail already exists');
        });
    }
    // must return a Promise.reject here so the .catch works properly (just throwing won't get caught in a .catch)
    return Promise.reject(new ClientError('Passwords do not match'));
};

/**
 * always returns a promise -- expects to have .catch used on it
 */
const registerTemporary = (username, additionalFields = {}) =>
    Users.findByUsername({ username }).then(doc => {
        if (!doc) {
            return Users.addUser({
                username,
                ...additionalFields,
                temporary: true
            });
        }
        throw new ClientError('Username already exists');
    });

/**
 *  use whitelist method instead of blacklist
 */

const filterSensitiveData = userDoc => {
    // okay fields to send to client via jwt or any given time
    const okayFields = ['_id', 'email', 'username', 'roles', 'name', 'verified'];
    return Object.entries(userDoc).reduce((accum, [key, value]) => {
        if (okayFields.includes(key)) {
            return { ...accum, [key]: value };
        }
        return accum;
    }, {});
};

/**
 * all docs must have a userId field if they want to have a concept of ownership
 */
const isOwner = (userId, doc) => {
    return doc.userId === userId;
};

export default {
    register,
    registerTemporary,
    verifyPassword,
    isAllowed,
    filterSensitiveData,
    isOwner,
    verifyUser,
    passwordReset,
    resetPassword
};
