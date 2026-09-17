import { Menu, Moon, Sun, Bell, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useRefreshDashboard } from '../hooks/useRefreshDashboard.jsx';

export const Topbar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { refresh, isRefreshing, lastRefreshedAt } = useRefreshDashboard();

  return (
    <header
      className="sticky top-0 z-30 bg-white/85 dark:bg-slate-800/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-700"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="h-14 lg:h-16 flex items-center justify-between px-3 lg:px-6">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 active:scale-95 transition"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[15px] lg:text-base font-semibold text-slate-800 dark:text-slate-100 truncate">
              Welcome, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-[11px] lg:text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={refresh}
            disabled={isRefreshing}
            title={
              lastRefreshedAt
                ? `Last refreshed ${lastRefreshedAt.toLocaleTimeString()}`
                : 'Refresh all dashboard data'
            }
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 relative active:scale-95 transition disabled:opacity-60 disabled:cursor-progress"
            aria-label="Refresh dashboard"
          >
            <RefreshCw
              className={`h-5 w-5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`}
            />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 relative active:scale-95 transition"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
