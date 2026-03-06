const User = require('../models/User');
const { validationResult } = require('express-validator');

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get storage info
exports.getStorageInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit,
      percentUsed: ((user.storageUsed / user.storageLimit) * 100).toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
