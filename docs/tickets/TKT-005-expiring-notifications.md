# TKT-005 - Expiring Soon Notifications

## Metadata
- Type: Backend + Frontend
- Priority: P1
- User Story: US-005
- Main domains: Notifications, Settings

## Objective
Deliver 3-day threshold notification generation with per-user enable/disable preferences.

## Scope
In scope:
- Notification preference API.
- Threshold evaluation job.
- Event publication to notification channel.

Out of scope:
- Quiet hours.
- Per-category thresholds.

## API
- GET /api/settings/notifications
- PATCH /api/settings/notifications

## Data
- NOTIFICATION_PREFERENCE
- PANTRY_ITEM

## Technical tasks
1. Implement preference persistence and retrieval.
2. Implement scheduler that evaluates 3-day threshold.
3. Publish alert events only for enabled users.
4. Build settings toggles on UI.

## Testing
- Unit: threshold evaluator.
- Integration: preferences respected by notification generation.
- E2E: toggle preference and validate delivery behavior.

## Acceptance criteria
1. Expiring items produce notification events.
2. Disabled preferences suppress delivery.
3. Re-enabled preferences resume delivery.

## Definition of done
- Notification metrics and error logs implemented.
- Boundary-day test cases pass.
