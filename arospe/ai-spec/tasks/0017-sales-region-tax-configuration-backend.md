# [0017] Configure a seeded Sales Region entry: rate/description/code, the enable-disable toggle, and the single-default invariant

## Description
Make the seeded Sales Region catalog **configurable**. A tax administrator sets an entry's `rate`,
`description` and `code`; enables or disables an entry; and moves the "default" flag between entries —
under one invariant the catalog must never violate: **exactly one entry is the default at all times**.
Setting a new default clears the previous one, and the current default cannot be disabled unless a
replacement is named in the same atomic operation. Rate input is validated (negative and non-numeric
values are refused). This story owns the Livewire component class, its policy, its validation trait and
its three single-writer actions — **no new migration**: it builds directly on the `sales_regions` table
[story 0016](done/0016-sales-region-catalog-schema-and-seeder.md) creates.

## Type
backend (related_task_id: **0018** — the paired Sales Regions UI story, not yet debated) | includes database-expert: **no**

**The component class ships here, the Blade view ships in 0018** — the same split
[story 0004](done/0004-users-list-editor-backend.md) ↔ [story 0006](done/0006-users-list-editor-ui.md)
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
- **`$regions` is `#[Locked]`**, deliberately diverging from the unlocked `Users\Index::$users` precedent (D9).
- **An inactive entry may be neither the default nor a replacement default** — both are refused (D10).
- **The route is `/taxes/sales-regions`, named `sales-regions.index`** (D11).
- **A Spanish-locale comma (`21,5`) is accepted**, normalised in the component before `validate()` (D12).
- **The at-most-one-default database backstop is a follow-up story**, not built here (D13).

**Out of scope — owned by sibling stories.** Do not implement these here:

