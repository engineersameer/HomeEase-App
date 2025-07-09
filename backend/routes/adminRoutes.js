const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const Review = require('../models/Review');
const Content = require('../models/Content');
const Maintenance = require('../models/Maintenance');
const adminController = require('../controllers/adminController');
const Report = require('../models/Report');

// Admin middleware - check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== ADMIN DASHBOARD ====================

// Get admin dashboard
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    // Get platform stats
    const totalUsers = await User.countDocuments({ role: { $in: ['customer', 'provider'] } });
    const totalProviders = await User.countDocuments({ role: 'provider', approvalStatus: 'approved' });
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const activeServices = await Service.countDocuments({ isActive: true, isApproved: true });
    
    res.json({
      stats: {
        totalUsers,
        totalProviders,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingComplaints,
        activeServices
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const status = req.query.status;
    
    let query = {};
    if (role) query.role = role;
    if (status) {
      if (status === 'pending' && role === 'provider') {
        // For providers, check approvalStatus instead of status
        query.approvalStatus = 'pending';
      } else {
        query.status = status;
      }
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status
router.patch('/users/:userId/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'pending', 'suspended', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SERVICE PROVIDER MANAGEMENT ====================

// Get all providers
router.get('/providers', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    
    let query = { role: 'provider' };
    if (status) query.status = status;
    
    const providers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      providers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve provider
router.patch('/providers/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const provider = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'active',
        approvalStatus: 'approved',
        isApproved: true,
        approvedBy: req.user._id,
        approvalDate: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject provider
router.patch('/providers/:id/reject', auth, adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const provider = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        approvalStatus: 'rejected',
        isApproved: false,
        rejectionReason: reason,
        rejectedBy: req.user._id,
        rejectionDate: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending providers
router.get('/providers/pending', auth, adminAuth, async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider', approvalStatus: 'pending' }).select('-password');
    res.json({ providers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get provider documents
router.get('/providers/:providerId/documents', auth, adminAuth, async (req, res) => {
  try {
    const provider = await User.findById(req.params.providerId).select('verificationDocuments');
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json({ documents: provider.verificationDocuments });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== BOOKING MANAGEMENT ====================

// Get all bookings
router.get('/bookings', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    
    let query = {};
    if (status) query.status = status;
    
    const bookings = await Booking.find(query)
      .populate('customer provider service')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Booking.countDocuments(query);
    
    res.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== COMPLAINT MANAGEMENT ====================

// Get all complaints
router.get('/complaints', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    
    let query = {};
    if (status) query.status = status;
    
    const complaints = await Complaint.find(query)
      .populate('customer provider booking')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Complaint.countDocuments(query);
    
    res.json({
      complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint status
router.patch('/complaints/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        adminResponse,
        resolvedBy: req.user._id,
        resolvedAt: new Date()
      },
      { new: true }
    ).populate('customer provider booking');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== RATINGS & REVIEWS ====================

// Get all reviews
router.get('/ratings', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const reviews = await Review.find()
      .populate('customer provider booking service')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Review.countDocuments();
    
    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);
    
    res.json({
      reviews,
      averageRating: avgRating[0]?.average || 0,
      totalReviews: total,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SERVICE CATEGORIES ====================

// Get service categories
// router.get('/service-categories', auth, adminAuth, async (req, res) => {
//   try {
//     const categories = [
//       { id: 'electrical', name: 'Electrical', icon: '⚡' },
//       { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
//       { id: 'carpentry', name: 'Carpentry', icon: '🔨' },
//       { id: 'painting', name: 'Painting', icon: '🎨' },
//       { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
//       { id: 'ac_repair', name: 'AC Repair', icon: '❄️' },
//       { id: 'appliance_repair', name: 'Appliance Repair', icon: '🔌' },
//       { id: 'gardening', name: 'Gardening', icon: '🌱' },
//       { id: 'security', name: 'Security', icon: '🔒' },
//       { id: 'cooking', name: 'Cooking', icon: '👨‍🍳' },
//       { id: 'driving', name: 'Driving', icon: '🚗' },
//       { id: 'other', name: 'Other', icon: '📋' }
//     ];
//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Service Category CRUD
router.post('/service-categories', adminController.createServiceCategory);
router.get('/service-categories', adminController.getServiceCategories);
router.put('/service-categories/:id', adminController.updateServiceCategory);
router.delete('/service-categories/:id', adminController.deleteServiceCategory);

// ==================== REPORTS ====================

// Get all saved/generated reports
router.get('/reports', auth, adminAuth, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate and save a report
router.post('/reports', auth, adminAuth, adminController.generateReport);

// Export report
router.get('/reports/:reportId/export', auth, adminAuth, adminController.exportReport);

// ==================== CONTENT MANAGEMENT ====================

// Get all content
router.get('/content', auth, adminAuth, async (req, res) => {
  try {
    const content = await Content.find().sort({ createdAt: -1 });
    res.json({ content, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create content
router.post('/content', auth, adminAuth, async (req, res) => {
  try {
    console.log('Create content request body:', req.body);
    const content = new Content({
      ...req.body,
      createdBy: req.user._id
    });
    await content.save();
    console.log('Content created:', content._id);
    res.status(201).json(content);
  } catch (error) {
    console.log('Create content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update content
router.put('/content/:id', auth, adminAuth, async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true }
    );
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete content
router.delete('/content/:id', auth, adminAuth, async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== MAINTENANCE ====================

// Get all maintenance records
router.get('/maintenance', auth, adminAuth, async (req, res) => {
  try {
    const maintenance = await Maintenance.find().sort({ createdAt: -1 });
    res.json({ maintenance, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create maintenance
router.post('/maintenance', auth, adminAuth, adminController.createMaintenance);

// Analytics: bookings
router.get('/analytics/bookings', auth, adminAuth, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    res.json({ totalBookings, completedBookings, pendingBookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Provider ratings
router.get('/providers/ratings', auth, adminAuth, async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' }).select('name email rating reviewCount');
    res.json({ providers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Provider reviews
router.get('/providers/:providerId/reviews', auth, adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId }).populate('customer', 'name');
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 