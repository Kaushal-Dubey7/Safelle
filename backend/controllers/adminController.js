const Incident = require('../models/Incident');
const SosEvent = require('../models/SosEvent');
const User = require('../models/User');

// GET /api/admin/incidents
exports.getIncidents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, verified } = req.query;
    const query = {};
    if (type) query.type = type;
    if (verified !== undefined) query.verified = verified === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [incidents, total] = await Promise.all([
      Incident.find(query)
        .populate('reportedBy', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Incident.countDocuments(query)
    ]);

    res.json({
      incidents,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/incident/:id
exports.verifyIncident = async (req, res, next) => {
  try {
    const { verified } = req.body;
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true }
    ).populate('reportedBy', 'name');

    if (!incident) return res.status(404).json({ message: 'Incident not found.' });
    res.json(incident);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/incident/:id
exports.deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found.' });
    res.json({ message: 'Incident deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalIncidents, totalSOS, verifiedIncidents, totalUsers] = await Promise.all([
      Incident.countDocuments(),
      SosEvent.countDocuments(),
      Incident.countDocuments({ verified: true }),
      User.countDocuments()
    ]);

    // Incidents by type
    const byType = await Incident.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const incidentsByType = {};
    byType.forEach(t => { incidentsByType[t._id] = t.count; });

    // Incidents last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const incidentsLast7 = await Incident.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // SOS last 7 days
    const sosLast7 = await SosEvent.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Hotspots: top 10 areas with most incidents
    const hotspots = await Incident.aggregate([
      {
        $group: {
          _id: {
            lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 3] },
            lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 3] }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, lat: '$_id.lat', lng: '$_id.lng', count: 1 } }
    ]);

    res.json({
      totalIncidents,
      totalSOS,
      verifiedIncidents,
      totalUsers,
      incidentsByType,
      incidentsLast7Days: incidentsLast7.map(d => ({ date: d._id, count: d.count })),
      sosLast7Days: sosLast7.map(d => ({ date: d._id, count: d.count })),
      hotspots
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};
