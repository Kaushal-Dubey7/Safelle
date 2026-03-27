const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, phone, password, age, address, contacts } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name, email, phone, passwordHash, age, address,
      contacts: contacts || []
    });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email,
        phone: user.phone, role: user.role, profilePicUrl: user.profilePicUrl,
        contacts: user.contacts, age: user.age, address: user.address,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email,
        phone: user.phone, role: user.role, profilePicUrl: user.profilePicUrl,
        contacts: user.contacts, age: user.age, address: user.address,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = await bcrypt.hash(resetToken, 10);
    user.resetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`;
    await sendEmail({
      to: user.email,
      subject: 'SAFELLE — Password Reset',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#13162A;color:#F1F5F9;border-radius:16px;">
          <h2 style="color:#E91E8C;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#E91E8C,#7C3AED);color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">Reset Password</a>
          <p style="color:#94A3B8;margin-top:16px;font-size:14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, id, newPassword } = req.body;
    const user = await User.findById(id);

    if (!user || !user.resetToken || user.resetExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const isValid = await bcrypt.compare(token, user.resetToken);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/send-otp
exports.sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this phone number.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.phoneOtp = await bcrypt.hash(otp, 10);
    user.otpExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    await sendSMS({
      to: phone,
      body: `Your SAFELLE verification code is: ${otp}. It expires in 10 minutes.`
    });

    res.json({ message: 'OTP sent successfully.', phone });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });

    if (!user || !user.phoneOtp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const isValid = await bcrypt.compare(otp, user.phoneOtp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    user.phoneOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
};
