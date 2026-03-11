# Component Specification

This document provides detailed component structure, props, and implementation patterns for the Frontend Authentication UI System.

## Component Hierarchy

```
pages/auth/
├── LoginPage.tsx              (Primary deliverable)
├── RegisterPage.tsx           (Secondary deliverable)
├── PasswordResetPage.tsx      (Tertiary deliverable)
└── PasswordResetConfirmPage.tsx (Tertiary deliverable)

components/auth/
├── FormInput.tsx              (Reusable form input with validation)
├── FormError.tsx              (Error message display)
├── AuthButton.tsx             (Submit button with loading state)
└── ProtectedRoute.tsx         (Already exists - no changes needed)

contexts/
└── AuthContext.tsx            (Already exists - minor enhancements)

services/
└── authService.ts             (Already exists - no changes needed)
```

## 1. LoginPage Component

### File: `frontend/src/pages/auth/LoginPage.tsx`

#### Component Specification

**Purpose**: Primary authentication entry point for users to log in with email and password.

**Props**: None (route component)

**State Management**:

- Uses `useAuth()` hook to access `login()`, `loading`, `error` from `AuthContext`
- Uses `useForm()` from React Hook Form for form state
- Uses `useNavigate()` and `useLocation()` from React Router for redirect logic

**Form Data**:

```typescript
interface LoginFormData {
  email: string;
  password: string;
}
```

#### Implementation Pattern

```typescript
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import FormInput from "../../components/auth/FormInput";
import FormError from "../../components/auth/FormError";
import AuthButton from "../../components/auth/AuthButton";
import { LogIn } from "lucide-react";

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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
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
```

#### Accessibility Features

- `role="form"` on form element
- `aria-labelledby` referencing page title
- All inputs have associated `<label>` with `htmlFor`
- Error messages use `role="alert"` for screen reader announcements
- Loading state uses `aria-busy` on button
- Keyboard navigation fully supported

#### Dark Mode Support

- Background: `bg-gray-50 dark:bg-gray-900`
- Text: `text-gray-900 dark:text-white`
- Links: `text-indigo-600 dark:text-indigo-400`
- Uses `ThemeContext` (automatically applied via Tailwind dark mode)

## 2. RegisterPage Component

### File: `frontend/src/pages/auth/RegisterPage.tsx`

#### Component Specification

**Purpose**: New user account creation with email, password, password confirmation, and optional full name.

**Props**: None (route component)

**Form Data**:

```typescript
interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name?: string;
}
```

#### Key Differences from LoginPage

1. Additional fields: `confirmPassword`, `full_name`
2. Custom validation: Password match validation
3. Calls `register()` from AuthContext (auto-login on success)
4. Success message before redirect

#### Password Match Validation

```typescript
const {
  register,
  handleSubmit,
  watch,
  formState: { errors },
} = useForm<RegisterFormData>();

const password = watch('password');

// In confirmPassword validation:
validation={{
  required: 'Please confirm your password',
  validate: (value) =>
    value === password || 'Passwords do not match',
}}
```

## 3. PasswordResetPage Component

### File: `frontend/src/pages/auth/PasswordResetPage.tsx`

#### Component Specification

**Purpose**: Request password reset token via email.

**Props**: None (route component)

**Form Data**:

```typescript
interface PasswordResetFormData {
  email: string;
}
```

#### Implementation Notes

