# Testing Specification

This document outlines the comprehensive testing strategy for the Frontend Authentication UI System.

## Testing Stack

- **Framework**: Vitest (already configured)
- **Component Testing**: React Testing Library (already installed)
- **User Simulation**: @testing-library/user-event
- **Mocking**: Vitest mocks (vi.fn(), vi.mock())
- **Accessibility Testing**: @axe-core/react or jest-axe
- **Coverage Tool**: Vitest coverage (c8)

## Coverage Requirements

### Minimum Coverage Targets
- **Overall**: 80% code coverage for auth components
- **Critical Paths**: 100% coverage for:
  - Login function execution
  - Register function execution
  - Password reset submission
  - Token storage/retrieval
  - Error handling

### Files Requiring Tests
1. `LoginPage.tsx` - 90%+ coverage
2. `RegisterPage.tsx` - 90%+ coverage
3. `PasswordResetPage.tsx` - 85%+ coverage
4. `PasswordResetConfirmPage.tsx` - 85%+ coverage
5. `FormInput.tsx` - 95%+ coverage
6. `FormError.tsx` - 100% coverage (simple component)
7. `AuthButton.tsx` - 95%+ coverage
8. `AuthContext.tsx` - Enhanced tests if modified

## Test File Structure

```
frontend/src/
├── pages/auth/
│   ├── __tests__/
│   │   ├── LoginPage.test.tsx
│   │   ├── RegisterPage.test.tsx
│   │   ├── PasswordResetPage.test.tsx
│   │   └── PasswordResetConfirmPage.test.tsx
├── components/auth/
│   ├── __tests__/
│   │   ├── FormInput.test.tsx
│   │   ├── FormError.test.tsx
│   │   └── AuthButton.test.tsx
└── contexts/
    └── __tests__/
        └── AuthContext.test.tsx (if enhanced)
```

## 1. LoginPage Unit Tests

### File: `frontend/src/pages/auth/__tests__/LoginPage.test.tsx`

#### Test Cases

**Rendering Tests**
1. ✅ Renders login form with all expected elements
2. ✅ Renders email input with correct attributes
3. ✅ Renders password input with correct attributes
4. ✅ Renders submit button
5. ✅ Renders "Forgot password?" link
6. ✅ Renders "Sign up" link

**Validation Tests**
7. ✅ Displays error when email is empty and form is submitted
8. ✅ Displays error when password is empty and form is submitted
9. ✅ Displays error for invalid email format
10. ✅ Displays error for password shorter than 6 characters
11. ✅ Clears validation errors when user starts typing

**Form Submission Tests**
12. ✅ Calls login function with correct credentials on valid submission
13. ✅ Shows loading state during login request
14. ✅ Disables form inputs during loading
15. ✅ Redirects to dashboard on successful login
16. ✅ Redirects to intended destination if coming from protected route

**Error Handling Tests**
17. ✅ Displays error message from AuthContext on login failure
18. ✅ Displays network error message on connection failure
19. ✅ Keeps form enabled after error
20. ✅ Allows retry after error

**Accessibility Tests**
21. ✅ All inputs have associated labels
22. ✅ Error messages have role="alert"
23. ✅ Form has proper ARIA attributes
24. ✅ Submit button has aria-busy during loading
25. ✅ No accessibility violations (axe-core)

**Integration Tests**
26. ✅ Full login flow: Enter credentials → Submit → Token stored → Redirect
27. ✅ Keyboard navigation: Tab through fields, Enter to submit

