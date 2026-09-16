import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, BarChart3, Users, CalendarCheck,
  TrendingUp, UserCircle, Settings, PlusCircle, Receipt,
  MoreHorizontal, LogOut, Pill, X,
} from 'lucide-react';
import { ADMIN_NAV, SALESMAN_NAV, ROLES } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

const ICON_MAP = {
  LayoutDashboard, ShoppingCart, BarChart3, Users, CalendarCheck,
  TrendingUp, UserCircle, Settings, PlusCircle, Receipt,
};

// 4 primary tabs + a centered FAB for salesman ("Add Sale"). Rest lives in "More".
const PRIMARY_PER_ROLE = {
  [ROLES.ADMIN]: {
    primary: ['Dashboard', 'Sales', 'Attendance', 'Sales Reports'],
    fab: { label: 'Salesmen', icon: 'Users', path: '/admin/salesmen' },
  },
  [ROLES.SALESMAN]: {
    primary: ['Dashboard', 'My Sales', 'Attendance', 'Sales Report'],
    fab: { label: 'Add Sale', icon: 'PlusCircle', path: '/salesman/add-sale' },
  },
};

export const MobileBottomNav = ({ role }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const items = role === ROLES.ADMIN ? ADMIN_NAV : SALESMAN_NAV;
  const cfg = PRIMARY_PER_ROLE[role];
  const primary = items.filter((i) => cfg?.primary.includes(i.label));
  const fabItem = items.find((i) => i.label === cfg?.fab?.label);
  const secondary = items.filter(
    (i) => !cfg?.primary.includes(i.label) && i.label !== cfg?.fab?.label
  );

  const moreActive = secondary.some((i) => location.pathname.startsWith(i.path));

  return (
    <>
      {/* Bottom tab bar — iOS 17 style: translucent, blurred, with raised FAB slot in the middle */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40"
        aria-label="Primary"
      >
        {/* The bg + blur layer; FAB sits on top in front of this bar */}
        <div
          className="absolute inset-0 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-700/70"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        />

        {/* Top hairline accent on active state */}
        <div className="relative h-[68px] grid grid-cols-5 max-w-screen-md mx-auto">
          {primary.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutDashboard;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="group flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform duration-150"
                aria-label={item.label}
              >
                {/* Active background pill */}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 top-1 bottom-1 rounded-2xl bg-brand-50 dark:bg-brand-900/30 -z-10"
                  />
                )}
                <Icon
                  className={`relative h-[22px] w-[22px] transition-colors ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={`relative text-[10px] leading-none transition-colors truncate max-w-[60px] ${
                    isActive
                      ? 'text-brand-700 dark:text-brand-300 font-semibold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* More */}
          <button
            onClick={() => setMoreOpen(true)}
            className="relative flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform duration-150"
            aria-label="More"
          >
            {moreActive && (
              <span
                aria-hidden
                className="absolute inset-x-2 top-1 bottom-1 rounded-2xl bg-brand-50 dark:bg-brand-900/30 -z-10"
              />
            )}
            <MoreHorizontal
              className={`h-[22px] w-[22px] ${
                moreActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              strokeWidth={moreActive ? 2.5 : 1.8}
            />
            <span
              className={`text-[10px] leading-none ${
                moreActive
                  ? 'text-brand-700 dark:text-brand-300 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              More
            </span>
          </button>
        </div>

        {/* Floating Action Button (raised center slot) */}
        {fabItem && (
          <NavLink
            to={fabItem.path}
            aria-label={fabItem.label}
            className="absolute left-1/2 -translate-x-1/2 -top-6 z-10"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 ring-4 ring-white dark:ring-slate-900 active:scale-95 transition-transform">
              {(() => {
                const Icon = ICON_MAP[cfg.fab.icon] || PlusCircle;
                return <Icon className="h-7 w-7" strokeWidth={2.4} />;
              })()}
            </span>
          </NavLink>
        )}
      </nav>

      {/* More sheet — iOS bottom sheet */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="absolute bottom-0 inset-x-0 bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-semibold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || '—'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 active:scale-95 transition"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700" />

            {/* Quick actions grid (the secondary nav as iOS-style icon grid) */}
            {secondary.length > 0 && (
              <div className="px-4 pt-4 pb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 pb-2">
                  Menu
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {secondary.map((item) => {
                    const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMoreOpen(false)}
                        className="flex flex-col items-center gap-1.5 active:scale-95 transition"
                      >
                        <span
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center transition ${
                            isActive
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <Icon className="h-6 w-6" strokeWidth={1.8} />
                        </span>
                        <span
                          className={`text-[11px] leading-none text-center max-w-[64px] truncate ${
                            isActive
                              ? 'text-brand-700 dark:text-brand-300 font-semibold'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Logout */}
            <div className="border-t border-slate-200 dark:border-slate-700 mt-3 p-3">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 active:scale-[0.98] transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
