import { Polyline, Popup } from 'react-leaflet';

export function RouteLayer({ coordinates, color = '#10B981', weight = 5, dashArray = null, label = '' }) {
  if (!coordinates || coordinates.length === 0) return null;

  return (
    <Polyline
      positions={coordinates}
      pathOptions={{ color, weight, dashArray, opacity: 0.8 }}
    >
      {label && (
        <Popup>
          <div className="text-sm font-medium">{label}</div>
        </Popup>
      )}
    </Polyline>
  );
}