- The table, model, enum, ISO fixture, factory and seeder → **[story 0016](done/0016-sales-region-catalog-schema-and-seeder.md)**. This story adds **no migration** and changes no seeder.
- The Blade/Flux markup, the parent-header rendering of the "España" row, the row-action layout and the "no way to add a country" affordance → **story 0018**.
- Tax-rate **resolution** for a product/order, and what `rate IS NULL` means at resolution time → **story 0026**. PRD §2.1's *"The default rate applies when no region matches"* scenario is **0026's**, not this story's, even though it sits in the same PRD block.
- Creating or deleting region entries. The catalog is fixed and seeded; there is no create path and no delete path, by design.
- The `sales-regions.{view,create,edit,delete}` permissions **already exist** from [story 0002](done/0002-seed-roles-permissions-catalog.md). Do **not** re-seed them and do **not** invent a new permission string.

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
> [authorization.md](../../docs/architecture/authorization.md#gating-a-livewire-route-use-can-never-permission)
> and [security/livewire-authorization.md](../../docs/security/livewire-authorization.md).

### `app/Livewire/SalesRegions/Index.php` — **create**

Class-based component (never single-file), per
[base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file).

> 📌 **View-path trap — `Index` in a subfolder resolves one level shallower.** `App\Livewire\SalesRegions\Index`
> resolves to **`resources/views/livewire/sales-regions.blade.php`**, *not* `livewire/sales-regions/index.blade.php`
> — Livewire's `Finder::generateNameFromClass()` strips the trailing `.index`. This is the documented
> [exception in naming.md](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name),
> and it is exactly the file 0018 must create. A file at the nested path would be a silently unused duplicate.

### `app/Concerns/SalesRegionValidationRules.php` — **create**

Flat, single-concern trait, composed at the consumer — no trait in `app/Concerns/` `use`s another, and
nesting breaks Larastan 7. Follows the `<Noun>ValidationRules` / `<noun>Rules()` convention
([naming.md](../../docs/conventions/naming.md#traits-and-their-methods)):

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
> ([livewire-authorization.md](../../docs/security/livewire-authorization.md#authorization-that-lives-only-in-the-component-is-bypassed-by-every-other-call-site-of-the-action)).
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

> ⚠️ **`nullable` does not rewrite `''` to `null`.** `Validator::validateNullable()` only *skips subsequent
> rules* for a blank value; `$validated['rate']` comes back as the empty string it went in as. The
> component must convert explicitly (`$rate = $validated['rate'] === '' ? null : $validated['rate'];`)
> before calling the action. Do not rely on undocumented coercion.

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
  [authorization.md](../../docs/architecture/authorization.md#policies).
- **Two abilities only.** `sales-regions.create` / `sales-regions.delete` are seeded but have no affordance
  in this story or 0018 (D8). Defining policy methods for abilities nothing calls is untested surface.
- **No target-dependent branch**, unlike `UserPolicy::update()`'s Super Admin exclusion — there is no
  untouchable row in this domain today. It stays an instance method anyway, so the per-row
  `Gate::allows()` UI hint reuses the identical method a future target-dependent rule would need.

### `app/Actions/SalesRegions/UpdateSalesRegion.php` — **create**

Invokable, imperative verb-phrase name (no `Action`/`Service` suffix). The sole writer of the plain
`#[Fillable]` triple:

```php
public function __invoke(SalesRegion $region, ?string $code, ?string $description, ?string $rate): SalesRegion
{
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

**The single named writer of `is_default`, anywhere in the app.**

```php
public function __invoke(SalesRegion $newDefault): SalesRegion
{
    return DB::transaction(function () use ($newDefault): SalesRegion {
        // D10 — an inactive entry may never hold the default flag. Enforced HERE, not only
        // in the form rule, so every call site inherits it.
        if (! $newDefault->is_active) {
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
default flag is expressed:

```php
public function __invoke(SalesRegion $region, bool $active, ?SalesRegion $replacementDefault = null): SalesRegion
{
    return DB::transaction(function () use ($region, $active, $replacementDefault): SalesRegion {
        if (! $active && $region->is_default) {
            if ($replacementDefault === null || $replacementDefault->is($region)) {
                throw ValidationException::withMessages([
                    'replacementDefaultId' => __('sales-regions.errors.default_deactivation_requires_replacement'),
                ]);
            }

            app(SetDefaultSalesRegion::class)($replacementDefault);
        }

        return tap($region)->forceFill(['is_active' => $active])->save();
    });
}
```

- **One transaction, so "simultaneously" is literal.** There is never an observable instant with zero
  defaults — not between two user requests, and not between two statements of one request. A mid-operation
  failure rolls back both writes (D3).
- **`$replacementDefault->is($region)` is refused too** — naming the row being deactivated as its own
  replacement would satisfy a naïve null-check while producing an inactive default.
- **`ValidationException`, not a bare exception** (D4). Verified in the installed source:
  `Livewire\Features\SupportValidation\SupportValidation` catches `ValidationException` thrown from **any**
  component method, not only from `$this->validate()` — so the message reaches the form's error bag with no
  extra plumbing, and 0018 needs no special handling.
- **`app(SetDefaultSalesRegion::class)` is the one sanctioned exception** to this repo's
  per-method-injection convention: that convention governs *component methods*, and this is an action
  calling another action.

### `routes/web.php` — **modify**

One route inside the existing `['auth', 'verified']` group, mirroring `users.index` exactly, **including
its inline warning comment**:

```php
Route::livewire('taxes/sales-regions', SalesRegionsIndex::class)
    ->middleware(['can:sales-regions.view'])
    ->name('sales-regions.index');
```

> 📌 **The URI and route name are confirmed** (D11). `/taxes/sales-regions` satisfies PRD §2.1's *"lives as a
> section **inside the Taxes area** (not a top-level sidebar item)"* without requiring a parent Taxes screen
> to exist yet, and `sales-regions.index` keeps the route name aligned with the `sales-regions.*` permission
> module slug. 0018 links to `route('sales-regions.index')`; do not rename either half.

### `lang/en/sales-regions.php`, `lang/es/sales-regions.php` — **create**

Both files, in the same change, **key-for-key identical** — the hard rule in
[naming.md](../../docs/conventions/naming.md#translation-keys). This story creates them for the
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

    public function mount(): void;                                     // Gate::authorize('viewAny', SalesRegion::class)
    public function openEditModal(string $regionId): void;             // gated — it discloses, not only mutates
    public function save(UpdateSalesRegion $u, SetSalesRegionActive $a): void;
    public function setDefault(string $regionId, SetDefaultSalesRegion $s): void;
    public function setActive(string $regionId, bool $active, string $replacementDefaultId = ''): void;
    public function closeModal(): void;
}
```

Six properties of this surface are load-bearing:

- **No `wire:model`-bound property is ever `null`.** `$code`, `$description` and `$rate` are plain `string`,
  `$active` is a plain `bool`, `$replacementDefaultId` is a plain `string` whose `''` matches a placeholder
  `<option value="">` exactly. This is the direct application of
  [errors-log.md](../../docs/errors-log.md)'s `null`-property/native-`<select>` entry: Livewire assigns the
  dehydrated value straight onto the element's `.value`, and a JS `null` stringifies to `"null"`, matching no
  option and silently swallowing the user's own pick. The rule is applied **uniformly**, including to the
  text inputs, rather than reasoned case-by-case about which controls are exempt.
- **`$regions` is `#[Locked]`** — D9. `security/livewire-authorization.md`'s rule is "every server-derived
  property is `#[Locked]`, not just the ids", and `Users\Index::$users` not being locked is an inconsistency
  with that rule rather than a precedent to copy forward.
- **`setActive()` and `save()` are two entry points to *one* rule.** Both delegate to
  `SetSalesRegionActive`, so 0018 may render an inline row switch, a modal field, or both, without the
  invariant existing in two places. The trigger's UI shape is 0018's call.
- **`setActive()` authorizes BOTH rows it writes.** `Gate::authorize('update', $target)` **and**
  `Gate::authorize('update', $replacement)` when a replacement is supplied — the same
  "cover every thing the operation actually achieves" principle
  [authorization-patterns.md](../../docs/security/authorization-patterns.md#an-ability-must-cover-every-attribute-that-achieves-its-effect-not-only-the-operation-it-is-named-after)
  established for attributes, applied here to a second *row*.
- **`canEdit` per row comes from `Gate::allows('update', $region)`** inside the private `loadRegions()` —
  never `Gate::authorize()`, which would throw while rendering a list. It is a **UI hint layered on top of**
  the mandatory per-method checks, never a replacement for them. There is no `canDelete`: no delete
  affordance exists.
- **`$editingRegionId` is `#[Locked]`** for the same reason `$editingUserId` is: it is the authorized
  identity, and an unlocked copy would let the client authorize one row and write another.

## Tests to perform

Scaffold artisan-first. Every test arranges with `SalesRegionFactory` — **never** by running
`SalesRegionSeeder` (249 rows per test), per 0016's explicit instruction. The one exception is any test
exercising a real `sales-regions.*` permission string, which must `$this->seed(RolePermissionSeeder::class)`
and flush the permission cache in `beforeEach()`, exactly as `UserPolicyTest.php` does — an unseeded
permission name throws `PermissionDoesNotExist`.

| Path | Suite | Scaffold | Holds |
| --- | --- | --- | --- |
| `tests/Feature/Policies/SalesRegionPolicyTest.php` | Feature | `php artisan make:test --pest Policies/SalesRegionPolicyTest` | `viewAny` / `update`, allow and deny, plus the Super Admin bypass with zero permission rows |
| `tests/Feature/SalesRegions/IndexTest.php` | Feature | `php artisan make:test --pest SalesRegions/IndexTest` | the route-level HTTP block, and `Livewire::test()` coverage of edit / rate validation / `setDefault` |
| `tests/Feature/SalesRegions/SetSalesRegionActiveTest.php` | Feature | `php artisan make:test --pest SalesRegions/SetSalesRegionActiveTest` | the deactivation guard and the atomic swap, including the forced-rollback proof — split out because its failure-mode assertions do not belong mixed into the edit happy path |

- [ ] **Integration (editing):** editing `rate` persists exactly that value **and** it round-trips as a
      **string** (`toBe('7.500')` *and* `toBeString()`) — pinning only the value lets a regression to `float`
      casting pass silently. `description` and `code` persist exactly; a `null` `description` clears a
      previously-set value.
- [ ] **Integration (editing, non-interference):** changing only `rate` leaves `code` and `description`
      untouched — the "did the update accidentally null a sibling column" regression.
- [ ] **Integration (structural columns):** a forged payload naming `slug`, `name`, `parent_id`, `kind` or
      `sort_order` changes none of them **through this story's real write path** (not merely through `fill()`
      in isolation, which 0016 already proves — a bug in the action could route around the guard with
      `forceFill()`).
- [ ] **Integration (no create path):** every edit / toggle / default-swap test asserts
      `SalesRegion::count()` is unchanged before and after. This is the **positive, falsifiable** form of
      "the catalog cannot grow" — see the deliberately-not-tested note below for why the bare negative form
      is refused.
- [ ] **Integration (single default — both halves):** after `setDefault`, assert
      `SalesRegion::where('is_default', true)->count()` is **1** *and* that the single row is the new one, as
      **two separate assertions**. A test asserting only the second half passes on an implementation that
      never clears the old flag.
- [ ] **Integration (the old default specifically):** re-fetch the previously-default row and assert
      `is_default === false` on that instance, and that its `is_active` was **not** touched.
- [ ] **Integration (idempotent default):** re-setting the already-default entry is a no-op — still exactly
      one default, same row, no error, no side effect on any other row.
- [ ] **Integration (the load-bearing refusal):** disabling the current default with **no** replacement is
      refused, **and** the row re-read from the database is still `is_active = true` and `is_default = true`.
      Asserting only the exception would pass on an implementation that persisted the change and merely
      *reported* failure.
- [ ] **Integration (negative control):** disabling a **non-default** active entry succeeds with no
      default-related side effect — proves the guard is keyed on "is this the default", not "disabling is
      privileged".
- [ ] **Integration (inactive cannot be the default, D10):** `setDefault()` on an inactive entry is refused
      and the existing default is untouched; naming an inactive entry as the **replacement** while disabling
      the current default is refused and *both* rows are untouched. Assert the refusal **at the action
      level too**, not only through the component — the form rule and the action guard are two separate
      mechanisms and a test that only exercises the component leaves the action's guard unproven.
- [ ] **Integration (the atomic swap):** disabling the default while naming a replacement leaves the old row
      `is_active = false, is_default = false` and the new row the only default — asserted in one test, on
      both rows.
- [ ] **Integration (atomicity under failure):** force the second half of the operation to throw and assert
      the **first** half was not persisted either. This is the only test that exists if and only if the
      operation is wrapped in `DB::transaction()`; without it, the forbidden zero-default state is reachable
      by a mid-request failure rather than a bad guard.
- [ ] **Integration (self-replacement):** naming the row being deactivated as its own replacement is refused.
- [ ] **Integration (malformed replacement):** a non-existent or malformed replacement id is refused cleanly
      — a validation failure, not a 500, and no partial write.
- [ ] **Negative (rate validation, Pest dataset):** `-1`, `-0.001`, `'abc'`, `'1e2'` (scientific notation),
      `21.0001` (over-precision) and `100.001` (over max) are each rejected **through the component**, and
      the entry's previous rate survives every one of them.
- [ ] **Positive (locale comma, D12):** `'21,5'` submitted **through the component** is accepted and stored
      as `21.500`. Its mirror belongs in the same file: `'21,5'` validated against `rateRules()` **in
      isolation** fails — which is precisely why the component's normalisation exists, and the pair is what
      stops someone "simplifying" the normalisation away on the grounds that the rule set handles it.
- [ ] **Positive (rate boundaries, outside the dataset — a different assertion shape):** `0` is **valid**
      (0016 is explicit that `0.000` is a real rate distinct from `NULL`; a rule treating `0` as empty is the
      regression this catches); the exact upper bound is accepted and one unit over it is rejected.
- [ ] **Authorization — HTTP layer** (`$this->get(route('sales-regions.index'))`): guest → redirect to
      sign-in; signed-in without `sales-regions.view` → 403; with it → 200; Super Admin holding zero
      permission rows → 200.
- [ ] **Authorization — `Livewire::test()` layer:** a user who holds `sales-regions.view` but **not**
      `sales-regions.edit` is refused on `save()`, `setDefault()`, `setActive()` and `openEditModal()`, and
      nothing is persisted.
      > **Both layers are mandatory and neither substitutes for the other**, and the story must say so: the
      > HTTP test only mounts and renders, so a missing `Gate::authorize()` inside `setDefault()` is invisible
      > to it; the `Livewire::test()` test never goes through routing, so a wrong permission string on the
      > `can:` middleware — or its omission — is invisible to *it*.
- [ ] **Integration (seeder cross-check, one test):** after this story's actions change `rate`, `code`,
      `description`, `is_active` **and** `is_default` on a row, re-running `SalesRegionSeeder` leaves all
      five untouched. This is the one place a change in *this* story could silently regress a guarantee
      **0016** made, because 0017 is the first code to exercise those "administrator-configurable" columns
      for real.

**Mandatory revert-checks** (run them, don't just assert the tests exist — the pattern 0016 established):

1. **Comment out the "clear the old default" statement** → the single-default test must go red on **both**
   halves. If only one half reddens, the test is under-asserting.
2. **Remove the "is this the current default" guard** from `SetSalesRegionActive` → the refusal test must go
   red, ending in the zero-default state the PRD forbids.
3. **Remove the `DB::transaction()` wrapper** and force the second half to throw → the atomicity test must go
   red, leaving the old default disabled with no replacement.
4. **Replace `decimal:0,3` with a bare `numeric`** → the scientific-notation and over-precision dataset rows
   must go red. This is the check that proves the dataset earns its place rather than restating what
   Laravel's default `numeric` would have caught anyway.

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
  [errors-log.md](../../docs/errors-log.md) warns about and 0016 already declined once (its
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

- [ ] A seeded entry's `rate`, `description` and `code` can each be changed and persist exactly, with `rate`
      round-tripping as a **string** through the `decimal:3` cast. *(PRD scenario: "Configure the tax rate on
      a seeded region entry"; PRD AC 2)*
- [ ] An entry can be enabled and disabled, and `is_active` is written by **exactly one** named place in the
      codebase. *(PRD AC 2)*
- [ ] Setting a new default clears the previous one, leaving **exactly one** default row. *(PRD scenario:
      "Marking a new default clears the previous one"; PRD AC 3)*
- [ ] Disabling the current default is **refused** unless a replacement is named, and the refusal leaves the
      catalog byte-for-byte unchanged. *(PRD scenario: "Disabling the current default region is blocked
      unless a new default is set"; PRD AC 4)*
- [ ] Disabling the default **with** a replacement is one atomic operation — a failure partway leaves neither
      write applied, so the catalog never holds zero defaults even transiently. *(PRD AC 4)*
- [ ] Negative and non-numeric rates are rejected with a validation message, and the previously stored rate
      survives the rejection. *(PRD Scenario Outline: "An invalid tax rate is rejected"; PRD AC 6)*
- [ ] `0` is accepted as a real rate and remains distinguishable from an unconfigured `NULL`, and a blank
      submission clears a configured rate back to `NULL`. *(D6)*
- [ ] A rate typed with a decimal comma (`21,5`) is accepted through the component and stored as `21.500`. *(D12)*
- [ ] An **inactive** entry can be neither marked as the default nor named as a replacement default, refused
      in the action and not only in the form rule. *(D10)*
- [ ] `slug`, `name`, `parent_id`, `kind` and `sort_order` cannot be changed from this screen, and no path
      creates or deletes a region entry. *(PRD scenario: "The catalog does not allow inventing new
      countries")*
- [ ] The route is gated with **`can:sales-regions.view`** (never `permission:`), and **every** mutating
      component method re-authorizes as its first statement — with `setActive()` authorizing both rows it
      writes.
- [ ] A user holding `sales-regions.view` but not `sales-regions.edit` can load the screen and mutate
      nothing; a Super Admin holding zero permission rows can do both.
- [ ] The full suite is green, including 0016's seeder tests — verified by the seeder cross-check test.

## Definition of Done
- [ ] Tests written and green (the full suite, not just this story's — per [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule)
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met
- [ ] All four [mandatory revert-checks](#tests-to-perform) performed, each confirmed to redden its named test
- [ ] The [locked decisions](#locked-decisions-confirmed-at-phase-1) implemented as recorded — in particular D10 (inactive entries excluded from both default paths) and D12 (the locale-comma normalisation), which are the two most likely to be dropped as "unnecessary"

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
  [security/livewire-authorization.md](../../docs/security/livewire-authorization.md#authorization-that-lives-only-in-the-component-is-bypassed-by-every-other-call-site-of-the-action)
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

**D9 — `$regions` is `#[Locked]`, diverging from `Users\Index::$users`.** The rule in
`security/livewire-authorization.md` is "every server-derived property is `#[Locked]`, not just the ids".
`Users\Index::$users` is unlocked, which is an inconsistency with that rule rather than a pattern to
propagate. Recorded openly here rather than copied silently forward; whether to retrofit the Users screen is
a separate follow-up, not this story's edit.

**D10–D13 — the four decisions confirmed at the close of Phase 1.** An inactive entry may be neither the
default nor a replacement default (**D10**); the route is `/taxes/sales-regions` named `sales-regions.index`
(**D11**); a Spanish-locale comma is accepted and normalised in the component (**D12**); and the
at-most-one-default database backstop is a follow-up story (**D13**). Each is recorded with its rejected
alternatives in [Locked decisions](#locked-decisions-confirmed-at-phase-1) rather than restated here.

> 📌 **Amendment — 2026-08-18: the "grouping" concept was removed project-wide.** The product owner dropped
> the supranational grouping entries (Unión Europea, Internacional) from the Sales Region catalog entirely;
> the catalog is now **individual countries plus Spain's five fiscal territories** only, and
> [story 0016](done/0016-sales-region-catalog-schema-and-seeder.md) owns that change at the schema/seeder level.
> Nothing in this story's *behaviour* changes — the single-default invariant, the deactivation coupling, the
> rate rules and the permission tier are all catalog-shape-independent — so this amendment touched **examples
> only**: the Gherkin scenarios that used "Unión Europea" or "Internacional" as a concrete entry now use
> "Canarias" and "Baleares", and the `grouping()` factory state was dropped from the list of 0016 states this
> story's tests arrange with. **D10 is unaffected**: "an inactive entry may be neither the default nor a
> replacement default" was never a grouping-specific rule and still holds exactly as written.

## Dependencies and risks

**Dependencies**

- **[Story 0016](done/0016-sales-region-catalog-schema-and-seeder.md) — hard, blocking.** It creates the table,
  model, enum and factory this story writes against. **0017 cannot start Phase 3 until 0016 is done.**
- **[Story 0002](done/0002-seed-roles-permissions-catalog.md)** — for the `sales-regions.*` permission
  strings, which already exist. No code dependency.
- **[Story 0004](done/0004-users-list-editor-backend.md)** — the pattern precedent (policy + validation trait
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
   [errors-log.md](../../docs/errors-log.md); flagged here so the paired story inherits the warning.
8. **File ownership with 0018.** This story owns `app/Livewire/SalesRegions/Index.php` and both
   `lang/*/sales-regions.php`; 0018 owns `resources/views/livewire/sales-regions.blade.php` and grows the
   lang files additively. If the two ever run concurrently, that is precisely what
   [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent
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
  container-resolved parameters** on component methods
  ([code-style.md](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method)) — not via
  the constructor, and not resolved with `app()` inside a component method body. The one `app()` call is
  `SetSalesRegionActive` reaching `SetDefaultSalesRegion`, which is an action calling an action.
- Array-shape PHPDoc on `$regions` and on `replacementCandidates()`, per
  [code-style.md](../../docs/conventions/code-style.md#phpdoc-array-shapes-over-inline-comments).
- Validation-trait methods return `array<int, ValidationRule|array<mixed>|string>`, matching
  `UserValidationRules`.

## Technical tasks for later backlog

- **The at-most-one-default database backstop** (generated column + UNIQUE) — a small migration plus the
  `23000`-to-`ValidationException` translation. Confirmed as a follow-up story (D13); this story's
  clear-before-set transaction is already ordered to accept it.
- **Retrofit `#[Locked]` onto `App\Livewire\Users\Index::$users`** (D9) so the Users screen matches the rule
  `security/livewire-authorization.md` states and this story follows. Not this story's edit.
- **`SalesRegionKind::label()` plus its `lang/{en,es}/sales-regions.php` keys** — still deferred, now to
  0018, which is the first story that actually renders `kind`.
- **Convene the two Three Amigos participants on this story before Phase 3** — see [Provenance](#provenance).
- **Docs to update at Phase 6:** [`architecture/authorization.md`](../../docs/architecture/authorization.md)
  (the second gated route and the third policy), [`api/routes.md`](../../docs/api/routes.md) (a new route
  row and its contract notes), [`conventions/base-standards.md`](../../docs/conventions/base-standards.md)
  (the `app/Actions/SalesRegions/` subfolder), and
  [`conventions/naming.md`](../../docs/conventions/naming.md) (a second live example of the `Index`-in-a-
  subfolder view-resolution exception).

## Provenance

**Read this before treating any decision above as debated.** `backend-expert` and `backend-qa` were both
convened for this story's Phase 1 debate, but **neither had returned its contribution when this document was
composed**. Everything above is therefore the work of `product-owner` alone, derived from:

- [story 0016](done/0016-sales-region-catalog-schema-and-seeder.md) read in full (the data contract),
- [PRD §2.1](../../docs/PRD/PRD.md#21-sales-regions--taxes),
- the real shipped code this story mirrors — `app/Livewire/Users/Index.php`, `app/Policies/UserPolicy.php`,
  `app/Concerns/UserValidationRules.php`, `app/Actions/Users/UpdateUser.php`, `routes/web.php`,
- the `docs/` set (architecture, conventions, security, testing, contracts, errors-log),
- [story 0004](done/0004-users-list-editor-backend.md) as the structural precedent,
- and direct reads of this repo's **installed vendor source** for the four load-bearing framework claims
  (`ValidatesAttributes::validateDecimal()`, `Validator::$numericRules`,
  `SupportValidation::exception()`, `SupportValidation::dehydrate()`).

**What this means concretely.** The three Phase 1 contributions `docs/workflow.md` requires are not all
present: the *expert's* file list and technical approach and the *QA's* test-case list here were written by
`product-owner` rather than by the specialists who own those roles. That is a **process gap, not a content
gap** — the document is complete against the template — but it removes the independent second opinion Phase 1
exists to produce, and it is exactly the kind of single-source reasoning that produced the
`getOriginal()`-instead-of-`getPrevious()` mistake recorded in [errors-log.md](../../docs/errors-log.md).

**Required before Phase 3.** (The seven originally-open questions are no longer among them — all seven
were confirmed by the product owner and are recorded as D5, D6, D7 and D10–D13 in
[Locked decisions](#locked-decisions-confirmed-at-phase-1).)

1. Re-convene `backend-expert` and `backend-qa` on this document and reconcile their contributions into it,
   rather than accepting it as debated.
2. Have `code-reviewer` treat Phase 2 as a **first specialist review** — the product owner's confirmation
   settled the seven product questions, not the engineering ones. The decisions still carrying no specialist
   second opinion are D1 (where the invariant lives), D2 (the single-writer split), D3 (atomicity), D5's
   non-product half (`decimal:0,3` and `min:0`, as distinct from the confirmed `max:100`), and D9 (the
   `#[Locked]` divergence from the Users screen).