- Single email input field
- Calls `authService.requestPasswordReset(email)`
- Shows success message: "If an account exists with this email, you'll receive password reset instructions."
- Generic success message (security best practice - don't reveal if email exists)
- Provides link back to login page

## 4. PasswordResetConfirmPage Component

### File: `frontend/src/pages/auth/PasswordResetConfirmPage.tsx`

#### Component Specification

**Purpose**: Set new password using reset token from URL.

**Props**: None (route component)

**Form Data**:

```typescript
interface PasswordResetConfirmFormData {
  token: string; // From URL query param
  new_password: string;
  confirmPassword: string;
}
```

#### Token Extraction

```typescript
import { useSearchParams } from "react-router-dom";

const [searchParams] = useSearchParams();
const token = searchParams.get("token");

// Validate token exists
useEffect(() => {
  if (!token) {
    navigate("/password-reset", {
      state: { error: "Invalid or missing reset token" },
    });
  }
}, [token, navigate]);
```

#### Implementation Notes

- Extract `token` from URL query parameter
- Hidden input field for token (or pass directly to API)
- New password + confirmation fields
- Password match validation
- On success: Redirect to `/login` with success message
- On error: Display error (e.g., "Token expired or invalid")

## 5. FormInput Component (Reusable)

### File: `frontend/src/components/auth/FormInput.tsx`

#### Component Specification

**Purpose**: Reusable form input field with integrated validation, error display, and accessibility.

**Props**:

```typescript
interface FormInputProps {
  id: string;
  name: string;
  type: "text" | "email" | "password";
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  register: UseFormRegister<any>;
  validation?: RegisterOptions;
  autoComplete?: string;
  disabled?: boolean;
}
```

#### Implementation Pattern

```typescript
import React from "react";
import { RegisterOptions, UseFormRegister } from "react-hook-form";
import { AlertCircle } from "lucide-react";

interface FormInputProps {
  id: string;
  name: string;
  type: "text" | "email" | "password";
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  register: UseFormRegister<any>;
  validation?: RegisterOptions;
  autoComplete?: string;
  disabled?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type,
  label,
  placeholder,
  required = false,
  error,
  register,
  validation,
  autoComplete,
  disabled = false,
}) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="form-field">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        disabled={disabled}
        placeholder={placeholder}
        aria-describedby={errorId}
        aria-invalid={error ? "true" : "false"}
        className={`
          appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
          placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
          sm:text-sm transition-colors
          ${
            error
              ? "border-red-300 dark:border-red-600"
              : "border-gray-300 dark:border-gray-600"
          }
          ${
            disabled
              ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              : "bg-white dark:bg-gray-900"
          }
          dark:text-white
        `}
        {...register(name, validation)}
      />
      {error && (
        <div
          id={errorId}
          className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
```

## 6. FormError Component (Reusable)

### File: `frontend/src/components/auth/FormError.tsx`

#### Component Specification

**Purpose**: Display form-level error messages (non-field-specific errors).

**Props**:

```typescript
interface FormErrorProps {
  message: string;
}
```

#### Implementation Pattern

```typescript
import React from "react";
import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message: string;
}

const FormError: React.FC<FormErrorProps> = ({ message }) => {
  return (
    <div
      className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4"
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormError;
```

## 7. AuthButton Component (Reusable)

### File: `frontend/src/components/auth/AuthButton.tsx`

#### Component Specification

**Purpose**: Submit button with loading state and spinner for authentication forms.

**Props**:

```typescript
interface AuthButtonProps {
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Implementation Pattern

```typescript
import React from "react";
import { Loader2 } from "lucide-react";

interface AuthButtonProps {
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={`
        ${fullWidth ? "w-full" : ""}
        flex justify-center items-center py-2 px-4 border border-transparent
        rounded-md shadow-sm text-sm font-medium text-white
        bg-indigo-600 hover:bg-indigo-700
        dark:bg-indigo-500 dark:hover:bg-indigo-600
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
      `}
    >
      {loading && (
        <Loader2
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};

export default AuthButton;
```

## 8. AuthContext Integration

### File: `frontend/src/contexts/AuthContext.tsx` (Already Exists)

#### Required Enhancements

The existing `AuthContext` already provides all necessary functionality. Minor enhancements for better UX:

1. **Clear error on input change**: Expose a `clearError()` function or automatically clear error when user starts typing
2. **Redirect after login**: Ensure `login()` function redirects to intended destination
3. **Success messages**: Consider adding a `successMessage` state for registration success

#### Example Enhancement (Optional)

```typescript
// Add to AuthContextType
interface AuthContextType {
  // ... existing fields
  clearError: () => void;
  successMessage?: string;
}

// In AuthProvider
const clearError = () => setError(undefined);

const value: AuthContextType = {
  // ... existing values
  clearError,
};
```

## 9. Testing Specifications

### Unit Test Example: LoginPage.test.tsx

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import LoginPage from "./LoginPage";

describe("LoginPage", () => {
  it("renders login form", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("displays validation errors for empty fields", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("calls login function on valid submission", async () => {
    // Mock AuthContext with jest.fn()
    // ... test implementation
  });
});
```

## 10. Styling Guidelines

### Color Palette (Tailwind Classes)

- **Primary**: `indigo-600`, `indigo-700` (buttons, links)
- **Background**: `gray-50` (light), `gray-900` (dark)
- **Text**: `gray-900` (light), `white` (dark)
- **Error**: `red-600`, `red-50` (background)
- **Success**: `green-600`, `green-50` (background)

### Spacing

- Form container: `max-w-md` (448px max width)
- Field spacing: `space-y-4` (1rem between fields)
- Section spacing: `space-y-6` (1.5rem between sections)
- Page padding: `py-12 px-4 sm:px-6 lg:px-8`

### Typography

- Page title: `text-3xl font-extrabold`
- Subtitle: `text-sm`
- Labels: `text-sm font-medium`
- Inputs: `sm:text-sm`
- Errors: `text-sm`

### Responsive Adjustments

- Mobile: Stack everything vertically, full-width inputs
- Tablet+: Maintain centered card layout with max-w-md
