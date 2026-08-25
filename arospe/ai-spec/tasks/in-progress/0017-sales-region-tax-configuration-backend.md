# [0017] Configure a seeded Sales Region entry: rate/description/code, the enable-disable toggle, and the single-default invariant

## Description
Make the seeded Sales Region catalog **configurable**. A tax administrator sets an entry's `rate`,
`description` and `code`; enables or disables an entry; and moves the "default" flag between entries —
under one invariant the catalog must never violate: **exactly one entry is the default at all times**.
Setting a new default clears the previous one, and the current default cannot be disabled unless a
replacement is named in the same atomic operation. Rate input is validated (negative and non-numeric
values are refused). This story owns the Livewire component class, its policy, its validation trait and
its three single-writer actions — **no new migration**: it builds directly on the `sales_regions` table
[story 0016](../done/0016-sales-region-catalog-schema-and-seeder.md) creates.

## Type
backend (related_task_id: **0018** — the paired Sales Regions UI story, not yet debated) | includes database-expert: **no**

**The component class ships here, the Blade view ships in 0018** — the same split
[story 0004](../done/0004-users-list-editor-backend.md) ↔ [story 0006](../done/0006-users-list-editor-ui.md)
used for the Users screen: 0004 built the whole `App\Livewire\Users\Index` class (properties, `save()`,
`deleteUser()`, policy, actions, gated route) and 0006 added only
`resources/views/livewire/users.blade.php`. Recorded explicitly so Phase 2 does not re-litigate it.
§"Component public surface" below **is** the contract 0018 binds to.

