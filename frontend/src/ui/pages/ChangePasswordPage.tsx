import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { UserRole } from "@/domain/types/auth";
import { useAuth } from "@/infrastructure/context/AuthContext";
import { useChangePassword } from "@/infrastructure/hooks/useChangePassword";

function getRoleHome(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "/admin/today";
    case UserRole.COACH:
      return "/coach/today";
    case UserRole.COACHEE:
      return "/coachee/home";
  }
}

export function ChangePasswordPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const changePasswordMutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const validateForm = (): boolean => {
    let valid = true;
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setApiError("");
    setSuccessMessage("");

    if (!currentPassword) {
      setCurrentPasswordError("Current password is required");
      valid = false;
    }

    if (!newPassword) {
      setNewPasswordError("New password is required");
      valid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError("New password must be at least 6 characters");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your new password");
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setSuccessMessage("Password changed successfully");
      setTimeout(() => {
        navigate(getRoleHome(user.role), { replace: true });
      }, 1000);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 401) {
          setApiError("Current password is incorrect");
        } else {
          setApiError("An error occurred. Please try again.");
        }
      } else if (err && typeof err === "object" && "request" in err) {
        setApiError("Unable to connect. Please try again.");
      } else {
        setApiError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600">Change Password</h1>
            <p className="text-gray-500 mt-1">You must change your password before continuing</p>
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {apiError}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={changePasswordMutation.isPending}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-60 ${
                  currentPasswordError ? "border-red-500" : "border-gray-300"
                }`}
                autoComplete="current-password"
              />
              {currentPasswordError && (
                <p className="mt-1 text-xs text-red-600">{currentPasswordError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={changePasswordMutation.isPending}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-60 ${
                  newPasswordError ? "border-red-500" : "border-gray-300"
                }`}
                autoComplete="new-password"
              />
              {newPasswordError && <p className="mt-1 text-xs text-red-600">{newPasswordError}</p>}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changePasswordMutation.isPending}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-60 ${
                  confirmPasswordError ? "border-red-500" : "border-gray-300"
                }`}
                autoComplete="new-password"
              />
              {confirmPasswordError && (
                <p className="mt-1 text-xs text-red-600">{confirmPasswordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {changePasswordMutation.isPending && (
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
