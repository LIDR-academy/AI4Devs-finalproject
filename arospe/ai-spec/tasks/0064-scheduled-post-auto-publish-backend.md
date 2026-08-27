# [0064] Scheduled post auto-publish — backend (the app's first scheduled command)

## Description
A scheduled Artisan command sweeps for blog posts whose status is `BlogPostStatus::Scheduled` and
whose `published_at` has arrived, and transitions each one to `Published`. That transition is the
moment the *"a scheduled post goes live"* half of the
[PRD](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications)'s confirmed notification list
becomes observable, so this story also defines the single trigger story **0065** consumes.

It is **backend only, and narrower than it looks**: no screen, no route, no migration, no column, no
model change and no notification class. Story [0061](0061-blog-posts-core-crud-backend.md) ships the
`published_at` column, the `Scheduled` status, the validation rule that guarantees a scheduled date is
in the future, and the composite index built specifically for this sweep. This story ships **an
Artisan command, a domain action, one schedule entry, and the event that says a post went live.**

**This is the first scheduled command in this application** — there is no `app/Console/`, no
`routes/console.php` and no `Schedule::` call anywhere in the tree (**V-1**). That makes the story
disproportionately convention-setting for its size: three of its decisions (where a schedule entry
lives, how a system-triggered write authorizes, how a scheduled command is tested) are the project's
first, and every later scheduled job inherits them.

