const nodemailer = require("nodemailer")

async function sendEmail(options) {
    // 1. create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // activate in mail trap "less secure app" option
    })
    // 2. define Email options
    const emailOptions = {
        from: "HyperStream CCTV Streaming support Team <support@hyperstream.com>",
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // end email via nodemailer
    await transporter.sendMail(emailOptions)
}

module.exports = sendEmail;