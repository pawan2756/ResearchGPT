import React from 'react';
import { Sidebar } from './Sidebar.jsx';

export function AppShell({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
