# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-19-04-frontend-auth-ui/spec.md

## Technical Requirements

### 1. Component Architecture

#### Login Page Component (`/pages/auth/LoginPage.tsx`)

- **Purpose**: Primary authentication entry point
- **State Management**: Uses `AuthContext` for login action
- **Form Handling**: React Hook Form with TypeScript validation
- **Layout**: Centered card layout with Tailwind CSS
- **Features**:
  - Email input (type="email", required, EmailStr validation)
  - Password input (type="password", required, min 6 chars)
  - Submit button with loading state
  - Error message display (non-field errors)
  - "Forgot Password?" link to `/password-reset`
  - "Don't have an account? Sign up" link to `/register`
  - Dark mode support via `ThemeContext`
  - Keyboard navigation (Tab, Enter to submit)
  - Screen reader announcements for errors

#### Register Page Component (`/pages/auth/RegisterPage.tsx`)

- **Purpose**: New user account creation
- **State Management**: Uses `AuthContext` for register action (auto-login after success)
- **Form Handling**: React Hook Form with validation
- **Features**:
  - Email input (EmailStr validation)
  - Password input (min 6 chars, max 100 chars)
  - Password confirmation input (must match password)
  - Full name input (optional, max 255 chars)
  - Submit button with loading state
  - Field-level and form-level error display
  - "Already have an account? Sign in" link to `/login`
  - Success message before redirect
  - Real-time password match validation

#### Password Reset Request Page (`/pages/auth/PasswordResetPage.tsx`)

