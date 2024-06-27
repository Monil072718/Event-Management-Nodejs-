const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  stripeCustomerId: {
    type: String
  },
  email: {
    type: String
  },
  startdate:{
    type:String
  },
  card: {
    card_number: {
      type: String,
    },
    exp_month:{
      type: String,
    },
    exp_year:{
      type: String,
    },
    card_id:{
      type: String,

    }

  },
},
{
    timestamps: true
  }
);

const Booking = new mongoose.model('Booking', bookingSchema);
module.exports = Booking;