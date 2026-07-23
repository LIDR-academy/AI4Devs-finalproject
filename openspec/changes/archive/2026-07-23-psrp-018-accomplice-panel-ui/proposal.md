## Why

The event host relies on "accomplices" to send live event updates while they are busy. We need an intuitive, mobile-optimized interface that allows accomplices to easily send these updates. A swipe-to-send gesture prevents accidental sends and provides a smooth, reliable experience during the event.

## What Changes

- Create the accomplice panel page to show event header, message template buttons, and sent history.
- Implement a mobile-first `SwipeButtonComponent` with a swipe-to-send gesture (80% threshold, visual feedback, haptics).
- Provide desktop fallback (click-and-drag) and tap prevention ("Swipe to send" tooltip).
- Handle partial swipes by reverting the button if released before the threshold.
- Track message delivery status via polling (`GET /api/events/{slug}/live-messages`) and show sent message history.
- Display an RSVP summary view if the accomplice has the `view_rsvps` permission.
- Integrate magic link verification to authenticate the accomplice securely, handling expired/revoked links gracefully.

## Capabilities

### New Capabilities
- `accomplice-panel-ui`: Mobile-optimized panel for accomplices to send live messages via swipe gestures and view event status.

### Modified Capabilities

## Impact

- **Frontend (`frontend/src/app/features/accomplice`)**: New UI components (`SwipeButtonComponent`, `MessageHistoryComponent`, `RsvpSummaryComponent`) and pages (`AccomplicePanelPage`) for the accomplice role.
- **Frontend (`frontend/src/app/core`)**: New route guard `AccompliceGuard` and services for hitting live message endpoints.
- **UX**: Introduces advanced touch interactions (swipe-to-send) and haptics for the accomplice interface.
