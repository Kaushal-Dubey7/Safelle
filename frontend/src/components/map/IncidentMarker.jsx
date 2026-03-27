import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { INCIDENT_TYPE_CONFIG, timeAgo } from '../../utils/formatters';

function createIncidentIcon(type) {
  const config = INCIDENT_TYPE_CONFIG[type] || INCIDENT_TYPE_CONFIG.other;
  return L.divIcon({
    className: 'incident-marker',
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${config.color};border:2px solid #0D0F1A;box-shadow:0 2px 8px ${config.color}40;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
}

function SeverityStars({ severity }) {
  return (
    <span className="text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < severity ? '#E91E8C' : '#4B5563' }}>★</span>
      ))}
    </span>
  );
}

export function IncidentMarker({ incident }) {
  const config = INCIDENT_TYPE_CONFIG[incident.type] || INCIDENT_TYPE_CONFIG.other;
  const [lng, lat] = incident.location?.coordinates || [0, 0];

  return (
    <Marker position={[lat, lng]} icon={createIncidentIcon(incident.type)}>
      <Popup>
        <div style={{ minWidth: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{
              display: 'inline-block', padding: '2px 8px', borderRadius: 12,
              fontSize: 11, fontWeight: 600, color: config.color, background: config.bg
            }}>
              {config.label}
            </span>
          </div>
          <div style={{ marginBottom: 4 }}>
            <SeverityStars severity={incident.severity} />
          </div>
          {incident.description && (
            <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4, lineHeight: 1.4 }}>
              {incident.description.substring(0, 100)}{incident.description.length > 100 ? '...' : ''}
            </p>
          )}
          <p style={{ fontSize: 11, color: '#64748B' }}>{timeAgo(incident.timestamp)}</p>
        </div>
      </Popup>
    </Marker>
  );
}
