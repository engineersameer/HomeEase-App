const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'provider'], required: true },

  // Provider fields (optional for customer)
  profession: String,
  experience: String,
  city: String,
  pricing: String,

  address: { type: String },
});

module.exports = mongoose.model('User', userSchema);
