import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterCitizen from './pages/RegisterCitizen';
import ServiceCatalogue from './pages/citizen/ServiceCatalogue';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import RequestNew from './pages/citizen/RequestNew';
import RequestDetail from './pages/citizen/RequestDetail';
import CitizenProfile from './pages/citizen/CitizenProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import RequestManagement from './pages/admin/RequestManagement';
import RequestReview from './pages/admin/RequestReview';
import CitizenRegistry from './pages/admin/CitizenRegistry';
import ServiceManager from './pages/admin/ServiceManager';
import StaffManager from './pages/admin/StaffManager';
import AuditLogs from './pages/admin/AuditLogs';

// Protected Route wrappers
const ProtectedCitizenRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== 'citizen') return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
};

const ProtectedStaffLayout = () => {
  const { user, isAuthenticated, loading, isStaff } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isStaff) return <Navigate to="/citizen/dashboard" replace />;

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)]">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

const ProtectedAdminOnlyRoute = () => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterCitizen />} />
          <Route path="/services" element={<ServiceCatalogue />} />

          {/* Citizen Protected Routes */}
          <Route element={<ProtectedCitizenRoute />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/profile" element={<CitizenProfile />} />
            <Route path="/requests/new" element={<RequestNew />} />
            <Route path="/requests/:id" element={<RequestDetail />} />
          </Route>

          {/* Administrative Workspace Routes (Manager & Admin) */}
          <Route element={<ProtectedStaffLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/requests" element={<RequestManagement />} />
            <Route path="/admin/requests/:id" element={<RequestReview />} />
            <Route path="/admin/citizens" element={<CitizenRegistry />} />

            {/* Admin Only Routes */}
            <Route element={<ProtectedAdminOnlyRoute />}>
              <Route path="/admin/services" element={<ServiceManager />} />
              <Route path="/admin/staff" element={<StaffManager />} />
              <Route path="/admin/audit" element={<AuditLogs />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white text-xs py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <p className="font-bold text-slate-200">
              Mo9ata3a Smart • المقاطعة الذكية
            </p>
            <p className="text-slate-400 text-[11px]">
              Projet d'administration numérique fondé sur la stack MERN et l'extraction optique d'identité (CIN).
            </p>
          </div>
          <div className="text-slate-500 text-[11px] text-center sm:text-right">
            Conforme aux directives du Royaume du Maroc et de la CNDP (Loi 09-08).
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