#### Example Test Implementation

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import LoginPage from '../LoginPage';
import type { AuthContextType } from '../../../types';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockAuthContext: AuthContextType = {
    user: null,
    isAuthenticated: false,
    login: mockLogin,
    logout: vi.fn(),
    register: vi.fn(),
    loading: false,
    error: undefined,
  };

  const renderLoginPage = (contextValue = mockAuthContext) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={contextValue}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders login form with all expected elements', () => {
      renderLoginPage();

      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
      expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
    });

    it('renders email input with correct attributes', () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(emailInput).toBeRequired();
    });
  });

  describe('Validation', () => {
    it('displays error when email is empty and form is submitted', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('displays error for invalid email format', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('displays error for password shorter than 6 characters', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, '12345');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls login function with correct credentials on valid submission', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('shows loading state during login request', async () => {
      const user = userEvent.setup();
      const loadingContext = { ...mockAuthContext, loading: true };
      renderLoginPage(loadingContext);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
      expect(submitButton).toBeDisabled();
    });

    it('disables form inputs during loading', async () => {
      const loadingContext = { ...mockAuthContext, loading: true };
      renderLoginPage(loadingContext);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('displays error message from AuthContext on login failure', () => {
      const errorContext = {
        ...mockAuthContext,
        error: 'Invalid email or password',
      };
      renderLoginPage(errorContext);

      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('all inputs have associated labels', () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('error messages have role="alert"', async () => {
      const errorContext = {
        ...mockAuthContext,
        error: 'Test error',
      };
      renderLoginPage(errorContext);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Test error');
    });
  });
});
```

## 2. RegisterPage Unit Tests

### File: `frontend/src/pages/auth/__tests__/RegisterPage.test.tsx`

#### Test Cases

**Rendering Tests**
1. ✅ Renders registration form with all fields
2. ✅ Renders email, password, confirm password, and full name inputs
3. ✅ Renders submit button
4. ✅ Renders "Sign in" link

**Validation Tests**
5. ✅ Displays error when required fields are empty
6. ✅ Displays error for invalid email format
7. ✅ Displays error when password is too short
8. ✅ Displays error when passwords don't match
9. ✅ Displays error when password exceeds 100 characters
10. ✅ Displays error when full name exceeds 255 characters
11. ✅ Real-time password match validation

**Form Submission Tests**
12. ✅ Calls register function with correct data on valid submission
13. ✅ Shows loading state during registration
14. ✅ Auto-logs in user after successful registration
15. ✅ Redirects to dashboard after registration
16. ✅ Handles optional full name field correctly

**Error Handling Tests**
17. ✅ Displays error when email already exists (400)
18. ✅ Displays validation errors from backend
19. ✅ Allows retry after error

**Accessibility Tests**
20. ✅ All inputs have associated labels
21. ✅ Required fields marked with asterisk
22. ✅ Error messages announced to screen readers
23. ✅ No accessibility violations (axe-core)

## 3. PasswordResetPage Unit Tests

### File: `frontend/src/pages/auth/__tests__/PasswordResetPage.test.tsx`

#### Test Cases

**Rendering Tests**
1. ✅ Renders password reset form
2. ✅ Renders email input
3. ✅ Renders submit button
4. ✅ Renders back to login link

**Validation Tests**
5. ✅ Displays error when email is empty
6. ✅ Displays error for invalid email format

**Form Submission Tests**
7. ✅ Calls requestPasswordReset with email on submission
8. ✅ Shows loading state during request
9. ✅ Displays success message after submission
10. ✅ Shows generic success message (security)

**Error Handling Tests**
11. ✅ Handles network errors gracefully
12. ✅ Displays error message on failure

## 4. PasswordResetConfirmPage Unit Tests

### File: `frontend/src/pages/auth/__tests__/PasswordResetConfirmPage.test.tsx`

#### Test Cases

**Rendering Tests**
1. ✅ Renders password reset confirm form
2. ✅ Renders new password input
3. ✅ Renders confirm password input
4. ✅ Renders submit button

**Token Handling Tests**
5. ✅ Extracts token from URL query parameter
6. ✅ Redirects to /password-reset if token is missing
7. ✅ Passes token to API on submission

**Validation Tests**
8. ✅ Displays error when password is empty
9. ✅ Displays error when password is too short
10. ✅ Displays error when passwords don't match

**Form Submission Tests**
11. ✅ Calls resetPassword with token and new password
12. ✅ Shows loading state during request
13. ✅ Redirects to login with success message on completion

**Error Handling Tests**
14. ✅ Displays error for invalid token (400)
15. ✅ Displays error for expired token
16. ✅ Allows user to request new token

## 5. FormInput Component Tests

### File: `frontend/src/components/auth/__tests__/FormInput.test.tsx`

#### Test Cases

**Rendering Tests**
1. ✅ Renders input with correct attributes
2. ✅ Renders label with correct text
3. ✅ Renders required asterisk when required
4. ✅ Renders placeholder text

**Validation Display Tests**
5. ✅ Displays error message when error prop is provided
6. ✅ Applies error styling when error exists
7. ✅ Error message has role="alert"
8. ✅ Input has aria-invalid="true" when error exists

**Disabled State Tests**
9. ✅ Disables input when disabled prop is true
10. ✅ Applies disabled styling

**Accessibility Tests**
11. ✅ Label is associated with input via htmlFor/id
12. ✅ Error message is associated via aria-describedby

## 6. FormError Component Tests

### File: `frontend/src/components/auth/__tests__/FormError.test.tsx`

#### Test Cases

1. ✅ Renders error message text
2. ✅ Has role="alert" for screen readers
3. ✅ Displays alert icon
4. ✅ Applies correct styling

## 7. AuthButton Component Tests

### File: `frontend/src/components/auth/__tests__/AuthButton.test.tsx`

#### Test Cases

**Rendering Tests**
1. ✅ Renders button with children
2. ✅ Applies fullWidth class when fullWidth prop is true
3. ✅ Applies correct type attribute

**Loading State Tests**
4. ✅ Shows loading spinner when loading prop is true
5. ✅ Disables button when loading
6. ✅ Has aria-busy="true" when loading

**Disabled State Tests**
7. ✅ Disables button when disabled prop is true
8. ✅ Has aria-disabled="true" when disabled

**Click Handling Tests**
9. ✅ Calls onClick handler when clicked
10. ✅ Does not call onClick when disabled

## 8. Integration Tests

### Test Scenarios

**Full Authentication Flow**
```typescript
describe('Full Authentication Flow', () => {
  it('allows user to register, login, and access protected route', async () => {
    // 1. Navigate to register page
    // 2. Fill registration form
    // 3. Submit form
    // 4. Verify token stored in localStorage
    // 5. Verify redirect to dashboard
    // 6. Verify protected route accessible
    // 7. Logout
    // 8. Verify redirect to login
  });
});
```

**Password Reset Flow**
```typescript
describe('Password Reset Flow', () => {
  it('allows user to request and confirm password reset', async () => {
    // 1. Navigate to password-reset page
    // 2. Enter email and submit
    // 3. Verify success message
    // 4. Navigate to password-reset-confirm with token
    // 5. Enter new password and confirm
    // 6. Submit form
    // 7. Verify redirect to login with success message
    // 8. Login with new password
  });
});
```

## 9. Accessibility Testing

### Automated Testing with axe-core

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('LoginPage has no accessibility violations', async () => {
    const { container } = renderLoginPage();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing Checklist

**Keyboard Navigation**
- [ ] Tab through all form fields in correct order
- [ ] Submit form with Enter key
- [ ] Links navigable with keyboard
- [ ] Visible focus indicators on all interactive elements

**Screen Reader Testing** (NVDA/VoiceOver)
- [ ] Page title announced
- [ ] Form labels read correctly
- [ ] Required fields announced
- [ ] Error messages announced immediately
- [ ] Loading state announced
- [ ] Success messages announced

**WCAG 2.1 AA Compliance**
- [ ] Color contrast ratio ≥ 4.5:1 for normal text
- [ ] Color contrast ratio ≥ 3:1 for large text
- [ ] No reliance on color alone for information
- [ ] Touch targets ≥ 44x44 pixels

## 10. Performance Testing

### Metrics to Monitor
- **Initial Load Time**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Form Submission Time**: < 500ms (excluding network)
- **Bundle Size Impact**: < 50KB for auth components

### Performance Tests

```typescript
describe('Performance', () => {
  it('renders LoginPage within acceptable time', () => {
    const start = performance.now();
    renderLoginPage();
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // 100ms
  });
});
```

## 11. Test Execution Commands

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test LoginPage.test.tsx

# Run tests with UI
npm run test:ui
```

## 12. Coverage Report Requirements

### Coverage Output Format
- **Console Summary**: Pass/fail with percentages
- **HTML Report**: Generated in `coverage/` directory
- **CI/CD Integration**: Fail build if coverage < 80%

### Coverage Thresholds
```json
{
  "coverage": {
    "lines": 80,
    "functions": 80,
    "branches": 75,
    "statements": 80
  }
}
```

## 13. Mocking Strategy

### Mock AuthContext
```typescript
const mockAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false,
  error: undefined,
};
```

### Mock authService
```typescript
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
  },
}));
```

### Mock React Router
```typescript
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/login' }),
  };
});
```

## 14. Test Data Fixtures

```typescript
export const validUser = {
  email: 'test@example.com',
  password: 'password123',
  full_name: 'Test User',
};

export const registeredUser = {
  id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  is_active: true,
  is_superuser: false,
  created_at: '2025-10-19T12:00:00Z',
};

export const loginResponse = {
  access_token: 'mock-jwt-token',
  token_type: 'bearer',
  expires_in: 3600,
  user: registeredUser,
};

export const validationErrors = {
  emailRequired: 'Email is required',
  emailInvalid: 'Please enter a valid email address',
  passwordRequired: 'Password is required',
  passwordTooShort: 'Password must be at least 6 characters',
  passwordsDontMatch: 'Passwords do not match',
};
```

