import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { InstallPWA } from '../components/InstallPWA';
import { useAuth } from '../hooks/useAuth';

export const DashboardLayout = ({ role: roleProp, children }) => {
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const layoutRole = roleProp || role;

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Desktop sidebar (>= lg) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30">
        <Sidebar role={layoutRole} />
      </div>

      {/* Mobile drawer (< lg) */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 animate-slide-up">
            <Sidebar role={layoutRole} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main
          className="flex-1 px-4 sm:px-6 lg:px-6 pt-4 lg:pt-6 pb-4 lg:pb-6 max-w-full overflow-x-hidden"
          style={{
            paddingBottom:
              'max(var(--bn, 7.5rem), calc(env(safe-area-inset-bottom) + 6rem))',
          }}
        >
          {children || <Outlet />}
        </main>

        {/* iOS-style bottom tab bar (mobile only) */}
        <MobileBottomNav role={layoutRole} />

        {/* Install app button / iOS hint */}
        <InstallPWA />
      </div>
    </div>
  );
};
