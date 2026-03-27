const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: { type: String, required: [true, 'Phone number is required'], trim: true },
  passwordHash: { type: String, required: [true, 'Password is required'] },
  age: { type: Number, min: [13, 'Must be at least 13 years old'] },
  address: { type: String, default: '' },
  profilePicUrl: { type: String, default: '' },
  contacts: {
    type: [{
      name: { type: String, required: true },
      phone: { type: String, required: true }
    }],
    validate: [arr => arr.length <= 5, 'Maximum 5 emergency contacts allowed']
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resetToken: String,
  resetExpires: Date,
  phoneOtp: String,
  otpExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