Covers the automatic half of [PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's Blog post status
(`Programado`) and the *"or a scheduled post goes live"* clause of the cross-cutting notification
list. **The full-auto-publish behaviour is a human product decision, confirmed before this batch was
decomposed** — see [D-0](#d-0--full-auto-publish-is-a-confirmed-product-decision-not-an-inference).

## Type
backend | includes database-expert: **yes**

`database-expert` was convened despite this story adding **no schema**, for one specific and
answerable question: whether the sweep's `WHERE deleted_at IS NULL AND status = ? AND published_at
<= ?` actually uses 0061's `(deleted_at, status, published_at)` composite index, or whether the
trailing `<=` **range** predicate breaks it — the boundary-operator question this repo's own
[schema.md](../../docs/database/schema.md) index-reasoning sections make a habit of asking. It does
use it, and the range is in the one position where it costs nothing (**D-6**). That amigo also
resolved the story's sharpest technical conflict (**D-7**) and found a latent data-integrity gap
nobody else did (**R-6**).

## Three Amigos participants

`product-owner` (lead/facilitator) + `backend-expert` (files and approach) + `database-expert`
(query shape, index validation, concurrency) + `backend-qa` (test design). All three were convened as
subagents and all three contributions are reflected below, including **one substantive conflict
between two amigos that the facilitator resolved rather than left implicit** (**D-7**), **one
recorded dissent** (**D-7**), and **two facilitator findings that changed the document rather than
merely supporting it** — one of which overturns the premise the story was briefed on. See
[Provenance](#provenance).

## Gherkin

Every scenario carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rule 3. Rule 1 — *open with
a named business-role actor, never `I`* — needed a ruling here, because **the actor for an automated
sweep is not a person**. The convention this story establishes, and the reasoning, is **D-14**: the
`Given` names the **blog editor** whose earlier decision created the state, and the `When` names
**the publication scheduler** as the acting subject. No scenario opens with `I`, and no scenario
attributes the automatic transition to a human who did not perform it.

```gherkin
Feature: Scheduled posts go live automatically

  Scenario: A scheduled post goes live once its publication time arrives
    Given a post scheduled by a blog editor for a time that has now arrived
    When the publication scheduler runs
    Then the post is published
    And it appears in the blog list with its published status

  Scenario: A scheduled post keeps the publication date its editor chose
    Given a post scheduled by a blog editor for a time that has now arrived
    When the publication scheduler runs
    Then the post's publication date is still the one the editor chose

  Scenario: A post scheduled for later is left alone
    Given a post scheduled by a blog editor for a time still in the future
    When the publication scheduler runs
    Then the post is still scheduled
    And it does not appear as published

  Scenario: Several due posts all go live in the same run
    Given three posts scheduled by a blog editor for times that have now arrived
    When the publication scheduler runs
    Then all three posts are published

  Scenario: A draft is never published by the scheduler
    Given a draft post that a blog editor has not scheduled
    When the publication scheduler runs
    Then the post is still a draft

  Scenario: An already-published post is not published a second time
    Given a post a blog editor published earlier
    When the publication scheduler runs
    Then no further publication is announced for that post

  Scenario: A deleted scheduled post never goes live
    Given a scheduled post that a blog editor deleted before its publication time arrived
    When the publication scheduler runs
    Then the post is not published
    And it remains deleted

  Scenario: A run with nothing due changes nothing
    Given no post is due for publication
    When the publication scheduler runs
    Then no post changes
    And the run completes without error

  Scenario: A post that goes live announces itself once
    Given a post scheduled by a blog editor for a time that has now arrived
    When the publication scheduler runs
    Then exactly one publication announcement is raised for that post

  Scenario: A second run announces nothing further
    Given a post the publication scheduler has already published
    When the publication scheduler runs again
    Then no publication announcement is raised

  Scenario: Restoring a published post announces nothing
    Given a blog editor, with a deleted post that was published before it was deleted
    When they restore that post
    Then no publication announcement is raised
```

## Files to create/modify

### The console entry point

| Path | What & why |
| --- | --- |
| `routes/console.php` | **New — and it resolves a dangling reference that already exists.** [`bootstrap/app.php`](../../bootstrap/app.php) already passes `commands: __DIR__.'/../routes/console.php'` to `withRouting()` for a file that has never existed (**V-2**). Creating it is sufficient; **`bootstrap/app.php` needs no edit at all**. Holds exactly one `Schedule::command(...)` entry (**D-2**). |
| `app/Console/Commands/PublishScheduledBlogPosts.php` | **New.** The scheduled command. `app/Console/Commands/` is a **stock Laravel location already named in [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)**'s directory listing (`Console/Commands/    Artisan commands`), so it needs no new-base-folder approval — the same category as `app/Enums/` or `app/Listeners/`. It is empty-and-untracked on disk today (git does not track empty directories), which is why it is absent from this worktree. |

```php
// routes/console.php — the whole file
use App\Console\Commands\PublishScheduledBlogPosts;
use Illuminate\Support\Facades\Schedule;

Schedule::command(PublishScheduledBlogPosts::class)
    ->everyMinute()                 // D-3
    ->withoutOverlapping(5);        // D-8 — 5 minutes, never the 1440-minute default
```

> ✅ **Verified against the installed framework source rather than reasoned** (`laravel/framework
> v13.19.0`, read from the sibling checkout's `vendor/`, since this worktree has none — **V-6**).
> Three mechanics this story depends on, each of which a reader would otherwise have to trust:
> `Application::configure()` calls `->withCommands()` with **no arguments**
> (`Foundation/Application.php:244`), which is what registers `app/Console/Commands` for
> auto-discovery (`Configuration/ApplicationBuilder.php:337` — the *only* construction of that path
> string in the entire framework); `withRouting(commands: …)` guards on `realpath($commands) !==
> false` (`ApplicationBuilder.php:179`), which is why the missing file is silently skipped today
> rather than fatal; and `Kernel::discoverCommands()` additionally guards each route path with
> `file_exists()` (`Foundation/Console/Kernel.php:521`). **The command class is therefore
> auto-registered by virtue of its location, and `routes/console.php` is loaded the moment it
> exists.** See **R-7** for the one thing this does *not* mean.

### Action — `app/Actions/Blog/`

| Path | What & why |
| --- | --- |
| `app/Actions/Blog/PublishScheduledBlogPost.php` | **New.** `__invoke(string $blogPostId): ?BlogPost` — **one post, not the batch** (**D-4**). Performs the conditional write (**D-7**), returns the transitioned post or `null` when the row was no longer eligible, and dispatches the publication event on success (**D-12**). **Deliberately performs no `Gate::authorize()` and reads no actor** (**D-5**) — the one action in `app/Actions/Blog/` that does not self-authorize, with the reason in its own docblock. |

### Event — `app/Events/`

| Path | What & why |
| --- | --- |
| `app/Events/Blog/ScheduledBlogPostPublished.php` | **New**, and **this creates `app/Events/`, a folder that does not exist in this repo today** (**V-3**) — a structural addition to [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)'s directory listing, not a line edit. Carries the **`BlogPost` model**, not its id — settled by story [0065](0065-blog-post-published-notification-backend.md)'s **D-9**, which resolves this story's OQ-2. Dispatched once per successfully-transitioned post. **This story defines and dispatches it; story 0065 defines the listener and the notification** (**D-12**, **OQ-1**). |

### Consumed, not created by this story

- `App\Models\BlogPost`, `App\Enums\BlogPostStatus`, `blog_posts.published_at` and the
  `(deleted_at, status, published_at)` index — all story [0061](0061-blog-posts-core-crud-backend.md).
  **Consumed unchanged; this story modifies none of them.**
- `App\Models\BlogPost`'s `SoftDeletingScope` — consumed by *doing nothing*, which is the whole point
  of **D-9**.

### Explicitly **not** touched

`database/migrations/**` (**no migration** — but see **R-1**, which is the one thing that could
change this) · `app/Models/**` · `app/Enums/**` · `app/Policies/**` (**no** `BlogPostPolicy` change,
and no new ability — **D-5**) · `database/seeders/RolePermissionSeeder.php` (**no new permission** —
this story adds no actor-gated operation, so there is nothing to grant) · `routes/web.php` and every
area route file · `config/modules.php` · `app/Livewire/**` · `resources/views/**` ·
`tests/Browser/**` · `app/Notifications/**` (**0065**) · `app/Actions/Blog/UpdateBlogPost.php`
(**D-5** — the sweep deliberately does not route through it, and does not weaken it either) ·
`bootstrap/app.php` (**verified unnecessary** — the `commands:` argument is already present).

## Tests to perform

Backend only — no browser tests, since this story ships no screen.

> **Read this before writing any test in this story.** Two disciplines carry over from
> [0061](0061-blog-posts-core-crud-backend.md) and one is new.
> **(a) Every case in this story freezes the clock** with `Carbon::setTestNow()` — a sweep is a
> time-dependent operation by definition, and [mocking-and-fakes.md](../../docs/testing/backend/mocking-and-fakes.md)
> already names an unfrozen `now()` comparison as non-deterministic by construction.
> **(b) The boundary is asserted from both sides**, per the discipline
> [step-up-authentication.md](../../docs/security/step-up-authentication.md) established for telling
> `>` from `>=`.
> **(c) New here — the inverse of 0061's authorization warning.** 0061's test list warns that its
> actions authorize before they validate, so a test without `actingAs()` fails for the wrong reason.
> **This story's action is the exact opposite**: it must succeed with **no authenticated user at
> all**, and a test that calls `actingAs()` out of habit would pass while proving nothing about the
> property that matters most (**D-5**).

**Feature — `tests/Feature/Blog/PublishScheduledBlogPostTest.php`** (new) — the action

*Core behaviour*
- [ ] A `Scheduled` post whose `published_at` has passed is flipped to `Published`.
- [ ] **`published_at` is unchanged by the flip** — the editor's chosen instant survives verbatim, and
      is **not** restamped to `now()` (**D-11**). *Risk if missing:* 0061's D-6 says a *manual*
      `Published` save with no date stamps `now()`, and a sweep written by analogy with that rule
      would overwrite every scheduled post's intended date with the sweep's tick time — silently, and
      visibly wrong only in 0063's date column.
- [ ] **Only `status` and `updated_at` change.** Assert `title`, `slug`, `body` and
      `blog_category_id` are byte-identical before and after. *Risk if missing:* a sweep built by
      copy-adapting `UpdateBlogPost` re-runs a whole validate-and-save path and touches columns it has
      no business touching.
- [ ] **The post's tags are unchanged** — assert the `blog_post_tag` rows directly, not via
      `$post->tags()`. *Risk if missing:* `UpdateBlogPost` also calls `SyncBlogPostTags` (0061's
      **D-15**), so the same copy-adaptation silently detaches every tag on every scheduled publish.
- [ ] **The action succeeds with no authenticated actor** — no `actingAs()` anywhere in the test, and
      `Auth::check()` asserted `false` at the point of call. *Risk if missing:* this is the single
      executable proof of **D-5**, and the one test that catches a reflexive
      `Gate::authorize('update', …)` being added later. A code review can miss it; this cannot.
- [ ] The action **returns the transitioned post**, and returns **`null`** when the row was not
      eligible — the contract 0065 and the command both read (**D-12**).

*Negative — what the sweep must not touch*
- [ ] A `Scheduled` post whose `published_at` is in the future is untouched.
- [ ] An already-`Published` post is not re-processed, and its `updated_at` is unchanged.
- [ ] **A `Draft` is never published, even seeded with a past `published_at`.** Note this state
      *cannot* legitimately exist — 0061's **D-6** nulls `published_at` on every `Draft` save — so seed
      it with a raw `DB::table()->insert()` / `forceFill()` rather than through the action. *Risk if
      missing:* a query written as `where('published_at', '<=', now())` **without** the
      `status = Scheduled` predicate sweeps every row with a past date, and the only rows that expose
      it are ones the happy path never creates.
- [ ] **A soft-deleted `Scheduled` post whose date has passed is NOT swept** (**D-9**). Assert through
      `BlogPost::withTrashed()->find($id)` — a default query cannot see the row, so a naive
      `assertDatabaseMissing`-style assertion passes for entirely the wrong reason. *Risk if missing:*
      **this is the sharpest correctness risk in the story.** It costs nothing to get right (the
      default `SoftDeletingScope` already protects the sweep) and is broken by a single reflexive
      `withTrashed()`, after which a deleted post goes live with no error and no trace — on a screen
      that, by construction, does not display it.

*The boundary, from both sides*
- [ ] `published_at` **exactly equal to** the frozen `now()` → **swept**. Pins the sweep's operator as
      `<=`, not `<` (**D-10**).
- [ ] `published_at` one second **after** the frozen `now()` → not swept. The adjacent control, without
      which `<=` cannot be told from `<`.
- [ ] `published_at` one second **before** the frozen `now()` → swept. The mirror control.
- [ ] **The no-gap proof, as its own named test.** Freeze the clock at `T`. Create a `Scheduled` post
      with `published_at = T + 1s` — the *earliest* value 0061's `after:now` rule will accept at that
      instant. Advance the clock to `T + 1s` and run the sweep. Assert it **is** published. *Risk if
      missing:* this is the only test that proves the two stories' boundaries interlock. 0061 refuses
      to schedule at exactly `now()` (strictly `>`); this story publishes at exactly `now()`
      (`<=`). If the sweep's operator were `<`, there would be an instant a post can be scheduled for
      but not published at — and the failure surfaces one tick late, in production, months after both
      stories closed. See **D-10**.

*Idempotency*
- [ ] Calling the action **twice in succession** against the same post publishes it once; the second
      call returns `null`, writes nothing, and leaves `updated_at` unchanged. *Risk if missing:* a
      guard that returns early and a guard that rewrites the same value are indistinguishable on
      `status` alone — `updated_at` is what separates them.
- [ ] Running the whole sweep twice reports N transitioned on the first pass and **0** on the second.

**Feature — `tests/Feature/Blog/ScheduledBlogPostPublishedEventTest.php`** (new) — the 0065 contract

Split into its own file deliberately: it is the **cross-story contract**, and a reader arriving from
0065 should find it without reading the sweep's own behavioural cases. Same reasoning 0061 used to
split `BlogPostStatusAndPublicationDateTest.php` out.

- [ ] A successful transition dispatches `ScheduledBlogPostPublished` **exactly once**, carrying that
      post (`Event::fake()` + `assertDispatched`).
- [ ] **Three due posts in one run dispatch three separate events, not one aggregate event** — 0065's
      listener acts per post. *Risk if missing:* a batch-shaped dispatch is invisible to a
      single-post test and forces 0065 to redesign around it.
- [ ] **Nothing is dispatched for anything the sweep does not touch** — `assertNotDispatched` for the
      future-dated, already-`Published`, `Draft` and soft-deleted cases. *Risk if missing:* an
      implementation that dispatches unconditionally and relies on 0065's listener to filter is a
      different, worse design that passes every status-only assertion.
- [ ] **A second sweep run dispatches nothing.** The idempotency property that actually matters to a
      subscriber — a duplicate row write is invisible, a duplicate notification is not.
- [ ] **Restoring a previously-published post dispatches nothing** (0061's **D-20** `RestoreBlogPost`).
      *Risk if missing:* this is the constraint 0061's hand-off names by number, and it is the reason
      **D-12** rules out an Eloquent `saved`/`restored` observer — a restore leaves `status` at
      `Published` and fires `restored`, so an observer keyed on either would re-announce a post
      subscribers already heard about.
- [ ] **A failed write dispatches nothing** — force the write to fail and assert both that the post is
      still `Scheduled` and that no event was dispatched. *Risk if missing:* the ordering of the write
      and the dispatch is exactly the kind of thing a later refactor reverses, and only this test
      notices.

**Feature — `tests/Feature/Console/Commands/PublishScheduledBlogPostsTest.php`** (new) — the command

Thin by design. Its job is proving the console entry point delegates correctly — **not** re-testing
the behaviour above through a second door.

- [ ] `$this->artisan('blog:publish-scheduled-posts')->assertExitCode(0)` on a clean run.
- [ ] The command really flips a due post — **one** integration assertion proving it delegates to the
      action rather than carrying parallel logic of its own.
- [ ] The command reports a count, and reports the empty case distinctly. Keep this assertion loose
      unless Phase 2 pins the copy (**OQ-3**).
- [ ] **A failure on one post does not abort the run**: seed two due posts, force the first to fail,
      assert the second is still published and the exit code is still 0. *Risk if missing:* this is
      the whole justification for **D-4**'s per-post action, and without it a single bad row silently
      blocks every scheduled post behind it, indefinitely, on every subsequent tick.

**Feature — `tests/Feature/Console/ScheduleRegistrationTest.php`** (new) — the schedule entry itself

> **This test is recommended, and its falsifiability was checked rather than assumed** — the standard
> this repo's [vacuous-`arch()`-rule entry](../../docs/errors-log.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18)
> demands of any assertion that passes by default. ✅ **Verified against `laravel/framework v13.19.0`:**
> `Schedule::events()` returns `Event[]` (`Support/Facades/Schedule.php:16`), `Event::$command` is
> **public** (`Console/Scheduling/Event.php:34`), `Event::getExpression()` is **public**
> (`Event.php:847`), and `Event::$withoutOverlapping` is a **public** bool defaulting to `false`
> (`Console/Scheduling/ManagesAttributes.php:63`). All four are readable from a test, so each
> assertion below can genuinely go red.

- [ ] The command **is registered** on the schedule, and its cron expression is the intended one —
      assert `getExpression()` equals the literal string, never re-derive it from the same helper that
      set it. *Risk if missing:* a `routes/console.php` that is never loaded, or an entry deleted in a
      refactor, produces a scheduler that silently does nothing — the single worst failure mode of
      this feature, and one with no error anywhere.
- [ ] **`withoutOverlapping()` is applied** — assert the public flag is `true`. A configuration-shape
      check, explicitly **not** a concurrency test (**D-8**, and see the note below).
- [ ] **Prove it can fail before trusting it:** comment out the `Schedule::command(...)` line, confirm
      both assertions go red, revert. Record that this was done — the same regression-proof discipline
      [testing/frontend/README.md](../../docs/testing/frontend/README.md) already requires of browser
      tests, applied to the assertion type this repo has most often shipped vacuous.

**Explicitly not tested**
- **Real concurrent overlap.** `withoutOverlapping()`'s mutex is consulted only by `schedule:run`'s own
  dispatch — never by `Artisan::call()` and never by a direct action call — and this suite is a
  single synchronous process. A test would either exercise the framework's own mutex (vendor, per
  [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)) or simulate parallelism this
  runner cannot produce. **Stated plainly as untestable rather than covered by a test that cannot
  fail**, which is the same call story 0052 made for its own row-lock risk. It is a code-review item,
  and `phpunit.xml` pinning `CACHE_STORE=array` (**V-5**) means even the mutex's own store differs
  from production's `database` — so an in-suite test would not exercise the real mechanism either.
- **The Laravel scheduler itself** (`schedule:run`, cron parsing, `Mutex`) — vendor.
- **Carbon's comparison operators** — framework.
- **`SoftDeletes`' own mechanics** — 0061's `BlogPostTest.php` owns them. This story proves only that
  its *own query* respects the default scope.
- **`UpdateBlogPost`'s validation, sanitization or tag sync** — 0061 owns all of it.
- **Whatever 0065 does with the event** — 0065 owns the listener, the notification, the recipients and
  any receiving-end deduplication. This story asserts the event's *dispatch*, never its consequences.
  Writing a `Notification::fake()` assertion here would be asserting a contract nothing has been built
  to fulfil yet.
- **The composite index's query plan.** A functional test cannot distinguish a correct result reached
  by an index seek from one reached by a table scan. `EXPLAIN` is a Phase 3 verification step
  (**D-6**), not a Pest assertion.

## Expected outcome

`php artisan blog:publish-scheduled-posts` — and the every-minute schedule entry that runs it — finds
every non-trashed post whose status is `Scheduled` and whose `published_at` has arrived, and
transitions each to `Published` without altering the publication date its editor chose, its title,
body, category or tags. Each transitioned post raises exactly one `ScheduledBlogPostPublished` event,
which story 0065 turns into a notification. Running the sweep twice, or running it while an
administrator publishes the same post by hand, publishes each post once and announces it once. A
deleted scheduled post never goes live. A post scheduled for the future is untouched.

The application gains its first `routes/console.php`, its first `app/Console/Commands/` class, its
first `app/Events/` folder, and its first documented answer to *"how does a write with no human actor
authorize itself?"*

Nothing is user-visible: the status a reader sees in 0063's list simply becomes correct on its own,
and the notification that announces it is story 0065.

## Acceptance criteria
- [ ] `routes/console.php` exists and carries exactly one `Schedule::command(...)` entry;
      **`bootstrap/app.php` is unchanged**.
- [ ] `App\Console\Commands\PublishScheduledBlogPosts` exists, is discoverable via `php artisan list`,
      and exits 0 on both a productive and an empty run.
- [ ] The command is scheduled at the agreed frequency with `withoutOverlapping()` applied, and both
      facts are pinned by a test that was **proven able to fail**.
- [ ] `App\Actions\Blog\PublishScheduledBlogPost::__invoke(string $blogPostId): ?BlogPost` transitions
      exactly one eligible post and returns it, or returns `null` when the row is no longer eligible.
- [ ] **The action contains no `Gate::authorize()`, no `Auth::user()`/`Auth::id()`/`request()` read
      and no policy call**, it succeeds with no authenticated user, and the exemption is recorded in
      the class's own docblock — not only in this file (**D-5**).
- [ ] **No permission, policy, ability or `RolePermissionSeeder` entry is added.**
- [ ] The sweep query is `status = Scheduled` **and** `published_at <= now()`, **without**
      `withTrashed()`, so a soft-deleted scheduled post is never published (**D-9**).
- [ ] **The boundary is `<=`**: a post whose `published_at` equals the current instant is published,
      and the no-gap property against 0061's `after:now` rule is pinned by its own test (**D-10**).
- [ ] **`published_at` is never rewritten by the sweep** (**D-11**), and no column other than `status`
      and `updated_at` is written.
- [ ] The write is race-safe **by construction**: re-running the sweep, or racing a manual publish,
      transitions and announces each post exactly once (**D-7**).
- [ ] `App\Events\Blog\ScheduledBlogPostPublished` is dispatched **once per transitioned post**, never
      for an untouched post, never on a restore, and never when the write fails (**D-12**).
- [ ] **No notification, mailable, listener or `app/Notifications/**` class is added** — 0065 owns all
      of them.
- [ ] **No migration, column, index, model, enum, route, Livewire component, Blade view or
      `config/modules.php` entry is added** — subject to **R-1**, which is the one condition that
      could legitimately change this and must be resolved explicitly rather than silently.
- [ ] One post failing does not prevent the rest of the batch from publishing, and does not fail the
      run.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] All **three** quality gates run **unscoped**, with each result recorded explicitly *including any
      that was not run*: `php artisan test` (not `--filter`), `vendor/bin/pint --format agent` (not
      `--dirty`), and **Larastan level 7** (`vendor/bin/phpstan analyse`). The third is the one nothing
      else prompts you to run, and a record naming two of three is a record of two gates — see
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26).
      **Note `phpstan.neon` analyses `routes/`**, so this story's new route file is in scope.
- [ ] **The index is verified to exist with `php artisan db:table blog_posts` after 0061 has
      migrated** — not by re-reading 0061's task file (**R-1**). If it is absent, **R-1**'s explicit
      exception process is followed rather than a silent scope violation.
- [ ] **`EXPLAIN` run once against the real sweep query** and the access type recorded, confirming
      **D-6**'s leftmost-prefix analysis against a real plan rather than a reasoned one.
- [ ] The schedule-registration test was **proven able to fail** by temporarily removing the entry,
      and that verification is recorded.
- [ ] Code reviewed (code-reviewer). **Point the review at D-5 and D-7 specifically**: that the
      absence of a `Gate` call is the documented exemption and not an omission, and that nobody has
      "fixed in" a `lockForUpdate()` or a `withTrashed()` by reflex.
- [ ] No security findings (appsec-auditor). **Point the audit at D-5**: an ungated write is exactly
      the shape that deserves an audit, and the question to answer is whether the entry point really is
      restricted to a process that already has full database access (**D-5**'s third property).
- [ ] Documentation updated (docs-keeper):
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md)'s directory listing
    gains **`app/Events/`** (a structural addition — the folder does not exist today) and a
    non-empty `app/Console/Commands/`; its `routes/` paragraph gains `console.php`, which is **not**
    an area file and so is a genuine exception to the one-file-per-area convention rather than an
    instance of it.
  - [`architecture/authorization.md`](../../docs/architecture/authorization.md) — **the reusable fact,
    and the reason this story matters beyond the blog:** a system-triggered write may be ungated, what
    makes that safe, and the docblock requirement that distinguishes "exempt" from "forgotten". This
    is the page that owns [Recording a refusal](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail);
    an *absence* of a gate deserves the same treatment. **Coordinate with story 0052**, which
    specifies the identical documentation obligation (**D-5**) — whichever lands first writes the
    section and the other extends it, exactly as **OQ-4** of 0061 handles the sanitizer.
  - [`architecture/overview.md`](../../docs/architecture/overview.md) — its "Where things live" table
    gains `app/Events/**` and `app/Console/Commands/**`. **Whether the request-lifecycle diagram
    changes is a judgement call against the real diagram, not a foregone conclusion**: this story adds
    an entry point that is not a request at all, which is arguably a *second* diagram rather than a
    node on the existing one. Task 0015b deliberately left the diagram alone for a side effect of an
    existing node; task 0015a added a node for a genuinely new step.
  - [`api/routes.md`](../../docs/api/routes.md) — a note that `routes/console.php` exists and is
    **not** a contract surface, so a reader running `php artisan route:list` and finding nothing new
    is not looking at a gap.
  - [`testing/backend/`](../../docs/testing/backend/) — **the project's first guidance on testing a
    scheduled command** (**V-4**): the action-vs-command split, the falsifiable schedule-registration
    assertion, and the plainly-stated fact that real overlap is not testable here.
- [ ] **Hand-off recorded for story 0065** (published-post notification), stated as the five facts it
      needs and nothing more:
      1. The automatic transition happens in exactly one place —
         `App\Actions\Blog\PublishScheduledBlogPost::__invoke()`. There is no second automatic path.
      2. It dispatches `App\Events\Blog\ScheduledBlogPostPublished` once per transitioned post,
         **after** the write succeeds and never when it fails.
      3. **0065 adds a listener; it does not add a dispatch.** The automatic side is already wired.
      4. **There are *three* triggers, not two, and this story closes exactly one of them.** Both
         upstream hand-offs — 0061's **D-19** (*"two triggers, not one"*) and this story's own earlier
         wording — undercounted, and story **0065**'s Phase 1 found the third: `CreateBlogPost` accepts
         `BlogPostStatus $status`, so a post can be **created already `Published`** on its first save,
         never passing through `UpdateBlogPost` and never being touched by this sweep. The three:
         - **Automatic (this story)** — the scheduled sweep. **Closed here**; 0065 adds only a listener.
         - **Manual update** — a `Draft`→`Published` save through `UpdateBlogPost`. 0061's **D-19**
           deliberately fires nothing there, so 0065 owns it.
         - **Create-as-`Published`** — 0065's **OQ-1**, recommended for coverage but **still open** at
           the time of writing (its `CreateBlogPost` dispatch site is headed *"Conditional — only if
           OQ-1 is confirmed"*). **Entirely 0061's and 0065's concern**: it touches neither this
           story's sweep nor its dispatched event, and 0064 changes nothing either way.
      5. **A restore must not re-announce.** This story's event is keyed to the transition itself, so
         the automatic side is safe by construction — but 0065's *manual*-side hook must not be an
         Eloquent `saved`/`restored` observer, or restoring a previously-published post re-announces it
         (0061's **D-20** makes this reachable, not hypothetical).
- [ ] Acceptance criteria met.

## Documented functional decisions

### D-0 — Full auto-publish is a confirmed product decision, not an inference

Recorded first because everything else rests on it. The PRD's Epic 4 Gherkin never says *how* a
`Programado` post goes live; only the cross-cutting notification list mentions *"a scheduled post
going live"* as an event. **Before this Epic 4 batch was decomposed the product owner was asked
directly and chose full auto-publish**: a scheduled command transitions the post and the notification
fires at that moment. The two alternatives — a manual-only flow where `Programado` is a reminder an
administrator acts on, and a purely informational date with no automation at all — were both
explicitly rejected.

Stated as a decision rather than left implicit because a reader checking this story against the PRD
will not find the behaviour spelled out there, and would otherwise reasonably read this whole story
as invented scope.

### D-1 — Domain artifacts and one console entry point; no UI, no notification

0063 already ships the editor's "Scheduled" status select and its conditional publish-date field, so
this story is a pure backend consumer of a value an editor can already set. 0065 owns the
notification. This story is the transition and its announcement, nothing else — following 0061's
**D-1**, 0058's **D-1** and 0024's **D-1**.

### D-2 — The schedule entry lives in `routes/console.php`, not `bootstrap/app.php`'s `withSchedule()`

Both are supported in Laravel 13. `routes/console.php` wins for a concrete, verified reason rather
than a stylistic one: **`bootstrap/app.php` already names that exact file** and has since the
skeleton was generated (`commands: __DIR__.'/../routes/console.php'`). Creating it is the minimal
change that makes an existing, dangling wire live; adding `->withSchedule()` as well would register
the same kind of thing through a second mechanism for no benefit.

It also preserves a real repo convention: `bootstrap/app.php` is touched by **no** module story in
this project — the whole per-area routing convention is built on `web.php` gaining one `require` line
(see [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)). Putting
scheduling logic in `bootstrap/app.php` would break that for the first time, for nothing.

⚠️ **`routes/console.php` is not an area file and must not be read as one.** Every other file in
`routes/` is a web-route area file required from `web.php`; this one is loaded by the console kernel
and registers no HTTP route. A reader applying the one-file-per-area rule to it will look for a
`console` module that does not exist.

### D-3 — Every minute, and the tradeoff stated honestly

`->everyMinute()`. The feature's entire promise is *"a post goes live at the time its editor chose"*,
and a coarser interval delays that promise by up to the interval — a five-minute schedule means a post
scheduled for 09:00 can appear at 09:04, which is visible to the editor and, via 0065, to every
notification subscriber.

**The cost is genuinely negligible here, and this is the part worth being precise about rather than
hand-waving.** The PRD frames this product as a backoffice admin panel, not a high-traffic public
site; `blog_posts` is an admin catalog in the 10²–10³ range for a long time. The sweep is a
three-predicate seek against the composite index 0061 built for it (**D-6**), and on the
overwhelming majority of ticks it matches **zero rows** and returns without writing anything.

*Rejected:* `everyFiveMinutes()` — defensible, and the honest argument for it is fewer cron
invocations and fewer log lines. It loses on the latency that is the feature's whole point.
*Rejected:* an hourly sweep — makes "scheduled for 09:00" mean "some time in the 09:00 hour", which is
a different product than the one confirmed in **D-0**.

### D-4 — The action takes one post id, not the batch

`__invoke(string $blogPostId): ?BlogPost`.

- **It matches this repo's established action shape.** Every action in `app/Actions/` operates on one
  subject; a batch action would be a new pattern invented for one caller.
- **It bounds the blast radius of a bad row.** The command loops and catches per post, so post 5 of 50
  failing still leaves the other 49 published. A batch action would either abort everything on one bad
  row or re-implement partial-failure handling internally — and the failure mode of the former is
  permanent: the same bad row blocks the same batch on every subsequent tick, forever, with the
  backlog growing behind it. That is the property the command-level test pins.
- **It gives 0065 a per-post seam.** One event per post falls out naturally; an aggregate action would
  have to reconstruct the transitioned set to announce it.

The command owns the *selection* (one indexed query) and the loop; the action owns the *transition*.

### D-5 — The action performs **no** `Gate::authorize()` and reads **no** actor

**This is the story's central decision, and the facilitator's research changed it from "invent a
rule" into "follow one".**

The problem is real: there is no `Auth::user()` in a console process. 0061's **D-13** says every action
in `app/Actions/Blog/` self-authorizes, and
[base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
says the rule lives in the class performing the operation. Both were written for actor-driven writes.

**The options, and why each was rejected or adopted:**

- **(a) Route the flip through `UpdateBlogPost` — rejected.** It authorizes `update` against the
  authenticated user. With no actor, `Gate` resolves the ability against `null` and denies —
  so the sweep would not "sometimes fail", it would **silently publish nothing, forever**, and the
  symptom would be indistinguishable from "the scheduler isn't running". Making it work would require
  a `$systemTriggered` bypass parameter, which is precisely the shape
  [story 0052's **D-2**](0052-order-auto-cancel-full-refund-backend.md) considered and rejected: *a
  rule does not get a bypass parameter.* It would also drag in validation, sanitization and tag sync
  the sweep has no business running (**D-11**, and three of this story's tests exist to catch exactly
  that).
- **(b) A system/impersonated actor — rejected.** This repo's only privileged non-human identity is
  the seeded `Super Admin`, whose existence is *conditional* on `SUPER_ADMIN_EMAIL` being configured
  and its bootstrap branch succeeding
  ([authorization.md](../../docs/architecture/authorization.md#super-admin-bootstrap)). Coupling a
  cron job's correctness to an optional env var is fragile. Worse, it would attribute an automated
  transition to a **named human who took no action**, corrupting the audit trail this repo built
  [specifically to be trustworthy](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail).
- **(c) A narrow dedicated action performing no `Gate` check — adopted.**

**What the sweep actually decides is not "may this actor publish" but "is this post now due".** That
is a fact about the data relative to the clock, and this repo already has a documented category for
exactly that distinction:
[A domain invariant is not an authorization rule and does not live here](../../docs/architecture/authorization.md#a-domain-invariant-is-not-an-authorization-rule-and-does-not-live-here),
written for `SalesRegions` but stated generically.

> ✅ **This is not a new idiom for this project.** [Story 0052](0052-order-auto-cancel-full-refund-backend.md)'s
> **D-1** already debated and documented it for `AutoCancelFullyRefundedOrder`, down to rejecting the
> same three alternatives (*"a `Gate::before`-style bypass, a system-user account, and a
> `Gate::forUser(null)` call were all considered and rejected as ceremony that would make the absence
> of authorization less legible rather than more"*), and its **D-9** declines to create a policy for
> the same reason: *"a policy method receives a `User` and this operation never has one."* **0064
> adopts 0052's rule rather than inventing a second one** — the "third idiom" hazard 0061's **D-13**
> warns about, avoided by following the precedent instead of arriving beside it. Note 0052 is a Phase-1
> task file, not shipped code (**V-3**), so this is a shared *written* convention that the two stories
> must keep consistent; whichever ships first documents it (see the Definition of Done).

0052 names **three properties that must all hold** for any story copying the shape. Two transfer
cleanly. **One does not, and that is this story's genuinely novel wrinkle:**

1. ✅ **The action reads no actor.** No `Auth::user()`, no `Auth::id()`, no `request()`. Pinned by the
   no-`actingAs()` test.
2. ❌ **"Its only reachable entry point is gated."** In 0052 the exemption is safe because the sole
   caller is a listener on an event only a `Gate`-authorized action dispatches — the authorization
   happened upstream. **This story has no upstream authorization at all.** A cron tick is not a
   request and nobody authorized it. Stating this plainly rather than claiming the property holds:
   **what protects the entry point here is not application authorization but deployment access.**
   Reaching `php artisan blog:publish-scheduled-posts` requires the ability to execute commands on
   the server, and anyone with that already has direct database credentials — so an application-level
   gate in front of it would refuse nobody it could not already bypass. **This substitution is the
   thing appsec-auditor should be pointed at** (see the Definition of Done); it is the only load-bearing
   claim in the decision that is an argument rather than a mechanism.
3. ✅ **The exemption is written in the class's own docblock**, not only here — so a reader who never
   opens this file can tell "exempt" from "forgotten". Mirrors 0015a's precedent for
   `Index::deleteUser()`'s guard placement.

**Consequences.** No `BlogPostPolicy` change and no new ability (0061's five abilities are untouched).
No `LogRefusedPrivilegedAttempt` call either — that helper logs a *refusal*, and this action has
none to log; its observability is a success line instead (**D-13**). And because there is no actor,
`LogRefusedPrivilegedAttempt::log()` would record `actor_id: null`, which is exactly the
uninformative audit line the helper's own docblock says an explicit `$actor` exists to prevent.

### D-6 — The sweep query, and why the trailing `<=` range does **not** break the index

The query is:

```php
BlogPost::query()
    ->where('status', BlogPostStatus::Scheduled)
    ->where('published_at', '<=', now())
    ->pluck('id');
```

which, once `BlogPost`'s `SoftDeletingScope` injects its own predicate, is really
`WHERE deleted_at IS NULL AND status = ? AND published_at <= ?` — served by 0061's **D-9**
`INDEX (deleted_at, status, published_at)`.

`database-expert` was convened specifically to answer whether the trailing range predicate breaks
that, and re-derived the analysis independently rather than trusting 0061's assertion:

| Predicate | Position | Access |
| --- | --- | --- |
| `deleted_at IS NULL` | 1st | InnoDB stores `NULL`s in secondary indexes and the optimizer treats `IS NULL` as an equality-style match (`ref`/`ref_or_null`), so it is a usable leftmost prefix — it narrows little in practice (most rows are live) but does not force a scan |
| `status = 'scheduled'` | 2nd | plain equality, prefix continues |
| `published_at <= NOW()` | 3rd | **range** — and this is the one position where a range costs nothing |

**The rule a range predicate can break is that it stops the optimizer using any *later* index column
for narrowing. There is no later column here, so nothing is lost** — all three columns compute the
scan's start/end bounds in one pass. Putting the range earlier (`(deleted_at, published_at, status)`)
would be the actual mistake: it would strand `status` outside the usable prefix and force a post-index
filter.

**`deleted_at` leads for reuse, not selectivity** — it is plainly the *least* selective predicate
here. It leads because the `SoftDeletingScope` puts it into *every* query against this table, which is
the rule [schema.md](../../docs/database/schema.md#users) already states for `users.status`. Between
`deleted_at` and `status` the order is cost-neutral for this query; the reuse argument is the
tiebreak.

**Not a covering index, deliberately.** `body` is a `mediumText` and is not indexed, so each match
costs one clustered-index lookup. That is correct and not worth contorting the shape for — and
`pluck('id')` keeps `body` off the wire entirely on the selection pass.

**Reasoned, not measured** — `vendor/` is absent (**V-6**) and no `blog_posts` table exists yet
(**V-3**), so no `EXPLAIN` was possible. The Definition of Done requires one at Phase 3.

### D-7 — The write is a **conditional `UPDATE`**, not a locked read *(recorded dissent — the debate's one substantive conflict)*

**The two amigos disagreed, and the disagreement is worth preserving rather than flattening.**

`backend-expert` proposed the shape this repo already uses for `SetSalesRegionActive`: open a
transaction, re-fetch the row with `lockForUpdate()`, re-check eligibility in PHP, then save —
citing [model-instance-trust.md](../../docs/security/model-instance-trust.md)'s rule that a guard must
re-read its subject under lock inside its own transaction.

`database-expert` argued that `lockForUpdate()` is **the wrong reflex here**, and that argument was
adopted:

> An `UPDATE ... WHERE` is not a snapshot read for the rows it writes. InnoDB takes the row lock and
> **re-evaluates the `WHERE` clause against the current committed data at the moment it acquires the
> lock.** So the condition and the decision are atomic *within the single statement* — which is
> precisely the property `model-instance-trust.md`'s locked re-read exists to buy, obtained more
> cheaply and with no transaction machinery.

The shipped shape is therefore a conditional write keyed on the row **and** the state it is
transitioning out of:

```php
$affected = BlogPost::query()
    ->whereKey($blogPostId)
    ->where('status', BlogPostStatus::Scheduled)      // the guard IS the WHERE clause
    ->where('published_at', '<=', now())
    ->update(['status' => BlogPostStatus::Published]);

if ($affected === 0) {
    return null;    // lost the race, already published, or no longer eligible
}
```

**Why this is not a weakening of `model-instance-trust.md` but an application of it.** That page's
finding was that `SetDefaultSalesRegion` tested *an attribute read before the transaction existed* —
a decision made in PHP against a stale in-memory instance. The failure was never "no lock"; it was
"the decision and the write were separated". A conditional `UPDATE` cannot have that gap, because
there is no in-memory decision to go stale. **The dissent is recorded because it is not wrong** —
the locked-read shape is also correct, and Phase 2 may reasonably prefer it for consistency with
`SetSalesRegionActive`. It is heavier, not incorrect.

Three consequences, each verified rather than assumed:

- ✅ **`updated_at` is still maintained.** `Illuminate\Database\Eloquent\Builder::update()` routes
  through `addUpdatedAtColumn()` (`Database/Eloquent/Builder.php:1393`, verified at v13.19.0), so a
  query-builder update on an Eloquent builder still stamps it. The idempotency tests depend on this.
- ⚠️ **No Eloquent model events fire.** `Builder::update()` never calls `save()`, so `saving`/`updated`
  never run. **Harmless for the slug**, because 0061's hook is guarded on `isDirty('title')` and this
  write never touches `title` — but it is exactly why **D-12**'s announcement must be an *explicit*
  dispatch and can never be a model observer.
- **No `DB::transaction()` wrapper.** A single statement is already atomic, and
  [errors-log.md's transaction-wrapper entry](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21)
  is a standing warning that a wrapper is a change to every side effect inside it. The one thing that
  *must* be ordered is the event dispatch, which follows the successful write (**D-12**).

⚠️ **Do not "fix in" a `lockForUpdate()`.** The absence is a decision, and this paragraph is what
distinguishes it from an oversight.

### D-8 — `withoutOverlapping(5)`, and what it does and does not protect

`->withoutOverlapping()` guards the *scheduled command against itself*: if a tick is still running
when the next is due, the next is skipped rather than starting a concurrent second run.

**Pass an explicit expiry.** The default is `1440` minutes — 24 hours (verified:
`Console/Scheduling/ManagesAttributes.php:180`) — so a crashed run that never releases its mutex
would wedge **every subsequent tick for a full day**. Five minutes is generous against a sweep
expected to finish in milliseconds and bounds the damage.

**It does not protect against a sweep racing a manual publish** — that is **D-7**'s conditional write,
which is a different mechanism for a different race. Conflating the two is the likely misreading.

⚠️ **Its mutex uses the cache store**, which is `database` in production but `array` in
`phpunit.xml` (**V-5**) — per-process, so a test could not exercise the real mechanism even if the
suite could produce real parallelism. This is why overlap is listed as explicitly untestable rather
than covered by a test that cannot fail.

*Not adopted:* `->onOneServer()`. It is the correct call the day this app runs its scheduler on more
than one host, and it is a one-line addition then. Adding it now would be speculative — this repo has
no multi-server deployment story documented anywhere — and it changes the mutex's semantics, so it
deserves its own decision rather than arriving as a habit.

### D-9 — The sweep must **not** use `withTrashed()`

0061's **D-7** makes `BlogPost` soft-deletable, and its hand-off names this constraint explicitly.
**The sweep gets it for free by doing nothing**: the default `SoftDeletingScope` already excludes
trashed rows, which is also why 0061's index leads with `deleted_at` (**D-6**).

**The risk is not omission, it is addition.** Someone debugging why a deleted post is invisible
somewhere unrelated adds `withTrashed()` "to see everything", and a post an editor deliberately
deleted goes live — with no error, no trace, and on a screen that by construction does not display
it. That is why this has a dedicated test asserted through `withTrashed()->find()` rather than a
default query, and why it is called out in the code-review checklist.

### D-10 — The sweep's boundary is `<=`, and the no-gap property that makes it correct

0061's **D-6** fixes the *creation* boundary as strictly `>` (`after:now`): a post cannot be scheduled
for the current instant, because that is not meaningfully "scheduled". **This story's boundary is
`<=`**: a post whose instant has arrived is due.

**The two operators differ deliberately and are not in tension** — they compare against `now()` at two
*different* times (submission vs. each later tick). What must be proven is **temporal continuity**:

| `published_at` relative to the current instant | 0061's validation, at submission | This sweep, at a later tick |
| --- | --- | --- |
| equal to `now()` | **refused** (strictly `>`) | **published** |
| `now() + 1s` | **accepted** — the earliest legal value | published once that instant arrives |
| `now() - 1s` | refused (already past) | published |

A `<` boundary here would leave a post sitting eligible-but-unpublished for one extra tick — cosmetic,
but avoidable for free. The property that actually needs a test is that **everything legally
schedulable eventually becomes sweepable, with no instant where validation refuses to create it and
the sweep refuses to publish it.** That is the named no-gap test, and it is the one case in this
story a reviewer should not let be dropped.

### D-11 — The sweep does **not** restamp `published_at`

Only `status` changes. The date the editor chose is the date the post carries.

Worth stating because 0061's **D-6** contains a rule that looks like it should apply and does not: *a
`Published` save with no date stamps `now()`*. That rule is for a **manual** save where no date
exists. Here the date exists, is the editor's stated intent, and is the very thing that made the post
due. Restamping it would overwrite intent with the sweep's tick time — invisible in the row, visible
only as a wrong date in 0063's list, and unrecoverable.

### D-12 — The transition dispatches an explicit domain event, never a model observer

`App\Events\Blog\ScheduledBlogPostPublished`, dispatched once per successfully-transitioned post,
after the write.

**Why an explicit event and not an Eloquent observer**, with three independent reasons any one of
which is sufficient:

1. **A `saved`/`updated` observer would not fire at all.** **D-7**'s conditional write is a
   query-builder update, which fires no model events. An observer-based design would silently
   announce nothing.
2. **A `restored` or `saved` observer re-announces a restore.** Restoring a previously-published post
   leaves `status` at `Published` and fires `restored` — so subscribers hear about a post they were
   already told about. 0061's hand-off names this constraint, and 0061's **D-20** (`RestoreBlogPost`)
   makes it reachable rather than hypothetical. An event keyed to the *transition* cannot have this
   bug.
3. **This repo's own precedent points the same way.** `App\Listeners\ActivateVerifiedUser` listens to
   Laravel's explicitly-dispatched `Verified` event, not a generic model hook — and
   [errors-log.md's `getPrevious()` entry](../../docs/errors-log.md#a-listener-read-the-pre-save-value-with-getoriginal-which-save-had-already-overwritten--2026-08-17)
   is a standing warning about how fragile implicit dirty-state reconstruction is.

**The seam with 0065, stated as a contract rather than an intention.** This story owns *"a post went
live"*; 0065 owns *"tell somebody"*. 0064 dispatches; **0065 adds a listener and a notification, and
adds no dispatch on this path.** 0065 still owns the *manual* `Draft`→`Published` trigger, which 0061's
**D-19** deliberately leaves unwired — **and a third one neither this story nor 0061 had accounted
for: a post created already `Published` through `CreateBlogPost`** (0065's **OQ-1**, recommended for
coverage but still open). So **there are three triggers and this story closes exactly one**; the other
two reach the notifier without touching this sweep or this event. See the Definition of Done's
0065 hand-off for the full breakdown.

⚠️ **This decision has an open question attached** (**OQ-1**): 0061's **D-19** says *"0065 owns both"*
triggers, which can be read as assigning the event class itself to 0065. The recommendation and its
reasoning are in **OQ-1**; the *properties* the tests assert (fires once per post, never over-fires,
never on a restore, never on a failed write) hold under either answer.

### D-13 — A successful transition is logged; there is no refusal to log

`Log::info('Scheduled blog post published', ['blog_post_id' => …])` per transitioned post, plus a
per-run summary from the command.

Matching `App\Livewire\Roles\Index`'s and `App\Livewire\SalesRegions\Index`'s success lines. This is
the one write path in the application with **no actor to attribute it to and no UI it appears in**,
so the log is the only durable record that it happened at all — which makes it more valuable here
than on a screen, not less.

**No `LogRefusedPrivilegedAttempt` call**, deliberately: that helper records a *refusal*, and this
action has none. A `null`-eligible row is a no-op, not a refusal, and logging it as one would fill the
warning channel with normal operation. See **D-5**.

### D-14 — Gherkin for a system-triggered scenario: the `Given` carries the human, the `When` carries the scheduler

[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rule 1 requires a named
business-role actor and forbids a bare `I`. **It has no precedent for a scenario whose actor is not a
person** — verified: no scenario in the PRD or any task file describes an automated process, and the
guidelines' domain glossary has no term for one (**V-4**).

The convention this story sets:

- **The `When` names the acting subject as *the publication scheduler*.** It is business language, not
  a technical detail — an editor reading it recognises the thing that publishes their post on time.
  It is not `Given I`, and it does not attribute the action to a human who did not perform it.
- **The `Given` still carries a named business-role actor wherever a human decision created the
  state** — *"a post scheduled by a blog editor for a time that has now arrived"*. This keeps rule 1's
  actual intent (business framing, real domain roles) rather than only its letter.
- **Rule 3 is unaffected** — one `When` per scenario throughout.

*Rejected:* `Given the system` / `When the system runs` — "system" is exactly the technical leakage
rule 2 warns against, and it says nothing about what the process is for. *Rejected:* attributing the
transition to the editor (*"When the blog editor's scheduled time arrives"*) — it reads as though a
human acted, which is the specific confusion this feature causes when it goes wrong.

**Recorded as a project-level convention, not a story-local choice** — the next scheduled or queued
feature (order auto-cancel, low-stock alerts) inherits it, and the guidelines file should gain the
rule (see the Definition of Done's docs list).

### D-15 — The sweep does not chunk, and `chunk()` specifically must not be used

One indexed `SELECT` pulls the candidate ids; the loop transitions them.

**The reason to avoid `chunk()` is a correctness hazard, not just scale.** `chunk()` paginates with
`OFFSET`, and this sweep **mutates the very column its own `WHERE` filters on** — each transitioned
post leaves the matching set, shifting every subsequent chunk's offset and **silently skipping rows**.
It is invisible until the backlog spans more than one chunk, which is precisely when it matters.

At this story's real scale — the posts a human scheduled for roughly the same window, plausibly single
digits even after a weekend of scheduler downtime — no chunking is needed. **If a future story ever
does need it, it must be `chunkById()`**, which re-queries by primary key and is safe against a
shrinking result set.

## Scope fences: what this story must NOT do

- **No migration, column, index or schema change of any kind.** 0061 owns `blog_posts` entirely.
  (**R-1** is the single condition that could change this, and it must be resolved explicitly.)
- **No model, enum, factory or validation-trait change.** `BlogPost` and `BlogPostStatus` are consumed
  unchanged.
- **No notification, mailable, listener or `app/Notifications/**` class** — 0065 owns all of them.
  This story dispatches an event and stops.
- **No `Gate`, policy, ability or permission change**, and no `RolePermissionSeeder` entry (**D-5**).
- **No modification to `UpdateBlogPost`** — not to call it, and specifically **not to add a
  `$systemTriggered`-style bypass parameter to it** (**D-5**).
- No route, Livewire component, Blade view, `config/modules.php` entry or browser test.
- **No `bootstrap/app.php` change** — verified unnecessary (**V-2**).
- **No `withTrashed()` anywhere in this story** (**D-9**).
- **No `forceDelete`, no restore path, no trash affordance** — 0061's **D-20** and 0063 own those.
- No queue/job class. The sweep is synchronous within its tick; a queued fan-out is speculative at
  this scale and would add a second failure mode (a job stuck in `jobs`) for no benefit.
- **No `->onOneServer()`** (**D-8**) — correct later, speculative now.

## Dependencies, risks and open questions

### Verified environment findings

Read or executed against this worktree and the sibling checkout's `vendor/` during the debate.

- **V-1 — This is genuinely the app's first scheduled command.** `app/Console/` does not exist,
  `routes/console.php` does not exist, and a repo-wide grep for `Schedule::` / `schedule(` across
  `app/`, `routes/`, `bootstrap/`, `config/` and `database/` returns **zero** hits. There is no
  precedent to follow and none to violate.
- **V-2 — `bootstrap/app.php` already references the file that does not exist.** Line 16 passes
  `commands: __DIR__.'/../routes/console.php'`. Verified against the framework source that this is
  silently skipped rather than fatal, and that creating the file is sufficient with no edit to
  `bootstrap/app.php` (`ApplicationBuilder.php:179`).
- **V-3 — Almost nothing this story depends on exists in code yet.** `app/Models/` holds only
  `Role.php`, `SalesRegion.php`, `User.php`; there is no blog migration, no `BlogPost`, no
  `BlogPostStatus`; `app/Events/` does not exist at all. **0058–0063 are Phase 1 task files, not
  shipped code**, and so is 0052. This story's dependency is on 0061's *specification*.
- **V-4 — There is no in-repo precedent for testing a scheduled command, and none for a
  system-actor Gherkin scenario.** Grepped `docs/testing/**` for `schedule`, `Console`, `command`,
  `Artisan::call` and `docs/testing/frontend/gherkin-guidelines.md` for `system`/`automated`/`cron`:
  nothing. Both conventions are set here (**D-14**, and the Definition of Done's docs item).
- **V-5 — The test environment's cache store differs from production's.** `.env.example` sets
  `CACHE_STORE=database` and `QUEUE_CONNECTION=database`; `phpunit.xml` overrides them to `array` and
  `sync`. This is what makes `withoutOverlapping()`'s mutex unexercisable in the suite (**D-8**).
- **V-6 — `vendor/` is absent from this worktree**, but **is present in the sibling checkout**, so the
  framework mechanics in **D-2**, **D-7** and the schedule-registration test were **verified by
  reading `laravel/framework v13.19.0`'s real source** rather than reasoned. This is a deliberate
  improvement on 0061's **V-8**, which had to flag the same class of claim as unmeasured. What could
  *not* be verified is anything needing execution against a database: no `EXPLAIN`, no
  `php artisan list`, no `db:table`.
- **V-7 — `config/app.php` sets `'timezone' => 'UTC'`**, and `config/database.php`'s `mysql` block
  sets **no** `'timezone'` key. See **R-4**.
- **V-8 — `app/Console/Commands/` exists as an empty, untracked directory in the shared checkout** and
  is absent here only because git does not track empty directories. It is already named in
  [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)'s listing, so it
  needs no new-base-folder approval.

### Dependencies

- **0061 (blog posts core CRUD) — hard, blocking.** This story reads `blog_posts.published_at`,
  `BlogPostStatus::Scheduled`, `App\Models\BlogPost` and its `SoftDeletingScope`, and depends on
  0061's composite index. Not yet implemented (**V-3**). **0061 must reach Phase 7 before this story
  starts Phase 3.**
- **0058 / 0059 — transitive, through 0061.** No direct use.
- **0052 (order auto-cancel) — no code dependency, but a *convention* dependency** (**D-5**). The two
  stories share one rule about ungated system-triggered writes and one documentation obligation on
  `architecture/authorization.md`. Whichever ships first writes that section; the other extends it.
  Neither blocks the other.
- **0063 — not a dependency.** It already ships the editor controls that let a human create the state
  this story consumes, but nothing here reads its code.
- **0065 depends on this one** for the automatic trigger (**D-12**).
- Per [workflow.md](../../docs/workflow.md#task-ordering-rule) the numbering is already correct
  (0061 < 0064 < 0065); what must be enforced is the **sequencing**.

### Risks

- **R-1 — The composite index may not exist when this story ships, and that would breach its own scope
  fence.** 0061's **OQ-6** is *open*: it recommends shipping the index in 0061 but explicitly records
  deferring it to 0064 as a defensible alternative. If Phase 2 of 0061 defers it, this story's "no
  migration" acceptance criterion becomes false. **Resolution, and it must be explicit rather than
  discovered:** verify with `php artisan db:table blog_posts` *after 0061 has migrated* — **not** by
  re-reading 0061's task file, which is a statement of intent. If the index is absent, add
  `add_scheduled_sweep_index_to_blog_posts_table` per
  [migrations.md](../../docs/database/migrations.md#file-naming)'s `<verb>_<what>_to_<table>_table`
  convention, as a **reviewed exception to this story's scope fence**, never as a silent addition.
- **R-2 — Someone adds `withTrashed()` and a deleted post goes live.** The highest-severity failure in
  the story, and the cheapest to prevent (**D-9**). Mitigated by a dedicated test and a named
  code-review item.
- **R-3 — Someone routes the flip through `UpdateBlogPost`, or adds a `Gate` call to the action.**
  Either publishes nothing, silently and permanently — a failure indistinguishable from "cron isn't
  running". Mitigated by the no-`actingAs()` test (**D-5**), which is the only executable proof.
- **R-4 — Application/database timezone mismatch on a `TIMESTAMP` column.** `published_at` is
  `$table->timestamp(...)`, which MySQL stores as UTC and converts on every read/write using the
  **session** `time_zone`; `config/app.php` pins the app to UTC but `config/database.php` pins nothing
  (**V-7**). If the two disagree, every scheduled post publishes offset by that difference. **Almost
  certainly fine** — the `mysql:8.4` container and the app container both very likely resolve to UTC —
  but "almost certainly" is precisely the hedge
  [this project's own rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24)
  says not to paper over. **Verify once at Phase 3** with `SELECT @@global.time_zone,
  @@session.time_zone;` against the running container. **This is pre-existing** — it applies equally to
  `created_at`/`updated_at` on every table — so it is not a blocker unique to this story, but this is
  the first feature whose *correctness* depends on it.
- **R-5 — The scheduler is not actually running in the deployment.** Every test in this story can be
  green while `php artisan schedule:run` is on no cron anywhere, and the symptom (posts never publish)
  is identical to a code bug. **Out of this story's scope to fix**, but worth recording: it is a
  deployment/runbook obligation with no application-level detection, and the first thing to check when
  someone reports that scheduling "doesn't work".
- **R-6 — A `Scheduled` row with a `NULL` `published_at` is invisible and never publishes.** 0061's
  **D-6** enforces the `Scheduled` ⟺ future-date invariant in *validation only*, not in the schema
  (consistent with `sales_regions.is_default`'s precedent). If such a row ever exists — a direct
  database write, a bad backfill, a future bug — `published_at <= NOW()` evaluates to `UNKNOWN` for a
  `NULL` operand, so the row is **excluded**. That fails *safe* (it is never force-published) but also
  **fails silent**: nothing ever surfaces it, and the post simply never goes live. Not a blocker and
  not this story's to fix; recorded so it is a known property rather than a mystery.
- **R-7 — `php artisan list` showing the command is not proof the schedule entry loaded.** The command
  class is auto-discovered from `app/Console/Commands/` **independently** of `routes/console.php`
  (**V-2**'s verified chain), so a missing or malformed `routes/console.php` leaves the command
  perfectly runnable by hand while it is scheduled **nowhere** — and no error is raised anywhere. This
  is exactly why the schedule-registration test asserts the *expression*, not merely that the command
  exists.

### Open questions

- **OQ-1 — Does 0064 define the event class, or does 0065?** **D-12** has this story define and
  dispatch `App\Events\Blog\ScheduledBlogPostPublished`, and 0065 add only a listener.
  **Recommendation: 0064 defines and dispatches it (recommended)** — this story's write is the only
  code that can observe the transition at all (a query-builder update fires no model events, **D-7**),
  so the dispatch has to live here regardless; leaving the *class* to 0065 would mean 0064 ships a
  transition nothing can observe and 0065 then edits 0064's action to add the one line. *Alternative:*
  0065 defines the class and edits this action to dispatch it, which is a precedented shape in this
  repo (task 0018 editing task 0017's `closeModal()` is the exact model) and is arguably what 0061's
  **D-19** means by *"0065 owns both"*. **Flagged rather than settled because it is a cross-story
  ownership boundary, and 0061's wording genuinely supports either reading.** Note the properties the
  tests assert are identical under both answers, so this does not block test design.
- **~~OQ-2~~ — RESOLVED: the event carries the `BlogPost` model.** This was left open as *"genuinely
  0065's call, since only it knows whether its listener queues"*, and **story
  [0065](0065-blog-post-published-notification-backend.md)'s D-9 answered it** — a decision titled
  *"`ScheduledBlogPostPublished` carries the `BlogPost` model, not its id (resolves 0064's OQ-2)"*, on
  two reasons quoted rather than re-derived: this story's action **already holds a model** (it must
  re-fetch one to satisfy its own `?BlogPost` return type, since **D-7**'s conditional `UPDATE` returns
  only an affected-row count, so attaching it costs nothing and spares 0065's listener a second
  `find()` just to read the title); and **the listener is not `ShouldQueue`** (0065's **D-3**), so
  there is no `SerializesModels` round trip and no staleness window — *which is the one condition
  under which this story's own hedge preferred the id.* The two decisions are coupled and 0065 records
  that they must move together. **This resolution requires no change to 0064** beyond closing the
  question: 0065's D-9 says so explicitly, and the shape recommended here is the shape adopted.
- **OQ-3 — Does the command take a `--dry-run` flag, and what does it print?** **Recommendation:
  include `--dry-run` (recommended, lightly)** — it is one flag and one branch, this is the app's first
  scheduled *write*, and giving an operator a safe way to see what a sweep would touch before enabling
  it in production is cheap insurance. *Alternative:* omit it as speculative, consistent with this
  repo's habit of rejecting unconsumed scaffolding (`sales_regions`' **D-6**, 0058's **D-6**). Console
  output copy is unresolved either way — it is operator-facing, not end-user-facing, so it is
  **deliberately not** going through `lang/` unless Phase 2 says otherwise. A product call, not a
  technical one.
- **OQ-4 — Is `everyMinute()` the confirmed frequency?** **D-3** recommends it and states the tradeoff.
  Flagged because it is the one decision here a product owner might reasonably overrule on operational
  grounds (log volume, a hosting environment that bills per invocation), and because changing it later
  is a one-line change *plus* a test-expectation change, so it is cheapest to confirm now.
- **OQ-5 — Should the story add the "system-triggered writes may be ungated" section to
  `architecture/authorization.md`, or wait for 0052?** Both stories' Definitions of Done name the same
  obligation. **Recommendation: whichever reaches Phase 6 first writes it, the other extends it and
  adds its own case (recommended)** — the same convention 0061's **OQ-4** uses for the shared sanitizer.
  What must not happen is two sections describing one rule, which is the drift these hand-offs exist to
  prevent.

## Resolved in the debate

Recorded so they are not re-opened. Each was a real question at the start of the debate.

1. **Does the trailing `<=` range predicate break the composite index?** No — it is in the only
   position where a range costs nothing, and 0061's column order is correct as specified
   (**D-6**). This was the question `database-expert` was convened for.
2. **`lockForUpdate()` or a conditional `UPDATE`?** Conditional `UPDATE`, with the locked-read shape
   recorded as a dissent rather than dismissed (**D-7**).
3. **Is the ungated system write a novel case for this repo?** **No** — story 0052's **D-1** already
   debated it, rejected the same three alternatives, and named three properties. This story adopts
   that rule and records honestly that **one of the three does not transfer** (**D-5**).
4. **Is `routes/console.php` missing a bug that must be fixed in `bootstrap/app.php`?** No — the
   reference is guarded by `realpath()`, and creating the file is the whole fix (**D-2**, **V-2**).
5. **Is a schedule-registration test vacuous?** No — verified that all four properties it reads are
   public in the installed framework, so it can genuinely fail; and it must be *proven* to fail before
   being trusted, per this repo's own standing rule.
6. **Should the sweep chunk?** No, and `chunk()` specifically is unsafe here because the sweep mutates
   its own filter column (**D-15**).
7. **Should this story add a permission or a policy method?** No — there is no actor to grant anything
   to (**D-5**).

## Provenance

Phase 1 (Three Amigos) debate run on 2026-08-27 with `backend-expert` (files and approach),
`database-expert` (query shape, index validation, concurrency) and `backend-qa` (test design), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate). Derived from
[PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's blog-post status requirement and the
[cross-cutting notification list](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications)'s
*"a blog post is published or a scheduled post goes live"*, plus the human product decision recorded
as **D-0**, and story [0061](0061-blog-posts-core-crud-backend.md)'s explicit hand-off, which is this
story's entire backend contract.

All three amigos' contributions are reflected above. **Two facilitator findings changed this document
rather than merely supporting it, and both were verified by execution or source-reading before being
accepted**, per this project's rule that a second-hand claim is a flag that nobody ran the code:

1. **The central authorization question is not unprecedented, and the brief's framing that it is was
   overturned.** This story was briefed — reasonably — as a genuinely novel case deserving its own
   invented rule, on the grounds that this repo's conventions never anticipated a write with no actor.
   `backend-qa` cited story **0052** in passing as a precedent; the facilitator verified that claim
   directly against `ai-spec/tasks/0052-order-auto-cancel-full-refund-backend.md` rather than
   accepting it, and it turned out to be **much stronger than cited**: 0052's **D-1** is a fully
   argued decision that rejects the *same three alternatives by name* (a `Gate::before` bypass, a
   system-user account, a `Gate::forUser(null)` call), its **D-9** declines a policy for the same
   reason, and its Definition of Done already assigns the identical documentation obligation to
   `architecture/authorization.md`. **The correct move was therefore to adopt an existing rule rather
   than author a second one** — precisely the "third idiom" hazard 0061's **D-13** warns about. What
   remained genuinely novel is narrower and is recorded as such: 0052's second safety property ("its
   only reachable entry point is gated") **does not hold here**, because a cron tick has no upstream
   authorization at all, and **D-5** states what substitutes for it rather than claiming the property
   transfers.
2. **A confidently-reasoned framework claim was disproved before it reached this document.** While
   verifying how the missing `routes/console.php` behaves, the facilitator derived — from
   `ApplicationBuilder::withCommands()`'s `if (empty($commands))` branch — that supplying an explicit
   `commands:` path *suppresses* `app/Console/Commands` auto-discovery, which would have meant this
   story's command needed explicit registration. It is **wrong**: `Application::configure()` calls
   `->withCommands()` with no arguments (`Foundation/Application.php:244`) *before* `withRouting()`
   ever runs, and the two accumulate. The claim was checked because it contradicted widespread
   understanding of Laravel, and it was checked *before* being written down rather than after. Its
   corrected form is **V-2** and its inverse is **R-7** — the genuinely useful half, which is that a
   discoverable command and a registered schedule entry are independent, so one can be present while
   the other is silently absent.

**One substantive conflict between two amigos was resolved by the facilitator rather than left
implicit** (**D-7**). `backend-expert` proposed a per-row `DB::transaction()` + `lockForUpdate()` +
in-PHP re-check, citing
[model-instance-trust.md](../../docs/security/model-instance-trust.md)'s locked-re-read rule.
`database-expert` argued that `lockForUpdate()` is the wrong reflex, on the concrete mechanism that an
`UPDATE ... WHERE` re-evaluates its own predicate against committed data at lock acquisition, making
the guard and the write atomic within one statement. **Resolved in favour of the conditional
`UPDATE`**, on the reading that `model-instance-trust.md`'s actual finding was about a decision made
in PHP against a stale instance — a gap a conditional write cannot have — rather than about locks per
se. `backend-expert`'s shape is recorded as a **dissent rather than dropped**, because it is also
correct, merely heavier, and Phase 2 may reasonably prefer it for consistency with
`SetSalesRegionActive`.

**A second, smaller conflict resolved cleanly.** `backend-expert` argued 0064 should dispatch nothing
and leave the entire trigger mechanism to 0065; `database-expert` argued for an explicit domain event
dispatched here. The facilitator adopted the event (**D-12**) on `database-expert`'s decisive
mechanical point — **D-7**'s query-builder write fires no model events, so *nothing outside this
action can observe the transition at all* — which makes "leave it to 0065" impossible without also
changing the write shape. The ownership question that remains genuinely open (who declares the class)
is escalated as **OQ-1** rather than settled, since 0061's *"0065 owns both"* wording supports either
reading.

**One thing this story deliberately does not inherit from its Epic 4 siblings**, stated so its absence
is not read as an oversight: **self-authorization**. 0058's **D-13**, 0059's **D-12** and 0061's
**D-13** all establish that every action in `app/Actions/Blog/` authorizes itself via
`LogRefusedPrivilegedAttempt::authorize()`, and by the time this story lands that folder will hold
seven or eight actions that do. `PublishScheduledBlogPost` will be the **one that does not**, and a
reviewer moving from 0061 to this file will look for the call and needs to find the reason it is
absent — in **D-5**, in the class's own docblock, and in the acceptance criteria, rather than nowhere.

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Six items deserve an explicit look there
rather than at implementation time:

1. **R-1** — whether 0061 actually shipped the composite index, which decides whether this story's
   "no migration" scope fence holds. It depends on an open question in *another* story (0061's
   **OQ-6**) and is the only thing that can invalidate a stated acceptance criterion.
2. **OQ-1** — who owns the event class, a cross-story ownership boundary.
3. **OQ-4** — the schedule frequency, cheapest to confirm before the tests pin it.
4. **OQ-3** — `--dry-run` and console output, a product call.
5. **D-14** — the system-actor Gherkin convention, which is a **project-level** convention decision
   being made inside a single story file. By this repo's own rule that
   [a story file naming a test path is making a convention decision, and the path belongs in the
   Phase 2 review](../../docs/testing/frontend/playwright-setup.md#folder-structure), a story file
   naming a *Gherkin* convention deserves the same scrutiny.
6. **The test file paths themselves** — `tests/Feature/Console/Commands/` and `tests/Feature/Console/`
   are new folders, and per the same rule that is a convention decision, not an implementation detail.
   `tests/Feature/` currently mirrors `app/`, which argues for `Console/Commands/`; the schedule test
   mirrors nothing in `app/`, which is why it is proposed one level up.
