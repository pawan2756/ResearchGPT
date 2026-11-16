import React from 'react';

export function Card({ children, className = '', style = {}, ...props }) {
  return (
    <div
      className={`rounded-[12px] p-4 ${className}`}
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
