## 1. Dependency & auth seam

- [x] 1.1 Add `supertokens-web-js` (blessed SDK); `bun install`; confirm the build still works.
- [x] 1.2 Define the `AuthSession` interface (`init`, `isSignedIn`, `username`, `getAccessToken`, `requestMagicLink(email)`, `consumeMagicLink()`, `signOut`) in `src/auth/auth-session.ts`; implement the real one backed by `supertokens-web-js` (header mode, app's own origin) as the ONLY importer of the SDK; type-only-import it elsewhere so tests never load the SDK.
- [x] 1.3 Provide a test fake `AuthSession` (drivable: set signed-in/username/token, record calls).
- [x] 1.4 Session store (`src/auth/session-store.ts`): reactive `{ status, username? }`, resolved once on boot via the seam; expose subscribe + snapshot. Tests: boot→anonymous / signed-in, sign-in/out updates.

## 2. Authenticated transport

- [x] 2.1 `authedFetch(input, init, session)`: attach `Authorization: Bearer <token>` from the seam; leave public reads unauthenticated. Tests: protected call carries the header, public read omits it.
- [x] 2.2 Update the streams API: `createStream({title,description})` (no username) and `endStream(id)` use `authedFetch`; drop `creatorKey` from types and the create-response validation; keep `listStreams` public. Update tests (Bearer sent, 401/409/403 surfaced, no creatorKey).

## 3. Sign-in flow, landing route, Home controls

- [x] 3.1 Sign-in view (`src/auth/sign-in.ts`): email form → "check your inbox" state via `requestMagicLink`; calm, style §6 email input. Tests: valid email → requests link + shows inbox state; invalid email blocked.
- [x] 3.2 Magic-link landing route (`/auth/verify`): on mount calls `consumeMagicLink`, sets the session, redirects to the remembered destination or Home; failure → calm "link didn't work" + back to sign-in. Wire into the router. Tests: success redirect, failure state.
- [x] 3.3 Home auth controls (`src/auth/auth-controls.ts`): Sign in (signed out) or username + Sign out (signed in), beside Start streaming; identity typography only. Tests: signed-out vs signed-in controls render.

## 4. Retire creatorKey; auth-gate start + room

- [x] 4.1 DELETE `src/streams/creator-key.ts` + its test; remove all references.
- [x] 4.2 Start modal: remove the username field (title + description only); signed-out Start-streaming click → sign-in prompt (remember destination); on 201 redirect (no key); 401 → sign-in; 409 → calm already-streaming; 400 → calm. Update tests.
- [x] 4.3 Room page: ownership by session (`signedIn && sessionUsername === stream.username`) drives End + publisher experience; remove creatorKey; End uses `authedFetch`, handles 204/404 redirect, 403/401 calm. Reload keeps ownership. Update tests.

## 5. Chat & media auth

- [x] 5.1 Chat: WS `join` carries the access token when signed in (no token when anon); composer shown only to signed-in users, else a calm "Sign in to chat" affordance; `error "auth_required"` handled calmly (prompts re-auth). Update chat tests.
- [x] 5.2 Media: media-token request drops `creatorKey`, attaches the Bearer token when signed in; creator flow driven by the server `role`. Update media-api + controller tests.

## 6. Sign-out (warn + end owned stream)

- [x] 6.1 Sign-out flow: if the user owns an active stream (found by session username) and is publishing, show a calm confirmation that signing out ends the stream; on confirm `DELETE` it (authed) then `signOut`; otherwise `signOut` directly. Return UI to anonymous. Tests: publishing → warn + end + sign-out; not-streaming → sign-out directly.

## 7. Style-law compliance & Definition of Done

- [x] 7.1 Run the `CONSTITUTION.style.md` §10 litmus across all auth surfaces (sign-in form, inbox-check, landing, Home controls, "Sign in to chat", sign-out confirmation) — the calmest in the product: tokens only, AA, radius 0, hairline borders, no shadows, correct fonts/scale/weights, visible focus, calm motion (prefers-reduced-motion), identity typography-only (no avatars/chips). Fix any violation. (AC10)
- [x] 7.2 Full suite green: `bun test` (new behavior + error paths, deterministic — fake AuthSession, mocked fetch, no SDK/network), `tsc --noEmit` strict clean, Biome clean with no inline disables, no `any`/unjustified `as`/`!`/`@ts-ignore` in the diff; `supertokens-web-js` imported ONLY by the seam.
- [x] 7.3 Regression sweep: re-run the prior features' portal tests under the new auth rules (start flow, room, chat, media) — all green with creatorKey fully removed (AC8). Confirm the Dockerfile builds (SDK bundled) and the static image serves incl. the `/auth/verify` landing route via SPA fallback.
- [x] 7.4 Coordinate the auth transport (Bearer HTTP + token in WS join) with streamer, and that `/auth/*` + JWKS reach `security` same-origin with devops. Compile the evidence-based done report with an explicit `CONSTITUTION.style.md` compliance statement (AC10). Never a bare "done".
