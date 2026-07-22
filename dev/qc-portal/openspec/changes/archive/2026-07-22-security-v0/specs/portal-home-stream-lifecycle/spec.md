## MODIFIED Requirements

### Requirement: Start flow modal
Start streaming SHALL remain visible to everyone. A signed-out click SHALL route to a calm sign-in prompt (remembering the intended destination), not open the modal. When signed in, the Start streaming action SHALL open a single modal containing a required `title` field and an optional `description` field (the username field is removed — username comes from the account), headed "Are you sure to start stream?" with a primary **Start** and a secondary **Cancel**. The modal SHALL trap focus, close on `Esc`, and return focus to the trigger on close.

#### Scenario: Signed-out start routes to sign-in
- **WHEN** an anonymous visitor activates Start streaming
- **THEN** a calm sign-in prompt is shown (the action was visible, not hidden) and no modal opens

#### Scenario: Modal opens for a signed-in user
- **WHEN** a signed-in user activates the Start streaming action
- **THEN** the modal opens with empty title and description fields (no username field) and Start / Cancel actions

#### Scenario: Cancel creates nothing
- **WHEN** the visitor cancels the modal (Cancel action or `Esc`)
- **THEN** the modal closes, no HTTP request is sent, and no stream is created

### Requirement: Client-side start validation
Before submitting, the start flow SHALL block submission when the trimmed `title` is empty or when the `description` exceeds 100 Unicode code points, counted as `[...str].length`. A blocked submission SHALL show a calm inline validation message and SHALL send no request. The `title` SHALL be trimmed before it is sent.

#### Scenario: Empty title blocked
- **WHEN** the visitor submits with a title that is empty or whitespace-only
- **THEN** submission is blocked client-side, a calm validation message is shown, and no request is sent

#### Scenario: Over-long description blocked
- **WHEN** the visitor submits with a description of 101 Unicode code points
- **THEN** submission is blocked client-side, a calm validation message is shown, and no request is sent

#### Scenario: Multi-byte description at the boundary is allowed
- **WHEN** the visitor submits a valid title with a description of exactly 100 code points containing multi-byte characters
- **THEN** the client accepts it and sends the request

### Requirement: Start submit and redirect
On a valid submit the start flow SHALL send `POST /streams` with `{ title, description }` (description defaulting to `""`) carrying `Authorization: Bearer <access token>`. On `201` it SHALL redirect to `/stream/{id}` using the returned `id` (there is no `creatorKey`). On `401` it SHALL route to a calm sign-in prompt. On `409` it SHALL show a calm "you already have an active stream" message. On `400` it SHALL show a calm inline validation message and remain on the flow without redirecting.

#### Scenario: Start succeeds
- **WHEN** the submit returns `201` with an `id`
- **THEN** the portal navigates to `/stream/{id}` using that `id`, and no creatorKey is read or stored

#### Scenario: Unauthenticated start
- **WHEN** the submit returns `401`
- **THEN** a calm sign-in prompt is shown and no redirect occurs

#### Scenario: Already streaming
- **WHEN** the submit returns `409`
- **THEN** a calm "you already have an active stream" message is shown and no redirect occurs

#### Scenario: Server rejects with 400
- **WHEN** the submit returns `400`
- **THEN** a calm inline validation message is shown, no redirect occurs, and no server-provided error text is surfaced

### Requirement: Stream page and end
The stream page (`/stream/{id}`) SHALL render the room experience (defined in the `portal-room-chat` capability) and SHALL provide an **End stream** action to the signed-in owner. Activating it SHALL send `DELETE /streams/{id}` with `Authorization: Bearer <access token>` and redirect to `/` on both `204` and `404`, without showing an error on `404`. On `403` (not the owner) or `401` it SHALL show a calm inline message and not redirect.

#### Scenario: Owner ends an existing stream
- **WHEN** the owner's End stream returns `204`
- **THEN** the portal redirects to `/`

#### Scenario: End an already-removed stream
- **WHEN** End stream returns `404`
- **THEN** the portal redirects to `/` without showing an error

#### Scenario: Not the owner
- **WHEN** End stream returns `403` or `401`
- **THEN** a calm inline message is shown and the portal does not redirect

### Requirement: Typed, validated wire boundary
All calls to the §6 HTTP contract SHALL live in a single non-UI streams module; UI components SHALL NOT call `fetch` directly. Protected calls (`POST`/`DELETE /streams`) SHALL attach the Bearer access token via the auth seam; public reads SHALL not. The module SHALL parse responses from `unknown` and validate their shape before returning them (each stream has string `id`, `username`, and `title`, and a present `description`; there is no `creatorKey`). A malformed or non-JSON success body SHALL be treated as a failure, not rendered.

#### Scenario: Malformed success body
- **WHEN** `GET /streams` returns `200` with a body that is not an array of valid stream objects
- **THEN** the module reports a failure and Home shows a calm generic line rather than rendering invalid data

#### Scenario: UI does not fetch directly
- **WHEN** a UI component needs stream data or a lifecycle action
- **THEN** it calls the streams module, which owns the `fetch`, and never issues the request itself
