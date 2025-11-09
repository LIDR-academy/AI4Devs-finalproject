import { LogIn } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { AuthButton, FormError, FormInput } from "../../components/auth";
import { useAuth } from "../../hooks/useAuth";

/**
 * RegisterPage Component
 *
 * Registration form with extended validation for creating new accounts.
 * Features:
 * - Email, password, confirm password, and full name fields
 * - Real-time password match validation
 * - Integration with AuthContext for register functionality
 * - Auto-login after successful registration
 * - Error handling for duplicate emails
 * - Fully accessible with WCAG 2.1 AA compliance
 * - Dark mode support
 */

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
}

const RegisterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: "onBlur",
  });

  const { register: registerUser, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Watch password field for confirmPassword validation
  const password = watch("password");

  // Auto-login: Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
            <LogIn
              className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              already have an account? Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          role="form"
        >
          {/* Global error */}
          {error && <FormError message={error} />}

          <div className="space-y-4">
            {/* Email Input */}
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              required
              error={errors.email?.message}
              register={register}
              validation={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
              }}
              autoComplete="email"
            />

            {/* Password Input */}
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              required
              error={errors.password?.message}
              register={register}
              validation={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Password must not exceed 100 characters",
                },
              }}
              autoComplete="new-password"
            />

            {/* Confirm Password Input */}
            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              error={errors.confirmPassword?.message}
              register={register}
              validation={{
                required: "Confirm password is required",
                validate: (value: string) =>
                  value === password || "Passwords do not match",
              }}
              autoComplete="new-password"
            />

            {/* Full Name Input */}
            <FormInput
              id="full_name"
              name="full_name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              required={false}
              error={errors.full_name?.message}
              register={register}
              validation={{
                maxLength: {
                  value: 255,
                  message: "Full name must not exceed 255 characters",
                },
              }}
              autoComplete="name"
            />
          </div>

          {/* Submit Button */}
          <AuthButton type="submit" loading={loading} disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </AuthButton>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
