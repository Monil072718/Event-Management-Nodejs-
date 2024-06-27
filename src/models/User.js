require('dotenv').config()
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require("validator");
const User = new mongoose.Schema({
    firstname:
    {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
    },
    lastname:
    {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    username:
    {
        type: String,
        required: [true, 'User name is required'],
        trim: true
    },
    email:
    {
        type: String,
        required: true,
        unique: [true, "Email id is already registered!"],
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
    dateofbirth:
    {
        type: Date,
        required: true,
        trim: true
    },
    gender:
    {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        trim: true
    },
    phonenumber:
    {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return /^\d{10}$/.test(value);
            },
            message: 'Your Phone number must be 10 digits'
        },

    },
    address:
    {
        type: String,
        required: true,
    },
    city:
    {
        type: String,
        required: true,
    },
    state:
    {
        type: String,
        required: true,
    },
    zipcode:
    {
        type: Number,
        required: true,
        minlength: 6,
    },
    occupation:
    {
        type: String,
        required: true,
    },
    hobbies:
    {
        type: String,
        required: true,
    },
    profileimage: {
        type: Array,
    },
    resetPasswordToken:
    {
        type: String,
        required: false
    },

    resetPasswordExpires:
    {
        type: Date,
        required: false
    },
    isPaymentSuccessful: {
        type: Boolean,
        default: false
    },
    eventId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event"
        }
    ],
    stripeCustomerId: {
        type: String
    }
},
    { timestamps: true }
);


User.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

User.methods.generateJWT = function () {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    let payload = {
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
        email: this.email,
        password: this.password,
        dateofbirth: this.dateofbirth,
        gender: this.gender,
        phonenumber: this.phonenumber,
        address: this.address,
        city: this.city,
        state: this.state,
        zipcode: this.zipcode,
        occupation: this.occupation,
        hobbies: this.hobbies,
        profileimage: this.profileimage
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(expirationDate.getTime() / 1000, 10)
    });
};


User.methods.generatePasswordReset = function () {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

const user = new mongoose.model('User', User);
module.exports = user;


















































