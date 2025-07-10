const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Maintenance = require('./models/Maintenance');
const db = require('./config/db');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/homeease';

async function seedAdmin() {
  const adminEmail = 'admin@homeease.com';
  const adminPassword = 'admin123'; // Change after first login!

  console.log('Checking for existing admin user...');
  const existing = await User.findOne({ email: adminEmail, role: 'admin' });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    return;
  }
  console.log('No existing admin found. Creating new admin...');
  const admin = new User({
    name: 'Super Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    status: 'active',
    adminPermissions: {
      canManageUsers: true,
      canManageProviders: true,
      canManageBookings: true,
      canManageComplaints: true,
      canGenerateReports: true,
      canManageContent: true,
      canManageSystem: true,
      isSuperAdmin: true
    }
  });
  try {
    console.log('Saving new admin user...');
    await admin.save();
    console.log('Admin user created:', admin.email);
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
}

async function seedMaintenance() {
  try {
    // Find an admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Please seed an admin user first.');
      process.exit(1);
    }
    const maintenance = new Maintenance({
      title: 'Seeded Maintenance',
      description: 'This is a seeded maintenance record.',
      type: 'scheduled',
      status: 'pending',
      createdBy: admin._id
    });
    await maintenance.save();
    console.log('Seeded maintenance created:', maintenance);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding maintenance:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await seedAdmin();
    await seedMaintenance();
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.disconnect();
  }
}

main(); 