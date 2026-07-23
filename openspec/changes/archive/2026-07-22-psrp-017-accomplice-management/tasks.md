## 1. Domain and Repositories

- [x] 1.1 Update `Accomplice` entity to include `TokenHash`, `Permissions` (string/jsonb), `ExpiresAt`, and `IsRevoked`.
- [x] 1.2 Create or update `IAccompliceRepository` and `AccompliceRepository` to support lookups by `EventId` and `TokenHash`.

## 2. Core Service Implementation

- [x] 2.1 Define `IAccompliceService` with methods: `GrantAccessAsync`, `RevokeAccessAsync`, `ResendMagicLinkAsync`, and `GetAccomplicesByEventAsync`.
- [x] 2.2 Implement `AccompliceService.GrantAccessAsync` to generate tokens, store hashes, and enqueue magic link emails via `email:queue`.
- [x] 2.3 Implement `AccompliceService.RevokeAccessAsync` and `ResendMagicLinkAsync` to manage accomplice access lifecycles.
- [x] 2.4 Implement `AccompliceService.VerifyTokenAsync` to validate hashes, expiration, revocation status, and issue a JWT string.

## 3. Controllers and API Endpoints

- [x] 3.1 Create `AccomplicesController` for host actions: `GET /api/accomplices/{eventSlug}`, `POST /api/accomplices/{eventSlug}/grant`, `POST /api/accomplices/{eventSlug}/revoke`, `POST /api/accomplices/{eventSlug}/resend`.
- [x] 3.2 Add the `GET /api/accomplices/verify` endpoint to set the `aura_session` and `aura_csrf` cookies securely upon token validation.

## 4. Frontend - Accomplice Management UI

- [x] 4.1 Create `AccompliceService` in Angular to call the backend APIs.
- [x] 4.2 Create `AccompliceManagementComponent` in the event dashboard to display the invite form and the list of accomplices.
- [x] 4.3 Add status badges (Active, Revoked, Expired) and actions (Revoke, Resend) to the accomplice list view.
- [x] 4.4 Integrate the new component into the main Dashboard page tabs/sections.

## 5. Testing

- [x] 5.1 Write unit tests for `AccompliceService` focusing on token generation, validation, expiration, and revocation.
- [x] 5.2 Validate that the `LiveMessagesController` correctly enforces the `accomplice` role in its Authorization policy and validates CSRF.
