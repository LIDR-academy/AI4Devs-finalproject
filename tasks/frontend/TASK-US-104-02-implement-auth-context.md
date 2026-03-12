# TASK-US-104-02: Implement Auth Context

Quick description: Implement auth provider/state management for session lifecycle, user state hydration, and guarded route behavior.

[Trello Card](https://trello.com/c/gQBVzPYe)

## Parent User Story
[US-104: User Login and Dashboard](../../user-stories/frontend/US-104-login-dashboard.md)

## Description
Create or extend authentication context to hold session state, user identity, and login/logout actions that can be consumed across protected frontend pages.

## Priority
🔴 Critical

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Define auth state contract
- Define authenticated/unauthenticated/loading states
- Include user fields required by dashboard (email, status)
- Define login/logout/update session actions

### 2. Implement provider and hook
- Create provider wrapping app layout where needed
- Expose typed custom hook for consuming auth state
- Ensure hook guards against usage outside provider

### 3. Add session hydration flow
- On app load, validate current session with backend
- Populate auth state from trusted backend response
- Handle hydration errors gracefully

### 4. Wire login/logout actions
- Login action updates auth state after successful validation
- Logout action clears in-memory auth state and calls backend/logout flow
- Propagate state updates to dependent pages/components

### 5. Integrate with route guards
- Provide utilities for protected route checks
- Redirect unauthenticated users to login page
- Prevent auth-only pages from flashing incorrect content

## Acceptance Criteria
- [x] Auth provider exposes typed state and actions
- [x] Session hydration runs on app initialization
- [x] Login action updates auth state consistently
- [x] Logout action clears auth state and session
- [x] Protected-route checks use centralized auth state

## Notes
- Keep context focused on auth concerns only
- Prefer server-validated session state over client trust
- Reuse existing API client and error mapping helpers

## Completion Status
- [x] 100% - Completed
