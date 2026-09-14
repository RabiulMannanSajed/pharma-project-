import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'No data', description, icon: Icon = Inbox, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-700/50 mb-3">
        <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};