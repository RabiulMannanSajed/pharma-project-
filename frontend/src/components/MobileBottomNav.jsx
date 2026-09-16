import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, BarChart3, Users, CalendarCheck, TrendingUp, UserCircle, Settings, PlusCircle, Receipt, MoreHorizontal, LogOut, Pill, X } from 'lucide-react';
import { ADMIN_NAV, SALESMAN_NAV, ROLES } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

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

// Primary 5 tabs shown in the bar; rest go inside a "More" sheet
const PRIMARY_PER_ROLE = {
  [ROLES.ADMIN]: ['Dashboard', 'Sales', 'Sales Reports', 'Attendance', 'Salesmen'],
  [ROLES.SALESMAN]: ['Dashboard', 'Add Sale', 'My Sales', 'Attendance', 'Sales Report'],
};

export const MobileBottomNav = ({ role }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const items = role === ROLES.ADMIN ? ADMIN_NAV : SALESMAN_NAV;
  const primaryLabels = PRIMARY_PER_ROLE[role] || items.slice(0, 5).map((i) => i.label);
  const primary = items.filter((i) => primaryLabels.includes(i.label));
  const secondary = items.filter((i) => !primaryLabels.includes(i.label));

  const isSecondaryActive = secondary.some((i) => location.pathname.startsWith(i.path));
  const moreActive = isSecondaryActive;

  return (
    <>
      {/* Bottom tab bar — iOS style with safe area */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-700/70"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-16 max-w-screen-md mx-auto">
          {primary.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutDashboard;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
                aria-label={item.label}
              >
                <Icon
                  className={`h-[22px] w-[22px] transition-colors ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] leading-none transition-colors ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
            aria-label="More"
          >
            <MoreHorizontal
              className={`h-[22px] w-[22px] ${
                moreActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              strokeWidth={moreActive ? 2.5 : 2}
            />
            <span
              className={`text-[10px] leading-none ${
                moreActive
                  ? 'text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* More sheet — slides up like iOS */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="absolute bottom-0 inset-x-0 bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl animate-slide-up"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-brand-600 text-white">
                  <Pill className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{role}</p>
                </div>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="px-2 py-2 max-h-[60vh] overflow-y-auto">
              {secondary.map((item) => {
                const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'text-slate-700 dark:text-slate-200 active:bg-slate-100 dark:active:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 p-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 active:bg-rose-50 dark:active:bg-rose-900/20"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
