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

const sendEmail = async (data) => {
    return mg.messages().send(data);
};

const sendEmailVerification = async (email, _id) => {
    const url = `${ORIGIN}/verification/${_id}`;
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

const sendPasswordResetEmail = async (email, token) => {
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
