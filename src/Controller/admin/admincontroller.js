const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//const transporter = require("../../config/emailconfig")
const Admin = require("../../models/Admin");
const User = require("../../models/User");
const { ObjectId } = require("mongodb");


class Adminside {

    static signIn = async (req, res) => {
        try {
            const { email, username, password } = req.body;
            if (email || username && password) {
                const admin = await Admin.findOne(
                    {
                        $or: [
                            { email }, { username }
                        ]
                    }
                )
                if (admin != null) {
                    const isMatch = await bcrypt.compare(password, admin.password)
                    if ((admin.email === email || admin.username === username) && isMatch) {

                        const token = jwt.sign({ adminID: admin._id },
                            process.env.JWT_SECRET, { expiresIn: '5h' })
                        res.status(201).send({ data: { admin, token }, "status": "True", "message": "Admin Can login successfully!" });
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

    static updateAdmin = async (req, res) => {
        try {
            const _id = req.params.id;
            const updateAdmin = await Admin.findOneAndUpdate(_id, req.body, {
                new: true
            });
            res.status(201).send({ data: updateAdmin, status: true, message: "Admin Data Updated!" });
        }
        catch (e) {
            res.status(404).send({ data: updateAdmin, status: false, message: "Admin Data doesn't Updated!" });
        }
    }

    static getUsers = async (req, res) => {
        const username = req.query.username;
        const email = req.query.email;
        const address = req.query.address;
        const start = req.query.start || 1;
        const limit = parseInt(req.query.limit);
        const skip = (start - 1) * limit;
        let filter = {};
        try {
            if (username !== undefined && email !== undefined && address !== undefined) {
                filter = {
                    $and: [
                        { $or: [{ firstname: { $regex: ".*" + username + ".*", $options: "i" } }, { lastname: { $regex: ".*" + username + ".*", $options: "i" } }, { username: { $regex: ".*" + username + ".*", $options: "i" } }] },
                        { email: { $regex: ".*" + email + ".*", $options: "i" } },
                        { $or: [{ address: { $regex: ".*" + address + ".*", $options: "i" } }, { city: { $regex: ".*" + address + ".*", $options: "i" } }, { state: { $regex: ".*" + address + ".*", $options: "i" } }] },
                    ],
                }
            } else {
                filter = {};
            }
            const users = await User.find(filter).skip(skip).limit(limit);
            const count = await User.find(filter).count();
            if (users != 0) {
                return res.status(201).json({
                    status: true,
                    message: `Users data retrive successfully.`,
                    data: [
                        {
                            users: users,
                            totalPages: Math.ceil(count / limit),
                            currentPage: req.query.start,
                            totalUsers: count,
                        },
                    ],
                })
            } else {
                return res.status(200).json({
                    status: false,
                    message: `Users not found.`,
                    data: [
                        {
                            users: [],
                            totalPages: Math.ceil(0 / limit),
                            currentPage: req.query.start,
                            totalUsers: 0,
                        },
                    ],
                });
            }
        } catch (error) {
            res.status(400).json({ status: false, message: "Something Went Wrong!............" });
        }
    }

    static AddUser = async (req, res) => {
        const { firstname, lastname, username, email, password, dateofbirth, gender, phonenumber, address, city, state, zipcode, occupation, hobbies } = req.body;
        var profileimage = [];
        if (req.files.length > 1) {
            return res.send({ "status": "False", "message": "Please select only one ProfileImage" });
        }
        else {
            if (req.files !== undefined && req.files !== "") {
                let path = ""
                req.files.forEach(function (files, index, arr) {
                    path = path + files.path + ","
                })
                path = path.substring(0, path.lastIndexOf(","))
                profileimage.push({ ...profileimage, image: path })
            }
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
                    // const mailOptions = {
                    //     from: '<Nandni>',
                    //     to: saved_user.email,
                    //     subject: 'For Registration with Us',
                    //     html: `<p>Thank You for Registration <br> Your Username is ${username} <br> Your Password is ${password} <br></p>`
                    // };
                    // transporter.sendMail(mailOptions, function (err, info) {
                    //     if (err)
                    //         console.log(err);
                    //     else
                    //         console.log(info);
                    // });
                    return res.status(200).send({ data: { saved_user }, "status": "True", "message": "User signup successfully!" });
                } else {
                    return res.status(400).send({ "status": "False", "message": "This Field does not Exists!" });
                }
            }
        } catch (error) {
            console.log(error);
            return res.status(401).send({ "status": "False", "message": error.message });
        }
    }

    static UpdateUser = async (req, res) => {
        try {
            const { firstname, lastname, username, email, dateofbirth, gender, phonenumber, address, city, state, zipcode, occupation, hobbies } = req.body;
            var profileimage = [];
            const user_id = req.params.id;
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
                    firstname: firstname, lastname: lastname, username: username, email: email, password: hashpassword, dateofbirth: dateofbirth, gender: gender, phonenumber: phonenumber, address: address, city: city, state: state, zipcode: zipcode, occupation: occupation, hobbies: hobbies, profileimage: profileimage
                }, { new: true });
                return res.status(201).send({ data: profile, "status": "True", "message": "Your Data Successfully Updated!" });
            } else {
                const updateprofile = await User.findOneAndUpdate({ _id: new ObjectId(user_id) }, {
                    firstname: firstname, lastname: lastname, username: username, email: email, password: hashpassword, dateofbirth: dateofbirth, gender: gender, phonenumber: phonenumber, address: address, city: city, state: state, zipcode: zipcode, occupation: occupation, hobbies: hobbies
                }, { new: true });
                return res.status(201).send({ data: updateprofile, "status": "True", "message": "Your Data Successfully Updated!" });
            }
        } catch (e) {
            console.log(e);
            return res.status(404).send({ data: {}, "status": "False", "Message": "Your Data Are Not Updated!" });
        }
    }

