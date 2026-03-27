import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, AlertTriangle, FileWarning, Shield, Clock, MapPinned } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import { incidentService } from '../services/incidentService';
import { Navbar } from '../components/layout/Navbar';
import { Card, Badge, PageLoader } from '../components/ui';
import { getGreeting, timeAgo, INCIDENT_TYPE_CONFIG, distanceKm } from '../utils/formatters';
import { computeSafetyScore, getSafetyLevel } from '../utils/safetyScore';

export default function Dashboard() {
  const { user } = useAuth();
  const { lat, lng } = useGeolocation();

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['nearbyIncidents', lat, lng],
    queryFn: () => incidentService.getIncidents({ lat, lng, radius: 5000, limit: 20 }).then(r => r.data),
    enabled: !!lat && !!lng,
  });

  const safetyScore = incidents ? computeSafetyScore(incidents, lat, lng) : 85;
  const safetyLevel = getSafetyLevel(safetyScore);

  const quickActions = [
    { path: '/map', label: 'Live Map', icon: MapPin, gradient: 'from-pink-600 to-pink-500', desc: 'View incident heatmap' },
    { path: '/navigate', label: 'Safe Route', icon: Navigation, gradient: 'from-purple-600 to-purple-500', desc: 'Find safest path' },
    { path: '/sos', label: 'SOS Alert', icon: AlertTriangle, gradient: 'from-red-600 to-red-500', desc: 'Emergency alert', pulse: true },
    { path: '/report', label: 'Report', icon: FileWarning, gradient: 'from-amber-600 to-amber-500', desc: 'Report incident' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-text-secondary">Stay safe. We've got you.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.path} to={action.path}>
              <div className={`card-hover h-40 flex flex-col items-center justify-center text-center gap-3 group ${action.pulse ? 'relative' : ''}`}>
                {action.pulse && (
                  <div className="absolute inset-0 rounded-card bg-danger/5 animate-pulse" />
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{action.label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{action.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats & Safety Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Safety Score Gauge */}
          <Card className="md:col-span-1 flex flex-col items-center justify-center py-4">
            <svg width="120" height="120" viewBox="0 0 120 120" className="mb-2">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1C1F35" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={safetyLevel.color} strokeWidth="8"
                strokeDasharray={`${(safetyScore / 100) * 327} 327`} strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }} />
              <text x="60" y="55" textAnchor="middle" fill="#F1F5F9" fontSize="28" fontWeight="700">{safetyScore}</text>
              <text x="60" y="75" textAnchor="middle" fill="#94A3B8" fontSize="12">Safety</text>
            </svg>
            <Badge color={safetyLevel.color}>{safetyLevel.label}</Badge>
          </Card>

          {/* Stat Cards */}
          <Card className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent-pink/20 flex items-center justify-center">
              <MapPinned className="w-5 h-5 text-accent-pink" />
            </div>
            <div>
              <p className="text-2xl font-bold">{incidents?.length || 0}</p>
              <p className="text-xs text-text-secondary">Incidents Near You (5km)</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-accent-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{user?.contacts?.length || 0}</p>
              <p className="text-xs text-text-secondary">Trusted Contacts</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{incidents?.filter(i => i.reportedBy?._id === user?.id).length || 0}</p>
              <p className="text-xs text-text-secondary">Your Reports</p>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-pink" />
            Recent Activity Nearby
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          ) : incidents?.length > 0 ? (
            <div className="space-y-2">
              {incidents.slice(0, 5).map((inc) => {
                const config = INCIDENT_TYPE_CONFIG[inc.type] || INCIDENT_TYPE_CONFIG.other;
                const [iLng, iLat] = inc.location?.coordinates || [0, 0];
                const dist = lat && lng ? distanceKm(lat, lng, iLat, iLng).toFixed(1) : '?';
                return (
                  <div key={inc._id} className="flex items-center justify-between py-2 px-3 rounded-btn hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge color={config.color} bg={config.bg}>{config.label}</Badge>
                      <span className="text-sm text-text-secondary">{inc.description?.substring(0, 50) || 'No description'}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-text-secondary">{dist} km</p>
                      <p className="text-xs text-text-secondary">{timeAgo(inc.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-secondary text-sm py-4 text-center">No recent incidents in your area. Stay safe!</p>
          )}
        </Card>
      </main>
    </div>
  );
}
