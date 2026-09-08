# Quickstart: Push Notification Infrastructure (017)

End-to-end validation that the plumbing works **without** business triggers (those arrive in US-4.2+). Prerequisites first, then automated suites, then manual verification.

## Prerequisites

1. **Firebase project** with Cloud Messaging API (HTTP v1) enabled.
2. **Service account key**: Firebase console → Project settings → Service accounts → Generate new private key → save JSON locally, e.g. `secrets/firebase-sa.json` (never committed).
3. **Web Push certificate**: Cloud Messaging tab → copy the VAPID public key.
4. Backend `.env`:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/firebase-sa.json
   ```
   (`FCM_SERVER_KEY` is gone — remove it if present.)
5. Frontend `.env`: the seven `VITE_FIREBASE_*` vars from [contracts/frontend-push.md](./contracts/frontend-push.md).
6. Migrate + regenerate: `cd backend && npm run db:migrate && npm run db:generate`.

> Degradation check: with `FIREBASE_SERVICE_ACCOUNT_PATH` unset the backend must still boot and all tests pass (adapter = null ⇒ sends become persist-and-log-only) — mirrors calendar behavior.

## Automated validation

```bash
# Backend: adapter mapping, SendNotification branches (persist-first, never-throw,
# stale-token deactivation), endpoint integration (auth 401, validation 400, happy 200 upsert)
cd backend && npm test && npm run typecheck && npm run lint

# Frontend: pushManager flow guards/cooldown, repository payload shape
cd ../frontend && npm test && npm run typecheck && npm run lint
```

Constitution §II minimums covered by these suites: endpoint happy path **and** validation-error via Supertest; `SendNotification` every branch incl. provider-outage and partial-failure paths.

## Manual scenario A — device registration (spec US1, SC-007)

```bash
# login → capture accessToken, then:
curl -s -X POST localhost:3001/api/v1/notifications/device-token \
  -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"token":"AAAA...long-test-token-at-least-32-chars","platform":"WEB"}'
# expect 200 {"id":"<uuid>","platform":"WEB",...}

# repeat identically → expect 200 and NO second row:
#   select count(*) from "DeviceToken" where token='AAAA...';   -- 1
# register same token under another user → row's user_id flips (latecomer wins)
# drop the Authorization header → 401; send {"token":"short"} → 400 VALIDATION_ERROR
```

## Manual scenario B — receive a real push (spec US2/SC-004/SC-006)

1. `cd frontend && npm run dev`; sign in on two browser profiles/devices, accept the permission affordance (appears after one navigation, not on load), confirm both tokens land in `DeviceToken`.
2. Close both tabs.
3. Fire a test notification through the real stack:
   ```bash
   cd backend && npx tsx -e '
     import { container } from "./src/config/container.js";
     await container.sendNotification.send({ recipientId: "<USER_UUID>", type: 9, content: "Test: te has apuntado a la waiting list" });'
   ```
4. Expect within ~10 s: OS notification on **both** devices ("Coacher" / "Test: …"); clicking it opens/focuses the app at `/`.
5. Verify persistence: `select "notification_type", content, is_read from "Notification" order by created_at desc limit 1;` → row exists, `is_read = f`, regardless of delivery outcome.

## Manual scenario C — failure isolation (spec US3/SC-005)

1. Temporarily point `FIREBASE_SERVICE_ACCOUNT_PATH` at an invalid JSON file and restart the API.
2. Repeat step 3 above.
3. Expect: the tsx call resolves without throwing; a pino error log records recipient/type/cause; the `Notification` row still exists (scenario B step 5); restore the env afterwards.

## Done when

- All suites green; scenarios A–C behave as written.
- `docs/api-specifications.md` contains the new endpoint section + summary-table row (see [contracts/api.md](./contracts/api.md)).
- No `^`/`~` on the two new deps; `npm audit --audit-level=high` clean in both packages.
