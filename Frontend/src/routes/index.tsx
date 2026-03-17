import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ExpenseFormPage } from '@/pages/ExpenseFormPage';
import { TripsListPage } from '@/pages/TripsListPage';
import { TripDetailPage } from '@/pages/TripDetailPage';
import { CreateTripPage } from '@/pages/CreateTripPage';
import { ProtectedRoute } from '@/components/molecules/ProtectedRoute';

/**
 * Router configuration
 */
export const router = createBrowserRouter([
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
    path: '/trips/new',
    element: (
      <ProtectedRoute>
        <CreateTripPage />
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
]);
