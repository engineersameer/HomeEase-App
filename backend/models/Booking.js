const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  date: Date,
  status: { type: String, enum: ['pending', 'accepted', 'completed'], default: 'pending' },
});

module.exports = mongoose.model('Booking', bookingSchema);
