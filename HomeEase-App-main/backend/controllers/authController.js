const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const signup = async (req, res) => {
  try {
    const {
      name, email, password, role,
      // Customer fields
      address, phone, city,
      // Provider fields
      profession, experience, pricing, certifications, cnic, availability, bio, profileImage
    } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!['customer', 'provider', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Provider-specific validation
    if (role === 'provider') {
      if (!profession || !experience || !pricing || !city) {
        return res.status(400).json({ message: 'Please fill in all required provider fields' });
      }
      
      if (isNaN(experience) || isNaN(pricing)) {
        return res.status(400).json({ message: 'Experience and pricing must be numbers' });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user object based on role
    const userData = {
      name,
      email,
      password, // Don't hash here - User model will handle it
      role,
    };

    // Add customer fields
    if (role === 'customer') {
      if (address) userData.address = address;
      if (phone) userData.phone = phone;
      if (city) userData.city = city;
    }

    // Add provider fields
    if (role === 'provider') {
      userData.profession = profession;
      userData.experience = parseInt(experience);
      userData.pricing = parseInt(pricing);
      userData.city = city;
      if (certifications) userData.certifications = certifications;
      if (cnic) userData.cnic = cnic;
      if (availability) userData.availability = availability;
      if (bio) userData.bio = bio;
      if (profileImage) userData.profileImage = profileImage;
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({ 
      message: `${role === 'provider' ? 'Seller' : role === 'admin' ? 'Admin' : 'Customer'} account created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup error', error: err.message });
  }
};

const login = async (req, res) => {
  console.log("in login")
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use the model's comparePassword method
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Debug: Check if JWT_SECRET is available
    console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    // Use fallback if JWT_SECRET is not available
    const jwtSecret = process.env.JWT_SECRET || 'homeease_jwt_secret_key_2024_secure_and_unique_fallback';

    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    // Return user data based on role
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Add role-specific fields
    if (user.role === 'customer') {
      userData.address = user.address;
      userData.phone = user.phone;
      userData.city = user.city;
    } else if (user.role === 'provider') {
      userData.profession = user.profession;
      userData.experience = user.experience;
      userData.pricing = user.pricing;
      userData.city = user.city;
      userData.certifications = user.certifications;
      userData.cnic = user.cnic;
      userData.availability = user.availability;
      userData.bio = user.bio;
      userData.profileImage = user.profileImage;
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role,
      user: userData,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      name, address, phone, city,
      profession, experience, pricing, certifications, cnic, availability, bio
    } = req.body;

    const updateData = {};
    
    // Basic fields
    if (name) updateData.name = name;
    
    // Customer fields
    if (req.user.role === 'customer') {
      if (address !== undefined) updateData.address = address;
      if (phone !== undefined) updateData.phone = phone;
      if (city !== undefined) updateData.city = city;
    }
    
    // Provider fields
    if (req.user.role === 'provider') {
      if (profession) updateData.profession = profession;
      if (experience !== undefined) updateData.experience = parseInt(experience);
      if (pricing !== undefined) updateData.pricing = parseInt(pricing);
      if (city !== undefined) updateData.city = city;
      if (certifications !== undefined) updateData.certifications = certifications;
      if (cnic !== undefined) updateData.cnic = cnic;
      if (availability !== undefined) updateData.availability = availability;
      if (bio !== undefined) updateData.bio = bio;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

// Customer signup
const customerSignup = async (req, res) => {
  try {
    const { name, email, password, address, phone, city } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const userData = {
      name,
      email,
      password, // Don't hash here - User model will handle it
      role: 'customer',
      address,
      phone,
      city,
    };

    const user = new User(userData);
    await user.save();

    res.status(201).json({ 
      success: true,
      message: 'Customer account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        city: user.city,
      }
    });
  } catch (err) {
    console.error('Customer signup error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Signup error', 
      error: err.message 
    });
  }
};

// Customer signin
const customerSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email, role: 'customer' });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials or account not found' 
      });
    }

    // Use the model's comparePassword method
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'homeease_jwt_secret_key_2024_secure_and_unique_fallback';
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        city: user.city,
      },
    });
  } catch (err) {
    console.error('Customer signin error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Login error', 
      error: err.message 
    });
  }
};

// Provider signup
const providerSignup = async (req, res) => {
  try {
    const { name, email, password, phone, address, city, bio } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !city) {
      return res.status(400).json({ 
        success: false,
        message: 'Please fill in all required fields' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    const userData = {
      name,
      email,
      password, // Don't hash here - User model will handle it
      role: 'provider',
      phone,
      address,
      city,
      bio,
      approvalStatus: 'pending'
    };

    const user = new User(userData);
    await user.save();

    res.status(201).json({ 
      success: true,
      message: 'Provider account created successfully! Please wait for admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        bio: user.bio,
        approvalStatus: user.approvalStatus,
      }
    });
  } catch (err) {
    console.error('Provider signup error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Signup error', 
      error: err.message 
    });
  }
};

// Provider signin
const providerSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email, role: 'provider' });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials or account not found' 
      });
    }

    // Check if provider is approved
    if (user.approvalStatus !== 'approved') {
      return res.status(401).json({ 
        success: false,
        message: 'Your account is pending approval. Please contact admin.' 
      });
    }

    // Use the model's comparePassword method
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'homeease_jwt_secret_key_2024_secure_and_unique_fallback';
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        bio: user.bio,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (err) {
    console.error('Provider signin error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Login error', 
      error: err.message 
    });
  }
};

// Admin signin
const adminSignin = async (req, res) => {
  console.log("in admin signin")
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials or admin access denied' 
      });
    }

    // Use the model's comparePassword method
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'homeease_jwt_secret_key_2024_secure_and_unique_fallback';
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error('Admin signin error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Login error', 
      error: err.message 
    });
  }
};

// Verify admin token
const verifyAdminToken = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not an admin' });
    }
    res.json({ success: true, message: 'Token is valid', user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Token verification failed' });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  customerSignup,
  customerSignin,
  providerSignup,
  providerSignin,
  adminSignin,
  verifyAdminToken
};
