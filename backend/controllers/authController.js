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

    if (!['customer', 'provider'].includes(role)) {
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

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object based on role
    const userData = {
      name,
      email,
      password: hashedPassword,
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
      message: `${role === 'provider' ? 'Seller' : 'Customer'} account created successfully`,
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

    const match = await bcrypt.compare(password, user.password);
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

module.exports = { signup, login, getProfile, updateProfile };
