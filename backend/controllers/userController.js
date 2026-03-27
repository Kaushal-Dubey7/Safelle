const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// GET /api/user/me
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -phoneOtp -resetToken -resetExpires -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/user/me
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, phone, address, age, contacts } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (age !== undefined) updates.age = age;
    if (contacts) {
      if (contacts.length > 5) {
        return res.status(400).json({ message: 'Maximum 5 emergency contacts allowed.' });
      }
      updates.contacts = contacts;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
      .select('-passwordHash -phoneOtp -resetToken -resetExpires -otpExpires');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/user/password
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/user/upload-avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicUrl: req.file.path },
      { new: true }
    ).select('-passwordHash -phoneOtp -resetToken -resetExpires -otpExpires');

    res.json({ profilePicUrl: user.profilePicUrl });
  } catch (error) {
    next(error);
  }
};
