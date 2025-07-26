const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Service search and discovery
router.get('/services/search', customerController.searchServices);
router.get('/services/categories', customerController.getCategories);
router.get('/services/cities', customerController.getCities);
router.get('/services/:serviceId', customerController.getServiceDetails);

// Booking management
router.post('/bookings', customerController.createBooking);
router.get('/bookings', customerController.getBookings);
router.get('/bookings/:bookingId', customerController.getBookingDetails);
router.put('/bookings/:bookingId/cancel', customerController.cancelBooking);
router.delete('/bookings/:bookingId', customerController.deleteBooking);

// Chat functionality
router.get('/chats', customerController.getChats);
router.get('/chats/:chatId/messages', customerController.getChatMessages);
router.post('/chats/:chatId/messages', customerController.sendMessage);
router.post('/chats', customerController.findOrCreateChat);

// Reviews
router.post('/reviews', customerController.createReview);

// Stats
router.get('/stats', customerController.getStats);

// Notifications
router.get('/notifications', customerController.getNotifications);
router.put('/notifications/:notificationId/read', customerController.readNotification);

// Profile
router.get('/profile', customerController.getCustomerProfile);
router.put('/profile', customerController.updateCustomerProfile);

// Support
router.post('/support', customerController.submitSupportRequest);

module.exports = router;
