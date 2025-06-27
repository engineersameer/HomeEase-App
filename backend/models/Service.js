const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  category: String,
  description: String,
  city: String,
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Service', serviceSchema);
