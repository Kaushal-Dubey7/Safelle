import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Navigation, MapPin, Search, Shield, AlertTriangle, Clock, Ruler } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { routeService } from '../services/routeService';
import { Navbar } from '../components/layout/Navbar';
import { SafelleMap, UserLocationMarker } from '../components/map/SafelleMap';
import { RouteLayer } from '../components/map/RouteLayer';
import { Button, Card, Badge, Spinner } from '../components/ui';
import axios from 'axios';

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function RouteNavigation() {
  const { lat, lng } = useGeolocation();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [originResults, setOriginResults] = useState([]);
  const [destResults, setDestResults] = useState([]);
  const [routes, setRoutes] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState('safe');

  const searchNominatim = useCallback(
    debounce(async (query, setter) => {
      if (query.length < 3) { setter([]); return; }
      try {
        const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`, {
          headers: { 'Accept-Language': 'en', 'User-Agent': 'SAFELLE/1.0' }
        });
        setter(data.map(r => ({ display: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })));
      } catch { setter([]); }
    }, 500),
    []
  );

  const useMyLocation = () => {
    if (lat && lng) {
      setOriginCoords({ lat, lng });
      setOrigin('My Current Location');
      setOriginResults([]);
    }
  };

  const routeMutation = useMutation({
    mutationFn: () => routeService.getSafeRoute({
      originLat: originCoords.lat, originLng: originCoords.lng,
      destLat: destCoords.lat, destLng: destCoords.lng,
    }).then(r => r.data),
    onSuccess: (data) => setRoutes(data),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to find routes.'),
  });

  const activeRoute = routes ? (selectedRoute === 'safe' ? routes.safeRoute : routes.fastRoute) : null;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <div className="pt-16 flex flex-col lg:flex-row" style={{ height: '100vh' }}>
        {/* Left Panel */}
        <div className="w-full lg:w-96 bg-bg-surface border-r border-border overflow-y-auto p-4 space-y-4 shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Navigation className="w-5 h-5 text-accent-pink" />
            Route Navigator
          </h2>

          {/* Origin */}
          <div className="relative">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">From</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input value={origin} onChange={(e) => { setOrigin(e.target.value); searchNominatim(e.target.value, setOriginResults); }}
                  placeholder="Starting point" className="input-field pr-8" />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                {originResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated border border-border rounded-btn shadow-card z-50 max-h-40 overflow-y-auto">
                    {originResults.map((r, i) => (
                      <button key={i} onClick={() => { setOriginCoords({ lat: r.lat, lng: r.lng }); setOrigin(r.display.substring(0, 50)); setOriginResults([]); }}
                        className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors">
                        {r.display.substring(0, 60)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={useMyLocation} className="px-3 py-2 bg-success/20 text-success rounded-btn text-xs font-medium hover:bg-success/30 transition-colors whitespace-nowrap">
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Destination */}
          <div className="relative">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">To</label>
            <div className="relative">
              <input value={destination} onChange={(e) => { setDestination(e.target.value); searchNominatim(e.target.value, setDestResults); }}
                placeholder="Where to?" className="input-field pr-8" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              {destResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated border border-border rounded-btn shadow-card z-50 max-h-40 overflow-y-auto">
                  {destResults.map((r, i) => (
                    <button key={i} onClick={() => { setDestCoords({ lat: r.lat, lng: r.lng }); setDestination(r.display.substring(0, 50)); setDestResults([]); }}
                      className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors">
                      {r.display.substring(0, 60)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button onClick={() => routeMutation.mutate()} loading={routeMutation.isPending}
            disabled={!originCoords || !destCoords} className="w-full h-12">
            <Shield className="w-4 h-4 mr-2" /> Find Safe Route
          </Button>

          {/* Route Cards */}
          {routes && (
            <div className="space-y-3 pt-2">
              {/* Safe Route */}
              <button onClick={() => setSelectedRoute('safe')}
                className={`w-full text-left p-4 rounded-card border transition-all ${selectedRoute === 'safe' ? 'border-success bg-success/5' : 'border-border bg-bg-primary hover:border-success/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-8 rounded-full bg-success" />
                  <div>
                    <p className="font-semibold text-sm flex items-center gap-2">Safe Route <Badge color="#10B981">{routes.safeRoute.riskLevel} Risk</Badge></p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-text-secondary ml-3">
                  <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {routes.safeRoute.distanceKm} km</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {routes.safeRoute.durationMin} min</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {Math.round(routes.safeRoute.safetyScore * 100)}%</span>
                </div>
              </button>

              {/* Fast Route */}
              <button onClick={() => setSelectedRoute('fast')}
                className={`w-full text-left p-4 rounded-card border transition-all ${selectedRoute === 'fast' ? 'border-text-secondary bg-white/5' : 'border-border bg-bg-primary hover:border-white/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-8 rounded-full bg-text-secondary" />
                  <div>
                    <p className="font-semibold text-sm flex items-center gap-2">Fast Route <Badge>{routes.fastRoute.riskLevel} Risk</Badge></p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-text-secondary ml-3">
                  <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {routes.fastRoute.distanceKm} km</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {routes.fastRoute.durationMin} min</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {Math.round(routes.fastRoute.safetyScore * 100)}%</span>
                </div>
              </button>

              {/* Safety bar */}
              <div className="pt-2">
                <p className="text-xs text-text-secondary mb-1.5">Safety Score</p>
                <div className="h-2 rounded-full bg-bg-primary overflow-hidden relative">
                  <div className="h-full rounded-full bg-gradient-to-r from-danger via-warning to-success" style={{ width: '100%' }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-bg-primary shadow"
                    style={{ left: `${(activeRoute?.safetyScore || 0.5) * 100}%`, transform: 'translate(-50%, -50%)' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <SafelleMap center={originCoords ? [originCoords.lat, originCoords.lng] : [lat || 28.6139, lng || 77.2090]} zoom={13}>
            <UserLocationMarker position={{ lat, lng }} />
            {routes && (
              <>
                <RouteLayer coordinates={routes.safeRoute.coordinates} color="#10B981" weight={selectedRoute === 'safe' ? 6 : 3} label="Safe Route" />
                <RouteLayer coordinates={routes.fastRoute.coordinates} color="#94A3B8" weight={selectedRoute === 'fast' ? 6 : 3} dashArray="8 4" label="Fast Route" />
              </>
            )}
          </SafelleMap>
        </div>
      </div>
    </div>
  );
}
