# Quickstart & Validation: Gamification and Achievement System

This guide validates the feature end-to-end. It references [data-model.md](./data-model.md) and the
[contracts/](./contracts/) for exact shapes — it does not duplicate them.

## Prerequisites

- Backend running (`back/`) with PostgreSQL available.
- Migration applied: `cd back && npx prisma migrate dev --name add-gamification`.
- A registered user with a valid JWT (use the existing auth/register flow).
- Frontend running (`front/`) for UI validation.

## Backend setup

```bash
cd back
npx prisma migrate dev --name add-gamification   # creates UserPoints, UserBadge
npm run start:dev
```

## Validation scenarios

### US1 — Earn and see points (P1)

1. Create a pantry item with `expirationDate` 5 days in the future.
2. Register a `CONSUMED` event for it (existing pantry consume endpoint).
3. `GET /api/gamification/summary` → `totalPoints` increased by **15** (10 base + 5 bonus, item had
   ≥ 3 days to spare). `consumedBeforeExpiryCount` = 1.
4. Create another item expiring **tomorrow**, consume it → `totalPoints` +10 (no bonus).
5. Create an item already expired, consume it → `totalPoints` unchanged (0 points).
6. Waste an item → `totalPoints` decreases by 5.
7. Force points below zero (waste several items) → summary `totalPoints` shows `0`, never negative.

**Expected**: matches spec US1 scenarios 1–5. Summary shape per
[gamification-summary.md](./contracts/gamification-summary.md).

### US1 — failure isolation

1. Temporarily make points processing throw (e.g. inject a failing `PointsService` in a test).
2. Register a consume event.
3. **Expected**: the consume API still returns success; the error is logged, not surfaced
   (FR-018 / SC-002). Verified primarily by the pantry-hook unit test.

### US2 — Badges (P2)

1. From a fresh user, consume the first item before expiry → `summary.badges` contains
   `FIRST_SAVE`. Consume more before-expiry items → `FIRST_SAVE` is **not** duplicated.
2. Reach 10 before-expiry consumes → `SAVER_10` appears once.
3. Accumulate ≥ €10 of before-expiry `estimatedValueEur` → `MONEY_SAVER_10` appears.
4. Open `/achievements` in the UI → earned badges full colour; locked badges greyed with their
   unlock condition text.

**Expected**: matches spec US2 scenarios 1–6.

### US2 — Zero Waste Week (weekly job)

1. Seed a user with ≥ 1 event and **no** WASTED events within a completed Mon–Sun week.
2. Trigger `GamificationCronService` evaluation (invoke its evaluation method directly in a test, or
   wait for the interval tick).
3. **Expected**: `ZERO_WASTE_WEEK` badge awarded once.

### US3 — History (P3)

1. After the steps above, `GET /api/gamification/history?limit=20&offset=0`.
2. **Expected**: reverse-chronological `events` with `POINTS_EARNED` / `POINTS_DEDUCTED` /
   `BADGE_EARNED` entries, each with a readable `reason`; `total` reflects all entries. Request
   `offset=20` for the next page. Shape per
   [gamification-history.md](./contracts/gamification-history.md).

### Frontend dashboard widget

1. Open the dashboard surface (`/insights`).
2. **Expected**: `PointsSummaryWidget` shows total points, most recent badge, and weekly streak,
   with a link to `/achievements`.

## Test commands

```bash
# Backend unit + e2e
cd back
npm test -- --no-coverage            # unit specs (points, badge, gamification, pantry hook)
npx jest --config ./test/jest-e2e.json gamification.e2e   # consume → points + badge persisted

# Frontend
cd front
npm run test                         # Vitest: achievements route, widget
npx playwright test gamification     # optional e2e (mirrors insights e2e)
```

## Acceptance mapping

| Spec acceptance | Validated by |
|---|---|
| US1 AC1–AC6 | Backend US1 scenarios + pantry-hook failure-isolation test |
| US2 AC1–AC6 | Badge scenarios + `/achievements` UI check |
| US3 AC1–AC2 | History endpoint + pagination check |
| SC-001 | Summary returns < 2 s after consume |
| SC-002 | Failure-isolation scenario (100% consume success) |
| SC-003 | Badge non-duplication checks |
| SC-006 | Auth-only, user-scoped — no cross-user access |
