# Contract: GET /api/gamification/history

Returns a paginated, reverse-chronological log of the authenticated user's point changes and badge
awards.

## Request

```
GET /api/gamification/history?limit=20&offset=0
Authorization: Bearer <jwt>
```

- **Auth**: required (`JwtAuthGuard`). `userId` from JWT only (FR-020).
- **Query params**:
  | Param | Type | Default | Bounds |
  |---|---|---|---|
  | `limit` | integer | `20` | `1`–`100` |
  | `offset` | integer | `0` | `>= 0` |

Invalid/out-of-range params are coerced to defaults or rejected with `400` (validation via DTO).

## Response 200

```jsonc
{
  "events": [
    {
      "id": "uuid",
      "type": "POINTS_EARNED",       // "POINTS_EARNED" | "POINTS_DEDUCTED" | "BADGE_EARNED"
      "points": 10,                  // integer when points-related; null for BADGE_EARNED
      "badgeCode": null,             // string when type === "BADGE_EARNED"; else null
      "reason": "Consumed before expiry",  // human-readable
      "occurredAt": "2026-06-26T10:00:00.000Z"
    },
    {
      "id": "uuid",
      "type": "BADGE_EARNED",
      "points": null,
      "badgeCode": "FIRST_SAVE",
      "reason": "Earned the First Save badge",
      "occurredAt": "2026-06-26T10:00:00.000Z"
    }
  ],
  "total": 42                        // total number of history entries for the user
}
```

- `events` merges `UserPoints` rows (mapped to `POINTS_EARNED` when `delta > 0`, `POINTS_DEDUCTED`
  when `delta < 0`) and `UserBadge` rows (mapped to `BADGE_EARNED`), sorted by `occurredAt`/
  `earnedAt` descending, then paginated.
- `total` is the combined count across both sources, enabling client pagination (FR-017).

## Error responses

| Status | When |
|---|---|
| `401 Unauthorized` | Missing/invalid JWT |
| `400 Bad Request` | `limit`/`offset` fail validation |

## Notes

- `reason` strings are derived from `UserPoints.reason` codes and badge labels into readable English.
- Pagination is stable for a fixed dataset; new events appearing between page requests may shift
  offsets (acceptable for this read-only log).
