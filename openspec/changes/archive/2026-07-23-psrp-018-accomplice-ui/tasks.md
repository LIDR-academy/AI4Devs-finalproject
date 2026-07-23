## 1. Setup & Integration

- [x] 1.1 Generate the `AccomplicesPanel` component in the frontend using Angular CLI.
- [x] 1.2 Create an `AccompliceService` with methods to interact with the backend APIs (`GET`, `POST` for invite, `POST` for resend, `POST` for revoke).
- [x] 1.3 Add the necessary TypeScript interfaces for Accomplice DTOs (e.g. `AccompliceResponse`, `InviteAccompliceRequest`).

## 2. UI Components

- [x] 2.1 Implement the Accomplice List view within the panel (showing Email, Permissions, Status).
- [x] 2.2 Add an "Invite Accomplice" form within the panel with email validation and a permission selector.
- [x] 2.3 Implement the action buttons per row: "Resend Invite" (if pending) and "Revoke Access" (if active/pending).
- [x] 2.4 Add visual feedback (toasts or inline messages) on successful or failed actions (e.g., "Invite Sent", "Access Revoked").

## 3. Integration & Testing

- [x] 3.1 Wire up the Invite form submit to the `AccompliceService.inviteAccomplice` method.
- [x] 3.2 Wire up the Resend/Revoke actions to their respective service methods and update the UI list optimism.
- [x] 3.3 Verify functionality manually by creating an event, inviting an accomplice, revoking access, and resending the link.
