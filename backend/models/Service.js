const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  available: { type: Boolean, default: true },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' }
});

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    // enum removed to allow dynamic categories
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availability: {
    monday: availabilitySchema,
    tuesday: availabilitySchema,
    wednesday: availabilitySchema,
    thursday: availabilitySchema,
    friday: availabilitySchema,
    saturday: availabilitySchema,
    sunday: availabilitySchema
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  completedBookings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
serviceSchema.index({ title: 'text', description: 'text', category: 'text', location: 'text' });

// Virtual for average rating
serviceSchema.virtual('averageRating').get(function() {
  return this.reviewCount > 0 ? this.rating / this.reviewCount : 0;
});

// Virtual for reviews
serviceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service',
});

serviceSchema.set('toObject', { virtuals: true });
serviceSchema.set('toJSON', { virtuals: true });

// Method to update rating
serviceSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating * this.reviewCount) + newRating;
  this.reviewCount += 1;
  this.rating = totalRating / this.reviewCount;
  return this.save();
};

module.exports = mongoose.model('Service', serviceSchema);
