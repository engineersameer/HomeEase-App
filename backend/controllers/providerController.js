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

exports.getAvailableServices = async (req, res) => {
  // For now, return mock data
  const services = [
    { _id: 'svc1', category: 'Cleaning', description: 'Home and office cleaning services' },
    { _id: 'svc2', category: 'Repairs', description: 'General repair and handyman services' },
    { _id: 'svc3', category: 'Painting', description: 'Interior and exterior painting' },
    { _id: 'svc4', category: 'Gardening', description: 'Lawn and garden maintenance' },
    { _id: 'svc5', category: 'Electrical', description: 'Electrical installation and repair' },
    { _id: 'svc6', category: 'Moving', description: 'Moving and relocation services' },
  ];
  res.json(services);
};
