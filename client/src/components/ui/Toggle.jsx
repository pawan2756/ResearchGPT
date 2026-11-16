import React from 'react';

export function Toggle({ checked, onChange, label, disabled = false, id }) {
  const toggleId = id || Math.random().toString(36).substring(2, 9);

  return (
    <label
      htmlFor={toggleId}
      className={`inline-flex items-center gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className="w-11 h-6 rounded-full transition-colors focus-ring"
          style={{
            backgroundColor: checked ? 'var(--primary)' : 'var(--surface-2)',
            border: '1px solid var(--border-strong)',
          }}
        />
        <div
          className="dot absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200"
          style={{
            backgroundColor: checked ? 'var(--text-on-primary)' : 'var(--text-muted)',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </div>
      {label && (
        <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
          {label}
        </span>
      )}
    </label>
  );
}
