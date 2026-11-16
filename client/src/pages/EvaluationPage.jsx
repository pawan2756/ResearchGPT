import React from 'react';
import { AppShell } from '../components/layout/AppShell.jsx';

export function EvaluationPage() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col p-4">
        <h2 className="text-[22px] font-semibold mb-2">Evaluation Benchmark</h2>
        <p style={{ color: 'var(--text-muted)' }}>40-question comparison: Direct vs Research mode.</p>
      </div>
    </AppShell>
  );
}
