const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: false,
    unique: true
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  customerContact: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  preferredTime: {
    type: String,
    required: true
  },
  specialNote: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service',
    required: true
  },
  status: { 
    type: String, 
    enum: ['neutral', 'pending', 'accepted', 'in-progress', 'completed', 'cancelled'], 
    default: 'neutral' 
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
  // Generate unique bookingId if not set
  if (!this.bookingId) {
    this.bookingId = 'BOOK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

// Add schema-level error handler for validation
bookingSchema.post('save', function(error, doc, next) {
  if (error.name === 'ValidationError') {
    console.error('[Booking Model] Validation error:', error.message);
    next(new Error('Booking validation failed: ' + error.message));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
