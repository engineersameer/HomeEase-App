const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Apply auth middleware to all routes
router.use(auth);

// Set up multer storage for complaints
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/complaints'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Dashboard
router.get('/dashboard', providerController.getDashboard);

// Service management
router.post('/services', providerController.createService);
router.get('/services', providerController.getServices);
router.put('/services/:serviceId', providerController.updateService);
router.delete('/services/:serviceId', providerController.deleteService);

// Service categories
router.get('/service-categories', providerController.getServiceCategories);

// Cities
router.get('/cities', providerController.getCities);

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
router.post('/reviews/:reviewId/response', providerController.addReviewResponse);

// Availability
router.put('/availability', providerController.updateAvailability);

// Profile
router.get('/profile', providerController.getProviderProfile);
router.put('/profile', providerController.updateProviderProfile);

// Complaints
router.get('/complaints', providerController.getComplaints);
router.post('/complaints', upload.single('evidence'), providerController.createComplaint);

module.exports = router;
