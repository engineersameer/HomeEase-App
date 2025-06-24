const Booking = require('../models/Booking');
const Service = require('../models/Service');

exports.getCustomerDashboard = async (req, res) => {
  const customerId = req.user.id;

  const bookings = await Booking.find({ customer: customerId })
    .populate('service provider')
    .sort({ date: -1 });

  const services = await Service.find();

  res.json({ bookings, services });
};
