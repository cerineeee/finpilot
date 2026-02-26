import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { Onboarding } from './pages/Onboarding/Onboarding';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Invoices } from './pages/Invoices/Invoices';
import { Analysis } from "./pages/Analysis/Analysis";

import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { VerifyEmail } from './pages/Auth/VerifyEmail';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { ResetPassword } from './pages/Auth/ResetPassword';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAppContext();

  if (state.isLoadingAuth) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><Loader2 className="animate-spin text-primary" size={48} /></div>;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!state.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAppContext();

  if (state.isLoadingAuth) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><Loader2 className="animate-spin text-primary" size={48} /></div>;
  }

  if (state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { state } = useAppContext();

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

        {/* Protected Routes */}
        <Route path="/onboarding" element={
          state.isOnboarded ? <Navigate to="/" replace /> : (state.isAuthenticated ? <Onboarding /> : <Navigate to="/login" replace />)
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/invoices" element={
          <ProtectedRoute>
            <Invoices />
          </ProtectedRoute>
        } />

        <Route path="/analysis" element={
          <ProtectedRoute>
            <Analysis />
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  console.log('Rendering App Component...');
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;

