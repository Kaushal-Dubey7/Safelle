import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  Shield, AlertTriangle, Users, CheckCircle, MapPin, FileWarning,
  Check, X, Trash2, ChevronLeft, ChevronRight, Bell
} from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { adminService } from '../services/routeService';
import { Navbar } from '../components/layout/Navbar';
import { Card, Badge, Button, Spinner, PageLoader } from '../components/ui';
import { SafelleMap } from '../components/map/SafelleMap';
import { HeatmapLayer } from '../components/map/HeatmapLayer';
import { IncidentMarker } from '../components/map/IncidentMarker';
import { INCIDENT_TYPE_CONFIG, timeAgo, formatDate } from '../utils/formatters';

const CHART_COLORS = ['#E91E8C', '#7C3AED', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#94A3B8'];

export default function AdminDashboard() {
  const { on, emit } = useSocket();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('overview');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [sosAlert, setSosAlert] = useState(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getStats().then(r => r.data),
  });

  const { data: incidentsData, isLoading: incidentsLoading } = useQuery({
    queryKey: ['adminIncidents', page, typeFilter, verifiedFilter],
    queryFn: () => adminService.getIncidents({ page, limit: 10, type: typeFilter || undefined, verified: verifiedFilter || undefined }).then(r => r.data),
  });

  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminService.getUsers().then(r => r.data),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, verified }) => adminService.verifyIncident(id, { verified }),
    onSuccess: () => { queryClient.invalidateQueries(['adminIncidents']); queryClient.invalidateQueries(['adminStats']); toast.success('Incident updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteIncident(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminIncidents']); queryClient.invalidateQueries(['adminStats']); toast.success('Incident deleted'); },
  });

  // Join admin room and listen for SOS
  useEffect(() => {
    emit('join_admin');
    const cleanup = on('sos_triggered', (data) => {
      setSosAlert(data);
      toast.error(`SOS Alert from ${data.user?.name}!`, { duration: 10000 });
    });
    return cleanup;
  }, [on, emit]);

  const sidebarItems = [
    { key: 'overview', label: 'Overview', icon: Shield },
    { key: 'reports', label: 'Reports', icon: FileWarning },
    { key: 'map', label: 'Map', icon: MapPin },
    { key: 'users', label: 'Users', icon: Users },
  ];

  const byTypeData = stats ? Object.entries(stats.incidentsByType || {}).map(([type, count]) => ({
    name: INCIDENT_TYPE_CONFIG[type]?.label || type, count, fill: INCIDENT_TYPE_CONFIG[type]?.color || '#94A3B8',
  })) : [];

  const verifiedData = stats ? [
    { name: 'Verified', value: stats.verifiedIncidents, color: '#10B981' },
    { name: 'Pending', value: stats.totalIncidents - stats.verifiedIncidents, color: '#F59E0B' },
  ] : [];

  const heatmapPoints = incidentsData?.incidents?.map(i => {
    const [lng, lat] = i.location?.coordinates || [0, 0];
    return [lat, lng, (i.severity || 3) / 5];
  }) || [];

  if (statsLoading) return <><Navbar /><PageLoader /></>;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      {/* SOS Alert Banner */}
      {sosAlert && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-danger/95 backdrop-blur-sm px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-white animate-bounce" />
              <div>
                <p className="text-white font-semibold text-sm">SOS Alert: {sosAlert.user?.name}</p>
                <p className="text-white/80 text-xs">{sosAlert.location?.address} • {new Date(sosAlert.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setActiveSection('map'); setSosAlert(null); }} className="px-3 py-1.5 bg-white/20 text-white rounded-btn text-xs font-medium hover:bg-white/30">View on Map</button>
              <button onClick={() => setSosAlert(null)} className="px-2 py-1.5 text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16 flex" style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <div className="w-56 bg-bg-surface border-r border-border shrink-0 p-4 hidden md:block">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-accent-glow flex items-center justify-center text-white text-xs font-bold">SA</div>
            <span className="font-bold gradient-text">Admin</span>
          </div>
          <nav className="space-y-1">
            {sidebarItems.map(item => (
              <button key={item.key} onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-btn text-sm font-medium transition-all ${
                  activeSection === item.key
                    ? 'text-accent-pink bg-accent-pink/10 border-l-2 border-accent-pink'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}>
                <item.icon className="w-4 h-4" />{item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Mobile tabs */}
          <div className="flex gap-1 md:hidden mb-4 overflow-x-auto">
            {sidebarItems.map(item => (
              <button key={item.key} onClick={() => setActiveSection(item.key)}
                className={`px-3 py-2 rounded-btn text-xs font-medium whitespace-nowrap ${
                  activeSection === item.key ? 'bg-accent-pink/20 text-accent-pink' : 'text-text-secondary'
                }`}>{item.label}</button>
            ))}
          </div>

          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Incidents', value: stats?.totalIncidents || 0, icon: FileWarning, color: '#E91E8C' },
                  { label: 'Total SOS', value: stats?.totalSOS || 0, icon: AlertTriangle, color: '#EF4444' },
                  { label: 'Verified', value: stats?.verifiedIncidents || 0, icon: CheckCircle, color: '#10B981' },
                  { label: 'Active Users', value: stats?.totalUsers || 0, icon: Users, color: '#7C3AED' },
                ].map(stat => (
                  <Card key={stat.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                      <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <div><p className="text-2xl font-bold">{stat.value}</p><p className="text-xs text-text-secondary">{stat.label}</p></div>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <h3 className="text-sm font-semibold mb-4">Incidents by Type</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={byTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#1C1F35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#F1F5F9' }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {byTypeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 className="text-sm font-semibold mb-4">Reports - Last 7 Days</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={stats?.incidentsLast7Days || []}>
                      <defs>
                        <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E91E8C" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#E91E8C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#1C1F35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#F1F5F9' }} />
                      <Area type="monotone" dataKey="count" stroke="#E91E8C" fill="url(#pinkGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 className="text-sm font-semibold mb-4">Verification Status</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={verifiedData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {verifiedData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1C1F35', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#F1F5F9' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {verifiedData.map(d => (
                      <span key={d.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.name}: {d.value}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <Card>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold">All Reports</h3>
                <div className="flex gap-2 flex-wrap">
                  <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                    className="input-field text-xs py-1.5 px-3 w-auto">
                    <option value="">All Types</option>
                    {Object.entries(INCIDENT_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select value={verifiedFilter} onChange={e => { setVerifiedFilter(e.target.value); setPage(1); }}
                    className="input-field text-xs py-1.5 px-3 w-auto">
                    <option value="">All Status</option>
                    <option value="true">Verified</option>
                    <option value="false">Pending</option>
                  </select>
                </div>
              </div>

              {incidentsLoading ? <Spinner /> : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-text-secondary">
                          <th className="text-left py-3 px-2 font-medium">Type</th>
                          <th className="text-left py-3 px-2 font-medium">Severity</th>
                          <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Reporter</th>
                          <th className="text-left py-3 px-2 font-medium hidden lg:table-cell">Time</th>
                          <th className="text-left py-3 px-2 font-medium">Status</th>
                          <th className="text-right py-3 px-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incidentsData?.incidents?.map(inc => {
                          const config = INCIDENT_TYPE_CONFIG[inc.type] || INCIDENT_TYPE_CONFIG.other;
                          return (
                            <tr key={inc._id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                              <td className="py-3 px-2"><Badge color={config.color} bg={config.bg}>{config.label}</Badge></td>
                              <td className="py-3 px-2">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <span key={i} style={{ color: i < inc.severity ? '#E91E8C' : '#4B5563' }}>★</span>
                                ))}
                              </td>
                              <td className="py-3 px-2 hidden md:table-cell text-text-secondary text-xs">{inc.reportedBy?.name || 'Anonymous'}</td>
                              <td className="py-3 px-2 hidden lg:table-cell text-text-secondary text-xs">{timeAgo(inc.timestamp)}</td>
                              <td className="py-3 px-2">
                                <Badge color={inc.verified ? '#10B981' : '#F59E0B'}>{inc.verified ? 'Verified' : 'Pending'}</Badge>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {!inc.verified && (
                                    <button onClick={() => verifyMutation.mutate({ id: inc._id, verified: true })}
                                      className="p-1.5 text-success hover:bg-success/10 rounded transition-colors" title="Verify">
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                  {inc.verified && (
                                    <button onClick={() => verifyMutation.mutate({ id: inc._id, verified: false })}
                                      className="p-1.5 text-warning hover:bg-warning/10 rounded transition-colors" title="Unverify">
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button onClick={() => deleteMutation.mutate(inc._id)}
                                    className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {incidentsData && (
                    <div className="flex items-center justify-between mt-4 text-sm text-text-secondary">
                      <span>Page {incidentsData.page} of {incidentsData.totalPages}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                          className="p-2 hover:bg-white/5 rounded-btn disabled:opacity-30 transition-colors">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPage(p => Math.min(incidentsData.totalPages, p + 1))} disabled={page >= incidentsData.totalPages}
                          className="p-2 hover:bg-white/5 rounded-btn disabled:opacity-30 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}

          {activeSection === 'map' && (
            <Card className="p-0 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
              <SafelleMap center={[28.6139, 77.2090]} zoom={12}>
                <HeatmapLayer points={heatmapPoints} />
                {incidentsData?.incidents?.map(inc => <IncidentMarker key={inc._id} incident={inc} />)}
              </SafelleMap>
            </Card>
          )}

          {activeSection === 'users' && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">All Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-text-secondary">
                      <th className="text-left py-3 px-2 font-medium">Name</th>
                      <th className="text-left py-3 px-2 font-medium">Email</th>
                      <th className="text-left py-3 px-2 font-medium">Role</th>
                      <th className="text-left py-3 px-2 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map(u => (
                      <tr key={u._id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 font-medium">{u.name}</td>
                        <td className="py-3 px-2 text-text-secondary">{u.email}</td>
                        <td className="py-3 px-2"><Badge color={u.role === 'admin' ? '#E91E8C' : '#7C3AED'}>{u.role}</Badge></td>
                        <td className="py-3 px-2 text-text-secondary text-xs">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
