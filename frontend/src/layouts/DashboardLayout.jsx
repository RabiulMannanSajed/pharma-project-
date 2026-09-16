import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from '../components/MobileBottomNav';
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
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30">
        <Sidebar role={layoutRole} />
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 animate-slide-up">
            <Sidebar role={layoutRole} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content — extra bottom padding on mobile so the bottom nav never overlaps anything */}
        <main
          className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden"
          style={{ paddingBottom: 'max(6rem, calc(env(safe-area-inset-bottom) + 5rem))' }}
        >
          {children || <Outlet />}
        </main>

        {/* iOS-style bottom tab bar (mobile only) */}
        <MobileBottomNav role={layoutRole} />
      </div>
    </div>
  );
};