    static ChangePasswordAdmin = async (req, res) => {
        const body = req.body
        const admin = await Admin.findById(req.admin._id);
        const oldPassword = body.oldpassword;
        const newPassword = body.newpassword;
        bcrypt.compare(oldPassword, admin.password, (err, isMatch) => {
            if (err) {
                return res.status(404).json({ status: false, message: "Password is wrong!" });
            } else if (!isMatch) {
                return res.status(404).json({ status: false, message: "Old password is incorrect!" });
            } else {
                bcrypt.hash(newPassword, 10, async (err, hash) => {
                    if (err) {
                        return res.status(404).json({ status: false, message: "Password is incorrect!" });
                    } else {
                        admin.password = hash;
                        await Admin.findOneAndUpdate(
                            { _id: req.admin._id },
                            { $set: { newPassword: hash } },
                            { new: true }
                        );
                        admin.save();
                        return res.status(200).json({ status: true, message: "Password updated successfully!", data: admin });
                    }
                });
            }
        });
    }

    static DeleteUser = async (req, res) => {
        try {
            const DeleteUser = await User.findByIdAndDelete(req.params.id);
            if (!DeleteUser) {
                return res.status(401).json({ status: false, message: "User Not Found!", data: DeleteUser });
            } else {
                return res.status(200).json({ status: true, message: "User Deleted Successfully!!", data: DeleteUser });
            }
        } catch (e) {
            res.status(500).send(e);
        }
    }

    static ChangePasswordUser = async (req, res) => {
        const body = req.body;
        const user = await User.findById(body.userId);
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
                            { _id: new ObjectId(body.userId) },
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

    static signUp = async (req, res) => {
        const { fullname, username, email, password, } = req.body;
        try {
            const admin = await Admin.findOne({ email: email });
            if (admin) {
                return res.send({ "status": "False", "message": "Email is Already Exits!" });
            } else {
                if (fullname !== "" && username !== "" && email !== "" && password !== "") {
                    const salt = await bcrypt.genSalt(10)
                    const hashpassword = await bcrypt.hash(password, salt)
                    const doc = new Admin({
                        fullname: fullname,
                        username: username,
                        email: email,
                        password: hashpassword,
                    })
                    await doc.save();
                    const admin_user = await Admin.findOne({ email: email })
                    const token = jwt.sign({ adminID: admin_user._id },
                        process.env.JWT_SECRET, { expiresIn: '30min' })
                    return res.status(201).send({ data: { admin_user, token }, "status": "True", "message": "Admin signup successfully!" });
                } else {
                    return res.status(400).send({ "status": "False", "message": "This Field does not Exists!" });
                }
            }
        } catch (error) {
            console.log(error);
            return res.status(401).send({ "status": "False", "message": error.message });
        }
    }

    static LoginUser = async (req, res) => {
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
                        res.status(201).send({ data: { users }, "status": "True", "message": "User login successfully!" });
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

    static Searchuser = async (req, res) => {
        const search = req.query.search;
        const start = req.query.start || 1;
        const limit = parseInt(req.query.limit);
        const skip = (start - 1) * limit;
        var filter = {};
        if (search) {
            filter = { username: { $regex: ".*" + search + ".*", $options: "i" } };
            try {
                const users = await User.find(filter).skip(skip).limit(limit);
                const count = await User.find(filter).count();
                if (users.length !== 0) {
                    return res.status(200).json({
                        status: true,
                        message: `Users data retrive successfully.`,
                        data: [
                            {
                                users: users,
                                totalPages: Math.ceil(count / limit),
                                currentPage: req.query.start,
                                totalUsers: count,
                            },
                        ],
                    });
                } else {
                    return res.status(200).json({
                        status: false,
                        message: `Users not found.`,
                        data: [
                            {
                                users: [],
                                totalPages: Math.ceil(0 / limit),
                                currentPage: req.query.start,
                                totalUsers: 0,
                            },
                        ],
                    });
                }
            } catch (error) {
                res.status(400).json(error);
            }
        } else {
            const users = await User.find(filter).skip(skip).limit(limit);
            const count = await User.find(filter).count();
            if (users.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: `Users data retrive successfully.`,
                    data: [
                        {
                            users: users,
                            totalPages: Math.ceil(count / limit),
                            currentPage: req.query.start,
                            totalUsers: count,
                        },
                    ],
                });
            } else {
                return res.status(200).json({
                    status: false,
                    message: `Users not found.`,
                    data: [
                        {
                            users: [],
                            totalPages: Math.ceil(0 / limit),
                            currentPage: req.query.start,
                            totalUsers: 0,
                        },
                    ],
                });
            }
        }
    }
}

module.exports = Adminside;






