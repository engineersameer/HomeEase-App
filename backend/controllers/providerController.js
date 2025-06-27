const Booking = require('../models/Booking');

exports.getProviderDashboard = async (req, res) => {
  const providerId = req.user.id;

  const bookings = await Booking.find({ provider: providerId })
    .populate('customer service')
    .sort({ date: -1 });

  const totalEarnings = await Booking.aggregate([
    { $match: { provider: providerId, status: 'completed' } },
    { $group: { _id: null, total: { $sum: 1000 } } }, // pricing can be dynamic
  ]);

  res.json({
    bookings,
    earnings: totalEarnings[0]?.total || 0,
  });
};
