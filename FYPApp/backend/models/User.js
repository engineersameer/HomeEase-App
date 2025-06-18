const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  fatherName: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  cnic: { 
    type: String, 
    required: true, 
    unique: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema); 