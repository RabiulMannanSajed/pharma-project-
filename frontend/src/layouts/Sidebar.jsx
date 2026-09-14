import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ADMIN_NAV, SALESMAN_NAV, ROLES } from '../utils/constants';
import { LogOut, Pill, X } from 'lucide-react';

import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Users,
  CalendarCheck,
  TrendingUp,
  UserCircle,
  Settings,
  PlusCircle,
  Receipt,
} from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Users,
  CalendarCheck,
  TrendingUp,
  UserCircle,
  Settings,
  PlusCircle,
  Receipt,
};

export const Sidebar = ({ role, onClose }) => {
  const { user, logout } = useAuth();
  const items = role === ROLES.ADMIN ? ADMIN_NAV : SALESMAN_NAV;

  return (
    <aside className="h-full flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 w-64 shrink-0">
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-600 text-white">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">Pharma Sales</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
              {role === ROLES.ADMIN ? 'Admin Panel' : 'Salesman Portal'}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutDashboard;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 dark:border-slate-700 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 mb-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};