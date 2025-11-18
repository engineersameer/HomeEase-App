const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const Review = require('../models/Review');
const Report = require('../models/Report');
const Content = require('../models/Content');
const Maintenance = require('../models/Maintenance');
const PDFDocument = require('pdfkit');
const ServiceCategory = require('../models/ServiceCategory');
const City = require('../models/City');

// Admin Profile Management
const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, notificationPreferences } = req.body;
    const adminId = req.user.id;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (notificationPreferences) updates.notificationPreferences = notificationPreferences;

    const updatedAdmin = await User.findByIdAndUpdate(
      adminId,
      updates,
      { new: true, select: '-password' }
    );

    res.json({
      message: 'Profile updated successfully',
      admin: updatedAdmin
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User Management
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    if (status === 'suspended' || status === 'rejected') {
      user.rejectionReason = reason;
      user.rejectedBy = adminId;
      user.rejectionDate = new Date();
    }

    await user.save();

    res.json({
      message: `User status updated to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Provider Management
const getPendingProviders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const providers = await User.find({
      role: 'provider',
      approvalStatus: 'pending'
    })
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({
      role: 'provider',
      approvalStatus: 'pending'
    });

    res.json({
      providers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalPending: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const approveProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { approved, reason } = req.body;
    const adminId = req.user.id;

    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (approved) {
      provider.approvalStatus = 'approved';
      provider.isApproved = true;
      provider.approvedBy = adminId;
      provider.approvalDate = new Date();
      provider.status = 'active';
    } else {
      provider.approvalStatus = 'rejected';
      provider.isApproved = false;
      provider.rejectionReason = reason;
      provider.rejectedBy = adminId;
      provider.rejectionDate = new Date();
      provider.status = 'rejected';
    }

    await provider.save();

    res.json({
      message: `Provider ${approved ? 'approved' : 'rejected'} successfully`,
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        approvalStatus: provider.approvalStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const verifyProviderDocuments = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { documentType, verified } = req.body;

    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (provider.verificationDocuments[documentType]) {
      provider.verificationDocuments[documentType].verified = verified;
      await provider.save();
    }

    res.json({
      message: `${documentType} verification status updated`,
      verificationStatus: provider.verificationDocuments[documentType]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Booking and Payment Monitoring
const getBookingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const bookings = await Booking.find({
      createdAt: { $gte: start, $lte: end }
    });

    // Calculate analytics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

    // Group bookings by date
    const bookingsByDate = {};
    bookings.forEach(booking => {
      const date = booking.createdAt.toISOString().split('T')[0];
      if (!bookingsByDate[date]) {
        bookingsByDate[date] = { bookings: 0, revenue: 0 };
      }
      bookingsByDate[date].bookings++;
      if (booking.status === 'completed') {
        bookingsByDate[date].revenue += booking.totalAmount || 0;
      }
    });

    res.json({
      summary: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        completionRate: Math.round(completionRate * 100) / 100,
        cancellationRate: Math.round(cancellationRate * 100) / 100
      },
      bookingsByDate,
      dateRange: { start, end }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complaint Management
const getAllComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, category } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('assignedTo', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalComplaints: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getComplaintDetails = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('adminNotes.admin', 'name')
      .populate('actions.admin', 'name')
      .populate('messages.sender', 'name role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const assignComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { assignedTo } = req.body;
    const adminId = req.user.id;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.assignedTo = assignedTo;
    complaint.status = 'in_progress';
    await complaint.addAdminNote(`Complaint assigned to admin`, adminId);

    await complaint.save();

    res.json({
      message: 'Complaint assigned successfully',
      complaint: {
        id: complaint._id,
        assignedTo: complaint.assignedTo,
        status: complaint.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resolveComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { resolution, refundAmount, penaltyAmount } = req.body;
    const adminId = req.user.id;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await complaint.resolve(resolution, adminId);

    if (refundAmount > 0) {
      await complaint.addAction('refund_issued', `Refund of $${refundAmount} issued`, adminId, refundAmount);
    }

    if (penaltyAmount > 0) {
      await complaint.addAction('penalty_imposed', `Penalty of $${penaltyAmount} imposed`, adminId, 0, penaltyAmount);
    }

    res.json({
      message: 'Complaint resolved successfully',
      complaint: {
        id: complaint._id,
        status: complaint.status,
        resolution: complaint.resolution
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Provider Ratings and Reviews
const getProviderRatings = async (req, res) => {
  try {
    const { page = 1, limit = 10, minRating, maxRating } = req.query;
    const skip = (page - 1) * limit;

    let query = { role: 'provider' };
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };
    if (maxRating) query.averageRating = { ...query.averageRating, $lte: parseFloat(maxRating) };

    const providers = await User.find(query)
      .select('name email averageRating totalReviews totalBookings')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ averageRating: -1 });

    const total = await User.countDocuments(query);

    res.json({
      providers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalProviders: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;
    const skip = (page - 1) * limit;

    let query = { provider: providerId };
    if (rating) query.rating = parseInt(rating);

    const reviews = await Review.find(query)
      .populate('customer', 'name')
      .populate('booking', 'serviceName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalReviews: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Review Response Moderation
const getPendingReviewResponses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const responses = await Review.find({ 
      providerResponse: { $exists: true, $ne: null },
      moderationStatus: 'pending' 
    })
      .populate('provider', 'name email')
      .populate('customer', 'name')
      .populate('service', 'title')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ responseDate: -1 });

    const total = await Review.countDocuments({ 
      providerResponse: { $exists: true, $ne: null },
      moderationStatus: 'pending' 
    });

    res.json({
      success: true,
      responses,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalResponses: total
      }
    });
  } catch (error) {
    console.error('Get pending review responses error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const moderateReviewResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (!review.providerResponse) {
      return res.status(400).json({ success: false, message: 'No response to moderate' });
    }

    if (action === 'approve') {
      review.moderationStatus = 'approved';
      review.isModerated = true;
    } else {
      review.moderationStatus = 'rejected';
      review.isModerated = true;
      if (rejectionReason) {
        review.rejectionReason = rejectionReason;
      }
    }

    review.moderatedBy = req.user.id;
    review.moderationDate = new Date();

    await review.save();

    res.json({
      success: true,
      message: `Response ${action}d successfully`,
      review
    });
  } catch (error) {
    console.error('Moderate review response error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAllReviewResponses = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { providerResponse: { $exists: true, $ne: null } };
    if (status) {
      query.moderationStatus = status;
    }

    const responses = await Review.find(query)
      .populate('provider', 'name email')
      .populate('customer', 'name')
      .populate('service', 'title')
      .populate('moderatedBy', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ responseDate: -1 });

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      responses,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalResponses: total
      }
    });
  } catch (error) {
    console.error('Get all review responses error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Reports Generation
const generateReport = async (req, res) => {
  try {
    const { title, type, description, groupBy } = req.body;
    // Platform overview summary
    const totalUsers = await User.countDocuments({ role: { $in: ['customer', 'provider'] } });
    const totalProviders = await User.countDocuments({ role: 'provider', approvalStatus: 'approved' });
    const totalBookings = await Booking.countDocuments();
    const totalRevenueAgg = await Booking.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const data = {
      platformOverview: {
        totalUsers,
        totalProviders,
        totalBookings,
        totalRevenue
      }
    };
    const report = new Report({
      title,
      type,
      description,
      groupBy,
      data
    });
    await report.save();
    res.json({
      message: 'Report generated successfully',
      report: {
        id: report._id,
        title: report.title,
        type: report.type,
        description: report.description,
        groupBy: report.groupBy,
        data: report.data,
        createdAt: report.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const exportReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { format = 'json' } = req.query;
    console.log('Exporting report:', reportId, 'format:', format);
    const report = await Report.findById(reportId);
    if (!report) {
      console.log('Report not found:', reportId);
      return res.status(404).json({ message: 'Report not found' });
    }
    if (format === 'pdf') {
      console.log('PDFKit streaming started for report:', reportId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '_')}_overview.pdf"`);
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      doc.pipe(res);
      doc.fontSize(20).text(report.title || 'Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Type: ${report.type || '-'}`);
      doc.fontSize(14).text(`Description: ${report.description || '-'}`);
      doc.fontSize(14).text(`Group By: ${report.groupBy || '-'}`);
      doc.moveDown();
      doc.fontSize(16).text('Platform Overview', { underline: true });
      doc.moveDown(0.5);
      const overview = report.data?.platformOverview;
      if (overview && Object.keys(overview).length > 0) {
        Object.entries(overview).forEach(([key, value]) => {
          doc.fontSize(13).text(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`);
          doc.moveDown(0.2);
        });
      } else {
        doc.fontSize(13).text('No platform overview data available.');
        doc.moveDown(1);
      }
      for (let i = 0; i < 15; i++) doc.moveDown(0.5);
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, 50, 780, { align: 'center' });
      doc.end();
      return;
    }
    let fileContent, mimeType, fileName;
    if (format === 'csv') {
      // Convert platform overview to CSV
      const overview = report.data?.platformOverview || {};
      const headers = Object.keys(overview).join(',');
      const values = Object.values(overview).join(',');
      fileContent = `${headers}\n${values}`;
      mimeType = 'text/csv';
      fileName = `${report.title.replace(/\s+/g, '_')}_overview.csv`;
    } else {
      // Default: JSON
      fileContent = JSON.stringify(report.data, null, 2);
      mimeType = 'application/json';
      fileName = `${report.title.replace(/\s+/g, '_')}_overview.json`;
    }
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', mimeType);
    res.send(fileContent);
  } catch (error) {
    console.log('Export error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Content Management
const createContent = async (req, res) => {
  try {
    const { title, type, content, excerpt, metaTitle, metaDescription, keywords, category, tags } = req.body;
    const adminId = req.user.id;

    const contentDoc = new Content({
      title,
      type,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      keywords,
      category,
      tags,
      createdBy: adminId
    });

    await contentDoc.save();

    res.json({
      message: 'Content created successfully',
      content: contentDoc
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const updates = req.body;
    const adminId = req.user.id;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Create new version if content is being updated
    if (updates.content && updates.content !== content.content) {
      await content.createVersion(updates.content, adminId);
    }

    Object.assign(content, updates);
    content.updatedBy = adminId;
    await content.save();

    res.json({
      message: 'Content updated successfully',
      content
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const publishContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const adminId = req.user.id;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    await content.publish(adminId);

    res.json({
      message: 'Content published successfully',
      content: {
        id: content._id,
        title: content.title,
        status: content.status,
        publishedAt: content.publishedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Maintenance Management
const createMaintenance = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      scheduledStart,
      scheduledEnd,
      impact,
      affectedServices,
      publicMessage,
      notifications
    } = req.body;
    const adminId = req.user.id;

    const maintenance = new Maintenance({
      title,
      description,
      type,
      scheduledStart,
      scheduledEnd,
      impact,
      affectedServices,
      publicMessage,
      notifications,
      createdBy: adminId
    });

    await maintenance.save();

    res.json({
      message: 'Maintenance scheduled successfully',
      maintenance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateMaintenance = async (req, res) => {
  try {
    const { maintenanceId } = req.params;
    const updates = req.body;
    const adminId = req.user.id;

    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance not found' });
    }

    Object.assign(maintenance, updates);
    await maintenance.save();

    res.json({
      message: 'Maintenance updated successfully',
      maintenance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const startMaintenance = async (req, res) => {
  try {
    const { maintenanceId } = req.params;

    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance not found' });
    }

    await maintenance.start();

    res.json({
      message: 'Maintenance started successfully',
      maintenance: {
        id: maintenance._id,
        status: maintenance.status,
        actualStart: maintenance.actualStart
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const completeMaintenance = async (req, res) => {
  try {
    const { maintenanceId } = req.params;

    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance not found' });
    }

    await maintenance.complete();

    res.json({
      message: 'Maintenance completed successfully',
      maintenance: {
        id: maintenance._id,
        status: maintenance.status,
        actualEnd: maintenance.actualEnd
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Service Category Management
const createServiceCategory = async (req, res) => {
  try {
    const { serviceName } = req.body;
    if (!serviceName) {
      return res.status(400).json({ success: false, message: 'Service name is required.' });
    }
    const existing = await ServiceCategory.findOne({ serviceName });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Service category with this name already exists.' });
    }
    const newCategory = new ServiceCategory({ serviceName });
    await newCategory.save();
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    console.error('Error in createServiceCategory:', error);
    res.status(500).json({ success: false, message: `Failed to create service category: ${error.message}`, error: error });
  }
};

const getServiceCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch service categories.', error: error.message });
  }
};

const updateServiceCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceName } = req.body;
    if (!serviceName) {
      return res.status(400).json({ success: false, message: 'Service name is required.' });
    }
    const updated = await ServiceCategory.findByIdAndUpdate(
      id,
      { serviceName },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Service category not found.' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update service category.', error: error.message });
  }
};

const deleteServiceCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ServiceCategory.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Service category not found.' });
    }
    res.status(200).json({ success: true, message: 'Service category deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete service category.', error: error.message });
  }
};

// City Management
const createCity = async (req, res) => {
  try {
    const { cityName } = req.body;
    if (!cityName || !cityName.trim()) {
      return res.status(400).json({ success: false, message: 'City name is required.' });
    }
    const existing = await City.findOne({ cityName: cityName.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'City already exists.' });
    }
    const city = new City({ cityName: cityName.trim() });
    await city.save();
    res.status(201).json({ success: true, data: city });
  } catch (error) {
    console.error('Error in createCity:', error);
    res.status(500).json({ success: false, message: `Failed to create city: ${error.message}` });
  }
};

const getCities = async (req, res) => {
  try {
    const cities = await City.find().sort({ cityName: 1 });
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch cities.', error: error.message });
  }
};

const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { cityName } = req.body;
    if (!cityName || !cityName.trim()) {
      return res.status(400).json({ success: false, message: 'City name is required.' });
    }
    const existing = await City.findOne({ cityName: cityName.trim(), _id: { $ne: id } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'City with this name already exists.' });
    }
    const updated = await City.findByIdAndUpdate(id, { cityName: cityName.trim() }, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update city.', error: error.message });
  }
};

const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await City.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }
    res.status(200).json({ success: true, message: 'City deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete city.', error: error.message });
  }
};

module.exports = {
  // Profile Management
  updateAdminProfile,
  
  // User Management
  getAllUsers,
  updateUserStatus,
  
  // Provider Management
  getPendingProviders,
  approveProvider,
  verifyProviderDocuments,
  
  // Booking Analytics
  getBookingAnalytics,
  
  // Complaint Management
  getAllComplaints,
  getComplaintDetails,
  assignComplaint,
  resolveComplaint,
  
  // Provider Ratings
  getProviderRatings,
  getProviderReviews,
  
  // Review Response Moderation
  getPendingReviewResponses,
  moderateReviewResponse,
  getAllReviewResponses,
  
  // Reports
  generateReport,
  exportReport,
  
  // Content Management
  createContent,
  updateContent,
  publishContent,
  
  // Maintenance Management
  createMaintenance,
  updateMaintenance,
  startMaintenance,
  completeMaintenance,

  // Service Category Management
  createServiceCategory,
  getServiceCategories,
  updateServiceCategory,
  deleteServiceCategory,

  // City Management
  createCity,
  getCities,
  updateCity,
  deleteCity
}; 