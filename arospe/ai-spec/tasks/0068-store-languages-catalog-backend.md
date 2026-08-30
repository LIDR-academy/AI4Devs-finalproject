# [0068] Store Languages catalog + the app's two default-locale settings

## Description
Two related backend capabilities, both surfaced on the **same settings screen** (story 0069's, not this one's):

1. **The `store_languages` catalog** — the admin-managed set of languages the store's **content** is authored in ([PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization)) — its model, policy, validation trait, the three domain actions that maintain it (add, remove, set-default), the bundled ISO 639-1 fixture an administrator **picks from**, the permission-gated route, and the seeder that makes **Spanish the store default on a fresh install**.
2. **The `locale_settings` singleton** — a persisted, admin-configurable **default dashboard language** and **default notification-email language**, both constrained to `App\Enums\UiLocale` (`en`/`es`), replacing the hardcoded `config('app.locale')` fallback story 0066's middleware currently uses.

This story ships the backend contract only: no settings screen (story 0069), and **no translation mechanism** (stories 0070+ retrofit the content tables that reference `store_languages` rows).

> **Three distinct concepts share this file. Do not merge any two of them.** [PRD assumption 14](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) defines **two independent i18n layers**, and this story touches both plus a third thing that is neither:
>
> | Concept | Value domain | Cardinality | Owner |
> | --- | --- | --- | --- |
> | **`store_languages.is_default`** — the default *content-authoring* language | any ISO 639-1 language (French, Japanese…) | a list, one row flagged | this story (Layer 2) |
> | **`locale_settings.default_ui_locale`** — the fallback *dashboard* language | `en`/`es` only (`UiLocale`) | exactly one settings row | this story |
> | **`users.ui_locale`** — one administrator's *own* dashboard language | `en`/`es` only (`UiLocale`) | one per user, nullable | **story 0066**, not this one |
>
> The store default may be a language the dashboard does not even offer. That is correct and intended.

> **Revised 2026-08-28 (a) — the human product owner resolved Q1 in favour of a bundled reference list.** The first Phase 1 debate recommended that an administrator **free-type** a locale code and display name, validated by a format regex only, with no bundled fixture (recorded as **D3** and **D9**). That was overruled: administrators now **pick from a bundled `database/data/` fixture**, mirroring the ISO 3166 country fixture behind `sales_regions`. D3 is reversed, D9 is superseded, D15/D16/D17 are new, and the `AddStoreLanguage` contract changed shape.

> **Revised 2026-08-28 (b) — the human confirmed the two default-locale settings as new scope for this story.** They are managed on story 0069's screen alongside Store Languages, which is why they land here rather than in a story of their own. **D18–D26** are new. This half of the story **requires a correction to sibling story 0066 once it lands** (see **R-13**) — 0066 is not edited by this story, and that reconciliation is the coordinator's to run.
>
> Every affected section below is rewritten rather than annotated; superseded reasoning is preserved inside D3 and D9 so the history reads straight.

## Type
backend | includes database-expert: **yes** (two new tables + two migrations + two seeders + bundled fixture)

