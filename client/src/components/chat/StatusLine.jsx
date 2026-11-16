import React from 'react';
import { Loader2 } from 'lucide-react';

export function StatusLine({ status }) {
  if (!status) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 text-[13px] py-1.5 px-3 rounded-full w-fit animate-pulse"
      style={{
        backgroundColor: 'var(--primary-soft)',
        color: 'var(--primary)',
        border: '1px solid var(--border)',
      }}
    >
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
      <span className="font-medium">{status}</span>
    </div>
  );
}
