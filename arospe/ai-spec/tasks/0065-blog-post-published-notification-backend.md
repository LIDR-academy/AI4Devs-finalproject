# [0065] Blog post published — notification (backend)

## Description

When a blog post becomes **Published**, generate a **database notification** for every administrator
who holds `blog.view`. This closes the **fourth and last** of the four confirmed notification events
in PRD [§ Cross-cutting: global search & notifications](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications)
— *"**Blog post published**, or a **scheduled post going live**"* — and completes PRD
[Epic 4](../../docs/PRD/PRD.md#epic-4--blog).

This story owns the `BlogPostPublished` notification, the recipient-resolution rule, **one listener**
and **one dispatch site inside a file it does not own**. It adds **no migration** (the `notifications`
table is story [0043](0043-customers-new-customer-notification-backend.md)'s), **no permission** (the
`blog.*` tier is already seeded), **no policy**, **no route** and **no UI**.

> ### This story has **three** triggers, and that is what makes it different from its two siblings
>
> Stories [0043](0043-customers-new-customer-notification-backend.md) and
> [0046](0046-orders-new-order-notification-backend.md) each announce a **row creation** reached from
> exactly one call site. This one announces a **publication** reached from **three independent
> paths** — two of them state transitions and one a creation:
>
> | # | Trigger | Reached through | Dispatch lives in |
> | --- | --- | --- | --- |
> | 1 | An existing post is updated **into** `Published` | `App\Actions\Blog\UpdateBlogPost` | **story 0061** |
> | 2 | A post is **created** already `Published` | `App\Actions\Blog\CreateBlogPost` | **story 0061** |
> | 3 | A `Scheduled` post's time arrives and the sweep flips it | `App\Events\Blog\ScheduledBlogPostPublished` | **story 0064** |
>
> **Triggers 1 and 2 reach this story's action by a direct call; trigger 3 reaches it through a
> listener this story adds.** Concretely:
>
> - **The automatic trigger (3).** Story [0064](0064-scheduled-post-auto-publish-backend.md) already
>   defines and dispatches `ScheduledBlogPostPublished`, once per successfully transitioned post, after
>   the write, never on a failed write and never on a restore. Per its **D-12** and hand-off fact 3:
>   **0065 adds a *listener*; it does not add a second dispatch on this path.** 0064's **OQ-2** (does
>   the event carry the model or its id?) is left open and marked *"this is genuinely 0065's call"* —
>   it is resolved here as **D-9**.
> - **The two manual triggers (1 and 2).** Story [0061](0061-blog-posts-core-crud-backend.md) owns both
>   dispatch sites and **has shipped them**, calling this story's
>   `App\Actions\Blog\NotifyBlogPostPublished::__invoke(BlogPost): void` from each — see its revised
>   **D-19**. This story owns *what the notification contains, who receives it, and through which
>   channel*; 0061 owns *when it is called*.
>
> **Trigger 2 is this file's own finding, and it is now closed** (**OQ-1**, confirmed). It was raised
> here by the facilitator — neither amigo saw it, and neither upstream hand-off accounted for it: both
> 0061's original **D-19** and 0064's hand-off said *"two triggers"*, so a post published at creation
> would have notified nobody, silently. 0061 revised **D-19** in response and now ships both manual
> dispatch sites. **The seam moved with it:** the dispatch site inside `UpdateBlogPost` was originally
> specified as this story's own cross-story edit, and is now 0061's — see **D-8**.

