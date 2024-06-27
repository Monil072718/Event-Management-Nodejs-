const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../../models/User");
const Event = require('../../models/Event');
const stripe = require('stripe')(process.env.SECRET_KEY);
const Booking = require('../../models/Booking');
// const cron = require("node-cron");
// const moment = require('moment');
// const transporter = require("../../config/emailconfig")
const { ObjectId } = require("mongodb");
const event = require('../../models/Event');

class UserSide {

    static registerUser = async (req, res) => {
        const { firstname, lastname, username, email, password, dateofbirth, gender, phonenumber, address, city, state, zipcode, occupation, hobbies } = req.body;
        var profileimage = [];
        if (req.files.length > 1) {
            return res.send({ "status": "False", "message": "Please select only one ProfileImage" });
        }
        else {
            let path = ""
            req.files.forEach(function (files, index, arr) {
                path = path + files.path + ","
            })
            path = path.substring(0, path.lastIndexOf(","))
            profileimage.push({ ...profileimage, image: path })
        }
        try {
            const user = await User.findOne({ email: email });
            if (user) {
                return res.send({ "status": "False", "message": "Email is Already Exits!" });
            } else {
                if (firstname !== "" && lastname !== "" && username !== "" && email !== "" && password !== "" && dateofbirth !== "" && gender !== "" && phonenumber !== "" && address !== "" && city !== "" && state !== "" && zipcode !== "" && occupation !== "" && hobbies !== "" && profileimage !== "") {
                    const salt = await bcrypt.genSalt(10)
                    const hashpassword = await bcrypt.hash(password, salt)
                    const doc = new User({
                        firstname: firstname, lastname: lastname, username: username, email: email, password: hashpassword, dateofbirth: dateofbirth, gender: gender, phonenumber: phonenumber, address: address, city: city, state: state, zipcode: zipcode, occupation: occupation, hobbies: hobbies, profileimage: profileimage
                    })
                    await doc.save();
                    const saved_user = await User.findOne({ email: email })
                    const token = jwt.sign({ userID: saved_user._id },
                        process.env.JWT_SECRET, { expiresIn: '30min' })
                    // const mailOptions = {
                    //     from: '<Nandni>',
                    //     to: saved_user.email,
                    //     subject: 'For Registration with Us',
                    //     html: `<p>Thank You for Registration <br> Your Username is ${saved_user.username} <br> Your Password is ${saved_user.password}</p>`
                    // };
                    // transporter.sendMail(mailOptions, function (err, info) {
                    //     if (err)
                    //         console.log(err);
                    //     else
                    //         console.log(info);
                    // });
                    return res.status(201).send({ data: { saved_user, token }, "status": "True", "message": "User signup successfully!" });
                } else {
                    return res.status(400).send({ "status": "False", "message": "This Field does not Exists!" });
                }
            }
        } catch (error) {
            console.log(error);
            return res.status(401).send({ "status": "False", "message": error.message });
        }
    }

    static userLogin = async (req, res) => {
        try {
            const { email, username, password } = req.body;
            if (email || username && password) {
                const users = await User.findOne(
                    {
                        $or: [
                            { email }, { username }
                        ]
                    }
                )
                if (users != null) {
                    const isMatch = await bcrypt.compare(password, users.password)
                    if ((users.email === email || users.username === username) && isMatch) {
                        const token = jwt.sign({ userID: users._id },
                            process.env.JWT_SECRET, { expiresIn: '5h' });
                        res.status(201).send({ data: { users, token }, "status": "True", "message": "User login successfully!" });
                    } else {
                        res.status(401).send({ "status": "False", "message": "Your Password are not valid!" });
                    }
                } else {
                    res.status(401).send({ "status": "False", "message": "Your Email or Username is not valid!" });
                }
            } else {
                res.status(401).send({ "status": "False", "message": "Please Enter Username Or Email!" });
            }
        } catch (error) {
            console.log(error.message);
            res.status(404).send({ "status": "False", "message": "Unable to login" });
        }
    }

    static getProfile = async (req, res) => {
        try {
            const { user } = req;
            if (user === null || user === "") {
                return res.status(404).send({ "status": "False", "message": "Invalid user!" });
            } else {
                const getuser = await User.findById({ _id: user._id });
                if (!getuser) {
                    return res.status(404).send({ "status": "False", "message": "User Not Registerd!" });
                }
                else {
                    res.status(201).send({ "status": "True", "message": "User detail retrieve successfully", data: { getuser } });
                }
            }
        }
        catch (e) {
            res.status(500).send(e);
        }
    }

