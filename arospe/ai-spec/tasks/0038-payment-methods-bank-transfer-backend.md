# [0038] Payment methods — bank transfer with a validated IBAN (backend)

## Description
Introduce the `payment_methods` table and the store-settings backend behind PRD [§2.5 Payment
Methods](../../docs/PRD/PRD.md#25-payment-methods-store-settings): a catalog seeded with exactly one
method — **bank transfer** — carrying a single configurable field, an **IBAN**. This story owns the
schema, the seeder, the save/edit path, and IBAN validation (structure **plus** the ISO 7064 mod-97
checksum). No Blade/Flux markup and no browser tests: the screen's real UI is a paired frontend
story, and this story ships only the minimal placeholder view that lets the component render.

> **AC 4 of §2.5 is explicitly out of scope for Epic 2.** The PRD's fourth acceptance criterion —
> *"An order's payment method references one of these configured methods"* — describes a reference
> created by **Epic 3's Orders module**, not here. `orders` does not exist, and this story defines no
> relation, no foreign key, and no `hasMany` on `PaymentMethod`. What this story owes Epic 3 is
> narrower and is fully satisfied by the sections below: **a persisted, seeded payment-method record
> with a stable identity that Epic 3 can later reference.** A reviewer must not treat the absent FK
> as a gap.

## Type
backend | includes database-expert: **yes**

### Why this is one story and not two

The table, the seeded singleton and the IBAN validation are one invariant: *the store has exactly one
payment method this phase, and the only thing configurable about it is an account number that must be
structurally and arithmetically well-formed*. The schema cannot be specified without deciding what
"unconfigured" means (nullable `iban`), and the seeder cannot be specified without the discriminator
column the save path also keys on. Splitting them would leave one half shipping a table nothing
writes and the other half validating a column that does not exist.

## Gherkin
```gherkin
Feature: Payment methods (store settings)

  # --- The catalog: bank transfer is the only method this phase ---

  Scenario: Bank transfer is the only payment method offered
    Given a store administrator on the payment methods settings
    When they view the available payment methods
    Then bank transfer is the only method offered

  Scenario: A freshly seeded store has no bank account configured yet
    Given a store administrator on a newly seeded store
    When they view the bank transfer method
    Then no IBAN is configured for it

  Scenario: A store administrator cannot add a second payment method
    Given a store administrator on the payment methods settings
    When they attempt to add a payment method
    Then the attempt is refused, bank transfer remaining the only method

  Scenario: A store administrator cannot remove the bank transfer method
    Given a store administrator on the payment methods settings
    When they attempt to remove the bank transfer method
    Then the attempt is refused, bank transfer remaining the only method

  # --- Configuring the IBAN ---

  Scenario: Configure the bank transfer IBAN
    Given a store administrator on the payment methods settings
    When they set the bank transfer IBAN to a valid account IBAN
    Then the bank transfer method is saved with that IBAN

  Scenario: Replace a previously configured IBAN
    Given a store administrator, with an IBAN already configured for bank transfer
    When they set the bank transfer IBAN to a different valid account IBAN
    Then the bank transfer method is saved with the new IBAN

  Scenario: An IBAN entered in the grouped form banks print is accepted
    Given a store administrator on the payment methods settings
    When they set the bank transfer IBAN to a valid account IBAN written in space-separated groups
    Then the bank transfer method is saved with that IBAN, stored without spaces

  Scenario: A lowercase IBAN is accepted
    Given a store administrator on the payment methods settings
    When they set the bank transfer IBAN to a valid account IBAN written in lowercase
    Then the bank transfer method is saved with that IBAN, stored in uppercase

  # --- Rejecting an invalid IBAN ---

  Scenario Outline: An invalid IBAN is rejected
    Given a store administrator on the payment methods settings
    When they set the bank transfer IBAN to <invalid_iban>
    Then the change is rejected with a validation message

    Examples:
      | invalid_iban                                          |
      | an account number that is too short for its country   |
      | an account number that is too long for its country    |
      | an account number containing punctuation              |
      | an account number whose country code is not a country |
      | an account number whose check digits do not match     |
      | a blank value                                         |

  Scenario: A rejected IBAN leaves the previously configured one in place
    Given a store administrator, with an IBAN already configured for bank transfer
    When they set the bank transfer IBAN to a value that fails IBAN validation
    Then the previously configured IBAN is left unchanged

  # --- Authorization ---

  Scenario: A store administrator without the payment-methods edit permission cannot configure the IBAN
    Given a signed-in administrator whose role does not grant the payment methods edit permission
    When they attempt to set the bank transfer IBAN
    Then the attempt is refused and no IBAN is stored

  Scenario: A store administrator without the payment-methods view permission cannot reach the settings
    Given a signed-in administrator whose role does not grant the payment methods view permission
    When they open the payment methods settings
    Then access is refused

  # --- Seeding ---

  Scenario: Re-seeding does not duplicate the bank transfer method
    Given a store whose payment methods have already been seeded
    When the payment methods are seeded again
    Then bank transfer is still the only method offered

  Scenario: Re-seeding does not discard a configured IBAN
    Given a store administrator who has configured the bank transfer IBAN
    When the payment methods are seeded again
    Then the configured IBAN is left unchanged
```

## Files to create/modify

### Migration — `payment_methods`

`database/migrations/<ts>_create_payment_methods_table.php` — **new**. Shape confirmed by
`database-expert`.

```php
public function up(): void
{
    Schema::create('payment_methods', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->string('code', 30)->unique();
        $table->string('iban', 34)->after('code')->nullable();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('payment_methods');
}
```

- **A generic `payment_methods` table with a `code` discriminator, not a bank-transfer-specific
  table — and, critically, not a generic table with a JSON `settings` blob.** All three shapes were
  weighed against `CLAUDE.md`'s "don't design for hypothetical future requirements". The JSON-blob
  option is rejected outright as exactly the speculative design that rule exists to prevent: no table
  in this codebase stores a schemaless config blob for domain data (`passkeys.credential` is a
  vendor-owned WebAuthn payload, not a precedent), and it would trade Larastan-checkable types away
  for flexibility nothing today needs.
  **`code` is not future-proofing** — it earns its place from a requirement *this* story has: an
  idempotent seeder needs a stable machine key that is not the mutable `iban`, exactly mirroring
  `Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web'])` in
  [`RolePermissionSeeder`](../../database/seeders/RolePermissionSeeder.php). The PRD's own framing is
  plural ("which payment methods are **available**") and
  [`RolePermissionSeeder::MODULES`](../../database/seeders/RolePermissionSeeder.php) already carries
  `payment-methods` as a full CRUD module, so a type-specific table would force a breaking rename the
  moment method #2 exists. Method #2, when it comes, gets its own alteration migration adding its own
  nullable columns — the real precedent being `add_two_factor_columns_to_users_table` and
  `add_status_to_users_table` (see [migrations.md](../../docs/database/migrations.md#adding-a-column-to-an-existing-table)).
  Recorded explicitly so a reviewer does not read a discriminator on a one-row table as scope creep
  that slipped past unexamined.
- **`$table->uuid('id')->primary()` — UUID v7, per an explicit user decision that overrides this
  debate's own recommendation.** Both `database-expert` and `backend-expert` recommended `$table->id()`
  (bigint), and so did `product-owner`; the user resolved it the other way. See
  [Documented functional decisions](#documented-functional-decisions) for the reasoning and the ADR
  consequence. The migration-side pattern is the one in
  [migrations.md](../../docs/database/migrations.md#uuid-primary-keys); the key is a `CHAR(36)`
  string, so Epic 3's `orders.payment_method_id` is a `foreignUuid(...)`, never a `foreignId(...)`.
- **`string(30)` and `string(34)`, not bare `string()`** — same reasoning `add_status_to_users_table`
  applies: a bare `string()` is `VARCHAR(255)`. `34` is IBAN's real ISO 13616 maximum (not Spain's
  24 — nothing in the PRD restricts the store's own account to Spain); `30` gives `bank_transfer`
  (13 chars) headroom for future codes such as `cash_on_delivery`.
- **`iban` is nullable, with no default.** A freshly seeded environment has no administrator-entered
  account yet, and there is no valid placeholder IBAN to invent — a fake one would be a real,
  checksum-valid-looking account number sitting in production. `NULL` *is* "not yet configured".
- **Unique index on `code` — the one load-bearing index.** It makes `firstOrCreate(['code' => …])`
  idempotent and turns "exactly one row per method" into a database invariant rather than a seeder
  convention, justified the same way [schema.md](../../docs/database/schema.md#users) justifies
  `pending_email`'s unique index.
- **No separate `$table->index('code')`.** `->unique()` already creates a b-tree index; adding an
  explicit second one would recreate this repo's own recorded mistake — the redundant
  `users_uuid_unique` index in [errors-log.md](../../docs/errors-log.md). The "explicitly index FK
  columns" habit from `create_passkeys_table` applies to **foreign keys**, not to a column that
  already carries a unique constraint. Do not over-apply it here.
- **No index on `iban`** — never queried by, never a join key, at most a handful of rows ever. Same
  reasoning [schema.md](../../docs/database/schema.md#users) gives for omitting one on `status`.
- **No `is_active` / `enabled` column — decided, not forgotten.** Shipping (§2.4) has an explicit
  enable/disable acceptance criterion; §2.5 has none — only list, configure IBAN, reject invalid
  IBAN. A boolean no screen reads and no AC requires is speculative design. It arrives as
  `add_is_active_to_payment_methods_table` when method #2 makes "available" versus
  "configured-but-hidden" a real distinction.
- **No `deleted_at` / `SoftDeletes`** — no AC in this story deletes a payment method, and the delete
  path is refused outright (see the policy below).
- **`down()` is the exact inverse of `up()`**, per [migrations.md](../../docs/database/migrations.md#structure).

### Enum and translations

- `app/Enums/PaymentMethodCode.php` — **new**. Backed string enum, TitleCase key:
  `case BankTransfer = 'bank_transfer';`, plus `label(): string` returning
  `__('payment_methods.names.'.$this->value)`. This mirrors
  [`App\Enums\UserStatus`](../../app/Enums/UserStatus.php) exactly, including the deliberate
  "`string` column + PHP enum, never a native MySQL `enum`" choice recorded in
  [migrations.md](../../docs/database/migrations.md#when-the-new-columns-default-is-wrong-for-existing-rows-backfill-in-the-same-up).
  The class is named after the column it casts (`code`), so the two cannot drift.
- **No `name` / `label` column on the table.** Following `UserStatus`'s precedent, the human-readable
  label is a translation key off the `code`, not stored data — a stored label would have to be kept
  in sync with `lang/en/` and `lang/es/` *and* the database by hand.
- `lang/en/payment_methods.php` + `lang/es/payment_methods.php` — **new**, key-for-key identical per
  [naming.md](../../docs/conventions/naming.md#translation-keys). Keys: `names.bank_transfer`, the
  `iban.invalid` validation message, and the "not yet configured" copy. Both files ship in this story
  even though it renders no real UI, because `PaymentMethodCode::label()` is a backend concern.
  `APP_LOCALE=en` today, so everything renders English until Epic 5 — accepted and documented, not a
  defect.

### Model

- `app/Models/PaymentMethod.php` — **new**.

  ```php
  /**
   * @property string $id
   * @property PaymentMethodCode $code
   * @property string|null $iban
   * @property Carbon|null $created_at
   * @property Carbon|null $updated_at
   */
  #[Fillable(['iban'])]
  class PaymentMethod extends Model
  {
      /** @use HasFactory<PaymentMethodFactory> */
      use HasFactory, HasUuids;

      protected function casts(): array
      {
          return [
              'code' => PaymentMethodCode::class,
          ];
      }
  }
  ```

  - **`code` is deliberately omitted from `#[Fillable]`** — the same omission-as-mass-assignment-guard
    convention `users.status` and `users.pending_email` use
    ([base-standards.md](../../docs/conventions/base-standards.md#model-conventions)). It is an
    identity column written only by the seeder, never by an admin form. `iban` is the single
    admin-settable column, so it *is* fillable — unlike `users.status`, an administrator setting it
    through a form is precisely the intended path.
  - **`use HasUuids;` and `@property string $id`, with no `$keyType` / `$incrementing` properties** —
    the trait's `HasUniqueStringIds` concern already overrides those as *methods*, so restating them
    is the redundancy [base-standards.md](../../docs/conventions/base-standards.md#uuid-primary-keys)
    calls out. `Str::uuid7()` is the trait's default `newUniqueId()`; do not override it or
    substitute `HasUlids`. The factory needs no change — the trait populates the key just before
    insert. One behavioural consequence to expect once the frontend story adds route-model binding:
    `resolveRouteBindingQuery()` validates the parameter with `Str::isUuid()` first, so a malformed
    identifier 404s immediately rather than running a doomed query.
  - **A read-only uppercasing accessor on `iban`**, following `User::email()`'s documented precedent
    (`Attribute::make(get: …)`): defensive consistency for any row written by a future path outside
    this story's reach. Like its precedent it is **explicitly not** a substitute for
    normalise-before-validate — see the normalisation section below.

### IBAN validation — a rule class with the mod-97 checksum

- `app/Rules/Iban.php` — **new**, implementing `Illuminate\Contracts\Validation\ValidationRule`.

  **`app/Rules/` is a stock Laravel location, not a new base folder needing approval** — verified by
  running `php artisan list`, which carries `make:rule` ("Create a new validation rule"); its stub
  target is `app/Rules/`. Same carve-out as `app/Enums/`, `app/Listeners/`, `app/Policies/` in
  [base-standards.md](../../docs/conventions/base-standards.md#directory-structure). Phase 6 must add
  the folder to that directory listing.

  ```php
  /**
   * Validate IBAN structure (ISO 13616) and the mod-97 (ISO 7064) checksum.
   *
   * Assumes the value has already been normalised (uppercase, no spaces) by the
   * caller -- this rule deliberately does NOT strip whitespace itself, matching
   * ProfileValidationRules::emailRules(), which likewise assumes lowercasing has
   * already happened. See "Normalisation" below for why that ordering matters.
   */
  public function validate(string $attribute, mixed $value, Closure $fail): void
  {
      if (! is_string($value) || ! preg_match('/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/', $value)) {
          $fail(__('payment_methods.iban.invalid'));

          return;
      }

      $rearranged = substr($value, 4).substr($value, 0, 4);

      $numeric = '';
      foreach (str_split($rearranged) as $char) {
          $numeric .= ctype_alpha($char) ? (string) (ord($char) - 55) : $char;
      }

      if ($this->mod97($numeric) !== 1) {
          $fail(__('payment_methods.iban.invalid'));
      }
  }

  /**
   * Compute the numeric string's value mod 97 without ever holding a number
   * larger than PHP's native int range. Processing in 7-digit chunks keeps the
   * intermediate "remainder + next chunk" concatenation at <= 9 digits, safe
   * even on a 32-bit int.
   */
  private function mod97(string $numeric): int
  {
      $remainder = 0;

      foreach (str_split($numeric, 7) as $chunk) {
          $remainder = (int) (($remainder.$chunk) % 97);
      }

      return $remainder;
  }
  ```

  **The decision, stated plainly: this validates structural format AND the mod-97 checksum.** A
  structure-only regex was considered and rejected. A regex bounding
  `[A-Z]{2}\d{2}[A-Z0-9]{11,30}` accepts any string of the right shape, so a single mistyped digit in
  the account number passes it — and for a field whose entire purpose is "money is transferred to
  this account", that is a silent wrong-destination bug, not a cosmetic gap. Mod-97 is IBAN's own
  error-detection mechanism (it catches essentially every single-digit typo and adjacent
  transposition) and costs roughly fifteen lines. There is no reason to ship the weaker check.

  **The chunked modulo is why no new dependency is needed.** A full IBAN converts to a 30+ digit
  numeral, far past `PHP_INT_MAX`, so a naive `% 97` would overflow. `bcmath` and `gmp` happen to be
  enabled in this environment but neither is declared in `composer.json`'s `require` — adding
  `ext-bcmath` would itself be a dependency change needing approval. Chunking sidesteps the question
  entirely in pure PHP.

  **Per-country IBAN length tables are deliberately out of scope.** The full table is ~75 entries
  requiring maintenance as countries adopt IBAN. **Be precise about what this costs**, because it is
  easy to overstate the coverage: a too-short or too-long IBAN is rejected by the *checksum*, not by
  a length rule — verified by executing the exact implementation above against
  `ES912100041845020005133` (23 chars → mod97 = 91) and `ES91210004184502000513322` (25 chars →
  mod97 = 71), both correctly rejected. The residual gap is that a length mutation whose checksum
  coincidentally lands on 1 (roughly 1 in 97) would be accepted. That is the accepted cost of not
  shipping the table; record it as possible future hardening, not as a defect.

- `app/Concerns/PaymentMethodValidationRules.php` — **new**, matching the
  `<Noun>ValidationRules` / `<noun>Rules()` convention in
  [naming.md](../../docs/conventions/naming.md#traits-and-their-methods) and staying flat and
  single-concern like its three siblings:

  ```php
  /**
   * @return array<int, ValidationRule|array<mixed>|string>
   */
  protected function ibanRules(): array
  {
      return ['required', 'string', 'max:34', new Iban];
  }
  ```

  Consumed as `use PaymentMethodValidationRules;` on the component, exactly as `Users\Index` composes
  `ProfileValidationRules, UserValidationRules`.

### Normalisation — before `validate()`, not inside the rule

IBANs are conventionally printed and typed in four-character groups (`ES91 2100 0418 4502 0005
1332`), and mod-97 cannot tolerate the spaces. This repo has already paid twice for getting
normalisation ordering wrong (the email lowercasing in story 0003, and the `getOriginal()` slip in
0007 — both in [errors-log.md](../../docs/errors-log.md)), so the layering is specified here rather
than left to Phase 3:

1. **Load-bearing — the Livewire component, as the statement immediately before `validate()`**,
   mirroring `Users\Index::save()`'s `$this->email = Str::lower($this->email);`:
   ```php
   $this->iban = strtoupper(str_replace(' ', '', $this->iban));
   $validated = $this->validate(['iban' => $this->ibanRules()]);
   ```
   Normalising only inside the action would let the validator see the un-normalised value and reject
   every space-separated IBAN a user pastes from their bank statement.
2. **Defence in depth — the action normalises again before persisting**, mirroring how
   `CreateUser`/`UpdateUser` re-apply `Str::lower($email)`, so a future second call site that forgets
   step 1 still stores the canonical form.
3. **Consistency only — the model's read accessor** (above). Not load-bearing.

**The `Iban` rule itself must not strip spaces.** If normalisation is ever skipped, the rule fails
loudly on the raw value instead of silently accepting it — the same guarantee `emailRules()` relies
on for lowercase. A future refactor that moves stripping "for convenience" into the rule silently
decouples it from the component's expectations; the rule's docblock says so.

### Action, component, policy, route

- `app/Actions/PaymentMethods/UpdatePaymentMethodIban.php` — **new**, invokable, imperative
  verb-phrase name with no `Action`/`Service` suffix per
  [naming.md](../../docs/conventions/naming.md#classes). `__invoke(PaymentMethod $method, string $iban): void`.
  Normalises (step 2 above) and persists. A new `app/Actions/PaymentMethods/` subfolder is the
  per-domain grouping `app/Actions/` already uses (`Fortify/`, `Users/`).
- `app/Livewire/PaymentMethods/Index.php` — **new**, class-based per
  [base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file),
  with `#[Title('Payment methods')]`.

  **This component's public surface is a contract the paired frontend story (0039) builds against, so
  it is specified in full here rather than left to Phase 3.** A list + edit screen cannot render from
  a bare `$iban` alone; the shape below mirrors `App\Livewire\Users\Index` field for field, so a
  reader of one is not surprised by the other.

  ```php
  /**
   * @var array<int, array{id: string, code: PaymentMethodCode, iban: string|null, canEdit: bool}>
   */
  public array $paymentMethods = [];

  #[Locked]
  public ?string $editingMethodId = null;

  public bool $showModal = false;

  /**
   * Never `null` -- an empty string is the "not configured yet" sentinel for the
   * IBAN <input>. Livewire assigns this property's dehydrated value straight onto
   * the DOM element's `.value`, and a JS `null` stringifies to "null"; see the
   * wire:model desync bug in docs/errors-log.md.
   */
  public string $iban = '';
  ```

  Methods: `mount()`, `openEditModal(string $methodId)`, `save()`, `closeModal()`, and a private
  `loadPaymentMethods()` — and **deliberately no `create*` / `delete*` method at all** (see "the only
  method" below). `Gate::authorize('viewAny', PaymentMethod::class)` in `mount()`;
  `Gate::authorize('update', $target)` as the **first statement** of `save()`.

  - **`$paymentMethods` is populated by `loadPaymentMethods()`**, called from `mount()` and again
    after every successful `save()` so the list reflects what was just written. This phase it holds
    exactly one row — bank transfer — which is a *fact about the seeded data*, not a `take(1)` or a
    hardcoded lookup: the component queries the table normally, and the "only one method" guarantee
    comes from the three enforcement layers below. Do not special-case it.
  - **`canEdit` is a per-row `Gate::allows('update', $method)`**, following the pattern
    [authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)
    documents from the Users list, and it must satisfy that section's four rules. Two are easy to get
    wrong here: it must call **the same policy method `save()` authorizes against**, never a re-stated
    `$user->can('payment-methods.edit')` — a restatement goes stale the first time
    `PaymentMethodPolicy::update()` grows a branch; and it must be `Gate::allows()`, never
    `Gate::authorize()`, because rendering a list must not throw on a row the actor cannot touch.
    **It is a UI hint and adds nothing to the security posture** — `save()` re-authorizes
    independently regardless, since a client can call `save()` without the list ever having been
    rendered.
  - **`openEditModal(string $methodId)` takes the row being edited**, not a bare no-arg opener,
    matching `Users\Index::openEditModal(string $userId)`. It resolves the target with
    `PaymentMethod::findOrFail($methodId)` — so an unknown or malformed id fails on its own — and
    **populates `$iban` from the resolved model, never from `$paymentMethods`**. That array is a
    public property and therefore client-writable, so backing the form's values out of it would let a
    tampered payload seed the modal; the rule is recorded in
    [blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md). It
    assigns `$this->iban = $target->iban ?? ''` (the `?? ''` is what keeps the never-`null` invariant
    above) and sets `$showModal = true`.
  - **`$editingMethodId` is `#[Locked]`**, matching `$editingUserId`: `save()` re-resolves the target
    from it, so an unlocked property would let the client redirect the write at an arbitrary row.
    `$showModal` and `$iban` are deliberately *not* locked — both are legitimately client-driven.
  - **`closeModal()` resets `$editingMethodId`, `$iban` and `$showModal`**, so a cancelled edit
    cannot leak the previous target's value into the next one.
- `resources/views/livewire/payment-methods.blade.php` — **new, minimal placeholder only.** Note the
  [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name):
  `App\Livewire\PaymentMethods\Index` resolves to this **flat** path, one level shallower than its
  class — not `payment-methods/index.blade.php`. The placeholder exists so `Livewire::test()` can
  render; the real card/list + edit UI is **story 0039**, which consumes the contract above and which
  per the PRD should follow
  the shipping-carrier-card or tax-rules-list pattern. This mirrors 0004 → 0006 exactly.
- `app/Policies/PaymentMethodPolicy.php` — **new**, auto-discovered by name (no `AuthServiceProvider`
  — see [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)):
  `viewAny()` → `payment-methods.view`; `update()` → `payment-methods.edit`; and `create()` /
  `delete()` **explicitly returning `false`**.
- `routes/web.php` — **modify**, inside the existing `auth` + `verified` group beside `users.index`:

  ```php
  Route::livewire('payment-methods', PaymentMethodsIndex::class)
      ->middleware(['can:payment-methods.view'])
      ->name('payment-methods.index');
  ```

  **`can:`, never `permission:`** — Livewire 4's `PersistentMiddleware` allow-list carries Laravel's
  `Authorize` but not Spatie's `PermissionMiddleware`, so `permission:` would protect the initial
  `GET` only and leave every `save()` round-trip unauthorised at the route layer. This is why the
  component re-authorises in `mount()` and `save()` regardless. See
  [authorization.md](../../docs/architecture/authorization.md) and
  [livewire-authorization.md](../../docs/security/livewire-authorization.md). `routes/web.php` rather
  than `routes/settings.php`: the latter is scoped to the *acting user's own account*, not store-wide
  configuration.
- **No change to the permission catalog.** `payment-methods.view/create/edit/delete` already exist in
  [`RolePermissionSeeder::MODULES`](../../database/seeders/RolePermissionSeeder.php) and are already
  granted to `Administrator`. This story adds no permission and reseeds no grant.

### Seeder and factory

- `database/seeders/PaymentMethodSeeder.php` — **new**, and called **unconditionally** from
  `DatabaseSeeder::run()`, *outside* the `app()->environment(['local', 'testing'])` block. That block
  is reserved for throwaway fixtures like `test@example.com`; this row is **required application
  data** of exactly the same class as the roles/permissions catalog — Epic 3's orders will reference
  it, so the app is incomplete until it has run, and `db:seed` is a production deployment step here
  (see [seeder-safety.md](../../docs/security/seeder-safety.md)).

  ```php
  PaymentMethod::firstOrCreate(
      ['code' => PaymentMethodCode::BankTransfer->value],
  );
  ```

  > **`firstOrCreate`, never `updateOrCreate` — the single most important line in this story.**
  > `updateOrCreate` would rewrite `iban` toward its create-array value (`null`, when omitted) on
  > **every** reseed or redeploy, silently wiping an administrator's configured bank account in
  > production. That is data loss, not a style preference. `iban` is omitted from the create array
  > entirely, so a fresh row simply carries the column's own `NULL`.

- `database/factories/PaymentMethodFactory.php` — **new**. `definition()` returns
  `['code' => PaymentMethodCode::BankTransfer->value, 'iban' => null]`, plus a
  `withIban(string $iban)` state. **`code` is deliberately not randomised** — one method genuinely
  exists in this domain, so a default matching seeded reality is more honest than
  `fake()->unique()->word()`. Because of the unique index, a test needing a second row must override
  `code` explicitly; that friction is intentional.

### Enforcing "bank transfer is the only method this phase"

Three backend layers, none of which is individually "the" enforcement:

1. **No create/delete code path exists.** The component has no `createPaymentMethod()` /
   `deletePaymentMethod()` method for anything to call.
2. **`PaymentMethodPolicy::create()` / `delete()` explicitly return `false`** rather than being left
   undefined. Deliberate: an *undefined* ability makes `Gate::authorize('create', …)` throw
   `BadMethodCallException` — a 500, and only if someone happens to call it — whereas an explicit
   `false` yields a clean, assertable `Gate::denies(...)`. This is a real business rule a test can
   target, matching `UserPolicy::delete()`'s self-documenting trashed-target refusal. **Note this is
   the *only* thing closing the gap**: `Administrator` legitimately holds `payment-methods.create`
   and `.delete` from the seeded module × action grid, so a reviewer checking the seeder will
   correctly find those grants and must not mistake them for a hole.
3. **`code` is unique-constrained and outside `#[Fillable]`**, so no mass-assignment path can write a
   second method even via a careless `PaymentMethod::create([...])`.

Deliberately **not** attempted: a database-level guard against a raw `INSERT` bypassing the
application (tinker, a migration). Nothing in this codebase does that today — nothing stops a raw
insert into `roles` either — and inventing it here would be inconsistent.

### Explicitly NOT in this story

Listed so reviewers do not reopen them: all Blade/Flux markup, the card/list + edit UI, `data-test`
hooks and browser tests (**paired frontend story**); `orders`, `orders.payment_method_id`, and any
relation on `PaymentMethod` (**Epic 3**, PRD AC 4); an `is_active` toggle; per-country IBAN length
tables; a "delete the last remaining payment method" guard; a `routes/store-settings.php` split.

## Tests to perform

**`tests/Unit/Enums/PaymentMethodCodeTest.php`** (no DB)
- [ ] Backing value is exactly `bank_transfer`; `PaymentMethodCode::from('paypal')` throws.
- [ ] `label()` routes through `__()` — assert against `trans('payment_methods.names.bank_transfer')`, **not** a literal, so this does not assert display copy Epic 5 owns.

**`tests/Unit/Concerns/PaymentMethodValidationRulesTest.php`** (no DB — drives `Validator::make()` against the real `ibanRules()`)
- [ ] Every entry of the `valid_ibans` dataset passes.
- [ ] Every entry of the `invalid_ibans` dataset fails, **and the error is on the `iban` key specifically** (`$validator->errors()->has('iban')`), so "rejected with a validation message" is testably specific rather than a generic failure.
- [ ] A missing `iban` key fails `required`.

> **These format-rejection tests must assert the validator's own result, never a database
> round-trip.** MySQL's default `utf8mb4_*_ci` collation is case-insensitive, so a "lowercase is
> rejected" test written as a round-trip could pass because the engine folded the value, not because
> validation refused it — the same class of masking recorded for case normalisation in
> [soft-delete-patterns.md](../../docs/security/soft-delete-patterns.md).

**The IBAN dataset** — `tests/Datasets/Ibans.php` (or inline). **Every value below was verified by
executing the exact `Iban` implementation from this story** (structure regex, then chunked mod-97),
not taken from memory; the `structOK` / `mod97` results quoted are real output.

```php
dataset('valid_ibans', [
    'ES — 24 chars'                        => 'ES9121000418450200051332',
    'DE — 22 chars'                        => 'DE89370400440532013000',
    'GB — 22 chars'                        => 'GB29NWBK60161331926819',
    'FR — 27 chars, letter inside the BBAN' => 'FR1420041010050500013M02606',
]);

dataset('invalid_ibans', [
    // Each case isolates ONE failure mode against the valid ES example above.
    'country code not uppercase'                  => 'eS9121000418450200051332',  // struct fail
    'entirely lowercase'                          => 'es9121000418450200051332',  // struct fail
    'punctuation embedded'                        => 'ES91-2100-0418-4502-0005-1332', // struct fail
    'digits where the country code belongs'       => '129121000418450200051332',  // struct fail
    'too short for ES (23 chars)'                 => 'ES912100041845020005133',   // struct OK, mod97=91
    'too long for ES (25 chars)'                  => 'ES91210004184502000513322', // struct OK, mod97=71
    'structurally valid, wrong mod-97 check digit' => 'ES9021000418450200051332', // struct OK, mod97=0
    'country code only'                           => 'ES',
    'empty string'                                => '',
    'null'                                        => null,
]);
```

- [ ] **`'structurally valid, wrong mod-97 check digit'` is the single most important case in this story and must not be moved, weakened, or dropped.** `ES9021000418450200051332` has the right country code, the right length, and the right character classes — it passes the structure regex and is rejected **only** by the checksum (verified: `structOK=yes, mod97=0`). A structure-only implementation passes every other entry in this dataset and fails just this one. Without it, the entire mod-97 requirement ships untested while the suite stays green.
- [ ] Every dataset entry is **named**, so a failure reads `… with data set "structurally valid, wrong mod-97 check digit"` and identifies the broken failure mode directly.
- [ ] **The two length cases are rejected by the checksum, not by a length rule** — assert them as rejections, but do not describe them in the test name as "length validation", because no length validation exists (see the rule section's honest statement of that residual ~1-in-97 gap).

**`tests/Feature/PaymentMethods/UpdateIbanTest.php`** (`RefreshDatabase`, driven through `Livewire::test()`)
- [ ] Happy path: an authorised actor sets a valid IBAN → `fresh()->iban` equals it.
- [ ] **Edit, not just first-set**: an already-configured IBAN is replaced by a different valid one. "First save only" is a plausible incomplete implementation that a first-set-only test cannot catch.
- [ ] **Space-separated input is accepted and stored normalised**: setting `'ES91 2100 0418 4502 0005 1332'` stores `'ES9121000418450200051332'`. Assert **what was stored**, not merely that the save succeeded — an implementation that strips spaces only for the checksum and persists the raw spaced string passes a success-only assertion while corrupting the column.
- [ ] Lowercase input is accepted and stored uppercased, asserted the same way.
- [ ] **Invalid IBAN (parametrised over `invalid_ibans`): a validation error is raised AND the previously stored IBAN is unchanged.** Both halves are mandatory. Asserting only that an exception was thrown passes against an implementation that writes first and validates second — the exception still throws, just too late.
- [ ] The validation error is on the `iban` field.

**`tests/Feature/PaymentMethods/ComponentContractTest.php`** — the public surface story 0039 renders against. These are cheap and they are what stop the frontend story being blocked by a silently-changed contract.
- [ ] `mount()` populates `$paymentMethods` with one row whose `id`, `code` and `iban` match the seeded record, and whose `canEdit` is `true` for an authorised actor.
- [ ] **`canEdit` is `false` for an actor holding `payment-methods.view` but not `.edit`** — and that same actor's `save()` is refused. Assert **both in the same test**: the whole point of the pattern is that the hint and the outcome cannot drift, and two separate tests would still pass if they drifted apart.
- [ ] `openEditModal($id)` sets `$showModal` true, `$editingMethodId` to the target, and `$iban` to the stored value — **and to `''`, never `null`, when the method has no IBAN configured.** That last assertion is the regression guard for the `wire:model` desync bug; a `?? ''` dropped in a refactor is invisible to every other test here.
- [ ] **`openEditModal()` reads from the database, not from `$paymentMethods`**: tamper with the public `$paymentMethods` array via `->set()` to hold a bogus IBAN, then call `openEditModal()` and assert `$iban` is the *stored* value. Without this, an implementation that back-fills the form from the client-writable array passes every other test in this file.
- [ ] `openEditModal()` with an unknown id raises `ModelNotFoundException` rather than silently opening an empty modal.
- [ ] `closeModal()` clears `$editingMethodId`, `$iban` and `$showModal`.
- [ ] A successful `save()` refreshes `$paymentMethods` so the new IBAN is visible in the list without a page reload.
- [ ] `$editingMethodId` is `#[Locked]`: `Livewire::test(...)->set('editingMethodId', $other->id)` raises, so the write cannot be redirected at another row.

**`tests/Feature/PaymentMethods/AuthorizationTest.php`**
- [ ] An `Administrator` (holds `payment-methods.edit`) can set the IBAN.
- [ ] A user with no role is refused **and** the IBAN is unchanged.
- [ ] **An actor holding every *other* module's `edit` permission but not `payment-methods.edit` is refused.** This is the case that catches a policy that checks the wrong permission string — a very plausible copy-paste slip given this story scaffolds from `UserPolicy`. Precedent: `IndexTest`'s "a blog editor whose role does not grant `users.view` is denied server-side".
- [ ] A `Super Admin` — who holds **no** direct `payment-methods.*` grant and reaches it only through the `Gate::before` bypass — can set the IBAN. Regression guard for the bypass coverage gap in [authorization.md](../../docs/architecture/authorization.md).
- [ ] `GET /payment-methods` is refused (403) for an actor without `payment-methods.view`, and reached by one with it. **An HTTP test and a `Livewire::test()` test are not substitutes for each other** here — see [testing/README.md](../../docs/testing/README.md).
- [ ] `Gate::denies('create', PaymentMethod::class)` and `Gate::denies('delete', $method)` for an `Administrator` — i.e. the block holds *despite* that role legitimately holding those permissions.

**`tests/Feature/Seeders/PaymentMethodSeederTest.php`**
- [ ] Seeding creates exactly one row, with `code` = `bank_transfer` and `iban` null.
- [ ] **"Bank transfer is the only method" asserts count *and* identity** — `toHaveCount(1)` **and** `first()->code === PaymentMethodCode::BankTransfer`. Count alone passes against "seeded the wrong method"; identity alone passes against "seeded two". Do not assert on a hardcoded row id, which couples the test to seeder internals.
- [ ] Seeding twice still yields exactly one row (idempotency). This is a **separate test** from the one above — a single-run assertion tells you nothing about second-run behaviour, and one test must not claim to cover both.
- [ ] **Re-running the seeder does not clobber an administrator-configured IBAN**: seed, write an IBAN, seed again, assert the IBAN survives. This is the `firstOrCreate`-vs-`updateOrCreate` regression, and it is the difference between a correct seeder and silent production data loss. Write it before trusting the seeder's shape, not after.
- [ ] Per the ambient-`.env` lesson in [errors-log.md](../../docs/errors-log.md), if any of these tests touch `DatabaseSeeder` (which also runs `RolePermissionSeeder`), neutralise `config(['auth.super_admin.email' => null])` first rather than assuming a clean `.env`.

**Deliberately not tested** (per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)):
migration `up()`/`down()` mechanics (`RefreshDatabase` runs every migration each run; `down()`
symmetry is a code-review item); mod-97 as abstract mathematics reimplemented in a test — exercise it
*through* `ibanRules()`, which is what actually gates the app; an exhaustive sweep of all ~70
IBAN-using countries (four plus the near-misses proves the behaviour); UUID/PK generation mechanics;
anything in `tests/Browser/`; and PRD AC 4's order reference (Epic 3).

## Expected outcome
A `payment_methods` table exists, holding exactly one row — bank transfer — created by an idempotent
`PaymentMethodSeeder` that runs in every environment and can be re-run on any redeploy without
duplicating the row or discarding an administrator's configured account number. That method's single
configurable field is an IBAN, nullable and unset until an administrator configures it. Saving an
IBAN normalises it (spaces stripped, uppercased) *before* validating, so an administrator can paste
the space-grouped form printed on a bank statement, and stores the canonical unspaced uppercase form.
An IBAN is accepted only if it satisfies both ISO 13616 structure and the ISO 7064 mod-97 checksum, so
a single mistyped digit — which a structure-only check would wave through — is refused; a refusal
leaves any previously configured IBAN exactly as it was. Reaching the screen requires
`payment-methods.view` and changing the IBAN requires `payment-methods.edit`, re-checked inside the
component because Livewire's `/livewire/update` round-trip does not re-run route middleware. No code
path creates a second payment method or deletes the only one, and the policy refuses both explicitly
even though `Administrator` legitimately holds those permissions.

Epic 3 inherits a stable, seeded payment-method record it can reference. **It does not inherit a
foreign key, a relation, or an `orders` table** — those are Epic 3's to create.

## Acceptance criteria
- [ ] `payment_methods` keys on a **UUID v7 primary key** (`$table->uuid('id')->primary()` + `use HasUuids;`, `@property string $id`, no `$keyType`/`$incrementing` properties).
- [ ] `payment_methods` exists with `code` (`VARCHAR(30)`, unique, **not** mass-assignable, cast to `App\Enums\PaymentMethodCode`) and `iban` (`VARCHAR(34)`, nullable, mass-assignable). No `is_active`, no `name`, no `deleted_at`, no JSON settings column — each omission deliberate and justified above.
- [ ] `PaymentMethodSeeder` creates exactly one `bank_transfer` row with a null IBAN, runs unconditionally from `DatabaseSeeder` (outside the local/testing fixture gate), and uses **`firstOrCreate`** — re-running it neither duplicates the row nor overwrites a configured IBAN.
- [ ] Bank transfer is the only method offered: no create/delete code path exists, `PaymentMethodPolicy::create()` and `delete()` return `false` explicitly, and `code` cannot be mass-assigned — the block holding even though `Administrator` holds `payment-methods.create` / `.delete`.
- [ ] A valid IBAN is saved. A valid IBAN entered with spaces, or in lowercase, is accepted and **stored** canonically (unspaced, uppercase).
- [ ] IBAN validation enforces **structure and the mod-97 checksum**, implemented in `app/Rules/Iban.php` with a chunked modulo (no new Composer dependency, no `ext-bcmath`/`ext-gmp` requirement). A structurally well-formed IBAN with wrong check digits is rejected.
- [ ] Normalisation happens in the component **immediately before `validate()`**, is repeated defensively in the action, and the `Iban` rule itself does **not** strip whitespace.
- [ ] An invalid IBAN is rejected with a validation message on the `iban` field, and any previously configured IBAN is left unchanged.
- [ ] `App\Livewire\PaymentMethods\Index` exposes the full contract story 0039 renders against: `$paymentMethods` (rows of `{id, code, iban, canEdit}`), `$showModal`, the `#[Locked]` `$editingMethodId`, `$iban` (a `string`, never `null`), and `mount()` / `openEditModal(string $methodId)` / `save()` / `closeModal()`. `canEdit` comes from `Gate::allows('update', $method)` — the same policy method `save()` authorizes against — and `openEditModal()` populates the form from the resolved model, never from the client-writable `$paymentMethods` array.
- [ ] `payment-methods.index` is gated with **`can:payment-methods.view`** (never `permission:`), and the component re-authorises in `mount()` and as the first statement of `save()` (`payment-methods.edit`).
- [ ] `lang/en/payment_methods.php` and `lang/es/payment_methods.php` exist and are key-for-key identical.
- [ ] PRD AC 4 (an order references a configured payment method) is **not** implemented here, and its absence is recorded as Epic 3 scope rather than a gap.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite (per the Full Test Suite Gate Rule in [contracts.md](../../docs/contracts.md)).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that `save()` re-authorises rather than trusting route middleware; that `code` is genuinely unwritable by mass assignment; that the seeder cannot clobber a configured IBAN; and that an IBAN is never echoed into a `wire:*` directive without `@js()` when the frontend story lands.
- [ ] Documentation updated (docs-keeper) — [database/schema.md](../../docs/database/schema.md) (new `payment_methods` section + ER diagram), [api/routes.md](../../docs/api/routes.md) (`payment-methods.index` as the second permission-gated route), [architecture/authorization.md](../../docs/architecture/authorization.md) (`PaymentMethodPolicy`, and the deliberate `create`/`delete` refusal despite the seeded grants), [conventions/base-standards.md](../../docs/conventions/base-standards.md) (add `app/Rules/` and `app/Actions/PaymentMethods/` to the directory listing), and — **required, not conditional** — an amendment to [ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md) recording that UUID v7 is now the standing policy for all new Epic 2 business entities (with story 0032's shipping geography catalog as the named exception), superseding its closed list of seven. See decision D-1.
- [ ] Acceptance criteria met.

## Dependencies and related work
- **Depends on story 0002** (the seeded roles/permissions catalog) only in that `payment-methods.*` must already exist. It does; no seeder change is needed.
- **No dependency within Epic 2.** This story touches no products, taxes, sales regions or shipping.
- **Story 0039 (the paired frontend half) depends on this one** and is numbered after it, per the [task ordering rule](../../docs/workflow.md#task-ordering-rule): its Blade markup binds to this component's public surface, which is why that surface is specified in full above rather than discovered during Phase 3. Any change to it after 0039's Phase 1 is a change to 0039's contract and must be relayed, not made silently.
- **Epic 3 (Orders) depends on this one** for the record it will reference. Three notes to carry forward, none actionable here: `orders.payment_method_id` is a **`foreignUuid(...)`**, not a `foreignId(...)`, since this table keys on a UUID (decision D-1); it should be `restrictOnDelete()`, never `cascadeOnDelete()`; and if a future story ever wires the unused `payment-methods.delete` permission to a real delete action, deleting the only row would leave the store with zero payment methods and break order creation — that guard belongs to whichever story introduces the delete path, not to this one. Nothing in this schema forecloses either.

## Resolved in the debate
- **Generic `payment_methods` + `code` discriminator**, not a bank-transfer-specific table and not a JSON `settings` blob. `code` is justified by *this* story's idempotent-seeding need, not by anticipated future methods — recorded explicitly so it is not read as unexamined scope creep.
- **Checksum, not structure-only.** Structure-only validation would accept a single mistyped digit in an account number the store is asking customers to wire money to.
- **No new Composer dependency.** Chunked modulo keeps mod-97 in pure PHP with no `ext-bcmath`/`ext-gmp` requirement. (A package remains available as OQ-2 if the human prefers it.)
- **No `is_active` column.** §2.4 Shipping has an explicit enable/disable AC; §2.5 has none. `database-expert` raised this as a genuine judgment call; decided here as a product call, on the PRD's silence.
- **Authorization lives in the Livewire component, not in the action.** `backend-qa` proposed pushing `Gate::authorize()` into `UpdatePaymentMethodIban` so the action is not callable unguarded. Declined for consistency: every existing action in this repo (`CreateUser`, `UpdateUser`, `RequestEmailChange`) is an unguarded domain operation, with authorization at the Livewire boundary — introducing a second, contradictory pattern in a low-risk story is worse than the marginal exposure, since the action has exactly one call site and no HTTP boundary of its own. **Flagged for Phase 4** so `appsec-auditor` sees the decision rather than discovering it, and note the distinction that [livewire-authorization.md](../../docs/security/livewire-authorization.md) actually draws: a *business rule* enforced only in a component is bypassed by other call sites — which is precisely why normalisation and validation **are** duplicated in the action.
- **Spaces**: rejected by the `Iban` rule, accepted by the *screen* because the component normalises first. Both amigos' positions reconcile to this; the dataset above reflects it (spaces appear only in the rule-level invalid set, while the component-level test asserts a spaced IBAN saves successfully and is stored unspaced).

## Open questions

**OQ-1 and OQ-2 are resolved** — see [Documented functional decisions](#documented-functional-decisions)
below. Only OQ-3 remains open, and it is non-blocking.

**OQ-3 — Route placement, non-blocking.** `payment-methods.index` goes in `routes/web.php` beside
`users.index` for now. Three PRD sections (2.1 Taxes, 2.4 Shipping, 2.5 Payment Methods) all describe
"store settings" screens that will each need this decision; a `routes/store-settings.php` split —
mirroring how `routes/settings.php` isolates personal-account screens — may be worth doing once the
*second* of them lands. Flagged so it is a deliberate choice later rather than an accident.

## Documented functional decisions

**D-1 — UUID v7 primary key. Explicit user decision, overriding this debate's unanimous
recommendation.** `database-expert`, `backend-expert` and `product-owner` all recommended
`$table->id()` (bigint), reasoning that [ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md)
and PRD [assumption 19](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) enumerate **exactly
seven** UUID entities by name — `payment_methods` not among them — and that the ADR's stated
rationale (enumeration-safe public identifiers) does not bite for an admin-only table holding a
handful of rows in an app with no storefront and no REST API.

**The user decided otherwise, and the decision is broader than this table:** the project-wide policy
is **UUID v7 via `HasUuids` for all new Epic 2 business entities**, with the shipping geography
catalog (story **0032**) as the sole deliberate exception, on the grounds that it is a high-volume
lookup table rather than a business entity. `payment_methods` is a business entity, so it takes UUID
v7.

Why this is the better call than the one the debate reached, recorded so it is not relitigated: the
experts optimised each table locally, and every such local judgement ("this one is small",
"admin-only", "no public identifier") produces a defensible bigint answer — which, applied table by
table across Epics 2 and 3, yields a schema where PK type varies per table for reasons no one can
reconstruct later, and where every future FK author must first check which kind they are pointing at.
A single rule with one **named**, justified exception is cheaper to hold and to review than a dozen
locally-optimal ones. The cost is real but small and fully priced in above: `CHAR(36)` keys instead of
8-byte ints, and `foreignUuid()` in Epic 3.

Consequence for Phase 6: **ADR 0001 must be amended**, not merely cited. Its list of seven entities
is written as closed and this decision widens it into a standing policy; leaving the ADR unchanged
would leave the repo's own decision record contradicting the schema — precisely the "a doc's negative
claim outlived the code" failure already recorded in [errors-log.md](../../docs/errors-log.md). This
is carried into the Definition of Done.

**D-2 — Hand-rolled IBAN rule, confirmed.** `app/Rules/Iban.php` with structure **plus** mod-97
checksum validation and no new Composer dependency, exactly as specified above. The
`globalcitizen/php-iban` alternative (which would have brought per-country length tables) was
declined; the residual ~1-in-97 length-mutation gap documented in the rule section stands as accepted,
with per-country tables recorded as possible future hardening rather than a defect.

**D-3 — Route placement** remains OQ-3 below: non-blocking, revisit when the second store-settings
screen lands.

## Provenance
Phase 1 three-way debate: `database-expert` (the generic-vs-specific schema decision and the
`code`-as-seed-key justification, the closed-list PK argument, the `firstOrCreate`-not-`updateOrCreate`
data-loss rule, index cost/benefit including the redundant-index trap, the `is_active` judgment call),
`backend-expert` (the mod-97 rule with the overflow-safe chunked modulo, the normalise-before-validate
layering, the three-layer "only method" enforcement including the explicit `false` policy abilities,
the `app/Rules/` stock-folder confirmation, the file list), and `backend-qa` (the IBAN dataset and its
one-failure-mode-per-case discipline, the "nothing persisted" and count-plus-identity assertion
patterns, the seeder-clobber test, the wrong-permission-string authorization case, the collation
masking trap). Points of genuine disagreement — authorization placement, and whether spaced IBANs are
rejected or normalised — are recorded above as resolutions with reasoning, not silently merged.

Every IBAN in the dataset, and each near-miss's `structOK` / `mod97` result quoted in this document,
was verified by `product-owner` executing the exact rule implementation specified above, rather than
relayed from any agent's recollection.
