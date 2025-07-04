const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  service: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service'
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile-wallet'],
    default: 'cash'
  },
  providerNotes: {
    type: String
  },
  customerNotes: {
    type: String
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
