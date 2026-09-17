import { forwardRef } from 'react';

/**
 * Styled <select> matching the design system (Input look-and-feel).
 * Pass options as [{ value, label }] or a plain string[].
 */
const Select = forwardRef(function Select(
  {
    name,
    value,
    onChange,
    options = [],
    label,
    error,
    help,
    required,
    disabled,
    className = '',
    ...rest
  },
  ref
) {
  const base =
    'block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 ' +
    'border-slate-300 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30 ' +
    'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 ' +
    'dark:focus:border-emerald-400 dark:focus:ring-emerald-400/30 disabled:opacity-60 disabled:cursor-not-allowed';

  const errorClass = error
    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500'
    : '';

  const opts = options.map((o) => {
    if (o && typeof o === 'object') {
      return (
        <option key={String(o.value)} value={o.value}>
          {o.label}
        </option>
      );
    }
    return (
      <option key={String(o)} value={o}>
        {o}
      </option>
    );
  });

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`${base} ${errorClass}`}
        {...rest}
      >
        {opts}
      </select>
      {help && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{help}</p>
      )}
      {error && (
        <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
});

export { Select };
export default Select;
