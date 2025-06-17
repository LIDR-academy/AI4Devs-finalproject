import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskManagement from './pages/TaskManagement';
import TaskPlanningPage from './components/tasks/planning/TaskPlanningPage';
import GanttPage from './pages/GanttPage';
import AlertsPage from './pages/AlertsPage';
import TeamCapacityPage from './pages/TeamCapacityPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Componente protegido que verifica la autenticación
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Cargando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Componente para rutas públicas (sin autenticación)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Cargando...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Rutas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <TaskManagement />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tasks/:taskId/plan" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <TaskPlanningPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/gantt" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <GanttPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/alerts" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <AlertsPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/teams/capacity" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <TeamCapacityPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Redirección de la ruta raíz */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      {/* Ruta para 404 */}
      <Route 
        path="*" 
        element={
          <MainLayout>
            <div className="text-center mt-5">
              <h1>404</h1>
              <p>Página no encontrada</p>
            </div>
          </MainLayout>
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
