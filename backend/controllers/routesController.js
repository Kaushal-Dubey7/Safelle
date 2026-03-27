const Incident = require('../models/Incident');
const { computeRouteRisk } = require('../utils/safetyEngine');

// GET /api/routes/safe
exports.getSafeRoute = async (req, res, next) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.query;

    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({ message: 'Origin and destination coordinates are required.' });
    }

    // Call OSRM public API for walking routes
    const osrmUrl = `http://router.project-osrm.org/route/v1/walking/${originLng},${originLat};${destLng},${destLat}?geometries=geojson&alternatives=true&steps=true&overview=full`;

    const response = await fetch(osrmUrl);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return res.status(404).json({ message: 'No routes found between these locations.' });
    }

    // Get incidents around the bounding box of all routes
    const allCoords = data.routes.flatMap(r => r.geometry.coordinates);
    const lats = allCoords.map(c => c[1]);
    const lngs = allCoords.map(c => c[0]);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const maxRadius = 10000; // 10km

    const incidents = await Incident.find({
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [centerLng, centerLat] },
          $maxDistance: maxRadius
        }
      }
    }).limit(500);

    // Analyze each route
    const analyzed = data.routes.map((route, index) => {
      const coords = route.geometry.coordinates;
      const risk = computeRouteRisk(coords, incidents);
      return {
        index,
        coordinates: coords.map(c => [c[1], c[0]]), // Convert to [lat, lng] for frontend
        distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
        durationMin: Math.ceil(route.duration / 60),
        safetyScore: parseFloat(risk.score.toFixed(2)),
        riskLevel: risk.riskLevel,
        incidentCount: risk.incidentCount,
        steps: route.legs[0]?.steps?.map(s => ({
          instruction: s.maneuver?.type || 'continue',
          name: s.name || '',
          distance: s.distance,
          duration: s.duration
        })) || []
      };
    });

    // Sort by safety score descending — safest first
    analyzed.sort((a, b) => b.safetyScore - a.safetyScore);

    res.json({
      safeRoute: analyzed[0],
      fastRoute: analyzed.length > 1 ? analyzed[analyzed.length - 1] : analyzed[0]
    });
  } catch (error) {
    next(error);
  }
};
