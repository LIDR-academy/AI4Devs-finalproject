# Implementation Guide

This document provides a step-by-step implementation guide for building the Frontend Authentication UI System.

## Prerequisites

Before starting implementation, ensure:

- ✅ Backend JWT authentication API is running and accessible
- ✅ Frontend development environment is set up (Node.js, npm/yarn)
- ✅ All dependencies installed (`npm install`)
- ✅ Backend API base URL configured in `.env` file (`VITE_API_BASE_URL`)
- ✅ Existing `AuthContext` and `authService` reviewed and understood

## Implementation Order

This guide follows a Test-Driven Development (TDD) approach with incremental deliverables.

### Phase 1: Foundation Components (2-3 hours)

**Goal**: Build reusable form components that will be used across all auth pages.

#### Step 1.1: Create FormInput Component

**File**: `frontend/src/components/auth/FormInput.tsx`

1. Create component file with TypeScript interface
2. Implement props: `id`, `name`, `type`, `label`, `placeholder`, `required`, `error`, `register`, `validation`, `autoComplete`, `disabled`
3. Render label with `htmlFor` attribute
4. Render input with all accessibility attributes
5. Render error message conditionally with `role="alert"`
6. Apply Tailwind CSS styling (see component-spec.md)
7. Support dark mode with `dark:` classes

**Test**: Create `FormInput.test.tsx` with all test cases from testing-spec.md

**Validation**:

- Run tests: `npm run test FormInput.test.tsx`
- Verify 95%+ coverage
- Manual test: Render in isolation with Storybook (optional)

#### Step 1.2: Create FormError Component

**File**: `frontend/src/components/auth/FormError.tsx`

1. Create simple component with `message` prop
2. Render red alert box with icon (Lucide `AlertCircle`)
3. Apply `role="alert"` for accessibility
4. Support dark mode

**Test**: Create `FormError.test.tsx`

**Validation**:

- Run tests: `npm run test FormError.test.tsx`
- Verify 100% coverage

#### Step 1.3: Create AuthButton Component

**File**: `frontend/src/components/auth/AuthButton.tsx`

1. Create button component with props: `type`, `loading`, `disabled`, `fullWidth`, `children`, `onClick`
2. Render loading spinner when `loading={true}` (Lucide `Loader2` with spin animation)
3. Apply `aria-busy` and `aria-disabled` attributes
4. Disable button when loading or disabled
5. Support fullWidth layout
6. Apply Tailwind CSS button styling

**Test**: Create `AuthButton.test.tsx`

**Validation**:

- Run tests: `npm run test AuthButton.test.tsx`
- Verify 95%+ coverage

**Phase 1 Checkpoint**: All foundation components tested and passing. Coverage >90%.

---

### Phase 2: Login Page (PRIMARY DELIVERABLE) (4-5 hours)

**Goal**: Implement fully functional Login Page with all validation, error handling, and accessibility features.

#### Step 2.1: Write LoginPage Tests (TDD)

**File**: `frontend/src/pages/auth/__tests__/LoginPage.test.tsx`

1. Set up test file with all necessary imports
2. Create mock `AuthContext` with `vi.fn()` for `login`
3. Create mock `useNavigate` from React Router
4. Write all 27 test cases from testing-spec.md:
   - Rendering tests (6 tests)
   - Validation tests (5 tests)
   - Form submission tests (5 tests)
   - Error handling tests (4 tests)
   - Accessibility tests (5 tests)
   - Integration tests (2 tests)

**Validation**: Tests should fail at this point (TDD red phase).

#### Step 2.2: Implement LoginPage Component

**File**: `frontend/src/pages/auth/LoginPage.tsx`

1. Import dependencies: React, react-hook-form, react-router-dom, hooks, components
2. Define `LoginFormData` interface
3. Set up `useAuth()`, `useNavigate()`, `useLocation()` hooks
4. Set up `useForm()` with TypeScript generic
5. Extract redirect destination from `location.state`
6. Implement redirect logic if already authenticated
7. Implement `onSubmit` handler:
   - Call `login()` from AuthContext
   - Handle errors (displayed by context)
8. Render page layout:
   - Header with logo/icon and title
   - Form with email and password inputs using `FormInput`
   - Global error display using `FormError`
   - Submit button using `AuthButton`
   - "Forgot password?" link
   - "Sign up" link
9. Apply all accessibility attributes
10. Apply dark mode support

**Reference**: See full implementation in component-spec.md

**Validation**:

- Run tests: `npm run test LoginPage.test.tsx`
- All tests should pass (TDD green phase)
- Coverage >90%
- No linting errors: `npm run lint`

#### Step 2.3: Manual Testing of LoginPage

