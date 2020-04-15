import mailgun from 'mailgun-js';

const {
    MAILGUN_API_KEY,
    MAILGUN_DOMAIN,
    ORIGIN,
    MAILGUN_FROM_EMAIL,
} = process.env;

const mg = mailgun({
    apiKey: MAILGUN_API_KEY,
    domain: MAILGUN_DOMAIN,
});

/**
 * @description internal function to use mg api to send email
 * @arg {Object} data email data based on mg api docs
 * @returns {Promise}
 */
const sendEmail = async (data) => {
    return mg.messages().send(data);
};

/**
 * @description send a verification email
 * @arg {String} email email to send to
 * @arg {String} userId database id of the user
 * @returns {Promise}
 */
const sendEmailVerification = async (email, userId) => {
    const url = `${ORIGIN}/verification/${userId}`;
    const data = {
        from: `c2c <${MAILGUN_FROM_EMAIL}>`,
        to: email,
        subject: 'Email Verificaiton',
        text: 'Please click the link to confirm your email',
        html: `
        <h3>Please click the lik to confirm your email</h3>
        <a href="${url}">${url}</a>`,
    };
    return sendEmail(data);
};

/**
 * @description send password reset email
 * @arg {String} email target email
 * @arg {String} token jwt
 */
const sendPasswordResetEmail = async (email, token) => {
    // TODO: base64 url encode the token
    const url = `${ORIGIN}/resetpassword/${token}`;
    const data = {
        from: `c2c <${MAILGUN_FROM_EMAIL}>`,
        to: email,
        subject: 'Password Reset',
        text: 'Please click the link to reset your password',
        html: `
        <h3>Please click the link to reset your password</h3>
        <a href="${url}">${url}</a>`,
    };
    return sendEmail(data);
};

export default {
    sendEmailVerification,
    sendPasswordResetEmail,
};
