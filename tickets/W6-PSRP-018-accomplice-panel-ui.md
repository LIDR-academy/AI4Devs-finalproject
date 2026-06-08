## PSRP-018: feat(accomplice): accomplice-panel-ui

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W6
**Dependencies:** PSRP-016, PSRP-017

## Feature Summary
Implement the accomplice panel frontend: a mobile-first, touch-optimized interface for sending live event updates via swipe-to-send gestures. Includes magic link access flow, message template buttons with swipe gesture (80% threshold), delivery status tracking, sent message history, RSVP summary view (if permitted), and desktop fallback (click-and-drag). This is the killer feature UI that brings the Live Guest Journey to life.

## Requirements
- [ ] Implement accomplice access flow: read token from URL `/accomplice/:token`, call verify endpoint, store JWT, redirect to panel
- [ ] Implement accomplice auth guard: check JWT validity, check role='accomplice', check event not expired
- [ ] Implement accomplice panel page (`features/accomplice/pages/accomplice-panel.page.ts`) with: event header (couple names, date), message template buttons, sent message history, RSVP summary tab
- [ ] Implement `SwipeButtonComponent` with touch gesture: swipe left-to-right, 80% threshold to send, visual progress indicator during swipe, haptic feedback on mobile (navigator.vibrate)
- [ ] Implement desktop fallback: click-and-drag alternative for swipe (mousedown + mousemove + mouseup)
- [ ] Implement tap prevention: tapping (not swiping) shows "Swipe to send" hint tooltip
- [ ] Implement partial swipe reset: if released before 80%, button returns to original position with animation
- [ ] Implement send flow: swipe complete → POST /api/live/{token}/send → button shows "Sending..." → "Sent" confirmation with checkmark
- [ ] Implement delivery status: poll `GET /api/events/{slug}/live-messages` every 5 seconds, update button status (pending, sent, delivered, failed)
- [ ] Implement sent message history: scrollable list below buttons showing sent messages with timestamps and delivery status
- [ ] Implement RSVP summary view (if permission includes "view_rsvps"): tab or toggle showing confirmed/declined/pending counts
- [ ] Implement message template display: icon + label + default message preview. Host-customized messages shown instead of defaults
- [ ] Implement expired access state: if token is expired, show "Access has expired" message with contact host info
- [ ] Implement mobile-first responsive design: large touch targets (min 44px), full-width buttons, vertical layout
- [ ] Write component tests for swipe gesture (threshold, reset, send trigger) and panel state management

## Technical Notes
- **Backend:** Consumes endpoints from PSRP-016 (POST /api/live/{token}/send, GET /api/events/{slug}/message-templates, GET /api/events/{slug}/live-messages) and PSRP-017 (GET /api/accomplices/verify)
- **Frontend:**
  - Swipe gesture: use Angular CDK DragDrop or custom touch event handling (touchstart, touchmove, touchend)
  - Swipe threshold: track touch X delta. If deltaX > 80% of button width, trigger send. Otherwise, reset
  - Visual feedback: button background fills with progress color during swipe. On complete, show checkmark animation
  - Haptic: `navigator.vibrate(50)` on send trigger (mobile only, check for API support)
  - Desktop: mousedown + mousemove + mouseup events mapped to same logic as touch
  - State management: Angular signals for panel state (messages, deliveryStatus, sentHistory)
  - Polling: `interval(5000)` for delivery status updates
  - Layout: event header (top), message buttons (center, vertical stack), sent history (bottom, scrollable), RSVP summary (tab/toggle)
- **Database:** N/A (reads from API)
- **Integrations:** N/A
- **Key files:**
  - `frontend/src/app/features/accomplice/pages/accomplice-panel.page.ts`
  - `frontend/src/app/features/accomplice/components/swipe-button.component.ts`
  - `frontend/src/app/features/accomplice/components/message-history.component.ts`
  - `frontend/src/app/features/accomplice/components/rsvp-summary.component.ts`
  - `frontend/src/app/core/auth/accomplice.guard.ts`
  - `frontend/src/app/core/services/accomplice.service.ts`
  - `frontend/src/app/core/services/live-message.service.ts`

## Acceptance Criteria
- [ ] AC1: Given an accomplice swipes a message button left-to-right past 80%, when the swipe is completed, then the message is sent, the button shows "Sent" with a checkmark, and the message appears in the sent history
- [ ] AC2: Given an accomplice taps (not swipes) a message button, when the tap occurs, then nothing happens and a hint shows "Swipe to send"
- [ ] AC3: Given an accomplice starts swiping but releases before 80%, when the finger is released, then the button returns to original position with animation and no message is sent
- [ ] AC4: Given the host has customized a message template, when the accomplice views the panel, then the custom message is displayed instead of the default
- [ ] AC5: Given messages have been sent, when the accomplice scrolls down, then sent messages are listed with timestamps and delivery status (pending, sent, delivered, failed)
- [ ] AC6: Given an accomplice tries to access the panel after EventDate + 1 day, when the page loads, then "Access has expired" is shown with contact information

## Related Items
- **PRD section:** 06-mvp-features.md (6.4.1 Accomplice Magic-Link Panel, 6.4.2 Pre-Configured Swipe-to-Send Buttons, US-LGJ-02 through US-LGJ-04, AC-LGJ-02 through AC-LGJ-06, AC-SS-01 through AC-SS-05)
- **Architecture:** 02-components.md (Accomplice Panel)
- **Data model:** entities.md (Accomplices, MessageTemplates, LiveMessages)

## Blockers
Blocked by: PSRP-016, PSRP-017

## Branch Name
`feature/PSRP-018-accomplice-panel-ui`
