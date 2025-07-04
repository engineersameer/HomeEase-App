const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Review = require('../models/Review');

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
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
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
    const { 
      category, 
      location, 
      minRating, 
      maxPrice, 
      minPrice = 0,
      availableOnly = false 
    } = req.query;

    let query = {};

    // Category filter
    if (category && category !== 'All') {
      query.profession = category;
    }

    // Location filter
    if (location && location !== 'All') {
      query.city = location;
    }

    // Price filter
    if (maxPrice) {
      query.pricing = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Availability filter
    if (availableOnly === 'true') {
      query.availability = { $ne: null };
    }

    const providers = await User.find({ 
      ...query, 
      role: 'provider' 
    }).select('-password');

    // Add rating and review count to providers
    const providersWithStats = await Promise.all(
      providers.map(async (provider) => {
        const reviews = await Review.find({ provider: provider._id });
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        return {
          ...provider.toObject(),
          rating: avgRating,
          reviewCount: reviews.length
        };
      })
    );

    res.json(providersWithStats);
  } catch (err) {
    console.error('Search services error:', err);
    res.status(500).json({ message: 'Failed to search services' });
  }
};

// Book a service
exports.bookService = async (req, res) => {
  try {
    const { providerId, serviceId, date, time, description, estimatedCost } = req.body;
    const customerId = req.user.id;

    // Validate required fields
    if (!providerId || !date || !time || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if provider exists and is available
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Create booking
    const booking = new Booking({
      customer: customerId,
      provider: providerId,
      service: serviceId,
      date: new Date(`${date} ${time}`),
      description,
      estimatedCost,
      status: 'pending'
    });

    await booking.save();

    // Populate booking with provider and service details
    await booking.populate('provider service');

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (err) {
    console.error('Book service error:', err);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

// Get customer bookings
exports.getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { status } = req.query;

    let query = { customer: customerId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('provider service')
      .sort({ date: -1 });

    res.json(bookings);
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const customerId = req.user.id;

    const booking = await Booking.findOne({ 
      _id: bookingId, 
      customer: customerId 
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

// Submit review and rating
exports.submitReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user.id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if booking exists and belongs to customer
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      customer: customerId,
      status: 'completed'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not completed' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ 
      booking: bookingId,
      customer: customerId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already submitted for this booking' });
    }

    // Create review
    const review = new Review({
      booking: bookingId,
      customer: customerId,
      provider: booking.provider,
      rating,
      comment
    });

    await review.save();

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ message: 'Failed to submit review' });
  }
};

// Get customer reviews
exports.getCustomerReviews = async (req, res) => {
  try {
    const customerId = req.user.id;

    const reviews = await Review.find({ customer: customerId })
      .populate('provider booking')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Get service history
exports.getServiceHistory = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { serviceType, startDate, endDate } = req.query;

    let query = { 
      customer: customerId, 
      status: 'completed' 
    };

    // Filter by service type
    if (serviceType) {
      query['service.category'] = serviceType;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query)
      .populate('provider service')
      .sort({ date: -1 });

    res.json(bookings);
  } catch (err) {
    console.error('Get service history error:', err);
    res.status(500).json({ message: 'Failed to fetch service history' });
  }
};

// Make payment (simplified - in real app, integrate with payment gateway)
exports.makePayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, amount } = req.body;
    const customerId = req.user.id;

    const booking = await Booking.findOne({ 
      _id: bookingId, 
      customer: customerId 
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // In a real app, you would integrate with a payment gateway here
    // For now, we'll just update the booking status
    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod;
    booking.amount = amount;
    await booking.save();

    res.json({
      message: 'Payment processed successfully',
      booking
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ message: 'Failed to process payment' });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const customerId = req.user.id;

    const booking = await Booking.findOne({ 
      _id: bookingId, 
      customer: customerId 
    }).populate('provider service');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    console.error('Get booking error:', err);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
};

// Get customer stats
exports.getCustomerStats = async (req, res) => {
  try {
    const customerId = req.user.id;

    const totalBookings = await Booking.countDocuments({ customer: customerId });
    const activeBookings = await Booking.countDocuments({ 
      customer: customerId, 
      status: { $in: ['pending', 'accepted', 'in-progress'] }
    });
    const completedBookings = await Booking.countDocuments({ 
      customer: customerId, 
      status: 'completed' 
    });

    // Calculate total spent
    const completedBookingsData = await Booking.find({ 
      customer: customerId, 
      status: 'completed' 
    });
    const totalSpent = completedBookingsData.reduce((sum, booking) => 
      sum + (booking.estimatedCost || 0), 0
    );

    res.json({
      totalBookings,
      activeBookings,
      completedBookings,
      totalSpent
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
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
