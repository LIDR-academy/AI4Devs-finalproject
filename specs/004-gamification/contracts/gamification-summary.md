# Contract: GET /api/gamification/summary

Returns the authenticated user's aggregate gamification state.

## Request

```
GET /api/gamification/summary
Authorization: Bearer <jwt>
```

- **Auth**: required (`JwtAuthGuard`). `userId` is taken from the JWT; no user id is accepted as a
  parameter (FR-020).
- **Query params**: none.

## Response 200

```jsonc
{
  "totalPoints": 35,                 // integer, clamped to >= 0 for display (FR-007)
  "totalValueSavedEur": 12.50,       // number (2 decimals), sum over before-expiry CONSUMED events
  "totalValueWastedEur": 3.00,       // number (2 decimals), sum over WASTED events
  "consumedBeforeExpiryCount": 3,    // integer
  "wastedCount": 1,                  // integer
  "badges": [
    {
      "id": "uuid",
      "code": "FIRST_SAVE",          // badge code (see Badge Catalog)
      "earnedAt": "2026-06-26T10:00:00.000Z",
      "label": "First Save",
      "description": "Consume your first item before it expires"
    }
  ],
  "weeklyStreak": 2                  // integer, consecutive zero-waste weeks
}
```

- `badges` contains **only earned** badges, each enriched with `label`/`description` from the badge
  catalog. The locked-badge presentation (greyed + unlock condition) is derived client-side by
  diffing the full catalog against earned codes (FR-014).
- `totalPoints` is never negative in this payload (FR-007). The raw signed sum is internal only.

## Error responses

| Status | When |
|---|---|
| `401 Unauthorized` | Missing/invalid JWT |

## Notes

- Response is fully typed; the frontend type mirrors this shape in
  `front/src/features/gamification/gamification.api.ts`.
- Computation never reads or exposes another user's data.