    static updateprofile = async (req, res) => {
        const { user } = req;
        try {
            if (user === null || user === "" || user === undefined) {
                return res.status(404).send({ "status": "False", "message": "Invalid user!" });
            } else {
                const { firstname, lastname, username, email, dateofbirth, gender, phonenumber, address, city, state, zipcode, occupation, hobbies } = req.body;
                var profileimage = [];
                const user_id = user._id;
                if (req.files.length > 1) {
                    return res.send({ "status": "False", "message": "Please select only one ProfileImage" });
                } else if (req.files !== undefined && req.files !== null && req.files !== "" && req.files.length !== 0) {
                    let path = ""
                    req.files.forEach(function (files, index, arr) {
                        path = path + files.path + ","
                    })
                    path = path.substring(0, path.lastIndexOf(","))
                    profileimage.push({ ...profileimage, image: path })
                    const profile = await User.findOneAndUpdate({ _id: new ObjectId(user_id) }, {
                        firstname: firstname, lastname: lastname, username: username, email: email, dateofbirth: dateofbirth, gender: gender, phonenumber: phonenumber, address: address, city: city, state: state, zipcode: zipcode, occupation: occupation, hobbies: hobbies, profileimage: profileimage,
                    }, { new: true });
                    return res.status(201).send({ data: profile, "status": "True", "message": "Your Data not Successfully Updated!" });
                } else {
                    const updateprofile = await User.findOneAndUpdate({ _id: new ObjectId(user_id) }, {
                        firstname: firstname, lastname: lastname, username: username, email: email, dateofbirth: dateofbirth, gender: gender, phonenumber: phonenumber, address: address, city: city, state: state, zipcode: zipcode, occupation: occupation, hobbies: hobbies
                    }, { new: true });
                    return res.status(201).send({ data: updateprofile, "status": "True", "message": "Your Data  yes Successfully Updated!" });
                }
            }
        } catch (e) {
            console.log(e);
            return res.status(404).send({ data: {}, "status": "False", "Message": "Your Data Are Not Updated!" });
        }
    }

