# A caller-supplied model instance is untrusted input — on both the read and the write side

Established by the Phase 4 audit of [task 0017](../../ai-spec/tasks/in-progress/0017-sales-region-tax-configuration-backend.md)
(Sales Region tax configuration), this repo's first **domain-invariant** guard — a rule about the shape of
the *data* ("exactly one default, and it is always active") rather than about who may act.

Every rule on [authorization-patterns.md](authorization-patterns.md) about deriving state rather than
accepting it is stated in terms of *parameters* — a `bool $applyRoleAndStatus`, an
`array $currentPermissionNames`, a `->with('roles')` hydration. This page is the same failure class one
level down, where it is much harder to see: the untrusted input is not a parameter beside the model, it
**is the model**. `App\Actions\SalesRegions\SetDefaultSalesRegion` and `SetSalesRegionActive` take a
`SalesRegion` and read `$region->is_active` / `$region->is_default` off it — an in-memory attribute whose
value was decided by whoever hydrated the instance, at whatever time they did so.

> ✅ **Status: closed, same day as the task 0017 Phase 4 audit that found it.** Both ❌ blocks below are the
> code as it shipped from Phase 3, quoted verbatim, and both were confirmed by execution rather than by
> reading. The ✅ block in each section is the shipped fix, not a recommendation — `SetDefaultSalesRegion`,
> `SetSalesRegionActive` and `UpdateSalesRegion` all now write through an instance re-fetched inside their
> own transaction/call, never through the caller-supplied one, per
> [errors-log.md](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20)'s
> rule against a page that outlives its own fix. **F-2 was not reachable through the shipped dashboard** —
> `App\Livewire\SalesRegions\Index` re-fetches every row with `findOrFail()` immediately before each call, so
> the component itself never hands an action a dirtied instance. **F-1 was reachable through the dashboard**
> (Phase 5 code review finding F-2, correcting this line, which originally claimed neither was): the
> component's `findOrFail()` runs *outside* the action's own transaction, so a second administrator's
> already-committed write landing in that window reproduces the exact stale read F-1 describes — the "two
> administrators clicking within the same second" row in the exploit table below is that path, not a
> hypothetical non-dashboard one. Both findings still had to be closed at the action layer regardless: under
> the [action-owns-the-rule convention](../conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
> these actions exist to be called from somewhere other than that component, dashboard-reachable or not.
> Eight regression tests (four per
> finding, two per action, split `SetDefaultSalesRegionTest.php` / `SetSalesRegionActiveTest.php` /
> `RefusalLoggingTest.php`) were verified to redden against the pre-fix code before the fix was restored —
> the shape [this page's own "Regression test shape" section](#one-fix-closes-both) describes.

## Table of Contents

- [A guard must re-read its subject under lock, inside its own transaction](#a-guard-must-re-read-its-subject-under-lock-inside-its-own-transaction)
- [`save()` writes the whole dirty set, so "the single named writer" is a convention, not an enforcement](#save-writes-the-whole-dirty-set-so-the-single-named-writer-is-a-convention-not-an-enforcement)
- [One fix closes both](#one-fix-closes-both)
- [Re-audit round 2: what the fix itself got subtly wrong](#re-audit-round-2-what-the-fix-itself-got-subtly-wrong)

## A guard must re-read its subject under lock, inside its own transaction

`SetDefaultSalesRegion` refuses to promote an inactive entry (decision D10). The refusal is correctly
placed *inside* the transaction — and it still cannot hold, because the value it tests was read before the
transaction existed:

❌ **The shipped shape.** The guard is the transaction's first statement, but `$newDefault->is_active` is an
attribute of an instance the caller hydrated; nothing here re-reads the row:

```php
// app/Actions/SalesRegions/SetDefaultSalesRegion.php
return DB::transaction(function () use ($newDefault): SalesRegion {
    if (! $newDefault->is_active) {          // <-- in-memory, read outside this transaction
        $this->logRefusedPrivilegedAttempt->log(/* ... */);

        throw ValidationException::withMessages([/* ... */]);
    }

    SalesRegion::query()
        ->where('is_default', true)
        ->whereKeyNot($newDefault->getKey())
        ->lockForUpdate()                    // <-- acquired AFTER the guard already decided
        ->get()
        ->each(fn (SalesRegion $current): bool => $current->forceFill(['is_default' => false])->save());

    return tap($newDefault->forceFill(['is_default' => true]))->save();
});
```

**The `lockForUpdate()` does not close this, and reordering it would not either.** Three separate reasons,
each worth internalising because each defeats a different plausible "fix":

1. **It locks the wrong rows.** The lock covers `where('is_default', true)` — the rows being *cleared*. The
   row being *promoted* is not in that set; `whereKeyNot()` explicitly removes it even when it is.
2. **On MySQL it happens to lock every row anyway — and that still does not help.** `sales_regions.is_default`
   carries no index ([0016 omitted it deliberately](../database/schema.md#indexes--one-present-by-choice-one-by-requirement-four-omitted)),
   so under REPEATABLE READ this locking scan examines and locks the whole table. The replacement row *is*
   locked. It makes no difference, because the guard has already read its stale copy.
3. **A lock protects a row from changing; it cannot retroactively refresh a value already in a PHP variable.**
   This is the general form: a lock is only a guard's ally when the guard's input is read *through* it.

Three exploit paths, all confirmed by execution against the real actions (`tinker`, wrapped in a
rolled-back transaction, with `Gate::before` short-circuited so the D10 guard was the only thing under test):

| Scenario | Sequence | Result |
| --- | --- | --- |
| Concurrent deactivation of the promotion target | Admin A loads `Canarias` (active) to name it as replacement → Admin B commits `setActive(Canarias, false, '')` → A's transaction opens | `is_default=true, is_active=false` — the state D10 forbids |
| Concurrent promotion of the deactivation target | Admin A loads `Peninsula` (not default) → Admin B commits `setDefault(Peninsula)` → A's `setActive(Peninsula, false, null)` opens | Deactivated **with no replacement named and no refusal** — the catalog's only default is now inactive |
| Caller-hydrated instance | `$r = SalesRegion::find($inactiveId); $r->is_active = true;` (never saved) → `app(SetDefaultSalesRegion::class)($r)` | Promoted; the guard never consulted the database |

The middle row is the sharpest: it defeats the story's headline acceptance criterion ("disabling the current
default is refused unless a replacement is named") without any forged input at all — two administrators
clicking within the same second is enough, and the corruption is silent and permanent.

✅ **The shape that holds, as shipped after re-audit round 2** — derive the guard's subject inside the
transaction, through the lock, and read the guard off *that* instance. The round-1 fix shown further down in
[the re-audit section](#re-audit-round-2-what-the-fix-itself-got-subtly-wrong) locked the target and the
clear-set as two separate queries; **R-1** in that section found a real deadlock in exactly that split, so
the shipped shape locks both in one:

```php
return DB::transaction(function () use ($newDefault): SalesRegion {
    // Every row this call could touch, locked together in ONE
    // primary-key-ordered query: the target itself, plus every row
    // currently flagged as the default.
    $rows = SalesRegion::query()
        ->where(fn ($q) => $q->where('is_default', true)->orWhere('id', $newDefault->getKey()))
        ->orderBy('id')
        ->lockForUpdate()
        ->get();

    $target = $rows->first(fn (SalesRegion $r) => $r->is($newDefault))
        ?? throw (new ModelNotFoundException)->setModel(SalesRegion::class, [$newDefault->getKey()]);

    if (! $target->is_active) {
        // ... log and throw, exactly as today ...
    }

    // ... clear every OTHER already-locked default row, then write through $target ...
});
```

Two implementation notes that shipped with the fix rather than after it:

- **`whereKeyNot()`'s job is now done by `$rows->reject(fn ($r) => $r->is($target))`, kept for the same
  reason, docblock corrected rather than left stale.** The old rationale described a *caller's stale*
  `$newDefault` skipping its write-back; that framing stopped being accurate once `$target` is freshly
  locked. The exclusion is still required, for a narrower and still-real reason: the clearing step below
  iterates the SAME `$rows` collection but as separate model instances from `$target` for every row except
  it (`->first()`/`->reject()` on a `Collection` do not deduplicate object identity), so a row identical to
  `$target` would still hydrate as a **second, independent instance** if not excluded. Without the exclusion,
  that second instance would clear `$target`'s own row invisibly to `$target`'s own dirty-tracking (its
  `original` already says `true`), and the final `forceFill(['is_default' => true])` would then see no dirty
  change and skip writing it back — the exact silent-clear this repo's own [errors-log](../errors-log.md) has
  an entry about not leaving a surviving-but-wrong explanation for.
- **Lock ordering was a real deadlock surface — closed by real resource-ordering for the scenario it can
  reach, and by retry for the one it cannot.** Round 1 shipped `SetSalesRegionActive` locking its target and
  (when named) the replacement in one ordered query, reasoning it protected against "two calls naming each
  other's target as their own replacement" — a scenario **R-1a** in this section proved cannot occur. The
  deadlock that round 1 actually introduced was in `SetDefaultSalesRegion` itself (**R-1b**), from acquiring
  its two lock sets as *separate* queries; the single combined query above is round 2's real fix for that
  action. **A residual, narrower window remains inside `SetSalesRegionActive`'s own promotion path** (Phase 5
  code review finding F-3, which corrected a second over-claim in that action's docblock): its own ordered
  query, followed by the *nested* `SetDefaultSalesRegion` call's own separate ordered query, is still two
  lock-acquisition events in sequence — so a **concurrent, unrelated** `SetDefaultSalesRegion(other)` call can
  hold a row this sequence needs while waiting on one it holds. Ordering does not close this, because the two
  events are not one query; what closes it is that `attempts: 3` on the **outer** transaction retries the
  deadlock a nested SAVEPOINT-level call cannot retry itself (Laravel only retries at `transactions === 1`).
  Deliberately not closed further in code — indexing `is_default` (D13's deferred backstop) or acquiring the
  full row-set union up front are both larger than this story's scope, and the retry already converges the
  invariant correctly, at the cost of an occasional retried write rather than a violated invariant.

## `save()` writes the whole dirty set, so "the single named writer" is a convention, not an enforcement

All three of this story's actions end in `tap($model->fill(...))->save()` or
`tap($model->forceFill(...))->save()`. The `fill()` array is a correct, narrow allow-list. **`save()` is not
scoped by it** — it issues an `UPDATE` for every attribute dirty on the instance, including ones the caller
dirtied before handing the model over.

❌ **The shipped shape**, whose docblock claims a guarantee the code does not provide:

```php
// app/Actions/SalesRegions/UpdateSalesRegion.php
// "`fill()`, not `forceFill()` -- these three columns ARE in #[Fillable], and the
//  omission of every other column (slug, name, parent_id, kind, sort_order,
//  is_default, is_active) is precisely this repo's mass-assignment guard."
return tap($region->fill([
    'code' => $code,
    'description' => $description,
    'rate' => $rate,
]))->save();
```

Confirmed by execution — a caller that dirties structural columns and then calls the action persists all of
them, `#[Fillable]` notwithstanding:

```php
$m = SalesRegion::find($id);
$m->slug = 'hijacked-slug';
$m->name = 'Hijacked';
$m->sort_order = 999;

app(UpdateSalesRegion::class)($m, 'XX', 'desc', '5.000');
// -> slug=hijacked-slug name=Hijacked sort_order=999
```

The same mechanism falsifies `SetSalesRegionActive`'s docblock claim to be "the single named writer of
`is_active`" — it is equally a writer of whatever else is dirty, including the one column the story most
needs to protect:

```php
$m = SalesRegion::find($otherId);
$m->is_default = true;                 // the column this action does not own

app(SetSalesRegionActive::class)($m, true, null);
// -> defaults now=2   (SetDefaultSalesRegion never ran; nothing cleared the old flag)
```

**Two defaults, reached without touching the class whose entire purpose is to make that impossible.** The
`#[Fillable]` omission and the "one named writer per column" convention are both real and both worth
keeping — but neither is a *guard*. They constrain which array keys a writer names, not which columns an
`UPDATE` carries.

✅ **The rule, as shipped.** An action that owns a column must write through an instance it hydrated itself,
so the dirty set is exactly what the action put there. `UpdateSalesRegion` needs no lock — it enforces no
cross-row invariant, only a clean dirty set — so its fix is a plain re-fetch:

```php
// app/Actions/SalesRegions/UpdateSalesRegion.php
$target = SalesRegion::query()->whereKey($region->getKey())->firstOrFail();

// $target's dirty set starts empty: nothing a caller staged can ride along.
return tap($target->fill([
    'code' => $code,
    'description' => $description,
    'rate' => $rate,
]))->save();
```

`SetSalesRegionActive` and `SetDefaultSalesRegion` need both the re-fetch **and** `lockForUpdate()`, since
they also carry [the TOCTOU rule above](#a-guard-must-re-read-its-subject-under-lock-inside-its-own-transaction) —
one query does both jobs for each action.

> **This is not unique to Sales Regions.** `App\Actions\Users\UpdateUser` has the same shape
> (`$user->fill(['name' => $name]); … $user->save();`), so a caller-dirtied `status` or `pending_email`
> would persist there too, despite both being deliberately omitted from `User`'s `#[Fillable]`. That is
> **out of scope for task 0017 and is not a finding against it** — it is recorded here so the next audit
> treats it as known-and-open rather than newly discovered, and so a story that touches `UpdateUser` knows
> to close it in passing.

## One fix closes both

The two rules above have one root cause and therefore one remedy: **re-fetch the row the action owns, inside
the action's transaction, under `lockForUpdate()`, and use that instance for both the guard's read and the
action's write.** Re-reading fixes the TOCTOU; the fresh instance's empty dirty set fixes the write-through.
A caller's model then degrades to almost what it should always have been — a way of naming *which row*, and
nothing more, **with one exception**: it is still the `Gate` target passed to
`LogRefusedPrivilegedAttempt::authorize()`, ahead of the re-fetch. See **R-3**, in the re-audit section below,
for why that is harmless today and what it would take to reopen it.

**Regression test shape.** A test for either rule must dirty the instance (or mutate the row behind it with
`SalesRegion::query()->whereKey(...)->update(...)`, which is the honest single-process simulation of another
committed transaction) **between** hydration and the action call — no test that hands the action a
freshly-fetched, clean model can fail on any of this, which is precisely why the story's original 110 tests
were all green despite both findings. Eight such tests were added (four per finding, two per action) and each
was confirmed to redden against the pre-fix code before the fix was restored — proof the tests carry real
signal, not merely proof they exist.

## Re-audit round 2: what the fix itself got subtly wrong

The rule this repo already has for a security fix — [re-audit it as new code, not merely as a diff against the
finding](../errors-log.md#two-of-the-three-security-audit-rounds-found-the-flaw-in-the-previous-rounds-fix--2026-08-19) —
applied to the fix above, the same day. Verdict: **PASS**, four Low findings, none reopening F-1 or F-2. All
five are closed or recorded below; **R-1's documentation half is the one worth reading closely**, because it
is a false guarantee that had been written into this very page.

### R-1 — Low — the lock-ordering fix protected an unreachable scenario, and reopened a real one

Two parts, confirmed by execution (two live MySQL sessions replaying the real statements, plus `EXPLAIN`).

**R-1a.** The original fix's docblocks — on both actions, on this page, and in the task file — justified
`SetSalesRegionActive`'s `whereIn([...])->orderBy('id')->lockForUpdate()` with *"two concurrent operations
that name each other's target as their own replacement always acquire their locks in the same order"*. That
interleaving cannot occur: the nested call only runs when `$target->is_default` is already `true`, so both
sides of such a race would need `is_default = true` simultaneously — the exact state this story exists to
forbid. The ordering protected a case the invariant already excludes.

**R-1b.** The reachable deadlock was in `SetDefaultSalesRegion`, and the *first* fix round introduced it —
proven by running the pre-fix shape against the same two rows, which serialised cleanly. That action was
acquiring **two separate** lock sets: the target row (`whereKey(...)->lockForUpdate()`), then the clear-scan
(`where('is_default', true)->lockForUpdate()`, which `EXPLAIN` confirms is a near-full-table scan — 0016
deliberately left `is_default` unindexed). Two administrators each promoting a **different** region to
default is enough: T1 holds its target and needs T2's row via the clear-scan; T2 holds its target and needs
T1's row the same way. Reproduced directly:

```
[S2] ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction
[S1] SCAN OK
```

✅ **The fix.** `SetDefaultSalesRegion` now locks its target row *and* the clear-set in **one**
`orderBy('id')->lockForUpdate()` query (see the code in the section above, updated in place) — real
resource-ordering, not asserted resource-ordering: any two transactions needing an overlapping row set now
request it in the same order regardless of which action's query originates the request, which is what
actually prevents a circular wait. Impact of the closed bug was bounded even before this fix (the deadlock
rolls the transaction back atomically and `attempts: 3` retries into a converged state — worst case was a 500
to an administrator, never a violated invariant), which is why this was Low rather than Medium.

**R-1c — three false statements corrected in place, in this page and in both actions' docblocks:** the claim
that `SetDefaultSalesRegion`'s two queries "follow the same order-then-lock shape" (they didn't, before this
fix); the claim that `attempts: 3` on `SetDefaultSalesRegion` mitigates the deadlock from `SetSalesRegionActive`'s
nested call (it is **inert** there — Laravel only retries at `transactions === 1`, so a real deadlock inside a
nested savepoint call rethrows a `DeadlockException` instead; the *outer* transaction's own `attempts: 3` is
what actually covers that case); and the "nothing more than naming which row" closing line above, corrected
by R-3.

### R-2 — Low — the returned instance could lie about `is_default`

On `SetSalesRegionActive`'s promotion branch, the nested `SetDefaultSalesRegion` call clears the outer
`$target`'s row through its **own**, separately re-fetched instance — invisible to `$target`'s own
dirty-tracking, whose `original` still says `true`. The persisted state was always correct (`is_default` was
simply never dirty on `$target`, so `save()` never wrote it), but the method **returned** `$target` as-is,
so a caller reading `$region->is_default` off the return value would see `true` for a row the database now
has as `false`. Confirmed by execution: `returned->is_default=true`, `DB row: is_default=false`, same row.

Nothing in this app reads the return value today — both `Index::setActive()` and `Index::save()` discard
it — so this was unreachable in practice, and it inverts [this page's own opening thesis](#a-guard-must-re-read-its-subject-under-lock-inside-its-own-transaction):
the fix stopped the action *trusting* a stale instance and left it *emitting* one.

✅ **The fix.** `SetSalesRegionActive` now calls `$target->refresh()` immediately before returning it, so a
future non-dashboard caller — the kind [the action-owns-the-rule convention](../conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
exists to support — gets an accurate row. A regression test asserts the return value directly
(`tests/Feature/SalesRegions/SetSalesRegionActiveTest.php`, "the returned instance reflects is_default being
cleared…"), confirmed to redden without the `refresh()` call before being trusted.

### R-3 — Low — the `Gate` target is still the caller's instance, recorded rather than fixed

Every action still authorizes against the caller-supplied instance, before the re-fetch:
`$this->logRefusedPrivilegedAttempt->authorize('update', $region, ...)`. Inert **today**, and only because
`SalesRegionPolicy::update()` ignores its `$target` entirely and decides on the permission alone — but that
policy's own docblock already anticipates a future target-dependent rule (mirroring `UserPolicy::update()`'s
Super Admin exclusion). The day one is added, a caller could forge an in-memory attribute the new branch
reads (e.g. `$region->kind`), get authorized against the forged value, and have the action then write the
re-fetched **real** row — F-1 one layer up, and outside the fix's own lock, since authorization runs before
the transaction opens by design ("a refusal never opens a transaction at all").

Not a code change today — there is no rule to fix yet. Recorded on
[`SalesRegionPolicy::update()`'s own docblock](../../app/Policies/SalesRegionPolicy.php) so the constraint is
read by whoever adds the next branch, not rediscovered.

### R-4 — Low — `Index::save()` authorized the replacement row after already writing the target

Pre-existing, outside the original fix's diff, but touching the same two actions. `save()` called
`$updateSalesRegion($target, ...)` — committing rate/description/code immediately — and only *then*
authorized `$replacementDefault`, violating [this repo's "authorize before the first write" rule](../conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
for that second row specifically. Inert today for the same reason as R-3.

✅ **The fix — narrower than first proposed.** The re-audit's own suggestion (wrap both action calls in one
transaction) was **not** applied: this story's Phase 1 reconciliation already reviewed and explicitly
accepted the two-call, two-transaction shape — *"a mid-submit failure between them can leave the
rate/code/description half persisted while the active/default half is refused… an acceptable,
Users-screen-consistent shape… not a defect"* — and the first Phase 4 audit's own "Confirmed clean" list
re-confirmed it. Merging the transactions would have silently reversed an already-made, already-audited
decision. Only the **authorization ordering** moved: `$replacementDefault` is now looked up and authorized
*before* `$updateSalesRegion` runs, so an actor lacking rights on the replacement (once R-3's future rule
exists) is refused before either write, while the accepted partial-write-on-*validation*-refusal shape is
untouched.

### R-5 — Informational — test hygiene, applied

- Both "concurrent…" tests in `SetSalesRegionActiveTest.php` asserted only `ValidationException::class`,
  which cannot distinguish the D3 refusal (`default_deactivation_requires_replacement`) from the nested D10
  one (`default_must_be_active`) — both throw on the same `replacementDefaultId` key, so a regression that
  refused for the *wrong* reason would still pass. Both now assert the specific message.
- Two `->not->toBe(999)` assertions (`SetDefaultSalesRegionTest.php`, `RefusalLoggingTest.php`) only proved
  the persisted value wasn't exactly `999`, not that it was the correct original value. Both now assert
  `->toBe($original...)`.
- `RefusalLoggingTest.php`'s `parent_id` assertion compared against `null` without ever dirtying `parent_id`
  away from `null` — trivially true regardless of whether the guard worked. Now dirties it to a real,
  FK-valid other row's id first.

**Verification, same discipline as the first round:** all new/changed assertions confirmed to redden against
the pre-fix code (or, for `refresh()`, against the code with that one line removed) before being trusted.
Full suite re-run unscoped: **869/869 passed, 2434 assertions**. `vendor/bin/pint --test --format agent`
(unscoped): **passed**.

_Last updated: 2026-08-26 — Task 0017 (Sales Region tax configuration — backend), Phase 4 re-audit (round 2)
and same-day fix. All three sections **closed**. The two original findings' code examples were updated in
place to match the round-2 fix (the single ordered lock query, the `refresh()` call) rather than left
describing the round-1 shape a second round found wrong._

_Previously: 2026-08-25 — Task 0017, Phase 4 fix, same day as the original audit. Both sections **closed**:
every ❌ block is the code as it shipped from Phase 3, every ✅ block is the real shipped fix (not a
recommendation), and every claim in both was verified by execution against the real actions on the `testing`
database, inside a rolled-back transaction, rather than by reading._
