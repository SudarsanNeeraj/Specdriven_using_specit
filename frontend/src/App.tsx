import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ShellLayout } from './components/layout/ShellLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { DoctorSearchPage } from './pages/patient/DoctorSearchPage';
import { DoctorProfilePage } from './pages/patient/DoctorProfilePage';
import { BookingConfirmationPage } from './pages/patient/BookingConfirmationPage';
import { PatientMyAppointmentsPage } from './pages/patient/PatientMyAppointmentsPage';
import { PatientMedicalRecordsPage } from './pages/patient/PatientMedicalRecordsPage';
import { TelehealthRoomPage } from './pages/patient/TelehealthRoomPage';
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ShellLayout />}>
              {/* Public Routes */}
              <Route index element={<DoctorSearchPage />} />
              <Route path="doctor/:id" element={<DoctorProfilePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />

              {/* Patient Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['PATIENT', 'ADMIN', 'DOCTOR', 'RECEPTIONIST']} />}>
                <Route path="patient/booking-success/:id" element={<BookingConfirmationPage />} />
                <Route path="patient/appointments" element={<PatientMyAppointmentsPage />} />
                <Route path="patient/records" element={<PatientMedicalRecordsPage />} />
                <Route path="telehealth/:roomId" element={<TelehealthRoomPage />} />
              </Route>

              {/* Doctor Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']} />}>
                <Route path="doctor/dashboard" element={<DoctorDashboardPage />} />
              </Route>

              {/* Admin & Receptionist Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']} />}>
                <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

