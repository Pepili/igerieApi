const nodemailer = require('nodemailer');

exports.sendMail = (req, res) => {
    const { nom, prenom, email, message } = req.body;
    if (!nom || !prenom || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    // Configuration de nodemailer
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
        user: process.env.MAIL,
        pass: process.env.PASSWORD_MAIL
        }
    });

    const mailOptions = {
        from: email,
        to: process.env.MAIL,
        subject: `Message from ${nom} ${prenom}`,
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
        console.log(error);
        res.status(500).send('Error sending email');
        } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send('Email sent successfully');
        }
    });
}