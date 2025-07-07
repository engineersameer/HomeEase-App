const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
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
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isHelpful: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportedReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
reviewSchema.index({ provider: 1, createdAt: -1 });
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ customer: 1, provider: 1 });

// Prevent multiple reviews for same booking
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingReview = await this.constructor.findOne({ booking: this.booking });
    if (existingReview) {
      throw new Error('Review already exists for this booking');
    }
  }
  next();
});

// Update provider rating when review is saved
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const reviews = await Review.find({ provider: this.provider });
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  await mongoose.model('User').findByIdAndUpdate(this.provider, {
    rating: averageRating,
    reviewCount: reviews.length
  });
});

module.exports = mongoose.model('Review', reviewSchema); 