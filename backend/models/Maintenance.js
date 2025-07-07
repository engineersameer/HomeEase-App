const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  // Maintenance Information
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['scheduled', 'emergency', 'update', 'backup', 'security', 'routine'],
    required: true 
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'delayed'],
    default: 'pending' 
  },
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
maintenanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Maintenance', maintenanceSchema); 