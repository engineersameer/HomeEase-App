const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  
  // Role and Status
  role: { 
    type: String, 
    enum: ['customer', 'provider', 'admin'], 
    default: 'customer' 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending', 'suspended', 'rejected'], 
    default: 'active' 
  },
  
  // Admin Specific Fields
  adminPermissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageProviders: { type: Boolean, default: false },
    canManageBookings: { type: Boolean, default: false },
    canManageComplaints: { type: Boolean, default: false },
    canGenerateReports: { type: Boolean, default: false },
    canManageContent: { type: Boolean, default: false },
    canManageSystem: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false }
  },
  
  // Provider Specific Fields
  isApproved: { type: Boolean, default: false },
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate: { type: Date },
  rejectionReason: { type: String },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionDate: { type: Date },
  
  // Provider Ratings and Reviews
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  
  // Provider Availability
  availability: {
    monday: { available: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } },
    tuesday: { available: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } },
    wednesday: { available: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } },
    thursday: { available: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } },
    friday: { available: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } },
    saturday: { available: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } },
    sunday: { available: { type: Boolean, default: false }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '17:00' } }
  },
  
  // Verification Documents (for providers)
  verificationDocuments: {
    idCard: { url: String, verified: { type: Boolean, default: false } },
    license: { url: String, verified: { type: Boolean, default: false } },
    insurance: { url: String, verified: { type: Boolean, default: false } },
    backgroundCheck: { url: String, verified: { type: Boolean, default: false } }
  },
  
  // Profile Information
  address: { type: String },
  city: { type: String },
  bio: { type: String },
  profileImage: { type: String },
  
  // Statistics
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  
  // Notification Preferences
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false }
  },
  
  // Account Security
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

module.exports = mongoose.model('User', userSchema);
