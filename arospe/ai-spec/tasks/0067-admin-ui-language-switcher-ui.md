# [0067] Admin UI language switcher — frontend

## Description
Let an administrator choose the **interface language** (Spanish or English) from **two surfaces**: a
switcher in the dashboard chrome's account menu, and a dedicated **Language tab in the account
Settings area** beside Profile / Security / Appearance. Both write through the same
`App\Actions\Users\SetUserUiLocale` and share one locale-resolution implementation, so they cannot
drift. This is the UI half of [PRD](../../docs/PRD/PRD.md#epic-5--internationalization) Epic 5's
**Layer 1 — Admin UI language switcher**; the storage, the offered pair and the per-request
resolution are sibling story **0066**'s contract, which this story **consumes and never re-derives**.
Strictly Layer 1: no relationship to Layer 2's `store_languages` catalog (story 0068), which the PRD
warns must not be conflated with it.

## Type
frontend | includes database-expert: no | related backend story: 0066 (**specified, not yet shipped** — see **R-1**)

## Gherkin

```gherkin
Feature: Admin UI language switcher (Layer 1)

  Scenario: An administrator switches the interface language to English from the account menu
    Given a signed-in administrator using the interface in Spanish
    When they choose English from the account menu's interface language switcher
    Then the interface language labels that have translations are shown in English

  Scenario: An administrator switches the interface language back to Spanish from the account menu
    Given a signed-in administrator who has just switched the interface to English
    When they choose Spanish from the account menu's interface language switcher
    Then the interface language labels that have translations are shown in Spanish

  Scenario: An administrator switches the interface language from the Settings area
    Given a signed-in administrator using the interface in English
    When they choose Spanish on the Settings area's Language tab
    Then the interface language labels that have translations are shown in Spanish

  Scenario: The Settings area offers a Language tab
    Given a signed-in administrator viewing their account settings
    When they look at the settings navigation
    Then a Language tab is listed alongside Profile, Security and Appearance

  Scenario: A choice made in the account menu is reflected on the Settings tab
    Given a signed-in administrator who has just chosen Spanish from the account menu
    When they open the Settings area's Language tab
    Then Spanish is shown as the currently selected option

  Scenario: Each surface offers only Spanish and English
    Given a signed-in administrator
    When they open either interface language surface
    Then exactly Spanish and English are offered
    And no store content language appears among the options

  Scenario: The switcher indicates the language currently in use
    Given a signed-in administrator whose interface language preference is Spanish
    When they open the account menu's interface language switcher
    Then Spanish is shown as the currently selected option

  Scenario: An administrator who has never chosen a language sees the store default selected
    Given a signed-in administrator who has never chosen an interface language
    When they open the account menu's interface language switcher
    Then the store's default dashboard language is shown as the currently selected option

  Scenario: The choice outlives the session it was made in
    Given an administrator who chose Spanish and has since signed out
    When they sign in again in a new session
    Then the interface language labels that have translations are shown in Spanish

  Scenario: The switcher is available to an administrator holding no module permissions
    Given a signed-in administrator holding no module permissions
    When they open the account menu
    Then the interface language switcher is available to them

  Scenario: The Settings Language tab is available to an administrator holding no module permissions
    Given a signed-in administrator holding no module permissions
    When they open the Settings area's Language tab
    Then the tab is served to them normally

  Scenario: The switcher is available on a narrow viewport
    Given a signed-in administrator using a narrow viewport
    When they open the account menu
    Then the interface language switcher is available to them

  Scenario: A visitor cannot reach the Settings Language tab
    Given a visitor who is not signed in
    When they request the Settings area's Language tab
    Then they are redirected to the sign-in page

  Scenario: A language outside the offered pair is refused
    Given a signed-in administrator whose interface language preference is Spanish
    When they submit an interface language outside the offered pair
    Then the change is refused
    And their stored interface language preference is unchanged
```

> **Deliberately absent:** there is **no** scenario asserting *"the menus, labels, and buttons are
> shown in English"* as a claim about the **whole** interface, even though
> [PRD](../../docs/PRD/PRD.md#epic-5--internationalization) Layer 1's own Gherkin says exactly that.
> Most dashboard chrome — including the Settings area's own tab labels — is hardcoded English with no
> translation key at all. The scenarios above are scoped to *"labels that have translations"*, a real
> and non-empty set, and the story does **not** check off the PRD clause. See **D-11**, **D-21**,
> **R-5**.

## Files to create/modify

### Surface 1 — the chrome switcher

**Livewire component** — class-based, per
[base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file)

- `app/Livewire/Settings/LanguageSwitcher.php` — new.

  ```php
  namespace App\Livewire\Settings;

  class LanguageSwitcher extends Component
  {
      use InteractsWithUiLocale;   // D-17 — currentLocale() lives here, shared
      use UserValidationRules;     // 0066's uiLocaleRules()

      public function setLocale(string $locale, SetUserUiLocale $setUserUiLocale): void
      {
          // Validate BEFORE UiLocale::from() -- see D-19.
          Validator::make(
              ['ui_locale' => $locale],
              ['ui_locale' => $this->uiLocaleRules()],
          )->validate();

          $this->applyUiLocale($locale, $setUserUiLocale, url()->previous() ?: route('dashboard'));
      }
  }
  ```

  **No `wire:model`-bound property** (**D-3**). **Method injection** of the action (**D-6**).

- `resources/views/livewire/settings/language-switcher.blade.php` — new. **Nested**, per the
  *ordinary* kebab-case mirror rule — the class is not named `Index`, so the
  [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
  does **not** apply. `App\Livewire\Media\Gallery` → `livewire/media/gallery.blade.php` is the
  precedent. **Do not create a flat `livewire/language-switcher.blade.php`.**

**Chrome — two render sites, not one** (**D-1**)

- `resources/views/components/desktop-user-menu.blade.php` — **modified**. The desktop account
  dropdown, rendered from `sidebar.blade.php:22` as
  `<x-desktop-user-menu class="hidden lg:block" … />`.
- `resources/views/layouts/app/sidebar.blade.php` — **modified**. The `<flux:header class="lg:hidden">`
  block at lines 26–78 is a **second, hand-duplicated** dropdown that does *not* include
  `<x-desktop-user-menu />`. A switcher added only to the component above is **invisible on mobile**.
  This edit also adds `data-test="mobile-menu-button"` to that block's `<flux:profile>` trigger, which
  has none today (**D-14**).

### Surface 2 — the Settings Language tab (**D-16**)

- `app/Livewire/Settings/Language.php` — new. `#[Title('Language settings')]`, a bare English literal
  matching `Profile`'s `#[Title('Profile settings')]` and `Appearance`'s verbatim (neither wraps it in
  `__()`). Uses the **same** trait and the **same** action; differs only in its redirect target
  (**D-18**).
- `resources/views/livewire/settings/language.blade.php` — new. Wrapped in `<x-settings.layout>` with
  a heading/subheading, rendering the two options in a settings-form idiom (Appearance's
  `flux:radio.group variant="segmented"` is the visual sibling) rather than the chrome's menu-item
  idiom.
- `routes/settings.php` — **modified**. One route inside the **existing `auth` + `verified` group**,
  plus its `use` import:

  ```php
  Route::livewire('settings/language', Language::class)->name('language.edit');
  ```

- `resources/views/components/settings/layout.blade.php` — **modified**. A fourth navlist item:

  ```blade
  <flux:navlist.item :href="route('language.edit')" wire:navigate>{{ __('Language') }}</flux:navlist.item>
  ```

  Bare `__('Language')`, deliberately keyless, matching its three siblings (**D-21**).

### Shared between both surfaces (**D-17**)

- `app/Concerns/InteractsWithUiLocale.php` — new. The **single** implementation of the current-value
  resolution and the persist-then-redirect behaviour:

  ```php
  trait InteractsWithUiLocale
  {
      #[Computed]
      public function currentLocale(): string
      {
          return UiLocale::tryFrom((string) Auth::user()->ui_locale)?->value
              ?? LocaleSetting::defaultUiLocale()->value;   // D-4 -- mirrors the middleware exactly
      }

      protected function applyUiLocale(string $locale, SetUserUiLocale $setUserUiLocale, string $redirectTo): void
      {
          $setUserUiLocale(UiLocale::from($locale));

          $this->redirect($redirectTo);
      }
  }
  ```

### Shared enum and translations

- `app/Enums/UiLocale.php` — **modified** (0066's file), gaining `label(): string` and nothing else.
  The *second consumer* [naming.md](../../docs/conventions/naming.md#translation-keys)'s "add `label()`
  when a second consumer appears" rule anticipates; 0066 deferred it here explicitly. Returns
  `'English'` / `'Español'` — **not** via `__()` (**D-9**). No new case, no `default()`.
- `lang/en/localization.php`, `lang/es/localization.php` — new pair, one key
  (`switcher.heading` → `'Language'` / `'Idioma'`) used by the **chrome** dropdown only. Deliberately
  **not** added to `lang/{en,es}/navigation.php`, whose purpose is mirroring `config/modules.php`'s
  registry keys (**D-10**). The Settings tab needs **no** key (**D-21**).

**Not touched by this story** — see [Scope fences](#scope-fences-what-this-story-must-not-do).

## Tests to perform

> **Read this first: `Livewire::test()` cannot prove this story's user-visible outcome, on either
> surface.** 0066 verified against installed Livewire v4.3.3 that `Testable` routes both the initial
> render and every `->call()`/`->set()` through
> `RequestBroker::temporarilyDisableExceptionHandlingAndMiddleware()`, whose body calls
> `->withoutMiddleware()`. So `App\Http\Middleware\SetUiLocale` **never runs** under a component test,
> and "after calling the switcher, the UI is in Spanish" is vacuously green even with the middleware
> deleted. Component tests below cover **only** validation and delegation.

**Browser — `tests/Browser/Localization/AdminUiLanguageSwitcherTest.php`** (new — the **chrome**
surface; mirrored-subfolder convention, **D-12**)

- [ ] **Round trip ES → EN → ES** from the account menu. Click, force a fresh page load, assert;
      click back, force a fresh load, assert. *Risk if missing:* a switcher wired on only one of the
      two options passes a one-direction test and ships dead for half the userbase — and English is
      the developer's own working language, so ES→EN is the direction that gets hand-tested.
- [ ] **Exactly two options**, scoped to `data-test="language-switcher"`, asserting the option
      **value set equals `{en, es}`** — see the ⚠️ in **D-20** before writing the assertion.
- [ ] **The active option is indicated**, matching the stored preference.
- [ ] **`ui_locale = null` renders a working control** with the store default selected, plus
      `assertNoJavaScriptErrors()`. *Risk if missing:* **the likeliest bug in the story** —
      `UiLocale::from($user->ui_locale)` throws on `null`, the state of **every account on first
      deploy**, since 0066 ships the column nullable with no backfill (**D-4**).
- [ ] **Available to an administrator holding no module permissions** (a factory user with no role).
      *Risk if missing:* this codebase gates nearly every other surface, so reflexively wrapping the
      control in `@can(...)` is a plausible silent regression hiding a self-service control from the
      staff least able to work around it (**D-8**).
- [ ] **Available on a narrow viewport.** *Risk if missing:* the live layout has **two** account
      dropdowns and the desktop one is `hidden lg:block`; a single-site implementation strands mobile,
      and no desktop-width test can see it (**D-1**).
- [ ] **Full journey persistence** — sign in via the real login form, switch, sign out via
      `data-test="logout-button"`, sign back in, assert. Exactly **one** instance (**D-15**).

**Browser — `tests/Browser/Settings/LanguageTest.php`** (new — the **Settings** surface; mirrors the
app structure, **D-22**)

- [ ] **Switching from the Settings tab changes the language.** Click the option, allow the redirect,
      assert the translated string. **One direction is enough** — the chrome test already proves the
      underlying mechanism is symmetric, and both surfaces share one `applyUiLocale()` (**D-17**), so
      a second full round trip here buys nothing.
- [ ] **Exactly two options on this surface too**, scoped to `data-test="settings-language-switcher"`.
      This is **not** a duplicate of the chrome assertion: the settings view is a *different markup
      family* (a settings-form idiom, not menu items), so it is a second implementation of the same
      constraint (**D-20**).
- [ ] **The active option is indicated on this surface**, read through the shared `currentLocale()`.
      *Risk if missing:* the trait guarantees one *implementation* of the read, but not that this
      view actually **calls** it — a view hardcoding the selected state would pass every other test
      here (**D-17**).
- [ ] **Cross-surface reflection**: switch from the chrome, then open the Settings tab and assert the
      new value is shown selected. One test, one direction. Cheap precisely **because** the trait
      makes logic drift structurally unlikely — what this guards is the *wiring*, not the logic
      (**D-17**).
- [ ] ⚠️ **Hook-collision safety** — every assertion on this page must be scoped to the
      settings-surface hooks, because the chrome switcher **co-renders here** (**D-20**).

**Feature — `tests/Feature/Settings/LanguageTest.php`** (new; per-screen naming, matching the real
`tests/Feature/Settings/` convention — `EmailChangeTest`, `ProfileUpdateTest`, `SecurityTest`)

- [ ] **A guest is redirected to `login`.** `$this->get(route('language.edit'))->assertRedirect(route('login'))`.
      The one real route-level control.
- [ ] **A signed-in user holding zero module permissions gets 200.**
- [ ] **The Language tab renders in the settings navigation** — assert from an *existing* settings
      page (`route('profile.edit')`), since that is where a user actually encounters the link.
- [ ] ⚠️ **Do NOT write a `verified`-refusal test.** `App\Models\User` does not implement
      `MustVerifyEmail`, so `verified` refuses **nobody** on any route in this app — a test asserting
      it cannot go red however it is written. This is a recorded, previously-paid-for lesson
      ([errors-log.md](../../docs/errors-log.md#a-planned-test-asserted-a-refusal-by-verified-a-middleware-that-refuses-nobody-in-this-app--2026-08-20)).

**Feature — `tests/Feature/Localization/LanguageSwitcherTest.php`** (new; the shared behaviour, tested
once)

- [ ] A forged locale (`'fr'`, `'EN'`, `'en-US'`, `''`) via
      `Livewire::test(LanguageSwitcher::class)->call('setLocale', …)` is refused and **the database
      value is unchanged**. Assert the row, **not** an error message — see **D-19** for why the
      message is deliberately not assertable here.
- [ ] The same refusal against `Livewire::test(Language::class)` — the settings component. Both
      surfaces are independently reachable over `/livewire/update`, so both need the guard proven.
- [ ] `currentLocale()` returns the store default for `ui_locale = null`, and for a stale stored value
      written past the model with `DB::table('users')->update(['ui_locale' => 'fr'])` (the model layer
      would refuse to create that fixture). Arrange the `locale_settings` row with `updateOrCreate`,
      never `factory()->create()` — 0068's singleton has a fixed primary key.

**Prove-it-can-fail steps (mandatory before the assertions are trusted)**

- [ ] **Exactly-two-options**: render a third decoy option, confirm **red**, revert. Required by this
      repo for any count/set assertion after the `<ui-checkbox-group>` over-count incident.
- [ ] **Round trip**: make `applyUiLocale()`'s action call a no-op, confirm the chrome browser test
      goes **red**, restore. The browser-level equivalent of 0066's "move the middleware off the `web`
      group and confirm red".
- [ ] **Hook collision** (**D-20**): temporarily give the settings surface the chrome's *unsuffixed*
      hooks, re-run the settings browser test, and confirm it either errors on an ambiguous locator or
      — worse — **passes while driving the chrome control**. Verify which by additionally no-op'ing
      the chrome control and seeing whether the test then fails. Restore the suffixed hooks. Skipping
      this leaves open exactly the failure it guards: a green test that never touched the surface it
      claims to.

**Explicitly not tested** (per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md))

- Everything in 0066's `UiLocaleResolutionTest` / `UiLocaleLivewireRoundTripTest` /
  `SetUserUiLocaleTest` / `PreferredLocaleTest` — guest fallback, leak-forward, stale stored values,
  the Livewire round-trip, the action's cross-user refusal and notification locale are proven there.
- **A second full sign-out/sign-in journey through the Settings surface** — 0066 proves persistence at
  the HTTP layer and this story spends its **one** accepted browser journey on the chrome (**D-15**).
- **A second round-trip direction on the Settings surface** — shared `applyUiLocale()` (**D-17**).
- `App::setLocale()`, `Rule::enum()`, Flux and Livewire internals — vendor behaviour.
- **Full UI translation coverage** — out of scope by **D-11**/**D-21**.
- Firefox/WebKit — this repo verifies Chromium only.
- Step-up/password confirmation — the Settings route deliberately carries no `password.confirm`
  (**D-16**); do not invent a requirement it does not have.

## Expected outcome
Every signed-in administrator can set their interface language from **two** places — the account menu
on any screen, and a dedicated Language tab in Settings — each offering exactly Spanish and English
and showing which is active. Either surface persists the choice to their own `users` row through
`SetUserUiLocale` and re-renders the panel so that every string which **has** a translation appears in
the chosen language, verifiably the sidebar navigation. The choice survives sign-out and sign-in, and
a change made on one surface is reflected on the other. The rest of the chrome — including the
Settings area's own tab labels — remains hardcoded English in both locales; this story does not change
that and does not claim to.

## Acceptance criteria
- [ ] A language control renders in the account menu for **every** authenticated user, on both desktop
      and narrow viewports, with no permission check anywhere in its path.
- [ ] A **Language tab** renders in the settings navigation beside Profile / Security / Appearance, and
      `GET settings/language` serves it to any authenticated user and redirects a guest to `login`.
- [ ] Each surface offers **exactly** Spanish and English, and no store content language.
- [ ] Each surface indicates which language is currently in effect, resolved through the **one shared**
      `currentLocale()` — `tryFrom(...) ?? LocaleSetting::defaultUiLocale()->value`, never `from()`,
      and never a second copy of the expression.
- [ ] Both surfaces persist via `App\Actions\Users\SetUserUiLocale`; neither writes `users.ui_locale`
      directly, and neither re-implements the offered pair.
- [ ] After choosing on either surface, the administrator sees translated labels change **without
      manually reloading**; the chrome returns them where they were, the Settings tab stays on itself.
- [ ] A value outside `en`/`es` submitted to **either** component is refused and leaves the stored
      value unchanged.
- [ ] An account with `ui_locale = null` renders both surfaces correctly with the store default
      selected, and raises no error.
- [ ] The two surfaces carry **distinct** `data-test` hooks, so a test on the settings page can target
      each unambiguously despite the chrome switcher co-rendering there.
- [ ] No `config/modules.php` entry, no permission, no migration, no change to
      `sidebar-nav.blade.php`, and no `password.confirm` on the new route.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule).
- [ ] All **three** quality gates run **unscoped** and each result recorded explicitly, including any
      not run: `php artisan test` (not `--filter`), `vendor/bin/pint --format agent` (not `--dirty`),
      and **Larastan level 7** (`vendor/bin/phpstan analyse`)
      ([errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26)).
- [ ] All **three** prove-it-can-fail steps performed and their red result recorded.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor).
- [ ] Documentation updated (docs-keeper): `docs/api/routes.md` gains the **`language.edit` route row**
      and a note that the chrome switcher is a **routeless, permission-free Livewire surface** (the
      second after `Media\Gallery`, and the first that is also *ungated*);
      `docs/conventions/base-standards.md`'s directory listing describes `app/Concerns/` as
      *"Shared traits (validation rule sets)"* and must be widened — `InteractsWithUiLocale` is that
      folder's first non-validation trait; `docs/conventions/naming.md` records `UiLocale::label()`
      arriving as the anticipated second consumer, `localization.php` as a lang file that is *not* a
      registry mirror, and the `InteractsWith*` trait-naming precedent.
- [ ] **This story does NOT claim the interface is fully translated.** It delivers two controls and
      proves locale resolution reaches the render for strings that have translation keys. The PRD's
      *"the menus, labels, and buttons are shown in English"* clause is **not** satisfied here and must
      not be checked off (**D-11**, **D-21**, **R-5**).
- [ ] Acceptance criteria met.

---

## 1. Refined user story

**As** an administrator using the Arospe backoffice,
**I want** to switch the panel's interface language between Spanish and English — quickly from the
account menu, or deliberately from my account settings —
**so that** I can work in my own language without asking anyone to change a setting for me, and
without re-selecting it every time I sign in.

This story delivers **two controls over one preference**. It does not deliver translated copy for the
parts of the interface that have none (**R-5**), and it does not deliver the storage or resolution
mechanism, which is story 0066's (**R-1**).

## 2. Detailed acceptance criteria (Given/When/Then)

See the [Gherkin](#gherkin) section — fourteen scenarios, each opening with a named business-role
actor and carrying exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. The
deliberately-narrowed `Then` wording ("labels that have translations") is explained in the callout
beneath that block.

Terminology follows 0066's: **interface language** (Layer 1) throughout, never "store language"
(Layer 2, story 0068). 0066's Definition of Done already carries the follow-up adding both terms to
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md)'s domain glossary, which
has a row for neither today; this story reuses the term rather than inventing a third spelling.

## 3. QA test cases / validation scenarios

See [Tests to perform](#tests-to-perform). The five that would otherwise pass for the wrong reason:

1. **Nothing about rendered language may be asserted through `Livewire::test()`** — it disables the
   middleware that resolves the locale, so such a test cannot fail.
2. **The `ui_locale = null` case is the story's likeliest real bug**, because it is the state of every
   existing account and the natural-looking `UiLocale::from(...)` throws on it.
3. ⚠️ **The `{en, es}` value-set assertion is BLIND to duplication** — the single sharpest finding of
   this round, and it inverts advice this file previously gave. Asserting the option *set* rather than
   a count was chosen so the test survives unrelated future controls. But the chrome switcher
   **co-renders on the settings page**, so a settings-page assertion sees `en`/`es` **twice** — and two
   duplicated pairs still reduce to the set `{en, es}`. The set comparison protects against an *extra*
   option and is defenceless against *the same options rendered twice*. Only **scoped, distinct hooks**
   plus a scoped count catch it (**D-20**).
4. **The round trip must force a fresh page load between click and assertion** — a partial Livewire
   re-render updates only the component's own subtree, so asserting on the same round-trip's DOM
   proves nothing about the sidebar (**D-5**).
5. **The forged-locale test must assert the database row, never an error message** — this component
   declares no bound property, so Livewire drops the error-bag entry entirely (**D-19**).

⚠️ **Two string-choice traps, verified in this repo rather than assumed** (**D-13**):

- `navigation.items.roles` is `'Roles & permissions'` / `'Roles y permisos'` — **both contain
  `Roles`**, so it cannot prove a switch happened.
- `'Dashboard'` is contaminated for the **English** direction: `resources/views/dashboard.blade.php:1`
  passes a bare `__('Dashboard')` page title, and this repo has **no** `lang/en.json` / `lang/es.json`,
  so the translator echoes it verbatim in *both* locales. A page-global `assertSee('Dashboard')`
  passes even on a completely dead switcher. `'Panel de control'` *is* safe for the Spanish direction.
- ✅ **Safe pair:** `navigation.items.sales_regions` — `'Sales Regions'` / `'Regiones de venta'`, no
  overlap either way. Better still, scope to `data-test="sidebar-link-sales_regions"`.

⚠️ **Waiting rule, load-bearing here rather than merely cited.** Both round-trip tests assert *after* a
navigation — exactly the shape that tempts `->waitForEvent('networkidle')`, the one call
[playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded)
**bans outright** (it never settles here; one session leaked ~60 `playwright run-server` processes and
OOM-killed the MySQL container). The accepted mitigation is a short **bounded** `->wait(n)` with an
inline comment stating what it compensates for — and before reaching for even that, check whether the
symptom is *"the click never registered"* (a compiled-Blade problem this repo has hit) rather than
timing.

## 4. Documented functional decisions

- **D-1 — The chrome switcher goes in the account dropdown, and that means editing TWO files.**
  ⚠️ **The two amigos contradicted each other and the contradiction is recorded rather than smoothed
  over, because one was working from dead code.** `frontend-qa` reported that `<x-desktop-user-menu />`
  renders once inside `<flux:header>`, is not viewport-gated, and so covers mobile "for free". That is
  **false for the live layout**, verified directly rather than by preferring an amigo:
  `resources/views/layouts/app.blade.php` binds **only** `x-layouts::app.sidebar`;
  `resources/views/layouts/app/header.blade.php` is referenced from **nowhere**
  (`grep -rn "app.header" resources/ app/` → no hits) and is dead starter-kit code — and it is the file
  `frontend-qa` traced. In the live `sidebar.blade.php`, `<x-desktop-user-menu class="hidden lg:block" />`
  (line 22) is **desktop-only**, and the mobile account menu is a **separate hand-duplicated**
  `<flux:header class="lg:hidden">` block (lines 26–78). `frontend-expert` had this right. **So
  `frontend-qa`'s premise was wrong while its warning was right, and sharper than it realised.** Ship
  the control in both places. **Rejected:** refactoring the mobile block to reuse the component — the
  better end state, but it widens the diff into an unrelated cleanup.
- **D-2 — `App\Livewire\Settings\LanguageSwitcher` → `livewire/settings/language-switcher.blade.php`,
  nested.** Not named `Index`, so the `Index`-in-a-subfolder exception does not apply.
  [naming.md](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
  flags this over-application as the live trap ("the exception keys on the class name, never on living
  in a subfolder"). **Resolve the view path by running the component**, and check no `artisan make:`
  scaffold has left a second unused stub at the wrong path — task 0017 hit that half.
- **D-3 — No `wire:model`-bound property; each option is a `wire:click` action.** Not a form collecting
  a pending choice but a list of act-now controls, the idiom every row action in this app already uses.
  It also sidesteps
  [the `null`-property/native-`<select>` failure class](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)
  **structurally rather than by discipline** — there is no bound property for a stale `null` to sit in.
- **D-4 — ⚠️ CORRECTED: the fallback is `LocaleSetting::defaultUiLocale()->value`, not
  `config('app.locale')`.** Read the current value with
  `UiLocale::tryFrom((string) $stored)?->value ?? LocaleSetting::defaultUiLocale()->value`, never
  `from()`. **This decision previously quoted `config('app.locale')` and that quote was stale** — 0066
  was substantially revised mid-Phase-1 and now delegates the fallback to story 0068's
  `LocaleSetting` singleton, with `config('app.locale')` demoted to a third tier reached only *inside*
  that accessor. The *principle* was already right and is what made the correction cheap: this
  expression is copied from the middleware **on purpose**, because two fallback expressions for one
  concept is the second-source-of-truth 0066's own D-6 refuses. `defaultUiLocale()` returns a
  `UiLocale`, never a string, so `->value` is required. `UiLocale::from(null)` is a `TypeError` and
  `from('fr')` a `\ValueError`, and `null` is the state of **every account on first deploy** since 0066
  ships the column nullable with no backfill. See **R-8** for how this correction was caught.
- **D-5 — Persisting is not enough; the story must force a fresh request.** `SetUiLocale` runs at the
  **top** of the very request the `wire:click` triggers, so it reads the **old** `ui_locale` and sets
  the old locale for that entire request; `SetUserUiLocale` writes afterwards. Worse, a normal Livewire
  round-trip re-renders **only the component's own subtree** — the sidebar is a plain Blade include
  outside it. The fix is a redirect after persisting, re-entering the middleware against the updated
  row.
  ⚠️ **Explicitly hedged; Phase 3 must settle it by execution:** `frontend-expert` could not verify
  whether `$this->redirect($url)` defaults to a hard browser redirect or a soft `wire:navigate` morph,
  because `vendor/` is absent (**R-7**), and said so rather than asserting. Per
  [the hedge rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24),
  **do not build a fix around either answer** — run the browser test and assert the sidebar re-renders.
- **D-6 — `SetUserUiLocale` is method-injected into `setLocale()`.** The
  [constructor-injection exception](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)
  is for an *action* whose `__invoke()` is a public contract; a Livewire action method has no such
  contract. Do **not** reach for `app(...)`: its one licence here is a zero-parameter `#[Computed]`
  method, which `setLocale()` is not.
- **D-7 — Both components call the action; neither writes the column.** 0066 makes `SetUserUiLocale`
  the single writer and derives the self-only rule from `Auth::user()` internally, so neither surface
  passes a target argument.
- **D-8 — No permission gate, and no `config/modules.php` entry.** Setting your own interface language
  is self-service and identical for a roleless account and a Super Admin; 0066 introduces no policy and
  no permission, and neither does this story. The registry is for **permission-gated routes**, filtered
  through `Gate::any()` — the chrome switcher is not a route at all, and while the Settings tab *is* a
  route, it is an account-settings screen like Profile/Security/Appearance, none of which appear in the
  registry either. `sidebar-nav.blade.php` and `lang/{en,es}/navigation.php` stay untouched.
- **D-9 — The option labels are `'English'` and `'Español'`, hardcoded, not `__()` keys.** A language
  switcher lists each language **in its own language**, so a user who cannot read the current UI
  language can still find theirs. Translating them (Spanish chrome showing "Inglés") is wrong for
  *this* control. They live on `UiLocale::label()`, shared by both surfaces.
- **D-10 — A new `lang/{en,es}/localization.php`, not `navigation.php`.** `navigation.php` mirrors
  `config/modules.php`'s keys one-for-one; a non-registry key there breaks the one-identifier property
  that makes the registry reviewable.
- **D-11 — The outcome is two working controls plus *partial* visible translation, and it says so.**
  Verified: `<x-sidebar-nav />` resolves group headings and item labels through `__()` and
  `lang/es/navigation.php` is fully populated, so the sidebar genuinely switches. Equally verified: the
  account dropdown's own `__('Settings')` / `__('Log out')` — inside the very component the chrome
  switcher lives in — have **no** matching key and render identical English in both locales. See
  **D-21** and **R-5**.
- **D-12 — `tests/Browser/Localization/AdminUiLanguageSwitcherTest.php` for the chrome surface.**
  [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#folder-structure) records that
  **a story file naming a test path is making a convention decision**, that the mirrored subfolder is
  the convention, and that the two flat files are *debt, not precedent*. The chrome switcher is not a
  screen, so a cross-cutting `Localization/` folder is right for it — mirroring 0066's own
  `tests/Feature/Localization/`.
- **D-13 — The assertion string is `sales_regions`, or a `data-test`-scoped selector.** Both amigos
  converged on the need for care and between them found the two traps recorded in §3.
- **D-14 — The mobile dropdown's trigger gains `data-test="mobile-menu-button"`.** The desktop trigger
  already carries `data-test="sidebar-menu-button"`; the mobile `<flux:profile>` has none, so the
  narrow-viewport scenario would be untestable. A hook added to make a required scenario reachable is
  part of the story, not scope creep.
- **D-15 — Keep exactly one full sign-out/sign-in browser journey**, on the chrome surface.
  `frontend-qa` flagged the cost/value tradeoff rather than assuming: 0066 proves persistence
  exhaustively at the HTTP layer, so this is the PRD's scenario acted out end to end. One instance is
  worth its cost; a second, on the Settings surface, would not be.

### Decisions added by the second surface

- **D-16 — The Settings tab is `GET settings/language`, named `language.edit`, in the existing
  `auth` + `verified` group.** ⚠️ **The amigos split and this resolves against `frontend-qa`.**
  `frontend-qa` recommended the bare `auth` group (matching `profile.edit`) on the grounds that it is
  the more honest signal for a screen with no permission check. `frontend-expert` recommended
  `auth` + `verified` (matching `appearance.edit`), and its reasoning is more specific and wins:
  `profile.edit` sits in the bare group **for a reason that does not apply here** — an unverified or
  pre-activation user must still reach their profile to drive the email-verification flow, which is
  exactly the deadlock `routes/settings.php`'s own comment describes for `email-change.confirm`. A
  language preference has no such role. `Appearance` — a self-service, identity-agnostic display
  preference — is the correct middleware sibling. **No `password.confirm`**: unlike `security.edit`
  there is no step-up-worthy write here. Both amigos independently noted, correctly, that the choice is
  *functionally* inert either way, since `verified` refuses nobody in this app — so this is a
  signalling decision, and it is recorded as one rather than presented as a behavioural one.
  Route naming follows the existing `<resource>.edit` shape, and `Language` is imported into
  `routes/settings.php` like its three siblings.
- **D-17 — The two surfaces share `App\Concerns\InteractsWithUiLocale`; they do not share markup, and
  they are not one embedded component.** ⚠️ **The amigos split here too, and this resolves against
  `frontend-qa`**, which recommended embedding `<livewire:settings.language-switcher />` in the
  settings page so there is literally one implementation. `frontend-expert` rejected embedding with two
  arguments, one of which is a plain fact about the shipped DOM rather than a matter of taste:
  **(a)** the chrome switcher's view is built to render *inside an open `<flux:menu>`*, so dropping it
  into `<x-settings.layout>`'s content slot is a structural mismatch against the form idiom every other
  settings tab uses; and **(b)** the chrome control already renders **twice per page** (desktop and
  mobile, both in the DOM, only CSS-hidden), so embedding a third instance as the page body would put
  **three simultaneous copies of one control on one screen**. That is decisive. A shared Blade partial
  (option b) was also rejected: the two surfaces plausibly want different Flux component *families*,
  and a partial emitting both would need internal branching that cancels the benefit. What is genuinely
  identical is the **data and the behaviour**, not the markup — so a trait carries `currentLocale()`
  and `applyUiLocale()`, and each component keeps its own thin `setLocale()` and its own view. This is
  also what keeps **D-4**'s single-source-of-truth property intact one level up: a second component
  re-deriving the fallback expression would recreate precisely the drift 0066's D-6 refuses, between
  two components instead of between a component and the middleware. `app/Concerns/` is the right home
  — this repo's existing "shared traits composed at the consumer" folder — but note it holds **only**
  `*ValidationRules` traits today, so this is its first non-validation inhabitant and
  [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)'s one-line
  description of the folder needs widening in the docs pass.
  ⚠️ **Sequencing:** build `LanguageSwitcher` consuming the trait **from the start**, in the same
  implementation pass — do not ship it with inline logic and treat extracting the trait as optional
  cleanup afterwards.
- **D-18 — The redirect target differs per surface, deliberately.** Chrome →
  `url()->previous() ?: route('dashboard')`, keeping the administrator where they were, since the
  switcher is reachable from any page. Settings → **`route('language.edit')`**, staying on the tab so
  the user sees their choice reflected, which is the contract every settings screen implies. It is a
  named route rather than `url()->previous()` for a second, defensive reason `frontend-expert` raised
  as an explicit hedge: every `flux:navlist.item` in the settings nav carries `wire:navigate`, and
  whether `Session::previousUrl()` updates as expected across a soft navigation is exactly the kind of
  vendor-internal claim this repo forbids asserting unverified. A named target sidesteps the question
  instead of betting on it. The target is passed as a parameter to `applyUiLocale()` precisely so the
  shared trait does not have to know which surface called it.
- **D-19 — Validation runs BEFORE `UiLocale::from()`, and the refusal is a guard rather than a
  user-facing message.** ⚠️ **This corrects the shape `frontend-expert` proposed.** Its snippet used
  `$this->validateOnly('locale', …)`, but Livewire's `validateOnly()` validates a **declared component
  property**, and **D-3** deliberately gives this component none — so that call has nothing to operate
  on. The correct shape is an explicit `Validator::make(['ui_locale' => $locale], ['ui_locale' =>
  $this->uiLocaleRules()])->validate()`. Two consequences worth stating rather than discovering:
  **(a)** the order is load-bearing — `UiLocale::from()` on an unvalidated forged value is a
  `\ValueError` and therefore a **500**, not a validation refusal, so validating first is what makes
  the story's own "a language outside the offered pair is refused" scenario true rather than a crash;
  and **(b)** because the component declares no bound property, Livewire's
  `SupportValidation::dehydrate()` filters the persisted error bag through `Utils::hasProperty()` and
  **drops the message entirely** — the same mechanism task 0017 recorded. That is *acceptable here and
  is not a defect to fix*: the only way to reach this branch is tampering, since the rendered control
  can emit nothing but `en` or `es`, so no legitimate user ever needs to read the message. It is,
  however, exactly why the test asserts **the database row** and not an error message.
- **D-20 — The two surfaces carry distinct `data-test` hooks, and the "exactly two options" assertion
  must be scoped and counted, not set-compared.** Chrome keeps `language-switcher` /
  `language-option-en` / `language-option-es`; the Settings surface uses
  **`settings-language-switcher` / `settings-language-option-en` / `settings-language-option-es`**.
  This is not tidiness. Verified independently: `config/livewire.php` sets
  `'component_layout' => 'layouts::app'`, no settings component overrides it with `#[Layout]`, and
  `layouts/app.blade.php` binds `x-layouts::app.sidebar` unconditionally — so **the chrome switcher
  co-renders on the Settings page**, and unsuffixed hooks would match **twice**. `frontend-qa` then
  found the consequence that actually matters and that **inverts this file's earlier advice**: the
  `{en, es}` *value-set* assertion, chosen so the test would survive story 0068 adding unrelated
  options, is **structurally blind to duplication**, because two identical pairs still reduce to the
  same set. A scoped **count** is what catches it. An ambiguous click target is the other half — it
  either errors loudly or, worse, silently drives the chrome control while the test claims to be
  proving the settings one. Hence the mandatory collision prove-it-can-fail step.
- **D-21 — The Settings tab's label, heading and subheading stay bare, keyless `__()` calls, matching
  its three siblings — and the resulting irony is recorded, not fixed here.** Verified by
  `frontend-expert` and confirmed by grep: `grep -rn "'Profile'\|'Security'\|'Appearance'\|'Settings'" lang/`
  returns **zero** matches, and *every* existing settings screen is uniformly untranslated at *every*
  level — nav label, page heading and subheading alike. Adding one real key for this one tab would
  create the **first** inconsistency in an otherwise 100%-uniform family, rendering
  "Profile / Security / Appearance / **Idioma**" to a Spanish-speaking administrator — which reads
  worse than uniform English, not better. ⚠️ **The tension is real and is stated rather than resolved:
  a language-settings screen that cannot itself be translated is a visible defect, and it is most
  visible on precisely the screen where a user is thinking about language.** It is nonetheless *the
  same* defect the whole settings area already has, so it belongs to **R-5**'s sweep — which must now
  cover **four** navlist items plus each screen's heading/subheading, not three. Fixing a quarter of it
  inside this story would either leave the inconsistency above or invite an unscoped drive-by rewrite
  of a screen this story has no other reason to touch.
- **D-22 — Test paths for the second surface: `tests/Feature/Settings/LanguageTest.php` and
  `tests/Browser/Settings/LanguageTest.php`.** The Feature path follows the real, verified convention
  in that folder — `EmailChangeTest.php`, `ProfileUpdateTest.php`, `SecurityTest.php`, per-screen
  naming with no `*RenderingTest` split. The browser path **resolves against `frontend-qa`**, which
  proposed `tests/Browser/Localization/SettingsLanguageSwitcherTest.php` as a sibling to the chrome
  test on "the technique differs materially" grounds. That reasoning is sound for the *chrome*
  switcher, which is not a screen — but the Settings tab **is** a screen backed by
  `App\Livewire\Settings\Language`, and
  [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#folder-structure) names
  **`tests/Browser/Settings/`** explicitly as an example of the mirrored structure it says is still the
  convention. Following the documented convention where it plainly applies beats extending a
  cross-cutting folder, especially in a repo that has recorded the mirrored convention "losing by
  default" twice. The two surfaces therefore sit in different folders **for a stated reason** — chrome
  is cross-cutting, the tab mirrors its component.

### Scope fences: what this story must NOT do

Stated in terms of **classes**, per the
[errors-log rule](../../docs/errors-log.md#a-scope-exclusion-named-screens-while-the-story-edited-a-class-those-screens-share--2026-08-24)
that a screen-shaped exclusion cannot bind shared code:

- `App\Http\Middleware\SetUiLocale` — **untouched**. Already global via 0066's `bootstrap/app.php`
  registration; this story registers no middleware and does not edit `bootstrap/app.php`.
- `App\Actions\Users\SetUserUiLocale` — **called from both surfaces, never modified**, and never passed
  a target argument.
- `App\Models\User` and `App\Models\LocaleSetting` — **untouched**. This story only *reads*
  `ui_locale` (through the shared trait) and *calls* `LocaleSetting::defaultUiLocale()`. It adds no
  column, no cast, no `#[Fillable]` entry, and does not touch `HasLocalePreference` or
  `preferredLocale()`, which are 0066's (**D-14** there).
- `App\Enums\UiLocale` — the single exception: `label()` is added (**D-9**). No new case, no
  `default()`.
- `App\Concerns\UserValidationRules` — **consumed, not modified**; `uiLocaleRules()` is 0066's.
- `App\Livewire\Settings\Profile`, `Security`, `Appearance` — **untouched**. The settings *layout*
  gains one navlist item; none of the three sibling components changes, and `Appearance`'s
  client-side-only shape is explicitly **not** copied (**D-16**, **D-18**).
- `config/modules.php`, `resources/views/components/sidebar-nav.blade.php`,
  `lang/{en,es}/navigation.php`, `database/**` — **untouched** (**D-8**).
- `resources/views/layouts/app/header.blade.php` — **untouched**. Dead code (**R-6**); editing it would
  create the illusion of coverage on a file nothing renders.
- `App\Livewire\Users\Index`, `Roles\Index`, `SalesRegions\Index`, `Media\Gallery` — untouched.

## 5. Dependencies, risks, open technical questions

- **R-1 — BLOCKING DEPENDENCY: story 0066 is specified but NOT implemented, and it now depends on 0068
  in turn.** Re-verified during this revision: `app/Enums/UiLocale.php`, `app/Http/Middleware/` (the
  directory itself), `app/Actions/Users/SetUserUiLocale.php`, `app/Models/LocaleSetting.php` and any
  `ui_locale` reference in `app/Models/User.php` **do not exist**, and 0066 sits at
  `ai-spec/tasks/0066-…md` — the **new** stage, not `done/`. The real build order is **0068's
  `LocaleSetting` → 0066 → 0067**, which 0066's own **R-2a** records as a deliberate, documented
  inversion of [workflow.md](../../docs/workflow.md#task-ordering-rule)'s numbering rule. **Phase 2
  must confirm both predecessors have closed before this story is picked up.**
- **R-2 — This story is written against a contract that has not survived its own implementation.**
  Because 0066 is unshipped, its Phase 2/3 could still move what this story binds to. Findings here are
  written as **properties that must hold** rather than as patches, for exactly that reason. **Before
  Phase 3, re-verify every 0066/0068 symbol named here against `HEAD` and record each disposition.**
  ⚠️ This is no longer hypothetical — see **R-8**.
- **R-3 — `$this->redirect()`'s navigation semantics are unverified.** See **D-5**. An implementation
  fact to settle by running the browser test, not by reading documentation.
- **R-4 — The exact Flux components are unconfirmed** on both surfaces. `frontend-expert` proposed
  `flux:menu.radio.group` / `flux:menu.radio` for the chrome and a `flux:radio.group`-family control
  for the settings page (matching `Appearance`'s segmented idiom), but could not check the installed
  stubs (**R-7**). Phase 3 should confirm against
  `vendor/livewire/flux/stubs/resources/views/flux/`. Two known Flux/Blaze traps are recorded as **not
  applying**: the conditionally-bound `tooltip` prop and the `disabled:cursor-*` /
  `pointer-events-none` interaction both require a disabled branch, and neither control has one.
  `@js()` **is** safe in a `flux:` tag's attribute — the
  [corrected errors-log entry](../../docs/errors-log.md#two-directive-calls-in-one-blade-component-tags-attribute-string-silently-fail-to-compile--2026-08-26)
  establishes by execution that only an anonymous `<x-…>` tag fails to compile it.
- **R-5 — OPEN, for Phase 2: who owns extracting the hardcoded English chrome?** The PRD's Layer 1
  `Then` clause is only partially satisfiable, and neither 0066 nor 0067 satisfies it. This story makes
  the gap **more visible, and slightly larger**: a working switcher now demonstrates it on screen, and
  the new Settings tab's own label/heading/subheading join the untranslated set (**D-21**). The sweep
  must cover **four** settings navlist items plus their headings and subheadings, plus the account
  menu's `__('Settings')` / `__('Log out')`. **Phase 2 must confirm some story in the 14-story Epic 5
  decomposition owns this — and if none does, that is a decomposition gap, not a defect in 0066/0067.**
- **R-6 — `resources/views/layouts/app/header.blade.php` is dead code, and it already misled one
  amigo.** Verified unreferenced. It holds stale copies of the chrome — a hardcoded mobile drawer
  ignoring the `config/modules.php` registry, and a bare `__('Dashboard')` — and `frontend-qa` traced
  it in good faith and drew a wrong conclusion about the live layout from it (**D-1**). Recommend
  deleting it in a **separate** cleanup story; leaving it unmentioned invites the same mistake again.
- **R-7 — `vendor/` is not installed in this worktree.** Neither amigo could verify Livewire or Flux
  internals locally, and both flagged their claims as hedges. Any vendor-dependent claim here is
  provisional and must be re-checked in Phase 3.
- **R-8 — NEW: 0066's contract changed underneath this story *during* Phase 1, and one decision here
  was already stale.** 0066 was substantially revised after this file's first draft: its fallback moved
  from `config('app.locale')` to `LocaleSetting::defaultUiLocale()` (story 0068's singleton), and it
  now implements `HasLocalePreference` so notification emails follow the same preference. **D-4** was
  corrected in place as a result. This is **R-2 materialising with a fuse measured in hours rather than
  stories**, and it is recorded rather than silently fixed because it is evidence for the rule, not
  just an edit: the correction was cheap **only** because D-4 was written as a property ("mirror the
  middleware's expression") rather than as a literal patch. Phase 3 must re-verify regardless.
- **R-9 — NEW, cross-story and NOT this story's to fix: 0068 is now stale about 0066.** Story 0068's
  **D26** and its open **Q5** both state that 0066 *"deliberately does not implement
  `HasLocalePreference`"* and that `default_notification_locale` therefore has **no consumer**. 0066's
  current version records the opposite — its **R-2** is resolved and **D-14** implements it, making
  0066 that setting's first consumer. So 0068 carries a stale claim and an open question that has
  already been answered elsewhere. Flagged for whoever owns 0068; **this story deliberately does not
  edit either file**, per its instructions.
- **Dependency — story 0068 (Store Languages + locale settings) is consumed transitively.** This story
  reads `LocaleSetting::defaultUiLocale()` through the shared trait (**D-4**) and imports
  `App\Enums\UiLocale`. It must **not** touch `locale_settings`, `store_languages`, or any Layer 2
  concept. Layer 2's store content languages remain entirely separate.

### Open questions for the human — none blocking

**Q1 — ✅ RESOLVED by the human.** The interface language must be settable from **both** the dashboard
chrome and a new Settings tab. Both surfaces are now specified; the mechanism that keeps them from
drifting is **D-17**, and the collision their co-rendering creates is **D-20**. The story's previous
recommendation (chrome only) is superseded and recorded rather than deleted, since the reasoning behind
it — that a second surface costs a component, a route, a nav entry and duplicate tests — was accurate
about the cost and simply not decisive against the human's preference. No longer open.

Nothing else in this file requires a human decision. **R-5** is a Phase 2 confirmation, **R-9** is a
notification to another story's owner, and **R-3**/**R-4**/**R-7** are Phase 3 verification tasks.

## 6. Technical tasks for later backlog creation

1. Confirm 0068's `LocaleSetting` **and** story 0066 have closed, and re-verify their shipped symbols
   against `HEAD` (**R-1**, **R-2**, **R-8**).
2. Add `label()` to `App\Enums\UiLocale`, returning `'English'` / `'Español'`.
3. Create `app/Concerns/InteractsWithUiLocale.php` with `currentLocale()` and `applyUiLocale()`
   (**D-17**) — **before** either component, so neither is ever written with inline logic.
4. Create `lang/en/localization.php` and `lang/es/localization.php`, key-for-key identical.
5. Create `App\Livewire\Settings\LanguageSwitcher` consuming the trait, with validation before
   `UiLocale::from()` (**D-19**) and the chrome redirect target (**D-18**).
6. Create `resources/views/livewire/settings/language-switcher.blade.php` — **nested**; confirm the
   resolved path by running the component and check for a stray scaffold stub at the flat path.
7. Confirm the Flux menu component against the installed stubs, then add the control to
   `resources/views/components/desktop-user-menu.blade.php`.
8. Add the same control, plus `data-test="mobile-menu-button"` on the trigger, to the mobile
   `<flux:header>` block in `resources/views/layouts/app/sidebar.blade.php`.
9. Create `App\Livewire\Settings\Language` + `resources/views/livewire/settings/language.blade.php`,
   consuming the same trait with the settings redirect target and the `settings-language-*` hooks
   (**D-20**).
10. Register `language.edit` in `routes/settings.php`'s `auth` + `verified` group (**D-16**) and add
    the fourth navlist item to `resources/views/components/settings/layout.blade.php` (**D-21**).
11. Write `tests/Feature/Localization/LanguageSwitcherTest.php`, `tests/Feature/Settings/LanguageTest.php`,
    `tests/Browser/Localization/AdminUiLanguageSwitcherTest.php` and
    `tests/Browser/Settings/LanguageTest.php`, including all three prove-it-can-fail steps and their
    recorded red results.
12. Run all three quality gates unscoped and record each result, including any not run.
13. Docs pass per the Definition of Done — including widening
    [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)'s `app/Concerns/`
    description, which today says "validation rule sets" and gains its first non-validation trait here.

## Provenance

Phase 1 Three Amigos debate, facilitated by `product-owner`, in **two rounds** — the first covering the
chrome switcher, the second the Settings tab added by a human decision on Q1. `frontend-expert` and
`frontend-qa` were dispatched as real subagents in both rounds and all four dispatches returned.

**The amigos contradicted each other four times, and every resolution is recorded with its evidence
rather than by preferring an agent.**

| # | Split | Resolved | How |
| --- | --- | --- | --- |
| **D-1** | Is the account menu viewport-neutral? | Against `frontend-qa` | It traced the **dead** `layouts/app/header.blade.php`; verified by the facilitator that `app.blade.php` binds only `x-layouts::app.sidebar` and that the live desktop menu is `hidden lg:block`. Its *warning* was adopted anyway — the gap it predicted is real. |
| **D-16** | Which route group? | Against `frontend-qa` | `frontend-expert`'s reasoning is more specific: `profile.edit`'s bare `auth` exists for the unverified-user deadlock, which a language preference has no part in. Both noted it is functionally inert either way. |
| **D-17** | Embed one component, or share a trait? | Against `frontend-qa` | `frontend-expert` showed the chrome control already renders **twice** per page, so embedding would put **three** copies on one screen — a fact about the shipped DOM, not a preference. |
| **D-22** | Which browser-test folder? | Against `frontend-qa` | Its "technique differs" reasoning fits the chrome switcher, but the Settings tab is a screen, and `playwright-setup.md` names `tests/Browser/Settings/` explicitly as the mirrored convention. |

**`frontend-qa` also produced the round's sharpest single finding**, which *inverts* advice this file
previously gave: the `{en, es}` value-set assertion is **blind to duplication**, so with the chrome
switcher co-rendering on the settings page it cannot detect the very collision the second surface
creates (**D-20**). **One claim by `frontend-expert` was corrected by the facilitator**: its proposed
`validateOnly('locale', …)` operates on a declared component property, which **D-3** deliberately
removes — the corrected shape, and the two consequences that follow from it, are **D-19**.

**Independently verified by the facilitator** rather than taken from either amigo: the dead
`header.blade.php` (`grep -rn "app.header"` → no hits); `config/livewire.php`'s
`'component_layout' => 'layouts::app'` and the absence of any `#[Layout]` override, which is what makes
the co-render in **D-20** a fact rather than a guess; the `tests/Feature/Settings/` per-screen naming;
`settings/layout.blade.php`'s `wire:navigate` on every tab; and 0068's accessor signatures
(`defaultUiLocale(): UiLocale`, `defaultNotificationLocale(): UiLocale` — both returning an enum, hence
`->value`), which is what **D-4**'s correction rests on.

**Q1 was escalated to the human and answered: both surfaces.** **R-8** and **R-9** were found while
re-reading 0066 and 0068 during this revision, not by any change→doc mapping.

_Phase 1 only. No INVEST check, no TDD, no security audit, no code review, no docs pass — those are
Phases 2–7 and are orchestrated separately._
