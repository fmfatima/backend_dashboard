const nodemailer = require('nodemailer');

const sendEmail = async(option) => {
    //craete a transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD

        }
    })
    //email option
    const emailOptions = {
        from: 'Cineflix support<support@coneflix.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }
    await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;