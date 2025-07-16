const mongoose = require('mongoose');

const providerServiceSchema = new mongoose.Schema({
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categoryName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProviderService', providerServiceSchema); 