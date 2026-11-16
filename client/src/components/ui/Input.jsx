import React from 'react';

export function Input({
  label,
  error,
  type = 'text',
  id,
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[14px] font-medium"
          style={{ color: 'var(--text)' }}
        >
          {label} {required && <span style={{ color: 'var(--danger-text)' }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        className={`px-3 py-2 text-[15px] rounded-[8px] focus-ring w-full transition-colors ${className}`}
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--text)',
          border: error ? '1px solid var(--danger-text)' : '1px solid var(--border-strong)',
        }}
        {...props}
      />
      {error && (
        <span
          className="text-[12px] font-medium mt-0.5"
          style={{ color: 'var(--danger-text)' }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
