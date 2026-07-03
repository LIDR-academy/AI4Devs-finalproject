# API Contract: Expiration Preferences

Base path: `/api/expiration`

All endpoints require a valid JWT in the `Authorization: Bearer <token>` header. Preferences are always scoped to the authenticated user extracted from the token — never from URL parameters.

---

## GET /api/expiration/preferences

Returns all food category learning preferences for the authenticated user.

### Request

No body. No query parameters.

### Response — 200 OK

```json
{
  "preferences": [
    {
      "category": "dairy",
      "averageDelta": 5.0,
      "sampleCount": 4,
      "lastUpdatedAt": "2026-06-28T10:30:00.000Z"
    },
    {
      "category": "produce",
      "averageDelta": -2.0,
      "sampleCount": 3,
      "lastUpdatedAt": "2026-06-27T08:15:00.000Z"
    }
  ]
}
```

**Field notes**:
- Returns `{ "preferences": [] }` when the user has no learned preferences (not 404).
- `deltas` (raw array) is never returned — internal field only.
- `averageDelta`: signed float (days). Positive = user prefers longer shelf life. Negative = shorter.
- `sampleCount`: total number of override events recorded for this category.
- `lastUpdatedAt`: ISO 8601 timestamp of the last preference update.

### Response — 401 Unauthorized

Missing or invalid JWT.

---

## DELETE /api/expiration/preferences/:category

Resets the learned preference for a single food category for the authenticated user.

### URL Parameter

| Parameter | Type | Example |
|-----------|------|---------|
| `category` | string | `dairy`, `produce`, `meat_fish`, `bakery`, `pantry`, `unknown` |

### Response — 204 No Content

Preference deleted (or did not exist — idempotent).

### Response — 401 Unauthorized

Missing or invalid JWT.

**Notes**:
- Idempotent: calling for a category with no learned preferences still returns 204 (not 404).

---

## DELETE /api/expiration/preferences

Resets all learned preferences for the authenticated user.

### Request

No body. No query parameters.

### Response — 204 No Content

All preferences deleted.

### Response — 401 Unauthorized

Missing or invalid JWT.

---

## Extended Endpoint: PATCH /api/pantry/items/:id/expiration

The existing override endpoint is **extended internally** — its request and response shapes are unchanged.

**Internal changes** (invisible to the caller):
- Before the assessment upsert, reads the existing `ExpirationAssessment` for the item.
- If the existing assessment has `method = RULE_BASED_SPAIN`, computes the signed delta in days and asynchronously records it via `ExpirationPreferenceRepository.upsertDelta`.
- Preference recording errors are caught, logged, and suppressed — the override response is always returned successfully.

**Unchanged request**:
```json
PATCH /api/pantry/items/:id/expiration
{
  "expirationDate": "2026-07-15T00:00:00.000Z"
}
```

**Unchanged response — 200 OK**:
```json
{
  "pantryItemId": "uuid",
  "expirationDate": "2026-07-15T00:00:00.000Z",
  "assessment": {
    "suggestedExpirationDate": "2026-07-15T00:00:00.000Z",
    "confidence": 1.0,
    "method": "MANUAL_OVERRIDE",
    "userConfirmed": true
  }
}
```

---

## Frontend API Functions

New functions added to `front/src/features/pantry/pantry.api.ts`:

```typescript
// Response shape for a single preference entry
export interface ExpiryPreference {
  category: string;
  averageDelta: number;
  sampleCount: number;
  lastUpdatedAt: string;
}

// Response shape for the list endpoint
export interface ExpiryPreferencesResponse {
  preferences: ExpiryPreference[];
}

// Fetch all learned preferences for the authenticated user
export function getExpiryPreferences(): Promise<ExpiryPreferencesResponse>

// Reset preferences for one category
export function resetExpiryPreference(category: string): Promise<void>

// Reset all preferences
export function resetAllExpiryPreferences(): Promise<void>
```
