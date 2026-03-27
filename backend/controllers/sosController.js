const SosEvent = require('../models/SosEvent');
const User = require('../models/User');
const { sendSMS } = require('../services/smsService');

// POST /api/sos
exports.triggerSOS = async (req, res, next) => {
  try {
    const { lat, lng, address } = req.body;
    const userId = req.user._id;

    const sosEvent = await SosEvent.create({
      userId,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      address: address || 'Unknown location'
    });

    // Fetch user with contacts
    const user = await User.findById(userId);
    const contacts = user.contacts || [];
    let alertsSentCount = 0;

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    for (const contact of contacts) {
      const result = await sendSMS({
        to: contact.phone,
        body: `SAFELLE ALERT: ${user.name} needs help! Location: ${address || 'Unknown'}. Time: ${timestamp}. Please check on them immediately.`
      });
      if (result.success) alertsSentCount++;
    }

    sosEvent.alertsSent = alertsSentCount > 0 || contacts.length === 0;
    await sosEvent.save();

    // Emit socket event to admin room
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('sos_triggered', {
        user: { name: user.name, email: user.email, phone: user.phone },
        location: { lat, lng, address },
        timestamp: sosEvent.timestamp,
        sosId: sosEvent._id
      });
    }

    res.status(201).json({
      sosId: sosEvent._id,
      message: `Alerts sent to ${alertsSentCount} of ${contacts.length} contacts.`
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/sos/my
exports.getMySOS = async (req, res, next) => {
  try {
    const events = await SosEvent.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(events);
  } catch (error) {
    next(error);
  }
};
