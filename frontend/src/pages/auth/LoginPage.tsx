import { LogIn } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthButton, FormError, FormInput } from "../../components/auth";
import { useAuth } from "../../hooks/useAuth";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // Navigation handled by AuthContext after successful login
    } catch (err) {
      // Error displayed from AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <LogIn className="h-12 w-12 text-indigo-600 dark:text-indigo-500" />
          </div>
          <h2
            id="login-title"
            className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white"
          >
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Form */}
        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          role="form"
          aria-labelledby="login-title"
        >
          <div className="space-y-4">
            {/* Global error */}
            {error && <FormError message={error} />}

            {/* Email field */}
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              required
              autoComplete="email"
              error={errors.email?.message}
              register={register}
              validation={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
              }}
              disabled={loading}
            />

            {/* Password field */}
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              error={errors.password?.message}
              register={register}
              validation={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              disabled={loading}
            />
          </div>

          {/* Forgot password link */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/password-reset"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit button */}
          <AuthButton
            type="submit"
            loading={loading}
            disabled={loading}
            fullWidth
          >
            Sign in
          </AuthButton>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