**Confirmed decisions** (resolved across two Phase 1 Three Amigos rounds; re-verify at Phase 2). Each is recorded with its reasoning in [Documented functional decisions](#documented-functional-decisions):

- **A bundled ISO 639-1 fixture is the source of pickable languages** (**D3**, reversed by human decision). `database/data/iso-639-languages.json`, shaped and provenance-documented like the ISO 3166 country fixture.
- **The fixture is a validation/reference source — it is NOT pre-seeded as ~184 candidate rows** (**D14**). This is the round-2 fork, and the two experts split on it; resolved here with the alternative recorded, and raised for sign-off as **Q2**.
- **`AddStoreLanguage` takes only a code — the display name comes from the fixture** (**D15**), which makes `StoreLanguage` the first model in this repo with **zero** fillable columns.
- **UUID v7 primary key via `HasUuids`** — a business entity under ADR 0001 Amendment 1's stated policy (**D1**).
- **"Remove" means `is_active = false`, never a delete of any kind** (**D5**). Still the single most consequential decision in the story, and what lets the PRD's removal scenario succeed against a language that already holds translations.
- **Exactly one default, and the default must be active** — enforced in the actions under a row lock, **not** by a database constraint (**D6**).
- **At least one active language must always exist** (**D7**) — an invariant `sales_regions` never needed, because that catalog starts with ~254 rows and this one starts with **one**.
- **The "warns before affecting translations" scenario is honestly half-implemented**, behind a named extension point (`config/store-languages.php`) that stories 0070+ complete by appending one array literal (**D8**).
- **The Spanish bootstrap is a dedicated seeder composed into `ProductionSeeder`**, a **one-time bootstrap** rather than a repeatable resync, now reading the Spanish endonym from the fixture instead of hardcoding it (**D2**).

**Out of scope — owned by sibling stories.** Do not implement these here:

- The Store Languages settings screen — including **the picker UI itself** (a searchable select over the bundled list), the removal-confirmation warning copy, and the `config/modules.php` sidebar registry entry → **story 0069**.
- The translation mechanism — per-store-language translatable columns/tables, the editor language tabs, and the missing-translation fallback → **stories 0070 / 0072 / 0074 / 0076 / 0078**. This story creates the rows those stories point at, and nothing more.
- The admin UI language switcher (Layer 1, ES/EN only) → **stories 0066 / 0067**.
- The `store-languages.{view,create,edit,delete}` permissions **already exist** in [`RolePermissionSeeder::MODULES`](../../database/seeders/RolePermissionSeeder.php) from story 0002's catalog. Do **not** add a permission module, do **not** invent new permission strings, and do **not** change the catalog count.

## Gherkin

```gherkin
Feature: The Store Languages catalog

  # --- Initial state on a fresh install ---

  Scenario: A fresh installation has Spanish as the store default
    Given a platform operator with an empty store language catalog
    When they run the store language seeder
    Then Spanish is the only store language and it is flagged as the default

  Scenario: The seeded Spanish entry takes its name from the bundled list
    Given a platform operator with an empty store language catalog
    When they run the store language seeder
    Then the Spanish entry is named with the canonical name the bundled list carries

  Scenario: Re-running the seeder does not duplicate the Spanish entry
    Given a platform operator who has already run the store language seeder once
    When they run the store language seeder again
    Then the catalog still holds exactly one Spanish entry

  Scenario: Re-seeding preserves an administrator's chosen default
    Given a store administrator who has added French and made it the store default
    When a platform operator runs the store language seeder again
    Then French is still the store default, because the bootstrap only writes an empty catalog

  Scenario: A missing bundled list fails the deployment loudly
    Given a platform operator whose bundled language list is absent or malformed
    When they run the store language seeder
    Then the seed aborts with an actionable error rather than seeding an unnamed entry

  # --- Adding a language, by picking from the bundled list ---

  Scenario: Add a store language from the bundled list
    Given a store administrator with permission to create store languages
    When they pick French from the bundled language list
    Then French is stored as an active store language that is not the default

  Scenario: The added language takes its name from the bundled list
    Given a store administrator with permission to create store languages
    When they pick French from the bundled language list
    Then the stored entry carries the canonical name the bundled list holds for French

  Scenario: A language outside the bundled list is refused
    Given a store administrator with permission to create store languages
    When they submit a language code that is not in the bundled list
    Then the entry is refused with a validation error naming the code

  Scenario: Adding a language already active in the catalog is refused
    Given a store administrator whose catalog already holds French as an active language
    When they pick French from the bundled language list again
    Then the entry is refused because French is already an active store language

  Scenario: Picking a previously removed language reactivates its entry
    Given a store administrator whose catalog holds French as a removed language
    When they pick French from the bundled language list
    Then the existing French entry becomes active again rather than a duplicate being created

  # --- Changing the default ---

  Scenario: Change the store default language
    Given a store administrator, with French active as a store language
    When they set French as the store's default language
    Then French becomes the store default

  Scenario: Changing the default clears the previous one
    Given a store administrator whose store default is Spanish and who has French active
    When they set French as the store's default language
    Then Spanish is no longer flagged as the store default

  Scenario: A removed language cannot become the store default
    Given a store administrator whose catalog holds French as a removed language
    When they set French as the store's default language
    Then the change is refused because only an active language may be the default

  # --- Removing a language ---

  Scenario: Remove a non-default store language
    Given a store administrator, with French active and not the store default
    When they remove French as a store language
    Then French is no longer an active store language

  Scenario: Removing a language preserves its stored content
    Given a store administrator, with French active and holding existing translations
    When they remove French as a store language
    Then the French entry is deactivated and its stored translation rows are left intact

  Scenario: The current default language cannot be removed
    Given a store administrator whose store default is Spanish
    When they remove Spanish as a store language
    Then the removal is refused because the store default must be reassigned first

  Scenario: The last remaining active language cannot be removed
    Given a store administrator whose catalog holds exactly one active store language
    When they remove that store language
    Then the removal is refused because the store must always have an active language

  # --- Authorization ---

  Scenario Outline: An administrator without the matching permission is refused
    Given a store administrator holding no store language permissions
    When they attempt to <operation>
    Then the attempt is refused and the refusal is recorded in the audit trail

    Examples:
      | operation                         |
      | add a store language              |
      | remove a store language           |
      | change the store default language |

  Scenario: A Super Admin is permitted without holding any explicit permission
    Given a Super Admin who holds no store language permission rows
    When they pick a language from the bundled language list
    Then the language is added, because the Super Admin bypass grants every ability

  Scenario: A domain refusal binds a Super Admin exactly like anyone else
    Given a Super Admin whose catalog holds exactly one active store language
    When they remove that store language
    Then the removal is refused, because the invariant is about the data rather than the actor
```

```gherkin
Feature: The store's default dashboard and notification languages

  # --- Initial state ---

  Scenario: A fresh installation adopts the configured application language as both defaults
    Given a platform operator with no locale settings recorded
    When they run the locale settings seeder
    Then the default dashboard language and the default notification language
      both match the application's configured language

  Scenario: A configured application language outside the offered pair fails the seed loudly
    Given a platform operator whose application language is set to a language
      the dashboard does not offer
    When they run the locale settings seeder
    Then the seed aborts with an actionable error rather than silently choosing one

  Scenario: Re-seeding preserves an administrator's chosen defaults
    Given a store administrator who has set the default dashboard language to English
    When a platform operator runs the locale settings seeder again
    Then the default dashboard language is still English

  # --- Changing the defaults ---

  Scenario: Change the default dashboard language
    Given a store administrator with permission to edit store language settings
    When they set the default dashboard language to English
    Then English becomes the store's default dashboard language

  Scenario: Change the default notification language
    Given a store administrator with permission to edit store language settings
    When they set the default notification language to English
    Then English becomes the store's default notification language

  Scenario: The two defaults are independent of each other
    Given a store administrator whose default dashboard language is English
    When they set the default notification language to Spanish
    Then the default dashboard language remains English

  Scenario: A language outside the offered pair is refused
    Given a store administrator with permission to edit store language settings
    When they submit a default dashboard language that is not one of the two offered
    Then the change is refused with a validation error

  # --- What the dashboard default actually governs ---

  Scenario: A signed-out visitor sees the store's default dashboard language
    Given a store administrator has set the default dashboard language to English
    When a signed-out visitor opens the dashboard sign-in page
    Then the interface is shown in English

  Scenario: An administrator who never chose a language sees the store default
    Given a store administrator has set the default dashboard language to English
    When an administrator who has never chosen an interface language signs in
    Then the interface is shown in English

  Scenario: An administrator's own choice still overrides the store default
    Given a store administrator has set the default dashboard language to English
    When an administrator whose own interface language is Spanish signs in
    Then the interface is shown in Spanish

  Scenario: The content-authoring default is untouched by a dashboard default change
    Given a store administrator whose store content default is French
    When they set the default dashboard language to English
    Then French is still the store's default content-authoring language

  # --- Authorization ---

  Scenario Outline: An administrator without the matching permission is refused
    Given a store administrator holding no store language permissions
    When they attempt to <operation>
    Then the attempt is refused and the refusal is recorded in the audit trail

    Examples:
      | operation                              |
      | change the default dashboard language  |
      | change the default notification language |
```

## Files to create/modify

### Create

- **`database/data/iso-639-languages.json`** — the bundled reference list, one JSON object per line for reviewable diffs, matching `iso-3166-countries.json`'s convention exactly:

  ```json
  {"code": "es", "name_endonym": "Español", "name_en": "Spanish"}
  {"code": "fr", "name_endonym": "Français", "name_en": "French"}
  {"code": "ja", "name_endonym": "日本語", "name_en": "Japanese"}
  ```

  The complete ISO 639-1 alpha-2 set (~184 entries), **no regional variants** (D16). Codes are **lowercase in the fixture** — unlike the country fixture's uppercase `alpha2` — because ISO 639-1 codes are conventionally lowercase and this removes any fixture-to-column case transform. `name_endonym` is what gets written to `store_languages.name`; `name_en` is carried as forward insurance and search-assist exactly as `iso-3166-countries.json` carries its own `name_en`, and **no seeder or action writes it**. There is deliberately **no `name_es`** — see D16.

- **`database/migrations/<timestamp>_create_store_languages_table.php`** — the greenfield UUID `create_*` pattern from [`create_sales_regions_table`](../../database/migrations/2026_08_19_204256_create_sales_regions_table.php) and [`create_media_table`](../../database/migrations/2026_08_27_120000_create_media_table.php), which [migrations.md](../../docs/database/migrations.md#uuid-primary-keys) records as this repo's two real instances:

  ```php
  Schema::create('store_languages', function (Blueprint $table): void {
      $table->uuid('id')->primary();
      $table->string('code', 10)->unique();
      $table->string('name', 100);
      $table->boolean('is_default')->default(false);
      $table->boolean('is_active')->default(true);
      $table->timestamps();
  });
  ```

  No FK column exists in this table, so [the "an FK column does not also get an explicit index" rule](../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here) does not apply here — it applies to stories 0070+ when they add `store_language_id` to their own tables. `down()` is `Schema::dropIfExists('store_languages');`.

- **`app/Models/StoreLanguage.php`** — `use HasFactory, HasUuids;` and **`#[Fillable([])]`**, declared explicitly rather than left to Laravel's default so the intent is stated (D15). `casts()` returns `['is_default' => 'boolean', 'is_active' => 'boolean']`. Carries three helpers:
  - `public static function availableLanguages(): array` — `@return array<string, string>` mapping `code => name_endonym`, read from the bundled fixture with a shape guard that **throws** on a missing or malformed file, mirroring `SalesRegionSeeder::assertValidCountryFixture()`. This is the **single named reader** of the fixture, shared by the seeder and the validation trait (D17).
  - `public static function translationUsageCount(string $languageId): int` — the D8 extension point, advisory, returns `0` today.
  - `public function scopeActive(Builder $query): void`.
  No relations — nothing points out of this table this story.
- **`app/Policies/StoreLanguagePolicy.php`** — four abilities, four `public const` permission names (the [`MediaPolicy`](../../app/Policies/MediaPolicy.php) shape, not `SalesRegionPolicy`'s two-of-four, because unlike the fixed region catalog this one genuinely *is* admin-creatable and admin-removable, so every seeded verb has a real call site — see D14 for why that stays true under the chosen fork and would not under the rejected one).
- **`app/Concerns/StoreLanguageValidationRules.php`** — **one** method, `codeRules()`. `nameRules()` from the first draft is **deleted, not left dormant** (D15).
- **`app/Actions/StoreLanguages/AddStoreLanguage.php`** — the fifth `app/Actions/` area folder.
- **`app/Actions/StoreLanguages/RemoveStoreLanguage.php`**
- **`app/Actions/StoreLanguages/SetDefaultStoreLanguage.php`**
- **`app/Livewire/StoreLanguages/Index.php`** — component class with a **placeholder view**, matching what story 0017 shipped before 0018 replaced it. Gives 0069 a class and a resolving route to attach markup to.
- **`resources/views/livewire/store-languages.blade.php`** — the **flat** path, per the [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name). Story 0017 also had an `artisan make:` scaffold deposit an unused `livewire/sales-regions/index.blade.php` stub that broke nothing and simply sat there — **check for and delete a second file at the nested path**, do not only check that the flat one is right.
- **`routes/store-languages.php`** — one area file, `require`d from `web.php`, mirroring [`routes/sales-regions.php`](../../routes/sales-regions.php) including its `can:`-not-`permission:` inline comment and its aliased import (`use App\Livewire\StoreLanguages\Index as StoreLanguagesIndex;` — `Index` is now ambiguous across four areas).
- **`config/store-languages.php`** — the removal-guard extension point (D8). One key, `translation_relations`, shipped as an empty array. **The bundled language list does not live here** — a ~184-entry data fixture is not a registry entry (D17).
- **`database/seeders/StoreLanguageSeeder.php`** — the Spanish bootstrap (D2, D4), reading the endonym from the fixture.
- **`database/factories/StoreLanguageFactory.php`** — with an `inactive()` state and a `default()` state, so no test has to seed the catalog to arrange one row.
- **`lang/en/store-languages.php`** and **`lang/es/store-languages.php`** — key-for-key identical, holding only what the *actions* reference this story (`errors.*`, and an `attributes` block if the component validates). UI copy is 0069's.

### Create — the locale-settings half

- **`database/migrations/<timestamp>_create_locale_settings_table.php`**:

  ```php
  Schema::create('locale_settings', function (Blueprint $table): void {
      $table->tinyInteger('id')->unsigned()->primary();   // fixed literal 1, NOT auto-increment (D19, D20)
      $table->string('default_ui_locale', 5);             // NOT NULL, no DB default (D21)
      $table->string('default_notification_locale', 5);
      $table->timestamps();
  });
  ```

  **No `$table->id()`, no UUID, and no column default on either locale** — each is a decision, D19 and D21. No index beyond the primary key: the row is only ever fetched by its fixed key.

- **`app/Models/LocaleSetting.php`** — singular model over the plural table (Laravel's own convention arrives at `locale_settings` unaided, so unlike `Media` this needs **no** `#[Table]` attribute). `#[Fillable([])]`, **no `HasUuids`**, **no enum cast on either column** (D21 — this is the load-bearing one), `$incrementing = false` and `$keyType = 'int'` because the PK is a fixed literal rather than generated. Carries the singleton accessor and the two read accessors:

  ```php
  public const SINGLETON_ID = 1;

  public static function current(): self;                      // find(SINGLETON_ID), the one resolution path
  public static function defaultUiLocale(): UiLocale;
  public static function defaultNotificationLocale(): UiLocale;
  ```

- **`app/Policies/LocaleSettingPolicy.php`** — two abilities (`viewAny`, `update`), whose permission constants **reference `StoreLanguagePolicy`'s rather than restating the literals** (D25):

  ```php
  public const VIEW_PERMISSION = StoreLanguagePolicy::VIEW_PERMISSION;
  public const EDIT_PERMISSION = StoreLanguagePolicy::EDIT_PERMISSION;
  ```

- **`app/Concerns/LocaleSettingValidationRules.php`** — `defaultUiLocaleRules()` and `defaultNotificationLocaleRules()`, each `['required', 'string', Rule::enum(UiLocale::class)]`. A **new** trait, not a reuse of 0066's — see D26 and the ⚠️ below it.
- **`app/Actions/Localization/SetDefaultUiLocale.php`** — `__invoke(UiLocale $locale): LocaleSetting`.
- **`app/Actions/Localization/SetDefaultNotificationLocale.php`** — same shape. **A new `app/Actions/Localization/` area folder** (D24), not `StoreLanguages/`.
- **`database/seeders/LocaleSettingSeeder.php`** — the one-time bootstrap from `config('app.locale')`, failing loudly when that value is not a `UiLocale` case (D22).
- **`database/factories/LocaleSettingFactory.php`** — needed because the fixed PK means a test cannot just `create()` a second row; the factory must write `id => 1` and tests must `updateOrCreate` rather than `create` a duplicate.
- **`lang/en/localization.php`** / **`lang/es/localization.php`** — key-for-key identical; the `attributes` block for the two camelCase field names, plus any refusal copy. Separate from `store-languages.php` because the two are different domains sharing a screen.

### Modify — the locale-settings half

- **`database/seeders/DatabaseSeeder.php`** and **`database/seeders/ProductionSeeder.php`** — one `$this->call(LocaleSettingSeeder::class);` line each, beside `StoreLanguageSeeder`.

### Deliberately **not** modified by this story, and this is load-bearing

- **`app/Http/Middleware/SetUiLocale.php`**, **`app/Models/User.php`**, and everything else story **0066** owns. This story ships the accessor 0066's middleware *will* call; **rewiring that call is 0066's reconciliation, not this story's edit** — see **R-13**, which states the exact line and the two tests that must change. Doing it here would be an uncoordinated cross-story edit into a file another story is actively defining.

### Deliberately not touched (both halves)

- **`database/seeders/RolePermissionSeeder.php`** — `store-languages` is already module 9 of 10. The catalog stays at 42 permissions, `Administrator` at 41 of 42. Verified by reading the file: `Administrator` receives every permission except `roles.manage-administrators`, so it already holds all four `store-languages.*` verbs.
- **`config/modules.php`** and **`lang/*/navigation.php`** — the sidebar registry entry is 0069's, matching the 0017 → 0018 split. See **R-3**.
- **`config/app.php`** — `locale` and `fallback_locale` keep their values. They stop being the *primary* source of the dashboard default (D18) but remain the bootstrap seed and the last-resort fallback.
- **`database/data/`** — no fixture is added for the locale settings; `UiLocale` is the two-value source of truth (D18).

### Modify

- **`database/data/README.md`** — a new `## iso-639-languages.json` section stating provenance, the per-entry shape, what is deliberately excluded (regional variants, retired codes), and how to refresh the list — matching the depth of the section that file already carries for `iso-3166-countries.json`. It must also record the **new** fact that this fixture has a second reader outside `database/seeders/` (see R-11).
- **`routes/web.php`** — one `require __DIR__.'/store-languages.php';` line.
- **`database/seeders/DatabaseSeeder.php`** — `$this->call(StoreLanguageSeeder::class);` **unconditionally**, outside the `['local', 'testing']` fixture gate, beside `SalesRegionSeeder`.
- **`database/seeders/ProductionSeeder.php`** — the same call. That file's own comment already treats itself as the one place a required catalog is registered.

### Deliberately not touched

- **`database/seeders/RolePermissionSeeder.php`** — `store-languages` is already module 9 of 10. The catalog stays at 42 permissions, `Administrator` at 41 of 42. Verified by reading the file: `Administrator` receives every permission except `roles.manage-administrators`, so it already holds all four `store-languages.*` verbs.
- **`config/modules.php`** and **`lang/*/navigation.php`** — the sidebar registry entry is 0069's, matching the 0017 → 0018 split. See **R-3**.

## The public contract story 0069 consumes

Stated precisely so the frontend story needs no guessing. **`AddStoreLanguage`'s signature changed in round 2** — everything else is unchanged from the first draft.

```php
// App\Models\StoreLanguage
/**
 * @property string $id
 * @property string $code          // ISO 639-1 alpha-2, lowercase — e.g. "es", "fr"
 * @property string $name          // the fixture's endonym — e.g. "Español", "Français"
 * @property bool $is_default
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
public function scopeActive(Builder $query): void;

/** @return array<string, string>  code => endonym, read from the bundled fixture. Story 0069's picker renders this. */
public static function availableLanguages(): array;

/** D8 — advisory, returns 0 today. */
public static function translationUsageCount(string $languageId): int;
```

```php
// App\Policies\StoreLanguagePolicy
public const VIEW_PERMISSION   = 'store-languages.view';
public const CREATE_PERMISSION = 'store-languages.create';
public const EDIT_PERMISSION   = 'store-languages.edit';
public const DELETE_PERMISSION = 'store-languages.delete';

public function viewAny(User $actor): bool;
public function create(User $actor): bool;
public function update(User $actor, StoreLanguage $target): bool;   // the default swap
public function delete(User $actor, StoreLanguage $target): bool;   // remove / deactivate
```

```php
// App\Concerns\StoreLanguageValidationRules
protected function codeRules(): array;   // required + in(fixture codes) + unique among ACTIVE rows
```

| Action | Signature | Authorizes | Throws |
| --- | --- | --- | --- |
| `AddStoreLanguage` | `__invoke(string $code): StoreLanguage` | `create` on `StoreLanguage::class` | `AuthorizationException` (403); `ValidationException` keyed `code` when the code is not in the bundled list, or is already active |
| `RemoveStoreLanguage` | `__invoke(StoreLanguage $language): StoreLanguage` | `delete` on `$language` | `AuthorizationException` (403); `ValidationException` keyed `languageId` when the target is the default, or the last active language |
| `SetDefaultStoreLanguage` | `__invoke(StoreLanguage $language): StoreLanguage` | `update` on `$language` | `AuthorizationException` (403); `ValidationException` keyed `languageId` when the target is inactive |

`AddStoreLanguage` is a **find-or-create**, not a plain insert (D5): it looks the code up in any state, reactivates an inactive row (refreshing `name` from the fixture, so a corrected endonym reaches an already-deployed install), and inserts only when nothing matches. Both paths write with an explicit literal key list — `forceCreate([...])` / `forceFill([...])->save()` — the same shape `App\Actions\Media\StoreUploadedImage` and `SalesRegionSeeder::writeRegion()` use, and mandatory here because `#[Fillable([])]` means a plain `create()` would silently write nothing.

Each action returns the **refreshed** row it wrote, authorizes as its own first statement outside any transaction so a refusal never opens one ([the action-owns-the-rule convention](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)), and is resolved from the container, never `new`-ed, including in tests ([code-style.md](../../docs/conventions/code-style.md)).

Every `ValidationException` is keyed on a name the calling component must **declare as a real public property** — Livewire's `SupportValidation::dehydrate()` filters the persisted error bag through `Utils::hasProperty()`, so an error keyed on an undeclared name is silently dropped on the next round-trip. Story 0017 recorded this the hard way; 0069 inherits it.

### The locale-settings contract — what story 0066's reconciliation and story 0069 both consume

**This is the contract that matters most outside this story**, because story 0066's middleware is rewired against it (R-13). It is deliberately narrow: two static reads and two actions, with the table shape invisible to every caller.

```php
// App\Models\LocaleSetting — the ONLY sanctioned way to read either default
public static function defaultUiLocale(): UiLocale;
public static function defaultNotificationLocale(): UiLocale;
```

**Both return `UiLocale`, never `string`.** The middleware needs `->value` for `App::setLocale()` and pays one property access for it; every other caller wants the enum. Returning `string` would push the `tryFrom()` discipline back out to each call site, which is exactly what this accessor exists to centralise.

**The resolution chain inside each accessor, in order, and the middle step is the one that is easy to get fatally wrong:**

```php
UiLocale::tryFrom((string) $stored)                      // 1. the persisted admin choice
    ?? UiLocale::tryFrom((string) config('app.locale'))  // 2. bootstrap fallback — tryFrom, NEVER from
    ?? UiLocale::English;                                // 3. last resort, documented below
```

Step 2 **must** be `tryFrom()`. `config('app.locale')` is an arbitrary Laravel locale string with no guarantee of being a `UiLocale` case — a deployment setting `APP_LOCALE=fr` is entirely legal — and `UiLocale::from()` raises `\ValueError` on an unmapped value. That would 500 **every request in the application**, including every guest request, because this runs in globally-registered middleware. It is story 0066's own **D-5** hazard (`HasAttributes::getEnumCaseFromValue()` uses `from()`, not `tryFrom()`) reappearing one layer up, at the config boundary instead of the model-cast boundary, and both experts found it independently from different directions.

Step 3 is a deliberate, narrow exception to 0066's **D-6** ("no `UiLocale::default()`; the default lives in config alone"). It is reachable only when the settings row is missing *and* the configured locale is not offered — i.e. a broken install — and its job is to keep the app rendering rather than to be a default anyone relies on. It is **not** a `UiLocale::default()` method: the constant lives at the one call site that needs it, so nothing else can start reading it as a source of truth.

| Action | Signature | Authorizes | Throws |
| --- | --- | --- | --- |
| `SetDefaultUiLocale` | `__invoke(UiLocale $locale): LocaleSetting` | `update` on `LocaleSetting::class` | `AuthorizationException` (403) |
| `SetDefaultNotificationLocale` | `__invoke(UiLocale $locale): LocaleSetting` | `update` on `LocaleSetting::class` | `AuthorizationException` (403) |

**Two actions, not one taking both values** (D23). Each takes a `UiLocale` — already-validated by the enum type itself, so a forged string cannot reach the action at all — authorizes as its own first statement, `firstOrCreate`s the singleton row if the seeder has not run, writes with `forceFill()` (the columns are not fillable), and needs **no `DB::transaction()`**: one column, one row, no multi-row invariant. Both carry the full `LogRefusedPrivilegedAttempt` treatment, refusal and `Log::info` success line alike.

## Tests to perform

Feature and Unit only — **no browser tests** (no rendered screen this story).

### Happy path
- [ ] Feature: picking a fixture code persists a row that is active and not the default.
- [ ] Feature: the persisted row's `name` equals the fixture's endonym for that code — **not** anything the caller supplied, since the caller cannot supply one.
- [ ] Feature: setting an active, non-default language as default flags it and clears the previous default, both asserted on `fresh()`.
- [ ] Feature: removing an active, non-default language sets `is_active = false` and leaves the row present.
- [ ] Feature: removing a language leaves every other row's `is_active` / `is_default` untouched.
- [ ] Feature: picking a code matching an **inactive** existing row reactivates it — assert the row count is unchanged **and the id is the same**, which is what distinguishes a reactivation from a delete-and-reinsert.
- [ ] Feature: reactivating refreshes `name` from the fixture — arrange a row whose stored `name` differs from the fixture's, reactivate, assert the fixture value won.

### The bundled fixture
- [ ] Unit: `availableLanguages()` returns a non-empty `code => name` map including `es` and `fr`.
- [ ] Unit: every fixture code matches `/^[a-z]{2}$/` and is unique across the file — a shape assertion over the real bundled file, in the spirit of `SalesRegionSeeder`'s own fixture guard.
- [ ] Unit: every fixture entry carries all three keys, and no entry has an empty `name_endonym`.
- [ ] Unit: a malformed or absent fixture makes `availableLanguages()` **throw**, not return an empty array — the difference between failing loudly and silently validating every submission against nothing.

### Domain invariants (negative)
- [ ] Feature: removing the current default throws `ValidationException` and the row stays active.
- [ ] Feature: removing the last active language throws `ValidationException` and the row stays active.
- [ ] Feature: when a row is **both** the default and the last active language, exactly **one** refusal reason is logged, and it is the more specific one — not two.
- [ ] Feature: setting an inactive language as default throws `ValidationException` and the current default is unchanged.
- [ ] Feature: each of the three invariant refusals is bound for a **Super Admin actor** too — the invariant is about the data, not the actor ([a domain invariant is not an authorization rule](../../docs/architecture/authorization.md#a-domain-invariant-is-not-an-authorization-rule-and-does-not-live-here)).
- [ ] Feature: a `SetDefaultStoreLanguage` call against a row deleted between hydration and invocation raises `ModelNotFoundException` rather than silently succeeding.

### Validation
- [ ] Feature dataset: codes outside the bundled list are refused — `'zz'`, `'english'`, `'pt-BR'` (valid BCP 47, deliberately **not** in this fixture — see D16), `''`, `'123'`, a 40-character string. This is the only way a bad code now reaches the backend, so it is a tampered-request test, not a typo test.
- [ ] Feature: picking a code already held by an **active** row is refused by validation, not by a raw `QueryException`.
- [ ] Feature: `'FR'` is refused or normalised — pinning the `utf8mb4_unicode_ci` behaviour explicitly rather than leaving it undiscovered, the trap [schema.md](../../docs/database/schema.md) already records for `roles.name`. Assert the chosen behaviour, and assert it cannot produce a second row for the same language.

### Authorization
- [ ] Unit (`tests/Feature/Policies/StoreLanguagePolicyTest.php`): each of the four abilities, for an actor holding it, an actor holding a *different* `store-languages.*` permission, and an actor holding none — via `Gate::forUser()`.
- [ ] Unit: a **Super Admin holding zero `store-languages.*` rows** is allowed every ability, proving the `Gate::before` bypass.
- [ ] Feature: each action called **directly** (`app(AddStoreLanguage::class)('fr')`) by an actor lacking the permission throws `AuthorizationException` and writes nothing. This is the layer that proves the *action* authorizes independently of any caller — a policy test cannot show that, and an HTTP test cannot either.
- [ ] Feature: each action called with **no authenticated user** is refused.
- [ ] HTTP: `GET /settings/store-languages` — guest redirects to login; an actor without `store-languages.view` gets 403; a holder gets 200; a Super Admin holding zero permission rows gets 200.
- [ ] **Not written:** a `verified`-middleware refusal test. `App\Models\User` does not implement `MustVerifyEmail`, so `verified` refuses nobody in this app — [errors-log.md](../../docs/errors-log.md) records the story that wasted time proving this.

### Refusal logging
- [ ] Feature: each authorization refusal writes one `Log::warning('Privileged action refused', …)`, asserted against the **context array**, never the rendered message.
- [ ] Feature: each domain-invariant refusal logs a snake_case reason (`cannot_remove_default`, `cannot_remove_last_active_language`, `default_must_be_active`) distinct from any permission name, so an invariant refusal is not mistaken for an authorization decision.
- [ ] Feature: an **equivalence test** capturing a refusal from this area and one from an existing screen in a single `Log::spy()` session, set-equating their context key sets — step 4 of [the recipe](../../docs/architecture/authorization.md#copyable-what-a-third-admin-screen-inherits). Asserting this area's shape in isolation is what lets two conventions drift into existence.
- [ ] Feature: a **permitted** add/remove/set-default writes its single `Log::info` success line and **no** warning.
- [ ] Feature: the logged context carries no key matching `password` / `token` / `hash` / `session`.

### Seeder / bootstrap
- [ ] Feature: seeding an empty database creates exactly one row, Spanish, active and default.
- [ ] Feature: the seeded Spanish row's `name` comes from the fixture — assert it equals `availableLanguages()['es']` rather than a hardcoded `'Español'` literal, so the test cannot pass against a hardcoded seeder.
- [ ] Feature: seeding twice creates no duplicate and no second default.
- [ ] Feature: seeding after an administrator has added French and promoted it leaves French as the default and Spanish untouched (D2 — the bootstrap only writes an empty catalog).
- [ ] Feature: seeding with a missing/malformed fixture aborts loudly.
- [ ] Feature: `ProductionSeeder` reaches `StoreLanguageSeeder` — asserted by running `ProductionSeeder` and observing the row, so a missing `$this->call()` line fails loudly rather than shipping an empty catalog to production.
- [ ] **No ambient-config test is needed**, and this is a stated omission rather than an oversight: the seeder reads no config or env key, so there is no analogue of the `SUPER_ADMIN_EMAIL` hazard here. If Phase 3 introduces such a key, this test becomes mandatory.

### Invariant durability
- [ ] Feature: `SetDefaultStoreLanguage` never leaves the catalog with zero defaults or two — asserted across a forced mid-transaction failure, mirroring `SetDefaultSalesRegion`'s own test.
- [ ] Feature: a **caller-dirtied attribute** on the passed-in instance is not persisted — construct a `StoreLanguage`, dirty `name` in memory, pass it to `SetDefaultStoreLanguage`, and assert only `is_default` moved on `fresh()`. This is [model-instance-trust.md](../../docs/security/model-instance-trust.md)'s rule that `save()` writes the whole dirty set, not the `fill()` allow-list — and it matters *more* here than anywhere, because `#[Fillable([])]` makes it tempting to assume the model is unwritable.
- [ ] Feature: `RemoveStoreLanguage`'s active-count check reads rows **inside** its own locked transaction, not as a pre-flight query — asserted structurally, since a true two-connection race is a Phase 4 audit concern rather than something a Pest test can force.

### The extension point
- [ ] Feature: `translationUsageCount()` returns `0` against the shipped empty registry.
- [ ] Feature: with a temporary relation registered in `config/store-languages.php` pointing at a real table, `translationUsageCount()` returns the true row count. **This test is mandatory, not optional** — without it the helper is a negative assertion that passes because nothing exercises it, which is exactly the vacuous-coverage failure [errors-log.md](../../docs/errors-log.md) records for the `arch()` rule that shipped green while unable to fail.

### Locale settings — resolution (the highest-value block here)
- [ ] Unit: with a persisted row, `defaultUiLocale()` returns the stored case.
- [ ] Unit: with **no row at all**, `defaultUiLocale()` falls back to `config('app.locale')` mapped through `UiLocale`.
- [ ] Unit: with no row **and** `config(['app.locale' => 'fr'])`, `defaultUiLocale()` returns `UiLocale::English` and **does not throw**. *Risk if missing:* this is the assertion standing between the app and a 500 on every request including guests — the `from()`/`tryFrom()` hazard the contract section describes. It cannot be inferred from any other test here.
- [ ] Unit: with a **stored value outside the enum** (written with `DB::table()->update()` to bypass the model), `defaultUiLocale()` falls through to the config tier rather than throwing — the same hazard from the persistence side, and the reason neither column is enum-cast.
- [ ] Unit: `defaultNotificationLocale()` repeats all four cases independently — it must not read the other column.
- [ ] Feature: both accessors return `UiLocale` instances, not strings — pinned because the middleware's `->value` call site and 0069's select both depend on the type.

### Locale settings — writes
- [ ] Feature: setting the default dashboard language persists it and leaves `default_notification_locale` untouched, and vice versa.
- [ ] Feature: either action against an **empty table** creates the singleton row rather than failing.
- [ ] Feature: neither action ever creates a second row — assert `LocaleSetting::count() === 1` after a write on an empty table and after a write on a populated one.
- [ ] Feature: a `PATCH`-style forged locale cannot reach the action, because the parameter is typed `UiLocale`; the equivalent test at the **component** boundary (a forged string in a Livewire payload) is 0069's, and this story states so rather than half-covering it.
- [ ] Feature: a caller-dirtied attribute on a fetched `LocaleSetting` is not persisted by either action — the same `save()`-writes-the-whole-dirty-set rule as `store_languages`.

### Locale settings — authorization and logging
- [ ] Unit (`tests/Feature/Policies/LocaleSettingPolicyTest.php`): `viewAny` / `update` for a holder of `store-languages.view` / `.edit`, a holder of the *other* one, a holder of neither, and a **Super Admin holding zero rows**.
- [ ] Feature: **the borrowed-permission binding is pinned deliberately** — a role granted exactly `store-languages.edit` can change both defaults, and a role granted `store-languages.view` alone cannot. *Risk if missing:* D25's constant-aliasing is invisible at runtime, so nothing else would catch `LocaleSettingPolicy` silently drifting to a different permission.
- [ ] Feature: each action's refusal writes one `Log::warning` whose context keys set-equal an existing screen's, and a permitted write logs its `Log::info` success line and no warning.

### Locale settings — seeder
- [ ] Feature: seeding an empty database creates exactly one row, both columns matching `config('app.locale')`.
- [ ] Feature: seeding with `config(['app.locale' => 'fr'])` **throws**, and writes no row — the fail-loud rule, asserted rather than assumed.
- [ ] Feature: seeding twice creates no second row.
- [ ] Feature: seeding after an administrator has changed either default leaves both untouched.
- [ ] Feature: `ProductionSeeder` reaches `LocaleSettingSeeder`.
- [ ] **This block sets `app.locale` explicitly in every case**, per the [ambient-config rule](../../docs/errors-log.md#a-test-asserted-against-a-fixture-address-that-the-local-env-also-pointed-super_admin_email-at--2026-08-12): a test that depends on a config key must set it, including setting it to the value it assumes. Unlike the `store_languages` seeder (which reads no config), this seeder branches on one, so the hazard is live here.

### Locale settings — deliberately NOT tested in this story
- [ ] **The middleware's actual fallback behaviour** (a guest request rendering in the configured default). That assertion belongs to story 0066's `tests/Feature/Localization/UiLocaleResolutionTest.php`, which must be **rewritten** rather than extended — see **R-13**. Writing it here would duplicate a test whose home file is another story's, and would pass against 0066's *current* `config()` fallback for the wrong reason, hiding the very rewiring it appears to verify.
- [ ] **Anything about `preferredLocale()` / notification language rendering.** ⚠️ **Correction, 2026-08-29:** this was written as "no consumer exists (D26)" — that is now false. Story 0066's R-2 was resolved (implement now) and its D-14 ships `User::preferredLocale()` consuming `LocaleSetting::defaultNotificationLocale()`. The consumer's own test (`tests/Feature/Localization/PreferredLocaleTest.php`) lives in **0066**, not here — this story still tests nothing about notification rendering, but because that coverage belongs to the class that reads the setting, not because nothing reads it.

## Expected outcome

A fresh `migrate --seed` leaves a `store_languages` table holding exactly one row — Spanish, active, default, named from the bundled fixture. An administrator holding the matching `store-languages.*` permission can add a language **by picking a code from the bundled ISO 639-1 list**, change the default, and remove a language, through three container-resolved actions that each authorize themselves, enforce the catalog's invariants under a row lock, and log both successes and refusals in the shape the other three admin screens already use. A code outside the bundled list cannot enter the catalog by any path. `GET /settings/store-languages` resolves and is gated by `can:store-languages.view`, rendering a placeholder until story 0069 replaces the view. Nothing about translations exists yet, and the one place a later story must touch to complete the removal warning is a single array in `config/store-languages.php`.

## Acceptance criteria

- [ ] `store_languages` exists with a UUIDv7 primary key, a unique `code`, a `name`, `is_default`, `is_active`, and timestamps; `php artisan db:table store_languages` reports exactly two indexes (`primary`, `store_languages_code_unique`).
- [ ] `database/data/iso-639-languages.json` ships the complete ISO 639-1 alpha-2 set, one object per line, with `code` / `name_endonym` / `name_en` on every entry, and `database/data/README.md` documents its provenance, shape, exclusions and refresh procedure.
- [ ] A fresh install has Spanish as the one store language and the store default, named from the fixture rather than a hardcoded literal.
- [ ] Re-running the seeder neither duplicates the Spanish row nor overrides an administrator's chosen default.
- [ ] A missing or malformed fixture aborts the seed loudly and makes `availableLanguages()` throw.
- [ ] An administrator can add a store language by submitting a code **present in the bundled list**; the stored display name comes from the fixture, and no caller can supply one.
- [ ] A code outside the bundled list is refused by validation on every path.
- [ ] Adding a code already held by an active row is refused; adding a code held by an **inactive** row reactivates that row in place, keeping its id.
- [ ] An administrator can mark any **active** store language as the store default, and doing so clears the previous default in the same transaction.
- [ ] An inactive store language can never become the default.
- [ ] Removing a store language deactivates it and leaves its row — and therefore any content later keyed to it — physically intact.
- [ ] The current default cannot be removed, and the last active language cannot be removed; both refusals bind a Super Admin identically.
- [ ] All three actions authorize themselves against `StoreLanguagePolicy` before any write, so a queued job or Artisan caller inherits the same rule.
- [ ] Every refusal — authorization and invariant alike — writes one `Log::warning` whose context keys set-equal an existing admin screen's.
- [ ] `GET /settings/store-languages` is gated with `can:store-languages.view` and refuses without naming the permission.
- [ ] `config/store-languages.php` ships with an empty `translation_relations` registry, survives `php artisan config:cache`, and contains no closures.
- [ ] The permission catalog is unchanged: still 42 permissions, `Administrator` still holding 41.
- [ ] `lang/en/store-languages.php` and `lang/es/store-languages.php` are key-for-key identical, as are the two `localization.php` files.
- [ ] `locale_settings` exists with a fixed `TINYINT UNSIGNED` primary key, two `VARCHAR(5)` `NOT NULL` locale columns and timestamps; `php artisan db:table locale_settings` reports exactly one index (`primary`).
- [ ] A fresh install has exactly one `locale_settings` row, both defaults matching `config('app.locale')` mapped through `UiLocale`; an `app.locale` outside the offered pair aborts the seed loudly.
- [ ] Re-running the seeder never overwrites an administrator's chosen defaults and never creates a second row.
- [ ] An administrator holding `store-languages.edit` can set each default independently, and neither write disturbs the other column or the `store_languages` catalog.
- [ ] `LocaleSetting::defaultUiLocale()` and `defaultNotificationLocale()` return a `UiLocale`, resolve through `tryFrom()` at **both** the persisted and the config tier, and never throw — including when the stored value is outside the enum and when `config('app.locale')` is.
- [ ] Neither locale column is enum-cast on the model, and neither is mass-assignable.
- [ ] Both locale-settings actions authorize themselves before writing and log refusals in the shape the other admin screens use.
- [ ] `config/app.php`, `app/Http/Middleware/SetUiLocale.php` and `app/Models/User.php` are **unchanged by this story** — the middleware rewiring is story 0066's reconciliation (R-13).

## Definition of Done
- [ ] Tests written and green (full suite unscoped, not `--filter`)
- [ ] `vendor/bin/pint --format agent` run **unscoped**, not `--dirty`
- [ ] **Larastan level 7 run and recorded** — named explicitly because [errors-log.md](../../docs/errors-log.md) records three consecutive stories whose verification notes listed two of the three gates and were read as records of all three
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper) — at minimum `docs/database/schema.md` (**two** new domain tables, one of which is this repo's first singleton), `docs/database/migrations.md` (the third greenfield UUID instance, **and** the first non-UUID new table since the policy was written — worth stating so it does not read as an oversight), `docs/api/routes.md` (the fourth permission-gated route), `docs/architecture/authorization.md` (the **fifth and sixth** policies, plus the widened meaning of `store-languages.edit` per R-15), `docs/conventions/base-standards.md` (the fifth **and sixth** `app/Actions/` areas; the second app-owned config file; **and the `database/data/` paragraph, whose "read by something in `database/seeders/`" sentence this story falsifies** — see R-11), and `docs/decisions/0001-uuid-primary-keys.md` (a second named exception — backlog item 8)
- [ ] ⚠️ **Superseded, 2026-08-29 — do not check this box off as written.** It originally said `default_notification_locale` has **no consumer** until story 0066's R-2 is answered. R-2 has since been answered (implement now) and 0066's D-14 ships `User::preferredLocale()` consuming this setting. The real remaining item is narrower: confirm at Phase 2/3 that 0066's file (not this one) actually landed that reconciliation before treating "notification emails follow the configured language" as delivered — this story still delivers only the setting, not the consumer, but the consumer is no longer hypothetical.
- [ ] **Recorded as a handoff, not done here:** story 0066 needs the six-item reconciliation in **R-13**, including two tests that keep passing for the wrong reason. This story edits no 0066-owned file.
- [ ] Acceptance criteria met

## Documented functional decisions

**D1 — UUID v7 primary key via `HasUuids`.** [ADR 0001 Amendment 1](../../docs/decisions/0001-uuid-primary-keys.md#amendment-1-2026-08-27--the-scope-is-the-policy-not-the-list-of-seven) states the policy rather than an enumeration: every new business entity is UUIDv7, with **one named exception** for a high-volume internal geography lookup table. `store_languages` is not that exception — it is a small, admin-facing, first-class catalog, the same shape as `sales_regions` and `media`. Unlike `sales_regions`, whose key the amendment records as *consistency-driven* because a fixed country catalog has nothing to enumerate, the ADR's **stated** rationale genuinely applies here: these ids are interpolated into Blade and passed as `wire:click` arguments across story 0069's language tabs, exactly the `media` case. The downstream cost was weighed and accepted: stories 0070+ will carry a `CHAR(36)` FK on potentially high-cardinality translation tables, which is more storage than a `bigint` — but that is the trade-off already accepted for every domain relationship in this app, and a mixed-PK domain is worse than an over-provisioned key.

**D2 — The Spanish default is a dedicated seeder, and it is a one-time bootstrap rather than a repeatable resync.** `StoreLanguageSeeder` follows the [`SalesRegionSeeder`](../../database/seeders/SalesRegionSeeder.php) "required application data" precedent — called unconditionally from `DatabaseSeeder` *outside* the `['local', 'testing']` fixture gate, and composed into `ProductionSeeder` so a production runbook names one class forever. **But its body is deliberately shaped differently.** `SalesRegionSeeder` refreshes ~254 seeder-owned rows on every deploy and self-heals a missing default, because it owns that catalog permanently. This table is owned by the seeder only until the first row exists; after that it is entirely administrator-managed. So the seeder is `if (StoreLanguage::query()->doesntExist()) { … }` — closer to the Super Admin bootstrap than to a catalog resync. **A repeatable "repair the default" branch would be a defect here, not a feature:** it would fight an administrator who has deliberately made French the default, on every deploy, silently. *Rejected:* a **migration-created** row — no migration in this repo writes required business data, and migrations are forward-only by convention here. *Rejected:* a **first-run action** — no precedent anywhere in this app for day-one data created at request time, and it adds a race under concurrent first requests plus a stray query on every `mount()`. **Round-2 addition:** the bootstrap now resolves the Spanish name from the fixture (`availableLanguages()['es']`) instead of hardcoding `'Español'`, with a loud failure if the `es` entry is absent — the same instinct `SalesRegionSeeder` applies by reading `name_es` for Spain rather than hardcoding it. D2's shape is otherwise **unchanged**, which is one of the two reasons D14 landed the way it did.

**D3 — ~~There is no bundled reference fixture; `code` is admin-typed and format-validated.~~ REVERSED 2026-08-28 by human decision.** Administrators add a store language by **picking from a bundled ISO 639-1 list** at `database/data/iso-639-languages.json`, following the `iso-3166-countries.json` precedent. *Original reasoning, preserved because two of its four arguments were sound and are now simply outweighed:* the PRD's asymmetry is real ([assumption 6](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) says the region catalog is *"fixed/seeded, not admin-creatable"* while Epic 5 says *"add/remove a language"* and carries no equivalent sentence); `database/data/`'s stated admission test is *"data a seeder reads"* and a validation reference stretches it (**this concern survives the reversal and is now recorded as R-11**); a fixture pre-empts a 0069 UX decision; and downstream keys on `id`, not `code`. *What the reversal buys, and why it is the better call:* a closed list makes an invalid or nonsense language **structurally unreachable** rather than merely discouraged, it removes the possibility of two administrators entering `fr`/`fre`/`fra` for the same language, and it gives 0069 a real picker to render instead of a free-text field it would have had to validate client-side anyway. The one argument that does *not* survive is the UX-pre-emption one: a bundled list constrains the *values*, not the widget, and 0069 remains free to render it as a searchable select, a grouped list, or a typeahead.

**D4 — Spanish only is seeded; English is not.** The PRD's acceptance criterion is unambiguous — *"on install the store default is Spanish"* — and Epic 5's prose says the same. The one sentence that reads otherwise, *"Given a store administrator, with store languages Spanish and English"*, is a scenario **precondition**: a `Given` arranges the state that scenario needs, it does not assert what a fresh install ships with. Reading an arranged fixture as an install requirement would also contradict the criterion two paragraphs above it. Seeding English as well is a one-line change if the product owner disagrees; seeding it wrongly is a row an administrator must then hunt down and remove.

**D5 — "Remove" means `is_active = false`. Not a hard delete, and not `SoftDeletes`.** The PRD settles this more firmly than it first appears. The removal scenario runs against *"French active and holding existing translations"* and shows the removal **succeeding** after a warning. A hard delete cannot satisfy that: it would need either `cascadeOnDelete()` on every future translation FK — silent, irreversible mass deletion, the precise opposite of *"warned before any French translation content is affected"* — or `restrictOnDelete()`, which makes removal **impossible** the moment any translation exists, contradicting the scenario outright. *Rejected:* `SoftDeletes` — `App\Models\User` is the only model in this codebase using it, and the structurally identical sibling catalog rejected it in as many words: [schema.md](../../docs/database/schema.md#sales_regions) records *"No `SoftDeletes`, deliberately. `is_active` **is** the soft state."* Introducing a second soft-delete mechanism for the same problem shape would be a new undocumented convention with no reason to diverge. Two consequences: **re-adding a removed language reactivates its existing row** (which is why `AddStoreLanguage` is a find-or-create and must look up by byte-exact `code` in *any* state before inserting), and **stories 0070+ never depend on an `onDelete` clause firing**, because the row is never deleted. Round 2 verified this decision is unaffected by the fixture change under D14's chosen fork; it would have been reshaped under the rejected one. See **R-2** for the one thing this design does not provide.

**D6 — Exactly one default, and the default must be active — enforced in the actions, not by the database.** `sales_regions` faces the identical invariant and [schema.md](../../docs/database/schema.md#indexes--one-present-by-choice-one-by-requirement-four-omitted) records the enforcement question as already decided: MySQL 8.4 has no partial index, and the `STORED` generated column + `UNIQUE` that would work *"would force the 'clear old, set new' update into a strict ordering"*. That cost is unchanged here while the benefit is **smaller** — a handful of rows rather than 254. So `SetDefaultStoreLanguage` copies [`SetDefaultSalesRegion`](../../app/Actions/SalesRegions/SetDefaultSalesRegion.php)'s **post-re-audit** shape, not its original one: a single primary-key-ordered `lockForUpdate()` query covering both the promotion target and every currently-default row, inside one `DB::transaction(…, attempts: 3)`, with every read and write performed against the re-fetched rows and never against the caller's instance. The clear-before-set ordering is kept so the deferred database backstop stays compatible if a later story adds it.

**D7 — A second invariant `sales_regions` never needed: at least one active language must always exist.** The region catalog seeds ~254 rows, so "the administrator deactivates the last one" was never a reachable state; this catalog seeds **one**, so it is reachable on day one. Without the guard, an administrator can empty the catalog and leave the Product and Blog editors with no language tab at all and no default to fall back to — the PRD's own fallback rule (*"a missing translation falls back to the default store language"*) has no defined behaviour with zero languages. Like D6 this is a **domain invariant, not an authorization rule** ([authorization.md](../../docs/architecture/authorization.md#a-domain-invariant-is-not-an-authorization-rule-and-does-not-live-here)): it lives inside the action under the row lock, refuses with a `ValidationException` rather than a 403, and binds a Super Admin exactly like anyone else — the catalog does not care who asked. **Note this invariant is what makes D14's chosen fork coherent**: under pre-seeding, "active languages" and "rows" stop being the same population and the guard would have to be re-expressed.

**D8 — The removal warning is honestly half-implemented, behind a declarative registry stories 0070+ extend by appending data.** The PRD scenario *"Removing a store language warns before affecting translations"* cannot be fully satisfied by this story, because no translatable content table exists. Pretending otherwise would ship a warning that is structurally always silent. Instead: `config/store-languages.php` holds `translation_relations`, an array of `{table, column}` pairs shipped **empty**, and `StoreLanguage::translationUsageCount(string $languageId): int` sums `DB::table($table)->where($column, $languageId)->count()` across it. **The count is advisory, never blocking** — the PRD says *warned*, not *prevented*, and the two hard refusals (D6, D7) are separate and unconditional. Story 0069 calls the helper to render the confirmation copy. **What a story-0070 author must do to complete it: append one array literal, and nothing else** — no edit to `RemoveStoreLanguage`, to the model, or to any component. This is the *"a registry a later story extends by appending data, never behavior"* property [base-standards.md](../../docs/conventions/base-standards.md#an-app-owned-config-file-is-a-registry-and-must-survive-configcache) established for `config/modules.php` and task 0018 verified against a real diff; the same two hard constraints bind here — **no closures anywhere** (`config:cache` serialises with `var_export()`), and a `config:cache` run as an actual assertion rather than a review promise. *Rejected:* **a dispatched event with a veto listener** — this codebase implements no domain guard via events, so it is workable but unprecedented and untested here. *Rejected:* **an interface each translatable model implements** — heavier than an array, in a repo with no `Contracts/` folder, for the same result. *Rejected:* **a documented convention with no code** — the discipline-only rule is exactly the failure mode this project's errors log repeatedly records, and a registry is mechanically checkable where a convention is not.

**D9 — ~~`code` accepts an optional region subtag (`pt-BR`), not bare ISO 639-1 only.~~ SUPERSEDED 2026-08-28 by D3's reversal and D16.** *Original reasoning:* free-typing made every future need a validation-only change with no accompanying data, so permitting a region subtag up front avoided a coupled validation-and-data migration the first time `pt-BR` and `pt-PT` had to coexist. **That hedge no longer earns its keep**: once the administrator picks from a curated list, the list itself **is** the data half of that change, so widening it later is exactly the reviewable-JSON-diff operation `iso-3166-countries.json`'s own "Refreshing the list" section already describes. There is no longer a "validation says yes but no data backs it" gap for D9 to guard against. The permissive `/^[a-z]{2,3}(-[A-Z]{2})?$/` regex is dropped from live validation entirely — fixture membership implies correct format, provided the fixture is shape-guarded at load (D17). The column stays `VARCHAR(10)`: there is no reason to shrink it, and the headroom costs nothing if D16 is ever revisited.

**D10 — Removing the current default is refused outright; it does not accept an inline replacement.** [`SetSalesRegionActive`](../../app/Actions/SalesRegions/SetSalesRegionActive.php) takes a `$replacementDefault` parameter so one click can deactivate the default and promote a successor atomically. That shape is deliberately **not** copied: the PRD shows no combined remove-and-reassign flow, the story's scope names three independent actions, and a three-argument removal is a wider contract for 0069 to bind to than it needs. Story 0069's confirmation dialog calls `SetDefaultStoreLanguage` and then `RemoveStoreLanguage`. *The accepted cost:* those are two transactions rather than one, so a failure between them leaves the default moved but the old language still active — a benign, self-correcting state (the administrator retries the removal), unlike the reverse ordering, which would be the forbidden state. **If 0069's UX wants one atomic click, this is a contract change to make now rather than retrofit** — see **R-4**.

**D11 — No `sort_order` column.** `sales_regions` carries one because Spain's five fiscal territories have a fixed government order that is neither alphabetical nor recoverable from any other column. Nothing here has that property: a deterministic order — the default first, then by `name` — needs no column and no writer. Adding an unused column would also contradict the instinct [`SalesRegionPolicy`](../../app/Policies/SalesRegionPolicy.php) records for abilities (*"Defining abilities nothing calls would add untested surface"*). It is cheap and additive to add later if 0069 wants drag-to-reorder tabs. Re-examined in round 2 and unchanged — a curated code list has no bearing on ordering. See **R-5**.

**D12 — `is_active` defaults to `true`, diverging from `sales_regions.is_active`'s `false`.** The divergence is deliberate rather than an oversight, and the reason is that the two defaults describe different insert paths. `sales_regions` defaults to `false` because its seeder inserts ~248 rows that should *not* be live; every row in this table is inserted one at a time, either by the Spanish bootstrap or by an administrator who has just picked it, and every one of those wants to be immediately usable. Copying `false` here would be copying an artifact of the other table's seeder rather than a convention. The column default is belt-and-braces regardless — `is_active` is not fillable, so both writers set it explicitly. **This rationale is only true under D14's chosen fork**; under pre-seeding it would be false for 183 of 184 rows and the default would flip to `false`.

**D13 — No step-up (recently-confirmed-password) requirement on these actions.** [Step-up](../../docs/architecture/authorization.md#step-up-authentication--the-third-layer) exists for operations where a hijacked session is the threat — another user's role, status or email, a deletion, an Administrator-tier creation. Managing which languages content is authored in is not identity-sensitive, nothing in Epic 5 asks for it, and every effect here is reversible by an administrator. Recorded so a later reader meets a decision rather than a silence.

**D14 — The bundled list is a validation/reference source; its entries are NOT pre-seeded as candidate rows. (Round 2, and the round's real fork — the two experts disagreed.)** With a curated list in hand there are two coherent designs. **(a) Pre-seed all ~184 entries as inactive rows**, mirroring how `SalesRegionSeeder` pre-seeds ~248 inactive countries; "adding French" becomes flipping `is_active` on a row that already exists. **(b) Insert nothing until the administrator picks**; the fixture only decides which codes are *allowed*. **Chosen: (b).** Four reasons, in order of weight. **(i) It is the only option under which `is_active = false` has one meaning.** Under (a) an inactive row means both *"a candidate nobody has ever chosen"* and *"a language an administrator deliberately removed, which may still hold translations"* — indistinguishably. Those two need different treatment in exactly the place this story cares most about, D8's removal warning and 0069's screen, and separating them would need a third state (a `removed_at` column) that this story would then owe an explanation for. Under (b) the distinction is structural and free: a candidate is a fixture entry with no row; a removed language is a row with `is_active = false`. **(ii) It preserves D2, D5, D7 and D12 as written.** Option (a) forces D2 from a one-time bootstrap into a `sales_regions`-style two-tier seeder-owned/administrator-configurable column split — a real rewrite, not a corollary — and falsifies D12's stated rationale for 183 of 184 rows. **(iii) The permission verb stays honest.** Under (a), `AddStoreLanguage` never inserts anything, so gating it on `store-languages.create` would stretch that verb to cover an `UPDATE`; the coherent choice there is `store-languages.edit`, leaving `create` permanently dormant the way `sales-regions.create` is. Under (b), `create` means what it says. **(iv) The table stays proportional to reality** — a handful of rows for a real store rather than 184 speculative ones. *The cost of (b), stated plainly:* the fixture acquires a reader outside `database/seeders/`, which is a genuine new cross-boundary dependency — see **R-11**, and note the mitigation in D17 that keeps a seeder among its readers. **Override to (a) only if the product owner wants 0069's screen to be a Sales-Regions-shaped list of all candidates with inline toggles** — that is a legitimate UX preference, but it is a *screen* decision that should be made deliberately at 0069's Phase 1 rather than inherited silently from this backend story. Raised as **Q2**.

**D15 — `AddStoreLanguage` takes a code and nothing else; the display name comes from the fixture.** With a picker there is no independent "what should this language be called" input for a human to type, so accepting a `$name` parameter would reopen exactly the drift the closed list exists to prevent: an administrator could pick `fr` and submit the name `"Spanish"`, and nothing would catch it. *Rejected:* `__invoke(string $code, ?string $nameOverride = null)` — same drift, plus scope creep, since nothing in Epic 5 asks for store-specific display names; if that need appears it is a distinct `RenameStoreLanguage` action with its own decision, not a silent widening of this one. *Rejected:* keeping both parameters — no picker UI renders a text field beside the picker, so `$name` would have no honest caller. **Two consequences worth stating.** `App\Models\StoreLanguage` declares **`#[Fillable([])]`** — zero of five columns mass-assignable, the most lopsided case in this repo, past `Media`'s two-of-nine — because under the omission convention's real test (*"could a form legitimately supply this value at all"*) neither a picked closed-list code nor a fixture-derived name qualifies. The attribute is declared explicitly rather than left to Laravel's guarded-by-default behaviour, so the intent is stated rather than inherited. And `nameRules()` is **deleted, not left dormant** — an uncalled validation method is the vacuous surface this project's own errors log flags, and leaving it would earn a Phase 5 finding.

**D16 — The fixture is bare ISO 639-1, ~184 entries, with no regional variants.** The country fixture's central property is that it is the **complete, unedited enumeration of a standard** — every ISO 3166-1 entry, no curatorial judgement. A list mixing bare language codes with a hand-picked subset of regional variants (`pt-BR`, `zh-Hans`, `en-GB`…) breaks that property, and there is no defensible, reviewable selection principle for *"these five languages get regional splits and the other 179 do not"* that is not a product decision wearing an engineering costume. So the fixture ships the complete ISO 639-1 set and nothing else, and the first genuine need for `pt-BR`/`pt-PT` is its own small fixture-amendment story — two lines of reviewable JSON, exactly the growth path `iso-3166-countries.json`'s "Refreshing the list" section already documents. Raised as **Q3** because it is a product question in substance even though the reasoning is structural.

**D17 — One named fixture reader, shared by the seeder and the validator; no cache, and not in `config/`.** `StoreLanguage::availableLanguages()` is the single place the JSON is parsed, with a shape guard that throws on a missing or malformed file — the same defensive posture `SalesRegionSeeder::assertValidCountryFixture()` takes, and for the same reason: a fixture that silently reads as empty would validate *every* submission against nothing, failing open on the exact control this redesign exists to add. Two callers share it: `StoreLanguageSeeder` (for the Spanish endonym) and `StoreLanguageValidationRules::codeRules()`. **Keeping the seeder among its readers is deliberate** — it is what keeps [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)'s *"read by something in `database/seeders/`"* test literally satisfied rather than merely argued around, and it removes a hardcoded `'Español'` at the same time. *Rejected:* a bare `Rule::in(...)` built inline in the trait — it works, but duplicates the parse-and-guard the seeder also needs, and is untestable apart from a request. *Rejected:* a custom `ValidationRule` class — the more framework-idiomatic answer, but this repo has no precedent for one, and the membership check and the already-active check compose more clearly as two array entries than merged into one rule's internals. *Rejected:* caching the parsed fixture — `SalesRegionSeeder` reads a *larger* fixture with a plain `file_get_contents()` and no cache; this one is read on a rare admin action, and routing a deploy-immutable file through a shared cache store buys an invalidation problem for no measurable gain, which is the shape [security/authorization-patterns.md](../../docs/security/authorization-patterns.md)'s permission-cache lessons already warn about. *Rejected:* putting the list in `config/store-languages.php` — that file is a closure-free **registry** under the app-owned-config convention, and a ~184-entry data fixture is not a registry entry.

**D18 — The two defaults live in their own singleton table, not in `store_languages`, not in a generic settings table, and not in a runtime-written config file.** Reusing `store_languages` is the one option that must be rejected outright rather than merely weighed: it is a different value domain (`UiLocale`'s two cases versus any ISO 639-1 language), a different cardinality (exactly one settings row versus a list), and a different **layer** — it would collapse [PRD assumption 14](../../docs/PRD/PRD.md#assumptions--confirmed-decisions)'s two independent i18n layers into one table, which is precisely the conflation 0066's own **D-1** named its column `ui_locale` to prevent. *Rejected:* a **generic `settings` key/value table** — no precedent in this repo, nothing in the PRD asks for a general settings system, and it discards typing entirely (every value becomes an untyped string with app-level coercion, fighting the `Rule::enum()` discipline 0066 established); inventing one for two values is the "invent a requirement" failure [contracts.md](../../docs/contracts.md) guards against. *Rejected:* **writing to a config file at runtime** — `config/` here is deploy-time, git-committed registries ([base-standards.md](../../docs/conventions/base-standards.md#an-app-owned-config-file-is-a-registry-and-must-survive-configcache)), extended by a *story* appending data, never by an administrator mutating it from a web request; it would also reintroduce the exact `config:cache`/`var_export()` fragility that rule exists to avoid. **`config('app.locale')` keeps two narrower jobs** — the seed source, and the last-resort fallback below the persisted row — but stops being the primary answer to "what language does the dashboard default to". That is a **reversal of scope for 0066's D-6**, not of its reasoning; see **R-13**.

**D19 — A fixed `TINYINT UNSIGNED` primary key with the literal value `1`, deliberately not UUIDv7.** [ADR 0001 Amendment 1](../../docs/decisions/0001-uuid-primary-keys.md#amendment-1-2026-08-27--the-scope-is-the-policy-not-the-list-of-seven) states the policy as "every new **business entity** is UUIDv7", and the two properties that policy reasons about — enumeration safety, and ids interpolated into Blade across a *list* — both require more than one row to exist. There is never a second `locale_settings` row to enumerate toward and nothing ever routes to or `wire:click`s its id. Applying UUID here for consistency would add a 36-byte key whose only purpose is to be looked up by a hardcoded constant, which a fixed `id = 1` gives for free. **This needs recording as a second named exception to Amendment 1** — the first being the high-volume geography lookup table, and this one for the opposite reason (a singleton rather than a high-cardinality table). That is a backlog item, listed below; **`store_languages` in the same story stays UUIDv7 (D1)**, and the divergence between the two tables is intentional rather than an inconsistency to "fix".

**D20 — Singleton-ness is enforced by the fixed key plus one named accessor, and the residual is stated rather than papered over.** `LocaleSetting::current()` is the single resolution path (`find(self::SINGLETON_ID)`, `firstOrCreate`-ing on first write), so no call site ever inserts with an arbitrary key and a second row can only appear via a deliberate `forceCreate(['id' => 2, …])` bypass. That is the same shape [schema.md](../../docs/database/schema.md#indexes--one-present-by-choice-one-by-requirement-four-omitted) already accepts and documents for `sales_regions.is_default`. *Rejected:* a **`CHECK (id = 1)` constraint** — technically the most airtight, but this repo has no CHECK constraint anywhere, and introducing the first one for a hazard no code path attempts is novelty without a matching benefit. *Rejected:* an **auto-increment key with `firstOrCreate` on no fixed id** — that leaves a real first-boot race where two concurrent requests each pass a "no row exists" check and insert distinct rows, after which nothing says which one is *the* settings row; the fixed literal turns that race into a duplicate-key error instead of silent duplication. Note this invariant is a *different shape* from `sales_regions`' "at most one row among many carries a flag" — that one genuinely has no cheap database answer, this one does, and conflating them would import a rejection that does not apply.

**D21 — Neither locale column is enum-cast on the model, and this is the story's sharpest correctness decision.** Story 0066's **D-5** established, by execution against the installed framework, that `HasAttributes::getEnumCaseFromValue()` resolves an enum cast with `$enumClass::from($value)` — so a stored value outside the current case set throws `\ValueError` **on hydration**. `users.ui_locale` is read once per authenticated user; **this row is read on the fallback branch of every web request, guest requests included**, so an enum cast here is a strictly worse instance of the same hazard: it would 500 the entire application the moment the column ever held a stale value, with no authenticated user required to trigger it. Both columns therefore stay plain `string`, validated with `Rule::enum(UiLocale::class)` at the write action and resolved with `tryFrom()` at read. **A reviewer must not add the cast "for consistency" with `SalesRegion`'s `kind` or `User`'s `status`** — 0066's docblock carries the identical warning for the identical reason. The columns are also `NOT NULL` with **no database default**: they *are* the fallback, so a `DEFAULT` would let a broken bootstrap silently succeed with a value nobody chose, the same reasoning `sales_regions.kind` records for having no default.

**D22 — A dedicated `LocaleSettingSeeder`, one-time, failing loudly on an unmappable `app.locale`.** It copies `StoreLanguageSeeder`'s *shape* — `doesntExist()`-gated, unconditional, composed into `DatabaseSeeder` and `ProductionSeeder` — but is **a separate class**, because one-seeder-per-table is what every existing seeder here follows and because these are two unrelated domain concepts that merely ship together. It is a one-time bootstrap for D2's reason exactly: a repeatable "repair the default" branch would silently overwrite an administrator's deliberate choice on every deploy. When `config('app.locale')` is not a `UiLocale` case (`APP_LOCALE=fr` is a legal deployment), the seeder **throws** rather than silently picking one — [security/seeder-safety.md](../../docs/security/seeder-safety.md#a-catalog-seeder-must-fail-loudly-rather-than-commit-a-structurally-invalid-catalog)'s established posture, and the alternative (a silent `'en'`) would ship a persisted "default" contradicting the app's own configuration with nothing to surface it.

**D23 — Two narrow actions rather than one taking both locales.** This is D10's reasoning applied a second time, and it has a sharper edge here: a single `__invoke(UiLocale $ui, UiLocale $notification)` forces every caller to supply **both**, so changing one means reading the other and writing it back — a read-modify-write that silently clobbers a concurrent change to the column the caller never meant to touch. Two single-column actions have no such window. The accepted cost is that 0069's form, saving both at once, calls two actions and produces two `Log::info` lines and two writes; that matches the two-call pattern D10 already establishes for this screen and is strictly less bad than a lost update. *Rejected:* one action with two nullable parameters — "null means don't change" is an omission-means-something contract, which is the exact ambiguity **D8** and the Roles transformers spend their whole design avoiding.

**D24 — A new `app/Actions/Localization/` area folder, not `app/Actions/StoreLanguages/`.** [base-standards.md](../../docs/conventions/base-standards.md#directory-structure) is explicit that a subfolder is either a module area or a **named cross-cutting concern**, and that a class belongs to its concern rather than to whichever area happened to call it first — the rule `app/Actions/Auth/` established and `LogRefusedPrivilegedAttempt` confirmed. These actions write dashboard and email locales; they are not store-language operations that happen to share a screen, and filing them under `StoreLanguages/` would be precisely the shape that rule exists to prevent. `Localization` rather than `Settings` avoids colliding with the unrelated `app/Livewire/Settings/` personal-account module, and matches the name story 0066 already chose for its own cross-cutting test folder (`tests/Feature/Localization/`) — so this is a second inhabitant of a naming decision already made, not a new one. Note this **contradicts 0066's D-12**, which rejected inventing a `Locale/` folder — for a single class; the reasoning there was proportionality, and two classes plus a shared test folder clears it.

**D25 — The settings reuse `store-languages.view` / `.edit` rather than getting their own permission, and `LocaleSettingPolicy` *references* `StoreLanguagePolicy`'s constants instead of restating the strings.** A new permission is effectively forbidden: `RolePermissionSeeder::MODULES` is a fixed 10 × 4 grid, this story explicitly does not change the catalog, and [the authorization page](../../docs/architecture/authorization.md#the-media-module-and-what-a-catalog-amendment-costs) records what one slug addition actually costs (fifteen hardcoded test assertions plus prose in eight documents). There is precedent for one tier spanning logically-distinct operations on a shared screen: `SalesRegionPolicy` gates the rate edit, the enable/disable toggle *and* the default swap on one `sales-regions.edit` for the same "the catalog holds no candidate second string" reason. **The constant aliasing is a pattern this repo has not needed before** and should be looked at deliberately at Phase 2: every existing follower of "name a permission once on the class that owns the rule" names a permission its own module owns, whereas `LocaleSettingPolicy` is *borrowing* one, and the alias rather than a second literal is what stops the two drifting on a future rename. **Stated cost:** anyone holding `store-languages.edit` now also controls the dashboard and notification defaults — a real widening of that permission's meaning, and one line of `architecture/authorization.md`'s "who holds what" at Phase 6.

**D26 — Both settings ship now.** The human named both, so cutting one would be second-guessing an explicit instruction. *At the time this decision was written*, `default_notification_locale` had no consumer: story 0066's **D-14** did not implement `Illuminate\Contracts\Translation\HasLocalePreference` on `User`, and its **R-2** escalated that as an open human decision. *Rejected then:* implementing `HasLocalePreference` here — it would have resolved another story's explicitly escalated question under a different story number, which [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule directly forbids. So this story built the setting, named the gap, and raised **Q5**.

⚠️ **Superseded, 2026-08-29 — Q5 is resolved and the "no consumer" premise above is stale.** The human answered R-2 directly (implement it now, using this story's `LocaleSetting`), and story 0066's **D-14** now ships `User::preferredLocale()` returning `UiLocale::tryFrom((string) $this->ui_locale)?->value ?? LocaleSetting::defaultNotificationLocale()->value` — a real, working consumer. The rejection above was correct *procedurally* (this story should not have implemented `HasLocalePreference` itself, and it didn't) but the setting is no longer dormant. See **R-16**'s matching correction.

**D27 — No cache on the locale-settings read, and this deliberately overrides both experts' recommendation.** Both recommended `Cache::rememberForever` with a post-write flush, on the reasonable ground that this row is read on the highest-frequency path in the app. The reason it is declined: **`CACHE_STORE=database` in this app today** ([schema.md](../../docs/database/schema.md#infrastructure-tables) lists the `cache` table; PRD assumption 18 records Redis as intended-but-unimplemented). So a cache *hit* is a single-row indexed lookup against the `cache` table, replacing a single-row primary-key lookup against a one-row `locale_settings` table — no measurable gain, plus an invalidation obligation and a whole class of staleness bug. Caching here buys nothing until the cache store stops being the database. **What ships instead:** an uncached `LocaleSetting::current()`, memoised in a static for the lifetime of the request so repeated reads within one request cost one query. **What is recorded for the day Redis lands** (PRD assumption 18), so it is not re-derived: cache key a fixed literal (the row is global, never per-user), and flush with one explicit `Cache::forget()` statement **after** the write returns — never inside a transaction, never from a model `saved` event. That ordering is not a preference; it is the rule [security/authorization-patterns.md](../../docs/security/authorization-patterns.md#flush-the-permission-cache-after-the-transaction-commits-never-inside-it) states and that [errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21) records this project breaking once already, invisibly, because a transaction wrapper relocated a flush nobody had written. A model-event hook is rejected for the same reason: it hides the flush site, which is exactly what made the prior incident invisible in review.

## Dependencies, risks and open technical questions

### Dependencies

- **[Story 0002](done/0002-seed-roles-permissions-catalog.md)** — for the `store-languages.*` permissions, which already exist. No code dependency, and **no change to that seeder**.
- **Stories 0016/0017/0018 (`sales_regions`)** — as a *precedent* only, not a code dependency. Nothing in this story imports or queries that domain. The `database/data/` fixture convention is inherited from story 0016.
- **No new Composer package.** The ISO 639-1 list is bundled, not pulled from `symfony/intl` or similar — the same PRD-driven constraint that produced the country fixture.
- **Story 0069 depends on this story's contract**, which is why the [public contract](#the-public-contract-story-0069-consumes) section is stated as a table rather than left implicit. Note `availableLanguages()` is part of that contract: it is what 0069's picker renders.

### Risks

- **R-1 — ~~The `code` validation source is the story's closest call.~~ RESOLVED 2026-08-28 by human decision (Q1).** Administrators pick from a bundled list; D3 is reversed and D9 superseded. Two smaller questions the resolution opened are now **Q2** and **Q3**.
- **R-2 — `is_active = false` never frees the `code` for reuse.** D5's toggle means the `fr` row persists forever, so a genuinely different future entity can never take that code without a hard-delete path this story does not build. That is the correct trade for now — freeing an identifier is precisely the operation [errors-log.md](../../docs/errors-log.md) records as *"never a single-table operation"*, and here the other tables do not exist yet to be reasoned about. If a hard delete is ever wanted, it arrives as a separate action with a holder-count guard in the `RoleInUseException` (409) shape, **after** stories 0070+ define what a holder is.
- **R-3 — This route ships with no `config/modules.php` entry, so the screen is reachable only by URI.** This is the identical temporary half-state `roles.index` sat in between stories 0010 and 0013, and `sales-regions.index` between 0017 and 0018 — [api/routes.md](../../docs/api/routes.md) records both. It is acceptable **only because 0069 immediately follows**. Story 0069 must add the `items.store_languages` entry (snake_case key, `permissions` exactly `['store-languages.view']`) plus its `lang/{en,es}/navigation.php` leaves, or the screen exists with nothing linking to it.
- **R-4 — The two-call remove-the-default flow (D10) is a contract shape 0069 must be able to live with.** If its confirmation dialog wants a single atomic "pick a replacement and remove" click, `RemoveStoreLanguage` grows a third parameter — cheap to decide now, disruptive to retrofit once 0069's tests bind to the two-argument form.
- **R-5 — Omitting `sort_order` (D11) is reversible but not free.** If 0069 wants administrator-orderable tabs, that is a migration in a later story. Deterministic ordering (default first, then `name`) is assumed sufficient.
- **R-6 — The `utf8mb4_unicode_ci` collation trap is live on `code`, and the closed list narrows it without closing it.** `'es'` and `'ES'` collide at the unique index but not under PHP `===` — the same shape [schema.md](../../docs/database/schema.md) records for `roles.name`. The fixture storing codes **lowercase** removes the fixture-to-column mismatch, but a *submitted* value still arrives from a client that may send anything, so two mitigations remain **required**: normalise with `Str::lower()` before both the membership check and the write, and make the find-or-create lookup byte-exact, never a bare `where('code', $submitted)->first()` treated as proof of no collision. D5's reactivate-on-re-add depends on this being right.
- **R-7 — The `translationUsageCount()` helper is a negative assertion until a relation is registered.** It returns `0` today, and a test asserting `0` against an empty registry passes whether the mechanism works or not. The mandatory second test (register a temporary relation, assert a real count) is what makes the extension point verified rather than merely written — the vacuous-coverage failure mode from the `arch()` entry in [errors-log.md](../../docs/errors-log.md), arriving through a new door.
- **R-8 — `config/store-languages.php` is only the second app-owned config file in this repo.** `config/modules.php` has been the sole instance since task 0013. Both hard constraints bind: no closures anywhere (`config:cache` serialises with `var_export()`), and `config:cache` must be run as a **test assertion** rather than trusted to review.
- **R-9 — This is the first `app/Actions/` area whose `Index` component name is ambiguous across four areas.** The aliased import convention (`use App\Livewire\StoreLanguages\Index as StoreLanguagesIndex;`) is not stylistic — it is what keeps `routes/store-languages.php` readable on its own.
- **R-10 — The `roles.modules.store_languages` translation leaf must exist.** [naming.md](../../docs/conventions/naming.md#translation-keys) records that story 0019 shipped the `media` module slug **without** its `roles.modules.media` leaf, so the Roles permission matrix renders a raw key in both locales with a fully green suite — because the seeder tests assert names and counts, never rendered copy. This story adds no module slug, so it does not *cause* that failure — but `store-languages` is one of the ten and should be checked at Phase 3 for the same missing leaf.
- **R-11 — NEW: this story is the first to read `database/data/` from `app/` at request time, which falsifies a sentence in the conventions.** [base-standards.md](../../docs/conventions/base-standards.md#directory-structure) currently says a file lands in `database/data/` only if it is *"bundled, reviewable in a diff, and read by something in `database/seeders/`"*. After this story the language fixture is read by a seeder **and** by `StoreLanguage::availableLanguages()`, which the validation trait calls on an admin request. D17's design keeps the seeder among its readers deliberately, so the sentence is not *broken* so much as **too narrow** — but it must be widened at Phase 6 rather than left to go quietly stale, which is precisely the [bare-negative-claim failure mode](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13) this project records. Flagged as a Definition-of-Done docs item, not left for a later story to trip over. The security posture is unremarkable — a version-controlled, deploy-immutable file read with no user input in its path — but `appsec-auditor` should confirm the read cannot be influenced by request data at Phase 4.
- **R-12 — NEW: the fixture is a committed snapshot, and a language leaving the standard is not handled.** Same property `iso-3166-countries.json` has and documents: refreshing is a manual regeneration plus a reviewable diff. If a code is ever *removed* from the fixture while a `store_languages` row still references it, that row keeps working (the FK is to `id`, and validation only runs on add) but becomes un-re-addable after removal. That is the right trade — silently deleting an administrator's configured language would be far worse — but it should be stated in `database/data/README.md` rather than discovered.

- **R-13 — NEW, and the most important risk in this file: story 0066 requires a reconciliation once this lands, and this story deliberately does not perform it.** 0066 is written but not implemented; this story ships the accessor its middleware should call and **does not edit any 0066-owned file**. The coordinator owns that pass. Precisely what must change, verified by reading `ai-spec/tasks/0066-admin-ui-locale-preference-backend.md`:

  | 0066 artefact | What is wrong once this lands | Nature of the change |
  | --- | --- | --- |
  | `App\Http\Middleware\SetUiLocale::handle()` | `UiLocale::tryFrom((string) $stored)?->value ?? config('app.locale')` — the config tier is now the *third* tier, not the second | one line: `?? LocaleSetting::defaultUiLocale()->value` |
  | **D-6** ("No `UiLocale::default()`. The default is `config('app.locale')` and lives there alone") | **Superseded in scope, not falsified.** D-6 correctly forbids a *hardcoded enum-level* default, and `UiLocale::default()` should still not exist. What is new is a **persisted, admin-writable** tier between the per-user preference and the config — a possibility D-6 never considered rather than one it rejected | rewrite D-6 to state the three-tier chain |
  | Scope fence: *"`config/app.php` — untouched; `locale` and `fallback_locale` … remain the single source of truth for the default"* | the second clause is now false | narrow to "remain the bootstrap seed and last-resort fallback" |
  | Scope fence: *"story 0068 must not reuse any of this"* | too broad — 0068 legitimately imports `UiLocale` and validates with `Rule::enum(UiLocale::class)` | narrow to: 0068 must not reuse `users.ui_locale`, `SetUserUiLocale`, or the per-user concept |
  | Gherkin: *"An administrator who never chose a language gets the application default"* and *"A visitor who is not signed in gets the application default"* | "the application default" becomes ambiguous between the config value and the admin-configured one | rewrite, or split into configured-vs-not scenarios |
  | `tests/Feature/Localization/UiLocaleResolutionTest.php` — the guest and never-chose cases | both assert the **old two-tier** fallback and would silently keep passing for the wrong reason | rework: an explicitly-empty `LocaleSetting` state for the config-only path, plus new sibling cases for a configured default |

  **The last row is the one that bites quietly.** Those two tests keep passing after this story lands — because with no `locale_settings` row the accessor *does* fall through to config — so nothing goes red to signal that the assertion has stopped testing what it claims to.

- **R-14 — NEW: `SetUiLocale` runs on every `web` request including guests, so this adds a query to the app's hottest path.** 0066 never had this cost because `Auth::user()->ui_locale` free-rides an already-loaded model. D27 accepts one uncached indexed single-row lookup (memoised per request) and records why caching is declined *while the cache store is the database*. Two things follow: the decision must be revisited when Redis lands (PRD assumption 18), and **any story that adds a second per-request settings read should revisit it then rather than adding a second uncached query on the same reasoning**.

- **R-15 — NEW: this widens what `store-languages.edit` means.** Per D25 the settings borrow that permission rather than adding one, so a role granted it to manage content languages also gains control of the dashboard and notification defaults. That is a deliberate trade against a catalog amendment's cost, but it is a real scope widening for an existing permission string and belongs in `architecture/authorization.md`'s "who holds what" at Phase 6, not left implicit.

- **R-16 — SUPERSEDED, 2026-08-29.** This originally read: "the notification-locale setting ships with zero consumers (D26) — a persisted, writable, admin-facing setting that changes nothing until story 0066's R-2 is answered and `HasLocalePreference` exists." R-2 has been answered (implement now) and 0066's D-14 ships that consumer. What remains real: this story (0068) still contains no test of notification-locale *rendering* — that coverage correctly lives in 0066's `PreferredLocaleTest.php`, per D26's updated note. Phase 2/3 should confirm 0066's reconciliation actually landed rather than trusting this note alone.

- **R-17 — NEW: `LocaleSetting`'s fixed non-incrementing key is unlike every other model here, and a factory written on autopilot will fight it.** `$incrementing = false`, `$keyType = 'int'`, and a factory that must write `id => 1` — so a test calling `LocaleSetting::factory()->create()` twice gets a duplicate-key error rather than two rows. That is the invariant working as designed (D20), but it is surprising enough that the factory needs a comment saying so, and tests arranging a specific settings state should `updateOrCreate` rather than `create`.

- **R-18 — NEW: a briefing error in this story's own round-3 debate, recorded so it is not repeated.** The prompt sent to `backend-expert` asserted that story 0066 "already has `App\Concerns\UiLocaleValidationRules`". **It does not** — 0066 adds a `uiLocaleRules()` method to the *existing* `App\Concerns\UserValidationRules` ("No new trait: same noun, same file"). The expert caught it by reading rather than trusting the brief, which is why **D26**'s new `LocaleSettingValidationRules` trait is correct: `UserValidationRules` is named for the model whose input it validates, and a `LocaleSetting` is not a `User`, so cross-composing it would be the worse violation. The one-line duplication of a `Rule::enum(UiLocale::class)` array is the accepted cost — [naming.md](../../docs/conventions/naming.md#traits-and-their-methods) forbids a trait `use`ing another. Recorded because an unchallenged false premise in a Phase 1 brief is exactly the shape [the deferred-findings entry](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23) warns about.

### Open questions for the product owner

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule, each carries a recommendation rather than a silent assumption.

**Q1 — How does an administrator supply a language? ✅ RESOLVED 2026-08-28.** The human chose **pick from a bundled reference list** (option (c) of the original three), following the `database/data/` convention behind `sales_regions`. D3 is reversed, D9 superseded, and D14/D15/D16/D17 record the design that follows. No longer open.

**Q2 — Should the ~184 fixture entries be pre-seeded as inactive candidate rows? ✅ RESOLVED 2026-08-29.** The human confirmed **no pre-seeding** (option (b), validate-only against the fixture) — the design D14–D17 already ship. No longer open; story 0069's screen design (a picker over `availableLanguages()`, not a Sales-Regions-shaped candidate list) is confirmed correct on this basis.
- **(a) No — the fixture only validates; a row exists only once an administrator picks it — _(recommended)_.** It is the only option under which `is_active = false` has a single meaning, it preserves D2/D5/D7/D12 as written, it keeps `store-languages.create` an honest permission verb, and it keeps the table proportional to real usage.
- **(b) Yes — pre-seed all ~184 as inactive rows**, mirroring `sales_regions`. Its real advantage is that validation becomes a plain `Rule::exists()` against the database and the new request-time fixture read (R-11) disappears entirely. Its costs: D2 becomes a two-tier seeder rewrite, D12's rationale is falsified, the add operation is re-gated on `store-languages.edit` because it never inserts, and "removed" becomes indistinguishable from "never chosen" without a third state.
- Pick **(b)** if — and only if — story 0069's screen should look like the Sales Regions list (every candidate visible, inline toggles). That is a legitimate screen decision; it just should not be made by accident here.

**Q3 — Should the bundled list carry regional variants (`pt-BR` vs `pt-PT`), or bare ISO 639-1 only?** Recommended: **bare ISO 639-1 only** (D16) — a complete standard enumeration with no curatorial judgement, growable later by a two-line reviewable diff. Cheap to reverse; worth an explicit sign-off because it supersedes D9 rather than merely narrowing it.

**Q4 — Will a store ever need a display name different from the fixture's canonical endonym** (e.g. "Français (Québec)" rather than "Français")? Recommended: **no** for this story (D15). If it is a real near-term need it changes the `AddStoreLanguage` contract now rather than as a retrofit, so it is cheaper to answer before Phase 3 than after.

**Q5 — The default notification-email language has no consumer. Build it now, or fold story 0066's R-2 in? ✅ RESOLVED 2026-08-29.** The human answered 0066's R-2 directly: implement `HasLocalePreference` now, in **0066** (not here — this story's own rejection of implementing it under this story number stands). Story 0066's D-14 ships `User::preferredLocale()` consuming this story's `LocaleSetting::defaultNotificationLocale()`. No longer inert; see the corrections on D26 and R-16.
- **(a) Build both settings now; record the notification one as inert until 0066's R-2 lands — _(recommended)_.** You asked for both explicitly, the column is cheap, and deferring it means a second migration later. The dormancy is named in the Definition of Done rather than hidden.
- **(b) Build only the dashboard default now**, and add the notification one in whichever story answers R-2. Ships nothing inert; costs a later migration and a second pass over the same screen.
- **(c) Answer R-2 here** — implement `HasLocalePreference` in this story, making the setting live immediately. **I recommend against doing this by default**: it resolves another story's explicitly escalated question under a different story number. But it is *your* question to answer, and if the answer is "yes, emails should follow the stored preference", saying so now is cheaper than a third story. Note the substantive objection 0066 itself raised: a `UserInvitation` is sent *before* the invitee has any preference, and a password-reset arguably follows the account's correspondence language rather than its last UI click.

**Q6 — Does the admin-configured dashboard default apply to signed-out visitors on public pages?** The brief says the fallback applies when "a request has no authenticated user", and the Gherkin above is written to that — so a change here would alter what an anonymous visitor sees on `/login`, `/register` and the welcome page, not just inside the dashboard. Recommended: **yes**, as briefed. Flagged because it reaches further than "the admin interface language" sounds like it does.

**Q7 — Is story 0069's screen one Livewire component or two?** This story ships both backends independently, so either works — but if it is one component, `App\Livewire\StoreLanguages\Index` ends up owning a concept that is not a store language, which may argue for naming it under a settings namespace instead. Recommended: **0069's call, not this story's**; raised so that story meets a decision rather than discovering the naming tension mid-build.

## Technical tasks for later backlog

Derived from this debate; **none of these are in scope for 0068**.

1. **Story 0069 must add the `config/modules.php` sidebar entry** (`items.store_languages`, `permissions` exactly `['store-languages.view']`) and both `navigation.php` leaves — closing R-3. It also owns the picker UI over `StoreLanguage::availableLanguages()`.
2. **Stories 0070+ each append one `translation_relations` entry** to `config/store-languages.php` when they create their translation table — completing D8's removal warning. The first of them should also add the drift-guard test that every registered `{table, column}` pair actually exists in the schema.
3. **The FK contract for stories 0070+**: `$table->foreignUuid('store_language_id')->constrained('store_languages')->restrictOnDelete();` — **not nullable** (unlike `media.uploaded_by`, a translation row's language is identity-defining, so a null is meaningless rather than merely unattributed), with the table name passed **explicitly** per [migrations.md](../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here), and **no** explicit `index()` on the FK column. `restrictOnDelete()` is defensive only: under D5 the row is never deleted, so it can never fire.
4. **Widen `docs/conventions/base-standards.md`'s `database/data/` sentence** so it admits a non-seeder reader — R-11. Assigned to this story's own Phase 6, listed here so it is not lost if that pass is deferred.
5. **A fixture-amendment story for regional variants**, if Q3 is ever revisited — two lines of JSON plus a test-data update, no migration.
6. **A hard-delete path with a holder-count guard**, if R-2 ever becomes a real requirement — only after a translation table exists to count holders in.
7. **`ModuleRouteAccessTest.php` has never been extended past two routes** while four now exist. Story 0017 opened that gap and 0018 did not close it; this story does not either. Worth one story to bring all four gated routes under its cross-gate independence assertions.
8. **A `docs/decisions/` ADR amendment IS needed, for the opposite reason to D1.** `store_languages` applies ADR 0001 Amendment 1 unchanged (D1) and needs nothing. `locale_settings` is a **named exception** to it (D19 — a singleton, where the amendment's enumeration-safety rationale cannot apply), and Amendment 1 currently names exactly one exception, for a different reason (a high-volume geography lookup table). Recording a second exception is what stops a later story reading the policy as absolute and "fixing" this table to UUID. This is the same deferral [schema.md](../../docs/database/schema.md#notes) carried from task 0016 to story 0019 before it was closed — worth not repeating.
9. **Story 0066's reconciliation** — the six-row table in **R-13**. Not this story's edit; the coordinator's.
10. **Revisit D27's no-cache decision when Redis lands** (PRD assumption 18). The flush-ordering rule is pre-recorded in D27 so it does not have to be re-derived.

## Provenance

**Round 1 — Phase 1 Three Amigos debate, 2026-08-28.** Participants: `product-owner` (facilitator), `backend-expert`, `database-expert`, `backend-qa`. Converged on D1, D2, D5, D6 and D8; split on the `code` format (D9), `sort_order` (D11), the removal-of-default contract (D10) and the exception type for invariant refusals. `backend-qa` independently flagged the fixture question as undesignable without a decision, which is why it was gated as Q1.

**Round 2 — design revision, 2026-08-28**, after the human resolved Q1 in favour of a bundled reference list. `database-expert` and `backend-expert` were re-convened. They agreed on the fixture's filename, shape and provenance treatment, on dropping D9's permissive regex, and on ISO 639-1 without regional variants. **They disagreed on Q2** — and, worth recording because it nearly caused a misreading, they used **inverted A/B labels for the same fork**: `database-expert` recommended *no pre-seeding* (preserving D2/D5/D12 and avoiding a third state), while `backend-expert` leaned toward *pre-seeding* to eliminate the new request-time fixture read. Resolved here in favour of no pre-seeding (D14), with `backend-expert`'s objection recorded as the concrete cost (R-11) rather than dismissed, and the whole fork raised for sign-off as Q2. `backend-expert`'s contract analysis (D15) was adopted in full — it is the stronger argument and `database-expert` had flagged the same question as open.

**Round 3 — scope addition, 2026-08-28**, after the human confirmed the two default-locale settings as part of this story. `database-expert` and `backend-expert` were re-convened against story 0066's real task file. They agreed on the singleton-table shape, on `NOT NULL` columns with no database default, on **not** enum-casting either column (each finding 0066's `from()`-vs-`tryFrom()` hazard independently — one at the model-cast layer, the other at the config-fallback layer, which is why D21 and the contract's resolution chain both carry it), on a dedicated one-time seeder that fails loudly, on reusing `store-languages.*` rather than amending the catalog, and on the flush-after-commit rule for any future cache.

**They split on three points, resolved here.** *(a)* **PK type** — `database-expert` argued for a fixed small-integer key against ADR 0001's policy, `backend-expert` leaned UUID for consistency while explicitly deferring to the schema owner and asking that a `bigint` choice get the same explicit ADR-amendment treatment stories 0016 and 0019 got. Adopted `database-expert`'s shape **and** `backend-expert`'s procedural point, which is now backlog item 8. *(b)* **Action folder** — `database-expert` suggested `app/Actions/StoreLanguages/` (citing 0066's D-12 against a single-class `Locale/` folder), `backend-expert` argued for a new `app/Actions/Localization/` on base-standards' concern-not-caller rule. Adopted `Localization/` (D24): D-12's reasoning was proportionality for *one* class, and two classes plus 0066's own `tests/Feature/Localization/` clears it. *(c)* **Action count** — `database-expert` wrote of "the write action" singular, `backend-expert` argued for two on D10's precedent. Adopted two (D23), with the lost-update argument that neither expert raised.

**One shared recommendation was overridden by the facilitator, and it is the decision most worth a second opinion at Phase 2.** Both experts recommended caching the settings read, since it lands on the app's highest-frequency path. **D27 declines it** on a fact neither drew the conclusion from although both cited it: `CACHE_STORE=database` in this app today, so a cache hit is an indexed single-row read against the `cache` table replacing an indexed single-row read against a one-row table — no gain, plus an invalidation obligation. The decision is scoped to "while the cache store is the database" and records the flush-ordering rule for the day Redis lands.

**A false premise in this round's own briefing is recorded as R-18** rather than quietly corrected: the prompt told `backend-expert` that 0066 has a `UiLocaleValidationRules` trait. It does not; the expert caught it by reading the file.

**Not run by this phase**, per [workflow.md](../../docs/workflow.md): the INVEST check (Phase 2), TDD implementation (Phase 3), security audit (Phase 4), code review (Phase 5), or the docs pass (Phase 6). **Nothing outside this file was created or modified** — story 0066's file is untouched, and no application code, migration or test was written.
