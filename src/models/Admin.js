const mongoose = require('mongoose');
const validator = require('validator');
const Admin = new mongoose.Schema({
    fullname: {
        type: String,
        trim: true,
    },
    username:
    {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Please Enter valid Email!")
            }
        }
    },
    password:
    {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        trim: true
    },

});

const admin = new mongoose.model('Admin', Admin);
module.exports = admin;