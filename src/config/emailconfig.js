require('dotenv').config()
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.Email_host,
  port: process.env.Email_Port,
  secure: false, // true for 465, false for other ports
  pool: true,
  secureConnection: false,
  auth: {
    user: process.env.Email_user, // generated ethereal user
    pass: process.env.Email_pass, // generated ethereal password
  },
});






module.exports = transporter;