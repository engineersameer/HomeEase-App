const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Service = require('./models/Service');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/homeease';

async function migrateProviderId() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const bookings = await Booking.find({ providerId: { $exists: false } });
  console.log(`Found ${bookings.length} bookings to update.`);
  let updated = 0;
  for (const booking of bookings) {
    const service = await Service.findById(booking.serviceId);
    if (service && service.provider) {
      booking.providerId = service.provider;
      await booking.save();
      updated++;
      console.log(`Updated booking ${booking._id} with providerId ${service.provider}`);
    } else {
      console.log(`Service not found for booking ${booking._id}`);
    }
  }
  console.log(`Migration complete. Updated ${updated} bookings.`);
  await mongoose.disconnect();
}

migrateProviderId().catch(err => {
  console.error('Migration error:', err);
  mongoose.disconnect();
}); 