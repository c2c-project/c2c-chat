import mailgun from 'mailgun-js';

const sendEmailVerification = (email, _id) => {
    const mg = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
    });
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
};

const sendPasswordResetEmail = (email, token) => {
    const mg = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
    });
    const url = `${process.env.ORIGIN}/resetpassword/${token}`;
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
};

export default {
	sendEmailVerification,
	sendPasswordResetEmail
}
