# [0056] Notification viewing — unread count, recent list, mark-as-read (backend)

## Description

Establish the **generic notification-viewing mechanism** an administrator's bell/dropdown reads: the
unread count, the recent-notifications list, and mark-as-read. It works with whatever notification
types exist in the `notifications` table at the time, and it never branches on a notification's
`type` — so the two event producers that exist today ([0043](0043-customers-new-customer-notification-backend.md)
`CustomerCreated`, [0046](0046-orders-new-order-notification-backend.md) `OrderCreated`) and the two
that do not yet exist need **zero change here** when they arrive.

> **This is a cross-cutting concern, folded into Epic 3's decomposition at the human's explicit
> request — it is not a native Epic-3 feature.** Its PRD home is
> [§ Cross-cutting: global search & notifications](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications),
> which sits **above** the epics precisely because the bell's contents are produced by Epic 2
> (low/zero stock), Epic 3 (new customer, new order) and Epic 4 (blog post published) alike. It is
> filed here because Epic 3 owns two of the four producers and is where the gap became visible
> (0043's **OQ-3**, option (a)) — not because notification viewing belongs to Customers or Orders.
> A reviewer should read it as the cross-cutting story that 0043's OQ-3 asked for, now placed.

> **⛔ Global search is explicitly OUT OF SCOPE.** The PRD section this story is drawn from carries
> **two** sibling features — the topbar's global search field *and* the notifications bell. This story
> builds **no search functionality whatsoever**: no query, no result grouping, no permission-filtered
> result set, no empty state for a search term. Global search's four PRD scenarios and its three
> acceptance criteria remain **unowned by any story**, exactly as they were before this file existed;
> that is stated here so nobody reads this story's existence as having closed the whole PRD section.
> See [OQ-1](#open-questions).

## Type

backend | includes database-expert: **no**

### Three Amigos participants

- `backend-expert` — the query contract, the finding that Laravel's `Notifiable` trait already
  provides every operation this story needs, and the recommendation that this story ship **no new
  production class**.
- `backend-qa` — risk-based test design, with cross-user scoping named as the highest-risk case, and
  the permission-revocation disagreement escalated rather than assumed.
- **No `database-expert`.** This story adds no table, no column, no index and no migration. The
  `notifications` table — including its `$table->uuidMorphs('notifiable')` correction and the composite
  `(notifiable_type, notifiable_id)` index that composite index gives it — is story
  [0043](0043-customers-new-customer-notification-backend.md)'s deliverable, and it is exactly the
  access path every query below uses. That is the whole reason the participant list is two rather than
  three.

### What this story is, given that it ships no class

Its deliverable is a **documented, test-pinned query contract** plus the regression suite that pins it.
That is a deliberate answer to a real question `backend-expert` raised, not an accidentally empty
story — see decision [**D-2**](#documented-functional-decisions), which records why adding an
`app/Actions/Notifications/` folder here would be a wrapper around vendor methods with no domain rule
to centralise.

## Gherkin

```gherkin
Feature: Notification viewing

  # --- The two PRD bell-state scenarios ---

  Scenario: The bell shows an unread indicator
    Given a signed-in administrator with at least one unread notification
    When they view the topbar
    Then the notifications bell shows an unread indicator

  Scenario: Reading notifications clears the unread indicator
    Given a signed-in administrator whose notifications bell shows an unread indicator
    When they open their notifications
    Then the unread indicator is cleared

  # --- The mechanism is generic, never per-event-type ---

  Scenario: The unread count spans every notification type
    Given a customer administrator holding one unread new-customer notification and one unread new-order notification
    When they view the topbar
    Then the unread count is two

  Scenario: A notification type the mechanism has never seen is still counted
    Given a signed-in administrator holding one unread notification of an event type this mechanism does not know
    When they view the topbar
    Then that notification is counted like any other

  # --- Empty states, reached by two distinct paths ---

  Scenario: An administrator who has never received a notification sees no indicator
    Given a signed-in administrator with no notifications at all
    When they view the topbar
    Then the notifications bell shows no unread indicator

  Scenario: An administrator whose notifications are all read sees no indicator
    Given a signed-in administrator whose notifications have all been read
    When they view the topbar
    Then the notifications bell shows no unread indicator

  # --- Scoping: the highest-risk property in this story ---

  Scenario: An administrator does not see another administrator's notification
    Given two administrators who both received a notification from the same new-customer event
    When the first administrator opens their notifications
    Then they see only their own notification

  Scenario: Reading one administrator's notifications leaves the other's unread
    Given two administrators who both received a notification from the same new-customer event
    When the first administrator opens their notifications
    Then the second administrator's notification is still unread

  # --- Ordering and cap ---

  Scenario: The recent list shows the newest notifications first
    Given a signed-in administrator holding several notifications received at different times
    When they open their notifications
    Then the most recently received notification is listed first

  Scenario: The recent list is capped
    Given a signed-in administrator holding more notifications than the recent list shows
    When they open their notifications
    Then they see exactly the fifteen most recent notifications

  # --- Deliberate non-behaviour ---

  Scenario: A notification stays visible after its module permission is revoked
    Given a signed-in administrator holding a new-customer notification whose customers view permission has since been revoked
    When they open their notifications
    Then that notification is still listed
```

## Files to create/modify

### No new production PHP class — and that is the decision, not an omission

**This story ships no `app/Actions/Notifications/`, no `App\Models\Notification`, no policy, no route,
no `config/modules.php` entry and no `lang/` file.** Stated here in the Files section so a reviewer
reads it as a recorded decision rather than as work someone forgot; the reasoning is
[**D-2**](#documented-functional-decisions). This repo already has a precedent for "a domain that
needs no Actions folder" — `App\Models\SalesRegion` (task 0016) ships a model, a seeder and a set of
conventions with **no** `app/Actions/SalesRegions/` at all, because nothing there had a domain rule to
centralise.

Every operation this story needs is already provided, verified against the installed vendor source
rather than assumed:

| Provided by | What it gives, verified |
| --- | --- |
| `App\Models\User`'s `use Notifiable;` (Epic 1, unchanged) | `Notifiable` composes `HasDatabaseNotifications` + `RoutesNotifications` |
| `HasDatabaseNotifications::notifications()` | `morphMany(DatabaseNotification::class, 'notifiable')->latest()` — **already `latest()`-ordered inside the relation** |
| `HasDatabaseNotifications::unreadNotifications()` / `readNotifications()` | the same relation plus `scopeUnread` (`whereNull('read_at')`) / `scopeRead` (`whereNotNull('read_at')`) |
| `DatabaseNotification::markAsRead()` | writes `read_at` **only when it is currently null** — idempotent by construction |
| `DatabaseNotificationCollection::markAsRead()` | `$this->each->markAsRead()` — the bulk form, returned automatically because `DatabaseNotification` declares it as its collection class |
| 0043's `uuidMorphs('notifiable')` composite index | `(notifiable_type, notifiable_id)` — the exact prefix every query below filters on. **No new index is needed and none may be added** |

### The query contract — the thing this story actually delivers

These three call shapes are the deliverable. Story **0057** (the paired bell/dropdown UI, not yet
written) consumes them **verbatim**; anything else is a contract change that comes back through
Phase 1, not a refactor.

```php
// 1. Unread count — one COUNT query, never a loaded collection counted in PHP.
$user->unreadNotifications()->count();

// 2. Recent list — newest first, capped at 15.
$user->notifications()->latest()->limit(15)->get();

// 3. Mark all as read, on dropdown open.
$user->unreadNotifications->markAsRead();
```

Four properties of that contract, each verified rather than assumed, and each the kind of thing a
Phase 3 implementer would otherwise re-derive incorrectly:

- **`unreadNotifications()` with parentheses, never `count($user->unreadNotifications)`.** The method
  returns the relation's query builder, so `->count()` is a single `SELECT COUNT(*)` against the
  composite index. The property form hydrates every unread row into models to count them — invisible
  at two notifications, real once a producer has been running for months with no reader (see **R-2**).
- **`unreadNotifications` *without* parentheses in call 3, and that is not an inconsistency.**
  `markAsRead()` is a method on `DatabaseNotificationCollection`, so call 3 needs the loaded
  collection; calls 1 and 2 need the builder. Same relation, two accessors, chosen per call.
- **The explicit `->latest()` in call 2 is redundant and deliberate.** The vendor relation already
  applies `->latest()` internally, so the shipped SQL carries `order by created_at desc` twice — free,
  de-duplicated by the planner, and worth keeping because the call site should state its own ordering
  rather than inherit it from a vendor method body a reader has to open. **Do not "clean it up"**; a
  test pins newest-first ordering, so removing it is not a silent change either way.
- **After call 3, the *count* must be re-read through the method, not the property.** `markAsRead()`
  writes each row and leaves the loaded relation cached on the model, so a subsequent
  `$user->unreadNotifications` returns the stale, now-read collection while
  `$user->unreadNotifications()->count()` issues a fresh query and correctly returns `0`. This is what
  the "count recomputes in the same request" test exists to pin — a component that caches the property
  and re-renders from it would show a stale badge.

### Files this story does create

```
tests/Feature/Notifications/NotificationViewingTest.php   -- new; the whole deliverable
tests/Feature/Notifications/                              -- new folder, mirroring app structure
```

`tests/Feature/` already mirrors the app's areas (`Users/`, `Roles/`, `Settings/`, …), so a
`Notifications/` folder follows the existing convention in
[base-standards.md](../../docs/conventions/base-standards.md#directory-structure) — it is not a new
kind of location.

### Explicitly NOT in this story

Listed so reviewers do not reopen them: **global search in any form**; the bell/dropdown Blade and
Livewire component (**0057**); a route, a `config/modules.php` entry or a sidebar link; screen copy in
`lang/{en,es}/`; per-notification (rather than mark-all) read tracking (**D-3**); a "mark as unread"
path; pagination or infinite scroll past the cap (**D-4**); a full "all notifications" screen;
notification preferences or per-user opt-out; retention/pruning (`model:prune`); real-time push
(broadcast/polling); mail or any second channel; browser tests; and **the two missing event
producers** — low/zero stock (Epic 2) and blog post published (Epic 4), which are other epics' work
and whose arrival must require no change here (**D-5**).

## Tests to perform

**`tests/Feature/Notifications/NotificationViewingTest.php`** (`RefreshDatabase`)

- [ ] **Mixed-type unread count**: an administrator holding one unread `CustomerCreated` and one unread `OrderCreated` has a count of **2**. This is the test that proves the mechanism is generic — it must pass without any code anywhere branching on `notifications.type`.
- [ ] **Zero count, path A**: an administrator with **no notification rows at all** has a count of `0`.
- [ ] **Zero count, path B**: an administrator whose notifications are **all already read** has a count of `0`. **Kept as a separate test from path A deliberately** — they exercise different SQL (`WHERE read_at IS NULL` matching nothing vs. the morph filter matching nothing), and a single "count is zero" test would pass while one of the two was broken.
- [ ] **Mark-as-read writes a real timestamp**: after `markAsRead()`, each affected row's `read_at` is non-null and is an actual timestamp, not a truthy placeholder.
- [ ] **The count recomputes in the same request**: read the count, mark all as read, read the count again through `unreadNotifications()->count()` — the second read is `0` without a fresh `User` instance. Pins the relation-caching trap named in the query contract above.
- [ ] **Mark-as-read is idempotent**: marking an already-read set again does not move its `read_at` values. (`DatabaseNotification::markAsRead()` guards on `is_null($this->read_at)`; this asserts the guard rather than trusting it.)
- [ ] **Cross-user scoping — the highest-risk case, and it must be built from one real dispatch.** Construct **two** real recipients of the **same** fan-out event (0043/0046 send to every permission holder, so one event genuinely produces multiple independent `notifications` rows), then assert the first administrator's list contains only their own row. **Do not substitute two unrelated fixtures**: fixtures built independently can pass a scoping test that a shared-`data`, same-`type`, same-`created_at` pair would fail, and the fan-out shape is the one that actually occurs in production.
- [ ] **Cross-user scoping, belt and braces on the *count***: with the same two-recipient dispatch, marking the first administrator's notifications as read leaves the second administrator's count unchanged. Deliberately asserts on `count()` rather than on the list, so a `WHERE notifiable_id = ?` accidentally dropped from **either** query is caught — the list test alone cannot see a mis-scoped count.
- [ ] **Ordering and cap together**: seed **17** notifications (the cap plus two) at distinguishable times, assert exactly **15** come back and that the first is the most recent. Seeding cap+2 rather than cap+1 means an off-by-one in either direction moves the number.
- [ ] **Ordering is by receipt time, not by insertion order or id**: two rows whose `created_at` order is the reverse of their insertion order still come back newest-first.
- [ ] **Permission revocation leaves the notification visible** (decision **D-1**): a recipient whose `customers.view` grant is revoked after the notification was stored still sees it, with its payload intact. This test is what makes **D-1** a pinned decision rather than an accident of implementation.

**Deliberately not tested** (per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)):

- The `notifications` migration's `up()`/`down()` mechanics — 0043's, and `RefreshDatabase` runs every migration anyway.
- Laravel's `DatabaseNotification` model, its casts, its scopes and its `markAsRead()` as framework behaviour in isolation — they are exercised *through* the contract above, which is what the app actually calls.
- The dispatch side: which administrators receive a notification, and what payload it carries, are 0043's and 0046's test plans. This story reads whatever is there.
- Anything in `tests/Browser/` — this story renders nothing to browse. The bell's DOM behaviour is **0057**'s.
- **A soft-deleted recipient.** `backend-qa` raised it and then withdrew it as moot: every query here is rooted at `Auth::user()`, and a soft-deleted account cannot obtain a session at all (the `SoftDeletingScope` on an authenticatable *is* the sign-in refusal — see [security/soft-delete-patterns.md](../../docs/security/soft-delete-patterns.md)). The case is recorded as considered-and-dropped rather than silently absent, so a later reviewer does not re-raise it.

## Expected outcome

An administrator's own unread notifications can be counted, their fifteen most recent notifications
listed newest-first, and all of their unread notifications marked read in one call — each scoped to
that administrator's own morph key and to no one else's, and each blind to which event produced the
row. The count returns to zero within the same request after a mark-all, and stays unchanged for every
other recipient of the same fan-out event. A notification remains visible after the permission that
made its recipient eligible is revoked.

**Nothing is visible in the admin panel as a result of this story**, because the bell that consumes
this contract is story **0057**. The observable outcome is a documented contract and a green Feature
suite — which is what makes 0057 a view built against something real rather than against a guess.

## Acceptance criteria

- [ ] **No new production PHP class, folder, route, config entry, migration or `lang/` file is added** — recorded as decision **D-2**, and verified in review rather than merely observed.
- [ ] The unread count is obtained as `$user->unreadNotifications()->count()` (the **method**, one `COUNT` query), and this is stated in the story's documentation output.
- [ ] The recent list is obtained as `$user->notifications()->latest()->limit(15)->get()` — newest first, capped at exactly **15** (**D-4**).
- [ ] Mark-all-as-read is obtained as `$user->unreadNotifications->markAsRead()` (the **property**, i.e. the collection), triggered on dropdown open (**D-3**).
- [ ] Every query is scoped to `Auth::user()`'s own morph key; no query accepts a caller-supplied user, id or filter.
- [ ] **No code anywhere in this story reads or branches on `notifications.type`**, so a future event producer needs zero change here (**D-5**).
- [ ] There is **no permission gate** on any of it: `auth` is the entire security boundary (**D-6**), no ability is added to the seeded catalog, and no policy is written.
- [ ] A notification stays visible and intact after its recipient's module permission is revoked (**D-1**), pinned by its own test.
- [ ] The full backend-qa suite above is present and green, including both zero-count paths as separate tests and the two-recipient scoping pair built from a single real dispatch.
- [ ] `App\Models\User` is **unchanged** (it already carries `use Notifiable;`), the `notifications` table is **unchanged**, and no index is added.
- [ ] **No global-search functionality of any kind is built**, and the PRD's search half remains explicitly unowned (**OQ-1**) rather than silently absorbed.

## Definition of Done

- [ ] Tests written and green, plus the **full** existing suite run **unscoped** (`php artisan test`, not `--filter`), per [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule and [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer) — including an explicit confirmation that the "no new production class" outcome is the recorded decision **D-2** and not an unfinished story.
- [ ] No security findings (appsec-auditor) — specifically: that no query can be widened by caller-supplied input (no user id, no `type` filter, no limit, no offset reaching a query from the client); that mark-as-read cannot be aimed at another user's row; that the unread count discloses nothing about notifications the actor does not own; and that reading a notification whose originating permission has since been revoked (**D-1**) is a deliberate, bounded disclosure of two snapshot fields rather than an authorization bypass.
- [ ] Documentation updated (docs-keeper) — the **query contract** above must land somewhere 0057's developer will find it without opening this task file. **No schema, migration, routes, naming or base-standards change**: this story adds no column, table, migration, route, class or folder outside `tests/`.
- [ ] **The Definition of Done explicitly does NOT include the bell/dropdown UI** (0057) or **any global search** (unowned, **OQ-1**).
- [ ] Acceptance criteria met.

## Dependencies, risks, and open questions

### Dependencies

| Depends on | Kind | Why |
| --- | --- | --- |
| [0043](0043-customers-new-customer-notification-backend.md) — new-customer notification | **hard** | Owns the `notifications` table, its `uuidMorphs('notifiable')` correction and its composite index. Without it there is no table to query and not a single test here can run |
| [0046](0046-orders-new-order-notification-backend.md) — new-order notification | **soft / informational** | Not required to build or pass this story, but it is what makes the mixed-type test *meaningful*: two genuinely different `type` values proving the mechanism never branches on one. If 0046 has not landed, that test may be written against a second real type or a test-local notification class, and the acceptance criterion is unchanged |
| `App\Models\User` `Notifiable` | **shipped** (Epic 1) | Verified in the working tree; no model change in this story |

**This story depends on no Epic 2 and no Epic 4 story, and that is deliberate rather than an
oversight.** The PRD lists four confirmed event types; two of their producers (low/zero stock —
Epic 2; blog post published — Epic 4) do not exist in code. They are simply **absent from what this
story's tests can exercise today**. Nothing in this design assumes there will only ever be two types:
no `type` value is read, matched, whitelisted or mapped anywhere, which is exactly what
[**D-5**](#documented-functional-decisions) is about. When either producer ships, it writes its rows
through the same `DatabaseChannel` and this mechanism displays them with **zero changes here** — which
is also why this story must not be sequenced behind them.

Per the [task ordering rule](../../docs/workflow.md#task-ordering-rule), 0043's lower number is not
cosmetic — sequence it into Phase 3 ahead of this story. The paired UI story **0057** is numbered
after this one for the same reason: it consumes a contract only this story defines.

### Risks

- **R-1 — The scoping test can pass vacuously.** Two independently built fixtures make "user A does not see user B's row" trivially true even against a query missing its `WHERE notifiable_id = ?`, because nothing correlates the rows. Mitigation: the test plan mandates **one real fan-out dispatch producing both rows**, and a second assertion on the *count* rather than the list. Before trusting either, prove they can fail — temporarily drop the scope and confirm both go red (the same regression-proof discipline recorded in [errors-log.md](../../docs/errors-log.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18)).
- **R-2 — Unbounded row growth with no pruning anywhere in the backlog.** 0043 **R-3** and 0046 **R-5** both record that every event writes N rows nothing ever read. This story starts reading them but adds **no** retention story: `read_at` being set does not delete anything, so a long-lived install accumulates read history indefinitely. The cap (**D-4**) bounds the *list* query, and `unreadNotifications()->count()` is index-covered, so the practical exposure is table size rather than query time at backoffice volumes. Recorded as a known consequence; a pruning story is a legitimate follow-up, deliberately not folded in here.
- **R-3 — A future story adds a per-type filter and silently breaks the generic property.** The moment any code reads `notifications.type` to decide what to render, group or count, the "zero changes for a new event type" guarantee is gone — and it will look like a small, reasonable feature ("group the dropdown by module"). Mitigation: **D-5** is an acceptance criterion, and the mixed-type test is the tripwire.
- **R-4 — Mark-all-on-open loses information that per-notification tracking would keep** (**D-3**). Opening the dropdown to glance at one entry marks the other fourteen read. This is the accepted cost of the simplest mechanism matching the PRD's wording; if the human later wants per-notification read state, the *stored* data supports it unchanged (`read_at` is already per row) — only the trigger moves, which is why this is cheap to reverse.
- **R-5 — This document goes stale while it waits.** It sits behind 0043 at minimum. The Phase 2 INVEST review must be **re-run** immediately before Phase 3 rather than treated as passed on first reading, and the vendor method names quoted above must be **re-verified against the installed `laravel/framework`** at that point — they are verified against today's tree, but a framework upgrade is precisely the event this story's tests exist to catch, and a stale quote is a claim about a tree that no longer exists ([errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)).

### Open questions

**OQ-1 — Global search is unowned by any story, and this file does not change that.** Non-blocking for
*this* story, which is complete without it. The PRD's cross-cutting section carries two features; this
story delivers the bell half of one of them and **nothing** of the search half — four Gherkin scenarios
(cross-module results, opening a result, permission-filtered results, empty state) and three acceptance
criteria have no owner anywhere in the backlog. Three options, for the human:

- **(a) Add a "global panel search" story to the backlog now, sequenced after the modules it searches _(recommended)_.** It is genuinely cross-cutting in the same way the bell was — it queries users, products and blog posts, so it belongs to none of those epics and will otherwise keep being pushed into whichever epic notices last. Numbering it after its searchable modules means it can be built against real tables rather than retrofitted per module. This is the recommendation for the same reason 0043's OQ-3 option (a) was: the alternative is not "deferred" but "unowned", and an unowned PRD criterion is the failure mode this project's errors log keeps recording.
- **(b) Fold it into Epic 5 / the dashboard-shell work**, if a later epic ends up owning topbar chrome as a unit — in which case the bell UI (0057) plausibly moves there too.
- **(c) Explicitly descope global search for this phase**, and amend the PRD's cross-cutting section to say so. Acceptable, but it must be **written down** — leaving it silent means every future reviewer of every topbar story re-asks whether it was missed.

**OQ-2 — Should the recent-notification list ever be reachable in full?** Non-blocking; a default is
stated. As specified, the fifteenth-most-recent notification is the oldest an administrator can ever
see — there is no "view all" screen and no pagination. **Recommended default: no full list in this
phase _(recommended)_** — the PRD asks for a bell and says nothing about an archive, and a full screen
is a route, a permission question and a pagination decision that nothing currently needs. If the human
wants one later it is an additive story that changes nothing here, because the cap lives at the call
site rather than in a query object.

## Documented functional decisions

**D-1 — A notification stays visible after the permission that made its recipient eligible is
revoked.** *This is `backend-qa`'s raised disagreement, resolved here rather than deferred.*

The question: 0043/0046 resolve recipients live at dispatch time (`User::permission('customers.view')`),
so a recipient may hold `customers.view` when the row is written and lose it a week later. The payload
(`customer_name`, `order_number`) is then data the user is no longer live-authorized to view through
the module screens. Should the notification disappear from their bell?

**Decision: no — it stays visible.** Three reasons, in order of weight:

1. **It mirrors the immutable-snapshot philosophy already established across this entire epic.**
   `notifications.data` is an immutable JSON snapshot with no update path, and both producers
   deliberately store literal strings rather than ids-to-be-joined for exactly that reason — 0043
   **D-5** and 0046 **D-5**, which in turn follow 0045 **D-4**'s frozen addresses and its frozen
   line-item `product_name`/`unit_price`. A bell entry is a record of *what happened while you had the
   relevant permission*, not a live view of currently-permitted data. Filtering the list by present-day
   permissions would make it the one place in the domain that re-derives a snapshot against a mutable
   source.
2. **Revoking a permission going forward is not the same operation as scrubbing history.** The revoke
   takes effect where it means something — the module screens, their routes, and the *next* dispatch,
   which no longer resolves that user as a recipient at all. Retroactively erasing past records is a
   materially different action, and nobody asked for it.
3. **This repo has no audit-log or history-scrubbing precedent anywhere**, and PRD assumption 17
   states there is no audit/change-history log this phase. Introducing retroactive record filtering
   here would be inventing that machinery as a side effect of a viewing story.

**The accepted, minor residual, stated rather than glossed:** a former permission holder can still read
the two snapshot fields (a display name and a reference) from old notifications. This is deliberately
**not** treated as a security concern — it follows directly from 0043 **D-5** and 0046 **D-5**'s own
PII-minimalism decisions, which is why those payloads carry no email, no address, no total and no line
items. Neither surviving field is independently sensitive. **The dependency is worth naming
explicitly:** if a future story widens either payload, this residual widens with it, and D-1 must be
re-examined at that point rather than inherited.

**Reversible**, and the shape it would take is worth recording so a future implementer does not invent
a worse one: filtering per-notification by a present-day ability would mean mapping `type` → ability,
which directly violates **D-5**'s "never branch on type" rule. Anyone reversing D-1 is therefore also
reopening D-5, and both must be decided together.

**D-2 — This story ships no new production PHP class, and that is the honest answer rather than a
padded one.** `backend-expert` asked the question explicitly, and the reasoning is:

- Every operation is a **direct call to a vendor-provided method** on a trait `User` already uses.
  There is no domain rule to centralise — no authorization branch, no ordering rule the vendor does not
  already supply, no validation, no transaction, no side effect.
- This repo's action convention exists so that **a rule** lives in one place reachable by every caller
  ([base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)).
  An `app/Actions/Notifications/GetUnreadCount` wrapping `$user->unreadNotifications()->count()` carries
  no rule; it is indirection whose only effect is that the next reader has to open two files to learn
  what one line does. `CLAUDE.md` forbids exactly that kind of speculative structure.
- **`SalesRegion` (task 0016) is the shipped precedent**: a whole domain — a model, a migration, a
  bundled fixture and a seeder — with no `app/Actions/SalesRegions/` folder, because nothing in it had
  domain-rule logic to centralise. A folder appears when a rule does.
- The real value at risk is **regression protection against a framework upgrade silently changing these
  query shapes** — the relation's built-in `latest()`, the `unread` scope's `whereNull`, `markAsRead()`'s
  null guard, the collection class binding. That is a *test* deliverable, and it is exactly what this
  story ships.

**Reversible, in one direction only:** if story 0057 (or a later consumer — a REST endpoint, a
scheduled digest) turns out to need a genuine rule — a per-type filter, a permission branch, a
retention policy — that is the moment `app/Actions/Notifications/` earns its keep. Creating it *now*,
before that rule exists, is the mistake.

**D-3 — Mark **all** as read on dropdown open, not per notification.** `backend-expert`'s
recommendation, adopted. It matches the PRD's wording exactly — *"When they open and read their
notifications / Then the unread indicator is cleared"*, plural, with the trigger being **opening** —
and it is the simplest mechanism that satisfies both bell-state scenarios. Per-notification read
tracking has **no cited PRD need**: no scenario, no acceptance criterion and no prototype affordance
asks for a partially-read state. The cost is recorded honestly as **R-4**. **Cheaply reversible**: the
stored data already supports per-row read state (`read_at` is per row, and `DatabaseNotification`
ships `markAsRead()` per instance), so a later change moves the *trigger* without touching the schema
or the payload.

**D-4 — The recent list is capped at 15, `latest()`-ordered.** `backend-expert` recommended a cap in
the 10–20 range on the grounds that an unbounded `$user->notifications` is a real cost as read history
accumulates with **no pruning story anywhere in this epic** (**R-2**). 15 is the concrete number: the
middle of that range, comfortably more than a dropdown shows at once, and small enough that the query
stays trivially index-served. Nothing about it is load-bearing beyond being **fixed and test-pinned** —
the ordering-and-cap test seeds 17 rows so the number cannot drift silently. If 0057's design wants a
different figure, changing it is a one-line change plus a one-number test change, made deliberately
rather than by accident.

**D-5 — The mechanism never reads or branches on `notifications.type`, and this is the property that
makes it cross-cutting rather than Epic 3's.** No whitelist, no `type` → label map, no per-type
grouping, no per-type ability check. Two consequences, both intended: the two event producers that do
not exist yet (Epic 2's low/zero stock, Epic 4's blog post published) need **zero change here** when
they arrive; and the notification's own FQCN — which Laravel's `DatabaseChannel` writes into
`notifications.type` — stays purely informational at this layer, free to change on a class rename
without a viewing-side migration. This is an acceptance criterion, pinned by the mixed-type test, and
**R-3** names the plausible future feature that would break it.

**D-6 — No permission gate; `auth` is the entire security boundary.** Every query is scoped to
`Auth::user()`'s own morph key, so the actor can only ever reach their own rows — there is no target
selection, no id parameter and no filter reaching a query from the client. That makes this
structurally analogous to `settings/profile`, which is `auth`-only for the same reason: a user
operating on nothing but themselves needs no ability. **This story therefore adds no permission to the
seeded catalog, no `can:` middleware and no policy.** Note the deliberate contrast with the module
screens: those gate because they disclose *other* records. Consequence a reviewer should hold: a "bell
permission" would be the wrong shape here even if someone wanted per-user control over the feature —
that would be a *preference*, not an authorization rule, and preferences are explicitly out of scope.

## Resolved in the debate

- **The story ships no production class**, and the Files section says so explicitly so the outcome
  reads as a decision (**D-2**) rather than as an empty story. `backend-expert` raised this as a real
  question rather than assuming either answer.
- **`Notifiable` already provides everything** — `notifications()` (already `latest()`-ordered),
  `unreadNotifications()` / `readNotifications()`, per-row `markAsRead()` / `markAsUnread()`, and bulk
  `DatabaseNotificationCollection::markAsRead()` — verified against the installed vendor source rather
  than recalled. **No new index is needed**: 0043's `uuidMorphs()` composite
  `(notifiable_type, notifiable_id)` is exactly the access path every query filters on.
- **The method-vs-property distinction is part of the contract, not stylistic.** `unreadNotifications()`
  for the count (one `COUNT` query), `unreadNotifications` for the mark-all (the collection carries the
  method), and a re-read after mark-all must go through the method or it reads a stale cached relation.
- **`backend-qa`'s raised disagreement is resolved as D-1**: a notification stays visible after
  permission revocation, on immutable-snapshot grounds consistent with the whole epic, with the
  residual named and its dependency on the payloads' PII-minimalism stated.
- **Mark-all-on-open (D-3) and a 15-item cap (D-4)** adopted as specified, each with its reversal cost
  recorded.
- **Cross-user scoping is the highest-risk property**, and its test must be built from **one real
  fan-out dispatch** producing two recipients' rows — not two unrelated fixtures, which can pass
  vacuously (**R-1**). A second assertion on the *count* guards the query the list test cannot see.
- **The soft-deleted-recipient case is dropped as moot**, with the reason recorded, rather than left
  silently untested.
- **Global search is excluded and stated as still-unowned** (**OQ-1**) rather than allowed to look
  closed because its sibling feature shipped.
- **This story is cross-cutting, filed in Epic 3 by human decision** — stated at the top of the file so
  a reviewer does not read it as Customers/Orders functionality.

## Provenance

- **PRD source:** [§ Cross-cutting: global search & notifications](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications) — specifically the two bell-**state** scenarios ("The bell shows an unread indicator", "Reading notifications clears the unread indicator") and the acceptance criterion *"The bell displays an unread indicator and clears it once notifications are read."* The section's `Scenario Outline: A confirmed event generates a notification` is **not** this story's — it belongs to the four event producers ([0043](0043-customers-new-customer-notification-backend.md), [0046](0046-orders-new-order-notification-backend.md), and Epic 2's and Epic 4's unbuilt ones) — and the whole `Feature: Global panel search` is excluded (**OQ-1**).
- **Backlog origin:** [0043's OQ-3](0043-customers-new-customer-notification-backend.md#open-questions), option (a) — "add a cross-cutting notifications bell story to the backlog, sequenced after the event producers". This file is that story's backend half; **0057** is its UI half. 0046 deliberately did not reopen the gap, and this file closes it once for all four producers rather than once per producer.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from `backend-expert` (the finding that `Notifiable` provides every operation for free, the no-new-class recommendation, the no-permission-gate reasoning, the mark-all trigger and the cap range) and `backend-qa` (the mixed-type and two-path zero-count cases, cross-user scoping named as the highest risk with the one-dispatch construction rule, the count-level belt-and-braces assertion, the ordering/cap case, the soft-deleted case raised and withdrawn, and the permission-revocation disagreement escalated rather than assumed), composed by `product-owner` as facilitator. **No `database-expert`**: this story adds no schema (see the Type section).
- **Gherkin conventions:** every scenario opens with a named business-role actor ("a signed-in administrator", "a customer administrator") and carries exactly one `When`, per [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 — mandatory across all Gherkin in this project, per the incident recorded in [errors-log.md](../../docs/errors-log.md).
- **Verified against the working tree by `product-owner` rather than relayed:** `App\Models\User` carries `use Notifiable;` and `use SoftDeletes;`; no `notifications` migration exists in `database/migrations/` yet (0043's, still `new`); `resources/views/`, `app/Livewire/` and `config/modules.php` contain no bell, dropdown, unread indicator or notification route of any kind; and every vendor method quoted above was read from the installed `laravel/framework` source (`Notifiable` → `HasDatabaseNotifications` + `RoutesNotifications`; `notifications()` returns `morphMany(...)->latest()`; `scopeUnread` is `whereNull('read_at')`; `DatabaseNotification::markAsRead()` guards on `is_null($this->read_at)`; `DatabaseNotificationCollection::markAsRead()` is `$this->each->markAsRead()`).
- **Stage:** `new`. It moves to `ai-spec/tasks/in-progress/` at the start of Phase 3, and to `ai-spec/tasks/done/` at Phase 7 — both moves change this file's directory depth, so every relative link above must be re-resolved on each move (both directions), per [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
