export function computeSafetyScore(incidents, centerLat, centerLng, radiusKm = 5) {
  if (!incidents || incidents.length === 0) return 85;

  const EARTH_RADIUS = 6371;
  let weightedScore = 0;

  const nearbyIncidents = incidents.filter((inc) => {
    const [lng, lat] = inc.location?.coordinates || [0, 0];
    const dLat = ((lat - centerLat) * Math.PI) / 180;
    const dLng = ((lng - centerLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((centerLat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const dist = EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return dist <= radiusKm;
  });

  if (nearbyIncidents.length === 0) return 92;

  for (const inc of nearbyIncidents) {
    weightedScore += (inc.severity || 3) * (inc.verified ? 1.5 : 1);
  }

  const maxPossibleScore = nearbyIncidents.length * 7.5;
  const rawScore = 100 - (weightedScore / maxPossibleScore) * 100;
  return Math.max(10, Math.min(95, Math.round(rawScore)));
}

export function getSafetyLevel(score) {
  if (score >= 70) return { label: 'Safe', color: '#10B981' };
  if (score >= 40) return { label: 'Moderate', color: '#F59E0B' };
  return { label: 'Unsafe', color: '#EF4444' };
}
