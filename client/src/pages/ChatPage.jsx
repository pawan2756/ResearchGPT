import React from 'react';
import { AppShell } from '../components/layout/AppShell.jsx';

export function ChatPage() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-[22px] font-semibold mb-2">ResearchGPT Chat</h2>
        <p style={{ color: 'var(--text-muted)' }}>Ask first, research on consent.</p>
      </div>
    </AppShell>
  );
}
