const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Dashboard
router.get('/dashboard', providerController.getDashboard);

// Service management
router.post('/services', providerController.createService);
router.get('/services', providerController.getServices);
router.put('/services/:serviceId', providerController.updateService);
router.delete('/services/:serviceId', providerController.deleteService);

// Service categories
router.get('/service-categories', providerController.getServiceCategories);

// Booking management
router.get('/bookings', providerController.getBookings);
router.get('/bookings/:bookingId', providerController.getBookingDetails);
router.put('/bookings/:bookingId/accept', providerController.acceptBooking);
router.put('/bookings/:bookingId/reject', providerController.rejectBooking);
router.put('/bookings/:bookingId/complete', providerController.completeBooking);

// Chat functionality
router.get('/chats', providerController.getChats);
router.get('/chats/:chatId/messages', providerController.getChatMessages);
router.post('/chats/:chatId/messages', providerController.sendMessage);

// Reviews
router.get('/reviews', providerController.getReviews);

// Availability
router.put('/availability', providerController.updateAvailability);

// Profile
router.get('/profile', providerController.getProviderProfile);
router.put('/profile', providerController.updateProviderProfile);

// Complaints
router.get('/complaints', providerController.getComplaints);
router.post('/complaints', providerController.createComplaint);

module.exports = router;
