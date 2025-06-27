const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

exports.getCustomerDashboard = async (req, res) => {
  const customerId = req.user.id;

  const bookings = await Booking.find({ customer: customerId })
    .populate('service provider')
    .sort({ date: -1 });

  const services = await Service.find();

  res.json({ bookings, services });
};

exports.getCustomerProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({ name: user.name, email: user.email, address: user.address || '' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

exports.updateCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address } = req.body;
    // Only allow updating name and address
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, address },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ name: updatedUser.name, email: updatedUser.email, address: updatedUser.address || '' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};
