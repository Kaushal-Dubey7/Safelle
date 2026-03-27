import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export function HeatmapLayer({ points, options = {} }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // Remove existing layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const heatData = points.map((p) => [p[0], p[1], p[2] || 0.5]);

    layerRef.current = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.2: '#3B82F6',
        0.4: '#10B981',
        0.6: '#F59E0B',
        1.0: '#EF4444',
      },
      ...options,
    });

    layerRef.current.addTo(map);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, points, options]);

  return null;
}
