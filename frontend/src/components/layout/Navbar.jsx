import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';
import {
  MapPin, Navigation, AlertTriangle, FileWarning, User,
  LogOut, Menu, X, Bell, Shield, LayoutDashboard
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { path: '/map', label: 'Map', icon: MapPin },
    { path: '/navigate', label: 'Navigate', icon: Navigation },
    { path: '/report', label: 'Report', icon: FileWarning },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ path: '/admin', label: 'Admin', icon: Shield });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-bg-elevated border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-accent-glow flex items-center justify-center text-white font-bold text-sm">
            SA
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text">FELLE</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium transition-all duration-200 ${
                location.pathname === link.path
                  ? 'text-accent-pink bg-accent-pink/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <Link to="/sos" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-danger/20 text-danger rounded-btn text-sm font-semibold hover:bg-danger/30 transition-colors">
            <AlertTriangle className="w-4 h-4" />
            SOS
          </Link>

          <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent-pink rounded-full" />
          </button>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-accent-glow flex items-center justify-center text-white text-sm font-semibold hover:shadow-glow-pink transition-shadow"
            >
              {user?.profilePicUrl ? (
                <img src={user.profilePicUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(user?.name || 'User')
              )}
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-bg-elevated border border-border rounded-card shadow-card z-50 py-1">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 w-full transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden p-2 text-text-secondary" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-30">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 w-64 h-full bg-bg-elevated border-l border-border p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-btn text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-accent-pink bg-accent-pink/10'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
            <Link to="/sos" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-danger rounded-btn text-sm font-semibold">
              <AlertTriangle className="w-5 h-5" /> SOS Alert
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
