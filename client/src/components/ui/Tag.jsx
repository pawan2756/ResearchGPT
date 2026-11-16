import React from 'react';

export function Tag({ children, variant = 'default', size = 'sm', className = '', ...props }) {
  const variantStyles = {
    default: {
      backgroundColor: 'var(--surface-2)',
      color: 'var(--text-muted)',
      border: '1px solid var(--border)',
    },
    success: {
      backgroundColor: 'var(--success-bg)',
      color: 'var(--success-text)',
    },
    warning: {
      backgroundColor: 'var(--warning-bg)',
      color: 'var(--warning-text)',
    },
    danger: {
      backgroundColor: 'var(--danger-bg)',
      color: 'var(--danger-text)',
    },
    info: {
      backgroundColor: 'var(--info-bg)',
      color: 'var(--info-text)',
    },
    primary: {
      backgroundColor: 'var(--primary-soft)',
      color: 'var(--primary)',
    },
  };

  const sizeClasses = {
    xs: 'text-[11px] px-2 py-0.5',
    sm: 'text-[12px] px-2.5 py-0.5',
    md: 'text-[13px] px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full select-none ${sizeClasses[size] || sizeClasses.sm} ${className}`}
      style={variantStyles[variant] || variantStyles.default}
      {...props}
    >
      {children}
    </span>
  );
}
