import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

export function SafelleMap({ center, zoom = 13, children, className = '', style = {} }) {
  return (
    <MapContainer
      center={center || [28.6139, 77.2090]}
      zoom={zoom}
      className={className}
      style={{ height: '100%', width: '100%', ...style }}
      zoomControl={true}
    >
      <TileLayer
        url={DARK_TILES}
        attribution={ATTRIBUTION}
        subdomains="abcd"
        maxZoom={19}
      />
      {children}
    </MapContainer>
  );
}

export function UserLocationMarker({ position }) {
  if (!position || !position.lat) return null;
  return (
    <>
      <Circle
        center={[position.lat, position.lng]}
        radius={50}
        pathOptions={{
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.2,
          weight: 2,
        }}
      />
      <Marker position={[position.lat, position.lng]}>
        <Popup>
          <div className="text-center">
            <p className="font-semibold text-sm">You are here</p>
          </div>
        </Popup>
      </Marker>
    </>
  );
}
