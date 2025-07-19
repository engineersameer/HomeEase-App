const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Review = require('../models/Review');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');
const SupportRequest = require('../models/SupportRequest');
const ServiceCategory = require('../models/ServiceCategory');
const City = require('../models/City');

// Get customer dashboard
exports.getCustomerDashboard = async (req, res) => {
  try {
    const customerId = req.user.id;

    const bookings = await Booking.find({ customer: customerId })
      .populate('service provider')
      .sort({ date: -1 })
      .limit(5);

    const services = await Service.find().limit(8);

    // Get customer stats
    const totalBookings = await Booking.countDocuments({ customer: customerId });
    const completedBookings = await Booking.countDocuments({ 
      customer: customerId, 
      status: 'completed' 
    });

    res.json({ 
      bookings, 
      services,
      stats: {
        totalBookings,
        completedBookings,
        pendingBookings: totalBookings - completedBookings
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard' });
  }
};

// Get customer profile
exports.getCustomerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Get customer profile error:', err);
    res.status(500).json({ success: false, message: 'Error fetching profile', error: err.message });
  }
};

// Update customer profile
exports.updateCustomerProfile = async (req, res) => {
  try {
    const { name, address, phone, city } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, address, phone, city },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Search for services
exports.searchServices = async (req, res) => {
  try {
    console.log('Full request URL:', req.originalUrl);
    console.log('req.query:', req.query);
    const filters = { isActive: true };
    if (req.query.category && req.query.category !== 'All') {
      filters.category = { $regex: `^${req.query.category.trim()}$`, $options: 'i' };
    }
    if (req.query.city && req.query.city !== 'All') {
      filters.city = { $regex: `^${req.query.city.trim()}$`, $options: 'i' };
    }
    console.log('Received filters:', req.query);
    console.log('MongoDB filters:', filters);
    const services = await Service.find(filters);
    console.log('Returned services:', services.map(s => ({ category: s.category, city: s.city })));
    res.status(200).json({ success: true, services });
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({ success: false, message: 'Failed to search services' });
  }
};

// Get service details
exports.getServiceDetails = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId)
      .populate('provider', 'name email phone rating reviewCount address')
      .populate({
        path: 'reviews',
        // No nested populate for customer, as Review model is simplified
      });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Get service details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service details' });
  }
};

// Get service categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      categories: categories.map(cat => cat.serviceName)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// Get cities for customer
exports.getCities = async (req, res) => {
  try {
    const cities = await City.find().sort({ cityName: 1 });
    res.json({
      success: true,
      cities: cities.map(city => city.cityName)
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
};

// Create a booking
exports.createBooking = async (req, res) => {
  try {
    console.log('--- [Booking] Incoming request ---');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    const {
      serviceId,
      customerContact,
      email,
      bookingDate,
      preferredTime,
      specialNote,
      location
    } = req.body;

    // Log all received fields
    console.log('[Booking] Received fields:', {
      serviceId,
      customerContact,
      email,
      bookingDate,
      preferredTime,
      specialNote,
      location
    });

    // Validate required fields
    let missingFields = [];
    if (!serviceId) missingFields.push('serviceId');
    if (!customerContact) missingFields.push('customerContact');
    if (!email) missingFields.push('email');
    if (!bookingDate) missingFields.push('bookingDate');
    if (!preferredTime) missingFields.push('preferredTime');
    if (!location) missingFields.push('location');
    if (missingFields.length > 0) {
      console.log('[Booking] Validation failed. Missing fields:', missingFields);
      return res.status(400).json({ success: false, message: 'Missing required fields', missingFields });
    }

    // Validate service exists and is active
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      console.log('[Booking] Service not available:', serviceId);
      return res.status(404).json({ success: false, message: 'Service not available' });
    }

    // Prevent duplicate booking for the same customer and service
    const existingBooking = await Booking.findOne({ customerId: req.user.id, serviceId });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You have already booked this service.' });
    }

    // Create booking with status 'neutral'
    console.log('[Booking] Creating booking document...');
    const booking = new Booking({
      customerId: req.user.id,
      customerContact,
      email,
      bookingDate: new Date(bookingDate),
      preferredTime,
      specialNote,
      location,
      serviceId,
      status: 'neutral'
    });

    try {
      const savedBooking = await booking.save();
      // After confirmation, update status to 'pending'
      savedBooking.status = 'pending';
      await savedBooking.save();
      console.log('[Booking] Booking saved successfully:', savedBooking._id);
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: savedBooking
      });
    } catch (err) {
      console.error('[Booking] Booking save failed:', err);
      return res.status(500).json({ success: false, message: 'Failed to save booking', error: err.message });
    }
  } catch (error) {
    console.error('[Booking] Create booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
  }
};

