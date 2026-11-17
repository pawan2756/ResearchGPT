import React from 'react';
import { Loader2, Square } from 'lucide-react';

export function StatusLine({ status, onCancel }) {
  if (!status) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2.5 text-[13px] py-1.5 px-3 rounded-full w-fit animate-pulse"
      style={{
        backgroundColor: 'var(--primary-soft)',
        color: 'var(--primary)',
        border: '1px solid var(--border)',
      }}
    >
      <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
      <span className="font-medium">{status}</span>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded transition-all cursor-pointer ml-1 hover:opacity-80"
          style={{
            backgroundColor: 'var(--surface)',
            color: 'var(--danger-text)',
            border: '1px solid var(--border)',
          }}
          title="Stop research stream"
        >
          <Square className="w-2.5 h-2.5 fill-current" />
          <span>Stop</span>
        </button>
      )}
    </div>
  );
}
