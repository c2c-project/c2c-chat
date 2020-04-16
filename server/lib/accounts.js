import bcrypt from 'bcrypt';
import jwt from './jwt';
import Users from '../db/collections/users';
import { ClientError } from './errors';
import Emails from './email';

const SALT_ROUNDS = 10;
const BASE_USER = {
    roles: ['user'],
};

/**
 * @description Realistically, only one of the required's fields within the requirements object will be used at any given time
 * @arg userRoles the array of string codes corresponding to the user's assigned roles
 * @arg requirements the object containing different role requirements for what they are trying to access
 * @returns {Promise} evalutes to a boolean
 */
const isAllowed = async (
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

/**
 * @description verifies the user; expects catch in calling function
 * @arg {string} userId _id of the user to verify
 * @throws {ClientError} The user navigated to an invalid link
 * @returns {Promise} MongoDB Cursor Promise
 */
const verifyUser = async (userId) => {
    const doc = await Users.findByUserId(userId);

    if (doc) {
        const verified = { $set: { verified: true } };
        return Users.updateUser(doc, verified);
    }

    throw new ClientError('Invalid Link');
};

/**
 * @description Function to send reset password link to user's email using jwt based on user's _id
 * @param {string} email user's email to send reset password link to
 * @returns {Promise} evaluates to the email sent
 * @throws {ClientError} Invalid Email or error with signing jwt
 */
const sendPasswordResetEmail = async (email) => {
    const doc = await Users.findByEmail(email);
    if (doc) {
        // Filter doc
        const { _id } = doc;
        const token = await jwt.sign({ _id }, process.env.JWT_SECRET, {
            expiresIn: '30m',
        });
        return Emails.sendPasswordResetEmail(email, token);
    }
    throw new ClientError('Invalid Email');
};

/**
 * @description Function to reset user's password in database
 * @param {string} decodedJwt user jwt that is decoded
 * @param {string} password new password
 * @param {string} confirmPassword new password confirmation
 * @returns {Promise} resolves to a MongoDB cursor on success
 * @throws {ClientError} Passwords do Not Match, Invalid Link, Expired Link
 */
const updatePassword = async (decodedJwt, password, confirmPassword) => {
    const { _id } = decodedJwt;
    // Find user in database then hash and update with new password
    if (password === confirmPassword) {
        const doc = await Users.findByUserId(_id);
        const encryptedPw = await bcrypt.hash(password, SALT_ROUNDS);
        const updatedPassword = {
            $set: { password: encryptedPw },
        };
        return Users.updateUser(doc, updatedPassword);
    }
    // if they do not match, throw an error
    throw new ClientError('Passwords do not match');
};

/**
 * @description register the user in the database ONLY
 * @arg {string} username
 * @arg {string} password
 * @arg {string} confirmpass
 * @arg {string} [additionalFields] optional argument with additional fields to register the user with
 * @returns {Promise} userDoc with db _id field
 * @throws {ClientError} Username or email already exists, Passwords do not match
 */
const register = async (
    username,
    password,
    confirmPass,
    additionalFields = {}
) => {
    const { email } = additionalFields;

    // if the user registered with an email & username, then find by username or email
    // because both should be unique, otherwise just find by username
    const query = email ? { $or: [{ email }, { username }] } : { username };

    if (password === confirmPass) {
        // returning a Promise here -- so register.then.catch will work
        const docArray = await Users.find(query);

        // if username and email do not already exist, based on my query before
        if (!docArray[0]) {
            const encryptedPw = await bcrypt.hash(password, SALT_ROUNDS);
            return Users.addUser({
                username,
                password: encryptedPw,
                // BASE_USER before additionalFields so that way additionalFields can override defaults if necessary
                ...BASE_USER,
                ...additionalFields,
            });
        }

        throw new ClientError('Username or E-mail already exists');
    }
    throw new ClientError('Passwords do not match');
};

/**
 * @description registers a user temporarily
 * @arg {String} username
 * @returns {Promise} resolves to a MongoDB cursor
 * @throws {ClientError} Username already exists
 */
const registerTemporary = async (username, additionalFields = {}) => {
    const doc = await Users.findByUsername({ username });
    // if username does not already exist
    if (!doc) {
        return Users.addUser({
            username,
            ...additionalFields,
            temporary: true,
        });
    }
    throw new ClientError('Username already exists');
};

// TODO: figure out where this should belong
/**
 * @description filters the sensitive data using whitelist methodology
 * @arg {Object} userDoc target to filter
 * @returns {Promise} resolves to the userDoc with ONLY whitelisted fields
 */
const filterSensitiveData = async (userDoc) => {
    // okay fields to send to client via jwt or any given time
    const okayFields = [
        '_id',
        'email',
        'username',
        'roles',
        'name',
        'verified',
    ];
    return Object.entries(userDoc).reduce((accum, [key, value]) => {
        if (okayFields.includes(key)) {
            return { ...accum, [key]: value };
        }
        return accum;
    }, {});
};

/**
 * @description determines if the userId owns the document
 * @arg {String} userId
 * @arg {Object} doc
 * @returns {Boolean} whether or not the user is the owner of a particular document
 */
const isOwner = (userId, doc) => {
    return doc.userId === userId;
};

export default {
    register,
    registerTemporary,
    verifyPassword: bcrypt.compare,
    isAllowed,
    filterSensitiveData,
    isOwner,
    verifyUser,
    sendPasswordResetEmail,
    updatePassword,
};
