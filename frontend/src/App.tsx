import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NetworkProvider } from './context/NetworkContext';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { MyTickets } from './pages/employee/MyTickets';
import { NewTicket } from './pages/employee/NewTicket';
import { EmployeeTicketDetail } from './pages/employee/TicketDetail';
import { Dashboard } from './pages/technician/Dashboard';
import { SupportQueue } from './pages/technician/SupportQueue';
import { TechnicianTicketDetail } from './pages/technician/TicketDetail';
import { DesignSystemGallery } from './pages/DesignSystemGallery';
import { Forbidden } from './pages/Forbidden';
import { NotFound } from './pages/NotFound';
import { UserRole } from '@helpdesk360/shared';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 15 * 1000, // 15 seconds
    },
  },
});

// Protected Route Component enforcing authentication and optional role restrictions
const ProtectedRoute: React.FC<{
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
          <span className="text-xs text-text-muted">Loading HelpDesk 360...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <AppShell>{children}</AppShell>;
};

// Root index redirector based on authenticated user role
const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'TECHNICIAN') {
    return <Navigate to="/technician/dashboard" replace />;
  }

  return <Navigate to="/employee/tickets" replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <NetworkProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Root index redirect */}
                <Route path="/" element={<RootRedirect />} />

                {/* Employee Routes (accessible by Employee & Technician) */}
                <Route
                  path="/employee/tickets"
                  element={
                    <ProtectedRoute allowedRoles={['EMPLOYEE', 'TECHNICIAN']}>
                      <MyTickets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee/new-ticket"
                  element={
                    <ProtectedRoute allowedRoles={['EMPLOYEE', 'TECHNICIAN']}>
                      <NewTicket />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee/tickets/:id"
                  element={
                    <ProtectedRoute allowedRoles={['EMPLOYEE', 'TECHNICIAN']}>
                      <EmployeeTicketDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Technician Routes (strictly TECHNICIAN role only) */}
                <Route
                  path="/technician/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/queue"
                  element={
                    <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                      <SupportQueue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/tickets/:id"
                  element={
                    <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                      <TechnicianTicketDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Design System & Component Library Gallery */}
                <Route
                  path="/design-system"
                  element={
                    <ProtectedRoute>
                      <DesignSystemGallery />
                    </ProtectedRoute>
                  }
                />

                {/* Error Pages */}
                <Route
                  path="/403"
                  element={
                    <ProtectedRoute>
                      <Forbidden />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NetworkProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