1. Start backend server: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
2. Start frontend dev server: `npm run dev`
3. Navigate to `http://localhost:5173/login`
4. Test scenarios:
   - ✅ Empty form submission → See validation errors
   - ✅ Invalid email format → See email error
   - ✅ Short password (<6 chars) → See password error
   - ✅ Valid credentials → Redirect to dashboard
   - ✅ Invalid credentials → See error message
   - ✅ Loading state → Button disabled with spinner
   - ✅ Dark mode toggle → Styles update correctly
   - ✅ Keyboard navigation → Tab through fields, Enter to submit
   - ✅ "Forgot password?" link → Navigate to /password-reset
   - ✅ "Sign up" link → Navigate to /register

#### Step 2.4: Accessibility Audit

1. Install axe DevTools browser extension
2. Open LoginPage in browser
3. Run axe accessibility scan
4. Fix any violations (target: 0 violations)
5. Test with keyboard only (no mouse)
6. Test with screen reader (NVDA on Windows, VoiceOver on Mac)

**Phase 2 Checkpoint**: LoginPage fully functional, tested, and accessible. Ready for production.

---

### Phase 3: Registration Page (4-5 hours)

**Goal**: Implement Registration Page with auto-login functionality.

#### Step 3.1: Write RegisterPage Tests

**File**: `frontend/src/pages/auth/__tests__/RegisterPage.test.tsx`

1. Write all 23 test cases from testing-spec.md
2. Include password match validation tests
3. Include auto-login after registration test

#### Step 3.2: Implement RegisterPage Component

**File**: `frontend/src/pages/auth/RegisterPage.tsx`

1. Similar structure to LoginPage
2. Define `RegisterFormData` interface with additional fields:
   - `email`
   - `password`
   - `confirmPassword`
   - `full_name` (optional)
3. Set up form validation including password match:

   ```typescript
   const password = watch("password");

   // In confirmPassword validation:
   validate: (value) => value === password || "Passwords do not match";
   ```

4. Implement `onSubmit` handler:
   - Call `register()` from AuthContext
   - Context handles auto-login
   - Redirect to dashboard on success
5. Render form with 4 fields:
   - Email (required)
   - Password (required, min 6, max 100)
   - Confirm Password (required, must match)
   - Full Name (optional, max 255)
6. Apply all accessibility and dark mode features

**Validation**:

- Run tests: `npm run test RegisterPage.test.tsx`
- All tests pass
- Coverage >90%

#### Step 3.3: Manual Testing of RegisterPage

1. Navigate to `http://localhost:5173/register`
2. Test scenarios:
   - ✅ Empty form → Validation errors
   - ✅ Email already exists → Backend error displayed
   - ✅ Passwords don't match → Validation error
   - ✅ Valid registration → Auto-login → Redirect to dashboard
   - ✅ Token stored in localStorage
   - ✅ Protected routes accessible after registration

**Phase 3 Checkpoint**: RegisterPage functional with auto-login. Users can create accounts.

---

### Phase 4: Password Reset Flow (3-4 hours)

**Goal**: Implement password reset request and confirmation pages.

#### Step 4.1: Implement PasswordResetPage

**File**: `frontend/src/pages/auth/PasswordResetPage.tsx`

