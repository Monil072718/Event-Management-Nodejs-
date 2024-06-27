const mongoose = require('mongoose');
const validator = require('validator');
const { array } = require('../../helper/uploadimage');
const Event = new mongoose.Schema({
    eventname: {
        type: String,
        required: true,
        trim: true,
        unique:true,
    },
    eventtype:
    {
        type: String,
        required: true,
        trim: true,
    },
    eventdescription: {
        type: String,
        required: true,
    },
    eventlocation:
    {
        type: String,
        required: true,
        trim: true,
        
    },
    location:{
        GeolocationCoordinates:[],
    },
    date:
    {
        type: String,
        required: true,
    },
    enddate: {
        type: String,
        required: true,
    },
    time:
    {
        type: String,
        required: true,
    },
    price:
    {
        type: Number,
        required: true,
    },
    image: {
        type: Array,
    },
    video: {
        type: Array,
    }
},
    { timestamps: true }
);
Event.index({eventlocation:"2dsphere"})
const event = new mongoose.model('Event', Event);

module.exports = event;