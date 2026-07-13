import { useNavigate } from "react-router-dom";
import { UserRole } from "@/domain/types/auth";
import { useAuth } from "@/infrastructure/context/AuthContext";

export function NotFoundPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getHomePath = (): string => {
    if (!isAuthenticated || !user) return "/login";
    switch (user.role) {
      case UserRole.ADMIN:
        return "/admin/today";
      case UserRole.COACH:
        return "/coach/today";
      case UserRole.COACHEE:
        return "/coachee/home";
      default:
        return "/login";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404 — Page Not Found</h1>
        <p className="text-gray-500 mb-6">The page you are looking for does not exist.</p>
        <button
          type="button"
          onClick={() => navigate(getHomePath())}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
