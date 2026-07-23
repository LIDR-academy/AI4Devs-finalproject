## 1. Accomplice Auth and Flow

- [x] 1.1 Create `AccompliceGuard` to verify JWT, check role='accomplice', and check event expiry.
- [x] 1.2 Implement route `/accomplice/:token` that reads the token, calls the verify endpoint, stores the JWT securely, and redirects to the panel.

## 2. Core UI Components

- [x] 2.1 Create the `SwipeButtonComponent` with touch events (touchstart, move, end) and desktop fallback (mousedown, move, up).
- [x] 2.2 Implement 80% threshold logic, snap-back animation for incomplete swipes, and haptic feedback (`navigator.vibrate`) upon trigger.
- [x] 2.3 Implement tap prevention, showing a "Swipe to send" hint when tapped without swiping.

## 3. Accomplice Panel Page Integration

- [x] 3.1 Implement the `AccomplicePanelPage` displaying event metadata.
- [x] 3.2 Use `LiveMessageService` (to be created) to fetch `message-templates` and populate the UI with multiple `SwipeButtonComponent` instances.
- [x] 3.3 Implement `interval(5000)` polling for `LiveMessages`, displaying them via `MessageHistoryComponent`.
- [x] 3.4 Implement `RsvpSummaryComponent` checking the `view_rsvps` permission before rendering.
- [x] 3.5 Handle the expired token state UI ("Access has expired").

## 4. Testing

- [x] 4.1 Write component tests for `SwipeButtonComponent` verifying the swipe threshold, snap-back, and send events.
- [x] 4.2 Test the `AccompliceGuard` for authorization logic.
