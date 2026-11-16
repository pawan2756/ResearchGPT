import React from 'react';
import { AppShell } from '../components/layout/AppShell.jsx';

export function SettingsPage() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col p-4">
        <h2 className="text-[22px] font-semibold mb-2">Settings</h2>
        <p style={{ color: 'var(--text-muted)' }}>Configure search depth, domain filters, and theme preferences.</p>
      </div>
    </AppShell>
  );
}
