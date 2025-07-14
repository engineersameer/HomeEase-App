const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  // Basic Information
  title: { type: String },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['service_quality', 'payment_issue', 'provider_behavior', 'booking_cancellation', 'safety_concern', 'other'],
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  
  // Parties Involved
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // required: false
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  booking: { type: mongoose.Schema.Types.Mixed }, // Allow string or ObjectId
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  
  // Status and Resolution
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed', 'escalated'], 
    default: 'open' 
  },
  resolution: { type: String },
  resolutionDate: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Admin Management
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: [{
    note: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Actions Taken
  actions: [{
    action: { type: String, required: true },
    description: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    refundAmount: { type: Number },
    penaltyAmount: { type: Number }
  }],
  
  // Evidence and Attachments
  attachments: [{
    filename: { type: String, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Communication
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isInternal: { type: Boolean, default: false } // For admin-only notes
  }],
  
  // Escalation
  escalatedTo: { type: String },
  escalationReason: { type: String },
  escalationDate: { type: Date },
  
  // Add these fields as optional
  category: { type: String }, // required: false
  title: { type: String }, // required: false
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  closedAt: { type: Date }
});

// Update the updatedAt field before saving
complaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for complaint age
complaintSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for isOverdue (complaints open for more than 48 hours)
complaintSchema.virtual('isOverdue').get(function() {
  if (this.status === 'open' || this.status === 'in_progress') {
    return Date.now() - this.createdAt > 48 * 60 * 60 * 1000; // 48 hours
  }
  return false;
});

// Method to add admin note
complaintSchema.methods.addAdminNote = function(note, adminId) {
  this.adminNotes.push({
    note,
    admin: adminId,
    timestamp: new Date()
  });
  return this.save();
};

// Method to add action
complaintSchema.methods.addAction = function(action, description, adminId, refundAmount = 0, penaltyAmount = 0) {
  this.actions.push({
    action,
    description,
    admin: adminId,
    timestamp: new Date(),
    refundAmount,
    penaltyAmount
  });
  return this.save();
};

// Method to add message
complaintSchema.methods.addMessage = function(senderId, message, isInternal = false) {
  this.messages.push({
    sender: senderId,
    message,
    timestamp: new Date(),
    isInternal
  });
  return this.save();
};

// Method to resolve complaint
complaintSchema.methods.resolve = function(resolution, adminId) {
  this.status = 'resolved';
  this.resolution = resolution;
  this.resolutionDate = new Date();
  this.resolvedBy = adminId;
  this.closedAt = new Date();
  return this.save();
};

// Method to escalate complaint
complaintSchema.methods.escalate = function(escalatedTo, reason) {
  this.status = 'escalated';
  this.escalatedTo = escalatedTo;
  this.escalationReason = reason;
  this.escalationDate = new Date();
  return this.save();
};

module.exports = mongoose.model('Complaint', complaintSchema); 