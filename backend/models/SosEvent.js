const mongoose = require('mongoose');

const sosEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  address: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  alertsSent: { type: Boolean, default: false }
});

sosEventSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SosEvent', sosEventSchema);
