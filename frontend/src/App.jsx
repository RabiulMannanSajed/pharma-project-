import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRedirect } from './components/RoleRedirect';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Spinner } from './components/ui/Spinner';
import { ROLES } from './utils/constants';

const Login = lazy(() => import('./pages/Login.jsx'));
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword.jsx'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const AdminSales = lazy(() => import('./pages/admin/Sales.jsx'));
const AdminReports = lazy(() => import('./pages/admin/Reports.jsx'));
const AdminSalesmen = lazy(() => import('./pages/admin/Salesmen.jsx'));
const AdminSalesmanProfile = lazy(() => import('./pages/admin/SalesmanProfile.jsx'));
const AdminAttendance = lazy(() => import('./pages/admin/Attendance.jsx'));
const AdminPerformance = lazy(() => import('./pages/admin/Performance.jsx'));
const AdminProfile = lazy(() => import('./pages/admin/Profile.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/Settings.jsx'));

const SalesmanDashboard = lazy(() => import('./pages/salesman/Dashboard.jsx'));
const AddSale = lazy(() => import('./pages/salesman/AddSale.jsx'));
const MySales = lazy(() => import('./pages/salesman/MySales.jsx'));
const SalesReport = lazy(() => import('./pages/salesman/SalesReport.jsx'));
const Attendance = lazy(() => import('./pages/salesman/Attendance.jsx'));
const SalesmanProfile = lazy(() => import('./pages/salesman/Profile.jsx'));
const SalesmanSettings = lazy(() => import('./pages/salesman/Settings.jsx'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ChangePassword />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <DashboardLayout role={ROLES.ADMIN} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="salesmen" element={<AdminSalesmen />} />
          <Route path="salesmen/:id" element={<AdminSalesmanProfile />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="performance" element={<AdminPerformance />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Salesman routes */}
        <Route
          path="/salesman"
          element={
            <ProtectedRoute roles={[ROLES.SALESMAN]}>
              <DashboardLayout role={ROLES.SALESMAN} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SalesmanDashboard />} />
          <Route path="add-sale" element={<AddSale />} />
          <Route path="my-sales" element={<MySales />} />
          <Route path="reports" element={<SalesReport />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="profile" element={<SalesmanProfile />} />
          <Route path="settings" element={<SalesmanSettings />} />
        </Route>

        <Route path="/" element={<RoleRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;