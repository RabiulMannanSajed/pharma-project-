export const Badge = ({ children, color = 'slate', className = '' }) => {
  const colors = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    brand: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    red: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  };
  return <span className={`badge ${colors[color] || colors.slate} ${className}`}>{children}</span>;
};