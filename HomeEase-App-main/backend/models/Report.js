const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['booking_analytics', 'revenue_analytics', 'user_growth', 'provider_performance', 'complaint_analytics', 'custom'],
    required: true 
  },
  description: { type: String },
  groupBy: { type: String, enum: ['day', 'week', 'month', 'quarter', 'year'] },
  data: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

reportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Report', reportSchema); 