    static changeUserPassword = async (req, res) => {
        const body = req.body
        const user = await User.findById(req.user._id);
        const oldPassword = body.oldpassword;
        const newPassword = body.newpassword;
        bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
            if (err) {
                return res.status(404).json({ status: false, message: "Password is wrong!" });
            } else if (!isMatch) {
                return res.status(404).json({ status: false, message: "Old password is incorrect!" });
            } else {
                bcrypt.hash(newPassword, 10, async (err, hash) => {
                    if (err) {
                        return res.status(404).json({ status: false, message: "Password is incorrect!" });
                    } else {
                        user.password = hash;
                        await User.findOneAndUpdate(
                            { _id: req.user._id },
                            { $set: { newPassword: hash } },
                            { new: true }
                        );
                        user.save();
                        return res.status(200).json({ status: true, message: "Password updated successfully!", data: user });
                    }
                });
            }
        });
    }

    static forgotPassword = async (req, res) => {
        const { email } = req.body
        if (email) {
            const user = await User.findOne({ email: email })
            if (user) {
                const secret = user._id + process.env.JWT_SECRET
                const token = jwt.sign({ userID: user._id }, secret, {
                    expiresIn: '15min'
                })
                const link = `${process.env.BASE_URL}/password-reset/${token}`;
                console.log(process.env.BASE_URL);
                console.log(link);
                // const mailOptions = {
                //     from: 'Nandni <nanh@yopmail.com>',
                //     to: user.email,
                //     subject: 'For Reset Email',
                //     html: `<a href=${link}>You Have TO Use This Token For Reset Password ${token}</a> to reset Password`
                // };
                // transporter.sendMail(mailOptions, function (err, info) {
                //     if (err)
                //         console.log(err)
                //     else
                //         console.log(info);
                // });
                res.send({ "status": "success", "message": "Password reset Email Sent....Please Check Your Email", data: { token, user } });
            } else {
                res.send({ "status": "failed", "message": "Email doesn't match!" })
            }
        } else {
            res.send({ "status": "failed", "message": "Email Field is Required!" })
        }
    }

    static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body
        const { id, token } = req.params
        const user = await User.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET
        try {
            jwt.verify(token, new_secret)
            if (password && password_confirmation) {
                if (password !== password_confirmation) {
                    res.send({ "status": "failed", "message": "New Password and Confirm New Password Doesn't Match!" })
                } else {
                    const salt = await bcrypt.genSalt(10)
                    const newHashPassword = await bcrypt.hash(password, salt)
                    await User.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })
                    res.send({ "status": "success", "message": "Password Reset Successfully!.." })
                }
            } else {
                res.send({ "status": "failed", "message": "All Field are Required!" })
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    static searchEvent = async (req, res) => {
        const search = req.query.search;
        const start = req.query.start || 1;
        const limit = parseInt(req.query.limit);
        const skip = (start - 1) * limit;
        var filter = {};
        if (search) {
            filter = { eventlocation: { $regex: ".*" + search + ".*", $options: "i" } };
            try {
                const events = await Event.find(filter).skip(skip).limit(limit);
                const count = await Event.find(filter).count();
                if (events.length !== 0)
                    return res.status(200).json({
                        status: true,
                        message: `Event data retrive successfully.`,
                        data: [
                            {
                                events: events,
                                totalPages: Math.ceil(count / limit),
                                currentPage: req.query.start,
                                Totalevent: count,
                            },
                        ],
                    });
                else
                    return res.status(200).json({
                        status: false,
                        message: `Event not found.`,
                        data: [
                            {
                                events: [],
                                totalPages: Math.ceil(0 / limit),
                                currentPage: req.query.start,
                                Totalevent: 0,
                            },
                        ],
                    });
            } catch (error) {
                res.status(400).json(error);
            }
        } else {
            return res.status(401).send({ status: false, message: "Something Went Wrong!............" })

        }

    }

    static paymentCheckOut = async (req, res) => {
        console.log(customer_id, "hjfffffffffffffffffffffffffj");
        try {
            const session = await stripe.checkout.sessions.create({
                stripeCustomerId: customer.id,
                payment_method_types: ["card"],
                mode: "payment",
                line_items: [{
                    price: event.price,
                    quantity: req.body.quantity
                }],
                success_url: 'file:///home/decodeup/Project API/Event Management Platform/src/views/cancel.html',
                cancel_url: 'file:///home/decodeup/Project API/Event Management Platform/src/views/success.html'
            })
            res.send({ id: session.id });
        } catch (e) {
            throw new Error(e)
        }
    }

    static bookEvent = async (req, res) => {
        const { card_ExpYear, card_ExpMonth, card_Number, card_cvc } = req.body;
        const { user } = req;
        const event_id = req.params.id;
        const body = req.body;
        try {
            const event = await Event.findById(event_id);
            if (body.type === "booking") {
                if (event === null) {
                    return res.json({ error: { type: 'eventNonExistent', message: 'Event no longer exists.' } });
                } else if (event.enddate < new Date()) {
                    return res.json({ error: { type: 'eventEnded', message: 'Event has already ended.' } });
                } else if (user.eventId.includes(event._id)) {
                    return res.json({ error: { type: 'alreadyBooked', message: 'You have already booked into this event.' } });
                } else {
                    const customer = await stripe.customers.create({
                        email: body.email,
                    })
                    if (customer !== null) {
                        const card_token = await stripe.tokens.create({
                            card: {
                                number: card_Number,
                                exp_month: card_ExpMonth,
                                exp_year: card_ExpYear,
                                cvc: card_cvc,
                            },
                        })
                        const card = await stripe.customers.createSource(customer.id, {
                            source: `${card_token.id}`,
                        });
                        const paymentIntent = await stripe.paymentIntents.create({
                            amount: 2000,
                            currency: 'inr',
                            automatic_payment_methods: { enabled: true },
                        });
                        const booking = new Booking({
                            user: user._id, event: event.id, stripeCustomerId: customer.id, email: user.email, startdate: event.date,
                            card: {
                                card_number: card.last4,
                                exp_month: card.exp_month,
                                exp_year: card.exp_year,
                                card_id: card.id,
                            }
                        });
                        await booking.save();
                        const userdata = await User.findOneAndUpdate({ _id: user._id }, { stripeCustomerId: customer.id, $push: { eventId: event._id } }, { new: true });
                        return res.status(201).send({ status: true, message: "Event booking Successfully!", userdata });
                    } else {
                        return res.status(200).send({ status: true, message: "Card Add Successfully!", data: { card: card.id } });
                    }
                }
            } else {
                return res.status(500).send({ status: false, message: "Internal server Error!" });
            }
        } catch (error) {
            console.log(error, "error");
            return res.status(401).send({ status: false, message: "Something Went Wrong!" });
        }
    }

    static createCustomer = async (req, res) => {
        const { user } = req;
        const event_id = req.params.id;
        const body = req.body;
        try {
            const event = await Event.findById(event_id);
            if (body.type === "booking") {
                if (event === null) {
                    return res.json({ error: { type: 'eventNonExistent', message: 'Event no longer exists.' } });
                } else if (event.enddate < new Date()) {
                    return res.json({ error: { type: 'eventEnded', message: 'Event has already ended.' } });
                } else if (user.eventId.includes(event._id)) {
                    return res.json({ error: { type: 'alreadyBooked', message: 'You have already booked into this event.' } });
                } else {
                    try {
                        const customer = await stripe.customers.create({
                            email: body.email,
                        })
                        const userdata = await User.findOneAndUpdate({ _id: user._id }, { stripeCustomerId: customer.id, $push: { eventId: event._id } }, { new: true });
                        return res.status(201).send({ status: true, message: "Event booking Successfully!", userdata });
                    } catch (e) {
                        throw new Error(e);
                    }
                }
            } else {
                return res.status(500).send({ status: false, message: "Internal server Error!" });
            }
        } catch (error) {
            console.log(error, "error");
            return res.status(401).json({ status: false, message: "Something Went Wrong!" });
        }
    }

    static addCard = async (req, res) => {
        const { customer_id, card_name, card_ExpYear, card_ExpMonth, card_Number, card_cvc } = req.body;
        try {
            const card_token = await stripe.tokens.create({
                card: {
                    name: card_name,
                    number: card_Number,
                    exp_month: card_ExpMonth,
                    exp_year: card_ExpYear,
                    cvc: card_cvc,
                },
            })
            const card = await stripe.customers.createSource(customer_id, {
                source: `${card_token.id}`,
            });
            return res.status(200).send({ status: true, message: "Card Add SUccessfully!", data: { card: card.id } });

        } catch (error) {
            throw new Error(error);
        }
    }

    static createCharges = async (req, res) => {
        try {

            const { customer_id, card_ExpYear, card_ExpMonth, card_Number, card_cvc } = req.body;
            const card_token = await stripe.tokens.create({
                card: {
                    number: card_Number,
                    exp_month: card_ExpMonth,
                    exp_year: card_ExpYear,
                    cvc: card_cvc,
                },
            })
            // const charge = await stripe.charges.create({
            //     amount: 2000,
            //     currency: 'inr',
            //     source: `${card_token.id}`,
            //     description: 'My First Test Charge (created for API docs at https://www.stripe.com/docs/api)',
            //   });
            const paymentIntent = await stripe.paymentIntents.create({
                amount: 2000,
                currency: 'inr',
                automatic_payment_methods: { enabled: true },
            });
            res.send({ paymentIntent, status: true, message: "Charges Create Successfully" });
        } catch (e) {
            throw new Error(e);
        }

    }

    static cancelEvent = async (req, res) => {
        const { user } = req;
        const event_id = req.params.id;
        const body = req.body;
        try {
            const event = await Event.findById(event_id);
            if (body.type === "cancel") {
                if (!user.eventId.includes(event._id)) {
                    return res.status(401).send({ status: false, message: "Event is already cancelled!", data: [] });
                } else {
                    const userdata = await User.findOneAndUpdate({ _id: user._id }, { $pull: { eventId: event_id } }, { new: true });
                    return res.status(201).send({ status: true, message: "Event cancel Successfully!", data: userdata });
                }
            } else {
                return res.status(500).send({ status: false, message: "Internal server Error!" });
            }
        } catch (error) {
            return res.status(401).json({ status: false, message: "Something Went Wrong!" });
        }
    }

}
module.exports = UserSide;
//0 */12 * * *
// cron.schedule("*/5 * * * * *", async function (req, res) {
//     // var fromdate = new Date();
//     const fromdate = moment().add(2, "days").format("DD-MM-YYYY");
//     //console.log(fromdate, "fromdate");
//     const event_data = await Booking.find({ startdate: { $lte: fromdate } });
//     //console.log(event_data,"Your Email");

//     if (event_data.length > 0) {
//         event_data?.userID?.forEach(item, async i => {
//             const userData = await User.findOne({ _id: new ObjectId(item) });
//             console.log(user_id, "fjghgjhjghkjh");
//             const mailOptions = {
//                 from: '<Nandni>',
//                 to: userData.email,
//                 subject: 'Reminder for Event',
//                 html: `<p>Your Event After 2 days Are You ready? for that</p>`
//             }
//             transporter.sendMail(mailOptions, function (err, info) {
//                 if (err)
//                     console.log(err);
//                 else
//                     console.log(info);
//             });
//         });
//     }
//     else {
//         return res.status(401).send({ status: false, message: "Email not Send!" })
//     }
// })




