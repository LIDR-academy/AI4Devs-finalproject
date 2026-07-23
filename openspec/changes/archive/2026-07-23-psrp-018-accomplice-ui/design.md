## Context

The backend for Accomplice Management (PSRP-017) provides a REST API to invite, list, resend invites, and revoke access for accomplices. However, there is no user interface for event hosts to manage these accomplices. We need to add an Accomplice Panel to the Event Dashboard in the Angular frontend.

## Goals / Non-Goals

**Goals:**
- Provide a UI for event hosts to see all invited accomplices.
- Allow the host to invite a new accomplice by email and specify their permissions.
- Provide buttons/actions to resend magic links and revoke access for existing accomplices.
- Ensure the UI correctly reflects the status of accomplices (Pending, Active, Revoked).

**Non-Goals:**
- Modifying the existing Accomplice backend API endpoints.
- Implementing the Accomplice view itself (what the accomplice sees when they log in) – this ticket is strictly about the *Host's* panel to manage them.

## Decisions

1. **Angular Component Structure**:
   - Create a smart component `AccomplicePanelComponent` within the event dashboard module.
   - Use reactive forms to handle the "Invite Accomplice" input.
2. **State Management**:
   - Create an `AccompliceService` using Angular's `HttpClient` to communicate with the `api/accomplices` endpoints.
   - Use Angular Signals (or Observables, depending on the project standard) to manage the list of accomplices and UI state (loading, error, success).
3. **UI/UX**:
   - The panel will be displayed as a dedicated tab or section in the host's event dashboard.
   - A data table or card list will display current accomplices, showing their Email, Permissions, and Status.
   - Inline action buttons will be provided for "Resend Invite" and "Revoke".

## Risks / Trade-offs

- **Risk**: API integration issues if the endpoints expect specific request payloads not matching the frontend form.
  - **Mitigation**: Cross-reference the backend DTOs when building the frontend service models.
- **Risk**: Handling the UI state when revoking/resending.
  - **Mitigation**: Use optimistic UI updates or reload the accomplice list immediately after a successful action to keep the UI in sync.
