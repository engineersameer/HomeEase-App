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

async function seedCustomer() {
  const customerEmail = 'customer@homeease.com';
  const customerPassword = 'customer123';

  console.log('Checking for existing customer user...');
  const existing = await User.findOne({ email: customerEmail, role: 'customer' });
  if (existing) {
    console.log('Customer user already exists:', existing.email);
    return;
  }
  console.log('No existing customer found. Creating new customer...');
  const customer = new User({
    name: 'Test Customer',
    email: customerEmail,
    password: customerPassword,
    role: 'customer',
    status: 'active',
    phone: '1234567890',
    address: '123 Main St',
    city: 'Test City',
  });
  try {
    console.log('Saving new customer user...');
    await customer.save();
    console.log('Customer user created:', customer.email);
  } catch (err) {
    console.error('Error creating customer user:', err);
  }
}

async function seedProvider() {
  const providerEmail = 'provider@homeease.com';
  const providerPassword = 'provider123';

  console.log('Checking for existing provider user...');
  const existing = await User.findOne({ email: providerEmail, role: 'provider' });
  if (existing) {
    console.log('Provider user already exists:', existing.email);
    return;
  }
  console.log('No existing provider found. Creating new provider...');
  const provider = new User({
    name: 'Test Provider',
    email: providerEmail,
    password: providerPassword,
    role: 'provider',
    status: 'active',
    isApproved: true,
    approvalStatus: 'approved',
    phone: '0987654321',
    address: '456 Service Rd',
    city: 'Provider City',
    profession: 'Electrician',
    experience: 5,
    pricing: 100,
    bio: 'Experienced electrician for all your needs.'
  });
  try {
    console.log('Saving new provider user...');
    await provider.save();
    console.log('Provider user created:', provider.email);
  } catch (err) {
    console.error('Error creating provider user:', err);
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
    await seedCustomer();
    await seedProvider();
    await seedMaintenance();
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.disconnect();
  }
}

main(); 