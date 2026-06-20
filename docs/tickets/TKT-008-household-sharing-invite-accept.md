# TKT-008 - Household Sharing Invite and Accept

## Metadata
- Type: Full-Stack
- Priority: P0
- User Story: US-008
- Main domains: Sharing, Households

## Objective
Implement invitation-based pantry sharing for one additional household member.

## Scope
In scope:
- Invite endpoint.
- Accept invitation endpoint.
- Members list endpoint.
- Shared pantry visibility behavior.

Out of scope:
- Multi-role permissions beyond OWNER/MEMBER.
- Group management for large households.

## API
- POST /api/households/:id/invitations
- POST /api/invitations/:id/accept
- GET /api/households/:id/members

## Data
- HOUSEHOLD
- HOUSEHOLD_MEMBER
- HOUSEHOLD_INVITATION

## Technical tasks
1. Implement invitation lifecycle states and expiry policy.
2. Enforce unique active invitation constraints.
3. Persist membership on acceptance.
4. Enforce household-level access in pantry endpoints.

## Testing
- Unit: invitation lifecycle transitions.
- Integration: invite + accept + membership creation.
- E2E: two-user shared visibility scenario.

## Acceptance criteria
1. User can invite another user by email.
2. Invitee can accept and join household.
3. Shared pantry data is visible to both users.

## Definition of done
- Access control checks pass for all sharing endpoints.
- Membership synchronization validated in integration tests.
