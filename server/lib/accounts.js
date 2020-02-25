import bcrypt from 'bcrypt';
import mailgun from 'mailgun-js';
import jwt from 'jsonwebtoken';
import Users from '../db/collections/users';
import { ClientError } from './errors';

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

const sendEmailVerification = (email, _id) => {
    const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });
    const url = `${process.env.ORIGIN}/verification/${_id}`;
    const data = {
        from: `c2c <${process.env.MAILGUN_FROM_EMAIL}>`,
        to: email,
        subject: 'Email Verificaiton',
        text: 'Please click the link to confirm your email',
        html: `
        <h3>Please click the lik to confirm your email</h3>
        <a href="${url}">${url}</a>`
    };
    mg.messages().send(data, (error, body) => {
        if (error) {
            console.error(error);
        }
        console.log(body);
    });
}

const sendPasswordResetEmail = (email, _id, token) => {
    const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });
    const url = `${process.env.ORIGIN}/resetpassword/${_id}/${token}`;
    const data = {
        from: `c2c <${process.env.MAILGUN_FROM_EMAIL}>`,
        to: email,
        subject: 'Password Reset',
        text: 'Please click the link to reset your password',
        html: `
        <h3>Please click the link to reset your password</h3>
        <a href="${url}">${url}</a>`
    };
    mg.messages().send(data, (error, body) => {
        if (error) {
            console.error(error);
        }
        console.log(body);
    });
}

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
        return Promise.reject(new ClientError('Server Error, Please Contact Support'));
    })
}

/** 
 * Function to send reset password link to user's email using jwt based on user's doc
 * @param email -- user's email to send reset password link to
*/
const passwordReset = (email) => {
    return Users.findByEmail(email).then(doc => {
        if(doc) {
            console.log(doc);
            const { _id } = doc;
            return jwt.sign(doc, process.env.JWT_SECRET, { expiresIn: '1h'}, (err, token) => {
                if(err) {
                    console.error(err);
                } else {
                    sendPasswordResetEmail(email, _id, token);
                }
            }); 
        } else {
            return Promise.reject(new ClientError('Invalid Email'));
        }
    }).catch(err => {
        console.error(err);
        return Promise.reject(new ClientError('Server Error, Please Contact Support'));
    })
}

const resetPassword = (token, password, confirmPass) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {
            console.error(err);
        } else {
            console.log(decoded);
        }
    })
}

// always returns a promise
const register = (username, password, confirmPass, additionalFields = {}) => {
    const { email } = additionalFields;
    // if the user registered with an email & username, then find by username or email
    // because both should be unique, otherwise just find by username
    const query = email ? { $or: [{ email }, { username }] } : { username };
    if (password === confirmPass) {
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
                        }).then(userDoc => {
                            const { _id } = userDoc;
                            sendEmailVerification(email, _id);
                        }).catch(err => console.log(err))
                    )
                    .catch(err => console.log(err));
            }
            console.log(docArray);
            throw new ClientError('Username or E-mail already exists');
        });
    }

    return Promise.reject(new ClientError('Passwords do not match'));
};

const registerTemporary = (username, additionalFields = {}) =>
    Users.findByUsername({ username }).then(doc => {
        if (!doc) {
            return Users.addUser({
                username,
                ...additionalFields,
                temporary: true
            }).catch(err => console.log(err));
        }
        throw new ClientError('Username already exists');
    });

/**
 *  use whitelist method instead of blacklist
 * */

const filterSensitiveData = userDoc => {
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
    sendEmailVerification,
    verifyUser,
    passwordReset,
    resetPassword
};
