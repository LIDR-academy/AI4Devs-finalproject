# PRD-08 · Profile & Settings

**Status:** Draft
**Platform:** Android · iOS · Desktop (KMP)
**User Stories:** DVX-US-027 · DVX-US-028 · DVX-US-029 · DVX-US-030 · DVX-US-031 · DVX-US-032

---

## Overview

Profile & Settings is the user control centre for DiviDox. It covers security preferences (biometric lock), notification configuration, display settings (currency), support access, legal documents, data management (export, delete), and sign out. It is accessible from the Profile tab in the bottom navigation bar.

---

## Problem Statement

Users need a single, organised place to control how DiviDox behaves: how it protects their data, what notifications it sends, what currency it displays, and how to manage their account. Without this, users lose trust in the app's security and have no recourse for data portability or account removal.

---

## Goals

- Allow users to secure the app with biometric authentication.
- Allow users to configure relevant push notification types.
- Allow users to set a default display currency that propagates app-wide.
- Allow users to export their portfolio data.
- Allow users to delete their account with appropriate safeguards.
- Provide fast access to support and legal documents.

---

## Functional Requirements

### FR-08-01 · Screen Structure

| # | Requirement |
|---|---|
| 1 | Display "Profile & Settings" as the screen title (top left). |
| 2 | Settings are organised into labelled sections: Security & Preferences | Support & Help | Legal & About | Data Management. |
| 3 | App version displayed at the bottom: "v{major}.{minor}.{patch} (Build {number})" in small muted text. |

### FR-08-02 · Security & Preferences

| # | Requirement |
|---|---|
| 1 | **Biometric Lock** (toggle): Enables fingerprint / Face ID authentication on app launch. ON by default. |
| 2 | Biometric Lock takes effect immediately without requiring a separate save action. |
| 3 | On the next app launch after enabling, the biometric prompt is displayed before the user can access any screen. |
| 4 | **Notifications** (row with chevron): Opens a sub-screen to configure push notification preferences. |
| 5 | Notification options include (at minimum): dividend payment credits, price alerts, upcoming ex-dividend dates. |
| 6 | Notification preference changes are saved immediately. |
| 7 | **Default Currency** (inline toggle `[ USD | EUR ]`): Sets the base currency for all monetary displays across the app. |
| 8 | Currency switch takes effect instantly and recalculates all monetary values in real time. |
| 9 | Default Currency setting stays in sync with the USD/EUR toggle in the Dashboard header. |

### FR-08-03 · Support & Help

| # | Requirement |
|---|---|
| 1 | **Help Center / FAQs** (row with external link icon): Opens the Help Center in an in-app browser (WebView or Custom Tab). |
| 2 | **Contact Support** (outlined button): Opens the support contact flow (email composer or in-app chat). |

### FR-08-04 · Legal & About

| # | Requirement |
|---|---|
| 1 | **About DiviDox** (row with chevron): Opens a screen with app description, version info, and credits. |
| 2 | **Terms & Conditions** (row with chevron): Opens the full T&C document. |
| 3 | **Privacy Policy** (row with chevron): Opens the Privacy Policy document. |
| 4 | Legal documents open in an in-app reader or browser; user can scroll the full content. |

### FR-08-05 · Data Management

| # | Requirement |
|---|---|
| 1 | **Export Portfolio** (button with export icon): Triggers portfolio data export. |
| 2 | Export format: CSV or PDF (user choice via action sheet). |
| 3 | A loading indicator is shown while the file is being generated. |
| 4 | On completion, the native share sheet is displayed so the user can save or send the file. |
| 5 | **Delete Account** (button with delete icon, destructive red style): Initiates account deletion. |
| 6 | Delete Account requires a confirmation dialog: "Are you sure? This action is permanent and cannot be undone." |
| 7 | On confirmation of Delete Account, all user data is deleted server-side and the app returns to the Login screen with back stack cleared. |
| 8 | Delete Account requires the user to be currently authenticated. |

### FR-08-06 · Sign Out

| # | Requirement |
|---|---|
| 1 | Full-width red primary button labelled "Sign Out". |
| 2 | Requires a confirmation dialog before executing. |
| 3 | On confirmation, session token is invalidated, local cache is cleared, and the app returns to the Login screen with back stack cleared. |

---

## Error & Edge Cases

| Scenario | Behaviour |
|---|---|
| Biometric hardware not available on device | Biometric Lock toggle is hidden or disabled with a note: "Biometric authentication not available on this device." |
| Export fails (e.g., disk full, network error) | Show error: "Export failed. Please try again." Loading indicator dismissed. |
| Delete Account network failure | Show error: "Unable to delete account. Check your connection and try again." No data is deleted. |
| User enables notifications but OS permission not granted | Prompt the OS permission dialog. If denied, show in-app guidance to enable from device settings. |
| Sign Out while offline | Session is cleared locally; server invalidation retried on next connection. |

---

## Non-Functional Requirements

- Biometric authentication integrates with the platform-native APIs: Android BiometricPrompt, iOS LocalAuthentication (Face ID / Touch ID), Desktop credential store.
- Authentication tokens must be invalidated server-side on Sign Out and Delete Account.
- Export file must not be written to a publicly accessible location on the device; use the platform temp directory and share via the share sheet.
- Desktop platform: Biometric Lock and push notifications are out of scope for v1 (see Out of Scope).

---

## Out of Scope (v1)

- Profile photo / display name editing.
- In-app notifications centre (notification history).
- Push notifications on Desktop.
- Biometric Lock on Desktop.
- Multiple currency support beyond USD and EUR.
- Account linking (e.g., linking Google to an email/password account).

---

## Open Questions

- Should Sign Out clear locally cached market data, or only the authentication token and user-specific data?
- Should the Export include dividend history, or only current holdings?
- What is the support channel? Email, in-app chat (Intercom/Zendesk), or a web form?
