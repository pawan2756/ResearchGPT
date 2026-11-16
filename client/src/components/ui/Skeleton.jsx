import React from 'react';

export function Skeleton({ className = '', width, height, rounded = 'rounded-[8px]' }) {
  return (
    <div
      className={`animate-pulse ${rounded} ${className}`}
      style={{
        backgroundColor: 'var(--surface-2)',
        width: width || '100%',
        height: height || '1rem',
      }}
    />
  );
}
