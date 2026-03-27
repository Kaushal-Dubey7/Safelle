import { Loader2 } from 'lucide-react';

export function Button({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-btn focus:outline-none focus:ring-2 focus:ring-accent-pink/50';
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-danger text-white hover:bg-red-600',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
      <input className={`input-field ${error ? 'border-danger' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div className={`${hover ? 'card-hover' : 'card'} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-bg-elevated rounded-card border border-border p-6 max-w-lg w-full shadow-card z-10 animate-in fade-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-2 border-border border-t-accent-pink rounded-full animate-spin`} />
    </div>
  );
}

export function Badge({ children, color = '#94A3B8', bg, className = '' }) {
  const bgColor = bg || `${color}20`;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ color, backgroundColor: bgColor }}
    >
      {children}
    </span>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto border-2 border-border border-t-accent-pink rounded-full animate-spin" />
        <p className="text-text-secondary text-sm">Loading...</p>
      </div>
    </div>
  );
}
