import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { CoacheeLayout } from "@/components/layouts/CoacheeLayout";
import { CoachLayout } from "@/components/layouts/CoachLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { AdminCalendarPage } from "@/pages/admin/CalendarPage";
import { AdminCoacheesPage } from "@/pages/admin/CoacheesPage";
import { AdminCoachesPage } from "@/pages/admin/CoachesPage";
import { AdminTodayPage } from "@/pages/admin/TodayPage";
import { CoachCalendarPage } from "@/pages/coach/CalendarPage";
import { CoachCoacheesPage } from "@/pages/coach/CoacheesPage";
import { CoachTodayPage } from "@/pages/coach/TodayPage";
import { CoacheeCalendarPage } from "@/pages/coachee/CalendarPage";
import { CoacheeHomePage } from "@/pages/coachee/HomePage";
import { CoacheeNotificationsPage } from "@/pages/coachee/NotificationsPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { UserRole } from "@/types/auth";

function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
      { path: "coaches", element: <AdminCoachesPage /> },
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
      { path: "notifications", element: <CoacheeNotificationsPage /> },
    ],
  },
  { path: "/", element: <RootRedirect /> },
  { path: "*", element: <NotFoundPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
