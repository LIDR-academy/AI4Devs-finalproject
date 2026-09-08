# [0069] Store Languages settings screen — frontend

## Description
Build the screen behind `GET /settings/store-languages`, replacing the placeholder view story
[0068](0068-store-languages-catalog-backend.md) ships. **One Livewire component, two visually distinct
sections** (confirmed by the human — not two components):

1. **Content languages** — the [PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization)
   store-language catalog: add a language by **picking from the bundled ~184-entry ISO 639-1 list**
   (never free-typed), mark one as the store's default content language, and remove one.
2. **Dashboard defaults** — two admin-configurable system settings constrained to the **two-value**
   `App\Enums\UiLocale` set (`en`/`es`): the default dashboard language and the default
   notification-email language. These apply **application-wide, including signed-out visitors**.

This story writes markup, component state, lang copy and the sidebar registry entry. It defines **no**
model, migration, action, policy or permission — all of those are 0068's, consumed verbatim.

> **The two sections are different i18n layers and the screen's central product risk is conflating
> them.** A content language may be any ISO 639-1 language (French, Japanese) and is about the *store's
> content*; a dashboard default is `en`/`es` only and is about the *admin interface*. The same string
> — "English" / `en` — is legitimately available in both, with different meanings. See **D-3** for the
> visual separation and **D-4** for the copy that keeps them apart.

## Type
frontend | includes database-expert: **no** | consumes backend stories **0068** (catalog + `LocaleSetting`) and **0066** (`UiLocale`, `preferredLocale()`)

## Gherkin

```gherkin
Feature: The Store Languages settings screen — content languages

  Scenario: A store administrator reaches the screen from the sidebar
    Given a store administrator holding permission to view store languages
    When they open the Store Languages settings screen
    Then the content languages section and the dashboard defaults section are both shown

  Scenario: The sidebar hides the screen from an administrator without permission
    Given a store administrator holding no store language permissions
    When they open the dashboard
    Then no Store Languages entry is offered in the navigation

  Scenario: A fresh installation shows Spanish as the only content language
    Given a store administrator on a fresh installation
    When they open the Store Languages settings screen
    Then Spanish is listed as the only content language and is marked as the store default

  Scenario: Add a content language from the bundled list
    Given a store administrator holding permission to create store languages
    When they pick French from the bundled language list
    Then French is listed as an active content language that is not the store default

  Scenario: The bundled list omits languages already in the catalog
    Given a store administrator whose catalog already holds French
    When they open the bundled language list
    Then French is not offered among the languages available to add

  Scenario: The bundled list can be narrowed by typing
    Given a store administrator viewing the bundled language list
    When they type part of a language name into the list's search field
    Then only the matching languages remain visible

  Scenario: Change the store's default content language
    Given a store administrator whose catalog holds Spanish as default and French as active
    When they set French as the store's default content language
    Then French carries the default marker and Spanish no longer carries it

  Scenario: Remove a content language that is not the default
    Given a store administrator, with French active and not the store default
    When they confirm removing French as a content language
    Then French is no longer listed among the content languages

  Scenario: Removing the default content language requires naming a replacement
    Given a store administrator whose store default is Spanish, with French also active
    When they open the removal confirmation for Spanish
    Then they are asked to choose which active language becomes the new store default

  Scenario: The last remaining content language cannot be removed
    Given a store administrator whose catalog holds exactly one active content language
    When they open the removal confirmation for that language
    Then removal is refused with an explanation that another language must be added first

  Scenario: A store administrator without edit permission sees the catalog read-only
    Given a store administrator holding only permission to view store languages
    When they open the Store Languages settings screen
    Then the content languages are listed and every control that would change them is disabled

  Scenario: A refused removal reports the reason against the language it concerns
    Given a store administrator whose store default changed in another session
    When they confirm removing a language that has since become the store default
    Then the refusal is reported against that language rather than as an unexplained failure
```

```gherkin
Feature: The Store Languages settings screen — dashboard defaults

  Scenario: Change the default dashboard language
    Given a store administrator holding permission to edit store languages
    When they save English as the default dashboard language
    Then English is shown as the store's default dashboard language

  Scenario: Change the default notification language
    Given a store administrator holding permission to edit store languages
    When they save English as the default notification language
    Then English is shown as the store's default notification language

  Scenario: Saving one dashboard default leaves the other untouched
    Given a store administrator whose default notification language is Spanish
    When they save English as the default dashboard language
    Then the default notification language is still Spanish

  Scenario: Saving a dashboard default leaves the content default untouched
    Given a store administrator whose default content language is French
    When they save English as the default dashboard language
    Then French is still marked as the store's default content language

  Scenario: The dashboard defaults offer only the two interface languages
    Given a store administrator viewing the dashboard defaults section
    When they open the default dashboard language options
    Then exactly Spanish and English are offered

  Scenario: A content language does not become a dashboard default option
    Given a store administrator whose catalog holds French as an active content language
    When they open the default dashboard language options
    Then French is not offered among them

  Scenario: A store administrator without edit permission sees the defaults read-only
    Given a store administrator holding only permission to view store languages
    When they open the dashboard defaults section
    Then both settings show their current values and neither can be changed

  Scenario: The section states that the defaults are not a personal preference
    Given a store administrator viewing the dashboard defaults section
    When they read the section's description
    Then it states that these defaults apply to every visitor who has not chosen their own language
```

## Files to create/modify

### Modify