> ### ⚠️ Epic 5 amendments — 2026-08-30
>
> Story [0078](0078-translatable-content-retrofit-blog-posts-backend.md) (translatable-content retrofit
> for blog posts) **drops `blog_posts.title`, `blog_posts.slug` and `blog_posts.body` entirely**, moving
> all three to a `blog_post_translations` child table read through
> `BlogPost::translated('title', $languageId)`. Its **R-1(c)** names this story as the one the retrofit
> hits hardest, and says why: *"[0065] forces a decision no sibling retrofit did"* — this story's
> payload freezes `$this->post->title` as an immutable snapshot at publication, and once a title is
> per-language **something has to choose which language gets frozen**. That is a product choice wearing
> a mechanical rename's clothes, so it is recorded as a decision rather than applied silently.
>
> **The decision is [D-4a](#d-4a--the-frozen-title-snapshot-resolves-in-the-store-default-language-2026-08-30):
> the store default language, via `translated('title')` with no language argument.** Corrections marked
> **⚠️ Correction, 2026-08-30** appear in **D-4** (the payload and its `?string` type), **D-9** (the
> "costs nothing" clause), the Gherkin, the test plan's frozen-snapshot case, and the 0057 hand-off.
>
> ⚠️ **One item is genuinely new and is not a rename: R-11**, under [Risks](#risks).
> The snapshot's freshness used to be guaranteed by reading an attribute off the row the action had just
> written; it now depends on the `translations` relation not being stale on the instance handed to the
> notification. That is 0070's **R-5** meeting this story's **R-1** one table down, and it is the reason
> the "is the snapshot taken at a fixed enough point" question has a *different* answer per trigger.
>
> Sequencing: 0078 is a hard dependency the moment it lands — this story cannot resolve a title without
> `HasTranslations` and `StoreLanguage`. If 0078's **R-14** is taken instead (amending 0061 so the three
> columns are never created), every amendment below still stands unchanged; only the migration story
> differs.

> ### ⛔ BLOCKED — read this before Phase 3
>
> Fully specified now, but Phase 3 cannot start until **all** of the following are `done`:
> [0043](0043-customers-new-customer-notification-backend.md) (owns the `notifications` table),
> [0061](0061-blog-posts-core-crud-backend.md) (owns `BlogPost`, `BlogPostStatus`, `UpdateBlogPost`,
> `RestoreBlogPost`) and [0064](0064-scheduled-post-auto-publish-backend.md) (owns
> `ScheduledBlogPostPublished` and the sweep that dispatches it). 0061 and 0064 transitively require
> [0058](0058-blog-categories-backend.md) and [0059](0059-blog-tags-backend.md).
>
> ⚠️ *(added 2026-08-30)* **[0078](0078-translatable-content-retrofit-blog-posts-backend.md) is a
> conditional fourth**: it is not a blocker if it ships *after* this story, but it **is** one the moment
> it ships first, because `$post->title` will not exist and **D-4a**'s `translated('title')` needs
> `HasTranslations` (0070) and `StoreLanguage` (0068) to be present. Check the order at Phase 2 rather
> than at Phase 3 — the payload line differs between the two worlds and nothing else in this story does.
>
> **Do not stub a `notifications` table, a `BlogPost` factory or a fake event to make this story
> testable earlier.** Every one of those is the back door 0046's own banner refuses.

> ### Scope boundary — what "notified" means, and what it does not
>
> Unlike 0043's and 0046's era, the notification **viewer now exists in the backlog**:
> [0056](0056-notification-viewing-backend.md) (bell backend) and
> [0057](0057-notification-bell-ui.md) (bell UI). So this story is **not** re-raising 0043's OQ-3, and
> a reviewer must not read the absence of a bell change here as a gap.
>
> What a reviewer **should** know, because it is a real and verified consequence: 0057's bell branches
> on `notifications.type` **in the view only**, with a permanent `default` arm, and its recognized-type
> table lists exactly two arms today (`CustomerCreated` → the customer's record, `OrderCreated` → the
> order's record). A `BlogPostPublished` row therefore renders through 0057's **generic fallback — a
> label and a relative timestamp, with no link to the post** — until 0057 gains a third arm. That is
> 0057's *designed* behaviour, not a defect introduced here, and it is recorded as a hand-off (**R-8**)
> rather than pulled into this story's scope.

## Type

backend | includes database-expert: **no**

`database-expert` was **not** convened, and the reason is the same one 0046 gives: this story adds no
table, no column, no index and no migration. `notifications` is 0043's; `blog_posts` and its
`(deleted_at, status, published_at)` index are 0061's; `App\Models\User` already carries
`use Notifiable;` and `SoftDeletes` (**V-3**). The only query this story writes is
`User::permission('blog.view')->get()`, which is Spatie's own scope against already-indexed permission
tables — the identical query 0043 and 0046 write with one string changed. There is nothing here a
schema specialist would be asked to decide.

## Three Amigos participants

`product-owner` (lead/facilitator) + `backend-expert` (files, class shapes, the dispatch site and its
race) + `backend-qa` (risk-based test design and the transition matrix). Both were convened as
subagents and both contributions are reflected below, including **one naming conflict the facilitator
resolved against `backend-expert` with the dissent recorded** (**D-6**), **one disagreement between
the two amigos about whether a question was a decision or an escalation** (**D-12** / **OQ-2**), and
**three facilitator findings that changed this document rather than merely supporting it** — one of
which is a trigger neither amigo raised, escalated as **OQ-1**, **since confirmed, and which changed
story 0061's own D-19 rather than only this file**. See [Provenance](#provenance).

## Gherkin

Every scenario carries exactly one `When` (rule 3) and opens with a named business-role actor, never
`I` (rule 1), per [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md). The
scheduler scenarios follow **0064's D-14** convention verbatim rather than inventing a second one: the
`Given` carries the **blog editor** whose earlier decision created the state, and the `When` names
**the publication scheduler** as the acting subject.

```gherkin
Feature: Blog post published notification

  # --- The manual trigger: an editor publishes by hand ---

  Scenario: Publishing a draft notifies an administrator who may view the blog
    Given a blog administrator whose role grants the blog view permission
    When a blog editor changes a draft post's status to published
    Then a blog-post-published notification is stored for the blog administrator

  Scenario: The notification identifies the post that was published
    Given a blog administrator whose role grants the blog view permission
    When a blog editor publishes a draft post titled "Guía de invierno"
    Then the stored notification carries that post's identifier and its title
      in the store's default language

  Scenario: A post translated into several languages is announced by its default-language title
    Given a blog administrator whose role grants the blog view permission
    And a draft post titled "Guía de invierno" in the store's default language
      and "Winter guide" in another store language
    When a blog editor publishes that post
    Then the stored notification carries the title "Guía de invierno"

  Scenario: Every administrator holding the blog view permission is notified
    Given three administrators whose roles all grant the blog view permission
    When a blog editor publishes a draft post
    Then a blog-post-published notification is stored for each of the three administrators

  Scenario: Publishing a scheduled post by hand notifies administrators
    Given a blog administrator whose role grants the blog view permission
    When a blog editor changes a scheduled post's status to published ahead of its date
    Then a blog-post-published notification is stored for the blog administrator

  # --- The manual trigger, second form: published at creation (OQ-1, confirmed) ---

  Scenario: Publishing a post at creation notifies administrators
    Given a blog administrator whose role grants the blog view permission
    When a blog editor creates a post that is already published
    Then a blog-post-published notification is stored for the blog administrator

  Scenario: Creating a draft announces nothing
    Given a blog administrator whose role grants the blog view permission
    When a blog editor creates a post as a draft
    Then no blog-post-published notification is stored

  Scenario: Creating a scheduled post announces nothing
    Given a blog administrator whose role grants the blog view permission
    When a blog editor creates a post scheduled for a future date
    Then no blog-post-published notification is stored

  # --- The automatic trigger: a scheduled post goes live on its own ---

  Scenario: A scheduled post going live notifies administrators
    Given a blog administrator whose role grants the blog view permission
    And a post scheduled by a blog editor for a time that has now arrived
    When the publication scheduler runs
    Then a blog-post-published notification is stored for the blog administrator

  Scenario: Each post going live in one run is announced separately
    Given a blog administrator whose role grants the blog view permission
    And three posts scheduled by a blog editor for times that have now arrived
    When the publication scheduler runs
    Then three separate blog-post-published notifications are stored for that administrator

  # --- Who is deliberately not notified ---

  Scenario: An administrator without the blog view permission is not notified
    Given a customer administrator whose role does not grant the blog view permission
    When a blog editor publishes a draft post
    Then no blog-post-published notification is stored for the customer administrator

  Scenario: A Super Admin is not notified of routine publication
    Given a Super Admin, who holds no explicit blog view grant
    When a blog editor publishes a draft post
    Then no blog-post-published notification is stored for the Super Admin

  Scenario: A soft-deleted administrator is not notified
    Given a soft-deleted administrator whose role granted the blog view permission
    When a blog editor publishes a draft post
    Then no blog-post-published notification is stored for the soft-deleted administrator

  # --- The notification is not generated ---

  Scenario: Editing an already-published post announces nothing
    Given a blog administrator whose role grants the blog view permission
    And a post a blog editor published earlier
    When the blog editor corrects that post's title
    Then no further blog-post-published notification is stored

  Scenario: Unpublishing a post announces nothing
    Given a post a blog editor published earlier
    When the blog editor changes that post's status back to draft
    Then no blog-post-published notification is stored

  Scenario: Scheduling a draft announces nothing
    Given a blog editor, with a draft post
    When they schedule that post for a future date
    Then no blog-post-published notification is stored

  Scenario: Restoring a published post announces nothing
    Given a blog editor, with a deleted post that was published before it was deleted
    When they restore that post
    Then no blog-post-published notification is stored

  Scenario: A refused publication announces nothing
    Given a signed-in administrator whose role does not grant the blog edit permission
    When they attempt to publish a draft post
    Then no blog-post-published notification is stored

  Scenario: A publication that fails to persist announces nothing
    Given a blog editor whose post save fails partway through and is rolled back
    When the save transaction is rolled back
    Then no blog-post-published notification is stored

  # --- Republication, per D-12 ---

  Scenario: Republishing an unpublished post announces it again
    Given a blog administrator whose role grants the blog view permission
    And a post a blog editor published and then returned to draft
    When the blog editor publishes that post again
    Then a second blog-post-published notification is stored for the blog administrator

  # --- Edge case ---

  Scenario: A publication with no eligible recipients still succeeds
    Given a store where no role grants the blog view permission
    When a blog editor publishes a draft post
    Then the post is published and no notification is stored
```

> ⚠️ **Correction, 2026-08-30 — two scenarios changed for the Epic 5 retrofit.**
> *"The notification identifies the post that was published"* previously ended *"…carries that post's
> identifier and title"*, which stops being a single value once story
> [0078](0078-translatable-content-retrofit-blog-posts-backend.md) makes the title per store language;
> it now names the language. The second scenario is **new** and is the only one that can fail if the
> language choice is wrong — a post translated into exactly one language makes every candidate
> resolution identical, which is precisely why **D-4a** could otherwise ship untested. Both are the
> Gherkin face of **D-4a**; neither changes who is notified or when.
>
> Note the actor convention is unchanged: `Given` carries the blog administrator who receives, `When`
> carries the blog editor who acts, one `When` per scenario. The retrofit adds no new actor — a store
> language is a property of the content, never a role.

> **The `Publishing a post at creation…` scenario was added when OQ-1 was confirmed.** It sat as a
> deliberate gap while the question was open — writing it earlier would have decided OQ-1 by the back
> door — and it is the only scenario in this feature whose trigger is a **creation** rather than a
> transition, which is exactly why its sibling *"Creating a draft announces nothing"* sits beside it:
> the two together are what distinguish "a post was created" from "a post was published".

## Files to create/modify

### Notification — `App\Notifications\BlogPostPublished`

`app/Notifications/BlogPostPublished.php` — **new**. `app/Notifications/` is a stock Laravel location
(`make:notification`), so no folder approval is needed
([base-standards.md](../../docs/conventions/base-standards.md#directory-structure)). It is the
folder's **fifth** class (`PendingEmailVerification`, `UserInvitation`, and 0043's / 0046's — verified:
only the first two exist today, **V-3**).

```php
class BlogPostPublished extends Notification
{
    public function __construct(private readonly BlogPost $post) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array{blog_post_id: string, title: string} */
    public function toArray(object $notifiable): array
    {
        return [
            'blog_post_id' => $this->post->id,
            'title' => $this->post->title,
        ];
    }
}
```

> ⚠️ **Correction, 2026-08-30 — `$this->post->title` does not exist after story
> [0078](0078-translatable-content-retrofit-blog-posts-backend.md).** The block above is left as
> written, because what replaces it is a *decision* and not a substitution. The shipped shape is:
>
> ```php
> /** @return array{blog_post_id: string, title: ?string} */
> public function toArray(object $notifiable): array
> {
>     return [
>         'blog_post_id' => $this->post->id,
>         // Store DEFAULT language, deliberately — never $notifiable's admin UI locale. See D-4a.
>         'title' => $this->post->translated('title'),
>     ];
> }
> ```
>
> Three things changed and each is load-bearing:
>
> - **`translated('title')` with no second argument** resolves the store default — 0070's signature is
>   `translated(string $field, ?string $storeLanguageId = null)`, and omitting the id makes *requested*
>   and *default* the same language. **Do not pass `null` explicitly to mean "any language"**; it means
>   the default, and there is no "any".
> - **The PHPDoc return type is `title: ?string`, not `title: string`.** `translated()` returns
>   `?string` and 0070's **D-6** makes never-throwing its central property, so `null` is reachable at
>   the type level. It should not occur in practice — 0070's **Q1(a)** (assumed by 0078) holds that
>   every entity always carries a default-language translation — but a Larastan level 7 gate reads the
>   declared type, not the assumption. See **D-4a** for what to do about the `null`.
> - **`$notifiable` stays unused**, exactly as it is today. Resolving per recipient is a real
>   alternative and it is rejected in **D-4a**, not overlooked.

- **`BlogPostPublished`, not `NewBlogPostPublished` or `BlogPostPublishedNotification`.** A statement
  of fact about what happened, matching `PendingEmailVerification` / `UserInvitation` /
  `CustomerCreated` / `OrderCreated`, per [naming.md](../../docs/conventions/naming.md#classes). No
  `Notification` suffix.
- **`['database']` only — no `mail`.** See **D-2**.
- **Not `ShouldQueue`.** See **D-3**, which is coupled to **D-9**.
- **Two keys, both immutable snapshots.** See **D-4**, including why `title` is frozen rather than
  joined live, and why `slug`, the category, the body, `published_at` and an author are each absent.
- **No `type` discriminator inside `data`.** Laravel's `DatabaseChannel` already writes the FQCN into
  `notifications.type`; a second copy inside the JSON is redundant state that drifts on a class rename.
- **No `lang/` file.** `data` stores structural values, never rendered copy — the copy is 0057's, in
  `lang/{en,es}/notifications.php`. Note this story adds **nothing** to `lang/{en,es}/blog.php` either;
  that file is 0061's, extended by 0062 and 0063.

### Recipient resolution + dispatch — `App\Actions\Blog\NotifyBlogPostPublished`

`app/Actions/Blog/NotifyBlogPostPublished.php` — **new**, invokable, imperative verb-phrase name with
no `Action`/`Service` suffix. It lands in `app/Actions/Blog/`, the **domain-area** folder 0058's
**D-14**, 0059 and 0061 all commit to — never an `app/Actions/Notifications/`, which has no precedent
in this repo and which [0056's **D-2**](0056-notification-viewing-backend.md) argued against creating
(*"a folder appears when a rule does"*). 0043 filed its notify action under `Actions/Customers/` and
0046 under `Actions/Orders/`; the subject here is a `BlogPost` and the rule ("who may currently view
the blog") is a blog-domain fact.

```php
public function __invoke(BlogPost $post): void
{
    // Default guard is `web` everywhere in this app; do not "simplify" this
    // against a second guard later.
    $recipients = User::permission('blog.view')->get();

    Notification::send($recipients, new BlogPostPublished($post));
}
```

- **No constructor.** Matching `NotifyCustomerCreated` / `NotifyOrderCreated` exactly: the action needs
  only two facade calls and has no collaborator to inject.
- **`User::permission('blog.view')` — Spatie's own scope, resolved at dispatch time.** It matches
  holders through a role *or* directly, and it is a live query, never cached or snapshotted, so a grant
  revoked a minute ago takes effect immediately. This is the "gate on permissions, never role names"
  convention applied to a recipient set rather than to an access check. **Verified: `blog` is in
  `RolePermissionSeeder::MODULES` and `ACTIONS` is the four CRUD verbs** (**V-2**), so `blog.view`
  exists today with zero seeder change.
- **The ability is `blog.view`, never `blog.create`/`blog.edit`.** The recipient set is "who may *look
  at* the blog", deliberately wider than "who may publish". Pinned by a dataset (**R-3**).
- **Soft-deleted administrators are excluded for free, and the story relies on that deliberately.**
  `User` uses `SoftDeletes`, so the scope is already on `User::query()`; no `whereNull` is written and
  none should be added.

### Listener — `App\Listeners\SendBlogPostPublishedNotification`

`app/Listeners/SendBlogPostPublishedNotification.php` — **new**, flat in `app/Listeners/`, matching
where the repo's only two listeners live (verified: `ActivateVerifiedUser.php`,
`RejectNonActiveUserLogin.php`, **V-4**). **A thin adapter and nothing else** — it unwraps 0064's event
and calls the action, so the notification logic has exactly one implementation regardless of which
trigger fired (**D-5**). The name is a facilitator ruling over `backend-expert`'s proposal; see
**D-6**.

```php
public function __construct(
    private readonly NotifyBlogPostPublished $notifyBlogPostPublished,
) {}

public function handle(ScheduledBlogPostPublished $event): void
{
    ($this->notifyBlogPostPublished)($event->post);
}
```

- **Not `ShouldQueue`** (**D-3**).
- **Constructor injection is forced by the framework here, not chosen** — the event dispatcher calls
  `handle()` with exactly one argument, the event, so there is no parameter slot a method-injected
  collaborator could occupy. This is a **third** shape beside
  [code-style.md](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method)'s
  documented two, and it is worth recording as such: the constraint is not "don't widen a public
  contract", it is "there is no signature to widen". **It is also this repo's first listener with a
  constructor at all** — both existing listeners are dependency-free (**V-4**).

### Registration — `app/Providers/AppServiceProvider.php`

**Modify.** One line inside the existing `configureEventListeners()` method:

```php
Event::listen(ScheduledBlogPostPublished::class, SendBlogPostPublishedNotification::class);
```

**This app does not use Laravel's event auto-discovery** — verified: there is no `EventServiceProvider`
and no `discoverEventsWithin()` call anywhere; `AppServiceProvider::boot()` registers every listener by
hand (**V-4**). Do not add auto-discovery for this one listener; it would be the first inconsistency in
an otherwise uniform mechanism.

**This edit has no analogue in 0043 or 0046** — both only ever added a *call*, never an event
registration, because neither had a second trigger arriving through an event. Called out explicitly so
Phase 2 does not read the file list as "the 0043 shape plus one" and miss it. It is also the failure
mode **R-6** describes: a correctly-written but unregistered listener is invisible to every faked test.

### The two manual dispatch sites — **story 0061's**, shipped, not this story's to write

> **This section changed ownership after OQ-1 was confirmed, and the change is recorded rather than
> quietly applied.** As originally specified, this story added a constructor-injected dependency and
> one call to `UpdateBlogPost` itself — a cross-story edit of the shape 0043 makes into 0041's
> `CreateCustomer`. **Story 0061 has since shipped both manual dispatch sites** (its revised
> **D-19**), so this story writes **no** application code outside `app/Notifications/`,
> `app/Actions/Blog/NotifyBlogPostPublished.php`, `app/Listeners/` and one `AppServiceProvider` line.
> What remains here is the **contract** those two sites bind to, and the properties this story's tests
> assert against them.

Both sites constructor-inject `NotifyBlogPostPublished` — never a widened `__invoke()` signature,
since both parameter lists are public contracts 0063 and every direct-call test match verbatim — and
both call it after the commit, on the success path only:

```php
// app/Actions/Blog/UpdateBlogPost.php — trigger 1, story 0061's D-19
$wasPublished = $blogPost->getRawOriginal('status') === BlogPostStatus::Published->value;

DB::transaction(function () use (…) { /* save + SyncBlogPostTags — 0061's D-15 */ });

if (! $wasPublished && $blogPost->status === BlogPostStatus::Published) {
    ($this->notifyBlogPostPublished)($blogPost);
}
```

```php
// app/Actions/Blog/CreateBlogPost.php — trigger 2, story 0061's D-19
if ($blogPost->status === BlogPostStatus::Published) {
    ($this->notifyBlogPostPublished)($blogPost);
}
```

**The two conditions are deliberately different, and that asymmetry is why the second trigger was
missable in the first place** (**OQ-1**): an update has a prior state to compare against, a creation
does not. `getRawOriginal('status')` read **before** the transaction is correct and is *not* the
[2026-08-17 errors-log trap](../../docs/errors-log.md#a-listener-read-the-pre-save-value-with-getoriginal-which-save-had-already-overwritten--2026-08-17) —
that trap is `getOriginal()` read **after** `save()`, which `finishSave()`'s `syncOriginal()` has
already overwritten. See **D-7** for the full four-way comparison, and **R-1** for the one residual
this shape does not close.

Three constraints on both calls, all load-bearing and all asserted by this story's tests:

1. **On the update path it fires on a transition *into* `Published`, never on "the post is
   `Published`."** `Draft`→`Published` and a manual `Scheduled`→`Published` both fire; a
   `Published`→`Published` re-save (an editor fixing a typo on a live post) fires **nothing**. **D-7**
   owns the mechanism and **R-2** owns why this is the highest-risk line in the feature. **On the
   create path the condition is the submitted status alone** — there is no transition to detect.
2. **After the persistence transaction commits — never inside it.** A rollback must not leave a
   notification announcing a publication that did not happen, per 0043's constraint 1 and
   [the `DB::transaction()` entry in errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21).
   No special ordering against `SyncBlogPostTags` is needed beyond this, since the tag sync is inside
   the same commit boundary the dispatch already waits for.
3. **After authorization and validation, on the success path only.** A refused or invalid save reaches
   no dispatch, which is what three of the Gherkin scenarios above assert.

- **`UpdateBlogPost` and `CreateBlogPost` are therefore un-`new`-able** — every test resolves them
  with `app(UpdateBlogPost::class)` / `app(CreateBlogPost::class)`, per
  [code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract).
  Both had other collaborators already, so neither gains its *first* constructor dependency here and
  no existing call site breaks.
- **No model event, no observer, anywhere in this feature.** See **D-11**.

⚠️ **Do not reach for `wasChanged()` on the create path.** `Model::performInsert()` never calls
`syncChanges()`, so `$changes` and `$previous` are both empty right after an insert (verified against
`laravel/framework v13.19.0`, **V-5**) — a dirty-state test there would silently never fire. A create
has no transition; the submitted status *is* the whole condition, which is what 0061 shipped.

### Consumed, not created by this story

- `App\Events\Blog\ScheduledBlogPostPublished` and its dispatch — story
  [0064](0064-scheduled-post-auto-publish-backend.md). **Consumed unchanged; this story adds no second
  dispatch on the automatic path and does not edit `PublishScheduledBlogPost`.**
- `App\Models\BlogPost`, `App\Enums\BlogPostStatus`, `App\Actions\Blog\RestoreBlogPost` — story
  [0061](0061-blog-posts-core-crud-backend.md).
- The `notifications` table and its `uuidMorphs('notifiable')` correction — story
  [0043](0043-customers-new-customer-notification-backend.md).
- `App\Models\User`'s `Notifiable` + `SoftDeletes` — Epic 1, verified at `HEAD` (**V-3**).

### Explicitly NOT in this story

The `notifications` migration (0043's) · any bell, dropdown or unread badge (0056/0057) · a
mark-as-read path or any write to `read_at` · a `config/modules.php` entry · `lang/` copy of any kind ·
browser tests · mail or broadcast channels · notification preferences or per-user opt-out · pruning or
retention · a second event class for the manual trigger (**D-10**) · any Eloquent observer (**D-11**) ·
any shared base class across the three producers (**D-13**) · any change to 0064's sweep, command,
schedule entry or event class · any change to `BlogPostPolicy`, `RolePermissionSeeder` or
`routes/**` · a notification on unpublish, delete, restore or force-delete.

## Tests to perform

Backend only — this story renders nothing, so there is no browser test. All four files land in
`tests/Feature/Blog/`, the folder 0061 and 0064 create (verified absent today, **V-6**).

> **Read this before writing any test here.** Three disciplines, one inherited from each upstream
> story and one new.
> **(a) Both the faked and the un-faked form are required** for at least one happy path *per trigger*
> — 0043's **R-1**: `Notification::assertSentTo` never touches the database, so it passes against a
> `morphs()`-shaped `notifiable_id` that cannot store the row at all. Here it earns its place for a
> **second** reason (**R-6**): a faked assertion also passes against a listener that was written
> correctly and never registered.
> **(b) The automatic path must be exercised with no authenticated actor.** 0064's **D-5** makes its
> sweep deliberately ungated; a test that calls `actingAs()` out of habit passes while proving nothing
> about the property that matters. Assert `Auth::check()` is `false` at the point the notification
> lands.
> **(c) New here — a "nothing was announced" assertion can pass for the wrong reason.** See the
> regression-proof requirement on the restore file below.
> **(d) Since OQ-1 was confirmed, "the manual trigger" is *two* code paths, not one.** Every
> manual-path assertion has to name which action it drives — `UpdateBlogPost` or `CreateBlogPost` —
> because their conditions are structurally different (**D-7**) and a test that exercises only the
> update path leaves the create path's single `if` completely uncovered. This is the specific gap that
> made trigger 2 invisible in the first place, so the test plan must not reproduce it.

**`tests/Feature/Blog/NotifyBlogPostPublishedTest.php`** (`RefreshDatabase`, direct-call against
`app(NotifyBlogPostPublished::class)`) — the shared action, written once, inherited by all three
triggers

- [ ] A user holding `blog.view` **through a role** is in the recipient set.
- [ ] A user holding `blog.view` **granted directly** (not via a role) is in the recipient set —
      `User::permission()` covers both, and a hand-rolled `whereHas('roles')` fails only this case.
- [ ] **The permission-typo dataset** — every one of these holders receives **nothing**:
      `blog.create`, `blog.edit`, `blog.delete` (right module, wrong verb) and `customers.view`,
      `orders.view`, `users.view`, `sales-regions.view` (right verb, wrong module). *Risk if missing:*
      see **R-3** — this is the **third** verbatim shape copy of one recipient query, written by
      someone who has just read `customers.view` and `orders.view` as templates, and a wrong string
      fails **closed and silently**: the wrong administrators are notified and nothing errors.
- [ ] A **soft-deleted** holder is not notified. Regression guard for a future `withTrashed()`.
- [ ] A **Super Admin** holding zero explicit grants is not notified — the recorded consequence of
      **D-1**, asserted rather than assumed.
- [ ] **Zero eligible recipients** is a clean no-op — no exception, no rows.
- [ ] **Recipients are resolved at dispatch time, not cached**: grant `blog.view` to a new role *after*
      the action has been resolved from the container, dispatch, and assert the new holder receives it.
      Grant it strictly after the first resolution, never in `beforeEach` (**R-10**).
- [ ] **The payload's exact key set** is `['blog_post_id', 'title']` — asserted as a set equality, never
      as a series of `toHaveKey()` calls, so a later silent addition or removal is caught (**D-4**).
- [ ] **`title` is a frozen snapshot**: dispatch, then rename the post, then assert the stored payload
      still carries the original title. *Risk if missing:* the whole of **D-4**'s snapshot argument is
      unpinned, and a "simplification" to store only the id and join at render time passes every other
      test in this file.

      > ⚠️ **Correction, 2026-08-30 — "rename the post" is now a write to a translation row, and this
      > case splits into three.** After story
      > [0078](0078-translatable-content-retrofit-blog-posts-backend.md) a rename goes through
      > `SetTranslation` against one `(post, store language)` pair, so the original one-line case cannot
      > distinguish the property it is meant to pin from two neighbouring ones:
      >
      > - **The snapshot is frozen** — dispatch, then rewrite the **default** language's title, then
      >   assert the stored payload still carries the original. This is the original case, retargeted.
      > - **The snapshot is the *default* language's, not another one's** (**D-4a**) — arrange a post
      >   translated into the default **and** a second store language with a *different* title, dispatch,
      >   and assert the payload carries the **default's**. *Risk if missing:* nothing else in this file
      >   distinguishes "resolved the default" from "resolved whichever row came back first", and a
      >   single-language fixture makes the two identical.
      > - **A translation in a non-default language is irrelevant to the payload** — dispatch, then
      >   rewrite the *second* language's title, then assert the payload is unchanged. The control that
      >   proves the first case is testing a snapshot rather than a lucky read.
      >
      > **Do not add a fourth case asserting a `null` title.** It is reachable at the type level and
      > unreachable by design (**D-4a**'s ⚠️), and a test that arranges a post with no default-language
      > translation is asserting that 0070's **Q1(a)** invariant is broken — which is 0070's test to
      > write, not this story's.

**`tests/Feature/Blog/ManualPostPublishedNotificationTest.php`** (`RefreshDatabase`, driven through
`app(UpdateBlogPost::class)` **and** `app(CreateBlogPost::class)`) — the transition matrix, plus the
create path

**This file is what makes 0065 different in kind from 0043/0046**, and `backend-qa` named it the
sharpest area in the story: a row creation has one "did it happen" question, a state transition has a
matrix in which the wrong direction must be provably silent. **Since OQ-1 was confirmed this file
covers both manual actions** — the update matrix below, then the three create rows, which are a
*different* condition rather than more of the same one.

**Update path — `app(UpdateBlogPost::class)`:**

| From → To | Fires? | Note |
| --- | --- | --- |
| `Draft` → `Published` | **once** | trigger 1, the primary manual path |
| `Scheduled` → `Published` (hand-published early) | **once** | permitted by `UpdateBlogPost`'s signature; missed entirely by a condition written as "was it a `Draft`?" |
| `Published` → `Published` (title/body/category/tags edited) | **never** | **the highest-risk row** — see **R-2** |
| `Published` → `Draft` (unpublish) | never | not a publication under any reading of the PRD |
| `Draft` → `Scheduled` | never | not published yet; that is trigger 3's job |
| `Draft` → `Draft` | never | no status change at all |
| `Scheduled` → `Scheduled` (date edited, still future) | never | never became `Published` |
| `Scheduled` → `Draft` (un-scheduled) | never | not a publication |

**Create path — `app(CreateBlogPost::class)`** (trigger 2, **OQ-1** confirmed):

| Created as | Fires? | Note |
| --- | --- | --- |
| `Published` | **once** | the whole of trigger 2; **the single row that would have been silently missing** had OQ-1 not been raised |
| `Draft` | never | a creation is not a publication |
| `Scheduled` | never | trigger 3 announces it when its time arrives, not now |

- [ ] One test per row in **both** tables, each asserting **both** `Notification::assertSentTo` /
      `assertNothingSent` **and** a real `notifications` row count.
- [ ] **The create-as-`Published` case is named as its own test and never folded into the update
      file's happy path.** *Risk if missing:* this is the exact coverage gap that let a whole trigger
      go unnoticed through two upstream stories' hand-offs — a suite that drives only `UpdateBlogPost`
      is green while `CreateBlogPost`'s `if` is never executed once.
- [ ] **A created-`Published` post fires exactly once, not twice.** Assert a row **count** of one per
      recipient, not merely presence: `CreateBlogPost` writes the row and then 0061's model hooks run,
      and "created published" is the one path where a second, accidental dispatch (an observer, a
      later `save()`) would be invisible to a presence assertion.
- [ ] **Name the `Published`→`Published` case after the trap, not generically** — e.g. *"editing an
      already-published post's title fires no second notification"*, never folded into a catch-all
      "no notification on edit". A reviewer skimming test names must see the specific trap named.
- [ ] **The positive `Draft`→`Published` case lives in this same file, above the negatives** — so a
      dead trigger mechanism fails loudly on the positive case before any negative case can pass
      vacuously (**R-10**).
- [ ] **Republication fires again**, as its own named test (**D-12**): `Draft`→`Published` (one row) →
      `Published`→`Draft` (still one row) → `Draft`→`Published` (two rows, two distinct
      notifications). *Risk if missing:* it looks superficially like the restore case, and a future
      maintainer conflating the two would "fix" it into a no-op.
- [ ] **The stale-instance race** (**R-1**) — ⚠️ **expected to FAIL against 0061's shipped shape, and
      that is the point of writing it.** With a post whose row was flipped to `Published` in the
      database *after* the in-memory instance was loaded, submitting `status: Published` through
      `UpdateBlogPost` should fire **nothing** — the scheduler already announced that transition.
      0061 ships `getRawOriginal('status')` with **no** re-read, and `getRawOriginal()` returns the
      hydration-time value, so the stale instance still reports `Scheduled` and a **second**
      notification goes out for one transition. Drive it by mutating the row directly
      (`DB::table()->update()`) after loading the model, so the instance genuinely lies. **Write the
      test, let it fail, and escalate to 0061 rather than working around it here** — the fix is one
      `$blogPost->refresh()` in 0061's action, and this story must not add a second, divergent guard
      of its own (**R-1**, and the ⚠️ under **D-7**).
- [ ] **Rollback — the highest-value single case, per both 0043 and 0046.** Force a failure inside
      `UpdateBlogPost`'s transaction *after* the status write, assert zero `notifications` rows and
      `assertNothingSent()`. *Risk if missing:* a dispatch moved inside the transaction — or above it —
      passes every other test in this file.
- [ ] **A refused save announces nothing**: an actor lacking `blog.edit` is refused by
      `UpdateBlogPost`'s own `Gate::authorize('update', …)` before any write.
- [ ] **A validation failure announces nothing.**
- [ ] **Un-faked**: at least one happy path asserts a real row with `notifiable_id` equal to the
      recipient's UUID and `type` equal to `BlogPostPublished::class`.
- [ ] **A refused or invalid *creation* announces nothing either** — an actor lacking `blog.create`,
      and a validation failure, both driven through `app(CreateBlogPost::class)`. The update path's
      equivalents are listed above; both actions need their own, because they authorize different
      abilities (`update` vs. `create`) and a single shared assertion would cover neither properly.
- [ ] **Rollback on the create path**: force a failure inside `CreateBlogPost`'s transaction after the
      row is written and assert zero `notifications` rows. Trigger 2's dispatch sits after that
      commit exactly as trigger 1's does, and the same "a dispatch moved inside the transaction passes
      every other test" reasoning applies unchanged.

**`tests/Feature/Blog/ScheduledPostPublishedNotificationTest.php`** (`RefreshDatabase`, driven through
0064's real sweep) — the automatic trigger, end to end

- [ ] A due `Scheduled` post swept by 0064 stores a notification for each `blog.view` holder.
- [ ] **The listener runs with no authenticated user** — no `actingAs()` anywhere in the file, and
      `Auth::check()` asserted `false`. *Risk if missing:* this is the transitive half of 0064's **D-5**
      and the only thing that catches a reflexive `Gate` call being added to the listener later.
- [ ] **Three due posts in one run produce three separate notifications per recipient, distinguishable
      by `blog_post_id`** — assert the *contents*, not merely a row count of three, which a batch-shaped
      implementation notifying one recipient about three posts would also satisfy (**R-10**).
- [ ] **Un-faked, and this is the file where it matters most**: driving 0064's real sweep through the
      real event dispatcher and finding a real `notifications` row is the **only** assertion in the
      whole story that proves the listener is actually **registered** in `AppServiceProvider`
      (**R-6**). `Event::fake()` and `Notification::fake()` both bypass the machinery that would
      fail.
- [ ] **Prove the registration assertion can fail**: comment out the `Event::listen(...)` line, confirm
      this test goes red, revert, and record that it was done — the same regression-proof discipline
      this repo's [vacuous-`arch()`-rule entry](../../docs/errors-log.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18)
      demands of any assertion that passes by default.

**`tests/Feature/Blog/RestoreBlogPostNotificationTest.php`** (`RefreshDatabase`, driven through
`app(RestoreBlogPost::class)`) — one case, its own file, deliberately

Split out because it is the single case **both** upstream hand-offs name by number as *the* trap
(0061's **D-20** hand-off, 0064's hand-off fact 5), and a reviewer arriving from either should find the
pinning test without reading anything else.

- [ ] Restoring a post that was `Published` before it was soft-deleted stores **no** notification.
- [ ] ⚠️ **This assertion is vacuous unless it is regression-proofed, and that is the point of the
      file.** Under the shipped design (**D-11**) `RestoreBlogPost` touches neither trigger, so
      `assertNothingSent()` passes because *no code path could ever have fired* — indistinguishable, in
      green output, from passing because a guard worked. **Temporarily wire the notification the wrong
      way** — an Eloquent `restored`/`saved` observer keyed on `status === Published`, which is exactly
      the implementation 0064's **D-12** warns against — confirm this test goes **red**, revert, and
      record it. Without that step this file is a tautology.
- [ ] Assert **both** that no `notifications` row exists **and** (via `Event::fake()` or a spy) that no
      `ScheduledBlogPostPublished` and no `NotifyBlogPostPublished` invocation occurred *as a
      consequence of the restore call itself*.

**Deliberately not tested** (per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)):

- **0064's own sweep behaviour** — that a due post flips, that `published_at` is not restamped, that a
  trashed post is skipped, that the boundary is `<=`, that three due posts dispatch three *events*.
  All of it is `PublishScheduledBlogPostTest.php` / `ScheduledBlogPostPublishedEventTest.php`'s, already
  specified there. This story consumes *the fact that the event dispatches* and asserts only what
  happens **downstream** of it.
- **0061's own behaviour** — status/`published_at` rules, the `after:now` resubmission trap,
  sanitization, tag sync, authorization. This story cares about exactly one bit: *did the status become
  `Published` on this call*.
- **The `notifications` migration's mechanics** (0043's; `RefreshDatabase` runs it every run) and the
  UUID generation of `notifications.id`.
- **Laravel's `DatabaseChannel` and `Notification::send()`'s per-recipient loop** — vendor, exercised
  *through* the dispatch as 0043/0046 do.
- **Unread counts and mark-as-read** — 0056's and 0057's.
- **Anything in `tests/Browser/`** — this story renders nothing to browse.

## Expected outcome

A blog post becoming `Published` — **published by hand through `UpdateBlogPost`, created already
published through `CreateBlogPost`, or going live on its own through 0064's scheduler** — stores one
`BlogPostPublished` database notification per administrator holding `blog.view` at that moment:
resolved live, excluding soft-deleted accounts, and excluding the Super Admin, whose `Gate::before`
bypass is an authorization construct that grants no `role_has_permissions` row for a data query to
match. The payload carries the post's identifier and its title as an immutable snapshot, and nothing
else.

All **three** triggers converge on **one** implementation, so the recipient set, the payload and the
eligibility rule cannot differ depending on how a post went live. Editing an already-published post,
unpublishing one, creating or scheduling a draft, restoring a deleted post, a refused save and a
rolled-back save all announce nothing. Republishing a post that was returned to draft announces it
again, deliberately (**D-12**).

This closes the **fourth and last** of the PRD's four confirmed notification events, and with 0056/0057
already in the backlog, the cross-cutting notification feature is fully owned end to end for the first
time. **Nothing changes on screen as a direct result of this story** — the observable outcome is a
`notifications` row and a passing `Notification::assertSentTo`; the bell that displays it is 0057's,
and until 0057 gains a third recognized-type arm this row renders through its generic fallback with no
link (**R-8**).

## Acceptance criteria

- [ ] `App\Notifications\BlogPostPublished` exists, uses the `database` channel **only** (no mail), is
      **not** `ShouldQueue`, and its `toArray()` returns exactly `blog_post_id` and `title`.
- [ ] `title` is stored as a **literal string snapshot** taken at publication, not an id the viewer
      joins on and not a relation read at render time (**D-4**).
- [ ] ⚠️ *(added 2026-08-30, Epic 5)* **That snapshot resolves in the store default language**, via
      `translated('title')` with **no** language argument, and the payload's declared type is
      `title: ?string` (**D-4a**). `$notifiable` is **not** consulted: a recipient's admin UI locale is
      Layer 1 and a post's title is Layer 2, and the two are unrelated by 0066's own text.
- [ ] ⚠️ *(added 2026-08-30, Epic 5)* **R-11 is recorded as open, not silently accepted.** On the
      `UpdateBlogPost` path a caller-supplied model with a pre-hydrated `translations` relation can
      freeze a **pre-edit** title, because `SetTranslation` writes through the relation method and does
      not refresh a loaded collection (0070's **R-5**). This story ships the failing test and escalates
      to 0061 — exactly as it does for **R-1** — and must **not** add a compensating re-read of its own.
- [ ] `App\Actions\Blog\NotifyBlogPostPublished` resolves recipients as
      `User::permission('blog.view')->get()` on the `web` guard, evaluated at dispatch time and never
      cached.
- [ ] Soft-deleted users are excluded by the existing `SoftDeletingScope`, **not** by a hand-written
      `whereNull`.
- [ ] A **Super Admin holding no explicit `blog.view` grant receives no notification** — a deliberate,
      documented, reversible decision (**D-1**), pinned by a test.
- [ ] `App\Listeners\SendBlogPostPublishedNotification` listens to
      `App\Events\Blog\ScheduledBlogPostPublished`, **contains no logic beyond unwrapping the event and
      calling the action**, and is registered explicitly in
      `AppServiceProvider::configureEventListeners()` (**not** by auto-discovery).
- [ ] **All three triggers call the same `NotifyBlogPostPublished` instance method with the same
      argument shape** — there is exactly one implementation of "who gets notified and with what"
      (**D-5**). No path-specific branch exists inside the action.
- [ ] **This story adds no dispatch on any path.** It does not edit
      `App\Actions\Blog\PublishScheduledBlogPost`, 0064's event class, `UpdateBlogPost` or
      `CreateBlogPost` — all four are shipped by 0064 and 0061. This story's only production files are
      the notification, the action, the listener and one `AppServiceProvider` line.
- [ ] **A post created already `Published` notifies administrators exactly once** (**OQ-1**,
      confirmed), and creating a `Draft` or a `Scheduled` post notifies nobody — each pinned by its own
      test driven through `app(CreateBlogPost::class)`.
- [ ] **Both manual dispatches** — 0061's, in `UpdateBlogPost` and `CreateBlogPost` — are verified to
      run via a constructor-injected `NotifyBlogPostPublished`, **after the transaction commits**, on
      the authorized and validated success path only. *Verified by this story's tests; implemented by
      0061* (**D-8**).
- [ ] **The update condition is a transition *into* `Published`**, computed from the row's pre-save
      status read **before** any mutation. **`getOriginal('status')` is never read after `save()`** —
      the [2026-08-17 errors-log trap](../../docs/errors-log.md#a-listener-read-the-pre-save-value-with-getoriginal-which-save-had-already-overwritten--2026-08-17)
      (**D-7**). **The create condition is the submitted status alone**, with no dirty-state read —
      `performInsert()` populates neither `$changes` nor `$previous` (**V-5**).
- [ ] A `Published`→`Published` re-save announces nothing, and each row of **both** matrices above has
      its own test.
- [ ] ⚠️ **R-1 is recorded as open, not silently accepted.** 0061's shipped condition reads
      `getRawOriginal('status')` with no re-read, so a stale in-memory instance can produce a second
      announcement of one transition. This story ships the failing test that proves it and escalates
      to 0061; it must **not** add a compensating guard of its own.
- [ ] **A restore never announces**, and the property holds **structurally** — no Eloquent observer,
      model event or generic "status is Published" hook exists anywhere in this story (**D-11**).
- [ ] Republication after an unpublish **does** announce again, and **no dedup column, flag or
      `first_published_at` is added** (**D-12**, subject to **OQ-2**).
- [ ] `App\Events\Blog\ScheduledBlogPostPublished` carries the **`BlogPost` model**, resolving 0064's
      **OQ-2** (**D-9**) — and the listener is correspondingly **not** `ShouldQueue` (**D-3**).
- [ ] **No migration, column, index, model, enum, permission, policy, route, Livewire component, Blade
      view, `lang/` key or `config/modules.php` entry is added.**
- [ ] **No shared base class, interface or registry** is introduced across `CustomerCreated`,
      `OrderCreated` and `BlogPostPublished` or their three dispatch actions — 0046's **D-6** revisit
      condition is evaluated and **not met** (**D-13**).
- [ ] **No notification-viewing UI is built**, and its absence is *not* an open question — 0056 and
      0057 own it.

## Definition of Done

- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] All **three** quality gates run **unscoped**, with each result recorded explicitly *including any
      that was not run*: `php artisan test` (not `--filter`), `vendor/bin/pint --format agent` (not
      `--dirty`), and **Larastan level 7** (`vendor/bin/phpstan analyse`). A record naming two of three
      is a record of two gates — see
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26).
- [ ] **The restore test and the listener-registration test were each *proven able to fail*** by the
      temporary-breakage step described in their entries, and both verifications are recorded.
- [ ] **Every claim this file makes about 0061's and 0064's shipped code is re-verified against `HEAD`
      before implementation** — `UpdateBlogPost::__invoke()`'s parameter list, its transaction
      structure, `CreateBlogPost`'s signature, and `ScheduledBlogPostPublished`'s property name are all
      taken from Phase-1 *text*, not from code that exists (**V-1**). Per
      [the deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23),
      a name in this file is a reading aid, never a locator.
- [ ] **`grep -rn "UpdateBlogPost" app/` at Phase 3**, not an assumption that one screen calls it — the
      shared-code lesson from
      [errors-log.md](../../docs/errors-log.md#a-scope-exclusion-named-screens-while-the-story-edited-a-class-those-screens-share--2026-08-24).
      Adding a side effect to a shared action is a capability grant to its **least**-privileged caller.
- [ ] Code reviewed (code-reviewer). **Point the review at D-7 and R-1 specifically**: that the pre-save
      status is captured before mutation off a re-read instance, that `getOriginal()` is not read after
      `save()`, and that nobody has "simplified" the branch to a bare post-save equality check.
- [ ] No security findings (appsec-auditor) — specifically: that the recipient query cannot be widened
      by caller-supplied input; that the payload leaks nothing beyond `blog_post_id` and `title`; that a
      dispatch cannot be triggered by an actor who failed the `blog.edit` gate; that the listener
      performs no `Auth`-dependent work a console process cannot satisfy (**D-3**, 0064's **D-5**); and
      **that the stale-instance race in R-1 cannot produce a duplicate announcement of one transition.**
- [ ] Documentation updated (docs-keeper):
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md#directory-structure) —
    `app/Notifications/` gains a fifth class, `app/Actions/Blog/` gains another, and `app/Listeners/`
    gains its **third** listener and its **first with a constructor**.
  - [`conventions/code-style.md`](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method) —
    **the injection rule's third shape**: a listener constructor-injects because the framework calls
    `handle()` with exactly one argument, so there is no signature to widen. Distinct from the
    documented `SetSalesRegionActive`-style exception, and worth its own sentence.
  - **No schema or migration doc change** — this story adds no column, table or migration, and
    [database/schema.md](../../docs/database/schema.md)'s `notifications` section is 0043's to write.
- [ ] **Hand-off recorded for story [0057](0057-notification-bell-ui.md)** (notifications bell UI),
      stated as the three facts it needs and nothing more:
      1. A third notification `type` now exists: `App\Notifications\BlogPostPublished`.
      2. Its payload is `{blog_post_id, title}`. A recognized arm would render the title and link to
         the post editor; **read the keys defensively**, never with a bare array offset, per 0057's own
         second constraint. ⚠️ *(amended 2026-08-30)* **`title` is the post's title in the store
         default language, frozen at publication, and it is nullable** (**D-4a**) — so 0057 renders it
         verbatim and must **not** re-resolve it against the viewer's admin UI locale or against the
         post's current translations. The defensive read 0057 already specifies covers the `null`; no
         0057 change is needed for this, and the story still needs none to be correct (fact 3 below).
      3. **0057 needs no change to be correct** — the row already renders through its permanent
         `default` arm. Adding a third arm is an *enhancement* (it gains a link), not a defect fix, and
         0057's fallback test must keep passing either way.
- [ ] Acceptance criteria met.

## Documented functional decisions

### D-1 — Recipients are every live holder of `blog.view`; the Super Admin is deliberately excluded

0043's **D-1** and 0046's **D-1**, applied — and restated for blog rather than merely cited, because a
reader must be able to check the reasoning against *this* domain.

`User::permission('blog.view')` is a **data** query against `role_has_permissions` /
`model_has_permissions`. The Super Admin's access comes from the `Gate::before` bypass documented in
[architecture/authorization.md](../../docs/architecture/authorization.md) — an authorization-layer
construct that grants **no rows** for any query to match — so a Super Admin falls out of the recipient
set for free, and the decision is to **leave it that way**. The bypass exists so the account that
administers the system is never locked out of it, not so that account receives routine editorial
awareness traffic. A Super Admin who wants to see new posts opens the blog list, which they can always
reach.

**The ability is `blog.view`, not `blog.edit`.** The recipient set is "who may *look at* the blog",
deliberately wider than "who may publish" — that is what a bell is for. This matters more here than in
either sibling: an organisation plausibly has read-only editorial stakeholders who never edit a post
and are exactly the people who want to know one went live.

**Cheaply reversible** (a `union` with holders resolved through `Role::superAdminName()`, never a
hardcoded role-name string), and pinned by a test so a future change is a visible decision rather than
a drift. **If the human reverses it, it must be reversed for 0043, 0046 and 0065 together** — a store
where new customers notify the Super Admin and published posts do not is worse than either consistent
answer.

### D-2 — Database channel only; no mail

`via()` returns `['database']` and nothing else. The PRD's requirement is a **bell** — an in-panel
indicator — and it says nothing about email. The argument is the same as 0043's and 0046's, with one
detail specific to this story: **the automatic trigger fires from a scheduled command running every
minute** (0064's **D-3**), so a mail channel would put an unattended cron process in charge of
outbound sends to every permission holder, with no opt-out, no throttle and no operator watching. A
`mail` channel remains a one-line addition to `via()` if the business ever asks — with a throttle
decision attached at that point, not now.

### D-3 — `BlogPostPublished` is not `ShouldQueue`, and neither is the listener

The only channel is `database`, so the entire "delivery" is a local `INSERT` per recipient. Queueing it
would write a `jobs` row (this app runs `QUEUE_CONNECTION=database`) to defer a write cheaper than the
job row itself, and would put the notification behind a worker that must be running for the feature to
work at all — turning a synchronous, assertable side effect into an eventual one every test would need
`Queue::fake()` to observe. The precedent in
[architecture/authentication.md](../../docs/architecture/authentication.md) cuts the same way:
`PendingEmailVerification` is queued because it performs an **outbound SMTP** call, while
`UserInvitation` deliberately is not. There is no outbound call here.

**This decision is coupled to D-9 and the two must move together.** A synchronous listener means there
is no serialization boundary, which is precisely the condition under which 0064's **OQ-2** recommends
carrying the model rather than the id. Making the listener `ShouldQueue` later without revisiting D-9
would reintroduce the staleness window that hedge names.

### D-4 — The payload is `blog_post_id` + `title`, and every exclusion is deliberate

```php
/** @return array{blog_post_id: string, title: string} */
```

- **`blog_post_id`** — the link key, exactly like `customer_id` / `order_id`.
- **`title` as a frozen literal snapshot**, not an id joined at render time. This is 0046's **D-5**
  applied, and it is *load-bearing here rather than theoretical*: `blog_posts.title` is
  administrator-editable after publication (0061's own Gherkin covers retitling a post), so a payload
  storing only the id would let a two-year-old bell entry silently re-render under a name that did not
  exist when the post went live. A notification is a record of what happened at the time; a later
  rename is a *new* fact.

  > ⚠️ **Correction, 2026-08-30 — the argument survives the retrofit and gets *stronger*; only the
  > column reference is wrong.** `blog_posts.title` no longer exists (story
  > [0078](0078-translatable-content-retrofit-blog-posts-backend.md)); read the sentence as
  > *"a post's title is administrator-editable after publication"*, which is now true one table over,
  > in `blog_post_translations`. The snapshot argument gains a second, independent reason it did not
  > have: a live join would have to re-resolve **which language** to render at every future page load,
  > against a store-language catalog that can itself change — a language can be added, or removed
  > without its content being deleted (0068's **D5**). A frozen string cannot drift under either.
- **Excluded — `slug`.** No consumer: 0061's scope fence rules out any public-facing blog route or
  archive, so there is no public URL a notification would build. 0057 links to the *editor*, which
  needs the id.

  > ⚠️ **Correction, 2026-08-30 — still excluded, and now excluded for a second reason.** After 0078
  > there is no single `slug`: each store language derives its own from its own title, and uniqueness is
  > scoped per language (0078's **D-2**, **D-4**). So including a slug would have needed the same
  > language choice **D-4a** makes for the title, for a value with no consumer at all. The original
  > "no consumer" reason is unchanged and is still the primary one.
- **Excluded — the category.** Not needed for a one-line entry, and visible the moment the
  administrator clicks through.
- **Excluded — `body` / an excerpt.** Arbitrary-length sanitized HTML in an immutable JSON column is
  content bloat and duplicates the canonical row.
- **Excluded — `published_at`.** Redundant with `notifications.created_at`, written in the same instant
  because the dispatch is synchronous (**D-3**) — the same "redundant state that can drift" 0043 rejects
  for a `type` discriminator.
- **Not excluded — an author, because there is none.** `blog_posts` carries **no author or `created_by`
  column** (0061's migration). Stated explicitly rather than silently omitted, so a reviewer comparing
  this payload with 0043's "id + name" does not go looking for where the author went.

**One honest divergence from 0043's stated reasoning, recorded rather than glossed.** 0043's **D-5** is
argued from **PII minimalism** — a customer's email is a sensitive value with a canonical home. A blog
post's title is not PII at all, so that argument does **not** transfer. What does transfer, and is the
actual reason here, is the *immutability* half: `notifications.data` has no update path and no backfill,
so **every key added is permanent for existing rows and every later addition produces a mixed-shape
column.** Additions must be deliberate. This is the same discipline 0064 applied when it recorded that
one of 0052's three safety properties did not transfer — adopt the decision, name the reason that
actually holds.

### D-4a — The frozen `title` snapshot resolves in the **store default** language *(2026-08-30)*

**Added because story [0078](0078-translatable-content-retrofit-blog-posts-backend.md) makes it
unavoidable, and its own R-1(c) refuses to decide it on this story's behalf** — *"recorded as a
coordination item because it is a **product** choice hiding inside a mechanical rename."* Once
`title` is per store language, `$this->post->title` has no single answer, and **D-4**'s entire snapshot
argument depends on the value being resolvable at dispatch time.

**Decision: `$this->post->translated('title')` — no language argument, so the store default.**
Recommended rather than confirmed; it is cheap to change before implementation and permanent after,
because `notifications.data` has no update path (**D-4**), so it belongs in the Phase 2 review beside
**OQ-2** and **OQ-5**.

**Why the store default:**

1. **It is the canonical authoring language.** 0078's **D-6** backfills every pre-existing post into the
   store default, 0070's **Q1(a)** (which 0078 assumes) holds that every entity always carries a
   default-language translation, and 0061's create path writes the default's row first. It is the one
   language a post is guaranteed to have.
2. **The fallback chain guarantees it resolves.** `translated()` returns requested → default → `null`,
   and with no requested language the first two collapse into one, so this is the *shortest* path to a
   value that exists. Any other choice reintroduces a `null` case that the store default does not have.
3. **It matches how every other Epic 5 story answered the same question.** This is the recurring
   *"which language does a backend-only artifact speak?"* question, and the batch has answered it
   consistently: 0066 resolves an outbound notification's locale through
   `LocaleSetting::defaultNotificationLocale()` rather than per-recipient guessing, and 0077/0027's
   **OQ-10** resolves list ordering against a single language rather than per-viewer. **A system-
   generated record picks one language and records it; it does not negotiate one.**
4. **The recipients are not the audience the content was written for.** This notification is
   admin-facing awareness traffic (**D-1**: every `blog.view` holder, deliberately wider than "who may
   publish"). It answers *"which post went live"*, and the default-language title is the name the
   editorial team uses for that post internally.

**Three alternatives, each rejected for a stated reason rather than overlooked:**

- **(b) The recipient's own admin UI locale, via `$notifiable`.** Technically available —
  `toArray(object $notifiable)` receives the recipient and `Notification::send()` writes one row per
  recipient, so per-recipient payloads are possible. **Rejected because it conflates Epic 5's two
  layers.** 0066 is explicit that Layer 1 (admin interface language, `UiLocale`, Spanish or English
  **only**) has *"no relationship"* to Layer 2 (store content languages, `StoreLanguage`, an
  administrator-configured catalog). A store language need not correspond to any UI locale at all, so
  the mapping this option needs does not exist. It would also make one publication produce N different
  frozen strings, so two administrators comparing bells would see two different records of one event —
  and **D-5**'s "one implementation of who gets notified and with what" would acquire its first
  per-recipient branch.
- **(c) Every language, as a map (`{es: …, fr: …}`).** Rejected on **D-4**'s own immutability rule: it
  makes the payload's shape depend on the store-language catalog *at write time*, so rows written
  before and after a language is added are permanently different shapes in a column with no backfill —
  the exact "mixed-shape column" **D-4** exists to prevent. 0057 reads these keys defensively but would
  still have to pick one to render.
- **(d) The language the post was *published in* / most recently edited in.** Rejected as a value that
  does not exist: publication is a parent-row state change (0078's **D-1** keeps `status` deliberately
  non-translatable), so no language is associated with it. The automatic trigger makes this obvious —
  0064's sweep has no actor, no request and no language context whatsoever.

⚠️ **The `null` case must be handled explicitly, not left to the type system.** `translated()` returns
`?string`, so `title` is `?string` in the payload. Store the `null` rather than substituting a
placeholder string: 0057's bell reads these keys defensively (its own second constraint) and a
placeholder would be untranslatable copy frozen into a data column, which is the "no `lang/` key"
scope fence. A `null` title is a real, if unreachable-by-design, state — and if it ever occurs it means
0070's **Q1(a)** invariant broke, which is a finding rather than something to paper over.

⚠️ **This decision does not travel to 0043 or 0046.** `CustomerCreated`'s name and `OrderCreated`'s
number are not translatable content and never become per-language, so **D-1**'s "reverse it for all
three together" rule does **not** apply here — this is the one payload choice in the three-producer
family that is blog-specific by construction. **D-13**'s no-shared-abstraction verdict is unaffected
and, if anything, reinforced.

### D-5 — One action, three callers; the listener is a thin adapter with no logic

`NotifyBlogPostPublished::__invoke(BlogPost $post): void` — the same signature
`NotifyCustomerCreated` / `NotifyOrderCreated` use, called **identically and with no branching** from
all three trigger sites:

```php
($this->notifyBlogPostPublished)($blogPost);           // inside UpdateBlogPost — 0061, trigger 1
($this->notifyBlogPostPublished)($blogPost);           // inside CreateBlogPost — 0061, trigger 2
($this->notifyBlogPostPublished)($event->post);        // inside the listener   — this story, trigger 3
```

**The three call sites are byte-identical in what they pass**, which is the property that matters:
every difference between the triggers lives in the *condition* that precedes the call, never in the
call itself. A reviewer who finds a `if ($createdRatherThanUpdated)` branch inside the action has found
a defect (**D-13**, **R-4**).

**The listener contains no logic beyond unwrapping the event.** No eligibility check, no recipient
query, no payload construction — all of that lives in the action, exactly once, so the recipient set,
the payload shape and the eligibility rule **cannot differ depending on how a post went live**. This is
the same "one implementation, many callers" shape `App\Actions\Auth\LogRefusedPrivilegedAttempt`
already has across eleven call sites in this repo.

⚠️ **This is the property `backend-qa` flagged as having no analogue in 0043/0046**, and it deserves
its own review line: those stories each have exactly one caller, so nothing could diverge. Here a
divergence — one path passing a stale instance, one path resolving a different ability — would be
invisible to either trigger's own test and would surface only as *"administrators get notified
inconsistently depending on how a post was published."* The mitigation is structural (one action) and
the review item is that nobody adds a second, path-specific branch inside it. See **R-4** for the half
this does **not** close.

### D-6 — The listener is `SendBlogPostPublishedNotification`, flat in `app/Listeners/` *(recorded dissent)*

**`backend-expert` proposed `App\Listeners\NotifyBlogPostPublished`** — the *identical basename* as the
action, on the argument that the identical name is the most honest description (it *is*
`NotifyBlogPostPublished`, reached from a different entry point), that this repo already tolerates
identical basenames disambiguated by namespace (`App\Livewire\Users\Index` /
`Roles\Index` / `SalesRegions\Index`), and that a distinct name would suggest a behavioural difference
that does not exist.

**The facilitator ruled against it**, on three points:

1. **The `Index` precedent is not the same shape.** Those three are one class *kind* in three module
   *areas*, and this repo's own convention mandates aliasing them at every import
   ([base-standards.md](../../docs/conventions/base-standards.md#directory-structure)'s route-file
   rule). Here the collision would be between two **different kinds of thing** in the same story, and
   the one line where it bites most is the registration itself —
   `Event::listen(ScheduledBlogPostPublished::class, NotifyBlogPostPublished::class)` reads as though
   the *action* is the listener, which is exactly the thing a reader must not conclude.
2. **The name should describe what the class does, and the listener does not notify** — it routes an
   event to the notifier. `Send…Notification` says that.
3. **It matches the shipped precedent.** Both existing listeners are imperative verb phrases
   (`ActivateVerifiedUser`, `RejectNonActiveUserLogin`) — verified at `HEAD` (**V-4**). Note this is
   also where [naming.md](../../docs/conventions/naming.md#classes)'s own text is imprecise: it says
   listeners are named *"as a statement about what happened rather than a command"* and then offers
   `ActivateVerifiedUser`, which is a command. **The shipped code is the convention**; the sentence is
   worth correcting at Phase 6.

**The dissent is recorded because it is not unreasonable** — the identical name genuinely does describe
the behaviour — and **Phase 2 may overrule this**. It is a naming call, cheap to change before
implementation and expensive after, which is precisely why it belongs in the INVEST review rather than
in a Phase 3 decision.

### D-7 — The manual trigger fires on a **transition into** `Published`, computed before any mutation

**This is the story's central implementation decision and the one a reviewer must not let be
"simplified".**

The naive condition — *"after the save, is `$blogPost->status === Published`?"* — is wrong, and wrong in
the specific way that ships green: it produces the *identical* result on the happy path
(`Draft`→`Published`), so every test that exercises only the intended transition passes either way. It
fails on the **second** save of an already-published post — routine, frequent, and it spams every
`blog.view` holder on every typo fix (**R-2**).

**What 0061 shipped** (verified by reading its revised **D-19**, not relayed):

```php
$wasPublished = $blogPost->getRawOriginal('status') === BlogPostStatus::Published->value;
// ... transaction ...
if (! $wasPublished && $blogPost->status === BlogPostStatus::Published) { … }
```

This is **correct against the trap that matters** — `getRawOriginal()` read *before* the transaction
returns the hydration-time value, not the just-written one — and it is what this story's tests assert
against. **It is not what this file originally specified**, which added a `$blogPost->refresh()`
first; the difference is **R-1** and is recorded there rather than silently reconciled.

**Why a pre-mutation read rather than `getOriginal()`/`getPrevious()`/`wasChanged()`, with all four
verified against `laravel/framework v13.19.0`** (**V-5**):

| Read | Correct? | Why |
| --- | --- | --- |
| `getOriginal('status')` **after** `save()` | ❌ **never** | `finishSave()` calls `syncOriginal()` unconditionally after every successful save, so "original" already holds the value just written. This is [the 2026-08-17 errors-log entry](../../docs/errors-log.md#a-listener-read-the-pre-save-value-with-getoriginal-which-save-had-already-overwritten--2026-08-17) verbatim, and `ActivateVerifiedUser`'s own docblock warns against it by name |
| `getPrevious()['status']` | ✅ correct | `syncChanges()` sets `$previous = array_intersect_key(getRawOriginal(), $changes)` inside `performUpdate()`, *before* `finishSave()` — this is the idiom `ActivateVerifiedUser` uses, and it is correct **for a listener**, which has no other way to see the pre-save value |
| `wasChanged('status')` | ✅ correct | reads the same `$changes` array |
| **`getRawOriginal('status')` read before the transaction** | ✅ **shipped by 0061** | `UpdateBlogPost` performs both the read and the write, so it does not have the listener's constraint at all — and reading *before* any mutation sidesteps `syncOriginal()`/`syncChanges()` ordering entirely |

**The pre-mutation read wins for two reasons.** It carries no ordering constraint —
`getPrevious()`/`wasChanged()` are replaced wholesale by `syncChanges()` on **every** dirty save, so
either would silently break if anything (a future `touch()`, a second `save()`, a hook) re-saved the
model between the write and the read. And `getRawOriginal()` reads the **hydration-time database
value**, so a caller who pre-dirties `$blogPost->status` in memory cannot forge the comparison — the
[model-instance-trust](../../docs/security/model-instance-trust.md) rule applied to the read side.

⚠️ **What it does *not* close is R-1**, and the two must not be confused: `getRawOriginal()` is
tamper-resistant against a *dirtied* attribute but not against a *stale* one, because both report the
value as of hydration. If the row moved in the database after the instance was loaded — which 0064's
every-minute sweep makes a live possibility — the read is honest about the wrong instant. The fix is
one `$blogPost->refresh()` above it, in 0061's action; see **R-1**.

⚠️ **The create path is different and must not copy this.** `performInsert()` never calls
`syncChanges()`, so `$changes`/`$previous` are empty right after an insert (**V-5**) — a dirty-state
test on a creation silently never fires, and `getRawOriginal('status')` on an unsaved model is
meaningless. A creation has no transition; its condition is `$status === Published` alone, which is
what 0061 shipped for trigger 2.

### D-8 — The dispatch is after the commit, on the success path only — **on both manual paths**

Constraint 2 and 3 of the dispatch sites above, stated as a decision so it is an acceptance criterion
rather than a comment. Both of 0061's actions wrap their writes in `DB::transaction()` (its **D-15**),
so both calls sit **after the closure returns**. A rollback must not leave a notification announcing a
publication that did not happen — and unlike 0046, there is a second thing to prove here: an in-memory
`status` that momentarily reads `Published` before the transaction aborts must not leak a dispatch,
which is what the two rollback tests pin.

> **This decision's *ownership* moved when OQ-1 was confirmed, and the boundary is worth stating
> plainly because it is unusual for this backlog.** These are the only cross-story constraints in this
> file that another story's shipped code already satisfies rather than promises to: 0061's **D-19**
> names the same after-the-commit rule, the same success-path-only rule, and cites the same
> [`DB::transaction()` errors-log entry](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21).
> **This story therefore verifies them rather than implementing them** — which is why the rollback
> cases stay in this story's test plan even though the code they guard is 0061's. A constraint nobody
> tests is a constraint that survives exactly until the next refactor of the file it lives in.

**No `order_number`-style third constraint exists here.** 0046 needed one because its payload snapshots
a value a retry loop could change after the commit; `blog_post_id` and `title` are both settled by the
time the transaction closes.

### D-9 — `ScheduledBlogPostPublished` carries the `BlogPost` model, not its id *(resolves 0064's OQ-2)*

0064 recorded this as *"genuinely 0065's call, since only it knows whether its listener queues."* It is
resolved here as **the model**, on two reasons:

1. **0064's action already holds one.** `PublishScheduledBlogPost::__invoke(): ?BlogPost` must re-fetch
   a model to satisfy its own declared return type, because **D-7**'s conditional `UPDATE` returns only
   an affected-row count. Attaching the instance it already has costs nothing; an id-only event would
   force this story's listener into a second `find()` purely to read `title` for the payload.
2. **The listener is not `ShouldQueue`** (**D-3**), so there is no `SerializesModels` round trip and no
   staleness window — which is the one condition under which 0064's own hedge preferred the id.

**These two decisions are coupled and must move together** (see **D-3**). This resolution requires **no
change to 0064**: it fixes an open choice in a story that has not shipped, rather than editing shipped
code.

> ⚠️ **Correction, 2026-08-30 — reason 1's "costs nothing" clause weakens, and the resolution stands.**
> After story [0078](0078-translatable-content-retrofit-blog-posts-backend.md), reading a title is not
> an attribute read: `translated('title')` reads the `translations` **relation** (0070's implementation
> reads `$this->translations`, the property), so a model arriving with that relation unloaded costs one
> lazy load. Carrying the model therefore spares the `find()` but **not** the relation load.
>
> **The decision is unchanged and is better supported than before**: an id-only event would cost this
> story's listener a `find()` **and** the same relation load, so the model still strictly dominates —
> the gap between the two options widened rather than closed.
>
> **Reason 2 is the one that now carries more weight than it did.** A non-queued listener means no
> `SerializesModels` round trip, and after the retrofit that matters for a second reason: `SerializesModels`
> re-fetches the model **without its relations**, so a queued listener would reload `translations` at
> handle time and snapshot whatever the title is *then* — silently converting **D-4**'s
> publication-time snapshot into a delivery-time read. **D-3** and this decision were already coupled;
> the retrofit makes the coupling load-bearing for payload *correctness*, not only for staleness.
> See **R-11** for the freshness question that remains open on the synchronous path.

### D-10 — No second event class for the manual trigger

`UpdateBlogPost` calls `NotifyBlogPostPublished` **directly, in-process**. It does **not** dispatch an
`App\Events\Blog\BlogPostPublished`.

An event exists to decouple a dispatcher from listeners it does not know about. Here the dispatcher and
the listener are the same story, synchronous, in one transaction's aftermath, with exactly one
consumer. 0064's justification for *its* event is specific and does not transfer: its write is a
query-builder `UPDATE` that fires **no model events at all**, so *nothing outside that action could
observe the transition* — an event was the only mechanism available. `UpdateBlogPost` performs an
ordinary `save()` and calls the action on the next line.

**The asymmetry is deliberate and will look odd**, so it is stated: one trigger reaches the notifier
through an event and the other by a direct call. That is a consequence of who owns which side of the
seam, not an inconsistency to "tidy". Adding a second event for symmetry would be ceremony with no
caller who needs it.

### D-11 — A restore never re-announces, and the property is structural

`RestoreBlogPost` (0061's **D-20**) calls `$blogPost->restore()` and nothing else. It never calls
`UpdateBlogPost`, never calls `NotifyBlogPostPublished`, and dispatches no event.

**The guarantee is the absence of a connection, not a guard that must remember to check something.**
This story registers **no Eloquent observer of any kind** — no `saved`, no `updated`, no `restored`, no
generic "status is `Published`" hook — so there is no shared code path a restore could reach. Both
upstream stories name this by number (0061's **D-20** hand-off, 0064's **D-12** reason 2 and hand-off
fact 5) precisely because an observer-based design is the *obvious* implementation and is provably
wrong: restoring a previously-published post fires `restoring`/`restored` while leaving `status` at
`Published`, so an observer keyed on either would re-announce a post subscribers already heard about.

⚠️ **A test asserting this can pass for the wrong reason** — see the regression-proof requirement on
`RestoreBlogPostNotificationTest.php`. The absence of an effect from a mechanism that was never
connected is indistinguishable, in green output, from a working guard.

### D-12 — Republishing after an unpublish announces again; no dedup state *(confirm via OQ-2)*

A `Published` → `Draft` → `Published` cycle fires the notification a **second** time. Both amigos
recommended this direction independently; `backend-expert` recorded it as a decision,
`backend-qa` flagged it as a product question. **Resolved as a decision here, and simultaneously
escalated as OQ-2**, because reversing it is not a one-line change.

**The reasoning for firing again:** an editor unpublishing to fix an error and republishing is a
legitimate editorial action, and *"the post is live again"* is a real, actionable fact each time it
happens. The PRD's confirmed event is *"a blog post is published"* — not *"published for the first
time"*. No PRD scenario, and nothing in 0061 or 0064, states or implies a first-time-only rule.

**Note this is the natural consequence of the *same* correct implementation that suppresses the
restore case** — not a hole in it. A restore is not a transition (`status` never changes); a
republication is two genuine transitions. **D-7**'s condition distinguishes them without a special
case, which is the strongest argument that it is the right condition.

**No dedup column is needed, and adding one would be scope this story was not asked for.** Both
triggers are independently exactly-once *per transition*: 0064's conditional `UPDATE` cannot re-match a
post whose status is no longer `Scheduled`, and **D-7**'s `! $wasAlreadyPublished` blocks a re-save.
The only way to get two notifications is two genuinely distinct transitions into `Published`.

**Reversing it costs a migration** — a `blog_posts.first_published_at` timestamp (or equivalent flag)
gating the dispatch, which is a schema change in a story whose whole premise is that it adds none. That
asymmetry is why it is escalated rather than merely recorded.

### D-13 — No shared abstraction across the three producers; 0046's revisit condition is evaluated and **not met**

0046's **D-6** set an explicit test: *"revisit only if a third event producer arrives and all three
differ by nothing but a permission string."* **This story is that third producer**, so the question is
answered here rather than deferred a third time.

**They differ by considerably more than a permission string:**

| | 0043 `CustomerCreated` | 0046 `OrderCreated` | 0065 `BlogPostPublished` |
| --- | --- | --- | --- |
| Trigger | row creation | row creation | **state transition** |
| Call sites | 1 | 1 | **2** (a listener and a direct call) |
| Payload keys | 2 | 3 | 2 |
| Ordering constraints | after commit | after commit **+ after `order_number` settles** | after commit **+ transition guard + fresh re-read** |

A shared base class would have to parameterise not just the permission string and the payload but *how
many and which kind of entry points call it* — which is not a generalisation of "swap a string". The
genuine duplication remaining across all three is still the same **four lines** it was at producer #2
(`User::permission(...)->get()` plus `Notification::send(...)`), and the two-trigger wrinkle makes blog
**more** different from its siblings than they are from each other. **The case for abstracting is
weaker at producer #3 than it was at producer #2**, which is the opposite of what the revisit condition
anticipated — recorded as an evaluated decision rather than a silent skip, so a fourth producer does
not re-ask it from scratch.

### D-14 — Gherkin for the automatic trigger follows 0064's D-14, unchanged

The scheduler scenarios name **the publication scheduler** in the `When` and carry the **blog editor**
in the `Given`. This story deliberately adopts 0064's convention rather than authoring a second one —
the "third idiom" hazard 0061's **D-13** warns about, avoided by following rather than arriving beside.
Note 0064 records that convention as **project-level** and flags it for its own Phase 2; if it is
overruled there, this file's scheduler scenarios change with it.

## Scope fences: what this story must NOT do

- **No migration, column, index or schema change of any kind**, and specifically **no dedup column**
  (**D-12**).
- **No permission, policy, ability or `RolePermissionSeeder` entry.** `blog.view` is already seeded
  (**V-2**); recipient resolution is a **data query**, never an authorization decision.
- **No `Gate` call and no `LogRefusedPrivilegedAttempt` call** in the notification, the action or the
  listener — there is no refusal to record, matching 0043/0046, and the automatic path has no actor at
  all (0064's **D-5**).
- **No second dispatch on the automatic path**, and **no edit to `PublishScheduledBlogPost`, 0064's
  command, its schedule entry or its event class** beyond 0064's own unresolved **OQ-2**, which
  **D-9** answers without changing shipped code.
- **No second event class for the manual trigger** (**D-10**).
- **No Eloquent observer, model event or `boot()` hook of any kind** (**D-11**).
- **No shared base class, interface or registry across the three producers** (**D-13**).
- **No mail or broadcast channel, and no `ShouldQueue`** on either the notification or the listener.
- No bell, dropdown, unread badge, route, Livewire component, Blade view, `config/modules.php` entry or
  browser test — 0056 and 0057 own the viewer, and this story does **not** reopen 0043's OQ-3.
- **No `lang/` key**, in `blog.php` or `notifications.php`. The payload is structural; the copy is
  0057's.
- **No `withTrashed()` anywhere.** Recipient resolution relies on the `SoftDeletingScope` doing its job.
- No notification on unpublish, delete, restore or force-delete.
- **No edit to `UpdateBlogPost` or `CreateBlogPost`.** Both dispatch sites are 0061's, shipped
  (**D-8**). If **R-1**'s failing test shows the update condition needs a `refresh()`, that fix lands
  in **0061**, not here — this story must not grow a second, divergent copy of the transition guard.

## Dependencies, risks and open questions

### Verified environment findings

Read or executed against this worktree, and against the sibling checkout's `vendor/` where this one has
none.

- **V-1 — Almost nothing this story depends on exists in code yet.** `app/Models/` holds only
  `Role.php`, `SalesRegion.php`, `User.php`; `app/Actions/` holds only `Auth/`, `Fortify/`, `Roles/`,
  `SalesRegions/`, `Users/`; `app/Events/` **does not exist**; `database/migrations/` has nothing
  blog-related and **no `notifications` migration**. 0043, 0046, 0056, 0057, 0058, 0059, 0061 and 0064
  are all Phase-1 task files, not shipped code. This story's dependency is on their *specifications* —
  the same position 0064 is in relative to 0061, and 0046 relative to 0043/0045.
- **V-2 — `blog.view` already exists.** `RolePermissionSeeder::MODULES` contains `'blog'` and
  `ACTIONS` is `['view', 'create', 'edit', 'delete']` — verified by reading the real file. **Zero
  seeder change.**
- **V-3 — `App\Models\User` is ready and unchanged by this story.** It already carries `Notifiable`,
  `SoftDeletes`, `HasRoles` and `HasUuids` on one `use` line. `app/Notifications/` holds exactly two
  classes today.
- **V-4 — This app registers listeners by hand and has no listener with a constructor.**
  `app/Listeners/` holds `ActivateVerifiedUser.php` and `RejectNonActiveUserLogin.php`, both
  dependency-free plain classes; `AppServiceProvider::boot()` calls `configureEventListeners()`, which
  contains three explicit `Event::listen(...)` calls. There is **no** `EventServiceProvider` and no
  `discoverEventsWithin()` anywhere in the tree.
- **V-5 — The dirty-state mechanics in D-7 were verified by reading `laravel/framework v13.19.0`, not
  reasoned.** `Model::performUpdate()` calls `syncChanges()` inside its `tap()` and `finishSave()`
  calls `syncOriginal()` afterwards; `syncChanges()` is `$this->changes = $this->getDirty();
  $this->previous = array_intersect_key($this->getRawOriginal(), $this->changes);`. `performInsert()`
  never calls it. `ActivateVerifiedUser`'s own docblock states the same chain independently and warns
  against "fixing" it back to `getOriginal()`.
- **V-9 — Story 0061's two dispatch sites were verified by reading its file, not by relaying the
  hand-off.** Its revised **D-19** (*"Publishing notifies, and there are **three** triggers, not two"*)
  carries both code blocks, records the reversal of its own earlier "this story fires no notification"
  text, and credits this story with finding the gap. The update path reads
  `getRawOriginal('status')` **before** the transaction; the create path tests the submitted status
  alone. **Neither includes a `refresh()`** — which is **R-1**, still open.
- **V-6 — `tests/Feature/Blog/` does not exist yet** (0061/0064 create it), and `tests/Feature/`
  currently mirrors `app/` with `Actions/`, `Auth/`, `Authorization/`, `Models/`, `Navigation/`,
  `Policies/`, `Roles/`, `SalesRegions/`, `Seeders/`, `Settings/`, `Users/`.
- **V-7 — `Model::fresh()` uses `newQueryWithoutScopes()`.** Verified at v13.19.0
  (`Model.php:2070`). **This matters for D-7 and is easy to get wrong:** `fresh()` re-reads the row's
  true current status, which is exactly what **R-1** needs — but it does **not** re-apply the
  `SoftDeletingScope`, so it will happily return a *trashed* row rather than `null`. Do not read the
  fresh re-read as a soft-delete guard; it is not one. (In practice a trashed post cannot reach
  `UpdateBlogPost` because the caller resolves the target through a default, scoped query — but that
  protection lives in the *caller*, not in `fresh()`.)
- **V-8 — 0057's bell branches on `type` in the view only, with a permanent `default` arm**, and its
  recognized-type table lists two arms (`CustomerCreated`, `OrderCreated`). Verified by reading 0057's
  own file. This is what makes **R-8** a hand-off rather than a defect.

### Dependencies

| Depends on | State | Why |
| --- | --- | --- |
| [0043](0043-customers-new-customer-notification-backend.md) — new-customer notification | **hard, `new`** | Owns the `notifications` table and its `uuidMorphs('notifiable')` correction. This story adds **no** migration and cannot run one Feature test without it |
| [0061](0061-blog-posts-core-crud-backend.md) — blog posts core CRUD | **hard, `new`** | Owns `BlogPost`, `BlogPostStatus`, `BlogPostFactory`, `RestoreBlogPost`, and — since **OQ-1** was confirmed — **both manual dispatch sites**, `UpdateBlogPost` and `CreateBlogPost` (its revised **D-19**, **V-9**). The coupling is now one-way: 0061 calls this story's action, and this story edits nothing of 0061's |
| [0064](0064-scheduled-post-auto-publish-backend.md) — scheduled auto-publish | **hard, `new`** | Owns `App\Events\Blog\ScheduledBlogPostPublished` and the only automatic transition. **D-9** resolves its **OQ-2** |
| [0078](0078-translatable-content-retrofit-blog-posts-backend.md) — translatable-content retrofit (Epic 5) | **hard once it lands, `new`** *(added 2026-08-30)* | Removes `blog_posts.title` and supplies `BlogPost::translated()`, which **D-4a**'s payload calls. Ordering is one-directional but **either order works**: if 0078 ships first this story is written against `translated()` from the outset; if this story ships first, 0078's retrofit changes one line here and the amendments above describe the end state. What must **not** happen is this story implementing `$post->title` after 0078 has landed — the property would be undefined and the payload would silently store `null` on a `?string` type. Transitively brings [0068](0068-store-languages-catalog-backend.md) (`StoreLanguage`) and [0070](0070-translatable-content-mechanism-product-categories-backend.md) (`HasTranslations`) |
| [0058](0058-blog-categories-backend.md) / [0059](0059-blog-tags-backend.md) | **transitive, via 0061** | No direct use |
| [0046](0046-orders-new-order-notification-backend.md) | **not a dependency** | This story copies its *shape*, not its code. Sequencing is free either way |
| [0056](0056-notification-viewing-backend.md) / [0057](0057-notification-bell-ui.md) | **not a dependency, either direction** | 0056's **D-5** means the bell needs zero change for a new producer — verified for this payload (**R-8**) |
| `blog.view` in the seeded catalog | **shipped** | **V-2** — no seeder change |
| `App\Models\User` `Notifiable` + `SoftDeletes` | **shipped** (Epic 1) | **V-3** — no model change |

Per the [task ordering rule](../../docs/workflow.md#task-ordering-rule) the numbering is already correct
(0043 < 0061 < 0064 < 0065); what must be enforced is the **sequencing**.

### Risks

- **R-1 — A stale in-memory `BlogPost` can double-announce one transition. `backend-expert`'s sharpest
  finding, and it has no analogue in 0043 or 0046.** `UpdateBlogPost` accepts a caller-supplied model —
  in practice one 0063's Livewire component loaded when the editor opened the form and has held across
  the round trip. An administrator opens the editor on a `Scheduled` post seconds before its publish
  time; 0064's scheduler ticks and publishes it; the administrator then saves the form with
  `status: Published`, confirming what already happened. If `$wasAlreadyPublished` is read off the
  stale instance (still `Scheduled`), a **second** notification fires for a transition the scheduler
  already announced. This is
  [security/model-instance-trust.md](../../docs/security/model-instance-trust.md)'s exact failure class
  — *a caller-supplied model instance is untrusted for a decision the action makes on its behalf* —
  and neither `CreateCustomer` nor `CreateOrder` has a second, independently-atomic writer racing the
  same row. ⚠️ **This is OPEN against 0061's shipped code, and that changed after OQ-1 was confirmed.**
  This file originally specified a `$blogPost->fresh()` above the comparison, which closed it; the
  shape 0061 shipped reads `getRawOriginal('status')` with **no** re-read. That is correct against the
  *dirtied*-attribute half of the problem (it reads the hydration-time database value, so a caller
  cannot forge it) and **does nothing about the *stale*-instance half** — both report the value as of
  hydration. **The fix is one `$blogPost->refresh()` at the top of 0061's `UpdateBlogPost`, and it
  belongs to 0061**; the remedy deliberately stays a plain re-read rather than `lockForUpdate()` inside
  a transaction, since the failure mode is a duplicate announcement, not a corrupted invariant like
  `is_default`. This story ships the test that proves it (expected red) and escalates. **Named for
  `appsec-auditor` and for Phase 2 — it is the one item in this file that a reviewer must not read as
  closed.**
- **R-2 — The `Published`→`Published` re-save. `backend-qa` named this the highest-risk line in the
  story.** The naive post-save equality check produces the *identical* result on the happy path, so
  every test that exercises only `Draft`→`Published` passes either way; the bug appears on the second
  save of a live post and spams every `blog.view` holder on every typo fix. Structurally the same shape
  as the `getPrevious()` errors-log entry: reading post-save state instead of the pre→post *delta*.
  Mitigated by **D-7**, its own named test, and a code-review line.
- **R-3 — A copy-paste permission string, and this is the third copy.** `customers.view` or
  `orders.view` surviving into `NotifyBlogPostPublished` fails **closed and silently** — the wrong
  administrators are notified and nothing errors. The risk is materially higher here than it was for
  0046, because whoever implements this will have just read both sibling files as templates. Mitigated
  by the seven-case negative dataset.
- **R-4 — Three triggers, one notifier, but no single shared *guard* — and OQ-1 widened this rather
  than closing it.** **D-5** guarantees one implementation of *who gets notified*; it gives the three
  paths **no** shared implementation of *when*. They are now three structurally different conditions:
  0064's conditional `UPDATE`, 0061's `getRawOriginal()` comparison, and 0061's bare status check on
  create. A future refactor of any one must independently preserve "only on an actual publication".
  Deliberately **not** closed by a cross-trigger abstraction, which would be exactly the premature
  generalisation **D-13** declines — but note the *count* of things that must stay in step went from
  two to three, and the third was invisible to everyone until this story's Phase 1. A code-review
  checklist line, not a design change.
- **R-5 — One shared-provider edit; the cross-story edits are gone.** `AppServiceProvider` is shared by
  the whole app, so if another story is in flight when this reaches Phase 3 the edits must not be made
  by concurrent agents, per the [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule).
  **The two `app/Actions/Blog/` edits this risk originally named are no longer this story's** — 0061
  ships both (**D-8**, **V-9**), which removes the story's largest coupling and is the main practical
  benefit of having raised OQ-1 before implementation rather than after.
- **R-6 — An unregistered listener is invisible to every faked test.** A correctly-written listener
  with a missing `Event::listen(...)` line produces no error anywhere: the direct-call action test
  passes, `Notification::fake()` passes, `Event::fake()` passes, and the automatic trigger simply never
  fires in production. **The only assertion that catches it** is the un-faked, real-dispatch test in
  `ScheduledPostPublishedNotificationTest.php`, which is why that file carries the prove-it-can-fail
  step.
- **R-7 — This document goes stale while it waits, behind at least three unimplemented stories.**
  Mitigation: the Phase 2 INVEST review must be **re-run immediately before Phase 3** rather than
  treated as passed on first reading, and every signature quoted here must be re-verified against
  shipped code — `UpdateBlogPost::__invoke()`'s parameter list and transaction shape,
  `CreateBlogPost`'s signature, and `ScheduledBlogPostPublished`'s property name (`$post` is this
  file's assumption, from 0064's text) are all reading aids, not locators.
- **R-8 — The bell will render this notification without a link until 0057 gains a third arm.**
  Verified (**V-8**), and **correct by 0057's own design** — its `default` arm is *"permanent,
  load-bearing behaviour, not a placeholder."* 0056's **D-5** claim that a new producer needs *zero
  change* is confirmed for the **backend** mechanism (nothing in the query, count or mark-as-read path
  branches on `type`, and this story adds no code there at all). Recorded as a hand-off to 0057 rather
  than pulled into scope, so nobody reads a linkless bell row as a bug in this story.
- **R-9 — Unbounded row growth with no pruning.** Every publication writes N rows. Lower volume than
  orders and negligible at backoffice scale; `model:prune` is deliberately not wired, consistent with
  0043's **R-3** and 0046's **R-5**. Recorded so it is a known consequence rather than a surprise.
- **R-11 — A stale `translations` relation can freeze a pre-edit title *(2026-08-30)*.** New with story
  [0078](0078-translatable-content-retrofit-blog-posts-backend.md), and it is the answer to *"is the
  snapshot taken at a fixed enough point?"* — which turns out to be **yes on two triggers and
  not-provably-yes on the third**, so it is recorded rather than asserted either way.

  **The queueing half is settled and is not the risk.** Neither the notification nor the listener is
  `ShouldQueue` (**D-3**), so `toArray()` runs synchronously inside `Notification::send()`, in the same
  request or the same cron tick as the publication. There is no window between "the post was published"
  and "the payload was built" for anything to change in. Construction-time is dispatch-time here, and
  **that remains true after the retrofit** — a queued listener would break it (see the amended **D-9**),
  which is one more reason not to make one.

  **The risk moved to the relation, not the clock.** `translated()` reads the already-loaded
  `translations` collection rather than re-querying (0070's **R-4** makes that deliberate — it is what
  keeps a list render bounded). So the payload is only as fresh as the relation on the instance handed
  to the notification, and 0070's **R-5** records the exact failure: `SetTranslation` writes through
  `$translatable->translations()->updateOrCreate(...)` — the relation **method** — which does **not**
  refresh an already-hydrated `translations` collection. Per trigger:

  | Trigger | Instance handed to the notification | Freshness |
  | --- | --- | --- |
  | 3 — 0064's sweep | re-fetched after the conditional `UPDATE` to satisfy `?BlogPost` (0064's **D-7**), relations unloaded | ✅ safe by construction — the lazy load reads current rows |
  | 2 — `CreateBlogPost` | just created in the same call; the default-language translation is written in the same transaction | ✅ safe — nothing could have loaded a stale collection first |
  | 1 — `UpdateBlogPost` | **caller-supplied**, and the same call may have just rewritten the title through `SetTranslation` | ⚠️ **unproven** — if the caller (0063's editor component) passed a model with `translations` eager-loaded, the notification can snapshot the **pre-edit** title of a post that was retitled and published in one save |

  **This is R-1 one table down, and the two are related but not the same.** **R-1** is about a stale
  *parent* attribute producing a duplicate announcement; this is about a stale *child relation*
  producing a correct announcement with wrong content. They have the same root cause — a caller-supplied
  instance trusted for a value the action reads later,
  [security/model-instance-trust.md](../../docs/security/model-instance-trust.md)'s failure class — and
  0061's `$blogPost->refresh()` (its **D-19a**, and **R-1**'s proposed fix) would close **both**, since
  `refresh()` reloads loaded relations too. **But only if it runs after the translation write, and
  0078's D-12 puts it first**, as `UpdateBlogPost`'s literal first statement. So the fix for **R-1** does
  **not** automatically fix this one.

  **Not closed here, deliberately, and not by a guard of this story's own** — the same reasoning
  **R-1** already carries: the fix is one `->load('translations')` (or a `refresh()`) between the commit
  and the dispatch, it belongs in **0061's** `UpdateBlogPost`, and adding a compensating re-read inside
  `NotifyBlogPostPublished` would give this story a second, divergent copy of a rule **D-5** exists to
  keep single. **Write the test, expect it to fail on trigger 1, and escalate** — mirroring exactly how
  **R-1** is handled. The test: load a post, retitle **and** publish it in one `UpdateBlogPost` call
  with `translations` pre-hydrated, then assert the stored payload carries the **new** title.

  ⚠️ **Named for Phase 2 and for `appsec-auditor` alongside R-1**, and worth one sentence on why it is
  not merely cosmetic: the notification is the *permanent* record (**D-4** — no update path, no
  backfill), so unlike a stale render it cannot be corrected by reloading the page.
- **R-10 — Several assertions in this plan can pass vacuously.** `backend-qa` enumerated them and each
  carries its prove-it-can-fail step in the test list: the restore assertion (no path was ever
  connected), every "fires nothing" row (a dead trigger passes all of them at once — mitigated by
  keeping the positive case in the same file, above them), the resolve-at-dispatch-time case (grant the
  permission strictly *after* the first resolution), and the three-posts case (assert distinct
  `blog_post_id`s, not a row count of three, which a batch-shaped implementation also satisfies).

### Open questions

**OQ-1 — ✅ CLOSED, CONFIRMED. A post *created* already `Published` is a third trigger, and story 0061
now ships its dispatch.** *(Facilitator's finding; neither amigo raised it, and neither upstream
hand-off accounted for it.)*

**The question was:** `CreateBlogPost::__invoke(..., BlogPostStatus $status, ...)` accepts `Published`
(0061's own signature), and 0063's editor exposes the status select on the create form — so an editor
can write a post and publish it on the **first** save, never passing through `UpdateBlogPost` and never
being touched by 0064's sweep. Both 0061's original hand-off (*"two triggers, not one"*) and 0064's
(*"0065 has two triggers"*) missed it, while the PRD's confirmed event is *"a blog post is
published"*, which this plainly is.

**The resolution:** option **(a)**, as recommended — cover it. **Story 0061 revised its own D-19**
(*"Publishing notifies, and there are **three** triggers, not two"*), recorded the reversal of its
earlier "this story fires no notification" text rather than overwriting it, and shipped **both** manual
dispatch sites with the two structurally different conditions **D-7** describes. Verified by reading
0061's file rather than relayed (**V-9**).

Two things worth keeping from how this resolved, since neither is obvious from the outcome:

- **The fix landed in the *upstream* story, not this one.** The natural instinct was to add a third
  dispatch site here as a second cross-story edit; instead 0061 took ownership of both, which is why
  this story now writes no code outside its own four files (**D-8**, **R-5**). *A missing trigger is a
  gap in the action that performs the operation, not in the story that consumes it.*
- **It was found by reading a signature, not by reading a hand-off.** Both hand-offs said "two", and
  both were written by careful authors; what disagreed with them was `CreateBlogPost::__invoke()`'s
  own parameter list. **An enumeration in a hand-off is a claim to check against the code it
  describes** — the same rule this repo's
  [deferred-findings entry](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)
  states for stale findings, arriving here as an under-count rather than as staleness.

*(Option (b), leaving it out, was rejected because it leaves an unobservable hole — the most natural
way to publish a short post is to write it and publish immediately, and that would have notified
nobody with no error. Option (c), forbidding creation as `Published`, was rejected outright: it solves
a notification question by amputating an editorial one.)*

**OQ-2 — Confirm D-12: does republishing after an unpublish announce again?** **Recommended: yes, as
specified _(recommended)_** — both amigos agreed on the direction, it is the natural consequence of the
same condition that correctly suppresses a restore, and no PRD text implies a first-time-only rule.
Escalated rather than merely recorded because **reversing it costs a migration**
(`blog_posts.first_published_at` or a flag) in a story whose premise is that it adds no schema — so it
is far cheaper to confirm now than after implementation. `backend-qa` explicitly asked for it to be a
product decision; `backend-expert` treated it as settled. Recorded both ways.

**OQ-3 — Should a `suspended` or `inactive` administrator receive notifications? Inherited from 0043's
OQ-1; **not** a new question.** **Same default: notify them (no status filter) _(recommended)_** — a
notification is a record, not access, and `users.status` is enforced at sign-in
([architecture/authentication.md](../../docs/architecture/authentication.md)). If the human overrides
it, **all three producers change identically** — one `->where('status', …)` clause each — and they must
not diverge.

**OQ-4 — Should the administrator who published the post be notified of their own action? Inherited
from 0043's OQ-2.** **Same default: no self-exclusion _(recommended)_** — it keeps the recipient rule a
single query with no actor parameter, avoiding the caller-supplied-state shape
[errors-log.md](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20)
warns about. **The argument is stronger here than in either sibling**: the automatic trigger has **no
acting administrator at all** (0064's **D-5** — a cron tick reads no actor), so a self-exclusion branch
would be dead code on half of this story's paths by construction.

**OQ-5 — The listener's name (D-6's dissent).** Not blocking; flagged for Phase 2 because it is cheap
to change before implementation and expensive after.

## Resolved in the debate

Recorded so they are not re-opened. Each was a real question at the start.

1. **Does 0065 add a second dispatch on the automatic path?** **No** — a listener only. 0064's **D-12**
   and hand-off fact 3 are explicit, and its conditional `UPDATE` fires no model events, so the
   dispatch *had* to live there.
2. **Does the event carry the model or the id?** **The model** (**D-9**), resolving 0064's **OQ-2**,
   coupled to the listener not being queued.
3. **One implementation or three?** **One** — `NotifyBlogPostPublished`, called identically from all
   three sites, with the listener a logic-free adapter (**D-5**).
4. **Where does the notify action live?** `app/Actions/Blog/`, never `app/Actions/Notifications/` —
   the domain-area rule, 0043's and 0046's precedent, and 0056's **D-2**.
5. **How does the manual trigger detect the transition?** A pre-mutation read — never `getOriginal()`
   after `save()` (**D-7**, verified at **V-5**). 0061 shipped `getRawOriginal('status')` before the
   transaction, which is correct on that axis; the **stale-instance** axis is **R-1** and is open.
5a. **Is "published at creation" a trigger?** **Yes** — **OQ-1**, confirmed, and 0061 ships its
   dispatch (**V-9**). The count is three, not two.
6. **Does a restore re-fire?** **No, structurally** — no observer of any kind exists in this design
   (**D-11**). And the test for it must be regression-proofed or it is a tautology.
7. **Does republication re-fire?** **Yes, deliberately** (**D-12**), with **OQ-2** confirming.
8. **Is this the third producer that triggers 0046's abstraction revisit?** It is the third producer,
   and the condition is **not met** — they differ by trigger kind, call-site count, payload and
   ordering constraints, not by a permission string (**D-13**).
9. **Does 0056's "zero change for a new producer" claim hold?** **Yes for the backend mechanism**,
   verified — and 0057's bell renders this row through its permanent fallback with no link until it
   gains a third arm (**R-8**, **V-8**). Recorded as a hand-off, not a gap.
10. **Does the story reopen 0043's OQ-3 (the missing viewer)?** **No.** 0056 and 0057 exist. One
    cross-cutting gap, tracked once, now closed.

## Provenance

- **PRD source:** [§ Cross-cutting: global search & notifications](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications)'s
  fourth confirmed event — *"**Blog post published**, or a **scheduled post going live**"* — and
  [Epic 4](../../docs/PRD/PRD.md#epic-4--blog).
- **Process:** [workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate) Phase 1, run on
  2026-08-27 with `backend-expert` and `backend-qa` convened as subagents, composed by `product-owner`
  as facilitator. **No `database-expert`** — see the Type section.
- **Sibling stories this one copies the shape of:**
  [0043](0043-customers-new-customer-notification-backend.md) (the template and the `notifications`
  table's origin) and [0046](0046-orders-new-order-notification-backend.md) (the second producer, which
  copied 0043 without a shared base class). This is the **third**, and 0046's **D-6** named it by
  number as the point at which the abstraction question must be re-asked — it is asked and answered in
  **D-13**.
- **Upstream contracts:** [0061](0061-blog-posts-core-crud-backend.md)'s **revised D-19** and its 0065
  hand-off (the two manual triggers, and the restore constraint), and
  [0064](0064-scheduled-post-auto-publish-backend.md)'s **D-12**, **OQ-2** and its five-fact hand-off
  (the automatic trigger). **0061's D-19 was revised at this story's request**, after this file's
  **OQ-1** found a trigger its original text denied — so the contract this story consumes is partly a
  product of this story, which is worth knowing when reading the two files side by side.
- **Gherkin conventions:** [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md)
  rules 1 and 3, plus 0064's **D-14** for the system-actor scenarios (**D-14**).

**Both amigos' contributions are reflected above.** `backend-expert` supplied the file list, the class
shapes, the `app/Actions/Blog/` placement argument, the payload and its exclusions, the
`AppServiceProvider` registration nobody else flagged, the third-injection-shape observation, the
resolution of 0064's OQ-2, the D-13 evaluation, and — the single most valuable contribution in the
debate — **R-1**, the stale-instance race that would double-announce one transition and that has no
analogue in either sibling story. `backend-qa` supplied the four-file split, the recipient and
permission-typo datasets, **the transition matrix** and the identification of `Published`→`Published`
as the highest-risk line, the faked/un-faked reasoning extended to catch an unregistered listener, the
republication question, and the vacuous-assertion analysis including the observation that made the
restore test worth its own file.

**Three facilitator findings changed this document rather than merely supporting it**, each verified by
reading real code or real task files rather than relayed:

1. **A third trigger neither amigo raised — and the one finding here that changed another story's
   shipped code.** `CreateBlogPost` accepts `BlogPostStatus $status`, so a post can be created already
   `Published` — a path both upstream hand-offs' *"two triggers"* framing missed entirely. Escalated as
   **OQ-1** rather than decided, since it is a genuine product boundary; **confirmed**, and story 0061
   revised its own **D-19** and shipped both manual dispatch sites in response. The mechanism is worth
   naming because it will recur: the hand-offs were *enumerations*, and an enumeration goes stale — or
   is born short — without anything failing. Only the callee's signature disagreed with them.
2. **The naming conflict resolved against `backend-expert`, with the dissent recorded** (**D-6**), plus
   the discovery that [naming.md](../../docs/conventions/naming.md#classes)'s own listener sentence
   contradicts its own example — the shipped code is imperative, the sentence says it is not. Flagged
   for Phase 6.
3. **The dirty-state mechanics were verified by execution against the framework source, not reasoned**
   (**V-5**, **V-7**) — `syncChanges()`'s position inside `performUpdate()`, `syncOriginal()`'s in
   `finishSave()`, `performInsert()`'s omission of the former (which is why the create path in **OQ-1**
   needs a *different* condition), and `fresh()`'s use of `newQueryWithoutScopes()`, which means the
   **R-1** re-read is **not** a soft-delete guard and must not be read as one. `ActivateVerifiedUser`'s
   own docblock independently states the same chain and warns against reverting it — this story follows
   an existing, hard-won rule rather than rediscovering it.

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). ~~Five~~ **Seven** items deserve an
explicit look there rather than at implementation time — **OQ-1 is no longer one of them**, having been
confirmed and implemented upstream, and **items 6 and 7 were added on 2026-08-30** by the Epic 5
coordination pass:

1. **R-1** — **now the sharpest open item in the file, and it was not, before OQ-1 closed.** 0061's
   shipped update condition has no `refresh()`, so a stale instance can double-announce one transition.
   This story plans a test that is *expected to fail*; Phase 2 must decide whether that is acceptable
   to carry into Phase 3 or whether 0061 fixes it first.
2. **OQ-2** — confirming **D-12**, because reversing it later costs a migration.
3. **OQ-5 / D-6** — the listener's name, cheap now and expensive after.
4. **The four test-file paths.** Per this repo's own rule that
   [a story file naming a test path is making a convention decision](../../docs/testing/frontend/playwright-setup.md#folder-structure),
   the four-way split — and `backend-qa`'s own three-way alternative (folding the restore case into the
   manual file) — belongs in the Phase 2 review, not in Phase 3.
5. **R-7** — a mandatory re-verification of every 0061/0064 signature quoted here against shipped code,
   immediately before Phase 3. **This is no longer hypothetical:** 0061's `UpdateBlogPost` and
   `CreateBlogPost` both gained a constructor dependency and a dispatch branch after this file was
   first written, which is exactly the drift the rule exists to catch.
6. **D-4a — ✅ CONFIRMED 2026-08-30 — the store-default language for the frozen title snapshot.** The
   human confirmed this directly, consistent with every other Epic 5 story's answer to "which language
   does a backend-only artifact speak?" (0066's `defaultNotificationLocale()`, 0027/0077's OQ-10). No
   longer merely recommended.
7. **R-11 — the stale-`translations` snapshot on the `UpdateBlogPost` path** *(added 2026-08-30)*.
   Phase 2 must decide the same thing it decides for **R-1**: whether a test expected to fail is
   acceptable to carry into Phase 3, or whether 0061 fixes it first. The two are close enough to be
   confused and must be judged separately — **R-1** produces a duplicate announcement, **R-11** produces
   a single announcement with wrong content, and 0061's `refresh()` as currently placed (0078's
   **D-12**, first statement) closes only the first.

**Stage:** `new`, and **blocked** — see the banner under [Description](#description). It moves to
`ai-spec/tasks/in-progress/` at the start of Phase 3 and to `ai-spec/tasks/done/` at Phase 7; both
moves change this file's directory depth, so every relative link above must be re-resolved in **both
directions** on each move, per
[workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
