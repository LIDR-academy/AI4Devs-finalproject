# Quickstart: Consumption Automation for Long-Expired Items

A runnable validation guide proving the feature end-to-end. Implementation details live in
`tasks.md` and the source; this file is how you confirm the feature works. References:
[plan.md](./plan.md), [data-model.md](./data-model.md), [contracts/](./contracts/),
[spec.md](./spec.md).

## Prerequisites

- Backend deps installed and a running PostgreSQL (per `back/README` / `dev.sh`).
- Migration applied: `cd back && npx prisma migrate dev --name add_auto_expiry`.
- An authenticated user (JWT) with at least one pantry item whose `expirationDate` is well in the
  past (e.g. 20 days ago) so it exceeds the default 14-day threshold.

## Backend checks

```bash
cd back
npm run test            # unit: expired-candidates query, bulk-waste, bulk-dismiss,
                        #       settings read/write, daily-digest pass, auto-resolve pass, delivery
npm run test:e2e        # integration: test/auto-expiry.e2e-spec.ts
npx tsc --noEmit        # type safety (Constitution III)
npm run lint            # zero ESLint errors
```

### Manual API walkthrough (replace `$JWT` and ids)

```bash
# 1. Stale candidates appear (SC-001). Seed an item expired > 14 days first.
curl -s -H "Authorization: Bearer $JWT" \
  http://localhost:3000/api/pantry/items/expired-candidates
# → { "items": [ { "id", "name", "daysExpired": >=15, "estimatedValueEur" } ], "digestId": null|"..." }

# 2. Read + update settings (FR-012 range 7–60).
curl -s -H "Authorization: Bearer $JWT" http://localhost:3000/api/settings/auto-expiry
# → { "enabled": true, "thresholdDays": 14 }
curl -s -X PATCH -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" \
  -d '{"enabled": true, "thresholdDays": 30}' \
  http://localhost:3000/api/settings/auto-expiry
# → { "enabled": true, "thresholdDays": 30 }
curl -s -o /dev/null -w "%{http_code}\n" -X PATCH -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" -d '{"enabled": true, "thresholdDays": 5}' \
  http://localhost:3000/api/settings/auto-expiry
# → 400 (out of range)

# 3. Bulk-waste (atomic, FR-005). Items disappear from pantry; events created.
curl -s -X POST -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" \
  -d '{"itemIds": ["<id1>", "<id2>"]}' \
  http://localhost:3000/api/pantry/items/bulk-waste
# → { "wastedCount": 2, "events": [ { "id", "itemId" }, ... ] }
# A foreign or invalid id ⇒ 404/500 and NO items wasted (verify pantry unchanged).

# 4. Bulk-dismiss keeps items, hides banner for 7 days (FR-006).
curl -s -X POST -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" \
  -d '{"itemIds": ["<id3>"]}' \
  http://localhost:3000/api/pantry/items/bulk-dismiss-expired
# → { "dismissedCount": 1 }
# Re-call expired-candidates ⇒ items:[] for the next 7 days (suppressed), item still in pantry.
```

### Scheduled passes (validated via unit/integration, not wall-clock)

The daily-digest and auto-resolve passes are time-driven; validate by invoking the pass methods
with an injected `now` (mirroring how `gamification-cron` tests call `evaluateZeroWasteWeek`):

- **Daily digest pass**: with `autoExpiryEnabled=true` and stale candidates and no recent digest ⇒
  a `PENDING` `AutoExpiryDigest` is created and `deliverDigest` is called. With
  `autoExpiryEnabled=false` ⇒ no digest, no delivery (SC-004).
- **Auto-resolve pass**: a `PENDING` digest with `sentAt < now - 7d` ⇒ still-stale candidates are
  wasted with `method = "AUTO_EXPIRED"` and the digest becomes `AUTO_RESOLVED` (SC-003, SC-005). A
  digest younger than 7 days ⇒ nothing auto-wasted.
- **Delivery degradation**: with delivery unavailable, the pass still creates the digest and does
  not throw (SC-007); the in-app banner is the fallback.

## Frontend checks

```bash
cd front
npm run test            # Vitest: pantry banner shows/hides, ExpiredItemsReview renders + actions,
                        #         settings toggle + threshold PATCH
npx tsc --noEmit
npm run lint
```

Manual:

1. With a stale item present, load the pantry page → a banner reads "N items may be expired —
   review now" (FR-014).
2. Open the review sheet → candidates list with name, days expired, estimated value.
3. "Mark all as wasted" → items leave the pantry, banner disappears (US1 / SC-002).
4. "Keep" on an item → it stays; "Dismiss all" → banner hidden, items remain.
5. Settings page → toggle "Auto-expire stale items" off and back on; change threshold within 7–60 →
   PATCH fires and persists.

## Definition of done (maps to Success Criteria)

- [ ] SC-001 stale item surfaces in candidates + banner.
- [ ] SC-002 bulk clear in one action.
- [ ] SC-003 auto-waste only after 7-day grace.
- [ ] SC-004 disabled user: zero digests, zero auto-waste.
- [ ] SC-005 auto-wasted items distinguishable (`method = AUTO_EXPIRED`).
- [ ] SC-006 no cross-user effects.
- [ ] SC-007 banner fallback works when delivery unavailable.
