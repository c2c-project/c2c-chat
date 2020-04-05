import mailgun from 'mailgun-js';

const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
});

const sendEmail = (data) => {
    mg.messages().send(data, (error, body) => {
        if (error) {
            console.error("Mailgun Error: ", error);
        }
        console.log("Mailgun: ", body);
    });
}

const sendEmailVerification = (email, _id) => {
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
    sendEmail(data);
};

const sendPasswordResetEmail = (email, token) => {
    console.log(email);
    
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
    sendEmail(data);
};

export default {
	sendEmailVerification,
	sendPasswordResetEmail
}
