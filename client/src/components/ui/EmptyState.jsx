import React from 'react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-[12px] ${className}`}
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px dashed var(--border-strong)',
      }}
    >
      {Icon && (
        <div
          className="p-3 rounded-full mb-3"
          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)' }}
        >
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-[18px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-[14px] max-w-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
}
