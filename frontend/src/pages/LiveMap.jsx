import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Filter, Layers, Plus } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSocket } from '../hooks/useSocket';
import { incidentService } from '../services/incidentService';
import { Navbar } from '../components/layout/Navbar';
import { SafelleMap, UserLocationMarker } from '../components/map/SafelleMap';
import { HeatmapLayer } from '../components/map/HeatmapLayer';
import { IncidentMarker } from '../components/map/IncidentMarker';
import { Spinner } from '../components/ui';
import { INCIDENT_TYPE_CONFIG } from '../utils/formatters';

export default function LiveMap() {
  const { lat, lng, loading: geoLoading } = useGeolocation();
  const { on } = useSocket();
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    types: Object.keys(INCIDENT_TYPE_CONFIG),
    timeRange: 'all',
  });

  const { data: incidents, isLoading, refetch } = useQuery({
    queryKey: ['mapIncidents', lat, lng],
    queryFn: () => incidentService.getIncidents({ lat, lng, radius: 10000, limit: 200 }).then(r => r.data),
    enabled: !!lat && !!lng,
  });

  // Listen for real-time new incidents
  useEffect(() => {
    const cleanup = on('new_incident', () => { refetch(); });
    return cleanup;
  }, [on, refetch]);

  const filteredIncidents = useMemo(() => {
    if (!incidents) return [];
    let result = incidents.filter(i => filters.types.includes(i.type));
    if (filters.timeRange !== 'all') {
      const now = Date.now();
      const ranges = { '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
      const cutoff = now - (ranges[filters.timeRange] || 0);
      result = result.filter(i => new Date(i.timestamp).getTime() > cutoff);
    }
    return result;
  }, [incidents, filters]);

  const heatmapPoints = useMemo(() =>
    filteredIncidents.map(i => {
      const [lng, lat] = i.location?.coordinates || [0, 0];
      return [lat, lng, (i.severity || 3) / 5];
    }), [filteredIncidents]);

  const toggleType = (type) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  if (geoLoading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)] mt-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <div className="pt-16 relative" style={{ height: '100vh' }}>
        <SafelleMap center={[lat || 28.6139, lng || 77.2090]} zoom={13} style={{ height: 'calc(100vh - 64px)' }}>
          <UserLocationMarker position={{ lat, lng }} />
          {showHeatmap && <HeatmapLayer points={heatmapPoints} />}
          {showMarkers && filteredIncidents.map(inc => (
            <IncidentMarker key={inc._id} incident={inc} />
          ))}
        </SafelleMap>

        {/* Filter Panel */}
        <div className="absolute top-4 right-4 z-[1000]">
          <button onClick={() => setFilterOpen(!filterOpen)}
            className="w-10 h-10 rounded-btn bg-bg-elevated border border-border flex items-center justify-center text-text-primary hover:bg-white/10 shadow-card transition-colors">
            <Filter className="w-5 h-5" />
          </button>

          {filterOpen && (
            <div className="mt-2 w-64 bg-bg-elevated border border-border rounded-card shadow-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Filters</h3>
                <button onClick={() => setFilterOpen(false)} className="text-text-secondary hover:text-text-primary text-xs">✕</button>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-text-secondary flex items-center gap-2"><Layers className="w-4 h-4" /> Heatmap</span>
                  <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)}
                    className="rounded border-border text-accent-pink focus:ring-accent-pink bg-bg-primary" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-text-secondary flex items-center gap-2"><MapPin className="w-4 h-4" /> Markers</span>
                  <input type="checkbox" checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)}
                    className="rounded border-border text-accent-pink focus:ring-accent-pink bg-bg-primary" />
                </label>
              </div>

              {/* Types */}
              <div>
                <p className="text-xs text-text-secondary mb-2">Incident Types</p>
                <div className="space-y-1.5">
                  {Object.entries(INCIDENT_TYPE_CONFIG).map(([key, config]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={filters.types.includes(key)} onChange={() => toggleType(key)}
                        className="rounded border-border text-accent-pink focus:ring-accent-pink bg-bg-primary" />
                      <span className="text-xs" style={{ color: config.color }}>{config.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <p className="text-xs text-text-secondary mb-2">Time Range</p>
                <div className="flex flex-wrap gap-1">
                  {[{ key: '24h', label: '24h' }, { key: '7d', label: '7 days' }, { key: '30d', label: '30 days' }, { key: 'all', label: 'All' }].map(opt => (
                    <button key={opt.key} onClick={() => setFilters(prev => ({ ...prev, timeRange: opt.key }))}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filters.timeRange === opt.key ? 'bg-accent-pink text-white' : 'bg-bg-primary text-text-secondary hover:text-text-primary'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Report Here Button */}
        <Link to="/report" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
          <button className="btn-primary flex items-center gap-2 shadow-glow-pink px-6 py-3">
            <Plus className="w-4 h-4" /> Report Here
          </button>
        </Link>
      </div>
    </div>
  );
}
