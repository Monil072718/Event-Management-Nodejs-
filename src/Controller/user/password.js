const User = require('../../models/User');
//const transporter = require("../../config/emailconfig")
const bcrypt = require('bcryptjs');
class Password {

    static recover = (req, res) => {
        const { email } = req.body;
        User.findOne({ email })
            .then(user => {
                if (!user) return res.status(401).json({ status: false, message: 'User Not Found!' });
                user.generatePasswordReset();
                user.save()
                    .then(user => {
                        let link = "http://" + req.headers.host + "/user/reset/" + user.resetPasswordToken;
                        console.log(link);

                        const mailOptions = {
                            from: 'Nandni <nanh@yopmail.com>',
                            to: user.email,
                            subject: 'For Reset Email',
                            html: `Hi ${user.username} <br>
                                Please click on the following link <br>  <a href=${link}>Click Here</a>  <br> to reset your password. <br>
                                If you did not request this, please ignore this email and your password will remain unchanged.`,// plain text body
                        };
                        transporter.sendMail(mailOptions, function (err, info) {
                            if (err)
                                return res.status(403).send({ "Status": false, "message": "Something Went Wrong!" });
                            else
                                return res.status(200).json({
                                    status: true,
                                    link: "http://" + req.headers.host + "/user/reset/" + user.resetPasswordToken,
                                    message: `Please check Email ${user.email} on your mailbox.`
                                });
                        });
                    })
                    .catch(err => res.status(500).json({ status: true, message: "Send Email Successfully" }));
            })
            .catch(err => res.status(500).json({ status: false, message: "User not Find!" }));
    };

    static reset = (req, res) => {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
            .then((user) => {
                if (!user) return res.status(401).json({ message: 'Password reset token is invalid or has expired.', data: { user } });
                res.render('form', { user });
            })
            .catch(err => res.status(500).send({ message: "Your Password Not be changed!" }));
    };

    static resetPassword = (req, res) => {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
            .then(async (user) => {
                if (!user) return res.status(401).json({ status: false, message: 'Password reset token is invalid or has expired.', data: { user } });
                const salt = await bcrypt.genSalt(10)
                const hashpassword = await bcrypt.hash(req.body.password, salt)
                user.password = hashpassword;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save()
                    .then(async (user) => {
                        return res.status(200).json({ status: true, message: "Your Password has Been Successfully changed!", data: { user } });
                    }).catch(err => {
                        return res.status(500).json({ status: false, message: "Your Password not changed!" });
                    })
                // const mailOptions = {
                //     from: 'Nandni <nanh@yopmail.com>',
                //     to: user.email,
                //     subject: "Your password has been changed",
                //     text: `Hi ${user.username} \n 
                //     This is a confirmation that the password for your account ${user.email} has just been changed.\n`
                // };
                // transporter.sendMail(mailOptions, function (err, info) {
                //     if (err)
                //         console.log(err)
                //     else
                //         return res.status(200).send({ status: true, message: "Your Passwored has been successfully Updated!" })
                // });
            });
    };


}



module.exports = Password;








