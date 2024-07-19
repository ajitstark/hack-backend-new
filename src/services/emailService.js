const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text, html) => {
    try {
        const msg = {
            to,
            from: process.env.JP_EMAIL_ADDRESS,
            subject,
            text,
            html,
        };
        await sgMail.send(msg);
        console.log('Email sent');
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
};

module.exports = { sendEmail };