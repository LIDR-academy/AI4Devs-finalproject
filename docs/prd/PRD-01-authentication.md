# PRD-01 · Authentication

**Status:** Draft
**Platform:** Android · iOS · Desktop (KMP)
**User Stories:** DVX-US-001 · DVX-US-002 · DVX-US-003 · DVX-US-004 · DVX-US-033 · DVX-US-034

---

## Overview

Authentication is the entry gate to DiviDox. It covers user identity: creating an account, signing in with credentials or a third-party provider, recovering a forgotten password, and signing out. All flows must be seamless across Android, iOS, and Desktop.

---

## Problem Statement

Users need a secure and frictionless way to access their personal portfolio data from any supported platform. The authentication layer must protect sensitive financial information while minimising the steps required to reach the Dashboard.

---

## Goals

- Allow users to create an account with email/password.
- Allow returning users to sign in with email/password or Google OAuth.
- Allow users to recover access when they forget their password.
- Ensure the back stack is cleared after any successful authentication so the user cannot navigate back to the Login screen.

---

## Functional Requirements

### FR-01-01 · Login Screen

| # | Requirement |
|---|---|
| 1 | Display the DiviDox logo with a verified checkmark badge and the tagline "Track your dividends. Grow your wealth." |
| 2 | Provide an Email text field with email keyboard type and placeholder "Email address". |
| 3 | Validate email format on blur; show an inline error for invalid format. |
| 4 | Provide a Password text field with masking enabled and placeholder "Password". |
| 5 | Include a visibility toggle (eye icon) on the Password field to show/hide plain text. |
| 6 | Disable the Sign In button while either field is empty. |
| 7 | On Sign In tap, trigger email/password authentication with a loading spinner inside the button. |
| 8 | On authentication success, navigate to Dashboard and clear the back stack. |
| 9 | On authentication failure, display an error banner: "Incorrect email or password. Please try again." in error/red colour. |
| 10 | Clear the error banner automatically when the user begins editing any field. |
| 11 | Provide a "Continue with Google" outlined button that launches the native Google OAuth flow. |
| 12 | On Google OAuth success, navigate to Dashboard and clear the back stack. |
| 13 | On Google OAuth failure, show an inline error message below the button. |
| 14 | Provide a "Forgot Password" text link that navigates to the Password Recovery screen. |
| 15 | Provide a "Don't have an account? Sign Up" text link that navigates to the Create Account screen. |

### FR-01-02 · Create Account Screen

| # | Requirement |
|---|---|
| 1 | Display a close (X) button top-left that dismisses the flow and returns to Login. |
| 2 | Display the title "Create Account" bold and left-aligned. |
| 3 | Provide a Full Name text field (required) with placeholder "Johnathan Doe" and a person icon. |
| 4 | Provide an Email Address text field (required) with placeholder "name@example.com" and an envelope icon. |
| 5 | Validate email format on blur. Show "An account with this email already exists." if already registered. |
| 6 | Provide a Password text field (required) with masking and a lock icon (visibility toggle). |
| 7 | Provide a checkbox: "I agree to the Terms of Service and Privacy Policy." Both terms are tappable links. |
| 8 | Disable Create Account button until all fields are valid and the checkbox is checked. |
| 9 | On Create Account tap, show a loading spinner inside the button. |
| 10 | On success, navigate to Dashboard with back stack cleared. No email verification step in v1. |
| 11 | On server error, display: "Something went wrong. Please try again." in error/red colour. |
| 12 | Clear the error banner automatically when the user begins editing any field. |
| 13 | Provide an "Already have an account? Sign In" text link that navigates back to Login. |
| 14 | Display a Support link (question mark icon + "SUPPORT") in the footer that opens a help screen or modal. |
| 15 | Validate all fields on Submit, not on each keystroke; exception: email validates on blur. |

### FR-01-03 · Password Recovery Screen

| # | Requirement |
|---|---|
| 1 | Accessible via the "Forgot Password" link on the Login screen. |
| 2 | Provide an email input field for the registered account email. |
| 3 | Provide a "Send Reset Link" primary button. |
| 4 | On submission, always display a confirmation message regardless of whether the email exists (prevents user enumeration). |

### FR-01-04 · Session Lifecycle

| # | Requirement |
|---|---|
| 1 | On app cold start, show a loading/splash state while the app resolves the session — never flash the Login screen before the session check completes. |
| 2 | If a valid session exists on cold start, navigate directly to Dashboard without re-authentication. |
| 3 | If the session token is expired and the refresh token can renew it, renew silently and navigate to Dashboard. |
| 4 | If the session token is expired and cannot be refreshed (refresh token revoked or missing), navigate to Login with back stack cleared. |
| 5 | Session state is represented as `Loading → Authenticated(user)` or `Loading → Unauthenticated` — `Loading` is never exposed to the user beyond the splash screen. |
| 6 | On sign-out (DVX-US-032), the session is fully cleared and `SessionState` emits `Unauthenticated`, triggering navigation to Login. |

---

## Error & Edge Cases

| Scenario | Behaviour |
|---|---|
| Network unavailable during Sign In | Show error banner: "No internet connection. Please try again." |
| Google OAuth cancelled by user | Dismiss OAuth sheet; no error shown. |
| Google OAuth account not linked to a DiviDox account | Offer the user to create a new account with the Google email pre-filled. |
| Session token expired while app is backgrounded | On next foreground, redirect to Login silently. |
| User attempts to navigate back after successful login | Back navigation is blocked (back stack cleared). |

---

## Non-Functional Requirements

- Passwords must never be stored or logged in plain text on device or server.
- Authentication tokens must be stored in the platform secure store (Android Keystore / iOS Keychain / Desktop secure storage).
- Biometric re-authentication (see PRD-08) integrates with this layer for app-launch protection.
- All auth network calls must timeout after 10 seconds with an appropriate error message.

---

## Out of Scope (v1)

- Email verification after account creation.
- Apple Sign In (iOS only).
- Two-factor authentication (2FA).
- Social providers beyond Google (Facebook, Twitter, etc.).

---

## Open Questions

- Should we enforce a minimum password strength (length, complexity) on the Create Account screen?
- Should the "Forgot Password" flow be entirely email-based or support in-app OTP as well?
