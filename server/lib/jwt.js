import jwt from 'jsonwebtoken';

/**
 * @description wrapper to jsonwebtoken.verify
 * @arg {string} token
 * @arg {string} secret
 * @returns {Promise} resolves to a decoded jwt on success
 */
const verify = async function (token, secret) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decodedJwt) => {
            if (err) {
                reject(err);
            } else {
                resolve(decodedJwt);
            }
        });
    });
};

/**
 * @description wrapper to jsonwebtoken.sign
 * @arg {Any} target this is going to jwt'd
 * @arg {String} secret
 * @arg {Object} [options] optional options for jwt signing
 * @returns {Promise} resolves to the jwt on success
 */
const sign = async function (target, secret, options = {}) {
    return new Promise((resolve, reject) => {
        jwt.sign(target, secret, options, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
};

export default {
    verify,
    sign,
};
