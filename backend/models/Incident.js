const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['harassment', 'theft', 'poor_lighting', 'unsafe_crowd', 'assault', 'other'],
    required: [true, 'Incident type is required']
  },
  severity: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Severity is required']
  },
  description: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  photoUrl: { type: String, default: '' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verified: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

incidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', incidentSchema);
