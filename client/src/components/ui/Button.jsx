import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-[8px] transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeClasses = {
    sm: 'text-[12px] px-2.5 py-1.5 gap-1.5',
    md: 'text-[14px] px-4 py-2.5 gap-2',
    lg: 'text-[16px] px-5 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: 'var(--text-on-primary)',
    },
    secondary: {
      backgroundColor: 'var(--surface)',
      color: 'var(--text)',
      border: '1px solid var(--border-strong)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-muted)',
    },
    danger: {
      backgroundColor: 'var(--danger-bg)',
      color: 'var(--danger-text)',
      border: '1px solid var(--danger-text)',
    },
    soft: {
      backgroundColor: 'var(--primary-soft)',
      color: 'var(--primary)',
    },
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={variantStyles[variant] || variantStyles.primary}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : null}
      {children}
    </button>
  );
}
