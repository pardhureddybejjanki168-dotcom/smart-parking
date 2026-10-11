import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { UserLayout } from './components/layout/UserLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// User Pages
import { UserDashboardPage } from './pages/user/Dashboard';
import { SlotMonitor } from './pages/user/SlotMonitor';
import { VehiclesPage } from './pages/user/Vehicles';
import { VehicleForm } from './pages/user/VehicleForm';
import { VehicleDetailPage } from './pages/user/VehicleDetail';
import { ReserveParkingPage } from './pages/user/ReserveParking';
import { ReservationsPage } from './pages/user/Reservations';
import { ActiveSessionPage } from './pages/user/ActiveSession';
import { ParkingHistoryPage } from './pages/user/ParkingHistory';
import { NotificationsPage } from './pages/user/Notifications';
import { ReportsPage } from './pages/user/Reports';
import { ProfilePage } from './pages/user/Profile';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagement';
import { SlotManagementPage } from './pages/admin/SlotManagement';
import { VehicleRecordsPage } from './pages/admin/VehicleRecords';
import { AdminSessionsPage } from './pages/admin/AdminSessions';
import { AdminReservationsPage } from './pages/admin/AdminReservations';
import { AdminReportsPage } from './pages/admin/AdminReports';
import { AuditLogsPage } from './pages/admin/AuditLogs';
import { SystemSettingsPage } from './pages/admin/SystemSettings';

export const App: React.FC = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '8px',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Protected Routes */}
          <Route
            element={
              <ProtectedRoute role="USER">
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/slots" element={<SlotMonitor />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicles/new" element={<VehicleForm />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
            <Route path="/reserve" element={<ReserveParkingPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/sessions" element={<ActiveSessionPage />} />
            <Route path="/history" element={<ParkingHistoryPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            element={
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/slots" element={<SlotManagementPage />} />
            <Route path="/admin/vehicles" element={<VehicleRecordsPage />} />
            <Route path="/admin/sessions" element={<AdminSessionsPage />} />
            <Route path="/admin/history" element={<AdminSessionsPage />} />
            <Route path="/admin/reservations" element={<AdminReservationsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/audit" element={<AuditLogsPage />} />
            <Route path="/admin/settings" element={<SystemSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
