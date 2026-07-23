## Context

The backend logic for the accomplice features is implemented (PSRP-016, PSRP-017). This includes endpoints to verify the magic link, issue a JWT, send live messages, and get message templates. We now need to build the frontend accomplice panel that utilizes these endpoints. This UI will be accessed primarily on mobile devices during a live event. The key feature is a swipe-to-send button that prevents accidental triggers and provides satisfying haptic/visual feedback.

## Goals / Non-Goals

**Goals:**
- Build the `AccomplicePanelPage` and its routing, guarded by `AccompliceGuard`.
- Implement a robust `SwipeButtonComponent` with touch events (touchstart, move, end), an 80% activation threshold, and smooth CSS transitions.
- Poll the live messages endpoint to display delivery status updates.
- Create a clear, mobile-optimized UI.

**Non-Goals:**
- Allowing accomplices to create new message templates (they can only use existing ones).
- Modifying backend endpoints.
- Building the host-side configuration (already done).

## Decisions

**1. Swipe Gesture Implementation:**
- **Decision:** Use custom touch event handlers (`touchstart`, `touchmove`, `touchend`) combined with Angular HostListeners for desktop fallback (`mousedown`, `mousemove`, `mouseup`).
- **Rationale:** While Angular CDK DragDrop is an option, a 1D swipe-to-confirm button with a specific 80% threshold and snap-back animation is highly specific and often easier to implement cleanly with native pointer/touch events and CSS `transform: translateX()`.

**2. Polling for Delivery Status:**
- **Decision:** Use RxJS `interval(5000)` combined with `switchMap` to poll `GET /api/events/{slug}/live-messages`.
- **Rationale:** Real-time websockets (SignalR) would be more efficient but are not strictly necessary yet. Polling every 5 seconds provides a good balance between responsiveness and complexity for MVP.

**3. Haptic Feedback:**
- **Decision:** Use `navigator.vibrate(50)` when the 80% threshold is crossed and the message is triggered.
- **Rationale:** Provides physical confirmation to the user, increasing confidence in the action on mobile devices. Will include a check to ensure `navigator.vibrate` is supported in the browser.

## Risks / Trade-offs

- **Risk:** Swipe gestures can be tricky across different mobile browsers and OS versions (e.g., conflicting with native edge-swipes or scrolling).
  - **Mitigation:** Use `touch-action: pan-y` in CSS to disable horizontal browser gestures on the button, ensuring the swipe goes to our component.
- **Risk:** Polling could drain battery or make unnecessary requests if the page is left open.
  - **Mitigation:** Ensure the polling subscription is properly unsubscribed in `ngOnDestroy` of the component.
