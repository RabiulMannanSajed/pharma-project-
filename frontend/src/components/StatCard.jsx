import { Card } from './ui/Card';

export const StatCard = ({ icon: Icon, label, value, hint, color = 'brand', trend }) => {
  const colors = {
    brand: 'from-brand-500 to-brand-600 text-white',
    emerald: 'from-emerald-500 to-emerald-600 text-white',
    sky: 'from-sky-500 to-sky-600 text-white',
    amber: 'from-amber-500 to-amber-600 text-white',
    rose: 'from-rose-500 to-rose-600 text-white',
    violet: 'from-violet-500 to-violet-600 text-white',
  };

  return (
    <Card padding="p-5" className="overflow-hidden relative">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">{value}</p>
          {(hint || trend) && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint || trend}</p>
          )}
        </div>
        {Icon && (
          <div className={`shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${colors[color] || colors.brand} shadow-sm`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
};