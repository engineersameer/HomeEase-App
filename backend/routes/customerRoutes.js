const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getCustomerDashboard,
  getCustomerProfile,
  updateCustomerProfile,
  searchServices,
  bookService,
  getCustomerBookings,
  getBookingById,
  updateBookingStatus,
  submitReview,
  getCustomerReviews,
  getServiceHistory,
  makePayment,
  getCustomerStats,
  getCustomerNotifications
} = require('../controllers/customerController');

// Dashboard
router.get('/dashboard', auth, getCustomerDashboard);

// Profile management
router.get('/profile', auth, getCustomerProfile);
router.put('/profile', auth, updateCustomerProfile);

// Service search
router.get('/search', auth, searchServices);

// Booking management
router.post('/book', auth, bookService);
router.get('/bookings', auth, getCustomerBookings);
router.get('/bookings/:bookingId', auth, getBookingById);
router.put('/bookings/:bookingId/status', auth, updateBookingStatus);

// Reviews and ratings
router.post('/reviews', auth, submitReview);
router.get('/reviews', auth, getCustomerReviews);

// Service history
router.get('/history', auth, getServiceHistory);

// Payment
router.post('/payment', auth, makePayment);

// Stats
router.get('/stats', auth, getCustomerStats);

// Notifications
router.get('/notifications', auth, getCustomerNotifications);

module.exports = router;
