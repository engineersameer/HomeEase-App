const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic fields (required for all users)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'provider'], required: true },

  // Customer fields
  address: { type: String },
  phone: { type: String },
  city: { type: String },

  // Provider fields
  profession: { type: String },
  experience: { type: Number }, // In years
  pricing: { type: Number }, // Per hour/per job
  certifications: { type: String },
  cnic: { type: String }, // For identity verification
  availability: { type: String }, // e.g., "9am to 6pm, Mon-Sat"
  bio: { type: String }, // Brief about skills and experience
  profileImage: { type: String }, // URL to profile image (optional)

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