1. Write tests first (`PasswordResetPage.test.tsx`)
2. Simple form with single email input
3. Call `authService.requestPasswordReset(email)`
4. Show generic success message (don't reveal if email exists)
5. Provide link back to login

**Validation**:

- Tests pass
- Manual test: Request reset → See success message

#### Step 4.2: Implement PasswordResetConfirmPage

**File**: `frontend/src/pages/auth/PasswordResetConfirmPage.tsx`

1. Write tests first (`PasswordResetConfirmPage.test.tsx`)
2. Extract token from URL query parameter:
   ```typescript
   const [searchParams] = useSearchParams();
   const token = searchParams.get("token");
   ```
3. Redirect to `/password-reset` if token missing
4. Form with new password and confirm password
5. Password match validation
6. Call `authService.resetPassword({ token, new_password })`
7. On success: Redirect to `/login` with success message
8. On error: Display error (e.g., "Token expired")

**Validation**:

- Tests pass
- Manual test (requires backend email or manual token):
  1. Request reset from `/password-reset`
  2. Get token from backend logs or database
  3. Navigate to `/password-reset/confirm?token=xxx`
  4. Enter new password → Success → Login with new password

**Phase 4 Checkpoint**: Complete password reset flow implemented.

---

### Phase 5: Integration & Polish (2-3 hours)

#### Step 5.1: End-to-End Integration Tests

Create `frontend/src/__tests__/integration/auth-flow.test.tsx`:

1. **Full Registration Flow**:

   - Navigate to /register
   - Fill form and submit
   - Verify token in localStorage
   - Verify redirect to dashboard
   - Verify protected route accessible
   - Logout
   - Verify redirect to login

2. **Password Reset Flow**:

   - Request reset
   - Verify success message
   - Confirm reset with token (mocked)
   - Login with new password

3. **Protected Route Redirect**:
   - Try to access /templates (protected)
   - Redirected to /login with return URL
   - Login successfully
   - Redirected back to /templates

**Validation**: All integration tests pass.

#### Step 5.2: Cross-Browser Testing

Test in multiple browsers:

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari (if available)
- ✅ Edge

Verify:

- All forms work correctly
- Styling consistent
- Dark mode works
- No console errors

#### Step 5.3: Responsive Design Testing

Test on different screen sizes:

- ✅ Mobile (320px - 640px)
- ✅ Tablet (640px - 1024px)
- ✅ Desktop (1024px+)

Verify:

- Forms display correctly
- Touch targets ≥ 44px
- No horizontal scroll
- Text readable at all sizes

#### Step 5.4: Performance Optimization

1. Check bundle size impact:
   ```bash
   npm run build
   npm run analyze  # If webpack-bundle-analyzer configured
   ```
2. Verify lazy loading of auth pages
3. Optimize images/icons if used
4. Verify no memory leaks (Chrome DevTools Memory Profiler)

#### Step 5.5: Final Code Review

1. **Code Quality**:

   - Run linter: `npm run lint`
   - Run formatter: `npm run format`
   - Fix all warnings

2. **TypeScript**:

   - No `any` types (except where necessary)
   - All props typed correctly
   - Type checking passes: `npm run type-check`

3. **Documentation**:

   - Add JSDoc comments to all components
   - Update README if necessary
   - Document any setup steps

4. **Accessibility**:
   - Re-run axe on all pages
   - Verify WCAG 2.1 AA compliance
   - Test with screen reader

**Phase 5 Checkpoint**: All authentication UI complete, tested, optimized, and production-ready.

---

## Post-Implementation Checklist

### Functional Requirements

- [ ] Login page functional with validation
- [ ] Registration page functional with auto-login
- [ ] Password reset request page functional
- [ ] Password reset confirmation page functional
- [ ] JWT token storage working
- [ ] Automatic token injection in API requests
- [ ] 401 responses trigger logout
- [ ] Protected routes redirect to login
- [ ] Redirect to intended destination after login

### Non-Functional Requirements

- [ ] Dark mode support on all pages
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Keyboard navigation fully functional
- [ ] Screen reader accessible
- [ ] WCAG 2.1 AA compliant (0 axe violations)
- [ ] > 80% test coverage for auth components
- [ ] All tests passing
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Bundle size acceptable (<50KB added)

### Documentation

- [ ] All components documented with JSDoc
- [ ] Implementation guide reviewed
- [ ] Any new environment variables documented
- [ ] Setup instructions clear

### Testing

- [ ] Unit tests passing (27+ for LoginPage, 23+ for RegisterPage, etc.)
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Cross-browser testing completed
- [ ] Accessibility testing completed
- [ ] Performance testing completed

## Deployment

### Environment Variables

Ensure `.env` or `.env.production` has:

```
VITE_API_BASE_URL=https://api.example.com/api/v1
```

### Build for Production

```bash
npm run build
```

### Verify Production Build

```bash
npm run preview
```

Test all authentication flows in preview mode.

## Troubleshooting

### Common Issues

**Issue**: "Network error" on login

- **Solution**: Verify backend is running and `VITE_API_BASE_URL` is correct

**Issue**: Token not persisting after page refresh

- **Solution**: Check `AuthContext` initialization logic in `useEffect`

**Issue**: Form validation not working

- **Solution**: Verify React Hook Form `register` is applied to all inputs

**Issue**: Dark mode styles not applying

- **Solution**: Ensure Tailwind dark mode enabled in `tailwind.config.js` (`darkMode: 'class'`)

**Issue**: Tests failing with "localStorage is not defined"

- **Solution**: Mock localStorage in test setup

**Issue**: Accessibility violations

- **Solution**: Ensure all inputs have labels, error messages have `role="alert"`, and buttons have proper ARIA attributes

## Success Criteria

The implementation is considered complete when:

1. ✅ All 4 auth pages functional and accessible
2. ✅ >80% test coverage with all tests passing
3. ✅ 0 accessibility violations (axe-core)
4. ✅ Manual testing completed successfully
5. ✅ Cross-browser and responsive testing passed
6. ✅ Code review completed with no blocking issues
7. ✅ Documentation complete
8. ✅ Ready for production deployment

## Next Steps (Out of Scope)

After completing this spec, consider these future enhancements:

- OAuth2 social login (Google, GitHub)
- Two-factor authentication UI
- Email verification flow
- "Remember Me" functionality
- Password strength meter visual indicator
- Account settings and profile management
- Session timeout warnings

These enhancements should be addressed in separate specifications.
