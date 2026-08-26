# [0057] Notification bell UI — topbar dropdown, unread indicator, generic per-type rendering

## Description

Ship the **notification bell** an administrator actually sees: an unread indicator, a dropdown listing
their fifteen most recent notifications newest-first, and mark-all-as-read on open. It is the UI half
of [0056](0056-notification-viewing-backend.md), consuming that story's three query shapes **verbatim**
— it adds no query of its own. Every row renders through a **generic** path with a fallback for any
notification type this component has never seen, so the two event producers that do not exist yet need
zero change here when they arrive.

> **This is a cross-cutting concern, folded into Epic 3's decomposition at the human's explicit
> request — it is not a native Epic-3 feature.** Its PRD home is
> [§ Cross-cutting: global search & notifications](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications),
> which sits **above** the epics because the bell's contents are produced by Epic 2 (low/zero stock),
> Epic 3 (new customer, new order) and Epic 4 (blog post published) alike. It is filed here because
> Epic 3 owns two of the four producers and is where the gap became visible
> ([0043](0043-customers-new-customer-notification-backend.md)'s **OQ-3**, option (a)) — not because a
> notifications bell belongs to Customers or Orders. It is the last story of this session's extended
> Epic 3 decomposition.

> **⛔ Global search is explicitly OUT OF SCOPE.** The PRD section this story is drawn from carries
> **two** sibling features — the topbar's global search field *and* the notifications bell. This story
> builds **no search functionality whatsoever**: no search field, no query, no result grouping, no
> permission-filtered result set, no empty state for a search term. Global search's four PRD scenarios
> and its three acceptance criteria remain **unowned by any story**, exactly as they were before this
> file existed. See [0056's OQ-1](0056-notification-viewing-backend.md#open-questions), which this file
> does not close.

## Type

frontend | includes database-expert: **no**

### Three Amigos participants

- `frontend-expert` — the layout finding below (verified against the real files rather than assumed),
  the two-mount-point recommendation, the generic-with-fallback rendering path, the refresh cadence,
  and the `data-test` hooks.
- `frontend-qa` — eleven browser-level test cases, with the **unrecognized-type fallback** named as the
  highest-value case and the cross-user isolation case constrained to one real fan-out dispatch.
- **No `database-expert`.** This story adds no table, no column, no index, no migration and no query.
  Every read it performs is one of 0056's three call shapes.

### The layout finding this story is built on

**There is no persistent desktop topbar in this application today**, and the whole placement decision
turns on that. Verified by reading the real files, not inferred:

- `resources/views/layouts/app.blade.php` renders `<x-layouts::app.sidebar>` wrapping a `<flux:main>`
  — it is four lines and contains no chrome of its own.
- `resources/views/layouts/app/sidebar.blade.php` is the entire shell. Desktop shows a left
  `flux:sidebar` (the `<x-sidebar-nav />` registry from task 0013, a `flux:spacer`, and
  `<x-desktop-user-menu class="hidden lg:block" />` pinned to the bottom).
- A `flux:header` **does** exist in that same file but carries `class="lg:hidden"` — it is
  **mobile-only**, holding the `flux:sidebar.toggle` hamburger and a `flux:dropdown` user menu.
- Every screen renders its own heading inline (`users.blade.php`, `roles.blade.php`); there is no
  shared per-page topbar to hang anything from.

So "put the bell in the topbar", read literally, would require **building a topbar first**. This story
does not do that — see [**D-1**](#documented-functional-decisions).

## Gherkin

```gherkin
Feature: Notification bell

  # --- The two PRD bell-state scenarios ---

  Scenario: The bell shows an unread indicator
    Given a signed-in administrator with at least one unread notification
    When they open the admin panel
    Then the notifications bell shows an unread indicator

  Scenario: Reading notifications clears the unread indicator
    Given a signed-in administrator whose notifications bell shows an unread indicator
    When they open the notifications bell
    Then the unread indicator is no longer shown

  # --- The indicator's absence, reached by two distinct paths ---

  Scenario: An administrator who has never received a notification sees no indicator
    Given a signed-in administrator with no notifications at all
    When they open the admin panel
    Then the notifications bell shows no unread indicator

  Scenario: An administrator whose notifications are all read sees no indicator
    Given a signed-in administrator whose notifications have all been read
    When they open the admin panel
    Then the notifications bell shows no unread indicator

  # --- Generic rendering: the property that decouples this story from Epics 2 and 4 ---

  Scenario: A recognized notification renders a summary with a link to its record
    Given a signed-in administrator holding one unread new-customer notification
    When they open the notifications bell
    Then that notification is listed with the customer's name and a link to that customer

  Scenario: A notification type the bell has never seen renders through the fallback
    Given a signed-in administrator holding one unread notification of an event type this bell does not recognize
    When they open the notifications bell
    Then that notification is listed with a generic label and no link

  # --- Ordering, cap, empty state ---

  Scenario: The bell lists the newest notifications first
    Given a signed-in administrator holding several notifications received at different times
    When they open the notifications bell
    Then the most recently received notification is listed first

  Scenario: The bell lists at most fifteen notifications
    Given a signed-in administrator holding more notifications than the bell shows
    When they open the notifications bell
    Then exactly fifteen notifications are listed

  Scenario: An administrator with no notifications sees an empty state
    Given a signed-in administrator with no notifications at all
    When they open the notifications bell
    Then an empty state is shown in place of a notification list

  # --- Scoping: the highest-risk property, inherited from 0056 ---

  Scenario: An administrator does not see another administrator's notification
    Given two administrators who both received a notification from the same new-customer event
    When the first administrator opens the notifications bell
    Then they see only their own notification

  Scenario: Reading one administrator's notifications leaves the other's indicator showing
    Given two administrators who both received a notification from the same new-customer event
    When the first administrator opens the notifications bell
    Then the second administrator's bell still shows an unread indicator

  # --- Deliberate non-behaviour (0056 D-1) ---

  Scenario: A notification stays visible after its module permission is revoked
    Given a signed-in administrator holding a new-customer notification whose customers view permission has since been revoked
    When they open the notifications bell
    Then that notification is still listed
```

## Files to create/modify

### Create

```
app/Livewire/Notifications/Bell.php                        -- the component
resources/views/livewire/notifications/bell.blade.php      -- its view (see the naming note below)
lang/en/notifications.php                                  -- summary templates + fallback label
lang/es/notifications.php                                  -- key-for-key identical to lang/en/
tests/Browser/Notifications/BellTest.php                   -- the browser suite
tests/Feature/Notifications/BellTest.php                   -- component-level assertions
```

> **View path — this is deliberately *not* an `Index`-in-a-subfolder case.** The component is named
> `Bell`, not `Index`, so Livewire's normal component ↔ view mirror applies and the view is
> `resources/views/livewire/notifications/bell.blade.php` — **nested**, unlike
> `livewire/users.blade.php` and `livewire/roles.blade.php`, which are flat only because their classes
> are named `Index`. See [conventions/naming.md](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name),
> whose closing paragraph names exactly this asymmetry as expected rather than a mistake. Story 0010's
> own spec got this wrong in the opposite direction and cost real time; **resolve the path by running
> the component, not by reasoning about it.**

### Modify

```
resources/views/layouts/app/sidebar.blade.php   -- two mount points, both in this one file
```

Mounted **by name** in both places, which is what keeps the component reusable if a later story
relocates it:

```blade
<livewire:notifications.bell />
```

- **Desktop** — inside `<flux:sidebar>`, adjacent to `<x-desktop-user-menu class="hidden lg:block" />`
  at the bottom, so it sits with the account chrome rather than in the module nav.
- **Mobile** — inside the existing `<flux:header class="lg:hidden">`, beside the `flux:dropdown` user
  menu.

Both are the *same* component mounted twice. Note the consequence for tests and for the DOM: the
`data-test` hooks below appear **twice in the document** at all viewport sizes, with one instance
hidden by Tailwind's responsive classes rather than absent. A browser assertion must therefore scope to
the visible instance rather than assert a document-wide count — see the test plan.

### Explicitly NOT in this story

Listed so reviewers do not reopen them: **global search in any form**; a persistent desktop topbar or
any shared page-chrome redesign (**D-1**, **OQ-1**); a route, a `config/modules.php` entry or a sidebar
nav link (**D-4**); any permission gate, ability, policy or catalog addition (0056 **D-6**); a "view
all notifications" screen, pagination or infinite scroll past the fifteen-item cap (0056 **D-4**,
**OQ-2**); per-notification read state or a "mark as unread" control (0056 **D-3**); real-time
broadcast/Echo push (**D-2**); notification preferences or per-user opt-out; retention/pruning; any
change to `App\Models\User`, the `notifications` table, or the three query shapes 0056 defines; and
**the two missing event producers** — low/zero stock (Epic 2) and blog post published (Epic 4), whose
arrival must require no change here (**D-3**).

## The rendering contract — generic first, recognized second

**The fallback is permanent, load-bearing behaviour, not a placeholder.** It is the single property
that lets this story ship ahead of two of its four producers, and it must never be replaced by an
exhaustive `match` that assumes the type list is closed.

The view branches on `$notification->type` (the FQCN string Laravel's `DatabaseChannel` writes) to
compose a one-line summary, with a `default` arm:

| `type` | Renders | Links to |
| --- | --- | --- |
| `CustomerCreated` (0043) | the customer's name from the payload | that customer's record |
| `OrderCreated` (0046) | the order number from the payload | that order's record |
| **anything else** | a generic label plus the notification's relative `created_at` | **nothing** — no link |

Three constraints on that branch, each of which a Phase 3 implementer would otherwise get wrong:

- **The `default` arm must be reachable without any code change.** A future producer's FQCN is unknown
  today; the fallback is what displays it. A test constructs a notification with an arbitrary `type`
  string and asserts a generic row renders with no fatal error — that test *is* the guarantee.
- **A recognized arm must not assume its payload keys exist.** The payload is an immutable JSON
  snapshot written by a story that may predate a payload change; a missing key must degrade to the
  fallback presentation rather than raise. Read defensively and never with a bare array offset.
- **Nothing outside the view may branch on `type`.** 0056 **D-5** forbids reading `type` in the query
  layer, and this story does not relax that: the component performs no per-type filtering, grouping,
  counting or ability check. The branch is presentational and lives in the Blade file alone.

Copy lives in `lang/{en,es}/notifications.php` — the summary templates and the fallback label as
translation keys, never literal strings in the view (a `|`-delimited plural anywhere outside `lang/` is
the giveaway that this rule was broken; see
[conventions/naming.md](../../docs/conventions/naming.md#translation-keys)).

## Component behaviour

- **Unread count** — `$user->unreadNotifications()->count()` (0056's call 1, the **method**, one
  `COUNT` query). Never `count($user->unreadNotifications)`.
- **Recent list** — `$user->notifications()->latest()->limit(15)->get()` (0056's call 2), read only
  when the dropdown opens.
- **Mark all as read on open** — `$user->unreadNotifications->markAsRead()` (0056's call 3, the
  **property**, i.e. the loaded collection), then the count is re-read **through the method**. This is
  not a stylistic choice: `markAsRead()` leaves the stale collection cached on the model, so re-reading
  the property would render a badge that is already wrong within the same request. 0056's own
  "count recomputes in the same request" test exists for exactly this.
- **Unread indicator** — rendered inside a **structural `@if`**, so its absence is a real DOM omission
  rather than a hidden element. A hidden-but-present element makes every absence assertion vacuous;
  this repo has an errors-log entry on precisely that class of untrustworthy assertion. Prefer an
  existing Flux primitive (check `flux:badge` in a small/dot form) over hand-rolled markup, per
  `CLAUDE.md`'s "check for existing components to reuse".
- **Clicking a notification** navigates to its record via `wire:navigate` and leaves it read. There is
  **no** per-click read state: mark-all already fired when the dropdown opened, so a per-click write
  would be a second mechanism for a state that is already correct (**D-5**).
- **Refresh** — `wire:poll.30s` on the **unread count only**, never the whole dropdown (**D-2**).

### `data-test` hooks

| Hook | Present when |
| --- | --- |
| `notification-bell` | always — the dropdown toggle |
| `notification-bell-unread-indicator` | **only** when the unread count is greater than zero |
| `notification-item-{id}` | one per listed notification |
| `notification-empty-state` | only when the list is empty |

Select by hook, never by translated copy and never by a button label — the bell is icon-only.

## Tests to perform

**`tests/Browser/Notifications/BellTest.php`** — eleven cases, each a named business-role actor
performing one action, each ending with `assertNoJavaScriptErrors()`.

- [ ] **Unread indicator appears** when the administrator holds at least one unread notification.
- [ ] **No indicator, path A**: an administrator with **no notification rows at all**. Asserted as a DOM *absence* of `notification-bell-unread-indicator`.
- [ ] **No indicator, path B**: an administrator whose notifications are **all already read**. **Kept separate from path A deliberately**, mirroring 0056's own two-path precedent — they reach zero through different states, and one combined test would pass while one of the two was broken.
- [ ] **Opening the dropdown clears the indicator durably** — assert the indicator is gone *and* that it is still gone after a page reload. The reload is the point: it proves `read_at` was actually written rather than a client-side flag flipped.
- [ ] **Mixed-type rendering** — one `CustomerCreated` and one `OrderCreated` both listed, each with its summary and a working link to its record.
- [ ] **Unrecognized type renders through the fallback — the highest-value test in this story.** Construct a notification row with an **arbitrary `type` string** directly (not through either real producer), open the bell, and assert: no fatal error, a generic row present, no link. This is what makes shipping the bell ahead of Epic 2's and Epic 4's producers safe, and it must be written so it would fail if someone replaced the `default` arm with an exhaustive match.
- [ ] **Empty state** renders `notification-empty-state`, and is **distinct from all-read-but-populated** — an administrator whose notifications are all read still sees the *list*, not the empty state.
- [ ] **Cap and ordering together** — seed **17** notifications (the cap plus two) at distinguishable times, assert exactly **15** rows and that the first is the most recent. Cap+2 rather than cap+1 so an off-by-one in either direction moves the number.
- [ ] **Cross-user isolation, built from ONE real fan-out dispatch** — construct two real recipients of the **same** event (0043/0046 send to every permission holder, so one dispatch genuinely produces two independent rows), then assert the first administrator sees only their own row and that the second's bell still shows its indicator. **Do not substitute two unrelated fixtures**: independently built rows make the assertion trivially true even against a query missing its scope (0056 **R-1**). Prove it can fail before trusting it.
- [ ] **Presence on at least two authenticated routes** — the bell renders on `dashboard` and on `users.index`, per the PRD's "every screen" wording. Two routes is the minimum that distinguishes "in the layout" from "on one page".
- [ ] **A notification stays visible after its module permission is revoked** (0056 **D-1**) — `frontend-qa`'s recommendation, **adopted**: reuse 0056's scenario and its preconditions verbatim rather than inventing new ones. 0056 pins the *query*; this pins that the **UI** does not filter it back out, which no backend test can observe.

**`tests/Feature/Notifications/BellTest.php`** — the `Livewire::test()`-level assertions that a browser
test cannot make cheaply: that opening the dropdown writes `read_at`, that the re-read count is `0`
within the same request, and that the component performs no query against a user other than
`Auth::user()`.

**Deliberately not tested** (per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)):

- 0056's three query shapes as queries — that is 0056's suite, and duplicating it here pins the same behaviour twice.
- Laravel's `DatabaseNotification` model, its casts, scopes and `markAsRead()` in isolation.
- The dispatch side (who receives what, and with which payload) — 0043's and 0046's test plans.
- Flux's own dropdown open/close mechanics.
- Any global-search behaviour — there is none.

## Expected outcome

An administrator signed into the panel sees a notifications bell in the chrome on every authenticated
screen, at both desktop and mobile widths. It carries an unread indicator whenever they hold unread
notifications and no indicator otherwise; opening it lists their fifteen most recent notifications
newest-first, marks them all read, and removes the indicator durably. Recognized notifications show a
one-line summary linking to the record they are about; a notification of a type this component has
never seen renders through the fallback path with a generic label and no link, rather than failing.
Nothing another administrator received is ever visible.

## Acceptance criteria

- [ ] The bell renders on **every authenticated screen**, at both desktop and mobile widths, from the two mount points in `resources/views/layouts/app/sidebar.blade.php` (**D-1**).
- [ ] The unread indicator is present **only** when the unread count is greater than zero, rendered by a structural `@if` so its absence is a genuine DOM omission.
- [ ] Opening the dropdown marks all of that administrator's unread notifications read and clears the indicator **durably** — the state survives a page reload.
- [ ] The list shows at most **15** notifications, newest first, using 0056's call shapes **verbatim**: `$user->unreadNotifications()->count()`, `$user->notifications()->latest()->limit(15)->get()`, `$user->unreadNotifications->markAsRead()`.
- [ ] After mark-all, the count is re-read through the **method** (`unreadNotifications()->count()`), never the cached property.
- [ ] **A notification of an unrecognized `type` renders through a generic fallback path** — a label and a relative timestamp, no link, no fatal error — and that path is pinned by its own test.
- [ ] **No code outside the view's presentational branch reads `notifications.type`** — no filtering, grouping, counting or per-type ability check (0056 **D-5**).
- [ ] **No permission gate is added**: no route, no `can:` middleware, no `config/modules.php` entry, no policy, no new ability (**D-4**, 0056 **D-6**). `auth` — already satisfied by the layout — is the entire boundary.
- [ ] All copy resolves from `lang/en/notifications.php` and `lang/es/notifications.php`, key-for-key identical, with **no** literal user-facing string in the Blade view.
- [ ] The four `data-test` hooks above are present as specified, and every test selects by hook rather than by copy.
- [ ] Unread-count refresh is `wire:poll.30s` scoped to the count, not to the dropdown contents (**D-2**).
- [ ] `App\Models\User`, the `notifications` table, `config/modules.php` and every `routes/*.php` file are **unchanged**.
- [ ] **No global-search functionality of any kind is built**, and the PRD's search half remains explicitly unowned.

## Definition of Done

- [ ] Tests written and green, plus the **full** existing suite run **unscoped** (`php artisan test`, not `--filter`), per [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule and [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done). **This story edits the shared layout, so its blast radius is every rendered page in the suite by construction** — the unscoped run is not optional here.
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer) — including an explicit confirmation that the fallback rendering path exists, is reachable, and is not an exhaustive type switch wearing a `default` arm.
- [ ] No security findings (appsec-auditor) — specifically: that no notification id, user id, type filter, limit or offset reaches a query from the client; that the mark-all path cannot be aimed at another user's rows; that a payload value rendered into the DOM is correctly encoded, and that any value interpolated into a `wire:*` directive goes through `@js()` per [security/blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md); and that the fallback path cannot render an attacker-influenced `type` string as markup.
- [ ] Documentation updated (docs-keeper) — this story adds the app's **first non-page Livewire component mounted from the layout**, which the routes doc's route-shaped table has no row for; record what it is and where it mounts. **No schema, migration, routes or permission change.**
- [ ] **The Definition of Done explicitly does NOT include any global search**, nor a desktop topbar.
- [ ] Acceptance criteria met.

## Dependencies, risks, and open questions

### Dependencies

| Depends on | Kind | Why |
| --- | --- | --- |
| [0056](0056-notification-viewing-backend.md) — notification viewing (backend) | **hard** | Defines the three query shapes this UI calls verbatim, and pins them with the regression suite. Building the view first means building against a contract that does not exist |
| [0043](0043-customers-new-customer-notification-backend.md) — new-customer notification | **hard (transitively)** | Owns the `notifications` table itself, and supplies one of the two recognized types |
| [0046](0046-orders-new-order-notification-backend.md) — new-order notification | **soft / informational** | Not required to build or pass this story. It supplies the *second* recognized type, which is what makes the mixed-type test meaningful; without it that test runs against one real type plus a test-local one, and the acceptance criteria are unchanged |
| Task 0013's layout (`<x-sidebar-nav />`, `x-desktop-user-menu`) | **shipped** | Verified in the working tree; this story adds two lines beside them and changes neither |

**This story depends on no Epic 2 and no Epic 4 story, and the fallback rendering path is precisely
what decouples it from them.** The PRD lists four confirmed event types; two of their producers do not
exist in code. Nothing here enumerates the type list, so when either ships it renders through the
fallback immediately and through a recognized arm whenever someone chooses to add one — an additive
change, never a blocking one. That is why this story must not be sequenced behind them.

Per the [task ordering rule](../../docs/workflow.md#task-ordering-rule), sequence
0043 → 0046 → 0056 → **0057** into Phase 3.

### Risks

- **R-1 — Two mount points can drift.** The same component is mounted twice in one file; a later change made to one mount and not the other produces a bell that works on desktop and not on mobile (or vice versa), which no single-viewport test observes. Mitigation: mount **by name** with no per-mount configuration, so the two lines are byte-identical and there is nothing to drift; and keep the "renders on ≥2 routes" test viewport-explicit.
- **R-2 — A hook that appears twice makes a naive count assertion wrong.** Both instances are in the DOM at every viewport, with one hidden by Tailwind rather than absent. A `substr_count`-style assertion over rendered HTML will therefore read **two** where the author expected one. This is the exact failure shape [errors-log.md](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21) records — an over-count by a constant reads as the true number. Mitigation: assert *presence/absence scoped to the visible instance*, never a document-wide count, and prove any count assertion can move before trusting it.
- **R-3 — A future story adds per-type grouping and silently breaks the generic property.** "Group the dropdown by module" is a small, reasonable-sounding feature that would end the "zero changes for a new event type" guarantee. Mitigation: the unrecognized-type test is the tripwire, and the no-type-branching rule is an acceptance criterion here as it is in 0056 (**D-5**).
- **R-4 — `wire:poll.30s` on every authenticated page is a standing request load.** One extra `COUNT` per user per 30 seconds, on a query 0043's composite index already covers, at backoffice concurrency. Recorded as a known consequence rather than a defect; **D-2** names the reversal path if it ever matters.
- **R-5 — Mark-all-on-open loses information** (0056 **R-4**, inherited unchanged). Opening the bell to glance at one entry marks the other fourteen read. Accepted; the stored data supports per-row read state already, so only the trigger would move.
- **R-6 — This document goes stale while it waits.** It sits behind three stories. Re-run the Phase 2 INVEST review immediately before Phase 3 rather than treating it as passed on first reading, and **re-verify the layout finding above against the real files at that point** — a topbar could plausibly arrive from another story in the interim, which would change **D-1**'s premise rather than its conclusion. A stale quote is a claim about a tree that no longer exists ([errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)).

### Open questions

**OQ-1 — Who owns a persistent desktop topbar, if anyone?** Non-blocking; **D-1** ships a working
answer without it. The PRD's cross-cutting section describes a topbar carrying *two* features, and this
story delivers one of them into existing chrome instead. A real shared topbar is a layout decision
affecting every screen, and it is the natural home for global search — so it plausibly belongs with
[0056's OQ-1](0056-notification-viewing-backend.md#open-questions) rather than being decided here.
**Recommended: leave it open and decide it together with global search's owner _(recommended)_** — the
two questions have the same answer, and deciding one without the other means deciding it twice. If a
topbar story does land, relocating the bell is a **one-line move of the mount point**, which is exactly
why **D-1** is safe to ship now.

**OQ-2 — Should live cross-tab updates be added?** Non-blocking; a default is stated. Today a bell open
in one tab does not learn about a notification read in another until its next poll or navigation.
**Recommended: out of scope _(recommended)_** — the 30-second poll and any `wire:navigate` page load
both converge, no PRD scenario asks for cross-tab consistency, and 0056 already accepts "stale until
the next interaction" for read state. Both `frontend-expert` and `frontend-qa` raised this
independently and both recommend the same answer.

## Documented functional decisions

**D-1 — The bell mounts in the two places chrome already exists: the mobile `flux:header` and the
desktop sidebar. No topbar is built.** *`frontend-expert`'s recommendation, confirmed and adopted as
the shipped decision.*

The PRD says "topbar"; this application has no persistent desktop topbar (see
[the layout finding](#the-layout-finding-this-story-is-built-on), verified against the real files).
Three reasons for mounting into existing chrome rather than building one:

1. **It is reversible at trivial cost.** A future topbar story relocates the mount point by moving one
   `<livewire:notifications.bell />` line. The component, its view, its lang file, its hooks and every
   test it carries are unaffected, because the component knows nothing about where it is mounted.
2. **The alternative is scope creep into an unscoped decision this story has no mandate to make.**
   Introducing shared page chrome changes every screen in the application, and it is the natural home
   for global search — which is explicitly out of scope and currently unowned (**OQ-1**). Deciding it
   as a side effect of a bell story is how a layout decision gets made by whoever noticed last.
3. **The alternative to shipping is not "ship it better later" — it is "ship nothing".** Deferring the
   whole story pending a hypothetical redesign leaves a PRD acceptance criterion unmet for an unbounded
   period, in exchange for a placement that a one-line change can correct.

The accepted cost, stated rather than glossed: the bell sits at the **bottom** of the desktop sidebar
with the account chrome rather than in a top-right position a user might reach for first. That is a
placement preference, not a functional gap, and it is the half a topbar story would fix.

**D-2 — `wire:poll.30s` on the unread count is the shipped refresh mechanism.** *Recommended by
`frontend-expert`, confirmed and recorded here with its reversal path.*

The poll is scoped to the **count only**, never to the dropdown contents — polling the list would
re-run the fifteen-row query and re-render markup nobody is looking at. Thirty seconds matches this
repo's existing no-real-time-push posture: nothing in this application broadcasts today, no Echo/Reverb
dependency is installed, and 0056 already accepts staleness until the next interaction. A
`wire:navigate` page load re-renders the bell naturally, so the poll only covers the case of an
administrator sitting on one screen.

**Reversible with zero contract change to 0056**: swapping to a broadcast/Echo push means replacing the
`wire:poll` directive with a listener on the same component reading the same
`unreadNotifications()->count()`. The query shapes, the payloads and the `notifications` table are all
untouched by that change — which is what makes this a cheap decision to revisit rather than a lock-in.

**D-3 — The generic fallback is permanent behaviour, and never an exhaustive switch.** The `default`
arm exists so that a notification type this component has never seen still renders. Two consequences,
both intended: Epic 2's low/zero-stock and Epic 4's blog-published producers need **zero change here**
when they arrive, and the FQCN Laravel writes into `notifications.type` stays free to change on a class
rename without a viewing-side migration. A recognized arm is an *enhancement* over the fallback, added
per type when someone wants a link and a name — never a precondition for the type displaying at all.
This is the UI-side counterpart of 0056 **D-5**, and **R-3** names the plausible future feature that
would break it.

**D-4 — No permission gate, no route, no registry entry.** Inherited from 0056 **D-6** and restated
because it is a live question every time something new appears in the chrome. Every query is scoped to
`Auth::user()`'s own morph key, so the actor reaches only their own rows; there is no target selection
and no id from the client. The bell is not a *screen*, so it needs no route and therefore no
`can:` gate and no `config/modules.php` entry — the sidebar registry exists to link module screens, and
adding an entry for a component that is not a page would be a category error. `auth`, already satisfied
by the layout the bell mounts into, is the entire boundary. Note the deliberate contrast with the
module screens: those gate because they disclose *other* records.

**D-5 — Clicking a notification navigates and leaves it read; there is no per-click state.**
*`frontend-expert`'s recommendation, adopted.* Mark-all already fired when the dropdown opened
(0056 **D-3**), so every listed notification is read before any click happens — a per-click write would
be a second mechanism producing a state that is already correct, and a second place for the two to
disagree. Navigation is `wire:navigate`, matching every other link in this application.
**Cheaply reversible**: `read_at` is already per row and `DatabaseNotification` ships a per-instance
`markAsRead()`, so a later per-notification model moves the *trigger* without touching schema or
payload.

## Resolved in the debate

- **Placement is decided, not deferred** (**D-1**): two mount points in the one layout file, no topbar.
  `frontend-expert` explicitly asked for confirmation rather than blocking the story on a hypothetical
  redesign, and the confirmation is recorded here with its reversal path and its accepted cost.
- **The layout finding was verified against the real files** — `app.blade.php` delegates to
  `app/sidebar.blade.php`; the only `flux:header` is `lg:hidden`; desktop chrome is the sidebar plus
  `x-desktop-user-menu`. Nothing about "the topbar" was assumed.
- **The refresh mechanism is `wire:poll.30s` on the count** (**D-2**), recorded as a decision with an
  explicit swap-to-push path that changes nothing in 0056's contract.
- **The generic fallback is the story's load-bearing property** (**D-3**), and `frontend-qa`'s
  unrecognized-type test is named the highest-value case for exactly that reason — it is what makes
  shipping ahead of two of the four producers safe.
- **The component is named `Bell`, not `Index`**, so its view is **nested** rather than flat — the
  `Index`-in-a-subfolder exception does not apply, and the spec says so explicitly because this repo has
  already lost time to getting it backwards.
- **`frontend-qa`'s D-1 permission-revocation browser test is adopted**, reusing 0056's scenario rather
  than inventing preconditions: 0056 pins the query, this pins that the UI does not filter it back out.
- **Cross-user isolation must be built from one real fan-out dispatch**, not two independent fixtures
  (0056 **R-1**), and proven able to fail before it is trusted.
- **Both open questions raised by the two agents were the same two**, and both are recorded with a
  recommended default rather than left implicit: the topbar's ownership (**OQ-1**, decide with global
  search) and live cross-tab updates (**OQ-2**, out of scope).
- **Global search is excluded and stated as still-unowned**, so this file's existence does not make the
  PRD's cross-cutting section look closed.
- **This story is cross-cutting, filed in Epic 3 by human decision** — stated at the top so a reviewer
  does not read it as Customers/Orders functionality.

## Provenance

- **PRD source:** [§ Cross-cutting: global search & notifications](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications) — the two bell-**state** scenarios ("The bell shows an unread indicator", "Reading notifications clears the unread indicator"), both covered above, plus the acceptance criterion *"The bell displays an unread indicator and clears it once notifications are read."* The section's `Scenario Outline: A confirmed event generates a notification` belongs to the four event producers, and the whole `Feature: Global panel search` is excluded and remains unowned.
- **Backlog origin:** [0043's OQ-3](0043-customers-new-customer-notification-backend.md#open-questions), option (a). [0056](0056-notification-viewing-backend.md) is that story's backend half and names **0057** as its paired UI story by number; this file is it.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from `frontend-expert` (the layout finding, the two-mount-point recommendation, the generic-with-fallback rendering path, the mark-all-then-re-read-via-method rule, the poll cadence, the `data-test` hooks, and the explicit request for a placement decision rather than a deferral) and `frontend-qa` (the eleven browser cases, the two-path indicator-absence split, the durable-clear-across-reload assertion, the unrecognized-type case named highest-value, the one-dispatch isolation constraint, the ≥2-route presence case, and the D-1 permission-revocation case), composed by `product-owner` as facilitator. **No `database-expert`**: no schema, no query (see the Type section).
- **Gherkin conventions:** every scenario opens with a named business-role actor and carries exactly one `When`, per [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 — mandatory across all Gherkin in this project, per the incident in [errors-log.md](../../docs/errors-log.md).
- **Verified against the working tree by `product-owner` rather than relayed:** `resources/views/layouts/app.blade.php` renders `<x-layouts::app.sidebar>` and nothing else; `resources/views/layouts/app/sidebar.blade.php` contains the entire shell, with `<flux:header class="lg:hidden">` as the only header and `<x-desktop-user-menu class="hidden lg:block" />` after a `flux:spacer` inside `<flux:sidebar>`; `app/Livewire/` contains `Actions/`, `Roles/`, `Settings/` and `Users/` with no `Notifications/`; `lang/en/` and `lang/es/` contain `navigation.php`, `roles.php` and `users.php` with no `notifications.php`; and `tests/Browser/` contains `Auth/`, `RolesIndexTest.php` and `UsersIndexTest.php` with no `Notifications/` folder.
- **Stage:** `new`. It moves to `ai-spec/tasks/in-progress/` at the start of Phase 3, and to `ai-spec/tasks/done/` at Phase 7 — the first move changes this file's directory depth, so every relative link above must be re-resolved in **both** directions on each move, per [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
