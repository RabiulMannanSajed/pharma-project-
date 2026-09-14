export const Card = ({ children, className = '', title, action, padding = 'p-5' }) => {
  return (
    <div className={`card ${padding} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
};