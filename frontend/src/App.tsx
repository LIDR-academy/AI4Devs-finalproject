import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ThemeProvider } from './theme/ThemeProvider';
import { BookTrackerPage } from './pages/BookTrackerPage';
import { GoalsPage } from './pages/GoalsPage';
import { HomePage } from './pages/HomePage';
import { LibraryPage } from './pages/LibraryPage';
import { ListsPage } from './pages/ListsPage';
import { LoginPage } from './pages/LoginPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { ProfilePage } from './pages/ProfilePage';
import { StatsPage } from './pages/StatsPage';
import './App.css';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="book-tracker" element={<BookTrackerPage />} />
        <Route path="lists" element={<ListsPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route
          path="recap"
          element={
            <PlaceholderPage
              title="Resumen e insights"
              description="Los resúmenes mensuales y anuales y los insights automáticos estarán aquí."
            />
          }
        />
        <Route path="import-export" element={<ImportExportPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
