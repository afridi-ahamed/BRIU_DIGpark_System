import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import LiveMapPage from './pages/LiveMapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import MemberPortalPage from './pages/MemberPortalPage';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/auth';
import { RoleContext } from './context/RoleContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ui/ToastContainer';

const ProtectedRoutes = () => {
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  return (
    <RoleContext.Provider value={{ role: user.role }}>
      <DashboardLayout>
        <Routes>
          {user.role === 'superadmin' ? (
            <>
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="/admin" element={<SuperAdminDashboard />} />
              <Route path="/terminal" element={<LiveMapPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </>
          ) : user.role === 'member' ? (
            <>
              <Route path="/" element={<Navigate to="/member" replace />} />
              <Route path="/member" element={<MemberPortalPage />} />
              <Route path="*" element={<Navigate to="/member" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<LiveMapPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </DashboardLayout>
    </RoleContext.Provider>
  );
};

const AppRoutes = () => {
  return (
    <ToastProvider>
      {/* ToastContainer renders toasts over everything at z-[99999] */}
      <ToastContainer />
      <AuthProvider>
        <ProtectedRoutes />
      </AuthProvider>
    </ToastProvider>
  );
};

export default AppRoutes;
