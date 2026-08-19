# Plan — 015 Coach waiting-list members

## Approach
Minimal additive change on the existing class-detail read path. Privacy reuses the existing `canRevealNames` gate from `toTrainingClassDTO` so behavior stays consistent with enrolled coachees.

## Steps
1. **Backend read model** — `GetTrainingClass.ts`: change `CLASS_RELATIONS_INCLUDE.waitingLists` to include `coachee: true` and `orderBy: { joined_at: "asc" }`. Update `TrainingClassWithRelations` type automatically via Prisma payload (no manual typing change needed beyond the include).
2. **Backend DTO** — `trainingClassDto.ts`:
   - `TrainingClassDTO` += `waitingListCoachees: EnrolledCoacheeDTO[]`.
   - `TrainingClassRowLike.waitingLists` typed as `Array<{ coachee?: { id: string; name: string } }>` (rows from list endpoints don't load coachee).
   - Map: `waitingListCoachees = canRevealNames ? row.waitingLists.filter(entry => entry.coachee).map(...) : []`.
3. **Docs** — `docs/api-specifications.md` GET /classes/:id: document `waitingListCoachees`.
4. **Backend tests** — `GetTrainingClass.test.ts`: seed a waiting-list entry; assert row.waitingLists includes `coachee.name`; DTO reveals names for ADMIN/COACH, hides for non-entitled coachee (`waitingListCoachees: []`, count intact), reveals for entitled coachee. `classes.test.ts`: extend admin detail test with `waitingListCoachees` names assertion and add a non-entitled-coachee `[]` assertion.
5. **Frontend** — `class.ts` type += `waitingListCoachees: Array<{ id: string; name: string }>`; `ClassDetailView.tsx` renders "Waiting list coachees" list for ADMIN/COACH when non-empty (mirror of "Enrolled coachees").
6. **Gates** — backend + frontend: lint, typecheck, vitest; `npm audit --audit-level=high`; frontend build.

## Watch-outs
- `TrainingClassRowLike.waitingLists` variance: list endpoints pass `waitingLists: true` rows → `entry.coachee` undefined → filter guards mapping.
- Existing `coacheeCalendarEvents`/`classCalendarEvents` fixtures must stay green (additive field is optional in TS fixtures? No — `TrainingClass` is a required interface, so test fixtures that construct `TrainingClass` literals will need the new field). Check fixtures and update.
- Seq: backend → docs → tests → frontend → gates.