// Get customer's bookings
exports.getBookings = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    let query = { customerId: req.user.id };
    if (status && status !== 'all') {
      if (status === 'in-progress') {
        query.status = { $in: ['in-progress', 'inProgress'] };
      } else {
        query.status = status;
      }
    }
    const skip = (page - 1) * limit;
    const bookings = await Booking.find(query)
      .populate({
        path: 'serviceId',
        select: 'title category price provider',
        populate: { path: 'provider', select: 'name email phone profileImage image' }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    const total = await Booking.countDocuments(query);
    res.json({
      success: true,
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + bookings.length < total
      }
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
      customerId: req.user.id
    })
      .populate('providerId', 'name email phone address')
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

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, customerId: req.user.id, status: 'pending' },
      { 
        status: 'cancelled',
        customerNotes: reason || 'Cancelled by customer'
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or cannot be cancelled' });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
};

// Delete a booking (customer can cancel/delete their own booking)
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    // Only allow deletion if the booking belongs to the logged-in customer
    const booking = await Booking.findOne({ _id: bookingId, customerId: req.user.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not authorized.' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }
    await Booking.deleteOne({ _id: bookingId });
    res.json({ success: true, message: 'Booking cancelled and deleted successfully.' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
};

// Get customer's chats
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
      customer: chat.participants.find(p => p._id.toString() !== req.user.id)
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

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { serviceId, rating, reviewText } = req.body;

    // Validate service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Create review
    const review = new Review({
      service: serviceId,
      rating,
      reviewText
    });

    await review.save();

    // Optionally update service rating if needed
    if (service && rating) {
      await service.updateRating(rating);
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
};

// Stats
exports.getStats = async (req, res) => {
  try {
    const customerId = req.user.id;
    const totalBookings = await Booking.countDocuments({ customerId });
    const completedBookings = await Booking.countDocuments({ customerId, status: 'completed' });
    const activeBookings = await Booking.countDocuments({ customerId, status: { $in: ['pending', 'accepted', 'in-progress'] } });
    const totalSpentAgg = await Booking.aggregate([
      { $match: { customerId: req.user.id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$actualCost' } } }
    ]);
    const totalSpent = totalSpentAgg[0]?.total || 0;
    res.json({
      success: true,
      totalBookings,
      activeBookings,
      completedBookings,
      totalSpent
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

// Get customer notifications
exports.getCustomerNotifications = async (req, res) => {
  try {
    const customerId = req.user.id;

    // For now, return mock notifications
    // In a real app, you'd have a notifications collection
    const notifications = [
      {
        _id: '1',
        type: 'booking_update',
        title: 'Booking Accepted',
        message: 'Your electrical service booking has been accepted by Ahmed Electrician',
        timestamp: new Date(),
        read: false,
        bookingId: '1'
      },
      {
        _id: '2',
        type: 'payment_success',
        title: 'Payment Successful',
        message: 'Payment of PKR 800 has been processed successfully',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
        bookingId: '1'
      },
      {
        _id: '3',
        type: 'service_completed',
        title: 'Service Completed',
        message: 'Your plumbing service has been completed. Please leave a review!',
        timestamp: new Date(Date.now() - 86400000),
        read: false,
        bookingId: '2'
      }
    ];

    res.json(notifications);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// ========== Notifications ========== //
// Get all notifications for the customer
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// Mark a notification as read
exports.readNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification });
  } catch (err) {
    console.error('Read notification error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
};

// ========== Support ========== //
// Submit a support request
exports.submitSupportRequest = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }
    const support = new SupportRequest({
      user: req.user.id,
      subject,
      message,
      status: 'open'
    });
    await support.save();
    res.status(201).json({ success: true, message: 'Support request submitted', support });
  } catch (err) {
    console.error('Submit support request error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit support request' });
  }
};
