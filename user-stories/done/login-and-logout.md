# Login and logout

**As a** new user
**I want** to log in and log out securely with email/password
**so that** my documents and lessons stay private to me and are available whenever I return

## Context
- Building auth from scratch using Supabase Auth (email/password method)
- AI Study Buddy Expo app (universal: web + iOS + Android)
- Signup is a separate story; this covers login/logout only
- Session persistence handled by Supabase Auth; user stays logged in across app restarts
- Password strength required: minimum 8 characters with mix of letters, numbers, and symbols
- No forgot-password flow in scope (separate story)
- No analytics tracking or feature flags required for MVP
- The login form should be created in @helsoft/components library using components from the same library

## Acceptance criteria
- User can navigate to login screen on app startup if not authenticated
- User enters valid email and password (8+ chars, letters + numbers + symbols) and taps "Log In"
  - Login succeeds → session established via Supabase Auth
  - User redirected to home screen
  - User can now access protected screens and documents
- User can tap "Log Out" from the app
  - Session cleared via Supabase Auth
  - User redirected to login screen
  - User cannot access protected screens without re-authenticating
- User enters invalid credentials (wrong email or password)
  - Error message displayed ("Invalid email or password")
  - User remains on login screen; session not created
- User attempts login during network outage
  - Error message displayed ("Network error")
  - User can retry when connection restored
- Session persists across app close/reopen (Supabase Auth handles this automatically)

## Notes
- Supabase Auth client already initialized in `apps/app-study-buddy/src/lib/supabase.ts`
- Use `@helsoft/hooks` for `useSession()` (already exported from `libs/hooks/src/hooks/use-session.ts`)
- Follow `Component → Hook → Service → DAO` layering (see `.agents/rules/hooks-service-dao.mdc`)
- Build with Expo Router for navigation (file-based routing in `apps/app-study-buddy/src/app/`)
- This story is a prerequisite for accessing other protected features
