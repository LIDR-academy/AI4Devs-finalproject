# 015 — Coach can see who is on a class's waiting list

## Problem
In `GET /classes/:id`, the coach (and admin) sees `waitingListCount` and `hasWaitingList`, but not *who* is waiting. The class details modal (`ClassDetailView`) shows "Waiting list: N" but cannot list the coachees, while it already lists enrolled coachees.

## Goal
A coach/admin opening class details can see the coachees currently on the waiting list (name list), matching the existing "Enrolled coachees" section. Coachee viewers keep the current privacy behavior (no other coachee names unless entitled).

## Scope
- Backend: extend `GetTrainingClass` relation include so waiting-list entries carry the coachee (`waitingLists: { include: { coachee: true }, orderBy: { joined_at: "asc" } }`).
- Backend DTO: add `waitingListCoachees: Array<{ id, name }>` to `TrainingClassDTO`, gated by the same `canRevealNames` privacy rule as `enrolledCoachees`. `waitingListCount` / `hasWaitingList` unchanged.
- Frontend: add `waitingListCoachees` to `TrainingClass` type; render a "Waiting list coachees" list under "Enrolled coachees" for `ADMIN`/`COACH` when non-empty.
- Docs: update `GET /classes/:id` response contract in `docs/api-specifications.md`.
- Tests: backend unit (GetTrainingClass + DTO reveal/hide), Supertest round-trip (admin sees names, non-entitled coachee sees none).

## Out of scope
- No role/state changes; no new endpoints; no changes to waiting-list join/leave; the waiting-list count row in the modal stays.
- List endpoints (`GET /classes`) are not upgraded; they already return `waitingListCount` and will return `waitingListCoachees: []` (additive, no names loaded there).

## Acceptance criteria
- AC-1 Coach/admin GET /classes/:id → `waitingListCoachees` contains `{ id, name }` for each entry, ordered oldest join first; `API` contract documented.
- AC-2 A non-entitled coachee viewer still gets `waitingListCoachees: []` while the count is correct (privacy preserved).
- AC-3 ClassDetailView shows the waiting-list names under a "Waiting list coachees" heading for ADMIN/COACH.
- AC-4 No regression: all backend + frontend gates green.