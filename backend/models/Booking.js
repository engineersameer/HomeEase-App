const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  providerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  serviceId: { 
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
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  }
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Generate unique bookingId if not set
  if (!this.bookingId) {
    this.bookingId = 'BOOK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
