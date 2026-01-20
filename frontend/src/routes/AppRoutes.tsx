import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import LoginPage from '@/pages/auth/Login';
import DashboardPage from '@/pages/Dashboard';
import PatientListPage from '@/pages/hce/PatientList';
import PatientFormPage from '@/pages/hce/PatientForm';
import PatientDetailPage from '@/pages/hce/PatientDetail';
import PlanningPage from '@/pages/planning/PlanningPage';
import SurgeryDetailPage from '@/pages/planning/SurgeryDetail';
import SurgeryFormPage from '@/pages/planning/SurgeryForm';
import OperatingRoomListPage from '@/pages/planning/OperatingRoomList';
import OperatingRoomFormPage from '@/pages/planning/OperatingRoomForm';
import OperatingRoomDetailPage from '@/pages/planning/OperatingRoomDetail';
import ChecklistPage from '@/pages/checklist/ChecklistPage';
import Layout from '@/components/layout/Layout';

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* HCE Routes */}
      <Route
        path="/hce"
        element={
          <ProtectedRoute>
            <Layout>
              <PatientListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hce/patients"
        element={
          <ProtectedRoute>
            <Layout>
              <PatientListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hce/patients/new"
        element={
          <ProtectedRoute>
            <Layout>
              <PatientFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hce/patients/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <PatientDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hce/patients/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <PatientFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Planning Routes */}
      <Route
        path="/planning"
        element={
          <ProtectedRoute>
            <Layout>
              <PlanningPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planning/surgeries"
        element={
          <ProtectedRoute>
            <Layout>
              <PlanningPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planning/surgeries/new"
        element={
          <ProtectedRoute>
            <Layout>
              <SurgeryFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planning/surgeries/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <SurgeryFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planning/surgeries/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <SurgeryDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Operating Room Routes */}
      <Route
        path="/planning/operating-rooms"
        element={
          <ProtectedRoute>
            <Layout>
              <OperatingRoomListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planning/operating-rooms/new"
        element={
          <ProtectedRoute>
            <Layout>
              <OperatingRoomFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planning/operating-rooms/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <OperatingRoomFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planning/operating-rooms/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <OperatingRoomDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Checklist Routes */}
      <Route
        path="/checklist"
        element={
          <ProtectedRoute>
            <Layout>
              <ChecklistPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Patients alias (redirects to HCE) */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <Navigate to="/hce" replace />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
