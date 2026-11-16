import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--success-text)' }} />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--danger-text)' }} />,
    warning: <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--warning-text)' }} />,
    info: <Info className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--info-text)' }} />,
  };

  const bgStyles = {
    success: { backgroundColor: 'var(--surface)', border: '1px solid var(--success-text)' },
    error: { backgroundColor: 'var(--surface)', border: '1px solid var(--danger-text)' },
    warning: { backgroundColor: 'var(--surface)', border: '1px solid var(--warning-text)' },
    info: { backgroundColor: 'var(--surface)', border: '1px solid var(--border-strong)' },
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-[12px] shadow-lg max-w-sm transition-all animate-in fade-in slide-in-from-bottom-4"
      style={bgStyles[type] || bgStyles.info}
    >
      {icons[type] || icons.info}
      <span className="text-[14px] flex-1" style={{ color: 'var(--text)' }}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded hover:opacity-80 transition-opacity"
          aria-label="Close notification"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
