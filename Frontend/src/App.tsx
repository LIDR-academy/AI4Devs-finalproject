import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { BottomTabBar } from '@/components/organisms/BottomTabBar';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ExpenseFormPage } from '@/pages/ExpenseFormPage';
import { TripsListPage } from '@/pages/TripsListPage';
import { TripDetailPage } from '@/pages/TripDetailPage';
import { CreateTripPage } from '@/pages/CreateTripPage';
import { ProtectedRoute } from '@/components/molecules/ProtectedRoute';

/**
 * React Query client configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Layout component that conditionally shows BottomTabBar
 * Hides BottomTabBar on auth pages and when user is not authenticated
 */
function AppLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const hideNavRoutes = ['/login', '/register'];
  const isAuthPage = hideNavRoutes.includes(location.pathname);

  // Show BottomTabBar only if authenticated and not on auth pages
  const shouldShowNav = isAuthenticated && !isAuthPage;

  return (
    <>
      <Outlet />
      {shouldShowNav && <BottomTabBar />}
    </>
  );
}

/**
 * Root application component
 * Configures React Router, React Query, and Authentication
 */
function App() {
  // Create router inside component to ensure AuthProvider is available
  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          element: <AppLayout />,
          children: [
            {
              path: '/',
              element: (
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              ),
            },
            {
              path: '/login',
              element: <LoginPage />,
            },
            {
              path: '/register',
              element: <RegisterPage />,
            },
            {
              path: '/trips',
              element: (
                <ProtectedRoute>
                  <TripsListPage />
                </ProtectedRoute>
              ),
            },
            {
              path: '/trips/:id',
              element: (
                <ProtectedRoute>
                  <TripDetailPage />
                </ProtectedRoute>
              ),
            },
            {
              path: '/trips/new',
              element: (
                <ProtectedRoute>
                  <CreateTripPage />
                </ProtectedRoute>
              ),
            },
            {
              path: '/trips/:tripId/expenses/new',
              element: (
                <ProtectedRoute>
                  <ExpenseFormPage />
                </ProtectedRoute>
              ),
            },
            {
              path: '/expenses/new',
              element: (
                <ProtectedRoute>
                  <ExpenseFormPage />
                </ProtectedRoute>
              ),
            },
          ],
        },
      ]),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
