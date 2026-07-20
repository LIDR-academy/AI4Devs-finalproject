# portal-home-stream-lifecycle Specification

## Purpose
TBD - created by archiving change home-stream-lifecycle-v0. Update Purpose after archive.
## Requirements
### Requirement: Home lists live streams
The Home page (`/`) SHALL fetch `GET /streams` exactly once on load with no polling, and render each returned stream showing its `username` (as a mono label, per style §5) and its `title`. `description` SHALL be received and held client-side but SHALL NOT be displayed. The order of the received array SHALL be preserved and no ordering SHALL be assumed. A **Start streaming** primary action SHALL always be present. Each stream SHALL be a single keyboard-accessible link (a real anchor to `/stream/{id}`, not a bare `div`) with a visible focus state; activating it (click or Enter) SHALL navigate to that stream's room.

#### Scenario: Streams are live
- **WHEN** the visitor opens `/` and `GET /streams` returns two streams
- **THEN** each stream's username and title are rendered in the received order and the Start streaming action is visible

#### Scenario: Descriptions are not shown
- **WHEN** the visitor opens `/` and a returned stream carries a non-empty `description`
- **THEN** the username and title are displayed and the `description` is not rendered anywhere on Home

#### Scenario: Opening a stream from the list
- **WHEN** the visitor activates a stream's list entry (click or keyboard)
- **THEN** the portal navigates to that stream's `/stream/{id}` room

### Requirement: Home empty state
When `GET /streams` returns an empty array, Home SHALL show a single calm empty-state line and SHALL still present the Start streaming action.

#### Scenario: No streams are live
- **WHEN** the visitor opens `/` and `GET /streams` returns `[]`
- **THEN** one calm empty-state line is shown and the Start streaming action is visible

### Requirement: Start flow modal
The Start streaming action SHALL open a single modal containing a required `username` field (first), a required `title` field, and an optional `description` field — displayed in the order username, title, description — headed "Are you sure to start stream?" with a primary **Start** and a secondary **Cancel**. The modal SHALL trap focus, close on `Esc`, and return focus to the trigger on close.

#### Scenario: Modal opens from Home
- **WHEN** the visitor activates the Start streaming action
- **THEN** the modal opens with empty username, title, and description fields in that order, and Start / Cancel actions

#### Scenario: Cancel creates nothing
- **WHEN** the visitor cancels the modal (Cancel action or `Esc`)
- **THEN** the modal closes, no HTTP request is sent, and no stream is created

### Requirement: Client-side start validation
Before submitting, the start flow SHALL block submission when the trimmed `username` is empty, when the trimmed `title` is empty, or when the `description` exceeds 100 Unicode code points, counted as `[...str].length`. A blocked submission SHALL show a calm inline validation message and SHALL send no request. The `username` and `title` SHALL be trimmed before they are sent.

#### Scenario: Empty username blocked
- **WHEN** the visitor submits with a username that is empty or whitespace-only
- **THEN** submission is blocked client-side, a calm validation message is shown, and no request is sent

#### Scenario: Empty title blocked
- **WHEN** the visitor submits with a title that is empty or whitespace-only
- **THEN** submission is blocked client-side, a calm validation message is shown, and no request is sent

#### Scenario: Over-long description blocked
- **WHEN** the visitor submits with a description of 101 Unicode code points
- **THEN** submission is blocked client-side, a calm validation message is shown, and no request is sent

#### Scenario: Multi-byte description at the boundary is allowed
- **WHEN** the visitor submits a valid username and title with a description of exactly 100 code points containing multi-byte characters
- **THEN** the client accepts it and sends the request

### Requirement: Start submit and redirect
On a valid submit the start flow SHALL send `POST /streams` with `{ username, title, description }` (description defaulting to `""`). On `201` it SHALL retain the returned `creatorKey` in memory only (never `localStorage` or any persistent store) and redirect to `/stream/{id}` using the returned `id`. On `400` it SHALL show a calm inline validation message and SHALL remain on the flow without redirecting.

#### Scenario: Start succeeds
- **WHEN** the submit returns `201` with an `id` and a `creatorKey`
- **THEN** the portal retains the `creatorKey` in memory and navigates to `/stream/{id}` using that `id`

#### Scenario: creatorKey is never persisted
- **WHEN** the submit returns `201` with a `creatorKey`
- **THEN** the `creatorKey` is held only in the JS heap and is written to neither `localStorage` nor `sessionStorage` nor cookies

#### Scenario: Server rejects with 400
- **WHEN** the submit returns `400` (including input the client did not pre-check)
- **THEN** a calm inline validation message is shown, no redirect occurs, and no server-provided error text is surfaced

### Requirement: Stream page and end
The stream page (`/stream/{id}`) SHALL render the room experience (defined in the `portal-room-chat` capability) and SHALL provide an **End stream** action. Activating it SHALL send `DELETE /streams/{id}` and redirect to `/` on both `204` and `404`, without showing an error on `404`.

#### Scenario: End an existing stream
- **WHEN** End stream returns `204`
- **THEN** the portal redirects to `/`

#### Scenario: End an already-removed stream
- **WHEN** End stream returns `404`
- **THEN** the portal redirects to `/` without showing an error

### Requirement: Typed, validated wire boundary
All calls to the §6 HTTP contract SHALL live in a single non-UI streams module; UI components SHALL NOT call `fetch` directly. The module SHALL parse responses from `unknown` and validate their shape before returning them (each stream has string `id`, `username`, and `title`, and a present `description`; the create response additionally has a string `creatorKey`). A malformed or non-JSON success body SHALL be treated as a failure, not rendered.

#### Scenario: Malformed success body
- **WHEN** `GET /streams` returns `200` with a body that is not an array of valid stream objects
- **THEN** the module reports a failure and Home shows a calm generic line rather than rendering invalid data

#### Scenario: UI does not fetch directly
- **WHEN** a UI component needs stream data or a lifecycle action
- **THEN** it calls the streams module, which owns the `fetch`, and never issues the request itself

### Requirement: Opaque error body, status-keyed copy
The portal SHALL depend only on the HTTP status of a response and SHALL treat the error body as opaque, never surfacing server-provided message text. Failure copy SHALL be the portal's own calm wording keyed by status.

#### Scenario: Error body is not surfaced
- **WHEN** any request returns a non-OK status with a body such as `{ "error": "..." }`
- **THEN** the portal shows its own calm status-keyed copy and does not display the body's text

### Requirement: Style-law compliance
Every visible surface SHALL comply with `CONSTITUTION.style.md`: token-only colors (no arbitrary hex/rgb, no accent color), WCAG AA contrast, border-radius 0, `1px` hairline borders, no shadows/gradients/blurs, Inter + JetBrains Mono with the fixed type scale and weights 400/600, and motion limited to `opacity`/color transitions that are disabled under `prefers-reduced-motion`. Primary/secondary buttons, inputs, and visible focus states SHALL follow style §6.

#### Scenario: Reduced motion respected
- **WHEN** the environment sets `prefers-reduced-motion: reduce`
- **THEN** modal and state transitions render without motion

#### Scenario: Keyboard focus is visible
- **WHEN** the visitor moves focus with the keyboard to any interactive element (button, input, link)
- **THEN** a visible focus indicator is shown on that element

