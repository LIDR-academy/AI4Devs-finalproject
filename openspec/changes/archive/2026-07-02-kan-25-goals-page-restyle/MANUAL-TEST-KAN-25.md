# Manual test — KAN-25 (Goals page restyle)

## Prerequisites

- Backend + frontend running.
- Authenticated user.

## Goals route

1. Navigate to `/goals`.
2. Verify it no longer shows placeholder content.
3. Verify page header and layout are design-system aligned and overflow-free.

## Annual goal behavior

1. Create annual target if none exists.
2. Edit existing target.
3. Verify progress bar and forecast remain visible and updated after save.

## Accessibility and responsiveness

1. Tab through controls and verify visible focus.
2. Resize viewport (desktop/tablet/mobile); layout reflows without horizontal scroll.