**Confirmed decisions** — reasoned from the project docs, the 0004/0006 precedent and this repo's installed
vendor source, and **confirmed by the product owner at the close of Phase 1** (all seven originally-open
questions were answered as recommended). Phase 2 re-verifies them; it does not re-open them. Note the
provenance caveat on *how* they were derived in [Provenance](#provenance). Each is recorded with its
reasoning in [Documented functional decisions](#documented-functional-decisions):

- **The single-default invariant lives in an action, not an observer, not the component, not the database** (D1). This is the most consequential decision in the story.
- **`is_default` and `is_active` each get exactly one named writer**, `forceFill()`-ing a column deliberately absent from `#[Fillable]` (D2).
- **Disabling the current default and naming its replacement is ONE atomic operation**, not two sequential saves (D3).
- **The refusal is a `ValidationException`**, so it lands in the form's error bag rather than as a 500 (D4).
- **Rate rules are `['nullable', 'decimal:0,3', 'min:0', 'max:100']`** — `decimal` already implies `numeric` and already rejects scientific notation (D5).
- **`NULL` rate stays reachable**: clearing a configured rate back to "unconfigured" is supported, because `0.000` is a legitimate rate (D6).
- **One permission tier — `sales-regions.edit` gates every mutation**, including the default swap (D7).
- **`sales-regions.create` / `sales-regions.delete` get no policy method**, because nothing calls them (D8).
- **`$regions` is `#[Locked]`**, following the same rule `Users\Index::$users` now also follows (D9 —
  corrected during Phase 1 reconciliation; the "diverges" framing was stale, see below).
- **An inactive entry may be neither the default nor a replacement default** — both are refused (D10).
- **The route is `/taxes/sales-regions`, named `sales-regions.index`** (D11).
- **A Spanish-locale comma (`21,5`) is accepted**, normalised in the component before `validate()` (D12).
- **The at-most-one-default database backstop is a follow-up story**, not built here (D13).

**Out of scope — owned by sibling stories.** Do not implement these here:

- The table, model, enum, ISO fixture, factory and seeder → **[story 0016](../done/0016-sales-region-catalog-schema-and-seeder.md)**. This story adds **no migration** and changes no seeder.
- The Blade/Flux markup, the parent-header rendering of the "España" row, the row-action layout and the "no way to add a country" affordance → **story 0018**.
- Tax-rate **resolution** for a product/order, and what `rate IS NULL` means at resolution time → **story 0026**. PRD §2.1's *"The default rate applies when no region matches"* scenario is **0026's**, not this story's, even though it sits in the same PRD block.
- Creating or deleting region entries. The catalog is fixed and seeded; there is no create path and no delete path, by design.
- The `sales-regions.{view,create,edit,delete}` permissions **already exist** from [story 0002](../done/0002-seed-roles-permissions-catalog.md). Do **not** re-seed them and do **not** invent a new permission string.

## Gherkin
```gherkin
Feature: Configuring a Sales Region entry's tax rate and availability

  # --- Configuring an existing entry ---

  Scenario: Setting the tax rate on a seeded region entry
    Given a tax administrator, with the "Canarias" entry seeded and carrying no rate
    When they set the tax rate on the "Canarias" entry
    Then the "Canarias" entry is saved with that rate

  Scenario: Setting the description on a seeded region entry
    Given a tax administrator viewing the seeded "Canarias" entry
    When they set the description on the "Canarias" entry
    Then the "Canarias" entry is saved with that description

  Scenario: Setting the code on a seeded region entry
    Given a tax administrator viewing the seeded "Canarias" entry
    When they set the code on the "Canarias" entry
    Then the "Canarias" entry is saved with that code

  Scenario: Configuring one field leaves the other configured fields alone
    Given a tax administrator, with an entry that already carries a description and a code
    When they change only that entry's tax rate
    Then the entry keeps its previous description and code

  Scenario: Configuring an entry leaves its identity untouched
    Given a tax administrator viewing the seeded "Canarias" entry
    When they set the tax rate on the "Canarias" entry
    Then the entry keeps its seeded name and its place beneath "España"

  Scenario: A rate of zero is a configured rate, not an unconfigured one
    Given a tax administrator viewing an entry that carries no rate
    When they set that entry's tax rate to zero
    Then the entry is saved as carrying a rate of zero rather than no rate at all

  Scenario: Clearing an entry's rate returns it to unconfigured
    Given a tax administrator, with an entry carrying a configured rate
    When they clear that entry's tax rate
    Then the entry carries no rate again

  # --- Enabling and disabling ---

  Scenario: Enabling a seeded but inactive region entry
    Given a tax administrator, with "Francia" seeded as an inactive entry
    When they enable the "Francia" entry
    Then the "Francia" entry becomes active

  Scenario: Disabling a region entry that is not the default
    Given a tax administrator, with "Baleares" active and not the default entry
    When they disable the "Baleares" entry
    Then the "Baleares" entry becomes inactive

  # --- The single-default invariant ---

  Scenario: Marking a new default clears the previous one
    Given a tax administrator, with "España (Península)" flagged as the default entry
    When they mark "Canarias" as the default
    Then "Canarias" is the only default entry

  Scenario: The previous default stays available after losing the flag
    Given a tax administrator, with "España (Península)" flagged as the default entry
    When they mark "Canarias" as the default
    Then "España (Península)" is still an active entry, no longer flagged as the default

  Scenario: Re-marking the current default as the default changes nothing
    Given a tax administrator, with "España (Península)" as the current default entry
    When they mark "España (Península)" as the default again
    Then "España (Península)" is still the only default entry

  Scenario: Disabling the current default on its own is blocked
    Given a tax administrator, with "España (Península)" as the current default entry
    When they try to disable "España (Península)" without naming a replacement default
    Then the action is rejected with a validation message

  Scenario: A blocked disable leaves the catalog exactly as it was
    Given a tax administrator, with "España (Península)" as the current default entry
    When they try to disable "España (Península)" without naming a replacement default
    Then "España (Península)" is still active and still the default entry

  Scenario: Disabling the default is allowed when a replacement is named at the same time
    Given a tax administrator, with "España (Península)" as the current default entry
    When they disable "España (Península)" while naming "Canarias" as the new default
    Then "España (Península)" is inactive and "Canarias" is the only default entry

  Scenario: A replacement that cannot be applied leaves the current default untouched
    Given a tax administrator, with "España (Península)" as the current default entry
    When they try to disable it while naming a replacement that cannot be applied
    Then "España (Península)" is still active and still the default entry,
      because the catalog is never left without a default even briefly

  Scenario: An inactive entry cannot be marked as the default
    Given a tax administrator, with "Francia" seeded as an inactive entry
    When they try to mark "Francia" as the default
    Then the action is rejected with a validation message

  Scenario: An inactive entry cannot be named as the replacement default
    Given a tax administrator, with "España (Península)" as the current default entry
      and "Francia" seeded as an inactive entry
    When they try to disable "España (Península)" while naming "Francia" as the replacement
    Then the action is rejected with a validation message,
      because the catalog must always keep a usable default

  # --- Rate validation ---

  Scenario Outline: An invalid tax rate is rejected
    Given a tax administrator editing a region entry
    When they enter <invalid_rate> as the tax rate
    Then the change is rejected with a validation message

    Examples:
      | invalid_rate                                        |
      | a negative value                                    |
      | a non-numeric value                                 |
      | a value written in scientific notation              |
      | a value with more decimals than the catalog records |
      | a value above the allowed maximum                   |

  Scenario: A rejected rate is not saved
    Given a tax administrator, with an entry carrying a configured rate
    When they try to save a negative tax rate on that entry
    Then the entry still carries its previously configured rate

  Scenario: A rate typed with a decimal comma is accepted
    Given a tax administrator editing a region entry on a Spanish keyboard
    When they enter a tax rate written with a decimal comma
    Then the entry is saved with that rate

  # --- The catalog stays fixed ---

  Scenario: The configuration screen offers no way to add a region entry
    Given a tax administrator viewing the seeded, fixed Sales Region catalog
    When they look for a way to add a brand-new country from scratch
    Then no such option exists, and only seeded entries can be configured
      or enabled and disabled

  Scenario Outline: A structural attribute cannot be changed while configuring an entry
    Given a tax administrator configuring a seeded region entry
    When a submitted form attempts to change <attribute>
    Then the value is discarded and the entry keeps its seeded value

    Examples:
      | attribute            |
      | the identifying slug |
      | the entry name       |
      | the parent entry     |
      | the entry kind       |

  # --- Access ---

  Scenario: An administrator without the Sales Regions permission is refused the screen
    Given a blog editor whose role grants no Sales Regions permission
    When they navigate directly to the Sales Regions URL
    Then access is denied server-side, not merely hidden in the UI

  Scenario: A visitor is sent to sign in rather than refused
    Given a visitor who is not signed in
    When they navigate directly to the Sales Regions URL
    Then they are sent to the sign-in page instead of being told access is denied

  Scenario: An administrator who may view but not edit cannot configure an entry
    Given a tax auditor whose role grants only the permission to view Sales Regions
    When they try to set the tax rate on a region entry
    Then the change is refused and nothing is saved

  Scenario: The Super Admin reaches the Sales Regions screen
    Given a signed-in Super Admin holding no granted permission of their own
    When they navigate directly to the Sales Regions URL
    Then the screen is served to them, because the Super Admin bypasses permission checks
```

> 📌 **Every scenario above is settled.** The three that were originally contingent are now pinned by
> confirmed decisions: `a value above the allowed maximum` means **above 100** (D5), *"Clearing an entry's
> rate returns it to unconfigured"* is supported (D6), and an **inactive** entry may be neither the default
> nor a replacement (D10). See [Locked decisions](#locked-decisions-confirmed-at-phase-1).

## Files to create/modify

> **Authorization mechanism — read this first, it is the same trap `users.index` documented.** Livewire 4
> re-applies route middleware to `/livewire/update` round-trips only for the classes hardcoded in
> `PersistentMiddleware::$persistentMiddleware`, which carries Laravel's `Illuminate\Auth\Middleware\Authorize`
> (`can:`) but **not** Spatie's `PermissionMiddleware` (`permission:`). Gating this route with
> `permission:sales-regions.view` would protect the initial `GET` only, leaving every `save()` /
> `setDefault()` / `setActive()` round-trip unauthorized at the route layer. Use **`can:`**, plus explicit
> per-method authorization inside the component. See
> [authorization.md](../../../docs/architecture/authorization.md#gating-a-livewire-route-use-can-never-permission)
> and [security/livewire-authorization.md](../../../docs/security/livewire-authorization.md).

### `app/Livewire/SalesRegions/Index.php` — **create**

Class-based component (never single-file), per
[base-standards.md](../../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file).

> 📌 **View-path trap — `Index` in a subfolder resolves one level shallower.** `App\Livewire\SalesRegions\Index`
> resolves to **`resources/views/livewire/sales-regions.blade.php`**, *not* `livewire/sales-regions/index.blade.php`
> — Livewire's `Finder::generateNameFromClass()` strips the trailing `.index`. This is the documented
> [exception in naming.md](../../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name),
> and it is exactly the file 0018 must create. A file at the nested path would be a silently unused duplicate.

### `app/Concerns/SalesRegionValidationRules.php` — **create**

Flat, single-concern trait, composed at the consumer — no trait in `app/Concerns/` `use`s another, and
nesting breaks Larastan 7. Follows the `<Noun>ValidationRules` / `<noun>Rules()` convention
([naming.md](../../../docs/conventions/naming.md#traits-and-their-methods)):

```php
/** @return array<int, ValidationRule|array<mixed>|string> */
protected function rateRules(): array
{
    return ['nullable', 'decimal:0,3', 'min:0', 'max:100'];
}

/** @return array<int, ValidationRule|array<mixed>|string> */
protected function codeRules(): array
{
    return ['nullable', 'string', 'max:10'];          // matches the column's string(10)
}

/** @return array<int, ValidationRule|array<mixed>|string> */
protected function descriptionRules(): array
{
    return ['nullable', 'string', 'max:255'];         // matches the column's string(255)
}

/** @return array<int, ValidationRule|array<mixed>|string> */
protected function replacementDefaultRules(): array
{
    // The is_active condition is part of the MATCH, not a follow-up if — an inactive entry
    // is not a valid replacement at all (D10), the same shape RolePermissionSeeder's
    // whereNotNull('email_verified_at') lookup uses for the same reason.
    return ['nullable', Rule::exists('sales_regions', 'id')->where('is_active', true)];
}
```

> ⚠️ **The rule alone is not the enforcement.** `SetSalesRegionActive` re-checks the replacement's
> `is_active` inside its own transaction, because this validation rule runs only on the component path —
> and a rule enforced only in a component is bypassed by every other call site of the action
> ([livewire-authorization.md](../../../docs/security/livewire-authorization.md#authorization-that-lives-only-in-the-component-is-bypassed-by-every-other-call-site-of-the-action)).
> The same applies to `setDefault()`: an inactive target is refused **in the action**, not only in the form.

Four things about `rateRules()`, each **verified by reading this repo's installed vendor source** rather
than recalled (`vendor/laravel/framework/src/Illuminate/Validation/Concerns/ValidatesAttributes.php` and
`.../Validation/Validator.php`) — do not "simplify" any of them away:

| Rule | Why exactly this |
| --- | --- |
| `nullable` | `NULL` means *unconfigured*; `0.000` is a legitimate 0% rate (0016 is explicit). A blank submission must skip the numeric rules rather than fail them. **Caveat below.** |
| `decimal:0,3` | `Validator::validateDecimal()` calls `validateNumeric()` as its **first line**, so a separate `numeric` rule is redundant. It then matches `/^[+-]?\d*\.?(\d*)$/` — which has no `e`/`E` branch, so **`decimal` alone rejects scientific notation** (`1e2` passes PHP's `is_numeric()` and would sail through a bare `numeric` rule as `100`). `0,3` also caps precision at 3 decimals, matching `decimal(6,3)` — without it, `21.0001` reaches MySQL and is silently truncated or errors, depending on strict mode. |
| `min:0` | The PRD's "negative value" rejection. It compares **numerically**, not by string length, because `Validator::$numericRules` is `['Numeric', 'Integer', 'Decimal']` — `Decimal`'s presence in the same rule set is what puts `getSize()` into numeric mode. Dropping `decimal` would silently turn `min`/`max` into *string-length* rules. |
| `max:100` | 0016 flagged `decimal(6,3)`'s ability to express `100.000` exactly and handed the "≤ 100" boundary to this story; **100 is confirmed** (D5). An unbounded rule lets `1000` reach a `decimal(6,3)` column and produce a raw SQLSTATE overflow instead of a field-level message — the same opaque-`23000` failure mode 0016 flagged elsewhere. |

> ⚠️ **`nullable` does not rewrite `''` to `null`.** **Mechanism corrected at Phase 2 (finding F-8)**:
> `Validator::validateNullable()` itself always returns `true` and does nothing; what actually skips the
> rest of the rule set for a blank value is `Validator::presentOrRuleIsImplicit()`. Either way,
> `$validated['rate']` comes back as the empty string it went in as — the component must convert
> explicitly (`$rate = $validated['rate'] === '' ? null : $validated['rate'];`) before calling the action.
> Do not rely on undocumented coercion. **Consequence worth knowing**: because `$rate` is a non-nullable
> `string` property, `''` is skipped by `presentOrRuleIsImplicit()` with or without `nullable` present at
> all — so `nullable` earns its place here only for direct use of `rateRules()` in isolation (e.g. the
> mirror test at D12), not for anything the component path depends on.

> ⚠️ **A locale comma (`21,5`) is rejected by `decimal`** — its regex has no comma branch — and **the comma
> is accepted input** (D12), so the component **must** normalise it as the **first statement after
> authorization and before `validate()`**:
>
> ```php
> $this->rate = trim(str_replace(',', '.', $this->rate));
> ```
>
> This is exactly the position — and the reason — `Users\Index::save()` lowercases the email in: normalising
> inside the action instead would let the validation rule see the un-normalised value and reject it.
> One consequence to keep in mind when reading the test list: `'21,5'` is therefore a **valid** input on the
> component path and an **invalid** one against `rateRules()` in isolation. Both facts are asserted.

### `app/Policies/SalesRegionPolicy.php` — **create**

Scaffold with `php artisan make:policy SalesRegionPolicy --model=SalesRegion --no-interaction`.
Auto-discovered for `App\Models\SalesRegion` by name alone — **no provider registration**, and this repo
has no `AuthServiceProvider` (do not add one).

```php
public function viewAny(User $actor): bool
{
    return $actor->hasPermissionTo('sales-regions.view');
}

public function update(User $actor, SalesRegion $target): bool
{
    return $actor->hasPermissionTo('sales-regions.edit');
}
```

- **`hasPermissionTo()` inside a policy body is correct here**, even though it does not itself reach
  `Gate::before` — a policy method is only ever reached *through* the Gate, and the Super Admin is granted
  before the policy is consulted at all. This is the documented rule, not an oversight; see
  [authorization.md](../../../docs/architecture/authorization.md#policies).
- **Two abilities only.** `sales-regions.create` / `sales-regions.delete` are seeded but have no affordance
  in this story or 0018 (D8). Defining policy methods for abilities nothing calls is untested surface.
- **No target-dependent branch**, unlike `UserPolicy::update()`'s Super Admin exclusion — there is no
  untouchable row in this domain today. It stays an instance method anyway, so the per-row
  `Gate::allows()` UI hint reuses the identical method a future target-dependent rule would need.

### `app/Actions/SalesRegions/UpdateSalesRegion.php` — **create**

Invokable, imperative verb-phrase name (no `Action`/`Service` suffix). The sole writer of the plain
`#[Fillable]` triple. **Per the Phase 1 reconciliation, authorizes itself first** (0008a convention) via
`LogRefusedPrivilegedAttempt`, constructor-injected (matching `UpdateUser`'s shape — this is a class
depending on another class, not a Livewire per-method injection):

```php
public function __construct(
    private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
) {}

public function __invoke(SalesRegion $region, ?string $code, ?string $description, ?string $rate): SalesRegion
{
    // targetType/targetId passed explicitly: LogRefusedPrivilegedAttempt::resolveTarget()
    // only auto-resolves User and Role Gate targets (0015b's own two domains), not
    // SalesRegion — see docs/architecture/authorization.md's "third admin screen" recipe.
    $this->logRefusedPrivilegedAttempt->authorize('update', $region, targetType: 'sales_region', targetId: $region->id);

    return tap($region)->fill([
        'code' => $code,
        'description' => $description,
        'rate' => $rate,
    ])->save();
}
```

`fill()`, not `forceFill()` — these three columns *are* in `#[Fillable]`, and the omission of every other
column is precisely this repo's mass-assignment guard. Do not widen it.

### `app/Actions/SalesRegions/SetDefaultSalesRegion.php` — **create**

**The single named writer of `is_default`, anywhere in the app.** Per the Phase 1 reconciliation,
authorizes itself first (the Gate-shaped check), and logs the D10 refusal (a non-Gate,
`ValidationException`-shaped check) explicitly before throwing it — both through
`LogRefusedPrivilegedAttempt`, constructor-injected:

```php
public function __construct(
    private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
) {}

public function __invoke(SalesRegion $newDefault): SalesRegion
{
    $this->logRefusedPrivilegedAttempt->authorize('update', $newDefault, targetType: 'sales_region', targetId: $newDefault->id);

    return DB::transaction(function () use ($newDefault): SalesRegion {
        // D10 — an inactive entry may never hold the default flag. Enforced HERE, not only
        // in the form rule, so every call site inherits it. Logged before the throw so a
        // direct (non-dashboard) caller's probing is traced identically to the component's.
        if (! $newDefault->is_active) {
            $this->logRefusedPrivilegedAttempt->log(Auth::user(), 'default_must_be_active', 'sales_region', $newDefault->id);

            throw ValidationException::withMessages([
                'replacementDefaultId' => __('sales-regions.errors.default_must_be_active'),
            ]);
        }

        SalesRegion::query()
            ->where('is_default', true)
            ->lockForUpdate()
            ->get()
            ->each(fn (SalesRegion $current): bool => $current->forceFill(['is_default' => false])->save());

        return tap($newDefault)->forceFill(['is_default' => true])->save();
    });
}
```

> ⚠️ **The `authorize()` call sits *outside* the transaction, on purpose** — matching `UpdateUser`'s and
> `EnforceGrantorPermissionScope`'s shape: authorization is a precondition to *starting* the operation, not
> part of the data it writes, so a refusal never opens a transaction at all.

Three properties, each load-bearing:

- **The lock is on `where('is_default', true)`, not on the target row.** That is what serialises two
  concurrent "set default" calls aimed at *different* targets: both transactions contend on the same
  currently-default row, so the second blocks until the first commits and then reads the already-cleared
  state. Locking only `$newDefault` would let two administrators produce two defaults.
- **`->get()->each(...)` rather than `->first()`** is deliberate self-healing: if the invariant were ever
  violated by a data mishap, the next call converges instead of leaving a second flag behind.
- **Clear-before-set ordering** is what keeps this compatible with the deferred database backstop (D13) — a
  `STORED` generated column + UNIQUE would *require* this order, and this transaction already has it, so
  the follow-up story adds a constraint rather than a rewrite.
- **The `is_active` refusal is inside the transaction and inside the lock**, so it cannot be raced by a
  concurrent deactivation of the very row being promoted.

### `app/Actions/SalesRegions/SetSalesRegionActive.php` — **create**

**The single named writer of `is_active`**, and the place the PRD's coupling between deactivation and the
default flag is expressed. Per the Phase 1 reconciliation: authorizes both rows it can write (its own
target, and — if supplied — the replacement, since promoting it is this action's effect too, not only
`SetDefaultSalesRegion`'s), logs the D3 refusal before throwing it, and **constructor-injects**
`SetDefaultSalesRegion` (one action depending on another — the documented exception is constructor
injection, not `app()`, which is reserved for a zero-parameter `#[Computed]` method):

```php
public function __construct(
    private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    private readonly SetDefaultSalesRegion $setDefaultSalesRegion,
) {}

public function __invoke(SalesRegion $region, bool $active, ?SalesRegion $replacementDefault = null): SalesRegion
{
    $this->logRefusedPrivilegedAttempt->authorize('update', $region, targetType: 'sales_region', targetId: $region->id);

    if ($replacementDefault !== null) {
        $this->logRefusedPrivilegedAttempt->authorize('update', $replacementDefault, targetType: 'sales_region', targetId: $replacementDefault->id);
    }

    return DB::transaction(function () use ($region, $active, $replacementDefault): SalesRegion {
        if (! $active && $region->is_default) {
            if ($replacementDefault === null || $replacementDefault->is($region)) {
                $this->logRefusedPrivilegedAttempt->log(Auth::user(), 'default_deactivation_requires_replacement', 'sales_region', $region->id);

                throw ValidationException::withMessages([
                    'replacementDefaultId' => __('sales-regions.errors.default_deactivation_requires_replacement'),
                ]);
            }

            ($this->setDefaultSalesRegion)($replacementDefault);
        }

        return tap($region)->forceFill(['is_active' => $active])->save();
    });
}
```

> ⚠️ **Both `authorize()` calls sit outside the transaction, before it opens** — same reasoning as
> `SetDefaultSalesRegion` above. Authorizing the replacement here (rather than relying solely on the
> `authorize()` call inside `$this->setDefaultSalesRegion`'s own `__invoke()`) means a refusal on the
> *replacement* row is reported before any transaction opens at all, not partway through one that then has
> to unwind — and it mirrors `setActive()`'s own two-row authorization on the component side (see
> "Component public surface" below), so the same rule is expressed at both layers rather than only one.

- **One transaction, so "simultaneously" is literal.** There is never an observable instant with zero
  defaults — not between two user requests, and not between two statements of one request. A mid-operation
  failure rolls back both writes (D3). **Caveat, per the Phase 1 reconciliation**: because
  `$this->setDefaultSalesRegion` opens its **own** inner `DB::transaction()`, Laravel nests it as a
  SAVEPOINT only *while the outer transaction is open* — if the outer transaction here were ever removed
  (see revert-check 3's corrected description below), the inner call would run as an independent,
  fully-committing transaction instead. The outer wrapper is therefore load-bearing for real, not merely
  stylistic; do not "simplify" it away on the reasoning that the inner action already wraps itself.
- **`$replacementDefault->is($region)` is refused too** — naming the row being deactivated as its own
  replacement would satisfy a naïve null-check while producing an inactive default.
- **`ValidationException`, not a bare exception** (D4). Verified in the installed source:
  `Livewire\Features\SupportValidation\SupportValidation` catches `ValidationException` thrown from **any**
  component method, not only from `$this->validate()` — so the message reaches the form's error bag with no
  extra plumbing, and 0018 needs no special handling.
- **`$this->setDefaultSalesRegion` is constructor-injected, matching `UpdateUser`'s documented exception**
  to this repo's per-method-injection convention (an action's own dependency is constructor-injected when
  the method signature is a public contract — see
  [code-style.md](../../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)):
  that convention governs *component methods*; this is one action depending on another, the same shape
  `UpdateUser` uses for `EnsureRecentPasswordConfirmation` and `LogRefusedPrivilegedAttempt`.

### `routes/sales-regions.php` — **create**, and `routes/web.php` — **modify (one `require` line only)**

Per the Phase 1 reconciliation above: a new area gets its own route file, mirroring `routes/roles.php`'s
shape exactly, **including its inline warning comment**:

```php
// routes/sales-regions.php
use App\Livewire\SalesRegions\Index as SalesRegionsIndex;   // aliased: `Index` is ambiguous across areas,
                                                              // exactly like routes/roles.php's own import
                                                              // (Phase 2 finding F-7)

Route::middleware(['auth', 'verified'])->group(function () {
    // `can:sales-regions.view`, not Spatie's `permission:` — same reason as users.index /
    // roles.index: Livewire 4's PersistentMiddleware allowlist carries Laravel's `Authorize`
    // (`can:`) but not Spatie's `PermissionMiddleware`, so a `permission:`-gated route would
    // protect the initial GET only, leaving every save()/setDefault()/setActive()
    // /livewire/update round-trip unauthorized. See docs/architecture/authorization.md.
    Route::livewire('taxes/sales-regions', SalesRegionsIndex::class)
        ->middleware(['can:sales-regions.view'])
        ->name('sales-regions.index');
});
```

```php
// routes/web.php — add one line alongside the existing require's
require __DIR__.'/sales-regions.php';
```

> 📌 **The URI and route name are confirmed** (D11). `/taxes/sales-regions` satisfies PRD §2.1's *"lives as a
> section **inside the Taxes area** (not a top-level sidebar item)"* without requiring a parent Taxes screen
> to exist yet, and `sales-regions.index` keeps the route name aligned with the `sales-regions.*` permission
> module slug. 0018 links to `route('sales-regions.index')`; do not rename either half.

### `lang/en/sales-regions.php`, `lang/es/sales-regions.php` — **create**

Both files, in the same change, **key-for-key identical** — the hard rule in
[naming.md](../../../docs/conventions/naming.md#translation-keys). This story creates them for the
**domain-error copy its own actions produce** (`errors.default_deactivation_requires_replacement` and
`errors.default_must_be_active`, plus the
validation attribute names), the same way `users.email_change.*` is owned by the story that owns the action
producing it. 0018 grows the same files additively with list/label copy; it does not create them.

Note this is also where `SalesRegionKind::label()` would resolve from, if 0018 needs it — 0016 deliberately
declined to add that method because nothing rendered `kind` yet. **It is still not this story's to add**:
nothing here renders `kind` either.

### `database/factories/SalesRegionFactory.php` — **no change required**

0016's states (`fiscalTerritoryOf()`, `isDefault()`, `inactive()`, `withRate()`) cover every
arrangement this story's tests need, and `code`/`description`/`rate` are `#[Fillable]` so a plain
`->create([...])` override reaches them. If the "one default + one active replacement candidate" arrangement
proves repetitive, add a **test-local helper function inside the Pest file**, not a new factory state — that
shape is specific to this story's tests, not a general model shape other stories reuse.

## Component public surface

**This is the interface story 0018 binds to.** Treat a change here as a contract change.

```php
namespace App\Livewire\SalesRegions;

#[Title('Sales Regions')]
class Index extends Component
{
    use SalesRegionValidationRules;

    /**
     * @var array<int, array{id: string, slug: string, code: string|null, name: string,
     *     description: string|null, rate: string|null, kind: SalesRegionKind, parentId: string|null,
     *     isDefault: bool, isActive: bool, sortOrder: int, canEdit: bool}>
     */
    #[Locked]
    public array $regions = [];

    #[Locked]
    public ?string $editingRegionId = null;

    public bool $showModal = false;

    public string $code = '';                  // never null — see the rule below
    public string $description = '';           // never null
    public string $rate = '';                  // '' == unconfigured; converted to a real null before the action
    public bool $active = false;               // matches is_active's own column default
    public string $replacementDefaultId = '';  // '' == no replacement chosen

    /**
     * Active regions except the one being edited — D10 means an inactive entry is never
     * offerable as a replacement, so this is "active, not self", not "all, not self".
     *
     * @return array<int, array{id: string, name: string}>
     */
    #[Computed]
    public function replacementCandidates(): array;

    public function mount(): void;   // plain Gate::authorize('viewAny', SalesRegion::class) — deliberately
                                     // UNLOGGED, mirroring Users\Index::mount() (0015b finding F-2): the
                                     // route's own can:sales-regions.view checks the identical ability and
                                     // can: IS on Livewire's PersistentMiddleware allow-list, so a refusal
                                     // here is unreachable over HTTP. Do not "fix" this into a logged call.
    public function openEditModal(string $regionId, LogRefusedPrivilegedAttempt $log): void;   // gated AND
                                                                                                // logged — it discloses
    public function save(UpdateSalesRegion $u, SetSalesRegionActive $a, LogRefusedPrivilegedAttempt $log): void;
    public function setDefault(string $regionId, SetDefaultSalesRegion $s, LogRefusedPrivilegedAttempt $log): void;
    public function setActive(string $regionId, bool $active, string $replacementDefaultId, LogRefusedPrivilegedAttempt $log): void;
    public function closeModal(): void;
}
```

> ⚠️ **Phase 2 finding F-1, fixed here.** The original draft left every mutating/disclosing component
> method as a bare, unlogged `Gate::authorize()` — contradicting this file's own acceptance criteria and
> making the refusal-logging tests below unsatisfiable. Every method except `mount()` now injects
> `LogRefusedPrivilegedAttempt` and calls `$log->authorize('update', $target, targetType: 'sales_region',
> targetId: $target->id)` (or `->log(Auth::user(), '<reason>', 'sales_region', $target->id)` for a non-Gate
> refusal) as its first statement — mirroring `Users\Index`/`Roles\Index` exactly, per
> [architecture/authorization.md](../../../docs/architecture/authorization.md)'s "third admin screen"
> recipe. This is **in addition to**, not instead of, each action's own self-authorization (defense in
> depth, same shape as `setActive()`'s two-row check below) — a refused component-level call still never
> reaches the action at all, and a direct action call still refuses independently for a non-dashboard
> caller.
>
> **`setActive()`'s `$replacementDefaultId` lost its `= ''` default** (also F-1): a defaulted parameter
> cannot precede the trailing container-resolved `LogRefusedPrivilegedAttempt $log`. The Blade caller in
> 0018 must always pass this argument explicitly (an empty string when no replacement is chosen), which is
> what every real `wire:click` call already does for a required parameter elsewhere in this codebase.

Seven properties of this surface are load-bearing (grew from six at Phase 2, finding F-5):

- **No `wire:model`-bound property is ever `null`.** `$code`, `$description` and `$rate` are plain `string`,
  `$active` is a plain `bool`, `$replacementDefaultId` is a plain `string` whose `''` matches a placeholder
  `<option value="">` exactly. This is the direct application of
  [errors-log.md](../../../docs/errors-log.md)'s `null`-property/native-`<select>` entry: Livewire assigns the
  dehydrated value straight onto the element's `.value`, and a JS `null` stringifies to `"null"`, matching no
  option and silently swallowing the user's own pick. The rule is applied **uniformly**, including to the
  text inputs, rather than reasoned case-by-case about which controls are exempt.
- **`$regions` is `#[Locked]`** — D9. `security/livewire-authorization.md`'s rule is "every server-derived
  property is `#[Locked]`, not just the ids", and `Users\Index::$users` is now locked too (since story
  0015), so this follows the same rule rather than diverging from it.
- **`setActive()` and `save()` are two entry points to *one* rule.** Both delegate to
  `SetSalesRegionActive`, so 0018 may render an inline row switch, a modal field, or both, without the
  invariant existing in two places. The trigger's UI shape is 0018's call.
- **`setActive()` authorizes BOTH rows it writes — now doubly, by design.** The component's own
  `$log->authorize('update', $target, ...)` **and** `$log->authorize('update', $replacement, ...)` (when
  supplied) are the same "cover every thing the operation actually achieves" principle
  [authorization-patterns.md](../../../docs/security/authorization-patterns.md#an-ability-must-cover-every-attribute-that-achieves-its-effect-not-only-the-operation-it-is-named-after)
  established for attributes, applied here to a second *row*. **Per the Phase 1 reconciliation,
  `SetSalesRegionActive` now authorizes both rows itself too** — this is deliberate defense-in-depth, not
  redundant duplication to remove: the action's check is what a non-dashboard caller inherits, the
  component's is what renders `canEdit` correctly and fails fast before opening a transaction. Same shape
  as `Users\Index::save()` calling its own gate alongside `UpdateUser`'s own.
- **`canEdit` per row comes from `Gate::allows('update', $region)`** inside the private `loadRegions()` —
  never `Gate::authorize()`, which would throw while rendering a list. It is a **UI hint layered on top of**
  the mandatory per-method checks, never a replacement for them. There is no `canDelete`: no delete
  affordance exists.
- **`$editingRegionId` is `#[Locked]`** for the same reason `$editingUserId` is: it is the authorized
  identity, and an unlocked copy would let the client authorize one row and write another.
- **A permitted mutation logs a success line too — added at Phase 2 (finding F-5).** The "third admin
  screen" recipe's step 5 expects a `Log::info` success line alongside every `Log::warning` refusal line,
  matching `Roles\Index`'s `Log::info('Role saved', [...])` / `Log::info('Role deleted', [...])`. `save()`
  logs `Log::info('Sales region updated', ['actor_id' => Auth::id(), 'sales_region_id' => $region->id])`
  once, after both its action calls succeed; `setDefault()` and `setActive()` each log the same shape after
  their own successful write. This is a component-level log (like `Roles\Index`'s, not inside the action),
  since it is the *component's* audit trail for "an administrator changed this row", not a rule the action
  itself enforces.

## Tests to perform

Scaffold artisan-first. Every test arranges with `SalesRegionFactory` — **never** by running
`SalesRegionSeeder` (249 rows per test), per 0016's explicit instruction. The one exception is any test
exercising a real `sales-regions.*` permission string, which must `$this->seed(RolePermissionSeeder::class)`
and flush the permission cache in `beforeEach()`, exactly as `UserPolicyTest.php` does — an unseeded
permission name throws `PermissionDoesNotExist`.

**Table below corrected at Phase 2 (finding F-4)**: direct action-level authorization tests are routed to
each action's own file (matching the `Users/CreateUserActionAuthorizationTest.php` /
`UpdateUserActionAuthorizationTest.php` precedent — one file per action, not one file for all three), and
a fifth file is added for refusal-logging equivalence, matching the `Users/RefusalLoggingTest.php` +
`ActionRefusalLoggingTest.php` pair both cited by the copyable recipe's step 4.

| Path | Suite | Scaffold | Holds |
| --- | --- | --- | --- |
| `tests/Feature/Policies/SalesRegionPolicyTest.php` | Feature | `php artisan make:test --pest Policies/SalesRegionPolicyTest` | `viewAny` / `update`, allow and deny, plus the Super Admin bypass with zero permission rows |
| `tests/Feature/SalesRegions/IndexTest.php` | Feature | `php artisan make:test --pest SalesRegions/IndexTest` | the route-level HTTP block, and `Livewire::test()` coverage of edit / rate validation / `setDefault` |
| `tests/Feature/SalesRegions/SetSalesRegionActiveTest.php` | Feature | `php artisan make:test --pest SalesRegions/SetSalesRegionActiveTest` | the deactivation guard and the atomic swap (including the forced-rollback proof), **plus** its own direct `app(SetSalesRegionActive::class)(...)` authorization test — split out because its failure-mode assertions do not belong mixed into the edit happy path |
| `tests/Feature/SalesRegions/SetDefaultSalesRegionTest.php` | Feature | `php artisan make:test --pest SalesRegions/SetDefaultSalesRegionTest` | **added during Phase 1 reconciliation (backend-qa gap):** the direct, action-level call `app(SetDefaultSalesRegion::class)(...)`, bypassing the Livewire layer entirely — the D10 inactive-target refusal and `LogRefusedPrivilegedAttempt::authorize()`'s own refusal, proven independently of the component per the 0008a/0015b convention that an action must be independently callable and independently authorized |
| `tests/Feature/SalesRegions/RefusalLoggingTest.php` | Feature | `php artisan make:test --pest SalesRegions/RefusalLoggingTest` | **added at Phase 2 (finding F-4):** the cross-screen/cross-layer refusal-logging equivalence assertions (see the "Refusal logging" bullet below) — `UpdateSalesRegion`'s own direct-call authorization test lives here too, since that action has no other dedicated file |

- [x] **Integration (editing):** editing `rate` persists exactly that value **and** it round-trips as a
      **string** (`toBe('7.500')` *and* `toBeString()`) — pinning only the value lets a regression to `float`
      casting pass silently. `description` and `code` persist exactly; a `null` `description` clears a
      previously-set value. Also assert this plain edit leaves `slug`/`name`/`parent_id` unchanged — the
      normal-path witness for "configuring an entry leaves its identity untouched" (Gherkin), distinct from
      the forged-payload attack test below.
- [x] **Integration (clearing a rate, added during Phase 1 reconciliation — backend-qa gap):** an entry that
      already carries a configured rate, submitted through the component with `$rate = ''`, persists with
      `rate === null` — the direct test for D6/AC7's "a blank submission clears a configured rate back to
      unconfigured", which nothing in the original list actually exercised.
- [x] **Integration (enabling an inactive entry, added during Phase 1 reconciliation — backend-qa gap):**
      `setActive($id, true, '')` on a seeded-inactive entry persists `is_active === true` (three args —
      `$replacementDefaultId` has no default since Phase 2's F-1 fix). The Gherkin's
      "Enabling a seeded but inactive region entry" scenario had no corresponding test — every other
      `setActive`-related bullet below is about *disabling*.
- [x] **Integration (editing, non-interference):** changing only `rate` leaves `code` and `description`
      untouched — the "did the update accidentally null a sibling column" regression.
- [x] **Integration (structural columns):** a forged payload naming `slug`, `name`, `parent_id`, `kind` or
      `sort_order` changes none of them **through this story's real write path** (not merely through `fill()`
      in isolation, which 0016 already proves — a bug in the action could route around the guard with
      `forceFill()`).
- [x] **Integration (no create path):** every edit / toggle / default-swap test asserts
      `SalesRegion::count()` is unchanged before and after. This is the **positive, falsifiable** form of
      "the catalog cannot grow" — see the deliberately-not-tested note below for why the bare negative form
      is refused.
- [x] **Integration (single default — both halves):** after `setDefault`, assert
      `SalesRegion::where('is_default', true)->count()` is **1** *and* that the single row is the new one, as
      **two separate assertions**. A test asserting only the second half passes on an implementation that
      never clears the old flag.
- [x] **Integration (the old default specifically):** re-fetch the previously-default row and assert
      `is_default === false` on that instance, and that its `is_active` was **not** touched.
- [x] **Integration (idempotent default):** re-setting the already-default entry is a no-op — still exactly
      one default, same row, no error, no side effect on any other row.
- [x] **Integration (the load-bearing refusal):** disabling the current default with **no** replacement is
      refused, **and** the row re-read from the database is still `is_active = true` and `is_default = true`.
      Asserting only the exception would pass on an implementation that persisted the change and merely
      *reported* failure.
- [x] **Integration (negative control):** disabling a **non-default** active entry succeeds with no
      default-related side effect — proves the guard is keyed on "is this the default", not "disabling is
      privileged".
- [x] **Integration (inactive cannot be the default, D10):** `setDefault()` on an inactive entry is refused
      and the existing default is untouched; naming an inactive entry as the **replacement** while disabling
      the current default is refused and *both* rows are untouched. Assert the refusal **at the action
      level too**, not only through the component — the form rule and the action guard are two separate
      mechanisms and a test that only exercises the component leaves the action's guard unproven.
- [x] **Integration (the atomic swap):** disabling the default while naming a replacement leaves the old row
      `is_active = false, is_default = false` and the new row the only default — asserted in one test, on
      both rows.
- [x] **Integration (atomicity under failure):** force the second half of the operation to throw and assert
      the **first** half was not persisted either. This is the only test that exists if and only if the
      operation is wrapped in `DB::transaction()`; without it, the forbidden zero-default state is reachable
      by a mid-request failure rather than a bad guard.
- [x] **Integration (self-replacement):** naming the row being deactivated as its own replacement is refused.
- [x] **Integration (malformed replacement):** a non-existent or malformed replacement id is refused cleanly
      — a validation failure, not a 500, and no partial write.
- [x] **Negative (rate validation, Pest dataset):** `-1`, `-0.001`, `'abc'`, `'1e2'` (scientific notation),
      `21.0001` (over-precision) and `100.001` (over max) are each rejected **through the component**, and
      the entry's previous rate survives every one of them.
- [x] **Positive (locale comma, D12):** `'21,5'` submitted **through the component** is accepted and stored
      as `21.500`. Its mirror belongs in the same file: `'21,5'` validated against `rateRules()` **in
      isolation** fails — which is precisely why the component's normalisation exists, and the pair is what
      stops someone "simplifying" the normalisation away on the grounds that the rule set handles it.
- [x] **Positive (rate boundaries, outside the dataset — a different assertion shape):** `0` **submitted
      through the component persists as the string `'0.000'`, not `null`** (tightened during Phase 1
      reconciliation: asserting only that `save()` didn't throw would pass on an implementation that
      silently mapped `'0'` to `null` before writing — 0016 is explicit that `0.000` is a real rate distinct
      from `NULL`, so the persisted *value* is the assertion, not merely the absence of a validation error);
      the exact upper bound is accepted and one unit over it is rejected.
- [x] **Authorization — HTTP layer** (`$this->get(route('sales-regions.index'))`): guest → redirect to
      sign-in; signed-in without `sales-regions.view` → 403; with it → 200; Super Admin holding zero
      permission rows → 200.
- [x] **Authorization — `Livewire::test()` layer:** a user who holds `sales-regions.view` but **not**
      `sales-regions.edit` is refused on `save()`, `setDefault()`, `setActive()` and `openEditModal()`, and
      nothing is persisted. **Plus** (added during Phase 1 reconciliation, for parity with
      `Users\IndexTest.php`'s precedent): a direct `Livewire::test(Index::class)` mount for a user holding
      **zero** relevant permissions throws on `mount()` itself, proving the component's own `viewAny` gate
      fires independently of the route's `can:` middleware.
      > **Both layers are mandatory and neither substitutes for the other**, and the story must say so: the
      > HTTP test only mounts and renders, so a missing `Gate::authorize()` inside `setDefault()` is invisible
      > to it; the `Livewire::test()` test never goes through routing, so a wrong permission string on the
      > `can:` middleware — or its omission — is invisible to *it*.
- [x] **Authorization — action layer, direct calls (added during Phase 1 reconciliation; file allocation
      corrected at Phase 2, finding F-4 — each action's own test lives in its own file, per the
      `Users/CreateUserActionAuthorizationTest.php`/`UpdateUserActionAuthorizationTest.php` precedent):**
      calling `app(UpdateSalesRegion::class)` (in `RefusalLoggingTest.php`),
      `app(SetDefaultSalesRegion::class)` (in `SetDefaultSalesRegionTest.php`) and
      `app(SetSalesRegionActive::class)` (in `SetSalesRegionActiveTest.php`) directly — bypassing the
      Livewire layer — with an actor lacking `sales-regions.edit` throws `AuthorizationException` from
      each, and nothing persists — proving the 0008a-pattern self-authorization actually holds, not merely
      that the component happens to check first.
- [x] **Refusal logging (added during Phase 1 reconciliation — the story now wires
      `LogRefusedPrivilegedAttempt`, so it inherits 0015b's own coverage expectations; homed at Phase 2 in
      `tests/Feature/SalesRegions/RefusalLoggingTest.php`):** with `Log::spy()`, a refused
      `openEditModal()`/`save()`/`setDefault()`/`setActive()` call — **both** through the component **and**
      through the corresponding direct action call — records exactly one
      `Log::warning('Privileged action refused', [...])` entry with `target_type === 'sales_region'`; a
      permitted call records none. Mirror the exact-key-set equivalence assertion
      `tests/Feature/Roles/RefusalLoggingTest.php` uses, so Sales Regions' shape is proven identical to the
      Users/Roles screens' rather than merely plausible on its own — this is the "third admin screen" proof
      [architecture/authorization.md](../../../docs/architecture/authorization.md)'s copyable recipe expects.
- [x] **Must-not-over-log (added at Phase 2, finding F-5, in `RefusalLoggingTest.php`):** a permitted
      `save()`, `setDefault()` and `setActive()` each produce **exactly** their new `Log::info('Sales region
      updated', [...])` success line and **no** `Log::warning` refusal line — the positive mirror of the
      refusal-logging bullet above, matching `Users/Roles/RefusalLoggingTest.php`'s own must-not-over-log
      tests.
- [x] **Integration (seeder cross-check, one test):** after this story's actions change `rate`, `code`,
      `description`, `is_active` **and** `is_default` on a row, re-running `SalesRegionSeeder` leaves all
      five untouched. This is the one place a change in *this* story could silently regress a guarantee
      **0016** made, because 0017 is the first code to exercise those "administrator-configurable" columns
      for real.

**Mandatory revert-checks** (run them, don't just assert the tests exist — the pattern 0016 established):

1. **Comment out the "clear the old default" statement** → the single-default test must go red on **both**
   halves. If only one half reddens, the test is under-asserting.
2. **Remove the "is this the current default" guard** from `SetSalesRegionActive` → the refusal test must go
   red, ending in the zero-default state the PRD forbids.
3. **Remove `SetSalesRegionActive`'s *outer* `DB::transaction()` wrapper** and force the deactivate `save()`
   (the *second* statement inside it) to throw → the atomicity test must go red — **corrected during Phase 1
   reconciliation**: the original description ("leaving the old default disabled with no replacement") had
   the symptom backwards. Traced against Laravel's real `Connection::transaction()` (nested calls use a
   SAVEPOINT only while an outer transaction is open): with the outer wrapper removed,
   `$this->setDefaultSalesRegion`'s own **inner** transaction runs standalone and commits fully before the
   deactivate `save()` ever throws. The actual symptom is: the **new** row *is* promoted to default
   (persisted), while the **old** row's `is_active` stays `true` (never persisted) — i.e. the promotion
   sticks and the old default is never disabled, not the reverse. Assert exactly that shape.
4. **Replace `decimal:0,3` with a bare `numeric`** → the scientific-notation and over-precision dataset rows
   must go red. This is the check that proves the dataset earns its place rather than restating what
   Laravel's default `numeric` would have caught anyway. **Note (Phase 1 reconciliation):** this check alone
   does *not* prove the `min`/`max`-as-string-length trap D5's table warns about — `numeric` is itself a
   member of `Validator::$numericRules`, so `min`/`max` stay in numeric mode under this specific revert, and
   the negative-value dataset rows stay correctly rejected. See revert-check 5.
5. **Added during Phase 1 reconciliation (backend-qa gap) — remove every numeric-family rule**, i.e. change
   `rateRules()` to `['nullable', 'min:0', 'max:100']` with no `decimal`/`numeric` present at all → the
   negative-rate dataset row (`-1`) must go red **for the wrong reason** (accepted, not rejected), because
   `min`/`max` fall back to comparing the submitted string's *length* rather than its numeric value. This is
   the check that actually proves D5's "dropping `decimal` silently converts `min`/`max` to string-length
   rules" claim — revert-check 4 does not.
6. **Added during Phase 1 reconciliation, per the DoD's own risk flag on D10/D12 — remove the `!
   $newDefault->is_active` guard** in `SetDefaultSalesRegion` → the "inactive cannot be the default" test
   must go red.
7. **Added during Phase 1 reconciliation, same reason — remove the component's comma-normalisation line**
   (`str_replace(',', '.', $this->rate)`) → the locale-comma test (D12) must go red.

**Deliberately not tested, as decisions rather than gaps:**

- **The `#[Fillable]` mass-assignment guard as a standalone unit fact** — 0016's
  `tests/Unit/Models/SalesRegionTest.php` owns it. This story proves only that its **own write path** does
  not route around it.
- **The `decimal:3` cast mechanism itself, and UUIDv7 / route-binding behaviour** — 0016 proves the cast on
  the create path and 0001 proved `HasUuids` once against `users`. Re-proving either in a third file is
  coverage theatre.
- **Migration `up()`/`down()` mechanics** — `RefreshDatabase` runs every migration on every Feature test.
- **The seeder's own idempotency / no-clobber / drift-repair guarantees** — 0016's, fully. This story adds
  exactly the one inverse cross-check listed above.
- **"There is no way to invent a country", written as a bare absence assertion.** A test asserting that a
  feature nobody built does not exist is the anti-pattern
  [errors-log.md](../../../docs/errors-log.md) warns about and 0016 already declined once (its
  `Schema::hasTable('shipping_zones')` example). The testable substitutes are the unchanged-`count()`
  assertion above and — if desired — asserting that a specific named method (`createRegion`) does not exist
  on the component, which is a claim about one identifier rather than about the whole feature.
- **Tax-rate resolution** — 0026's, even though PRD §2.1's *"The default rate applies when no region
  matches"* scenario sits in the same block.
- **The Blade/Flux markup and any browser-level rendering** — 0018's. No `tests/Browser/**` file belongs
  here.

## Expected outcome

After this story, an administrator holding `sales-regions.edit` can open the Sales Regions screen, configure
any seeded entry's rate, description and code, enable or disable entries, and move the default flag — while
the catalog is **structurally incapable** of reaching an invalid state: never two defaults (one action,
one transaction, one row lock), never zero defaults (deactivating the current default without a replacement
is refused, and with a replacement is atomic), and never a stored rate that is negative, non-numeric, over-
precise or out of range. `slug`, `name`, `parent_id` and `kind` remain seeder-owned and unreachable from any
form. Story 0018 inherits a fully specified component surface to bind markup to, and story 0026 inherits a
catalog whose "exactly one default" precondition is now enforced rather than merely seeded.

## Acceptance criteria

- [x] A seeded entry's `rate`, `description` and `code` can each be changed and persist exactly, with `rate`
      round-tripping as a **string** through the `decimal:3` cast. *(PRD scenario: "Configure the tax rate on
      a seeded region entry"; PRD AC 2)*
- [x] An entry can be enabled and disabled, and `is_active` is written by **exactly one** named place in the
      codebase. *(PRD AC 2)*
- [x] Setting a new default clears the previous one, leaving **exactly one** default row. *(PRD scenario:
      "Marking a new default clears the previous one"; PRD AC 3)*
- [x] Disabling the current default is **refused** unless a replacement is named, and the refusal leaves the
      catalog byte-for-byte unchanged. *(PRD scenario: "Disabling the current default region is blocked
      unless a new default is set"; PRD AC 4)*
- [x] Disabling the default **with** a replacement is one atomic operation — a failure partway leaves neither
      write applied, so the catalog never holds zero defaults even transiently. *(PRD AC 4)*
- [x] Negative and non-numeric rates are rejected with a validation message, and the previously stored rate
      survives the rejection. *(PRD Scenario Outline: "An invalid tax rate is rejected"; PRD AC 6)*
- [x] `0` is accepted as a real rate and remains distinguishable from an unconfigured `NULL`, and a blank
      submission clears a configured rate back to `NULL`. *(D6)*
- [x] A rate typed with a decimal comma (`21,5`) is accepted through the component and stored as `21.500`. *(D12)*
- [x] An **inactive** entry can be neither marked as the default nor named as a replacement default, refused
      in the action and not only in the form rule. *(D10)*
- [x] `slug`, `name`, `parent_id`, `kind` and `sort_order` cannot be changed from this screen, and no path
      creates or deletes a region entry. *(PRD scenario: "The catalog does not allow inventing new
      countries")*
- [x] The route lives in its own `routes/sales-regions.php`, `require`d from `web.php` (never inlined
      there), gated with **`can:sales-regions.view`** (never `permission:`), and **every** mutating
      component method re-authorizes as its first statement — with `setActive()` authorizing both rows it
      writes. *(Both corrected during Phase 1 reconciliation.)*
- [x] **Each of the three actions (`UpdateSalesRegion`, `SetDefaultSalesRegion`, `SetSalesRegionActive`)
      authorizes itself as its first statement, independently of the component, via
      `LogRefusedPrivilegedAttempt`** — a direct action call from an actor lacking `sales-regions.edit`
      throws and persists nothing. *(Added during Phase 1 reconciliation — the story's own most
      consequential gap: 0008a's "an authorization rule belongs to the action, not to one of its callers"
      convention.)*
- [x] **Every refusal from these three actions, and from the component's own `mount()`-excepted
      `Gate::authorize()` calls, is logged via `LogRefusedPrivilegedAttempt`** with the same shape story
      0015b established for Users/Roles — a permitted call logs nothing. *(Added during Phase 1
      reconciliation.)*
- [x] A user holding `sales-regions.view` but not `sales-regions.edit` can load the screen and mutate
      nothing; a Super Admin holding zero permission rows can do both.
- [x] The full suite is green, including 0016's seeder tests — verified by the seeder cross-check test.

## Definition of Done
- [x] Tests written and green (the full suite, not just this story's — per [contracts.md](../../../docs/contracts.md)'s Full Test Suite Gate Rule)
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [x] Acceptance criteria met
- [x] All seven [mandatory revert-checks](#tests-to-perform) performed, each confirmed to redden its named
      test (grew from four to seven during Phase 1 reconciliation — #3 corrected, #5–#7 added)
- [x] The [locked decisions](#locked-decisions-confirmed-at-phase-1) implemented as recorded — in particular D10 (inactive entries excluded from both default paths) and D12 (the locale-comma normalisation), which are the two most likely to be dropped as "unnecessary"

## Documented functional decisions

**D1 — The single-default invariant lives in an action class, not an observer, not the component, and not
(today) the database.** Three alternatives were argued and rejected:

- *A model observer* fails twice over. 0016's risk 8 is real and generalises beyond the seeder — anything
  running under `WithoutModelEvents` silently skips it — but the deeper objection is structural: the
  operation is inherently **two-row** (clear the old, set the new), and reaching out to mutate a *different*
  row from a lifecycle event on this one turns every future `SalesRegion::save()` anywhere (a factory, a
  tinker session, a bulk tool) into an implicit trigger. An action class is "one named place"; an observer is
  "triggered by everything".
- *Component-level logic* is the exact failure mode
  [security/livewire-authorization.md](../../../docs/security/livewire-authorization.md#authorization-that-lives-only-in-the-component-is-bypassed-by-every-other-call-site-of-the-action)
  documents: a future Artisan command, queued job or controller calling the model directly would produce two
  defaults, or zero.
- *A database constraint* (0016's `STORED` generated column + UNIQUE, which genuinely works on MySQL 8.4
  because unique indexes ignore `NULL`s) is a **good backstop and a bad primary mechanism** — it produces an
  opaque `23000` rather than a field-level message. It is adopted as defence-in-depth in a
  **follow-up story** (D13), because building it here means adding a migration to a story deliberately
  scoped as "no new migration".

Consequence worth stating so a reviewer does not go looking for a fix that is not there: **0016's risk 8 is
closed by design, not by a mitigation.** There is no observer, so there is nothing for `WithoutModelEvents`
to bypass.

**D2 — `is_default` and `is_active` each get exactly one named writer.** Both are deliberately absent from
`SalesRegion`'s `#[Fillable]`, and 0016 explains why: the PRD *couples* deactivation to the default
invariant, so a fillable `is_active` next to a non-fillable `is_default` invites exactly the split write the
invariant forbids. This story keeps the convention this repo already documents for `users.status` /
`users.pending_email`: a non-fillable column is written by `forceFill()` **from one place** —
`SetDefaultSalesRegion` for `is_default`, `SetSalesRegionActive` for `is_active`.

**D3 — Disabling the default and naming its replacement is one atomic operation.** The PRD's word is
*"simultaneously"*, and two sequential saves satisfy it only as a UX convention: between them the catalog
holds zero defaults, and a crash, timeout or deploy in that window leaves it there permanently. One
`DB::transaction()` makes "simultaneously" a property of the data rather than of the user's clicking speed.

**D4 — The refusal is a `ValidationException`.** Verified by reading
`vendor/livewire/livewire/src/Features/SupportValidation/SupportValidation.php`: its `exception()` hook
(`if (! $e instanceof ValidationException) return;` → `setErrorBag($e->validator->errors())` →
`$stopPropagation()`) is a **component-level** hook, so it catches the exception thrown from *any* method,
not only from `$this->validate()`. The message therefore lands in the form's error bag with no extra
plumbing and 0018 needs no special handling. A bare `RuntimeException` would render as a 500; a silent
no-op would tell the administrator their disable succeeded when it did not — the worse of the two, because
it hides a state they will act on.

> ⚠️ **The error-bag key must be a real public property.** The same file's `dehydrate()` filters the
> persisted error bag through `Utils::hasProperty($this->component, $key)`, so an error keyed on a name the
> component does not declare is silently dropped on the next round-trip. `replacementDefaultId` is a
> declared public property, which is what makes the key in `SetSalesRegionActive` above the correct one —
> do not "tidy" it to something like `default` or `region.replacement`.

**D5 — `['nullable', 'decimal:0,3', 'min:0', 'max:100']`, with `numeric` deliberately absent.** All four
behaviours were verified by reading `Illuminate\Validation\Concerns\ValidatesAttributes` and
`Illuminate\Validation\Validator` in this repo's installed vendor tree, not recalled: `validateDecimal()`
calls `validateNumeric()` as its first line (so `numeric` is redundant), its regex has no `e`/`E` branch (so
scientific notation is rejected without an extra rule), its `0,3` bound caps precision before MySQL can
truncate it, and `Decimal`'s membership in `Validator::$numericRules` is what puts `min`/`max` into numeric
rather than string-length mode. That last one is the subtle trap: **dropping `decimal` silently converts
`min:0`/`max:100` into character-count rules** that would accept `-1` (two characters).

**D6 — `NULL` stays reachable; clearing a rate is supported.** `0.000` is a legitimate 0% rate and `NULL`
means "not configured yet" — 0016 made that distinction load-bearing at the column level, and a `required`
rate rule here would quietly destroy it by making every edited row carry *some* number. Two mechanical
consequences: `nullable` does **not** rewrite `''` to `null` (it only skips subsequent rules), so the
component converts explicitly; and a validation rule that treats `0` as empty would reject a legitimate rate.
**Confirmed** — a blank submission is a supported "clear it back to unconfigured" operation, since
there is otherwise no way to undo a mistaken rate.

**D7 — One permission tier: `sales-regions.edit` gates every mutation, including the default swap.**
`UserPolicy` has a real precedent for a second, stricter tier (`roles.manage-administrators` for
role/status/email changes), and changing which region is the tax default has genuine blast radius on every
future 0026 resolution. It is nonetheless **not** adopted, for a hard reason: the seeded 38-permission
catalog contains no candidate string, and `can()` against an unseeded name throws `PermissionDoesNotExist`
at runtime — so inventing one means editing `RolePermissionSeeder::MODULES`/`ROLE_PERMISSIONS`, which is a
catalog change, not a component detail. **Confirmed:** one tier, no new permission string.

**D8 — No `create` / `delete` policy method.** Both permissions are seeded (story 0002) and both are
deliberately unused: the catalog is fixed. Defining abilities nothing calls adds untested surface, and
0004's precedent is that a story defines exactly the abilities it uses.

**D9 — `$regions` is `#[Locked]`, *following* the rule `Users\Index::$users` now also follows.** The rule in
`security/livewire-authorization.md` is "every server-derived property is `#[Locked]`, not just the ids".
This was drafted against a stale read of `Users\Index`: at the time of writing, `$users` there was
unlocked, but **story 0015** (finding F4) locked it before this document reached Phase 1 review —
`backend-expert` verified this directly against `app/Livewire/Users/Index.php` at `HEAD`. `$regions` being
`#[Locked]` is correct, but it is the *same* precedent as `Users\Index::$users`, not a divergence from it.

**D10–D13 — the four decisions confirmed at the close of Phase 1.** An inactive entry may be neither the
default nor a replacement default (**D10**); the route is `/taxes/sales-regions` named `sales-regions.index`
(**D11**); a Spanish-locale comma is accepted and normalised in the component (**D12**); and the
at-most-one-default database backstop is a follow-up story (**D13**). Each is recorded with its rejected
alternatives in [Locked decisions](#locked-decisions-confirmed-at-phase-1) rather than restated here.

> 📌 **Amendment — 2026-08-18: the "grouping" concept was removed project-wide.** The product owner dropped
> the supranational grouping entries (Unión Europea, Internacional) from the Sales Region catalog entirely;
> the catalog is now **individual countries plus Spain's five fiscal territories** only, and
> [story 0016](../done/0016-sales-region-catalog-schema-and-seeder.md) owns that change at the schema/seeder level.
> Nothing in this story's *behaviour* changes — the single-default invariant, the deactivation coupling, the
> rate rules and the permission tier are all catalog-shape-independent — so this amendment touched **examples
> only**: the Gherkin scenarios that used "Unión Europea" or "Internacional" as a concrete entry now use
> "Canarias" and "Baleares", and the `grouping()` factory state was dropped from the list of 0016 states this
> story's tests arrange with. **D10 is unaffected**: "an inactive entry may be neither the default nor a
> replacement default" was never a grouping-specific rule and still holds exactly as written.

## Dependencies and risks

**Dependencies**

- **[Story 0016](../done/0016-sales-region-catalog-schema-and-seeder.md) — hard, blocking.** It creates the table,
  model, enum and factory this story writes against. **0017 cannot start Phase 3 until 0016 is done.**
- **[Story 0002](../done/0002-seed-roles-permissions-catalog.md)** — for the `sales-regions.*` permission
  strings, which already exist. No code dependency.
- **[Story 0004](../done/0004-users-list-editor-backend.md)** — the pattern precedent (policy + validation trait
  + actions + gated Livewire component). No code dependency.
- **No new Composer package and no new migration.** The database backstop that would need one is a
  follow-up story (D13).

**Risks**

1. **A second default created by a race.** Mitigated by the `lockForUpdate()` on the *currently-default*
   row-set rather than on the target — locking only the target would not serialise two administrators aiming
   at different rows. When the follow-up story (D13) adds the database backstop, the
   final `save()` will also need a `QueryException` (`23000`) catch rethrown as a `ValidationException`,
   mirroring `CreateUser`'s email-uniqueness race handling — that translation is **that** story's, not this
   one's.
2. **Zero defaults created by a partial write.** Mitigated by the single transaction (D3) and proved by the
   forced-rollback test — which is the only test that fails if the transaction is ever removed.
3. **A rate reaching MySQL unvalidated.** `decimal(6,3)` overflows at `1000`, producing a raw SQLSTATE rather
   than a field message. `max:100` closes it (D5).
4. **`min`/`max` silently becoming string-length rules** if `decimal` is ever dropped from the same rule array
   (D5). Cheap to introduce during a "simplification" and invisible in review; revert-check 4 catches it.
5. **The route URI outliving its decision.** Once 0018 links to `route('sales-regions.index')` and the sidebar
   points at it, changing the URI is a multi-file edit. Settled up front as D11 for exactly that reason.
6. **`$rate` reaching the action as `''` instead of `null`.** `nullable` does not coerce, and an empty string
   written to a `decimal` column behaves differently on MySQL and SQLite — the exact class of dev/CI
   divergence 0016 warned about for boolean casts. The explicit conversion is not optional.
7. **0018 recreating the Flux traps.** If it reuses the Users screen's per-row disabled-action pattern it must
   use the two-branch `@if`/`@else` form (never a conditionally-bound `:tooltip`), and put any
   `cursor-not-allowed!` on the tooltip wrapper rather than the `pointer-events-none` button. Both are in
   [errors-log.md](../../../docs/errors-log.md); flagged here so the paired story inherits the warning.
8. **File ownership with 0018.** This story owns `app/Livewire/SalesRegions/Index.php` and both
   `lang/*/sales-regions.php`; 0018 owns `resources/views/livewire/sales-regions.blade.php` and grows the
   lang files additively. If the two ever run concurrently, that is precisely what
   [contracts.md](../../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent
   File-Ownership Rule governs.

### Locked decisions (confirmed at Phase 1)

**No open questions remain.** Seven were raised during Phase 1 and all seven were confirmed by the product
owner as recommended. They are recorded here with the reasoning that produced them, because the *rejected*
alternatives are what stop a reviewer re-opening a settled question — and because each one shapes code that
would otherwise look arbitrary.

1. **Route URI — `/taxes/sales-regions`, named `sales-regions.index` (D11).** Satisfies PRD §2.1's *"lives as
   a section inside the Taxes area (not a top-level sidebar item)"*, keeps the route name aligned with the
   `sales-regions.*` permission module slug, and needs no parent Taxes screen to exist yet. *Rejected:* a
   bare `/sales-regions`, which defers the Taxes nesting to 0018 and makes the URI a second thing to change
   later.
2. **An inactive entry may be neither the default nor a replacement default — both refused (D10).** Keeps the
   invariant meaningful ("there is always a *usable* fallback") rather than merely non-null, and makes
   `replacementCandidates()` exactly "active regions except this one". *Rejected:* silently activating the
   candidate as part of the swap (a hidden second write the administrator never asked for), and permitting an
   inactive default (simplest code, and it hands story 0026 a fallback that can never resolve). Enforced in
   **both** actions, not only in the form rule.
3. **Rate upper bound — `max:100` (D5).** A percentage above 100 is almost certainly a typo, and an unbounded
   rule lets `1000` overflow `decimal(6,3)` into a raw SQLSTATE instead of a field-level message. *Rejected:*
   no bound. Revisit only if a compound rate above 100% turns out to be real — same fiscal sign-off
   class as 0016's open question about the seeded rate values.
4. **A blank rate clears it back to unconfigured (D6).** 0016 made `NULL` (unconfigured) vs `0.000` (a real
   0%) a deliberate distinction, and this is the only way to undo a mistaken rate. *Rejected:* `required`
   once an entry is edited, which would leave every edited row permanently carrying a number.
5. **One permission tier — `sales-regions.edit` gates every mutation including the default swap (D7).** The
   PRD names no second permission and the seeded catalog holds no candidate string, so inventing one is a
   catalog change to `RolePermissionSeeder`, not a component detail. Raised in the first place because the
   blast radius genuinely resembles the case that justified `roles.manage-administrators` on the Users screen
   — if that resemblance ever becomes a real requirement, it is a catalog story, not a tweak here.
6. **A Spanish-locale comma (`21,5`) is accepted, normalised in the component (D12).** The store's
   install-default content language is Spanish and a comma is what a Spanish keyboard produces; the
   normalisation is one line, in one named place, positioned before `validate()`. *Rejected:* rejecting the
   comma outright, which is what the bare rule set does and what a naïve reading of `rateRules()` still
   suggests — hence the paired test that pins both halves.
7. **The at-most-one-default database backstop is a follow-up story (D13).** 0016 handed this decision here:
   a `STORED` generated column (`CASE WHEN is_default THEN 1 END`) plus a UNIQUE index genuinely enforces the
   invariant on MySQL 8.4, since unique indexes ignore `NULL`s. The transaction plus row lock is correct on
   its own, and adopting the constraint here means adding a migration to a story scoped as "no new migration"
   plus a `23000`-to-`ValidationException` translation. This story's clear-before-set ordering is already
   what that constraint requires, so the follow-up adds a constraint rather than a rewrite.

**Larastan level 7 notes**

- `'decimal:3'` casts to a **string**: `@property string|null $rate`, and never compare it with `==` / `<` /
  `>` against a numeric literal — use `(float)` on both sides or `bccomp()`. Typing it `float` is the single
  likeliest static-analysis failure in this story.
- Actions declare explicit `__invoke(...): SalesRegion` return types and are injected as **trailing,
  container-resolved parameters** on the Livewire **component's** methods
  ([code-style.md](../../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method)) — not via
  the constructor, and not resolved with `app()` inside a component method body. **Corrected during Phase 2
  review (finding F-3)**: an *action's own* dependency on another class (`LogRefusedPrivilegedAttempt` in
  all three actions; `SetDefaultSalesRegion` in `SetSalesRegionActive`) is **constructor**-injected instead,
  because `__invoke()`'s parameter list is a public contract every caller matches verbatim — the documented
  exception in
  [code-style.md](../../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract),
  the same shape `UpdateUser` uses for `EnsureRecentPasswordConfirmation`. There is no `app()` call anywhere
  in this story's design — do not reintroduce one.
- Array-shape PHPDoc on `$regions` and on `replacementCandidates()`, per
  [code-style.md](../../../docs/conventions/code-style.md#phpdoc-array-shapes-over-inline-comments).
- Validation-trait methods return `array<int, ValidationRule|array<mixed>|string>`, matching
  `UserValidationRules`.

## Technical tasks for later backlog

- **The at-most-one-default database backstop** (generated column + UNIQUE) — a small migration plus the
  `23000`-to-`ValidationException` translation. Confirmed as a follow-up story (D13); this story's
  clear-before-set transaction is already ordered to accept it.
- ~~Retrofit `#[Locked]` onto `App\Livewire\Users\Index::$users` (D9)~~ — **already done, by story 0015**
  (finding F4). Removed during Phase 1 reconciliation; this line stayed only because the document was
  drafted against a stale read of the Users screen.
- **`SalesRegionKind::label()` plus its `lang/{en,es}/sales-regions.php` keys** — still deferred, now to
  0018, which is the first story that actually renders `kind`.
- ~~Convene the two Three Amigos participants on this story before Phase 3~~ — **done 2026-08-25**, see
  [Phase 1 reconciliation](#phase-1-reconciliation-backend-expert--backend-qa-reviews-2026-08-25).
- **Docs to update at Phase 6:** [`architecture/authorization.md`](../../../docs/architecture/authorization.md)
  (the **third** gated route, after `users.index`/`roles.index`, and the third policy — plus recording
  Sales Regions as the first real consumer of the "third admin screen inherits" refusal-logging recipe
  0015b's docs already describe prospectively), [`api/routes.md`](../../../docs/api/routes.md) (a new route
  row and its contract notes), [`conventions/base-standards.md`](../../../docs/conventions/base-standards.md)
  (the `app/Actions/SalesRegions/` subfolder, and `routes/sales-regions.php` in the one-file-per-area
  listing), and
  [`conventions/naming.md`](../../../docs/conventions/naming.md) (a second live example of the `Index`-in-a-
  subfolder view-resolution exception).

## Provenance

**Read this before treating any decision above as debated.** `backend-expert` and `backend-qa` were both
convened for this story's Phase 1 debate, but **neither had returned its contribution when this document was
composed**. Everything above is therefore the work of `product-owner` alone, derived from:

- [story 0016](../done/0016-sales-region-catalog-schema-and-seeder.md) read in full (the data contract),
- [PRD §2.1](../../../docs/PRD/PRD.md#21-sales-regions--taxes),
- the real shipped code this story mirrors — `app/Livewire/Users/Index.php`, `app/Policies/UserPolicy.php`,
  `app/Concerns/UserValidationRules.php`, `app/Actions/Users/UpdateUser.php`, `routes/web.php`,
- the `docs/` set (architecture, conventions, security, testing, contracts, errors-log),
- [story 0004](../done/0004-users-list-editor-backend.md) as the structural precedent,
- and direct reads of this repo's **installed vendor source** for the four load-bearing framework claims
  (`ValidatesAttributes::validateDecimal()`, `Validator::$numericRules`,
  `SupportValidation::exception()`, `SupportValidation::dehydrate()`).

**What this means concretely.** The three Phase 1 contributions `docs/workflow.md` requires are not all
present: the *expert's* file list and technical approach and the *QA's* test-case list here were written by
`product-owner` rather than by the specialists who own those roles. That is a **process gap, not a content
gap** — the document is complete against the template — but it removes the independent second opinion Phase 1
exists to produce, and it is exactly the kind of single-source reasoning that produced the
`getOriginal()`-instead-of-`getPrevious()` mistake recorded in [errors-log.md](../../../docs/errors-log.md).

**Required before Phase 3.** (The seven originally-open questions are no longer among them — all seven
were confirmed by the product owner and are recorded as D5, D6, D7 and D10–D13 in
[Locked decisions](#locked-decisions-confirmed-at-phase-1).)

1. ~~Re-convene `backend-expert` and `backend-qa` on this document and reconcile their contributions into
   it, rather than accepting it as debated.~~ **Done 2026-08-25** — see
   [Phase 1 reconciliation](#phase-1-reconciliation-backend-expert--backend-qa-reviews-2026-08-25) below.
   Both specialists independently converged on the same core gap (no action self-authorizes), which is
   strong signal it is real rather than a false positive from either review alone.
2. Have `code-reviewer` treat Phase 2 as a **first specialist review** — the product owner's confirmation
   settled the seven product questions, not the engineering ones. D1–D3 and D5's non-product half are now
   specialist-verified (see reconciliation below); D9 needed correction, not just review, because its
   premise was stale.

## Phase 1 reconciliation (backend-expert / backend-qa reviews, 2026-08-25)

Both specialists reviewed this document against the real repo state rather than trusting its claims, per
this project's own standing practice. Findings and how each was folded in:

**Convergent blocking finding — no action authorizes itself.** Both reviews independently flagged that
`UpdateSalesRegion`, `SetDefaultSalesRegion` and `SetSalesRegionActive` as originally drafted contained
zero `Gate::authorize()` calls, with `sales-regions.edit` checked only inside the *component*. This is the
exact gap story **0008a** closed for `CreateUser`/`UpdateUser` (see
[base-standards.md](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)) —
a future Artisan command, queued job or second component calling these actions directly would bypass the
permission entirely. **Fixed**: all three actions now authorize themselves as their first statement (see
the rewritten action code blocks under "Files to create/modify" below).

**Blocking — the plan predates story 0015b's closure and doesn't use its now-established pattern.** Story
[0015b](../done/0015b-log-refused-privileged-attempts.md) closed *after* this document was drafted and
established `App\Actions\Auth\LogRefusedPrivilegedAttempt` as the copyable refusal-logging pattern every
later admin screen inherits — [architecture/authorization.md](../../../docs/architecture/authorization.md) has a
section titled "Copyable: what a third admin screen inherits" with a five-step recipe. Sales Regions is
that third screen. **Fixed**: every `Gate::authorize()` and non-`Gate` refusal in the three actions now
routes through `LogRefusedPrivilegedAttempt`, mirroring `UpdateUser`/`EnforceGrantorPermissionScope`
exactly (see the rewritten action code blocks below).

**Blocking — `routes/web.php` should not be modified.** `base-standards.md` states a new area's routes go
in a new `routes/<area>.php`, `require`d from `web.php` — task **0040** exists specifically because
`users.index` broke this rule once. **Fixed**: this document now specifies `routes/sales-regions.php`
(create) mirroring `routes/roles.php`'s shape, with `web.php` only gaining one `require` line.

**Correction, not addition — `SetSalesRegionActive`'s injection of `SetDefaultSalesRegion`.** The original
text called `app(SetDefaultSalesRegion::class)` "the one sanctioned exception" to per-method injection,
misreading `code-style.md`: the actual exception is **constructor injection** for one action depending on
another (`UpdateUser` constructor-injects `EnsureRecentPasswordConfirmation` and
`LogRefusedPrivilegedAttempt`); `app()` is reserved for a zero-parameter `#[Computed]` method. **Fixed**:
`SetSalesRegionActive` now constructor-injects `SetDefaultSalesRegion` (and `LogRefusedPrivilegedAttempt`).

**Correction — D9's premise was stale.** D9 as drafted claimed `$regions` being `#[Locked]` "diverges from
`Users\Index::$users`, which is unlocked." That was true when 0016 was written but **story 0015** (finding
F4) locked `$users` before this document was drafted — `backend-expert` verified this by reading
`app/Livewire/Users/Index.php` directly. `$regions` being `#[Locked]` is still correct, but it now
*follows* the fixed rule rather than diverging from it. **Fixed**: D9's text below is corrected, and the
stale "Technical tasks for later backlog" item asking to retrofit `#[Locked]` onto `Users\Index::$users`
is removed (already done, by 0015).

**QA gaps, folded into "Tests to perform" below**: two Gherkin scenarios had no mapped test ("clearing a
rate returns it to unconfigured", "enabling an inactive entry"); the zero-rate assertion needed tightening
to check the *persisted* value rather than only that validation didn't throw; revert-check 3's stated
symptom was backwards for `SetSalesRegionActive`'s nested-transaction structure (verified against
Laravel's real `Connection::transaction()` savepoint behaviour — stripping the *outer* transaction lets
the inner `SetDefaultSalesRegion` call commit independently, so the *promotion* sticks and the *old row
stays active*, not the reverse as originally written); a 5th revert-check was needed to actually prove the
D5 "dropping `decimal` silently converts `min`/`max` to string-length rules" claim (revert-check 4 alone
doesn't — `numeric` is *also* in `Validator::$numericRules`, so it doesn't trigger the trap; only removing
*every* numeric-family rule does); D10 and D12 — flagged by this file's own DoD as "most likely to be
dropped as unnecessary" — had no revert-check despite that risk; and the D10 action-level proof
("`setDefault()` on an inactive entry is refused... at the action level too") had no assigned test-file
home. All resolved below.

**Non-blocking, recorded for Phase 3/Phase 2 awareness, not changing the document further**:
`SetDefaultSalesRegion`'s self-healing claim only holds if at least one row currently carries
`is_default = true` — a zero-default anomaly takes no lock and isn't self-healing; not worth a redesign,
just don't oversell the claim during implementation. `SetSalesRegionActive` reads
`$replacementDefault->is_active` off whatever instance the component passed in rather than a freshly
locked read — a narrow TOCTOU window; `code-reviewer` should confirm at Phase 2/5 whether a `refresh()` or
lock on the replacement row is warranted. `save()` invokes `UpdateSalesRegion` and `SetSalesRegionActive`
as two separate action calls (two separate transactions) from one modal submit, so a mid-submit failure
between them can leave the rate/code/description half persisted while the active/default half is refused
— this was implicit in the original draft; it is an acceptable, Users-screen-consistent shape (the same
two-call pattern `Users\Index::save()` already uses for `UpdateUser` + email-change), not a defect, but
Phase 3 should keep it as a deliberate choice rather than an oversight.

## Phase 2 reconciliation (`code-reviewer`, 2026-08-25)

`code-reviewer` ran Phase 2 (INVEST + this file's own "first specialist review" requirement) against the
Phase 1 reconciliation above and returned **FAIL**, three blocking, five non-blocking — all found by
verifying claims against the real repo rather than trusting the document. Every finding is now applied
directly to the sections above; this is the change log, not a second copy of the reasoning.

**Blocking, fixed:**
- **F-1 — the component was never actually converted to `LogRefusedPrivilegedAttempt`**, contradicting
  this file's own new acceptance criteria and making the refusal-logging tests unsatisfiable as specified.
  Fixed in "Component public surface": `openEditModal()`, `save()`, `setDefault()`, `setActive()` all
  inject and call it now; `mount()` stays plain and unlogged, matching `Users\Index::mount()`'s documented
  exception. `setActive()`'s `$replacementDefaultId` lost its `= ''` default (a defaulted parameter can't
  precede the trailing container-resolved `$log`).
- **F-2 — four relative links used `../docs/…` instead of `../../docs/…`** (the reconciliation edits'
  own mistake, at this file's actual two-levels-deep location) — fixed.
- **F-3 — a stale Larastan note still described `SetSalesRegionActive` resolving `SetDefaultSalesRegion`
  via `app()`**, directly contradicting the Phase 1 fix to constructor injection two sections above it —
  corrected to state the real rule (constructor injection for an action's own dependency on another
  action, per `code-style.md`'s documented exception).

**Non-blocking, fixed:**
- **F-4 — test-file allocation was internally inconsistent** (one file's table description didn't match
  its own test list, and refusal-logging tests had no named home). Fixed: each action's direct-call
  authorization test lives in its own file (`SetSalesRegionActiveTest.php`,
  `SetDefaultSalesRegionTest.php`), a new `RefusalLoggingTest.php` holds the cross-screen/cross-layer
  equivalence assertions plus `UpdateSalesRegion`'s direct-call test (it has no other dedicated file).
- **F-5 — the copyable recipe's success-logging half (step 5) was entirely unspecified.** Fixed: `save()`
  /`setDefault()`/`setActive()` each log `Log::info('Sales region updated', [...])` once on success,
  component-level (mirroring `Roles\Index`, not inside the action), plus a must-not-over-log test.
- **F-6 — one test-table cell still said "the action's own `Gate::authorize()`"** after the Phase 1 fix
  renamed the mechanism — corrected to `LogRefusedPrivilegedAttempt::authorize()`.
- **F-7 — the `routes/sales-regions.php` snippet didn't alias its `Index` import**, unlike the real
  `routes/roles.php` it claimed to mirror "exactly" — fixed.
- **F-8 — a mechanism misattribution**: the `nullable`/`''` callout credited `Validator::validateNullable()`
  with skipping subsequent rules; that method is actually a no-op, and `presentOrRuleIsImplicit()` is what
  does the skipping. Corrected, with the added consequence that `nullable` is load-bearing only for
  `rateRules()` used in isolation, not for the component path (`$rate` being a non-nullable `string`
  property already causes the skip regardless).

**INVEST verdict**: Small "at the ceiling, but pass" — `code-reviewer`'s own words. The two flagged
carve-outs if Phase 3 overruns (the seeder cross-check test, the cross-screen logging equivalence test)
are recorded here rather than acted on now, since neither is blocking.

**Two items deliberately left for later phases, not resolved now:**
1. `setActive()`'s exact parameter order is fixed (default dropped), but 0018's Blade markup consuming it
   is that story's problem, not this one's — flagged so it isn't rediscovered as a surprise.
2. The `$replacementDefault->is_active` TOCTOU note (first raised in the Phase 1 reconciliation's
   non-blocking list) is explicitly routed to **Phase 4** (`appsec-auditor`) rather than resolved here —
   `code-reviewer` traced the planned code and confirmed the window is real as specified, but judged it
   needs the actual implementation, not the plan, to fix correctly.

**Required before Phase 3, updated status**: both items are now done — reconvening the specialists (Phase
1 reconciliation) and treating Phase 2 as a first specialist review (this section). **Phase 3 may start.**

## Phase 3 reconciliation (2026-08-25)

Phase 3 was implemented in a prior session that ended in an uncontrolled machine shutdown before it could
commit or record its own completion — this section reconstructs and verifies that work rather than
re-implementing it. Every file listed under [Files to create/modify](#files-to-createmodify) and every test
file in the [Tests to perform](#tests-to-perform) table existed on disk, unmodified since the shutdown, and
was read in full against this document before anything below was trusted.

**Environment note, not a code finding.** The interrupted shutdown left `storage/logs/laravel-2026-08-25.log`
(and the auto-scaffolded, unused `resources/views/livewire/sales-regions/index.blade.php` stub the
`Index`-in-a-subfolder warning above already anticipates) owned by `root` inside the Sail container, which
made ~64 of 110 story-scoped tests fail on `Permission denied` writing the log — nothing to do with this
story's code. Fixed with `chown sail:sail` on `storage/` and `bootstrap/cache/`; the stray stub directory was
gone on re-check (removed by the sibling session working Epic 3 Phase 0 in parallel, per its own docs-link
fixes to 0018/0026/0037 the same day). Recorded here only so a future reader doesn't mistake this for a code
regression if it recurs after another interrupted shutdown.

**Code read in full, verified against the spec above, two undocumented improvements found (both correct,
neither a deviation from a locked decision):**
1. All three actions' final write is `tap($model->fill(...))->save()` / `tap($model->forceFill(...))->save()`
   — the fill/forceFill call wraps the *tapped* subject rather than being a separate chained call on the
   `tap()` result, with a docblock at each site explaining why: `HigherOrderTapProxy::__call()` only returns
   the raw subject after the **first** proxied call, so `tap($region)->fill([...])->save()` would return
   `save()`'s own `bool`, not `$region`. This repo's other `tap()` writers (`UpdateUser` etc.) don't hit this
   because they proxy exactly one call; these three's original spec snippets (`tap($region)->fill([...])->save()`)
   would have shipped a bug. Not a finding to fix — already fixed in the code as written.
2. `SetDefaultSalesRegion`'s clear-old-default query carries `whereKeyNot($newDefault->getKey())`, absent
   from the spec snippet, with a docblock recording it was "verified by execution to be required, not merely
   defensive": re-setting the *already*-default entry would otherwise fetch and clear that same row through a
   second, freshly-loaded model instance, then the final `forceFill(['is_default' => true])` on the
   caller's stale `$newDefault` instance would see no dirty attribute (its in-memory `original` never
   re-synced) and skip writing it back — silently clearing the one true default. Confirmed by temporarily
   removing `whereKeyNot(...)` and running the idempotent-default test (`re-setting the already-default
   entry through the component changes nothing and raises no error`); it went red exactly as the docblock
   describes, then was restored.

**The seven mandatory revert-checks were performed for real** (temporary edit → targeted `sail artisan test`
run → confirmed red → reverted), not merely asserted to exist, per the Definition of Done's own instruction
not to skip this:

| # | Break applied | Test(s) that reddened | Matches documented symptom? |
| --- | --- | --- | --- |
| 1 | Commented out the clear-old-default query in `SetDefaultSalesRegion` | `setDefault clears the previous default…` (both halves — `count()` and identity) | Yes — count assertion failed `2 !== 1` |
| 2 | Disabled the `! $active && $region->is_default` guard in `SetSalesRegionActive` | `disabling the current default with no replacement is refused…` | Yes — no validation error raised |
| 3 | Removed `SetSalesRegionActive`'s outer `DB::transaction()` | `a forced failure on the deactivation write rolls back the just-completed promotion too` | Yes — matches the corrected (Phase 1) symptom exactly: the replacement's promotion persisted (`is_default` stayed `true`) instead of rolling back |
| 4 | `rateRules()`: `decimal:0,3` → `numeric` | `an invalid rate is rejected…` dataset, scientific-notation and over-precision rows only | Yes — the other three dataset rows (negative, non-numeric, over-max) stayed correctly rejected |
| 5 | `rateRules()`: dropped every numeric-family rule (`nullable, min:0, max:100` only) | Same dataset, negative-integer row, failing **for the D5-predicted wrong reason** (accepted, not rejected) | Yes |
| 6 | Disabled the `! $newDefault->is_active` guard in `SetDefaultSalesRegion` | Both the component-level and the direct action-level "inactive entry … is refused" tests | Yes — both layers proven independently, per D10 |
| 7 | Removed the component's `str_replace(',', '.', $this->rate)` normalisation | `a rate typed with a decimal comma is accepted through the component…` | Yes — failed with the real `decimal:0,3` validation message |

Full suite re-confirmed green after every revert was undone: `sail artisan test` (unscoped) — **860/860
passed, 2403 assertions**; `vendor/bin/pint --test --format agent` (unscoped, not `--dirty`) — **passed**, no
formatting drift on any file this story touches.

**Not yet done, carried into the next phases as-is:**
- The `$replacementDefault->is_active` TOCTOU note Phase 2 explicitly deferred to Phase 4 is still open —
  `appsec-auditor` inherits it against the real implementation now that one exists.
- Phase 4 (`appsec-auditor`), Phase 5 (`code-reviewer`), Phase 6 (`docs-keeper`), Phase 7 (closure) have not
  run. Nothing in this story has been committed to git yet — that happens immediately after this section is
  written, as the Phase 3 commit boundary.

## Phase 4 audit and fix (`appsec-auditor`, 2026-08-25)

**Verdict: FAIL.** Two Medium findings, both in the three action classes, both confirmed by execution
against the real implementation (not by reading), both fixed the same day. Full detail — including the three
exploit sequences traced by execution, the exact `tinker` reproductions, and why `lockForUpdate()` alone
cannot close either — lives in [`docs/security/model-instance-trust.md`](../../../docs/security/model-instance-trust.md)
(this story's Phase 4 audit is what created that page); this section is the task-file-level summary.

- **F-1 — TOCTOU on the deferred `$replacementDefault->is_active` item, widened.** The Phase 2 note asked
  about the replacement row specifically; the audit found the same defect on **both** guarded reads —
  `SetDefaultSalesRegion`'s `$newDefault->is_active` (D10) and `SetSalesRegionActive`'s `$region->is_default`
  — because both actions read the guard's subject off a caller-hydrated instance rather than re-reading it
  under lock inside their own transaction. The sharpest confirmed exploit needs no forged input at all: two
  administrators acting within the same second — one promoting a region to default while the other, in
  parallel, deactivates that same region with no replacement named — leaves the catalog's only default
  inactive, with the D3 refusal never firing for either request.
- **F-2 — mass assignment via `save()`'s whole dirty set, not the `fill()`/`forceFill()` array.** All three
  actions' final write ran against the caller-supplied instance, so `save()` persisted whatever else the
  caller had left dirty on it — confirmed to let a caller-dirtied `slug`/`name`/`sort_order` survive
  `UpdateSalesRegion` despite `#[Fillable]`, and a caller-forged `is_default` reach the database through
  `SetSalesRegionActive` with **`SetDefaultSalesRegion` never running at all** — two defaults, reached without
  touching the one class whose entire purpose is preventing that.
- **F-3 — Low, accepted as a known residual, no fix.** `save()`'s lost-update risk on `is_active` while an
  edit modal is open (another admin's toggle is silently reverted on submit) matches the Users screen's
  existing, undocumented-as-a-decision shape. Recorded here rather than fixed, per the audit's own
  recommendation, so it is a decision rather than an oversight the next reviewer has to re-discover.

**The fix — one root cause, one remedy, applied to all three actions**: re-fetch the row(s) the action owns
inside its own transaction/call, and read and write **only** through that fresh instance — never the
caller-supplied one, after the re-fetch.

- `UpdateSalesRegion` needs no lock (no cross-row invariant): `SalesRegion::query()->whereKey(...)->firstOrFail()`
  before `fill()`.
- `SetDefaultSalesRegion` and `SetSalesRegionActive` need the re-fetch **and** `lockForUpdate()`, since they
  also carry the TOCTOU fix — one query does both jobs. `SetSalesRegionActive` locks its own target and (when
  named) the replacement together in **one** `whereIn([...])->orderBy('id')->lockForUpdate()` query, so two
  concurrent calls naming each other's target as their own replacement always lock in the same order —
  closing the deadlock surface the audit flagged as a consequence of introducing per-row locking. Both
  actions' `DB::transaction()` calls additionally carry `attempts: 3` (Laravel's built-in deadlock retry) as
  a second, independent layer, since the unindexed `is_default` scan makes lock contention the normal case
  rather than the rare one.
- `whereKeyNot()` in `SetDefaultSalesRegion`'s clear-query is **kept** (still required — a separate query
  hydrates a separate instance even for $target's own row) with its docblock corrected rather than left
  describing a scenario the fix changed.

**Verification, not merely applied and trusted:**
- Eight regression tests added (four per finding, split across `SetDefaultSalesRegionTest.php`,
  `SetSalesRegionActiveTest.php` and `RefusalLoggingTest.php` per the existing one-file-per-action
  convention), each mutating the row (or the in-memory instance) **between** hydration and the action call —
  the only shape that can actually exercise either bug, per the security page's own "Regression test shape"
  note.
- All eight were confirmed to **redden against the pre-fix code** (`git stash` on the three action files,
  re-run, confirm red, `git stash pop`) before being trusted as real regression coverage — not merely
  asserted to exist.
- Full suite re-run unscoped after the fix was restored: **868/868 passed, 2431 assertions** (860/2403 →
  868/2431, the eight new tests). `vendor/bin/pint --test --format agent` (unscoped): **passed**.
- `docs/security/model-instance-trust.md` and its `docs/security/README.md` index entry updated from
  **open** to **closed** the same day, per this repo's own rule against a security page outliving its fix.

### Phase 4 re-audit round 2 (`appsec-auditor`, 2026-08-26)

Per this repo's own rule — [a security fix must be re-audited as new code, not merely confirmed to close the
original finding](../../../docs/errors-log.md#two-of-the-three-security-audit-rounds-found-the-flaw-in-the-previous-rounds-fix--2026-08-19) —
the F-1/F-2 fix above was re-audited the next day. **Verdict: PASS**, four Low findings, none reopening F-1
or F-2. Full detail (including the two-live-MySQL-session deadlock reproduction) is in
[`docs/security/model-instance-trust.md`](../../../docs/security/model-instance-trust.md#re-audit-round-2-what-the-fix-itself-got-subtly-wrong).

- **R-1 — fixed.** The round-1 fix's lock-ordering docblocks justified themselves against a scenario that
  cannot occur (two calls naming each other's target as replacement — both would need `is_default = true`
  simultaneously, the state the story forbids), while round 1 had actually **introduced** a real, confirmed
  deadlock elsewhere: `SetDefaultSalesRegion` acquiring its target lock and its clear-scan lock as two
  *separate* queries, reachable by two administrators promoting two *different* regions concurrently.
  Collapsed to one `orderBy('id')->lockForUpdate()` query covering both row sets — real resource-ordering
  rather than an asserted one. Both actions' docblocks and the security page corrected in place.
- **R-2 — fixed.** `SetSalesRegionActive`'s promotion branch could return an instance still claiming
  `is_default = true` for a row the nested `SetDefaultSalesRegion` call had already persisted as `false`
  (through a separate, independently re-fetched instance) — the persisted state was always correct, only the
  **return value** lied. Fixed with `->refresh()` before returning; a new regression test asserts the return
  value directly and was confirmed to redden without that call.
- **R-3 — recorded, not fixed (there is no rule to fix yet).** Every action still authorizes against the
  caller-supplied instance, before the re-fetch — inert today only because `SalesRegionPolicy::update()`
  ignores its target entirely. Recorded on that policy method's own docblock: the day a target-dependent rule
  is added there, it must be evaluated against a re-fetched row, or the exact class of bug this fix closed
  reopens one layer up, outside the transaction's lock.
- **R-4 — partially fixed, partially declined by an already-made decision.** The re-audit flagged two things
  under one finding: `Index::save()` authorizing the replacement row *after* already writing the target
  (fixed — the lookup and `authorize()` call now run before either action executes), and the two-action-call
  shape not being atomic (**not** applied — this exact shape, "a mid-submit failure can leave the
  rate/code/description half persisted while the active/default half is refused", was already reviewed and
  explicitly accepted as deliberate and Users-screen-consistent in the [Phase 1 reconciliation](#phase-1-reconciliation-backend-expert--backend-qa-reviews-2026-08-25)
  above, and re-confirmed accepted by the first Phase 4 audit's own "Confirmed clean" list. Wrapping both
  calls in one transaction would have silently reversed an already-made, already-audited decision, so it was
  not done — per this repo's own rule that a deferred/re-raised instruction contradicting an existing decision
  is withdrawn in writing, not acted on).
- **R-5 — test hygiene, applied.** Two `ValidationException::class`-only assertions widened to the specific
  message (they could not distinguish the D3 refusal from the nested D10 one, both on the same key); two
  `->not->toBe(999)` assertions tightened to `->toBe($original...)`; one trivially-true `parent_id`
  assertion (comparing `null` to `null` without ever dirtying it) given a real, FK-valid value to dirty first.

**Verification:** every changed/added assertion confirmed to redden against the pre-fix code before being
trusted (the same `git stash` / temporary-removal discipline as round 1). Full suite re-run unscoped:
**869/869 passed, 2434 assertions**. `vendor/bin/pint --test --format agent` (unscoped): **passed**.
`docs/security/model-instance-trust.md` gained a third section, "Re-audit round 2", and both original
sections' code examples were updated in place to the round-2 shape rather than left describing what round 2
found wrong.
