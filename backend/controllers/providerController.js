const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const ServiceCategory = require('../models/ServiceCategory');
const path = require('path');
const fs = require('fs');

// Get provider dashboard stats
exports.getDashboard = async (req, res) => {
  try {
  const providerId = req.user.id;

    const [services, bookings, totalEarnings] = await Promise.all([
      Service.countDocuments({ provider: providerId, isActive: true }),
      Booking.find({ providerId }),
      Booking.aggregate([
        { $match: { providerId: providerId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$actualCost' } } }
      ])
    ]);

    const activeBookings = bookings.filter(b => b.status === 'accepted' || b.status === 'in-progress').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;

    res.json({
      success: true,
      stats: {
        totalServices: services,
        activeBookings,
        completedBookings,
        totalEarnings: totalEarnings[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
};

// Create a new service
exports.createService = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      price,
      location,
      availability,
      tags
    } = req.body;

    const service = new Service({
      title,
      category,
      description,
      price,
      location,
      provider: req.user.id,
      availability: availability || {
        monday: { available: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
        thursday: { available: true, startTime: '09:00', endTime: '17:00' },
        friday: { available: true, startTime: '09:00', endTime: '17:00' },
        saturday: { available: true, startTime: '09:00', endTime: '17:00' },
        sunday: { available: false, startTime: '09:00', endTime: '17:00' }
      },
      tags: tags || []
    });

    await service.save();

    // Update ServiceCategory with provider ID if not already set
    await ServiceCategory.findOneAndUpdate(
      { serviceCategory: category, provider: { $exists: false } },
      { provider: req.user.id },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Failed to create service' });
  }
};

// Get provider's services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id })
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const updateData = req.body;

    const service = await Service.findOneAndUpdate(
      { _id: serviceId, provider: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findOneAndDelete({
      _id: serviceId,
      provider: req.user.id
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
};

// Get provider's bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.user.id })
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'title category price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

// Get booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      providerId: req.user.id
    })
      .populate('customerId', 'name email phone address')
      .populate('serviceId', 'title category description price');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booking details' });
  }
};

// Accept a booking
exports.acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, providerId: req.user.id, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or already processed' });
    }

    res.json({
      success: true,
      message: 'Booking accepted successfully',
      booking
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to accept booking' });
  }
};

// Reject a booking
exports.rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, providerId: req.user.id, status: 'pending' },
      { 
        status: 'cancelled',
        providerNotes: reason || 'Booking rejected by provider'
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or already processed' });
    }

    res.json({
      success: true,
      message: 'Booking rejected successfully',
      booking
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject booking' });
  }
};

// Complete a booking
exports.completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { actualCost, notes } = req.body;

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, providerId: req.user.id, status: 'accepted' },
      { 
        status: 'completed',
        actualCost: actualCost || booking.estimatedCost,
        providerNotes: notes,
        completedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not in accepted status' });
    }

    // Update service stats
    await Service.findByIdAndUpdate(booking.serviceId, {
      $inc: { totalBookings: 1, completedBookings: 1 }
    });

    res.json({
      success: true,
      message: 'Booking completed successfully',
      booking
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete booking' });
  }
};

// Get provider's chats
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name email phone')
      .populate('booking', 'bookingId status')
      .populate('service', 'title category')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chats' });
  }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'name email phone')
      .populate('messages.sender', 'name')
      .populate('messages.receiver', 'name')
      .populate('booking', 'bookingId status')
      .populate('service', 'title category');

    if (!chat || !chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Mark messages as read
    await chat.markAsRead(req.user.id);

    res.json({
      success: true,
      messages: chat.messages,
      provider: chat.participants.find(p => p._id.toString() !== req.user.id)
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chat messages' });
  }
};

// Send message in chat
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text' } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat || !chat.participants.some(p => p.toString() === req.user.id)) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const receiverId = chat.participants.find(p => p.toString() !== req.user.id);
    
    await chat.addMessage(req.user.id, receiverId, content, messageType);

    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// Get provider's reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.user.id })
      .populate('customer', 'name')
      .populate('booking', 'bookingId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

// Update provider availability
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const provider = await User.findByIdAndUpdate(
      req.user.id,
      { availability },
      { new: true }
    );

  res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: provider.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ success: false, message: 'Failed to update availability' });
  }
};

// Get provider profile
exports.getProviderProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    console.error('Get provider profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// Update provider profile
exports.updateProviderProfile = async (req, res) => {
  try {
    const { name, phone, address, city, bio } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, city, bio },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Update provider profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// Get provider complaints
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ provider: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    console.error('Get complaints error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
};

// Create a complaint
exports.createComplaint = async (req, res) => {
  console.log('--- Complaint API HIT ---');
  console.log('BODY:', req.body);
  console.log('FILE:', req.file);

  try {
    const { bookingId, description } = req.body;
    if (!bookingId || !description) {
      return res.status(400).json({ success: false, message: 'Booking ID and description are required' });
    }
    let attachments = [];
    if (req.file) {
      attachments.push({
        filename: req.file.filename,
        url: `/uploads/complaints/${req.file.filename}`,
        uploadedBy: req.user.id,
        uploadedAt: new Date()
      });
    }
    const complaint = new Complaint({
      provider: req.user.id,
      booking: bookingId,
      description,
      attachments,
      status: 'open'
    });
    await complaint.save();
    console.log('Complaint saved:', complaint);
    res.status(201).json({ success: true, message: 'Complaint submitted', complaint });
  } catch (err) {
    console.error('Create complaint error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to submit complaint' });
  }
};

// Fetch all service categories for providers
exports.getServiceCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch service categories.', error: error.message });
  }
};
