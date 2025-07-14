const Terms = require('../models/Terms');

// Admin: Get all terms
const getAllTerms = async (req, res) => {
  try {
    const terms = await Terms.find()
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    console.error('Error fetching terms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terms',
      error: error.message
    });
  }
};

// Admin: Get terms by user type
const getTermsByUserType = async (req, res) => {
  try {
    const { userType } = req.params;
    
    if (!['customer', 'provider'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be customer or provider.'
      });
    }

    const terms = await Terms.find({ userType })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    console.error('Error fetching terms by user type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terms',
      error: error.message
    });
  }
};

// Admin: Create new terms
const createTerms = async (req, res) => {
  try {
    const { title, content, userType, version } = req.body;

    if (!title || !content || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and userType are required'
      });
    }

    if (!['customer', 'provider'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be customer or provider.'
      });
    }

    // Deactivate previous active terms for this user type
    await Terms.updateMany(
      { userType, isActive: true },
      { isActive: false }
    );

    const newTerms = new Terms({
      title,
      content,
      userType,
      version: version || '1.0',
      createdBy: req.user.id
    });

    const savedTerms = await newTerms.save();
    await savedTerms.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Terms created successfully',
      data: savedTerms
    });
  } catch (error) {
    console.error('Error creating terms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create terms',
      error: error.message
    });
  }
};

// Admin: Update terms
const updateTerms = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, version } = req.body;

    const terms = await Terms.findById(id);
    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'Terms not found'
      });
    }

    // Deactivate current terms and create new version
    terms.isActive = false;
    await terms.save();

    const updatedTerms = new Terms({
      title: title || terms.title,
      content: content || terms.content,
      userType: terms.userType,
      version: version || terms.version,
      createdBy: req.user.id
    });

    const savedTerms = await updatedTerms.save();
    await savedTerms.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Terms updated successfully',
      data: savedTerms
    });
  } catch (error) {
    console.error('Error updating terms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update terms',
      error: error.message
    });
  }
};

// Admin: Delete terms
const deleteTerms = async (req, res) => {
  try {
    const { id } = req.params;

    const terms = await Terms.findById(id);
    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'Terms not found'
      });
    }

    await Terms.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Terms deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting terms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete terms',
      error: error.message
    });
  }
};

// Customer/Provider: Get active terms for their user type
const getActiveTerms = async (req, res) => {
  try {
    const userType = req.user.role === 'customer' ? 'customer' : 'provider';
    
    const terms = await Terms.findOne({ 
      userType, 
      isActive: true 
    }).populate('createdBy', 'name');

    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'No active terms found for your user type'
      });
    }

    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    console.error('Error fetching active terms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terms',
      error: error.message
    });
  }
};

// Get terms by ID (for admin)
const getTermsById = async (req, res) => {
  try {
    const { id } = req.params;

    const terms = await Terms.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'Terms not found'
      });
    }

    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    console.error('Error fetching terms by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terms',
      error: error.message
    });
  }
};

module.exports = {
  getAllTerms,
  getTermsByUserType,
  createTerms,
  updateTerms,
  deleteTerms,
  getActiveTerms,
  getTermsById
}; 