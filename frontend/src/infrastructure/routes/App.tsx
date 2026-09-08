import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { UserRole } from "@/domain/types/auth";
import { useAuth } from "@/infrastructure/context/AuthContext";
import { AdminLayout } from "@/ui/components/layouts/AdminLayout";
import { CoacheeLayout } from "@/ui/components/layouts/CoacheeLayout";
import { CoachLayout } from "@/ui/components/layouts/CoachLayout";
import { ProtectedRoute } from "@/ui/components/ProtectedRoute";
import { ToastContainer } from "@/ui/components/Toast";
import { AdminCalendarPage } from "@/ui/pages/admin/CalendarPage";
import { AdminCoachDetailPage } from "@/ui/pages/admin/CoachDetailPage";
import { AdminCoacheeDetailPage } from "@/ui/pages/admin/CoacheeDetailPage";
import { AdminCoacheesPage } from "@/ui/pages/admin/CoacheesPage";
import { AdminCoachesPage } from "@/ui/pages/admin/CoachesPage";
import { AdminTodayPage } from "@/ui/pages/admin/TodayPage";
import { ChangePasswordPage } from "@/ui/pages/ChangePasswordPage";
import { CoachCalendarPage } from "@/ui/pages/coach/CalendarPage";
import { CoachCoacheeDetailPage } from "@/ui/pages/coach/CoacheeDetailPage";
import { CoachCoacheesPage } from "@/ui/pages/coach/CoacheesPage";
import { CoachTodayPage } from "@/ui/pages/coach/TodayPage";
import { CoacheeCalendarPage } from "@/ui/pages/coachee/CalendarPage";
import { CoacheeHomePage } from "@/ui/pages/coachee/HomePage";
import { LoginPage } from "@/ui/pages/LoginPage";
import { NotFoundPage } from "@/ui/pages/NotFoundPage";
import { NotificationsPage } from "@/ui/pages/NotificationsPage";
import { UnauthorizedPage } from "@/ui/pages/UnauthorizedPage";

function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  switch (user?.role) {
    case UserRole.ADMIN:
      return <Navigate to="/admin/today" replace />;
    case UserRole.COACH:
      return <Navigate to="/coach/today" replace />;
    case UserRole.COACHEE:
      return <Navigate to="/coachee/home" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/change-password",
    element: (
      <ProtectedRoute>
        <ChangePasswordPage />
      </ProtectedRoute>
    ),
  },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/today" replace /> },
      { path: "today", element: <AdminTodayPage /> },
      { path: "calendar", element: <AdminCalendarPage /> },
      { path: "coachees", element: <AdminCoacheesPage /> },
      { path: "coachees/:id", element: <AdminCoacheeDetailPage /> },
      { path: "coaches", element: <AdminCoachesPage /> },
      { path: "coaches/:id", element: <AdminCoachDetailPage /> },
      { path: "notifications", element: <NotificationsPage /> },
    ],
  },
  {
    path: "/coach",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.COACH]}>
        <CoachLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/coach/today" replace /> },
      { path: "today", element: <CoachTodayPage /> },
      { path: "calendar", element: <CoachCalendarPage /> },
      { path: "coachees", element: <CoachCoacheesPage /> },
      { path: "coachees/:id", element: <CoachCoacheeDetailPage /> },
      { path: "notifications", element: <NotificationsPage /> },
    ],
  },
  {
    path: "/coachee",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.COACHEE]}>
        <CoacheeLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/coachee/home" replace /> },
      { path: "home", element: <CoacheeHomePage /> },
      { path: "calendar", element: <CoacheeCalendarPage /> },
      { path: "notifications", element: <NotificationsPage /> },
    ],
  },
  { path: "/", element: <RootRedirect /> },
  { path: "*", element: <NotFoundPage /> },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}
