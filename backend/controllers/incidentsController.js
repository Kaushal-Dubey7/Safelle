const { validationResult } = require('express-validator');
const Incident = require('../models/Incident');

// GET /api/incidents
exports.getIncidents = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000, limit = 100, type, verified } = req.query;
    const query = {};

    if (lat && lng) {
      query.location = {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      };
    }

    if (type) query.type = type;
    if (verified !== undefined) query.verified = verified === 'true';

    const incidents = await Incident.find(query)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 })
      .populate('reportedBy', 'name');

    res.json(incidents);
  } catch (error) {
    next(error);
  }
};

// POST /api/incidents
exports.createIncident = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { type, severity, description, lat, lng, photoUrl, anonymous } = req.body;

    const incident = await Incident.create({
      type,
      severity,
      description: description || '',
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      photoUrl: photoUrl || '',
      reportedBy: anonymous ? null : req.user._id
    });

    // Emit socket event for real-time heatmap update
    const io = req.app.get('io');
    if (io) {
      io.emit('new_incident', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        severity: incident.severity,
        type: incident.type
      });
    }

    res.status(201).json(incident);
  } catch (error) {
    next(error);
  }
};

// GET /api/incidents/:id
exports.getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id).populate('reportedBy', 'name');
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found.' });
    }
    res.json(incident);
  } catch (error) {
    next(error);
  }
};