- **`app/Livewire/StoreLanguages/Index.php`** — 0068 ships this class with a placeholder view attached
  (the 0017 → 0018 split). This story replaces its body with the full public surface below. **The class
  is not renamed** (**D-1**, which answers 0068's **Q7**).

  ```php
  // ---- Section A: content languages ----
  /** @var array<int, array{id: string, code: string, name: string, isDefault: bool,
   *     canSetDefault: bool, canRemove: bool}> */
  #[Locked] public array $languages = [];
  public bool $showAddLanguageModal = false;
  public bool $showRemoveModal = false;
  #[Locked] public string $languageId = '';        // declared so a 'languageId' ValidationException survives dehydrate()
  public string $code = '';                        // declared so a 'code' ValidationException survives dehydrate()
  public string $replacementLanguageId = '';       // '' matches the placeholder <option value="">

  // ---- Section B: dashboard defaults ----
  public string $defaultUiLocale = '';             // overwritten in mount() before first render
  public string $defaultNotificationLocale = '';

  #[Computed] public function availableLanguageOptions(): array;  // fixture minus already-active codes
  #[Computed] public function canAddLanguage(): bool;
  #[Computed] public function canEditLocaleSettings(): bool;
  #[Computed] public function isOnlyActiveLanguage(): bool;
  #[Computed] public function replacementCandidates(): array;

  public function mount(): void;                   // Gate::authorize('viewAny', StoreLanguage::class)
  public function openAddLanguageModal(): void;    // Gate::authorize('create', …)
  public function addLanguage(string $code, AddStoreLanguage $addStoreLanguage): void;
  public function closeAddLanguageModal(): void;   // resetValidation('code')
  public function confirmRemoveLanguage(string $languageId): void;   // disclosure gate — see the ⚠️ below
  public function removeLanguage(SetDefaultStoreLanguage $s, RemoveStoreLanguage $r): void;
  public function closeRemoveModal(): void;        // resetValidation('languageId')
  public function setDefaultLanguage(string $languageId, SetDefaultStoreLanguage $s): void;
  public function saveDefaultUiLocale(SetDefaultUiLocale $a): void;
  public function saveDefaultNotificationLocale(SetDefaultNotificationLocale $a): void;
  ```

  **There is no edit modal**, deliberately: a `StoreLanguage` has nothing editable but `is_default` and
  `is_active`, both act-now. This is a smaller surface than Users, Roles or Sales Regions.

  ⚠️ **`confirmRemoveLanguage()` must resolve its target with `findOrFail()`, never `find()`.** The
  frontend-expert's draft used `Gate::authorize('delete', StoreLanguage::find($languageId))`, which
  passes `null` to the Gate for a forged or stale id — a policy method typed `StoreLanguage $target`
  then raises a `TypeError` rather than a clean 404. Every one of the five target-resolving methods
  uses `findOrFail()`, matching `App\Livewire\SalesRegions\Index`.

- **`resources/views/livewire/store-languages.blade.php`** — 0068 creates this as a placeholder; this
  story replaces it wholesale. The **flat** path is correct (**D-2**).
- **`config/modules.php`** — one appended `items.store_languages` entry (**D-13**), closing 0068's **R-3**.
- **`lang/en/navigation.php`** / **`lang/es/navigation.php`** — one `items.store_languages` leaf each,
  key-for-key identical.
- **`lang/en/store-languages.php`** / **`lang/es/store-languages.php`** — 0068 ships these holding only
  what its *actions* reference (`errors.*`). This story adds the `index.*` UI copy group: section
  heading and description, button labels, the two distinct disabled tooltips, the empty state, and the
  removal-confirmation copy including its `trans_choice` usage line (**D-11**).
- **`lang/en/localization.php`** / **`lang/es/localization.php`** — 0068 ships the `attributes` block;
  this story adds a `settings.*` group for the two selects' labels, their save buttons, and the
  section description that keeps these apart from a personal preference (**D-4**).

### Deliberately not created

- **No validation trait, and no `$this->validate()` in the component** (**D-15**). Every user-reachable
  refusal is a `ValidationException` thrown by 0068's actions and keyed `code` / `languageId`; the
  component declares those as real public properties so the error survives Livewire's
  `SupportValidation::dehydrate()` filter, and re-derives no rule of its own.
- **No new Livewire component.** One component, two sections — confirmed.

### Deliberately not touched

- **`routes/store-languages.php`**, **`app/Models/StoreLanguage.php`**, **`app/Models/LocaleSetting.php`**,
  **`app/Policies/*`**, **`app/Actions/StoreLanguages/*`**, **`app/Actions/Localization/*`**,
  `database/**` — all 0068's, consumed unchanged.
- **`database/seeders/RolePermissionSeeder.php`** — the catalog stays at 42 permissions. Verified during
  this debate: **`roles.modules.store_languages` already exists in both `lang/en/roles.php` and
  `lang/es/roles.php`**, so 0068's **R-10** is already satisfied and this story has nothing to add there.
- **`app/Http/Middleware/SetUiLocale.php`**, **`app/Models/User.php`** — story 0066's.
- **`resources/views/components/desktop-user-menu.blade.php`**, **`resources/views/layouts/app/sidebar.blade.php`**
  — story 0067's two render sites for the *personal* language switcher. This story adds a registry
  entry, which needs no edit to either file.

## Tests to perform

### Component / Feature — `tests/Feature/StoreLanguages/`

**Happy path** — `IndexTest.php`
- [ ] Picking a fixture code calls `AddStoreLanguage` with exactly that code, and the row is rendered active and non-default.
- [ ] "Set default" calls `SetDefaultStoreLanguage` with that row's model, and the default marker moves in the same render.
- [ ] Confirming removal of an active non-default language calls `RemoveStoreLanguage` and the row leaves the list.
- [ ] Saving the dashboard default calls `SetDefaultUiLocale`, and saving the notification default calls `SetDefaultNotificationLocale` — asserted as **two separate calls with two separate arguments**, never one call carrying both (0068 **D23**).
- [ ] Confirming removal of the current default with a replacement chosen calls `SetDefaultStoreLanguage` **then** `RemoveStoreLanguage`, in that order, from one user click (**D-9**).

**Edge cases**
- [ ] Fresh-install single-Spanish-row state renders both row controls disabled, and the "Remove" tooltip names **one** reason, the more specific one — not two stacked reasons. *Risk if missing:* the UI leaks which server-side check would have fired first, and contradicts 0068's own "exactly one refusal reason" rule.
- [ ] The picker omits codes already held by an **active** row (**D-7**). *Risk if missing:* the screen submits a code the backend will certainly refuse, turning a UX nicety into a raw validation error.
- [ ] Reactivating a previously removed language renders as one row, not two. *Risk if missing:* a naive append renders a duplicate that does not exist in the database.
- [ ] The removal modal renders its **third** state (default *and* only active language) with no replacement select at all and a disabled confirm. *Risk if missing:* the modal offers a replacement chooser with nothing to choose.

**Negative cases**
- [ ] A forced `removeLanguage()` against the current default surfaces the `languageId`-keyed error **against that row**, not as an unattributed banner. *Risk if missing:* a real two-administrator race produces a failure the user cannot act on.
- [ ] A forced `setDefaultLanguage()` against an inactive language surfaces its own distinct message. *Risk if missing:* two genuinely different refusals collapse into one string.
- [ ] An actor holding `store-languages.view` but not `.edit`: both locale selects and every catalog control render disabled, **and** a forced write is refused server-side with **no partial persistence**. *Risk if missing:* a half-applied write on a refused request — a correctness bug, not a cosmetic one.
- [ ] A target deleted between render and click raises `ModelNotFoundException` and is surfaced as a recoverable error rather than an unhandled 500.
- [ ] A Super Admin holding **zero** `store-languages.*` rows sees every control enabled — proving the `Gate::before` bypass reaches the UI hint, not only the action.

**Two-section separation** — `CatalogRenderingTest.php` and `LocaleSettingsRenderingTest.php`
> Two files rather than one `IndexRenderingTest.php`, so the separation is structural in the suite and
> not only in the markup (**D-3**).
- [ ] **The deliberate-collision test.** Arrange the *content* default as English (`code=en` — a legal ISO 639-1 pick) while `default_ui_locale` is Spanish. Assert the content section's default marker sits on the English **row**, the dashboard select shows **Spanish** selected, and English is not the selected dashboard option. *Risk if missing:* the sharpest conflation bug in the story's space is untested.
- [ ] **Independence by mutation, both directions.** Saving a dashboard default leaves the content default marker unmoved on the same render; promoting a content language leaves both selects unchanged.
- [ ] **The value domains differ structurally.** The dashboard selects offer **exactly two** options (asserted as a count, not "contains English and Spanish"); the picker offers the fixture minus active codes. *Risk if missing:* wiring the catalog's option list into a locale select renders plausibly and is invisible to a "contains" assertion.
- [ ] The component's own state shapes differ — the content default is a `StoreLanguage` id, the locale properties are `UiLocale` backing values. Runs before the DOM assertions because it is cheaper and fails earlier.

### Navigation — extend `tests/Feature/Navigation/SidebarModuleGatingTest.php`
> **Extend, never add a new file** — this is the established home for every prior registry entry.
- [ ] A role holding exactly `store-languages.view` sees the sidebar link and its `data-test` hook.
- [ ] A role holding the related-but-different `store-languages.edit` **without** `.view` sees **neither** — the `sales-regions.edit` precedent, and the case 0068's R-3 does not ask for.
- [ ] The containing group's heading vanishes entirely for a role holding neither.
- [ ] The entry's `permissions` set-equals the route's real `can:` middleware (both generic drift guards already cover this for free — verified against task 0018's finding that they generalise).

### Browser — `tests/Browser/StoreLanguages/IndexTest.php`
> **Mirrored subfolder, not flat** (**D-17**). `frontend-qa` did not name this path; the convention says
> mirrored, and the two existing flat files are recorded debt.
- [ ] Typing into the picker's search field narrows the visible list, and picking a match submits the fixture's **canonical lowercase code** — not the raw text typed. *Risk if missing:* `Livewire::test()->call('addLanguage', 'fr')` bypasses the picker's wiring entirely and passes even if the real control never worked.
- [ ] A real click on "Set default" moves the marker — the only level at which a compiled-`wire:click` no-op is detectable.
- [ ] A real click on "Remove" for a non-default language removes the row.
- [ ] A refused action's inline error does **not** survive a Cancel and a reopen against a different row (the `resetValidation()` regression task 0018 shipped as a blocking bug).
- [ ] `->assertNoJavaScriptErrors()` on every test.
- [ ] **Not used anywhere:** `->waitForEvent('networkidle')` — banned in this repo.

### Deliberately not tested here
- [ ] **Every domain invariant** (cannot remove the default or the last active language, inactive cannot be default, reactivation keeps the row id, fixture validation, collation normalisation) — 0068's, against the actions directly. This story asserts the screen *reaches* those actions and *renders* their outcome.
- [ ] **The four-case HTTP status matrix** for `GET /settings/store-languages` — 0068 lists it verbatim. This story's route-level test asserts what a `view`-only actor's **200 contains**, which is a different question.
- [ ] **Both policies' `Gate::forUser()` matrices and each action's direct-call authorization** — 0068's; a component test structurally cannot prove an action authorizes independently of its caller.
- [ ] **Refusal-logging context keys and the cross-screen equivalence test** — 0068's.
- [ ] **The middleware's end-to-end fallback** (a signed-out visitor on `/login` rendering in the configured default). Its wiring is `SetUiLocale::handle()`, which 0068 does **not** edit — that is 0066's reconciliation (0068 **R-13**). A test written here would pass for the wrong reason against 0066's current two-tier fallback, which is precisely the trap that risk names. See **R-1**.
- [ ] **Anything asserting an email actually renders in the notification language.** That belongs to 0066, which owns `preferredLocale()` — see **D-5**, and note this is *not* the same as saying the setting is inert.

## Expected outcome

`GET /settings/store-languages` renders a working two-section screen, linked from the sidebar only for
an administrator holding `store-languages.view`. In the **content languages** section an administrator
sees the catalog (Spanish alone on a fresh install, marked default), adds a language by searching a
modal list of the bundled ISO 639-1 set filtered to what is not already active, promotes any active
language to store default, and removes one through a confirmation that asks for a replacement when the
target is the current default and refuses outright when it is the only one left. In the **dashboard
defaults** section they set the default dashboard language and the default notification language
independently, each from exactly two options, under copy that says plainly these are system-wide
defaults rather than a personal preference. Every control an actor may not use renders disabled with a
reason, and every refusal the backend raises lands against the language it concerns.

## Acceptance criteria

- [ ] The screen renders two visually distinct sections whose headings and descriptions make the content/interface distinction legible without prior knowledge.
- [ ] The content languages section lists every **active** store language with its endonym, its code, and a marker on the store default.
- [ ] A language is added only by picking from the bundled list; the screen offers no free-text code entry on any path.
- [ ] The picker is searchable, and offers the fixture's languages minus those already active.
- [ ] Promoting an active language to store default moves the marker and clears the previous one in the same render.
- [ ] Removing the current default requires naming an active replacement in the same confirmation, and the whole flow is **one** administrator click.
- [ ] The only remaining active language cannot be removed, and the modal explains why rather than failing on confirm.
- [ ] The removal confirmation never states a "0 usages" safety claim; the usage line appears only when a translation relation is registered and reports a real count.
- [ ] The dashboard defaults section offers exactly the two `UiLocale` cases for each setting, and no content language ever appears among them.
- [ ] The two dashboard defaults are saved independently, through two separate actions, and neither disturbs the other or the content default.
- [ ] The dashboard defaults section's copy states that the defaults apply application-wide, including to visitors who have not chosen their own language, and does not read as a personal preference.
- [ ] Every control gated by a policy renders disabled for an actor lacking the ability, with the `data-test` hook present on both branches.
- [ ] A control disabled for a **domain-state** reason (already default; only active language) carries a *different, specific* tooltip from the permission refusal's generic one.
- [ ] `config/modules.php` carries an `items.store_languages` entry whose `permissions` is exactly `['store-languages.view']`, with matching `navigation.php` leaves in both locales.
- [ ] All four lang files touched are key-for-key identical across `en` and `es`.
- [ ] No page-global assertion is used for a language name or a two-letter code anywhere in this story's tests.
- [ ] `routes/store-languages.php`, both policies, all five actions, both models and every migration are **unchanged** by this story.

## Definition of Done
- [ ] Tests written and green (full suite **unscoped**, not `--filter`)
- [ ] `vendor/bin/pint --format agent` run **unscoped**, not `--dirty`
- [ ] **Larastan level 7 run and recorded** — named explicitly because [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26) records three consecutive stories whose verification notes listed two of three gates and were read as records of all three
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper) — at minimum `docs/api/routes.md` (the fourth gated route's screen, and the second half of its module gate), `docs/architecture/authorization.md` (the sidebar registry's **fifth** entry and **second** group addition), and `docs/conventions/naming.md` if the registry key raises anything new
- [ ] **Recorded, not silently fixed:** if 0066 has not yet shipped `preferredLocale()` when this story lands, the notification default is temporarily inert — see **D-5** and **R-1**
- [ ] Acceptance criteria met

---

## 1. Refined user story

**As** a store administrator,
**I want** one settings screen where I manage both the languages my store's content is authored in and
the interface language the dashboard falls back to,
**so that** I can add a content language such as French without touching the admin interface's own
Spanish/English pair, and set what language the dashboard and its emails default to for everyone who
has not chosen their own.

**Scope boundary.** This is the view half of 0068. It adds no domain rule, no permission and no route.
The two concerns are separate i18n layers that happen to be administered together; the screen's job is
to make them administrable *and* to make them visibly distinct.

## 2. Detailed acceptance criteria (Given/When/Then)

The Given/When/Then criteria are the two `Feature:` blocks in [Gherkin](#gherkin) above — twenty
scenarios, each opening with a named business-role actor and carrying exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. The
checkbox-form criteria they must satisfy are in [Acceptance criteria](#acceptance-criteria). They are
indexed here rather than restated, so there is one authoritative copy of each.

Three scenarios are worth calling out as the ones a reviewer should check hardest, because each encodes
a decision rather than an obvious behaviour: *"A content language does not become a dashboard default
option"* (**D-3**/**D-4**), *"Removing the default content language requires naming a replacement"*
(**D-9**), and *"The section states that the defaults are not a personal preference"* (**D-4**).

## 3. QA test cases / validation scenarios

The full test plan is in [Tests to perform](#tests-to-perform), organised by suite and split
happy/edge/negative with a *risk if missing* line on each non-happy case. Four properties of that plan
are decisions rather than coverage, and are recorded as such:

- The **deliberate-collision test** (content default English while the dashboard default is Spanish) is
  the only test that can catch the story's central product risk. A test asserting both sections render
  is not that test.
- The **two rendering files** exist so the section separation is structural in the suite.
- The **browser layer is not optional here**: the picker's submitted value, a compiled `wire:click`, and
  a stale error surviving Cancel are all invisible to `Livewire::test()`, and this repo has shipped
  exactly those three bugs before.
- **Six blocks are explicitly not tested here** and each is attributed to the story that owns it, so a
  reviewer meets an attribution rather than a gap.

## 4. Documented functional decisions

**D-1 — One component, and the class keeps its name `App\Livewire\StoreLanguages\Index`.** This answers
0068's **Q7**, which that story deliberately left to this one. The human confirmed one component with
two sections; what remained open was the naming tension of a class named for store languages also
owning locale settings. Keep it. Three reasons: 0068 has already created the class, wired the route to
it and aliased the import in `routes/store-languages.php`, so a rename is a cross-story edit into a
file this story otherwise never opens; the screen *is* the Store Languages settings screen, with the
locale defaults a secondary section on it, exactly as `roles.blade.php` renders a permission matrix
that is not literally "roles"; and 0068's **D24** — which files the *actions* under
`app/Actions/Localization/` rather than `StoreLanguages/` — is a rule about where authorization-owning
backend code lives, not an obligation on the presentation layer, which is allowed to compose two
concerns on one screen. *Rejected:* renaming to a settings-shaped class now — more accurate, but churn
across a file this story does not need to touch, for a naming nicety.

**D-2 — The view is the flat `resources/views/livewire/store-languages.blade.php`.** The
[`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
keys on the **class name** being `Index`, not on living in a subfolder — `App\Livewire\Media\Gallery`
resolving to the *nested* `livewire/media/gallery.blade.php` is the counter-example `naming.md` records
for exactly this over-application. `StoreLanguages\Index` **is** named `Index`, so the folder name is
kebab-cased and `.index` dropped: `livewire/store-languages.blade.php`. **Phase 3 must also check for
and delete a stray `resources/views/livewire/store-languages/index.blade.php`** — task 0017 had an
`artisan make:` scaffold deposit exactly such a stub, which broke nothing and simply sat there as a
silently unused duplicate. The check is "is there a second file at the wrong path", not only "is the
right one there", and the path is resolved **by running the component**, never by reasoning.

**D-3 — The two sections are two stacked bordered panels, each with its own `flux:heading` +
`flux:subheading`, and no `flux:card`.** Verified during this debate rather than assumed: **`vendor/` is
not installed in this worktree**, so Flux Free's component set cannot be confirmed by reading the
package — and a repo-wide grep shows **`flux:card` and `flux:separator` are used nowhere in
`resources/views/`**, while `flux:heading`, `flux:subheading` and `flux:text` are all proven in
`sales-regions.blade.php`. So the layout is built from components this repo already renders, with the
panel border as plain Tailwind (`rounded-xl border border-zinc-200 dark:border-zinc-700 p-6`). *If
Phase 3 confirms `flux:card` ships in the Free tier, swapping the raw `div` for it is a safe
cosmetic follow-up* — but the story does not bet its layout on an unverified component. Each panel
carries `data-test="store-languages-section"` / `data-test="locale-settings-section"`, which is what
makes every other assertion on this screen scopeable (**R-4**).

**D-4 — The dashboard-defaults section's copy states the scope explicitly, and distinguishes itself from
the personal switcher.** The human confirmed these defaults apply **application-wide, including
signed-out visitors** on the login and welcome pages. A heading reading "Default dashboard language"
alone invites an administrator to read it as *their* language — which is a real, adjacent control that
story 0067 puts in the account menu on this very page. The section description therefore says, in
substance: *these are system-wide defaults; they apply to every dashboard visitor who has not chosen
their own language, and to the sign-in page itself — they are not your personal preference.* Copy lives
in `lang/{en,es}/localization.php` under `settings.*`, never inline.

**D-5 — No "this setting has no effect yet" notice ships, because that claim is false. This overrides
both debate participants, and it is the correction most worth reading in this file.** Both
`frontend-expert` and `frontend-qa` stated the notification default is inert and has no consumer,
faithfully following 0068's **D26**/**R-16**. **That text is stale.** Verified by reading
[`0066-admin-ui-locale-preference-backend.md`](0066-admin-ui-locale-preference-backend.md) at `HEAD`:
its **R-2** is marked *"✅ RESOLVED by the human: yes, an administrator's UI language also decides the
language of their emails"*, and its **D-14** ships the consumer —

```php
// app/Models/User.php (story 0066, D-14)
public function preferredLocale(): string
{
    return UiLocale::tryFrom((string) $this->ui_locale)?->value
        ?? LocaleSetting::defaultNotificationLocale()->value;
}
```

— with `User` implementing `Illuminate\Contracts\Translation\HasLocalePreference`, which
`NotificationSender::preferredLocale()` consults for **every** notification. So the setting's real
meaning is *"the language notifications render in for a recipient who has not chosen their own"*, and
the copy says that. Shipping an inertness notice would tell administrators a working control is broken.
*The residual, recorded rather than hidden:* 0066 is specified and not yet implemented, so if 0069 is
built before 0066's `preferredLocale()` lands, the setting is temporarily inert in fact while the copy
describes its intent. That is a sequencing matter (**R-1**), not a copy decision — and 0066's own
**R-2a** already requires 0068's `LocaleSetting` piece to be implemented before 0066's half, so the
natural order resolves it.

**D-6 — The picker is a modal holding a client-side-filtered list of act-now buttons, not a bound
select.** Three properties, each load-bearing. It is a **modal** because ~184 rows is too many to render
permanently, and every creation flow in this app is already modal. The filter is **client-side Alpine**,
directly reusing the pattern `sales-regions.blade.php` already ships for its 248-country "Show all
countries" section — verified present at that file's lines 441–484: an `x-data` scope holding a
`matchesFilter(name, code)` method, a `flux:input` bound with `x-model` and **no** `wire:model`, and
per-row `x-show`. A `wire:model.live` search hitting the server per keystroke over 184 rows is
materially worse and unprecedented here. And each row is an **act-now button**
(`wire:click="addLanguage(@js($code))"`), not a control writing a pending property — which means
**there is no bound property for a stale value to desync**, so the `null`-property/native-`<select>`
failure class in this repo's errors log is structurally impossible for this control rather than merely
avoided by discipline. *Accepted cost, stated plainly:* Flux Free ships no searchable-combobox and
story 0022 (which would add one) is unbuilt, so this is a hand-rolled filter over a button list. If
0022 lands first, this modal's contents are the natural first candidate to adopt it.

**D-7 — The picker offers the fixture minus already-active codes, and the server check stays.** Filtering
client-side is a UX nicety — it stops the screen submitting a code the backend will certainly refuse —
and is explicitly **not** a substitute for `AddStoreLanguage`'s own already-active guard, which remains
the enforcement. Note the filter subtracts **active** rows only, so a previously removed language
reappears in the picker and re-adding it reactivates its row (0068's **D5**).

**D-8 — Removed languages are not rendered anywhere on the screen.** `$languages` holds active rows only.
A removed language is, from the UI's side, indistinguishable from one never added: it simply returns to
the picker. *Rejected:* a separate "removed languages" list — the PRD asks for add/remove/set-default
and nothing more, and rendering deactivated rows would invite an administrator to read `is_active =
false` as a state they must manage rather than an implementation of "removed". See **R-7** for the one
thing this hides.

**D-9 — Removal stays a two-call backend contract, presented as one click. This answers 0068's R-4:
do not add a third parameter to `RemoveStoreLanguage`.** The two-call sequence is a *transactional*
fact, not a UX one: `removeLanguage()` calls `SetDefaultStoreLanguage` then `RemoveStoreLanguage`
back-to-back inside one Livewire method, which is exactly what 0068's **D10** anticipates in prose. The
administrator clicks Confirm once and never sees an intermediate state. D10's accepted cost — a failure
between the two calls leaves the default moved but the old language still active — is benign at this
catalog's size and self-correcting on retry, and is strictly the safer of the two orderings. Widening
the action later is additive and non-breaking; retrofitting a parameter onto a shipped, tested
two-argument action is what R-4 was actually worried about, and this story does not ask for it.

**D-10 — The removal confirmation has three states, and the more specific reason wins.** (1) Target is
neither the default nor the last active language → plain confirm, one call. (2) Target is the default
with other active languages → a **required** replacement `flux:select` fed by `replacementCandidates()`,
with Confirm disabled while `$replacementLanguageId === ''`. (3) Target is the default **and** the only
active language → no replacement select at all (there is nothing to promote) and a disabled Confirm
explaining that another language must be added first. State 3 cannot be resolved from inside the modal,
and saying so is better than offering an empty chooser. This mirrors 0068's own rule that when both
invariants apply, exactly one refusal reason is reported.

**D-11 — `translationUsageCount()` renders as a conditional line and never as a "0 usages" safety claim.
This resolves a direct conflict between the two participants.** `frontend-expert` argued for no number
by default, because "0 usages — safe to remove" falsely implies completeness when the real reason it is
0 is that 0068's `config/store-languages.php` registry ships empty. `frontend-qa` argued for rendering
the number, because a static string is untestable and asserting `0` is the vacuous-coverage shape 0068's
own **R-7** names. **Both are right, and the shape that satisfies both is:** the default confirmation
copy carries no number (*"Removing a language deactivates it. It can be re-added later, and any
existing content stays intact."*), and a **second line renders only when the count is greater than
zero**, through `trans_choice` per this repo's plural convention. Today it never renders; from story
0070 onward it appears automatically with no component change — 0068 **D8**'s "append one array literal"
property. QA's non-vacuous test survives intact: register a temporary relation in
`config/store-languages.php`, assert the line **appears** with a real count. That test asserts a state
change rather than a constant, which is exactly what R-7 asks for.

**D-12 — The two locale defaults save behind explicit Save buttons, not `wire:model.live` +
`updated{Property}()`.** The magic-hook form is the tempting one and is **not** chosen, for a stated
reason rather than a preference: with `vendor/` absent it cannot be verified whether Livewire 4's
`updated{Property}()` hook supports container-injected extra parameters, and both actions must be
container-resolved (never `new`-ed). Building on that guess is precisely the hedge this project's
errors log warns about. Explicit Save buttons are the proven pattern used everywhere else in this app.
*If Phase 3 verifies the hook by execution and prefers it, that is a legitimate change* — but it must be
run, not reasoned.

**D-13 — The sidebar entry joins the existing `settings` group, and the group's `expanded_when` is
widened.** The entry itself is the standard shape: key `store_languages` (snake_case — the config key,
the `navigation.php` leaf and the rendered `data-test="sidebar-link-store_languages"` hook are one
identifier), `route` `store-languages.index`, `current_when` `store-languages.*`, `permissions` exactly
`['store-languages.view']`. The **group** choice is `settings`, alongside Roles: this is administrative
configuration, not a new top-level domain area the way `taxes` was, and the route already lives under
`/settings/`. **The knock-on neither participant raised, found by reading the component:**
`config/modules.php`'s `groups.settings.expanded_when` is the single string `'roles.*'`, passed to
`request()->routeIs()` by `sidebar-nav.blade.php` — so as it stands the Settings group will **not**
auto-expand when an administrator is on this screen. Preferred fix: widen it to the array
`['roles.*', 'store-languages.*']` (a scalar-or-array value, so `config:cache` is unaffected), **after
verifying by execution that `routeIs()` accepts an array through that call site** — `vendor/` is absent,
so this cannot be confirmed by reading Laravel's source here. *Fallback if it does not:* leave
`'roles.*'` and accept a non-expanding group, which is cosmetic. Raised for sign-off as **Q-3**.

**D-14 — One reconciled `data-test` hook set.** The two participants proposed overlapping but different
names (`language-row-{id}` vs. `store-language-row-{id}`, and so on). The shorter set is adopted — the
screen has one kind of row, so the `store-` prefix adds length without disambiguating — with QA's
section wrappers kept because those are what make scoped assertions possible at all:

| Control | Hook |
| --- | --- |
| Section wrappers | `store-languages-section`, `locale-settings-section` |
| Add trigger / picker search / picker row | `add-language-button`, `language-picker-search`, `language-option-{code}` |
| Catalog row, its name/code cell, its default marker | `language-row-{id}`, `language-name-{id}`, `default-badge-language-{id}` |
| Row actions | `set-default-language-{id}`, `remove-language-{id}` |
| Removal modal's replacement select | `remove-modal-replacement-select` |
| Locale selects and their save buttons | `default-ui-locale-select`, `default-notification-locale-select`, `save-default-ui-locale`, `save-default-notification-locale` |
| Sidebar link | `sidebar-link-store_languages` |

Every row hook is present on **both** the enabled and the disabled branch, so a test selects the same
control either way.

**D-15 — The component runs no validation of its own.** Every user-reachable refusal is a
`ValidationException` thrown by 0068's actions, keyed `code` or `languageId`. The component declares
both as real public properties — required, because Livewire's `SupportValidation::dehydrate()` filters
the persisted error bag through `Utils::hasProperty()` and silently drops an error keyed on a name the
component does not declare, which story 0017 learned the hard way. Composing
`StoreLanguageValidationRules` into the component would duplicate a rule the action already owns and
enforces.

**D-16 — No `wire:model`-bound property is ever `null`, and `#[Locked]` covers exactly two.** `$code`,
`$languageId`, `$replacementLanguageId`, `$defaultUiLocale` and `$defaultNotificationLocale` are plain
`string`s with `''` as the "nothing chosen" sentinel matching a placeholder `<option value="">` — the
[errors-log rule](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)
applied to every control up front rather than case by case. The two locale properties are assigned real
values in `mount()` before first render. `#[Locked]` goes on `$languages` (a client-writable array of
rendered rows is a disclosure risk — the `$regions`/`$users` precedent) and `$languageId` (server-only
target tracking, bound to no input). The other three are deliberately unlocked: two are bound, and
`$code` must be writable to carry its validation-error key.

**D-17 — The browser test lives at `tests/Browser/StoreLanguages/IndexTest.php`, in the mirrored
subfolder.** `frontend-qa` proposed Feature paths but did not name a browser path. The convention is the
mirrored subfolder; the two existing flat files (`UsersIndexTest.php`, `SalesRegionsIndexTest.php`) are
recorded **debt**, not a second convention. `playwright-setup.md` states the lesson at exactly this
point: *a story file that names a test path is making a convention decision, and the path belongs in
the Phase 2 review*. Twice now that decision has defaulted to the debt; this story does not make it a
third time.

**D-18 — Per-row hints mirror the policy; domain-state disablements are separate and carry different
copy.** `canSetDefault` = `Gate::allows('update', $language)` and `canRemove` = `Gate::allows('delete',
$language)`, written onto each row by `loadLanguages()` — `allows()`, never `authorize()`, which would
throw while rendering a list. Layered *on top of* the component's own authorization, never a substitute.
Two further disablements are **domain-state, not permission**, and must read differently from the
generic refusal, following the two-distinct-tooltips pattern `sales-regions.blade.php` established: the
current default's "Set default" is disabled as *"Already the default"*, and "Remove" is disabled as
*"Set another language as default first"* or, for the last active language, *"Add another language
before removing this one"*. Both errors-log markup traps apply verbatim — an explicit `<flux:tooltip>`
wrapper on the disabled branch rather than a conditionally-bound `:tooltip` prop, and
`cursor-not-allowed!` on that wrapper rather than on the `pointer-events-none` button.

## 5. Dependencies, risks, open technical questions

### Dependencies

- **[Story 0068](0068-store-languages-catalog-backend.md)** — the entire backend contract: both models,
  both policies, all five actions, the route, the fixture reader and the placeholder view this story
  replaces. **Specified, not implemented** (see R-1).
- **[Story 0066](0066-admin-ui-locale-preference-backend.md)** — `App\Enums\UiLocale`, which this
  screen's two selects render, and `preferredLocale()`, which gives the notification default its meaning
  (**D-5**). Also **specified, not implemented**.
- **[Story 0067](0067-admin-ui-language-switcher-ui.md)** — not a code dependency, but it renders the
  personal switcher in the chrome of *this* page, which creates a real assertion collision (**R-3**).
- **No new package.** No searchable-select dependency is added; story 0022 stays unbuilt.

### Risks

- **R-1 — Both backend stories are written but not shipped, and the build order is inverted.** Verified
  against the working tree: there is no `app/Models/StoreLanguage.php`, no `LocaleSetting`, no
  `app/Actions/StoreLanguages/`, no `app/Actions/Localization/`, no `routes/store-languages.php`, no
  `lang/*/store-languages.php` and no `app/Enums/UiLocale.php`. This story is designed against a
  **written contract**, so any Phase 2 change to 0068's public surface invalidates part of it. Compounding
  it, 0066's own **R-2a** records a deliberate numbering inversion — 0066 depends on 0068's
  `LocaleSetting`. **The implementation order that satisfies everything: 0068's `LocaleSetting` piece →
  the rest of 0068 → 0066 → 0067 → 0069.** If 0069 is built before 0066, the notification default is
  temporarily inert while its copy describes its intent (**D-5**).
- **R-2 — `vendor/` is not installed in this worktree, so no Flux component's availability is verified.**
  **D-3** works around it by using only components this repo already renders, but a Phase 3 author with
  dependencies installed should confirm `flux:card` / `flux:separator` before rejecting them permanently,
  and confirm the `updated{Property}()` injection question in **D-12** by execution.
- **R-3 — Story 0067's switcher renders "English" and "Español" in the chrome of this very page**, and
  Spanish is *always* an active content language (0068's **D4** seeds it, **D7** guarantees at least one
  active language forever). So a page-global `assertSee('Español')` on this screen is ambiguous between
  the account-menu switcher and a catalog row **from the very first test written**. Every language-name
  assertion must be scoped to a row or section hook. Two-letter codes are worse still: `assertSee('es')`
  matches inside ordinary prose, route names and half the words on the page — a sharper version of task
  0018's `assertSee('0%')`-inside-`10%` trap, arriving for a different reason.
- **R-4 — This repo's documented Pest browser API has no scoped/`within()`-style assertion.** Neither
  `SalesRegionsIndexTest.php` nor the pest-testing skill exposes one, so every "scoped" assertion on this
  screen is really a `data-test` hook plus a uniquely-shaped surrounding string, the way
  `rate-region-{id}` works. Given R-3, the hook set in **D-14** is a hard requirement rather than a
  convenience, and should be agreed at Phase 2 rather than discovered mid-implementation.
- **R-5 — The Settings group's `expanded_when` is a single pattern and will not cover this route.** See
  **D-13**; the fix is an array, unverified against `routeIs()` because `vendor/` is absent.
- **R-6 — `translationUsageCount()` is a negative assertion until a relation is registered.** **D-11**'s
  design keeps the story honest, and QA's register-a-temporary-relation test is what makes it verified
  rather than merely written. Without that test the line is untestable and the helper unexercised —
  0068's own **R-7**, arriving at the view layer.
- **R-7 — Reactivating a removed language silently restores its translations, and the UI says nothing.**
  Under 0068's **D5** the row and its content persist through removal, so re-adding French brings back
  every French translation. That is the intended and desirable behaviour, but **D-8** renders removed
  languages nowhere, so an administrator re-adding a language cannot tell it from adding a fresh one.
  Harmless today (no translation tables exist), and worth revisiting in the first story that creates
  one — listed as backlog item 3 rather than solved speculatively here.
- **R-8 — "No accepted drift" on the per-row hint is provisional.** `StoreLanguagePolicy`'s body is
  0068's and unwritten; only its signatures are contracted. The likely shape is permission-only, like
  `SalesRegionPolicy`, which would give this hint no drift. **Phase 3 must re-verify the hint against the
  real policy body** rather than inheriting "no drift" from a different screen's policy shape.
- **R-9 — A forged or stale id must not reach `Gate::authorize()` as `null`.** `findOrFail()` on every
  target-resolving method; see the ⚠️ in Files to create/modify.
- **R-10 — The one-click removal is two transactions.** Accepted per **D-9**; the failure window leaves
  the default moved and the old language still active, which is benign and retryable.
- **R-11 — 0068's Q2 is still open in its own file, and answering it (b) would reshape this screen
  entirely.** Q2 asks whether the ~184 fixture entries should be pre-seeded as inactive candidate rows.
  The brief for this story states the contract as **no pre-seeding**, and everything above is designed to
  that. If Q2 is ever flipped, this screen becomes a Sales-Regions-shaped list of all candidates with
  inline toggles — a different screen, not a variation. Raised as **Q-1**.

### Open questions for the product owner

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule, each carries a recommendation
rather than a silent assumption.

**Q-1 — Confirm 0068's Q2 is settled as "no pre-seeding". _(needs an answer before Phase 3)_** The brief
for this story states it as settled and the whole design assumes it, but 0068's own file still lists Q2
as open with a recommendation rather than a decision.
- **(a) Confirmed — the fixture only validates; a row exists only once an administrator picks it — _(recommended)_.** Every decision above depends on it, and it is 0068's own recommendation.
- **(b) Reversed — pre-seed all ~184 as inactive rows.** Then this screen is a candidate list with inline toggles and **D-6, D-7, D-8 and D-10 are all void**. This would be a re-debate, not an edit.

**Q-2 — Confirm the notification-default copy describes real behaviour rather than an inert setting.
_(needs an answer before Phase 3)_** **D-5** overrides both debate participants on the strength of 0066's
D-14, against 0068's D26/R-16 which says the opposite. Two documents in this epic disagree, and the
newer one won.
- **(a) Ship copy describing it as the notification-language fallback; ship no inertness notice — _(recommended)_.** 0066's R-2 is explicitly marked resolved by you, and its D-14 ships `preferredLocale()`. Telling administrators a working control is broken is the worse error.
- **(b) Ship the inertness notice anyway**, on the grounds that 0069 might land before 0066. Costs a notice that must then be removed, and reads as unfinished.
- Either way, 0068's **D26/R-16** should be marked superseded so a third story does not inherit the stale claim.

**Q-3 — Sidebar group placement and the `expanded_when` widening.**
- **(a) Join the existing `settings` group and widen `expanded_when` to `['roles.*', 'store-languages.*']` — _(recommended)_.** This is administrative configuration under a `/settings/` URI, and the group already exists.
- **(b) Join `settings` and leave `expanded_when` as `'roles.*'`** — the group simply does not auto-expand on this screen. Cosmetic only; the correct fallback if `routeIs()` turns out not to accept an array.
- **(c) A new top-level group** (e.g. `content`) — heavier, and hard to justify for one entry.

**Q-4 — Should adding a language require a second confirmation step?** Recommended: **no** — one click,
matching 0068 **D5**'s own reversibility argument (adding is cheap and undoable). Flagged so it is a
decision rather than an assumption; removal keeps its confirmation either way.

## 6. Technical tasks for later backlog creation

Derived from this debate; **none are in scope for 0069**.

1. **Mark 0068's D26/R-16 superseded** once **Q-2** is confirmed, so no later story inherits the "the
   notification locale has no consumer" claim that 0066's D-14 has already falsified. This is the
   [stale-claim failure mode](../../docs/errors-log-archive.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)
   caught before it propagates a third time.
2. **Swap the picker's hand-rolled Alpine filter for the searchable multi-select component** if story
   0022 ever ships — this modal is its natural first consumer (**D-6**).
3. **Surface "this language was previously removed and still holds content"** in the picker, in the first
   story that creates a translation table (**R-7**). Meaningless before one exists.
4. **`ModuleRouteAccessTest.php` still covers two routes while five will exist** once this screen ships
   (users, roles, sales-regions, store-languages). Story 0017 opened that gap, 0018 did not close it,
   0068 did not either, and neither does this one. Worth one story to bring every gated route under its
   cross-gate independence assertions.
5. **Retire the two flat `tests/Browser/` files** into their mirrored subfolders, now that **D-17** makes
   the mirrored form the majority rather than the minority.
6. **Revisit `flux:card` / `flux:separator`** (**D-3**) once a Phase 3 author with `vendor/` installed can
   confirm what Flux Free actually ships.

## Provenance

**Phase 1 Three Amigos debate, 2026-08-29.** Participants: `product-owner` (facilitator),
`frontend-expert`, `frontend-qa`. Classification (frontend) was fixed by the coordinator; this story is
one of a confirmed 14-story decomposition of PRD Epic 5 and no further decomposition was performed.

**Both participants returned full contributions**, and they **agreed** on: one component with two
sections; the flat view path and its stray-stub check; a modal picker with a client-side Alpine filter
reusing the Sales Regions precedent; filtering already-active codes from the picker; the `settings`
sidebar group; the errors-log traps that apply (never-`null` bound properties, the Blaze `tooltip` prop,
`cursor-not-allowed!` placement, icon-only selectors); and — independently, from different directions —
that the two-section conflation is this story's central product risk and that language names and
two-letter codes make page-global assertions unsafe here.

**They disagreed on one point, resolved as D-11.** `frontend-expert` argued `translationUsageCount()`
should render no number, because a "0 usages — safe to remove" line falsely implies completeness;
`frontend-qa` argued it must render a number, or the assertion is the vacuous-coverage shape 0068's R-7
already names. Both arguments are sound and the shipped shape satisfies both: no number by default, a
`trans_choice` line appearing only above zero, and QA's register-a-temporary-relation test asserting the
line *appears* — a state change rather than a constant.

**Three things the facilitator resolved that neither participant raised.** *(a)* **D-5**, the correction
above: both agents stated the notification default is inert, faithfully following 0068's D26/R-16, and
both were working from text that story 0066's later reconciliation had already falsified — caught by
reading 0066 at `HEAD` rather than trusting either the brief or 0068. *(b)* **D-13**'s `expanded_when`
knock-on: `frontend-expert` recommended the `settings` group without noting that its expand pattern is a
single `'roles.*'` string, found by reading `sidebar-nav.blade.php`'s actual call. *(c)* **D-17**, the
browser-test path: `frontend-qa` named every Feature path but not the browser one, and the convention
says mirrored subfolder while both existing files sit flat.

**Two participant claims were verified rather than accepted.** `frontend-expert` flagged that `vendor/`
is absent and `flux:card` therefore unverifiable — confirmed, and strengthened: a repo-wide grep shows
`flux:card` and `flux:separator` appear in **no** view in this repo, while the components D-3 uses are
all proven in `sales-regions.blade.php`. The `matchesFilter` Alpine precedent was likewise confirmed
present at `resources/views/livewire/sales-regions.blade.php` lines 441–484, including its two-`@js()`
`x-show` — which independently corroborates the corrected errors-log finding that argument count was
never the discriminator for the `@js()` compilation trap.

**One claim in 0068 was checked and found already satisfied:** its **R-10** asks Phase 3 to check for a
missing `roles.modules.store_languages` translation leaf. Both `lang/en/roles.php` and
`lang/es/roles.php` already carry it.

**Not run by this phase**, per [workflow.md](../../docs/workflow.md): the INVEST check (Phase 2), TDD
implementation (Phase 3), security audit (Phase 4), code review (Phase 5), or the docs pass (Phase 6).
**Nothing outside this file was created or modified** — no application code, no test, no Blade view, no
config or lang file, and no sibling story's file.
