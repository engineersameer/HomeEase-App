const User = require('../models/User');

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { name, fatherName, phoneNumber, city, address, cnic } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ cnic }, { phoneNumber }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this CNIC or phone number already exists' 
      });
    }

    // Create new user
    const user = new User({
      name,
      fatherName,
      phoneNumber,
      city,
      address,
      cnic
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message 
    });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { cnic, phoneNumber } = req.body;

    const user = await User.findOne({ cnic, phoneNumber });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ 
      message: 'Login successful', 
      user: { 
        id: user._id, 
        name: user.name 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
}; 