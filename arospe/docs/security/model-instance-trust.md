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
> rule against a page that outlives its own fix. Neither was reachable through the shipped dashboard —
> `App\Livewire\SalesRegions\Index` re-fetches every row with `findOrFail()` immediately before each call —
> which is exactly why they had to be closed at the action layer: under the
> [action-owns-the-rule convention](../conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
> these actions exist to be called from somewhere other than that component. Eight regression tests (four per
> finding, two per action, split `SetDefaultSalesRegionTest.php` / `SetSalesRegionActiveTest.php` /
> `RefusalLoggingTest.php`) were verified to redden against the pre-fix code before the fix was restored —
> the shape [this page's own "Regression test shape" section](#one-fix-closes-both) describes.

## Table of Contents

- [A guard must re-read its subject under lock, inside its own transaction](#a-guard-must-re-read-its-subject-under-lock-inside-its-own-transaction)
- [`save()` writes the whole dirty set, so "the single named writer" is a convention, not an enforcement](#save-writes-the-whole-dirty-set-so-the-single-named-writer-is-a-convention-not-an-enforcement)
- [One fix closes both](#one-fix-closes-both)

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

✅ **The shape that holds** — derive the guard's subject inside the transaction, through the lock, and read
the guard off *that* instance:

```php
return DB::transaction(function () use ($newDefault): SalesRegion {
    // The row this guard is about, re-read under lock inside the transaction:
    // is_active is the state the rule protects, so it may not arrive as an
    // attribute of an instance hydrated by the caller, at an unknown time.
    $target = SalesRegion::query()
        ->whereKey($newDefault->getKey())
        ->lockForUpdate()
        ->firstOrFail();

    if (! $target->is_active) {
        // ... log and throw, exactly as today ...
    }

    // ... clear the current default(s), then write through $target ...
});
```

Two implementation notes that shipped with the fix rather than after it:

- **`whereKeyNot()` is kept, its docblock corrected rather than left stale.** The old rationale described a
  *caller's stale* `$newDefault` skipping its write-back; that framing stopped being accurate once `$target`
  is freshly locked. The guard is still required, for a narrower and still-real reason: the clearing query
  below matches rows through a **separate** Eloquent query, so even a row identical to `$target` hydrates as
  a **second, independent instance** there. Without the exclusion, that second instance would clear
  `$target`'s own row invisibly to `$target`'s own dirty-tracking (its `original` already says `true`), and
  the final `forceFill(['is_default' => true])` would then see no dirty change and skip writing it back —
  the exact silent-clear this repo's own [errors-log](../errors-log.md) has an entry about not leaving a
  surviving-but-wrong explanation for.
- **Lock ordering was a real deadlock surface, closed rather than left unconsidered.** `SetSalesRegionActive`
  now acquires its own target row and (when named) the replacement row in **one**
  `whereIn([...])->orderBy('id')->lockForUpdate()` query, so two concurrent calls that each name the other's
  target as their own replacement always lock in the same (ascending-id) order instead of a possibly-opposite
  one. `SetDefaultSalesRegion`'s own target-plus-current-defaults lock follows the same
  order-then-lock shape. As a second, independent layer — since the unindexed full-table locking scan makes
  contention the normal case rather than the rare one — both actions' `DB::transaction()` calls pass
  `attempts: 3`, Laravel's built-in retry for a `40001`/deadlock `QueryException`, so a residual race the
  ordering doesn't fully close (e.g. a self-healing repair pass touching a row outside the pre-locked set)
  degrades to a transparent retry rather than a 500.

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
A caller's model then degrades to what it should always have been — a way of naming *which row*, and nothing
more.

**Regression test shape.** A test for either rule must dirty the instance (or mutate the row behind it with
`SalesRegion::query()->whereKey(...)->update(...)`, which is the honest single-process simulation of another
committed transaction) **between** hydration and the action call — no test that hands the action a
freshly-fetched, clean model can fail on any of this, which is precisely why the story's original 110 tests
were all green despite both findings. Eight such tests were added (four per finding, two per action) and each
was confirmed to redden against the pre-fix code before the fix was restored — proof the tests carry real
signal, not merely proof they exist.

_Last updated: 2026-08-25 — Task 0017 (Sales Region tax configuration — backend), Phase 4 fix, same day as the
audit. Both sections **closed**: every ❌ block is the code as it shipped from Phase 3, every ✅ block is the
real shipped fix (not a recommendation), and every claim in both was verified by execution against the real
actions on the `testing` database, inside a rolled-back transaction, rather than by reading._
