import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, helper, className = '', id, type = 'text', ...rest },
  ref
) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        type={type}
        className={`input ${error ? '!border-rose-500 focus:!ring-rose-500/30 focus:!border-rose-500' : ''} ${className}`}
        {...rest}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
      ) : helper ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
      ) : null}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, className = '', id, rows = 3, ...rest },
  ref
) {
  const inputId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        className={`input resize-none ${error ? '!border-rose-500 focus:!ring-rose-500/30 focus:!border-rose-500' : ''} ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, className = '', id, children, ...rest },
  ref
) {
  const inputId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <select
        id={inputId}
        ref={ref}
        className={`input ${error ? '!border-rose-500 focus:!ring-rose-500/30 focus:!border-rose-500' : ''} ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
});
