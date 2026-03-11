# US-103: User Registration Page

[Trello Card](https://trello.com/c/K8jsVaWj)



## Description
As a **new user**, I want to register for the IPFS gateway service, so that I can receive an API key and start using the platform.

## Priority
🔴 **Critical** - Required for user onboarding.

## Difficulty
⭐⭐ Medium

## Acceptance Criteria
- [x] Registration form with email and password fields
- [x] Client-side validation for email format and password strength
- [x] Real-time validation feedback
- [x] Submit button with loading state
- [x] Success message displays API key once and prominently
- [x] Copy-to-clipboard functionality for API key
- [x] Download/export option is provided so users can save the API key once
- [x] Link to login page for existing users
- [x] Error messages are user-friendly and actionable
- [x] Form is accessible (ARIA labels, keyboard navigation)
- [x] Redirect to dashboard after successful registration

## Form Fields
| Field | Type | Validation |
|-------|------|------------|
| Email | email | Required, valid format, max 255 chars |
| Password | password | Required, min 8 chars, 1 uppercase, 1 number |
| Confirm Password | password | Must match password |

## Technical Notes
- Use React Hook Form for form management
- Use Zod for schema validation
- Implement password strength indicator
- Show/hide password toggle
- Do not persist API keys in browser storage (`localStorage`/`sessionStorage`)
- In registration success/export logic, show key once with copy + download options only
- If persistence is required, prefer server-side storage/proxy patterns or OS-level secure storage designs
- Use toast notifications for feedback

## Dependencies
- US-101: Frontend Project Setup
- US-102: Home Page and Navigation
- US-003: User Registration (Backend)

## Estimated Effort
5 hours

## Completion Status
- [x] 100% - Completed

## Workflow Diagram
```mermaid
flowchart TD
    A[Registration Page] --> B[Fill Form]
    B --> C{Client Validation}
    C -->|Invalid| D[Show Errors]
    D --> B
    C -->|Valid| E[Submit to API]
    E --> F{API Response}
    F -->|Error| G[Show Error Message]
    G --> B
    F -->|Success| H[Show API Key]
    H --> I[Copy to Clipboard Option]
    I --> J[Redirect to Dashboard]
```

## Wireframe
```text
+--------------------------------------------------+
|                Create Account                     |
+--------------------------------------------------+
|                                                  |
|  Email:                                          |
|  +--------------------------------------------+  |
|  | user@example.com                           |  |
|  +--------------------------------------------+  |
|                                                  |
|  Password:                                       |
|  +--------------------------------------------+  |
|  | ••••••••••••                          👁️   |  |
|  +--------------------------------------------+  |
|  Strength: ████████░░ Strong                     |
|                                                  |
|  Confirm Password:                               |
|  +--------------------------------------------+  |
|  | ••••••••••••                          👁️   |  |
|  +--------------------------------------------+  |
|                                                  |
|  [        Create Account        ]                |
|                                                  |
|  Already have an account? Login                  |
|                                                  |
+--------------------------------------------------+
```

## Success Modal
```text
+--------------------------------------------------+
|            🎉 Registration Successful!            |
+--------------------------------------------------+
|                                                  |
|  Your API Key:                                   |
|  +--------------------------------------------+  |
|  | ipfs_gw_abc123xyz789...             [📋]  |  |
|  +--------------------------------------------+  |
|                                                  |
|  [Download .txt]                                 |
|                                                  |
|  ⚠️ This key is shown once. Do not store it in   |
|  localStorage/sessionStorage.                    |
|  Use server-side or OS-level secure storage if   |
|  persistence is required.                        |
|                                                  |
|  [        Go to Dashboard        ]               |
|                                                  |
+--------------------------------------------------+
```

## Related Tasks
- [TASK-US-103-01: Create Registration Form](../../tasks/frontend/TASK-US-103-01-create-registration-form.md)
- [TASK-US-103-02: Implement Validation](../../tasks/frontend/TASK-US-103-02-implement-validation.md)
- [TASK-US-103-03: Create Success Modal](../../tasks/frontend/TASK-US-103-03-create-success-modal.md)
- [TASK-US-103-04: Add Accessibility](../../tasks/frontend/TASK-US-103-04-add-accessibility.md)
