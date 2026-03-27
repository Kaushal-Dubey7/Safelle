/**
 * Safety Engine — computes route risk based on nearby incidents.
 * Uses Haversine formula for distance calculations.
 */

const EARTH_RADIUS_KM = 6371;
const METERS_PER_KM = 1000;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c * METERS_PER_KM; // returns meters
}

/**
 * Compute route risk based on nearby incidents.
 * @param {Array<[number, number]>} coordinates - Array of [lng, lat] pairs from route geometry
 * @param {Array} incidents - Incident documents from MongoDB
 * @returns {{ score: number, riskLevel: string, incidentCount: number }}
 */
function computeRouteRisk(coordinates, incidents) {
  if (!coordinates || coordinates.length === 0) {
    return { score: 1.0, riskLevel: 'Low', incidentCount: 0 };
  }

  const RADIUS_METERS = 200;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  let totalIncidentCount = 0;
  let totalWeightedSeverity = 0;
  const seenIncidents = new Set();

  for (const coord of coordinates) {
    const [lng, lat] = coord;

    for (const incident of incidents) {
      if (seenIncidents.has(incident._id.toString())) continue;

      const [incLng, incLat] = incident.location.coordinates;
      const distance = haversineDistance(lat, lng, incLat, incLng);

      if (distance <= RADIUS_METERS) {
        seenIncidents.add(incident._id.toString());
        totalIncidentCount++;

        const age = now - new Date(incident.timestamp).getTime();
        const recencyWeight = age > THIRTY_DAYS ? 0.5 : 1.0;
        totalWeightedSeverity += incident.severity * recencyWeight;
      }
    }
  }

  const avgSeverity = totalIncidentCount > 0 ? totalWeightedSeverity / totalIncidentCount : 0;
  let score = 1.0 - (totalIncidentCount * 0.1 * avgSeverity) / 5;
  score = Math.max(0, Math.min(1, score));

  let riskLevel;
  if (score >= 0.7) riskLevel = 'Low';
  else if (score >= 0.4) riskLevel = 'Medium';
  else riskLevel = 'High';

  return { score, riskLevel, incidentCount: totalIncidentCount };
}

module.exports = { computeRouteRisk, haversineDistance };
