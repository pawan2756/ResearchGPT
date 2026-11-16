import React from 'react';

export function ProgressBar({ value = 0, max = 100, label, className = '' }) {
  const percent = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
          <span>{label}</span>
          <span>{percent}%</span>
        </div>
      )}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor: 'var(--primary)',
          }}
        />
      </div>
    </div>
  );
}
