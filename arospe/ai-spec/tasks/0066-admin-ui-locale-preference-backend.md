# [0066] Admin UI locale preference & resolution — backend

## Description
Persist each administrator's chosen **admin interface language** (Spanish or English only) on their
own account, and resolve it into `App::setLocale()` on every web request — including Livewire's
`/livewire/update` round-trips. This is the backend half of [PRD](../../docs/PRD/PRD.md#epic-5--internationalization)
Epic 5's **Layer 1 — Admin UI language switcher**; the switcher UI itself is sibling story **0067**,
which consumes the contract defined here. Strictly Layer 1: this has **no relationship** to Layer 2's
future `store_languages` catalog (story 0068), which the PRD explicitly warns must not be conflated
with it.

The per-request fallback — for a guest, for an account that never chose, and for a stale stored value
— is the **administrator-configurable** default story **0068** owns, not `config('app.locale')`. The
same preference also decides the language of that account's notification emails (**D-14**). ⚠️ **This
story depends on 0068 despite the lower number**; see **R-2a** and [§6 task 0](#6-technical-tasks-for-later-backlog-creation).

## Type
backend | includes database-expert: yes | related frontend story: 0067 (not yet written) | depends on: 0068

## Gherkin

```gherkin
Feature: Admin UI locale preference (Layer 1)

  Scenario: A stored Spanish preference is applied to the interface
    Given a signed-in administrator whose interface language preference is Spanish
    When they open any dashboard page
    Then the application locale for that request is Spanish

  Scenario: The preference outlives the session it was chosen in
    Given an administrator who chose Spanish and has since signed out
    When they sign in again in a new session
    Then the application locale for that request is Spanish

  Scenario: An administrator who has never chosen a language gets the store's default dashboard language
    Given a signed-in administrator who has never chosen an interface language
    When they open any dashboard page
    Then the application locale for that request is the store's default dashboard language

  Scenario: A visitor who is not signed in gets the store's default dashboard language
    Given a visitor who is not signed in
    When they open a publicly reachable page
    Then the application locale for that request is the store's default dashboard language

  Scenario: Changing the store's default dashboard language moves an administrator who never chose
    Given a signed-in administrator who has never chosen an interface language
    When the store's default dashboard language is changed to Spanish
    Then the application locale for their next request is Spanish

  Scenario: An administrator's own choice outranks the store default
    Given a signed-in administrator whose interface language preference is English
    When the store's default dashboard language is changed to Spanish
    Then the application locale for their next request is still English

  Scenario: A previous request's language does not leak into the next one
    Given a signed-in administrator whose interface language preference is Spanish
    When a visitor who is not signed in requests a page immediately afterwards
    Then the application locale for that request is the store's default dashboard language

  Scenario: The language is re-applied on a Livewire round-trip
    Given a signed-in administrator whose interface language preference is Spanish
    When they trigger a Livewire action on an admin screen
    Then the application locale for that round-trip is Spanish

  Scenario: An administrator sets their interface language to Spanish
    Given a signed-in administrator whose interface language preference is English
    When they set their interface language to Spanish
    Then their stored interface language preference is Spanish

  Scenario Outline: A language outside the offered pair is refused
    Given a signed-in administrator
    When they attempt to set their interface language to <invalid_language>
    Then the change is refused with a validation message
    And their stored interface language preference is unchanged

    Examples:
      | invalid_language              |
      | an unsupported language code  |
      | a differently-cased code      |
      | a region-qualified code       |
      | an empty value                |
      | an over-long value            |

  Scenario: An administrator cannot set another administrator's interface language
    Given a signed-in administrator and a second administrator
    When they attempt to set the second administrator's interface language
    Then the attempt is refused
    And the second administrator's stored preference is unchanged

  Scenario: A stored language that is no longer offered falls back instead of failing
    Given an administrator whose stored interface language is no longer offered
    When they open any dashboard page
    Then the page is served normally
    And the application locale for that request is the store's default dashboard language

  Scenario: An invited administrator's invitation email uses the store's default notification language
    Given a newly invited administrator who has never chosen an interface language
    When their invitation email is rendered
    Then it is written in the store's default notification language

  Scenario: An administrator's own choice decides the language of their emails
    Given a signed-in administrator whose interface language preference is Spanish
    When an email notification is rendered for them
    Then it is written in Spanish
```

> **Deliberately absent:** there is **no** scenario asserting *"the menus, labels, and buttons are
> shown in English/Spanish"*, even though [PRD](../../docs/PRD/PRD.md#epic-5--internationalization)
> Layer 1's own Gherkin says exactly that. Most admin chrome is still hardcoded English in Blade —
> only five app-owned domain files exist under `lang/{en,es}/`. This story can honestly assert
> **locale resolution**, not rendered translation coverage. See **D-10** and the Definition of Done.

## Files to create/modify

**Migration**
- `database/migrations/<timestamp>_add_ui_locale_to_users_table.php` — new, via
  `php artisan make:migration add_ui_locale_to_users_table --table=users --no-interaction`:

  ```php
  public function up(): void
  {
      Schema::table('users', function (Blueprint $table): void {
          $table->string('ui_locale', 5)->nullable()->after('status');
      });
  }

  public function down(): void
  {
      Schema::table('users', function (Blueprint $table): void {
          $table->dropColumn('ui_locale');
      });
  }
  ```

  **Nullable, no default, and deliberately no backfill** (**D-3**) — this is the *opposite* of
  [`add_status_to_users_table`](../../docs/database/migrations.md#when-the-new-columns-default-is-wrong-for-existing-rows-backfill-in-the-same-up),
  whose conditional backfill existed because a blanket default would have mis-stated existing rows.
  Here `NULL` is exactly right for every existing row: it means *"this account never chose"*, and a
  default of `'en'` would falsely assert a choice nobody made. **No index** (**D-4**). Length `5`,
  not a bare `string()` (**D-2**). `down()` needs no `dropUnique()` first — nothing unique is added.

**Enum**
- `app/Enums/UiLocale.php` — new. The single source of truth for the offered pair:

  ```php
  enum UiLocale: string
  {
      case English = 'en';
      case Spanish = 'es';
  }
  ```

  TitleCase keys, lowercase backing values, per [naming.md](../../docs/conventions/naming.md#classes).
  **No `label()` method** — this story has no rendering site, and this repo's rule is to add `label()`
  when a *second* consumer appears, not the first ([naming.md](../../docs/conventions/naming.md#translation-keys),
  the `SalesRegionKind` precedent). Story 0067 adds it if its switcher needs it. **No `default()`
  method either** — see **D-6**; the default is resolved through `LocaleSetting`'s accessors and must
  not be forked into a second source of truth on the enum.

**Model**
- `app/Models/User.php` — one `@property` line, **plus** the `HasLocalePreference` implementation
  (**D-14**, resolved in favour of implementing it):

  ```php
  /**
   * @property string|null $ui_locale
   */
  class User extends Authenticatable implements HasLocalePreference, PasskeyUser
  {
      /**
       * The locale this user's notifications render in.
       *
       * Always a real locale string, never null: the fallback is the
       * administrator-configured LocaleSetting default (story 0068), not
       * ambient app config. See D-6 and D-14.
       */
      public function preferredLocale(): string
      {
          return UiLocale::tryFrom((string) $this->ui_locale)?->value
              ?? LocaleSetting::defaultNotificationLocale()->value;
      }
  }
  ```

  Note it reads `defaultNotificationLocale()`, **not** `defaultUiLocale()` — the two settings are
  independent by design and this is the one place the notification one is consumed. `tryFrom()`, so a
  stale stored value degrades to the configured default rather than throwing (**D-5**). **No
  `casts()` entry** (**D-5** — the story's most important decision, and it deliberately diverges from
  the `status` precedent; do not "fix" it for consistency). **Not added to `#[Fillable]`** (**D-7**).

**Middleware** — the app's **first** file under `app/Http/Middleware/`, which does not exist today
- `app/Http/Middleware/SetUiLocale.php` — new:

  ```php
  public function handle(Request $request, Closure $next): Response
  {
      $stored = $request->user()?->ui_locale;

      App::setLocale(
          UiLocale::tryFrom((string) $stored)?->value
              ?? LocaleSetting::defaultUiLocale()->value,
      );

      return $next($request);
  }
  ```

  `tryFrom()`, never `from()` (**D-5**). The fallback is **`LocaleSetting::defaultUiLocale()`**, the
  administrator-configured default story 0068 owns — *not* `config('app.locale')`, which is now the
  third tier and is reached only from inside that accessor (**D-6**). `->value` because the accessor
  returns a `UiLocale`, never a string. Note it resolves **unconditionally on every request** rather
  than only when a preference exists — the `??` branch is what stops a locale leaking forward into a
  later request in the same process (**D-9**).

  ⚠️ **This adds one query to the hottest path in the app**, including guest requests, where 0066 as
  originally written added none (`Auth::user()->ui_locale` free-rides an already-loaded model). Story
  0068's **D27** accepts that cost — one uncached indexed single-row lookup, memoised per request —
  and records why caching is declined *while `CACHE_STORE` is the database*. Do not add a cache here;
  that decision belongs to 0068 and is revisited when Redis lands.

**Registration**
- `bootstrap/app.php` — one appended line inside the existing `withMiddleware()` closure:

  ```php
  $middleware->web(append: [
      \App\Http\Middleware\SetUiLocale::class,
  ]);
  ```

  Appended to the **`web` group**, never to a route (**D-8**). The existing `alias()` call and the
  `prependToPriorityList()` call for `ValidateSignature` are untouched.

**Action**
- `app/Actions/Users/SetUserUiLocale.php` — new, the column's single writer:

  ```php
  public function __invoke(UiLocale $locale, ?User $user = null): User
  {
      $actor = Auth::user();
      $target = $user ?? $actor;

      // The self-only rule is DERIVED from the authenticated user, never accepted
      // as a parameter (docs/conventions/base-standards.md). A console/queue caller
      // (no authenticated actor) may target any user; an HTTP caller may only ever
      // write their own row. See D-11.
      if ($actor !== null && ! $target->is($actor)) {
          throw new AuthorizationException;
      }

      $target->forceFill(['ui_locale' => $locale->value])->save();

      return $target;
  }
  ```

  In `app/Actions/Users/`, not a new `app/Actions/Locale/` (**D-12**). `forceFill()` because the
  column is deliberately not fillable (**D-7**).

**Validation**
- `app/Concerns/UserValidationRules.php` — **modified**, gaining one method beside the existing
  `roleRules()` / `statusRules()`. No new trait: same noun, same file.

  ```php
  /** @return array<int, ValidationRule|array<mixed>|string> */
  protected function uiLocaleRules(): array
  {
      return ['required', 'string', Rule::enum(UiLocale::class)];
  }
  ```

  `Rule::enum()` is safe against a forged value — verified: `Illuminate\Validation\Rules\Enum::passes()`
  resolves with `tryFrom()` (line 75), so an unrecognized string fails validation rather than throwing.

**Consumed, not created by this story**
- `app/Models/LocaleSetting.php` — **story 0068's deliverable**, consumed here through exactly two
  static reads and nothing else:

  ```php
  App\Models\LocaleSetting::defaultUiLocale(): UiLocale          // the middleware's fallback
  App\Models\LocaleSetting::defaultNotificationLocale(): UiLocale // preferredLocale()'s fallback
  ```

  Both return a `UiLocale`, never a `string`. Their internal three-tier chain (persisted admin choice
  → `config('app.locale')` via `tryFrom` → `UiLocale::English`) belongs to 0068 and **must not be
  re-implemented, wrapped or second-guessed here** — this story calls the accessors and nothing else.
  This story is what gives `locale_settings` its **first real consumer**: 0068's own **R-16** records
  that the notification-locale setting ships with *zero* consumers until 0066 is reconciled this way,
  so that gap closes here rather than remaining open. See the ordering note in
  [Dependencies](#5-dependencies-risks-open-technical-questions) — **0068's `LocaleSetting` must be
  implemented before this story's middleware and `preferredLocale()`, despite its higher number.**

**Not touched by this story** — see [Scope fences](#scope-fences-what-this-story-must-not-do).

## Tests to perform

Backend only — **no browser tests**, since this story ships no UI.

> **Read this first: `Livewire::test()` cannot test this story's middleware, and a test built on it
> would be vacuously green.** Verified against the installed vendor source (Livewire v4.3.3):
> `Livewire\Features\SupportTesting\Testable` routes both the initial render
> (`InitialRender.php:32`) and every subsequent `->call()`/`->set()` round-trip
> (`SubsequentRender.php:35`) through `RequestBroker::temporarilyDisableExceptionHandlingAndMiddleware()`,
> whose body calls **`->withoutMiddleware()`** (`RequestBroker.php:28`). It does issue a real `POST`
> to the update URI — with the entire middleware stack disabled. So the Livewire round-trip case
> **must** be a literal `$this->post('/livewire/update', …)`. This resolves what would otherwise
> have been a spike; see **D-8**.

**Unit — `tests/Unit/Enums/UiLocaleTest.php`** (new; mirrors `tests/Unit/Enums/UserStatusTest.php`)
- [ ] The backing values are exactly `en` and `es`, and `cases()` has exactly two entries.
      *Risk if missing:* a third case added later silently widens what validation accepts and what
      the switcher offers, contradicting the PRD's "only Spanish and English" scenario, with no test
      objecting.
- [ ] `UiLocale::tryFrom('fr')` returns `null` rather than throwing — pins the property the
      resolution boundary depends on.

**Feature — `tests/Feature/Localization/UiLocaleResolutionTest.php`** (new; the middleware's own
coverage, named for a cross-cutting concern the way `tests/Feature/Authorization/` and
`tests/Feature/Navigation/` already are — see **D-13**)
- [ ] An authenticated user with `ui_locale = 'es'` gets `App::getLocale() === 'es'` on a real
      `$this->get(route('dashboard'))`. *Risk if missing:* the column could be written correctly and
      read by nothing at all — the "is this wired up" gap.
- [ ] **The persistence clause, tested as the PRD states it**: set the preference, sign out
      (`$this->post(route('logout'))`), then `actingAs($user->fresh())` and request again — still
      `'es'`. *Risk if missing:* a session- or cookie-backed implementation passes a same-session
      assertion and fails the PRD's "persists across their sessions" requirement outright. The
      `fresh()` re-read is what forces the value to come from the `users` row.
- [ ] A guest request resolves to `LocaleSetting::defaultUiLocale()`. *Risk if missing:* a middleware
      that dereferences `Auth::user()` without a null check 500s every unauthenticated route.
- [ ] An authenticated user with `ui_locale = null` resolves to `LocaleSetting::defaultUiLocale()`.
- [ ] **The configured default actually drives both of the two cases above** — arrange a
      `locale_settings` row holding `es`, then assert a guest **and** a no-preference user both
      resolve to `'es'`. ⚠️ *Risk if missing, and this is the one that bites quietly* (0068's
      **R-13**): with **no** `locale_settings` row the accessor falls through to `config('app.locale')`
      on its own, so a test that only asserts "the default" keeps passing after 0068 lands **while
      silently testing the config tier instead of the configured one**. Nothing goes red to signal
      that the assertion stopped testing what it claims to. Write the two fallback cases with an
      explicitly-empty settings state (config tier) *and* these sibling cases with a populated one.
      Arrange the row with `updateOrCreate`, never `factory()->create()` — the singleton's fixed
      primary key makes a second `create()` a duplicate-key error (0068 **R-17**).
- [ ] A user **with** a preference is unaffected by the configured default — set `ui_locale = 'en'`,
      set the store default to `es`, assert `'en'`. *Risk if missing:* nothing pins the precedence
      order, and a middleware that read the setting first would pass every other test here.
- [ ] **Leak-forward, as two requests inside one test method**: first request authenticated as an
      `'es'` user (assert `'es'`), then a second request as a guest in the same test (assert the
      configured default). *Risk if missing:* a set-if-present middleware with no `else` branch passes
      every single-request test, because the locale already starts at the default before the
      middleware runs — the one-request test cannot distinguish "resets correctly" from "never resets".
- [ ] **The stale-value case**: write an unsupported value straight past the model
      (`DB::table('users')->where('id', …)->update(['ui_locale' => 'fr'])`), then request as that
      user — the response is **not** a 500 and the locale is `LocaleSetting::defaultUiLocale()`.
      *Risk if missing:* this is the highest-blast-radius bug the story can ship — with an enum cast it would
      be an unconditional 500 on **every** request for that account, on every screen, until someone
      edits the database by hand. See **D-5**.
- [ ] Pin `config(['app.locale' => 'en'])` explicitly in the tests that assert the default rather
      than relying on the ambient value — `phpunit.xml` sets no `APP_LOCALE`, and this repo has
      already been bitten by a test that depended on an ambient config value
      ([errors-log.md](../../docs/errors-log.md#a-test-asserted-against-a-fixture-address-that-the-local-env-also-pointed-super_admin_email-at--2026-08-12)).

**Feature — `tests/Feature/Localization/UiLocaleLivewireRoundTripTest.php`** (new; split out because
its technique differs materially and it is the single highest-risk test in the story)
- [ ] A literal `POST /livewire/update` made by an `'es'` user against an existing gated component
      (`App\Livewire\Users\Index` — no new component needed) resolves to `'es'`. Extract the
      `wire:snapshot` payload from a preceding real `GET` rather than hand-building it.
- [ ] **Prove it can fail before trusting it** (mandatory, per this repo's two recorded
      vacuous-assertion incidents — the disjunctive `arch()` rule and the `verified` middleware that
      refuses nobody): temporarily move the middleware from the `web` group onto the route only,
      re-run this one test, confirm it goes **red**, restore. A registration that looks identical on
      the initial `GET` and silently breaks only the round-trip is exactly what this test exists to
      catch.

**Feature — `tests/Feature/Users/SetUserUiLocaleTest.php`** (new; mirrors `app/Actions/Users/`)
- [ ] The action persists the chosen value for the acting user, asserted against the database row.
- [ ] Called with no `$user`, it targets the authenticated user and **no other row changes**.
- [ ] **Called with another user as the target while authenticated, it throws
      `AuthorizationException` and the target's row is unchanged.** *Risk if missing:* a later
      refactor adding an admin-on-behalf-of path silently opens a cross-user write that nothing else
      in the story defends (**D-11**).
- [ ] Called with an explicit target and **no** authenticated actor (the console/queue shape), it
      succeeds — the exemption must be tested as deliberately as the refusal, or an over-block ships
      unnoticed.
- [ ] Invalid values (`'fr'`, `'EN'`, `'en-US'`, `''`, a 200-char string) are refused by
      `uiLocaleRules()` with a validation error and leave the stored value unchanged. Assert the
      **database value**, not just the exception.
- [ ] A soft-deleted target: pin whichever behaviour is chosen with one assertion. Low value on its
      own (a trashed user cannot obtain a session), worth pinning once so a later change to the
      soft-delete scope does not quietly change this action too.

**Feature — `tests/Feature/Localization/PreferredLocaleTest.php`** (new; **D-14**'s own coverage)
- [ ] `$user->preferredLocale()` returns the stored preference when one is set.
- [ ] With `ui_locale = null` it returns `LocaleSetting::defaultNotificationLocale()->value` —
      arranged with that setting holding a value **different** from `defaultUiLocale()`, so the test
      proves it reads the notification column and not the dashboard one. *Risk if missing:* the two
      accessors are interchangeable in every test where both hold the same value, so a
      copy-paste reading the wrong one is invisible until an administrator sets them differently.
- [ ] It **never returns `null`**, including for a user holding an unsupported stored value —
      assert a real `UiLocale` backing string comes back. *Risk if missing:* `withLocale(null, …)` is
      a silent no-op, so a null return degrades to "whatever locale the queueing request happened to
      leave set" with nothing failing.
- [ ] **End to end through the real notification path**, not just the method: send
      `UserInvitation` / `PendingEmailVerification` to a user with `ui_locale = 'es'` and assert the
      rendered mail carries the Spanish copy (`trans('users.invitation.subject')` under a forced
      `es` locale), then repeat for a no-preference user against the configured notification default.
      *Risk if missing:* `preferredLocale()` can be correct while nothing consumes it — the contract
      only holds because `NotificationSender::preferredLocale()` calls it, and a unit test of the
      method alone would pass with `HasLocalePreference` not implemented at all.

**Feature — `tests/Feature/Models/UserTest.php`** (extend the existing file)
- [ ] A factory-created user has `ui_locale === null`. *Risk if missing:* nothing else pins the
      column's default, and every fallback test above silently depends on it.
- [ ] `User::create(['ui_locale' => 'es', …])` does **not** persist the value — the
      `#[Fillable]`-omission guard (**D-7**). *Risk if missing:* the guard can be removed with no
      visible effect until something starts mass-assigning it.

**Non-regression — this story has whole-suite blast radius by construction**
- [ ] Registering global `web`-group middleware touches **every** HTTP test in the repo, so the
      unscoped `php artisan test` run is the only thing that proves it
      ([base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done)).
      Watch `tests/Feature/Auth/**` in particular — it holds the repo's highest concentration of
      **guest** requests, which is exactly what a null-unsafe middleware breaks — plus
      `tests/Feature/Settings/**`, `tests/Feature/Authorization/ModuleRouteAccessTest.php` (asserts
      specific guest-redirect and 403 shapes), and `tests/Browser/**`, which CI runs regardless.

**Explicitly not tested**
- `App::setLocale()`, the translator, and Laravel's enum/validation internals — vendor behaviour, per
  [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md).
- Migration `up()`/`down()` mechanics — `RefreshDatabase` proves the migration runs on every Feature
  test; the one thing worth asserting is the column's `null` default, which is listed above.
- Translated copy correctness, and any assertion of the form "the menus are in Spanish" (**D-10**).
- Concurrency on this column — each request resolves from a fresh `Auth::user()` read; manufacturing
  a race here would be testing PHP's request model, not this feature.

## Expected outcome
An administrator's interface-language choice is stored on their own `users` row and survives sign-out
and sign-in. Every web request — including Livewire round-trips — resolves that stored value into
`App::setLocale()`, falling back to the **administrator-configured** default dashboard language for a
guest, for an account that never chose, and for an account holding a value that is no longer offered.
The same preference decides the language of the emails that account receives, falling back to the
separately-configured default notification language. A single domain action is the only writer, and it
refuses to write any row but the authenticated user's. Almost nothing is user-visible yet — the
switcher that calls the action is story 0067's — with one exception worth expecting: notification
emails start arriving in the recipient's language as soon as this ships.

## Acceptance criteria
- [ ] `users.ui_locale` exists as a nullable `VARCHAR(5)` after `status`, with no index, no default
      and no backfill.
- [ ] `App\Enums\UiLocale` holds exactly `English = 'en'` and `Spanish = 'es'` and is the only place
      the offered pair is written down.
- [ ] The column is **not** cast to the enum on the model and is **not** in `#[Fillable]`;
      `App\Actions\Users\SetUserUiLocale` is its single writer.
- [ ] A stored value outside the enum resolves to the configured default and **never** raises an
      error on any request.
- [ ] The middleware's fallback is `LocaleSetting::defaultUiLocale()`, and **no class in this story
      reads `config('app.locale')` directly** — that tier is reached only inside 0068's accessor.
- [ ] Changing the store's default dashboard language changes what a guest and a no-preference user
      resolve to; a user **with** a preference is unaffected by it.
- [ ] `App\Models\User` implements `HasLocalePreference`, returning the user's own locale or
      `LocaleSetting::defaultNotificationLocale()` — **never `null`** — so `UserInvitation` and
      `PendingEmailVerification` render in that language with **no edit to either notification class**.
- [ ] The locale resolves correctly on a plain `GET` **and** on a literal `POST /livewire/update`,
      the latter proven by a test demonstrated to fail when the middleware is moved off the `web`
      group.
- [ ] A guest, and a user with no preference, both resolve to `LocaleSetting::defaultUiLocale()`, and
      a previous request's locale never leaks into a subsequent one.
- [ ] The action writes only the authenticated user's row when an actor is present, and is still
      callable with an explicit target when none is (console/queue).
- [ ] Values outside `en`/`es` are refused by validation with the stored value left unchanged.
- [ ] No route, no Livewire component, no Blade view, no `config/modules.php` entry and no new
      `lang/` file is added by this story.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per [contracts.md](../../docs/contracts.md)'s
      Full Test Suite Gate Rule).
- [ ] All **three** quality gates run **unscoped** and each result recorded explicitly, including any
      not run: `php artisan test` (not `--filter`), `vendor/bin/pint --format agent` (not `--dirty`),
      and **Larastan level 7** (`vendor/bin/phpstan analyse`) — the one nothing else prompts you to
      run ([errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26)).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor).
- [ ] Documentation updated (docs-keeper): `docs/database/schema.md`'s `users` table gains the
      `ui_locale` row and its no-index decision; `docs/architecture/overview.md` gains
      `app/Http/Middleware/**` in "Where things live" (the directory does not exist today) and a
      lifecycle note that a locale step now runs in the `web` group;
      `docs/conventions/base-standards.md`'s directory listing gains `app/Http/Middleware/`;
      `docs/conventions/naming.md` records `UiLocale` and the deliberate absence of `label()`; and
      **`docs/architecture/authentication.md` records that notifications now render in the
      recipient's locale** — that page owns the notification lifecycle, and D-14 changes it.
- [ ] **This story does NOT claim the UI renders translated.** Its outcome is *locale resolution*
      only. Most admin chrome is still hardcoded English in Blade — `lang/{en,es}/` holds five
      domain files covering their own screens' copy, not the dashboard chrome — so the PRD's
      *"the menus, labels, and buttons are shown in English"* clause is **not** satisfied by this
      story and must not be checked off by it (**D-10**, **R-1**).
- [ ] **Glossary follow-up**: `docs/testing/frontend/gherkin-guidelines.md`'s domain glossary gains
      **"admin UI language"** (Layer 1, this story) as distinct from **"store language"** (Layer 2,
      story 0068), so the two are not conflated in a later story's scenarios — which is the exact
      failure the PRD warns about.
- [ ] Acceptance criteria met.

---

## 1. Refined user story

**As** an administrator using the Arospe backoffice,
**I want** my choice of interface language (Spanish or English) to be remembered on my account,
**so that** the panel keeps speaking my language on every screen and every visit, without my having
to re-select it after signing out.

**And** — since **D-14** — so that the emails that account receives arrive in the same language,
falling back to a default an administrator sets rather than to whatever ambient locale a background
job happened to leave configured.

This story delivers the mechanism: the stored preference, the single writer, the per-request
resolution, and the notification-locale hook. It deliberately delivers no switcher control (story
0067) and no additional translated copy (**R-1**), and it *consumes* rather than creates the
configurable defaults (story 0068).

## 2. Detailed acceptance criteria (Given/When/Then)

See the [Gherkin](#gherkin) section above — fourteen scenarios, each opening with a named
business-role actor and carrying exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. The
deliberately-absent "menus are shown in English" scenario is called out beneath that block with its
reason.

## 3. QA test cases / validation scenarios

See [Tests to perform](#tests-to-perform) above. The five highest-risk items, called out because each
would otherwise pass for the wrong reason:

1. **The Livewire round-trip must not use `Livewire::test()`** — it disables all middleware, so such
   a test is structurally incapable of failing (verified against vendor source; see the callout).
2. **The persistence case needs a real sign-out plus a `fresh()` re-read**, or a session-backed
   implementation passes while failing the PRD.
3. **The leak-forward case needs two requests in one test method** — one request cannot distinguish
   "resets to default" from "never sets anything".
4. **The stale-value case must bypass the model when seeding the bad value**, or the very guard being
   tested prevents the fixture from being created.
5. **The two fallback cases need an explicitly-populated `locale_settings` sibling** (0068's
   **R-13**). With no settings row the accessor falls through to config on its own, so a test
   asserting only "the default" keeps passing while silently testing the *wrong tier* — and nothing
   goes red to say so. This is the single quietest failure in the story's test suite.

## 4. Documented functional decisions

- **D-1 — The column is `ui_locale`, not `locale`.** Reviewed and endorsed by both experts. The case
  for a bare `locale`: only one locale concept exists in the schema today, Laravel's ecosystem uses
  that name, and `users.status` is not called `account_status`. The case for `ui_locale`, which wins
  here — and which story 0068 has since made concrete rather than anticipatory: Epic 5 says of its two
  layers *"do not conflate them"*, and story 0068 will introduce a second, genuinely different locale
  concept into this same codebase — so the qualifier is inert only for as long as there is one
  concept, and the story that ends that is already scheduled. `admin_locale` is rejected because
  nothing else on `users` carries an `admin_` prefix and the column describes a preference, not a
  tier. Laravel's `HasLocalePreference` imposes no column name (it is a method contract, which
  **D-14** now implements), so nothing in the framework argues for the bare form. Note the
  qualifier has already earned itself: `LocaleSetting` carries `default_ui_locale` *and*
  `default_notification_locale`, so a bare `locale` on `users` would now sit beside two differently-
  scoped locale columns one table away.
- **D-2 — `VARCHAR(5)`, not a bare `string()` and not a native MySQL `enum`.** Follows
  [`add_status_to_users_table`](../../docs/database/migrations.md#adding-a-column-to-an-existing-table)
  exactly: a bare `string()` is `VARCHAR(255)` for a two-character token, and a native `enum` needs
  DDL for every new value. `5` holds `en`/`es` with headroom for a future `en_US`-shaped value
  without over-provisioning.
- **D-3 — Nullable, no default, and explicitly no backfill.** `NULL` means *"never chose"*, and the
  resolver maps it to the configured default (**D-6**). This is the deliberate inverse of the `status`
  migration's conditional backfill: there, the column's default would have mis-stated existing rows
  and a backfill was mandatory; here, any non-null default would falsely record a choice every
  existing administrator never made. Writing a backfill would be the bug.
- **D-4 — No index.** The same cardinality argument [schema.md](../../docs/database/schema.md#users)
  applies to `users.status` and `users.deleted_at`: a backoffice `users` table is 10²–10³ rows, and
  this column is only ever read per-row through the primary key (`Auth::user()->ui_locale`), never
  filtered on. The query that would reopen the decision is a reporting count
  (`WHERE ui_locale = 'es'`), which does not exist. Confirm the resulting index list with
  `php artisan db:table users` after migrating — never by reading the migration.
- **D-5 — The column is deliberately NOT cast to `UiLocale`, and this diverges from the `status`
  precedent on purpose.** Verified against the installed framework rather than assumed:
  `Illuminate\Database\Eloquent\Concerns\HasAttributes::getEnumCaseFromValue()` (line 1317) resolves
  a backed enum with **`$enumClass::from($value)`**, not `tryFrom()`. So with an enum cast in place,
  a row holding a value outside the current case set throws `\ValueError` **on hydration** — meaning
  every authenticated request for that account, on every screen, 500s until someone edits the
  database by hand. `UserStatus` and `SalesRegionKind` are safe with a cast because their values are
  written only by narrow, trusted paths that cannot shrink without a companion migration; a
  *user-settable preference* whose offered set a later story may legitimately change is a different
  risk class. The `from()`-not-`tryFrom()` fact was checked by execution against the installed
  framework rather than reasoned about, per this repo's rule that
  [a hedge means nobody ran the code](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24).
  **A reviewer must not add the cast "for consistency with `status`."**
- **D-6 — No `UiLocale::default()`; the default is a *persisted, administrator-configurable* setting,
  read through one accessor.** The original form of this decision forbade a hardcoded enum-level
  default because it would be a second source of truth competing with `config('app.locale')`. **That
  reasoning still holds and `UiLocale::default()` still must not exist** — what changed is *where the
  single source of truth lives*. Story 0068 introduces a `locale_settings` singleton, so the
  resolution is now three tiers, and only the first two are this story's business:

  | Tier | Value | Owner |
  | --- | --- | --- |
  | 1 | the user's own `users.ui_locale` | this story |
  | 2 | `LocaleSetting::defaultUiLocale()` / `defaultNotificationLocale()` | story 0068 |
  | 3 | `config('app.locale')`, then a last-resort constant | story 0068, **inside** the accessor |

  This story reads tier 1 and delegates everything below it to one accessor call. It must **not**
  read `config('app.locale')` anywhere — that is now tier 3, reachable only through 0068's accessor,
  which resolves it with `tryFrom()` precisely because `APP_LOCALE=fr` is a legal deployment and
  `from()` there would 500 every request in the application including guests. Note 0068's tier-3
  constant is a deliberate, narrow exception to this decision's original wording: it lives at the one
  call site that needs it rather than as a `UiLocale::default()` method, so nothing else can start
  reading it as a source of truth.
- **D-7 — Omitted from `#[Fillable]`, because a *rule about who may write it* binds this column.**
  The framing matters more than the outcome here, and both experts flagged that the obvious framing
  reaches the right answer for the wrong reason.
  [base-standards.md](../../docs/conventions/base-standards.md#model-conventions)'s stated test —
  *"could a form legitimately supply this value at all"* — **argues for inclusion** if applied
  literally: a user's own language pick is exactly the kind of value a form legitimately supplies,
  unlike `status` or a server-derived `media.path`. So that test is not what decides this column.

  What decides it is **D-11's self-only rule**: an HTTP caller may write only *their own* row. That
  rule lives in `SetUserUiLocale`, and a mass-assignable column routes around the class enforcing it
  — `User::find($other)->update(['ui_locale' => …])` reaches the column without the guard ever
  running. **The test this column actually applies is therefore: does a rule bind *who* may write
  this value, which a raw mass-assign would bypass?** Yes — so it is omitted, and
  `App\Actions\Users\SetUserUiLocale` is the single writer via `forceFill()`. A secondary benefit,
  not the reason: omission is the reversible direction, since adding to `#[Fillable]` later is a
  one-line change while removing it once callers depend on it is breaking. Nothing is lost
  functionally — `CreateNewUser` and `CreateUser` both construct users from explicit key lists.

  **Reversal criterion, recorded so this is not re-litigated from scratch:** add it to `#[Fillable]`
  and drop the `forceFill()` only if a second legitimate writer appears that **still enforces the
  self-only rule and the `UiLocale` validation**. A form binding is not by itself disqualifying — a
  Livewire form that goes through the action is fine, and would not change this decision; what
  disqualifies a writer is bypassing the authorization check, not being a form.
- **D-8 — The middleware is registered on the global `web` group, never on a route.** Verified
  against Livewire v4.3.3: `HandleRequests::boot()` registers `POST /livewire/update` with
  `->middleware(['web', RequireLivewireHeaders::class])` (line 28), and `setUpdateRoute()` re-asserts
  the `web` group if a custom route omits it (lines 95–99, *"Without it, CSRF protection is lost
  entirely"*). So `web`-group middleware runs on Livewire round-trips natively. This sidesteps the
  `PersistentMiddleware` allow-list entirely — that list governs only **route**-level middleware, and
  a custom class could never join its eight hardcoded entries, which is the same fork that produced
  `can:` over `permission:` ([livewire-authorization.md](../../docs/security/livewire-authorization.md)).
  Appending to `web` (rather than prepending globally) also guarantees the middleware runs after
  `StartSession`, so `$request->user()` is resolvable; running it earlier would silently see `null`
  on every request and always fall through to the default — a correctness bug that raises no error.
- **D-9 — The resolver runs unconditionally and always calls `App::setLocale()`.** The tempting shape
  is `if ($locale) { App::setLocale($locale); }`. That is wrong in a way no single-request test can
  see: with no `else`, the locale simply retains whatever the previous request in the same process
  left behind. The `?? LocaleSetting::defaultUiLocale()->value` fallback is what makes the middleware
  idempotent per request, and the two-requests-in-one-test case is what pins it.
- **D-10 — This story's outcome is locale *resolution*, not translated UI.** The PRD's Layer 1
  scenario says *"the menus, labels, and buttons are shown in English"*, and that is not deliverable
  here: `lang/{en,es}/` holds five domain files (`users`, `roles`, `navigation`, `sales-regions`,
  `media`) covering their own screens' copy, while most dashboard chrome is hardcoded English in
  Blade. `backend-qa` reached this independently and recommended the Definition of Done state it
  explicitly rather than let the PRD clause imply coverage. The story therefore asserts resolved
  locale, states the limit in its Definition of Done, and does not check off the PRD clause. Note the
  navigation sidebar *will* genuinely switch, since `lang/es/navigation.php` is fully populated — so
  the gap is partial, not total, which is precisely why it needs stating rather than assuming.
- **D-11 — The action derives the self-only rule from `Auth::user()`, and takes an optional target.**
  `backend-qa` recommended taking no `User` parameter at all, so that there is structurally nothing
  to target. The competing consideration is that a zero-target action is uncallable from a console
  command or queued job, which conflicts with
  [0008a's rule](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  that an action be independently callable. Both are honoured: the signature is
  `__invoke(UiLocale $locale, ?User $user = null)`, and the *rule* — "an
  HTTP caller may write only their own row" — is derived from `Auth::user()` inside the action, never
  passed in. A caller with no authenticated actor (Artisan, queued job) may target any user; a caller
  with one may only target themselves. This keeps the action independently callable per
  [0008a's convention](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  while closing the cross-user write `backend-qa` correctly flagged. No policy and no permission is
  introduced: setting one's own UI language is self-service, and every account does it identically.
- **D-12 — The action lives in `app/Actions/Users/`, not a new `app/Actions/Locale/`.**
  [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)'s rule is that a
  subfolder is either a module area or a **named cross-cutting concern**, and `app/Actions/Auth/`
  earned its place only because its classes are called from two different module areas. This action
  has one caller and writes a `users` column, exactly like `RequestEmailChange` / `ConfirmEmailChange`.
  A `Locale/` folder would invent an area for a single class. The middleware, by contrast, correctly
  lands in the stock `app/Http/Middleware/` location.
- **D-13 — Test paths, stated as the convention decision they are.** This repo records that
  [a story file naming a test path is making a convention decision](../../docs/testing/frontend/playwright-setup.md#folder-structure),
  so: the enum test mirrors the model layer (`tests/Unit/Enums/`), the action test mirrors its own
  namespace (`tests/Feature/Users/`), and the middleware tests go in a new
  **`tests/Feature/Localization/`** — a cross-cutting-concern folder in the shape of the existing
  `tests/Feature/Authorization/` and `tests/Feature/Navigation/`, rather than
  `tests/Feature/Http/Middleware/`, which has no precedent here. `backend-qa` proposed `Locale/`;
  `Localization/` is preferred only for reading unambiguously against the `UiLocale` *enum*.
- **D-14 — `HasLocalePreference` IS implemented, and an administrator's chosen language decides the
  language of their emails.** This reverses the story's original recommendation to defer, on an
  explicit human decision (the escalation recorded at **R-2** is now **resolved**). `App\Models\User`
  implements `Illuminate\Contracts\Translation\HasLocalePreference`, which
  `Illuminate\Notifications\NotificationSender::preferredLocale()` consults for **every** notification
  — so `UserInvitation` and `PendingEmailVerification` now render in the recipient's language. Both
  are already fully localized through `trans()` with real `lang/es/users.php` keys, so **no
  notification class needs editing**; the entire change is one method on `User`.

  **What the fallback returns, and why it is not `null`.** `preferredLocale()` always returns a real
  locale string, resolving `ui_locale` and falling back to `LocaleSetting::defaultNotificationLocale()`.
  Returning `null` and relying on `Localizable::withLocale()`'s falsy no-op was the other candidate and
  is **rejected**: a no-op means "render in whatever locale is currently set", which for a queued
  notification is whatever request happened to leave it set — non-deterministic and untestable. Now
  that story 0068 provides an explicit, administrator-configured default, there is something concrete
  and intentional to return instead of relying on ambient state, which is what settles the question.

  **This removes a concern rather than adding one, and that is worth stating.** The sharpest objection
  to implementing `HasLocalePreference` was the invitation case: a `UserInvitation` is sent to someone
  who has *never* set a preference, so "their UI language" is meaningless at that moment. Under the
  `null`-and-no-op design that invitation would have rendered in the **inviting administrator's**
  ambient session locale — an invitee's email language decided by whoever happened to click the
  button. Routing it through `LocaleSetting::defaultNotificationLocale()` makes it deterministic and
  administrator-controlled instead. The remaining judgement — that a password-reset link arguably
  ought to follow a correspondence language rather than a last UI click — is answered by the setting
  being a *separate column* from the dashboard default, so an administrator can diverge the two.

### Scope fences: what this story must NOT do

Stated in terms of **classes**, not screens, per the
[errors-log rule](../../docs/errors-log.md#a-scope-exclusion-named-screens-while-the-story-edited-a-class-those-screens-share--2026-08-24)
that a screen-shaped exclusion cannot bind shared code:

- `App\Actions\Users\UpdateUser` and `App\Actions\Users\CreateUser` — must not read or write
  `ui_locale`. The admin Users editor does not manage another user's interface language.
- `App\Livewire\Users\Index` — untouched; no locale field on its create/edit form.
- `App\Models\User` — gains a `@property` line, the `HasLocalePreference` interface and the
  `preferredLocale()` method (**D-14**) — and nothing else. **No `casts()` entry** (D-5), **no
  `#[Fillable]` entry** (D-7).
- `App\Notifications\UserInvitation`, `App\Notifications\PendingEmailVerification` — **the classes
  are untouched**, and that is the point: both already render every string through `trans()`, so
  `HasLocalePreference` changes the language they arrive in with **zero edits to either file**. The
  *language* those emails render in does change (D-14); the notification code does not.
- `config/app.php` — untouched. `locale` and `fallback_locale` keep their current values and remain
  the **bootstrap seed and last-resort fallback** — they are no longer the single source of truth for
  the default, which is now `locale_settings` (**D-6**). Nothing in this story reads them directly.
- `App\Models\LocaleSetting`, `locale_settings`, and every class under `app/Actions/Localization/` —
  **story 0068's**, consumed here and never written to. This story adds no migration for that table,
  no seeder, no policy and no setter; it calls two static accessors.
- `config/modules.php`, `routes/**`, `resources/views/**`, `lang/**` — untouched. This story adds no
  route, no sidebar entry, no view and no translation key.

## 5. Dependencies, risks, open technical questions

- **R-1 — The PRD's Layer 1 `Then` clause is only partially satisfiable, and not by this story.**
  Switching to `es` today yields a *partially* translated interface: the sidebar and the Users, Roles,
  Sales Regions and Media screens' own copy will switch (those `lang/es/` files are complete), while
  the rest of the chrome stays English. Whether extracting the remaining hardcoded strings belongs to
  0067, to a dedicated story, or is spread across the 14-story Epic 5 decomposition is **not visible
  from this story's scope** — 0066 is the first Epic 5 file to exist. Phase 2 should confirm that some
  story in the epic owns it; if none does, that is a decomposition gap rather than a 0066 defect.
- **R-2 — ✅ RESOLVED by the human: yes, an administrator's UI language also decides the language of
  their emails.** The question was whether to implement `HasLocalePreference` in this story. It **is**
  implemented — see **D-14** for the shipped shape and the reasoning, including why the fallback
  returns a real locale string rather than `null`. The story's original recommendation was to defer;
  that recommendation is superseded and recorded rather than deleted, because the reason it was
  deferrable changed: with an explicit, administrator-configurable notification default now existing
  (story 0068), the invitation case has a deterministic answer it did not have before. No longer open.

- **R-2a — NEW, and the one ordering irregularity in this story: 0066 depends on 0068, despite the
  lower number.** [workflow.md](../../docs/workflow.md#task-ordering-rule)'s Task ordering rule says a
  dependency is numbered **below** its dependents, and that is inverted here: this story's middleware
  fallback and `preferredLocale()` both call `App\Models\LocaleSetting`, which story **0068** creates.
  The inversion is real, it is **deliberate**, and the files are **not** being renumbered — the need
  was discovered mid-decomposition, after both files existed with their numbers assigned, and
  renumbering would invalidate cross-references across an epic already in flight for a cosmetic gain.

  **What Phase 3 must do, regardless of the numbers:** implement **0068's `LocaleSetting` piece first**
  — the migration, the model with its two accessors, and its seeder — then 0066's middleware fallback
  and `preferredLocale()`. Everything else in 0066 (the column, the enum, the action, the validation
  trait) has **no** dependency on 0068 and can be built first in any order; only the two fallback call
  sites are blocked. A reviewer meeting this out of order should read it as a documented exception
  rather than an oversight, which is why it is stated here instead of left to be inferred.
- **R-3 — `vendor/` is not installed in this worktree.** Every vendor claim in this file was verified
  against the main checkout at `/home/shojen/dev/ia4devs-curso/AI4Devs-finalproject/arospe/vendor`
  (same project, Livewire v4.3.3, Laravel 13). Phase 3 in this worktree cannot re-check vendor source
  locally without installing dependencies first.
- **R-4 — The `web`-group registration has whole-suite blast radius by construction.** Every HTTP test
  in the repo now runs this middleware. The unscoped suite run is not optional here, and a null-unsafe
  implementation would fail `tests/Feature/Auth/**` broadly rather than subtly.
- **R-5 — The offered set is duplicated between the enum and the PRD, not between the enum and the
  database.** There is deliberately no DB-level constraint (D-2), so the enum plus `Rule::enum()` is
  the only enforcement. If a locale is ever *removed* from the enum, existing rows keep the old value
  — which is exactly the case D-5's `tryFrom()` boundary makes survivable, and which the stale-value
  test pins.
- **Dependency — story 0067 (frontend) consumes this contract** and must not re-derive any of it:
  the enum `App\Enums\UiLocale` (`English`/`Spanish`, `'en'`/`'es'`), the action
  `App\Actions\Users\SetUserUiLocale::__invoke(UiLocale $locale, ?User $user = null): User` — called
  as `app(SetUserUiLocale::class)(UiLocale::Spanish)` with no target for the common case — the column
  `users.ui_locale`, and the middleware `App\Http\Middleware\SetUiLocale`, which is already global so
  0067 needs to do nothing to make `App::setLocale()` take effect. 0067 owns the switcher markup, any
  `label()` the enum needs, and its own lang keys.
- **Dependency — story 0068 (Store Languages + locale settings) is consumed here, and the boundary is
  narrower than this bullet originally claimed.** It used to read *"0068 must not reuse any of this"*,
  which is **too broad and now false**: 0068 legitimately imports `App\Enums\UiLocale` and validates
  with `Rule::enum(UiLocale::class)`, because the offered ES/EN pair is genuinely the same value set
  for the dashboard default, the notification default and a user's own preference. What 0068 must
  **not** reuse is the *per-user* concept: `users.ui_locale`, `SetUserUiLocale`, and the idea that a
  locale belongs to an account. Its own settings are store-wide and live in `locale_settings`.
  Layer 2's **store content languages** (`store_languages`, an open set including French) remain
  entirely separate from both — that is the PRD's "do not conflate them", and it is unaffected by the
  shared enum, which describes only the ES/EN admin-interface pair.

## 6. Technical tasks for later backlog creation

0. **First, and out of numeric order — implement story 0068's `LocaleSetting` piece** (migration,
   model with its two accessors, seeder). Tasks 3 and 6 below call it and cannot be completed until
   it exists; everything else here is independent of it. See **R-2a** for why the numbers are
   inverted and why the files are deliberately not renumbered.
1. Create the migration adding `users.ui_locale` (nullable `VARCHAR(5)`, after `status`, no index, no
   backfill) and confirm the resulting index list with `php artisan db:table users`.
2. Create `App\Enums\UiLocale` with exactly two cases and no `label()`/`default()`.
3. Add the `@property` line to `App\Models\User`, plus the `HasLocalePreference` interface and
   `preferredLocale()` (**blocked on task 0 below**) — and deliberately nothing else.
4. Add `uiLocaleRules()` to the existing `App\Concerns\UserValidationRules`.
5. Create `App\Actions\Users\SetUserUiLocale` with the derived self-only guard.
6. Create `App\Http\Middleware\SetUiLocale` — the app's first custom middleware — using
   `tryFrom() ?? LocaleSetting::defaultUiLocale()->value` (**blocked on task 0 below**).
7. Register it with `$middleware->web(append: [...])` in `bootstrap/app.php`.
8. Add a `uiLocale()` state to `UserFactory` for tests needing an explicit value; leave
   `definition()` untouched so every existing test keeps `null`.
9. Write the five test files listed above, including the prove-it-can-fail step on the Livewire
   round-trip test.
10. Run all three quality gates unscoped and record each result, including any not run.
11. Docs pass per the Definition of Done, including the gherkin-guidelines glossary rows separating
    "admin UI language" from "store language".

## Provenance

All three Phase 1 participants have now contributed, though not in one pass — the sequence is
recorded because it explains why some decisions carry more history than others:

| Participant | Status |
| --- | --- |
| `backend-qa` | ✅ Contributed in the first round. Shapes the whole *Tests to perform* section, plus **D-10**, **D-11** and **D-13**. |
| `backend-expert` | ✅ Contributed on a later dispatch (the first two returned nothing). Reviewed **D-1**–**D-4**, **D-7**, and designed the `HasLocalePreference` addition. |
| `database-expert` | ✅ Contributed on a later dispatch (same). Reviewed the schema decisions **D-1**–**D-4** and **D-7**. |

**Both experts endorsed D-1, D-2, D-3, D-4 and D-7 as written**, so no schema decision was reversed
on review. One was *re-argued* rather than changed: `database-expert` pointed out that **D-7**'s
stated test (*"could a form legitimately supply this value"*) actually argues for **inclusion**, and
that the correct test is whether a rule binds *who* may write the column that a raw mass-assign would
bypass — D-11's self-only rule. The conclusion stands; its reasoning was rewritten to lead with that,
because a decision recorded with the wrong justification survives review and then misleads whoever
applies it next.

**One decision was resolved against both experts' original recommendations, by the human.** **R-2**
(implement `HasLocalePreference`?) was escalated with a recommendation to defer; the human chose to
implement it. The follow-on question — what `preferredLocale()` returns for a user with no preference
— split the two experts (`database-expert`: always a real string; `backend-expert`: `null`, relying on
`Localizable::withLocale()`'s no-op). Neither shape is what shipped: the human's separate decision to
introduce an **administrator-configurable** default (story 0068) settles it in favour of always
returning a real value, because there is now something concrete and intentional to return instead of
ambient state. See **D-14**.

**What was verified by execution rather than asserted** — each checked against the installed vendor
tree at `/home/shojen/dev/ia4devs-curso/AI4Devs-finalproject/arospe/vendor` (this worktree has no
`vendor/`, see **R-3**):

- **D-8** — Livewire v4.3.3 registers `/livewire/update` in the `web` group
  (`HandleRequests.php:28`, `setUpdateRoute()` lines 95–99).
- **D-8 / Tests** — `Livewire::test()` disables all middleware
  (`RequestBroker.php:28`, reached from `InitialRender.php:32` and `SubsequentRender.php:35`), so it
  cannot test this middleware. This resolves what `backend-qa` proposed as a spike.
- **D-5** — Eloquent's enum cast resolves with `from()`, not `tryFrom()`
  (`HasAttributes::getEnumCaseFromValue()` line 1317), so a stale value throws on hydration.
- **Validation** — `Rule::enum()` resolves with `tryFrom()` (`Rules/Enum.php:75`), so it is safe
  against a forged value.
- **R-2** — `NotificationSender::preferredLocale()` line 134 consults `HasLocalePreference` for every
  notification, and `Localizable::withLocale()` no-ops on a falsy locale.

**Reconciled against story 0068 on 2026-08-28.** That story ships the `locale_settings` singleton
this file's middleware and `preferredLocale()` now consume, and its own **R-13** enumerates precisely
what had to change here; every row of that table has been applied — the middleware fallback, **D-6**
(rewritten around the three-tier chain rather than deleted), the two scope fences that had become
false (`config/app.php` as "the single source of truth", and the over-broad "0068 must not reuse any
of this"), the affected Gherkin scenarios, and the two fallback tests 0068 warned would **keep
passing for the wrong reason** if left as written. This story is also what gives `locale_settings`
its first real consumer, closing the zero-consumer gap 0068's **R-16** records.

**Nothing here is open for a human any longer.** **R-2** is resolved (implement it); **R-2a** is a
recorded, deliberate exception to the task-ordering rule rather than a question. Phase 2's remaining
job is the ordinary INVEST check plus confirming that the 0068-before-0066 build order in
[§6 task 0](#6-technical-tasks-for-later-backlog-creation) is understood.

_Phase 1 only. No INVEST check, no TDD, no security audit, no code review, no docs pass — those are
Phases 2–7 and are orchestrated separately._
