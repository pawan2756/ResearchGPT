import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';

export function ErrorState({ message, onRetry, className = '' }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 rounded-[12px] ${className}`}
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--danger-text)',
      }}
    >
      <div
        className="p-3 rounded-full mb-3"
        style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)' }}
      >
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-[18px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
        Something went wrong
      </h3>
      <p className="text-[14px] max-w-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        {message || 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="md">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}