- **Purpose**: Request password reset token
- **API Endpoint**: `POST /api/v1/auth/password-reset`
- **Features**:
  - Email input only
  - Success message: "If an account exists, you'll receive a reset email"
  - Link back to login
  - Generic success message (security best practice - don't reveal if email exists)

#### Password Reset Confirmation Page (`/pages/auth/PasswordResetConfirmPage.tsx`)

- **Purpose**: Set new password using token
- **API Endpoint**: `POST /api/v1/auth/password-reset/confirm`
- **Token Handling**: Extract token from URL query parameter (`?token=xxx`)
- **Features**:
  - Hidden token field (from URL)
  - New password input (min 6 chars)
  - Password confirmation input
  - Submit button
  - Success redirect to login with message
  - Error handling for invalid/expired tokens

### 2. Form Validation Rules

#### Client-Side Validation (React Hook Form)

```typescript
// Login form validation
interface LoginFormData {
  email: string; // required, email format
  password: string; // required, min 6 chars
}

// Register form validation
interface RegisterFormData {
  email: string; // required, email format
  password: string; // required, min 6 chars, max 100 chars
  confirmPassword: string; // required, must match password
  full_name?: string; // optional, max 255 chars
}

// Password reset validation
interface PasswordResetFormData {
  email: string; // required, email format
}

// Password reset confirm validation
interface PasswordResetConfirmFormData {
  token: string; // required (from URL)
  new_password: string; // required, min 6 chars, max 100 chars
  confirmPassword: string; // required, must match new_password
}
```

#### Validation Messages

- Email: "Please enter a valid email address"
- Password (too short): "Password must be at least 6 characters"
- Password (too long): "Password must not exceed 100 characters"
- Password mismatch: "Passwords do not match"
- Full name (too long): "Full name must not exceed 255 characters"
- Required field: "[Field name] is required"

### 3. State Management Integration

#### AuthContext Enhancement

The existing `AuthContext` at `frontend/src/contexts/AuthContext.tsx` already provides:

- `user: User | null` - current authenticated user
- `isAuthenticated: boolean` - auth status
- `login(credentials: LoginRequest): Promise<void>` - login function
- `register(userData: RegisterRequest): Promise<void>` - register function
- `logout(): void` - logout function
- `loading: boolean` - loading state
- `error?: string` - error message

**Integration Requirements**:

- Login page calls `login()` from context
- Register page calls `register()` from context (auto-login on success)
- Logout button calls `logout()` from context
- Use `loading` state to disable form during submission
- Display `error` from context if authentication fails
- Clear `error` when user starts typing (use `setError(undefined)` if exposed, or handle in context)

#### Token Storage (Already Implemented)

- `localStorage.getItem('access_token')` - retrieve token
- `localStorage.setItem('access_token', token)` - store token on login
- `localStorage.removeItem('access_token')` - clear token on logout
- `apiService` interceptors automatically attach token to requests
- 401 responses trigger automatic logout via `apiService` interceptor

### 4. API Integration

#### Existing Backend Endpoints

All endpoints are prefixed with `/api/v1/auth/`:

1. **POST `/api/v1/auth/register`**

   - Request: `{ email: string, password: string, full_name?: string }`
   - Response: `{ message: string, user: UserResponse }`
   - Errors: 400 (email exists), 422 (validation error)

2. **POST `/api/v1/auth/login`**

   - Request: `{ email: string, password: string }`
   - Response: `{ access_token: string, token_type: "bearer", expires_in: number, user: UserResponse }`
   - Errors: 401 (invalid credentials), 422 (validation error)

3. **GET `/api/v1/auth/me`**

   - Headers: `Authorization: Bearer <token>`
   - Response: `UserResponse`
   - Errors: 401 (invalid token)

4. **POST `/api/v1/auth/password-reset`**

   - Request: `{ email: string }`
   - Response: `{ message: string }`
   - Note: Always returns success (don't reveal if email exists)

5. **POST `/api/v1/auth/password-reset/confirm`**
   - Request: `{ token: string, new_password: string }`
   - Response: `{ message: string }`
   - Errors: 400 (invalid token), 422 (validation error)

#### AuthService Methods (Already Exist)

Located at `frontend/src/services/authService.ts`:

- `authService.login(credentials)` - returns `LoginResponse`
- `authService.register(userData)` - returns `{ message, user }`
- `authService.getCurrentUser()` - returns `User`
- `authService.requestPasswordReset(email)` - returns `{ message }`
- `authService.resetPassword({ token, new_password })` - returns `{ message }`

**No new service methods required** - all backend integrations already implemented.

### 5. UI/UX Specifications

#### Layout Structure (All Auth Pages)

```
<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-md w-full space-y-8">
    {/* Logo/Header */}
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        [Page Title]
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        [Subtitle or link to other auth pages]
      </p>
    </div>

    {/* Form */}
    <form className="mt-8 space-y-6">
      {/* Form fields */}
    </form>
  </div>
</div>
```

#### Input Field Component Pattern

Create reusable `FormInput` component:

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
  autoComplete?: string;
  disabled?: boolean;
}
```

#### Button States

- **Default**: `bg-indigo-600 hover:bg-indigo-700`
- **Loading**: `bg-indigo-600 opacity-75 cursor-not-allowed` + spinner
- **Disabled**: `bg-gray-300 cursor-not-allowed`
- **Dark Mode**: `dark:bg-indigo-500 dark:hover:bg-indigo-600`

#### Error Display

- **Field Errors**: Below input field in red text with alert icon
- **Form Errors**: At top of form in red alert box
- **Success Messages**: Green alert box with checkmark icon

#### Loading Spinner

Use existing `LoadingSpinner` component from `frontend/src/components/ui/LoadingSpinner.tsx`

### 6. Accessibility Requirements

#### Keyboard Navigation

- All form inputs focusable with Tab
- Submit with Enter key
- Skip to main content link (if applicable)
- Visible focus indicators (blue ring)

#### ARIA Attributes

- `<form role="form" aria-labelledby="form-title">`
- `<input aria-describedby="error-id" aria-invalid="true">` when error exists
- `<div role="alert">` for error messages
- `<button aria-busy="true" aria-disabled="true">` during loading
- `<label htmlFor="input-id">` for every input

#### Screen Reader Announcements

- Live region for form submission status
- Error messages announced immediately
- Loading state announced

#### Focus Management

- Auto-focus first input on page load
- Focus on first error after failed submission
- Focus on success message after successful action

### 7. Responsive Design

#### Breakpoints (Tailwind CSS)

- **Mobile**: `< 640px` - Single column, full width inputs
- **Tablet**: `640px - 1024px` - Centered card, max-width 28rem
- **Desktop**: `>= 1024px` - Same as tablet

#### Touch Targets

- Minimum button height: 44px (WCAG guideline)
- Minimum input height: 44px
- Adequate spacing between interactive elements

### 8. Performance Considerations

#### Code Splitting

- Auth pages lazy-loaded with `React.lazy()` (already done in App.tsx)
- Form validation library (React Hook Form) tree-shaken

#### Optimization

- Memoize form validation functions with `useMemo()`
- Debounce real-time validation (e.g., password match check)
- Avoid re-renders during typing with `React.memo()` on input components

#### Bundle Size

- React Hook Form: ~8KB gzipped (already justified)
- No additional heavy dependencies needed

### 9. Testing Strategy

#### Unit Tests (Vitest + React Testing Library)

- **LoginPage.test.tsx**: Form rendering, validation, submission, error handling
- **RegisterPage.test.tsx**: Form rendering, validation, password match, submission
- **PasswordResetPage.test.tsx**: Email submission, success message
- **PasswordResetConfirmPage.test.tsx**: Token extraction, password validation, submission
- **AuthContext.test.tsx**: Login, register, logout, token management

#### Integration Tests

- **Auth flow**: Register → Auto-login → Access protected route → Logout
- **Password reset flow**: Request → Confirm with token → Login with new password
- **Error scenarios**: Invalid credentials, network errors, expired tokens

#### Accessibility Tests

- Run axe-core on all auth pages
- Manual keyboard navigation testing
- Screen reader testing (NVDA/VoiceOver)

#### Coverage Target

- **Minimum**: 80% code coverage for auth components
- **Critical paths**: 100% coverage for login/register functions

### 10. Error Handling Patterns

#### Network Errors

```typescript
try {
  await authContext.login(data);
} catch (error) {
  if (error.message.includes("Network error")) {
    setFormError("Unable to connect. Please check your internet connection.");
  } else {
    setFormError(error.message || "An unexpected error occurred.");
  }
}
```

#### Validation Errors (422)

- Display field-specific errors returned from backend
- Map backend error keys to form field names

#### Authentication Errors (401)

- Display generic "Invalid email or password" message
- Don't reveal which field is incorrect (security)

#### Token Expiration

- Handled automatically by `apiService` interceptor
- Redirects to `/login` with state to return after login

## External Dependencies

No new external dependencies are required. The specification leverages existing project dependencies:

- **React 19** - Core framework (already installed)
- **TypeScript** - Type safety (already configured)
- **React Router** - Navigation (already integrated)
- **React Hook Form** - Form management (already in dependencies)
- **Axios** - HTTP client (already configured in apiService)
- **Tailwind CSS** - Styling (already configured)
- **Lucide Icons** - Icons for visual feedback (already in project)
- **Vitest** - Testing framework (already configured)
- **React Testing Library** - Component testing (already installed)

All authentication services, context, types, and API integration are already implemented. This spec focuses exclusively on building the UI layer that connects to these existing implementations.
