const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  evidenceUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['neutral', 'sent', 'under_action', 'resolved'],
    default: 'neutral'
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

// Generate unique complaintId and update updatedAt
complaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (!this.complaintId) {
    this.complaintId = 'COMP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema); 