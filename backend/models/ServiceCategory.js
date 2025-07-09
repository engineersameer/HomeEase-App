const mongoose = require('mongoose');

const ServiceCategorySchema = new mongoose.Schema({
  serviceCategory: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceCategory', ServiceCategorySchema); 