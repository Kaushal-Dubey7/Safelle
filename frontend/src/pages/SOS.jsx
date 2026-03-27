import { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AlertTriangle, Check, Phone, WifiOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import { sosService } from '../services/sosService';
import { userService } from '../services/userService';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui';
import axios from 'axios';

export default function SOS() {
  const { user } = useAuth();
  const { lat, lng } = useGeolocation();
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | cancelled
  const [sentMessage, setSentMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const holdRef = useRef(null);
  const startRef = useRef(0);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile().then(r => r.data),
  });

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  const sosMutation = useMutation({
    mutationFn: async () => {
      let address = 'Unknown location';
      try {
        const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
          headers: { 'User-Agent': 'SAFELLE/1.0' }
        });
        address = data.display_name || address;
      } catch {}
      return sosService.triggerSOS({ lat, lng, address }).then(r => r.data);
    },
    onSuccess: (data) => {
      setStatus('sent');
      setSentMessage(data.message);
      toast.success('Emergency alerts sent!');
    },
    onError: () => {
      setStatus('idle');
      toast.error('Failed to send SOS. Please try again.');
    },
  });

  const startHold = useCallback(() => {
    if (status === 'sent') return;
    setIsHolding(true);
    setStatus('idle');
    startRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startRef.current;
      const progress = Math.min(elapsed / 3000, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        setIsHolding(false);
        setStatus('sending');
        sosMutation.mutate();
        return;
      }
      holdRef.current = requestAnimationFrame(animate);
    };
    holdRef.current = requestAnimationFrame(animate);
  }, [status, sosMutation]);

  const endHold = useCallback(() => {
    if (holdRef.current) cancelAnimationFrame(holdRef.current);
    if (isHolding && holdProgress < 1) {
      setHoldProgress(0);
      setIsHolding(false);
      if (holdProgress > 0.1) {
        setStatus('cancelled');
        setTimeout(() => setStatus('idle'), 2000);
      }
    }
  }, [isHolding, holdProgress]);

  const contacts = profile?.contacts || user?.contacts || [];
  const circumference = 2 * Math.PI * 92;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="pt-16 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-danger mb-2 flex items-center justify-center gap-2">
            <AlertTriangle className="w-7 h-7" /> Emergency Alert
          </h1>
          <p className="text-text-secondary text-sm mb-10">
            Press and hold the button for 3 seconds to send alert to your trusted contacts.
          </p>

          {!isOnline && (
            <div className="mb-6 p-3 bg-warning/10 border border-warning/30 rounded-btn flex items-center gap-2 text-warning text-sm">
              <WifiOff className="w-4 h-4 shrink-0" />
              No connection. SOS will send when you're back online.
            </div>
          )}

          {/* SOS Button */}
          <div className="relative inline-flex items-center justify-center mb-8">
            {/* Pulse rings */}
            {(isHolding || status === 'idle') && status !== 'sent' && (
              <>
                <div className="absolute w-52 h-52 rounded-full border border-danger/20 pulse-ring" />
                <div className="absolute w-64 h-64 rounded-full border border-danger/10 pulse-ring" style={{ animationDelay: '0.5s' }} />
              </>
            )}

            {/* Progress ring */}
            <svg className="absolute w-52 h-52" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="4" />
              <circle cx="100" cy="100" r="92" fill="none" stroke="#EF4444" strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - holdProgress)}
                strokeLinecap="round" transform="rotate(-90 100 100)"
                style={{ transition: isHolding ? 'none' : 'stroke-dashoffset 0.3s ease' }} />
            </svg>

            {/* Button */}
            <button
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              disabled={status === 'sending'}
              className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center text-white font-bold text-2xl transition-all duration-300 select-none touch-none ${
                status === 'sent'
                  ? 'bg-success shadow-none'
                  : status === 'sending'
                    ? 'bg-danger/80 animate-pulse'
                    : 'bg-danger hover:bg-red-600 active:scale-95'
              }`}
              style={{ boxShadow: status === 'sent' ? '0 0 40px rgba(16,185,129,0.4)' : '0 0 40px rgba(239,68,68,0.6)' }}
            >
              {status === 'sending' ? (
                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : status === 'sent' ? (
                <Check className="w-16 h-16" strokeWidth={3} />
              ) : (
                <>
                  <span className="text-4xl">SOS</span>
                  <span className="text-xs font-normal mt-1 opacity-75">Hold 3 sec</span>
                </>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {status === 'cancelled' && (
            <p className="text-warning text-sm mb-4 animate-pulse">Alert cancelled.</p>
          )}
          {status === 'sending' && (
            <p className="text-text-secondary text-sm mb-4">Sending alerts...</p>
          )}
          {status === 'sent' && (
            <div className="mb-6">
              <p className="text-success font-semibold mb-1">✓ Alert Sent!</p>
              <p className="text-text-secondary text-sm">{sentMessage}</p>
              <p className="text-text-secondary text-xs mt-1">{new Date().toLocaleString('en-IN')}</p>
              <button onClick={() => { setStatus('idle'); setHoldProgress(0); }}
                className="mt-4 btn-secondary text-success border-success/30 hover:bg-success/10 text-sm px-6 py-2">
                I'm Safe
              </button>
            </div>
          )}

          {/* Trusted Contacts */}
          <Card className="text-left mt-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent-pink" />
              Trusted Contacts ({contacts.length})
            </h3>
            {contacts.length > 0 ? (
              <div className="space-y-2">
                {contacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="text-text-primary">{c.name}</span>
                    <span className="text-text-secondary text-xs">{c.phone}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-xs">No contacts set. <a href="/profile" className="text-accent-pink hover:underline">Add contacts</a></p>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
