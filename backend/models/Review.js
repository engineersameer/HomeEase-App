const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  // Optionally, you can keep rating if needed
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Index for efficient querying by service
reviewSchema.index({ service: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema); 