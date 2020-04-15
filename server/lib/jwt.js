import jwt from 'jsonwebtoken';

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
