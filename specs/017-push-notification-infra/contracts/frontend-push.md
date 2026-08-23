# Frontend Push Contract (017)

Defines the interface between backend dispatch, the service worker, and the page — the three places that must agree for a push to be received, displayed, and clickable.

## 1. FCM message payload (backend → device)

Sent by `FCMNotificationAdapter` via Admin SDK HTTP v1. Every message carries BOTH a `notification` block (browser display) and a `data` block (click routing + traceability):

```json
{
  "notification": { "title": "Coacher", "body": "<rendered PRD §7 text>" },
  "data": {
    "notificationId": "uuid",
    "type": "7",
    "classId": "uuid | omitted",
    "link": "/classes/<id> | /calendar | omitted"
  }
}
```

- `title` is constant `"Coacher"`; `body` carries the catalog wording (PRD §7) — identical to the persisted `Notification.content`.
- `data.type` is the stringified catalog number 1–12.
- Consumers: service worker `push.js` (display + click routing). The page does **not** render OS notifications in the foreground (`onMessage` = log only, no duplicate toast this story).

## 2. Service worker behavior (`public/service-worker/push.js`)

Loaded into the generated Workbox SW via `workbox.importScripts`. Dependency-free; no Firebase code.

| Event | Contract |
|---|---|
| `push` | Parse `event.data.json()`; call `showNotification(title, { body, icon: "/icon-192.png", tag: data.notificationId, data })`. Malformed/absent payload ⇒ log and swallow (never throw out of the handler). |
| `notificationclick` | `event.notification.close()`; if an app window client exists → `client.focus()` (+ `postMessage({ type: "NOTIFICATION_CLICK", ...data })`); else `clients.openWindow(data.link ?? "/")`. |

- `tag` per notification id prevents duplicate stacking of the same alert.
- This SW must never import remote scripts (CSP: no gstatic).

## 3. Permission & registration flow (page)

Owner: `usePushRegistration` hook (mounted once in the authenticated layout), implemented over `infrastructure/notifications/pushManager.ts`.

```
mount → guard checks (all must pass to continue):
  - navigator.serviceWorker + PushManager supported
  - Notification.permission !== "denied"        // OS-level block ⇒ silent skip
  - VITE_FIREBASE_* env present                // missing config ⇒ silent skip
  - localStorage.pushDeclinedAt older than 30 days
  - at least one route navigation since login   // not on first paint

permission === "granted"
  → dynamic-import firebaseClient → getToken(vapidKey)
  → POST /notifications/device-token            // errors logged+swallowed, never break UI

permission === "default"
  → render small in-app affordance ("Recibe avisos de huecos y cambios de clase") [Aceptar | Ahora no]
      Aceptar  → Notification.requestPermission() → granted path above
                 denied/default → set pushDeclinedAt = now
      "Ahora no" → set pushDeclinedAt = now     // 30-day cooldown, no re-prompt
```

**Invariants** (map to spec FR-005/FR-006, US1 scenarios):
1. No prompt on first cold load; never more than one affordance per session.
2. Decline/denial leaves every feature untouched; no repeated nagging inside cooldown.
3. Registration failure (network/API) is invisible to the user beyond a log line; retried next session mount.
4. Token POST body always `{ token, platform: "WEB" }`; response ignored beyond success/failure.

## 4. Environment variables (frontend)

| Var | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Firebase web config (public-by-design; still env-injected, never hardcoded) |
| `VITE_FIREBASE_VAPID_KEY` | Web Push certificate public key for `getToken()` |

Backend counterpart: `FIREBASE_SERVICE_ACCOUNT_PATH` (secret, server-only). See research D2/D3.
