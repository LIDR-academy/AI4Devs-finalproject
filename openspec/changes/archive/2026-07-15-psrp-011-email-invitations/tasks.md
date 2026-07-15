## 1. Core Services and DTOs

- [x] 1.1 Create `InvitationResponse.cs` and `SendInvitationsRequest.cs` in `Aura.Core/DTOs/Invitations/`.
- [x] 1.2 Define `IInvitationService.cs` with `CreateInvitationsForEventAsync`, `SendInvitationsAsync`, and `GetInvitationsByEventAsync`.
- [x] 1.3 Implement `InvitationService.cs` integrating with `IEventRepository`, `IGuestRepository`, `IInvitationRepository`, and `IQueueService`.

## 2. Token Generation and DB Logic

- [x] 2.1 Add secure token generation logic (`RandomNumberGenerator.GetBytes(32)` to Base64) in `InvitationService`.
- [x] 2.2 Ensure the `Invitations` table/entity tracks `TokenHash`, `SentVia`, `SentAt`, and `DeliveryStatus`.

## 3. API Endpoints

- [x] 3.1 Create `InvitationsController.cs` in `Aura.Api/Controllers/`.
- [x] 3.2 Implement `POST /api/events/{slug}/invitations/send` endpoint to trigger invitation sending.
- [x] 3.3 Implement `GET /api/events/{slug}/invitations` endpoint to retrieve guest invitation statuses.

## 4. Frontend Integration

- [x] 4.1 Update `invitation.service.ts` to include the new API endpoints.
- [x] 4.2 Add a "Send Email Invitations" button to the guest manager page with a confirmation dialog.
- [x] 4.3 Add a delivery status column in the guest table with a badge (pending, sent, delivered, failed).
- [x] 4.4 Implement polling (every 10 seconds) in `guest-manager.page.ts` to fetch updated delivery statuses.

## 5. Testing

- [x] 5.1 Write unit tests for the token generation and hashing in `InvitationService`.
- [x] 5.2 Write unit tests ensuring `IQueueService` is called correctly when sending invitations.
