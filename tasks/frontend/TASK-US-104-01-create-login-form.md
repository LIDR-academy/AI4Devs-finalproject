# TASK-US-104-01: Create Login Form

Quick description: Build the login form and wire API key authentication request/response handling for the dashboard entry point.

[Trello Card](https://trello.com/c/D6QWUR9P)

## Parent User Story
[US-104: User Login and Dashboard](../../user-stories/frontend/US-104-login-dashboard.md)

## Description
Implement the login form UI for API-key based authentication, including field validation, loading state, backend integration, and success/error handling.

## Priority
🔴 Critical

## Estimated Time
2 hours

## Detailed Steps

### 1. Create login form component
- Add a dedicated login form component in `src/components/auth/`
- Add form fields for email and API key
- Reuse shared UI components for consistency

### 2. Add form validation
- Validate required fields before submission
- Validate email format
- Show inline error messages for invalid input

### 3. Integrate authentication request
- Submit credentials to backend authentication/status endpoint
- Send API key through the expected request contract
- Handle loading and disabled states while request is pending

### 4. Handle success and failure states
- On success, trigger auth/session state update
- Redirect user to dashboard
- Show clear error feedback for invalid credentials or network failures

### 5. Add accessibility and UX polish
- Ensure keyboard-only submission flow works
- Add ARIA labels and proper focus behavior for validation errors
- Keep responsive layout for mobile and desktop

## Acceptance Criteria
- [x] Login form renders email and API key fields
- [x] Client-side validation blocks invalid form submission
- [x] Backend authentication call is triggered on submit
- [x] Successful login redirects to dashboard
- [x] Failed login shows meaningful error message
- [x] Form is keyboard accessible and responsive

## Notes
- Follow the same design language as US-103 auth screens
- Keep API integration isolated through existing API client abstractions
- Avoid exposing long-lived secrets in browser storage

## Completion Status
- [x] 100% - Completed
