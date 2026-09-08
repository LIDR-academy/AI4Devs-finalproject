# [0061] Blog posts — core CRUD backend (+ the blog-category in-use delete guard)

## Description
Introduce `blog_posts` as Epic 4's central entity: a new `blog_posts` table (UUID v7 primary key per
[ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md) and
[PRD](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) assumption 19) plus the
`blog_post_tag` pivot, the `App\Models\BlogPost` model, a `BlogPostStatus` backed enum, shared
validation, and the create / update / **soft**-delete domain actions — including tag assignment with
**create-on-the-fly** through story [0059](0059-blog-tags-backend.md)'s `FindOrCreateBlogTag`. It is
**backend only** — no screen, no route, no Livewire component; the blog list and post editor are
story **0063**.

`BlogPost` is the **second** model in this repo to use `SoftDeletes`, after `App\Models\User`
(**D-7**, human-confirmed 2026-08-27): a post is authored content whose accidental deletion must be
recoverable, unlike the two blog taxonomies, which hard-delete.

It also carries a **second, smaller deliverable**: now that `blog_posts.blog_category_id` exists,
story [0058](0058-blog-categories-backend.md)'s `DeleteBlogCategory` gains the **hard block with a
count** the PRD requires ("This category is used by 5 posts — reassign them before deleting"), with
no confirm-and-proceed path.

Covers [PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog posts` scenarios (*Create a
post*, *A post has exactly one category*), the tag-attachment half of `Feature: Blog tags` (*Reuse an
existing tag from the post editor*, *Create a new tag on the fly from the post editor*, *A post can
hold more than one tag*), and `Feature: Blog categories`' *Deleting a blog category still in use is
hard-blocked with a count* — i.e. Blog acceptance criteria 1, the block half of 2, the
create-on-the-fly half of 3, and the UUID-PK criterion 6.

This story is the blog mirror image of [0024 (products-core-crud-backend)](done/0024-products-core-crud-backend.md),
and is deliberately written to be read against it: both create a core entity on top of an
already-shipped category table, and both are the story that **retrofits** the in-use delete guard
onto a `Delete<Taxonomy>` action a prior story shipped deliberately unguarded.

## Type
backend | includes database-expert: **yes**

## Three Amigos participants

`product-owner` (lead/facilitator) + `backend-expert` (files and approach) + `database-expert`
(schema, FK semantics, indexes) + `backend-qa` (test design). All three were convened as subagents
and all three contributions are reflected below, including **two recorded dissents** (**D-3**,
**D-6**) and **one conflict between two amigos that the facilitator resolved rather than left
implicit** (see [Provenance](#provenance)).

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. The actor
term **"blog editor"** and the entity term **"post"** are taken verbatim from the PRD's own Epic 4
scenarios, per [0058](0058-blog-categories-backend.md)'s **OQ-3** recommendation.

```gherkin
Feature: Blog posts — core fields

  Scenario: Create a post
    Given a blog editor, with the blog category "Guías" in the catalog
    When they create a post with a title, that category, a status and a WYSIWYG body
    Then the post is saved carrying every one of those values

  Scenario: A post is saved as a draft when no status is given
    Given a blog editor
    When they create a post without choosing a status
    Then the post is saved as a draft, never as published

  Scenario: A post has exactly one category
    Given a blog editor editing a post
    When they select the category "Guías"
    Then the post has exactly that one category

  Scenario: A post without a category is refused
    Given a blog editor
    When they create a post without choosing a category
    Then the creation is refused with a validation message
    And no post is added

  Scenario: A post referencing an unknown category is refused
    Given a blog editor
    When they create a post against a category that is not in the catalog
    Then the creation is refused with a validation message

  Scenario: A post with an unrecognised status is refused
    Given a blog editor
    When they create a post with a status that is not draft, published or scheduled
    Then the creation is refused with a validation message
    And no fallback status is applied on the post's behalf

  Scenario: Editing a post changes its stored values
    Given a blog editor, with an existing post "Botas de invierno"
    When they retitle it to "Botas de invierno 2026"
    Then the post is shown as "Botas de invierno 2026" wherever it is used

  Scenario: A post body keeps the images inserted from the shared gallery
    Given a blog editor, with a body containing an image inserted from the shared media gallery
    When they save the post
    Then the stored body still carries that image

  Scenario: An administrator without the blog permission cannot manage posts
    Given a signed-in administrator who does not hold the blog management permission
    When authorization to manage posts is evaluated for them
    Then the action is refused

Feature: Blog post publication state

  Scenario: A scheduled post must carry a future publication date
    Given a blog editor
    When they schedule a post for a date that has already passed
    Then the save is refused with a validation message

  Scenario: A scheduled post is accepted with a future publication date
    Given a blog editor
    When they schedule a post for a date in the future
    Then the post is saved as scheduled, carrying that date

  Scenario: A scheduled post without a publication date is refused
    Given a blog editor
    When they set a post's status to scheduled without giving a date
    Then the save is refused with a validation message

  Scenario: Publishing a post without a date stamps it as published now
    Given a blog editor, with a draft post
    When they publish it without giving a publication date
    Then the post is saved as published, carrying the current moment as its publication date

  Scenario: Publishing an existing draft announces the post
    Given a blog editor, with a draft post
    When they change that post's status to published
    Then a published-post notification is raised for that post

  Scenario: Creating a post already published announces it
    Given a blog editor
    When they create a post whose status is published
    Then a published-post notification is raised for that post

  Scenario: Creating a draft announces nothing
    Given a blog editor
    When they create a post whose status is draft
    Then no published-post notification is raised

  Scenario: Editing an already-published post announces nothing
    Given a blog editor, with a published post
    When they retitle that post
    Then no published-post notification is raised

  Scenario: Returning a scheduled post to draft clears its publication date
    Given a blog editor, with a post scheduled for a future date
    When they return that post to draft
    Then the post is saved as a draft
    And it no longer carries a publication date

  Scenario: Retitling a scheduled post whose date has passed is still accepted
    Given a blog editor, with a scheduled post whose publication date has already passed
    When they retitle that post without touching its status or its date
    Then the save is accepted

Feature: Blog post body

  Scenario: A draft may be saved without a body
    Given a blog editor
    When they save a draft post with a title and no body
    Then the post is saved as a draft
    And it carries no body

  Scenario: Publishing a post without a body is refused
    Given a blog editor
    When they save a post as published with no body
    Then the save is refused with a validation message

  Scenario: Scheduling a post without a body is refused
    Given a blog editor
    When they save a post as scheduled with no body
    Then the save is refused with a validation message

  Scenario: Promoting a bodiless draft to published is refused
    Given a blog editor, with a draft post that has never had a body
    When they change that post's status to published
    Then the save is refused with a validation message
    And the post is still a draft

Feature: Blog post tags

  Scenario: Reuse an existing tag from the post editor
    Given a blog editor editing a post, with a tag "running" already existing
    When they save the post with "running" in its tag field
    Then the existing "running" tag is attached to the post
    And no second tag named "running" is created

  Scenario: A tag differing only by case reuses the existing tag
    Given a blog editor editing a post, with a tag "running" already existing
    When they save the post with "Running" in its tag field
    Then the existing "running" tag is attached to the post

  Scenario: Create a new tag on the fly from the post editor
    Given a blog editor editing a post, with no tag named "invierno"
    When they save the post with "invierno" in its tag field
    Then a new "invierno" tag is created and attached to the post

  Scenario: A post can hold more than one tag
    Given a blog editor editing a post that already has the tag "running"
    When they save the post with both "running" and "invierno" in its tag field
    Then the post is associated with both "running" and "invierno"

  Scenario: Removing a tag from the post editor detaches it from that post only
    Given a blog editor editing a post tagged "running" and "invierno"
    When they save the post with only "running" in its tag field
    Then the post is associated with "running" alone
    And the "invierno" tag remains in the tag catalog

  Scenario: Deleting a tag removes it from every post that used it
    Given a blog editor, with the tag "running" attached to three posts
    When they delete the "running" tag
    Then "running" is removed from all three posts
    And all three posts still exist

Feature: Deleting a blog post

  Scenario: Deleting a post removes it from the blog list
    Given a blog editor, with an existing post "Botas de invierno"
    When they delete that post
    Then "Botas de invierno" no longer appears in the blog list

  Scenario: A deleted post is recoverable rather than destroyed
    Given a blog editor, with a deleted post "Botas de invierno"
    When they restore that post
    Then "Botas de invierno" appears in the blog list again
    And it still carries its title, body, category and tags

  Scenario: Restoring a published post announces nothing
    Given a blog editor, with a deleted post that was published
    When they restore that post
    Then no published-post notification is raised

  Scenario: A restored post keeps the category it had
    Given a blog editor, with a deleted post in the blog category "Guías"
    When they restore that post
    Then the post is still in the blog category "Guías"

  Scenario: A restored post reclaims its own slug
    Given a blog editor, with a deleted post whose slug is "botas-de-invierno"
    When they restore that post
    Then the post is shown with the slug "botas-de-invierno"

  Scenario: A restored post does not regain a tag that was deleted meanwhile
    Given a blog editor, with a deleted post that was tagged "running"
    And the "running" tag has since been deleted from the tag catalog
    When they restore that post
    Then the post is restored without the "running" tag

  Scenario: An administrator without the blog editing permission cannot restore a post
    Given a signed-in administrator who does not hold the blog editing permission
    When authorization to restore a deleted post is evaluated for them
    Then the action is refused

  Scenario: Deleting a post keeps its tags in the tag catalog
    Given a blog editor, with a post tagged "running" and "invierno"
    When they delete that post
    Then both "running" and "invierno" remain in the tag catalog

  Scenario: A deleted post keeps its slug reserved
    Given a blog editor, with a deleted post whose slug is "botas-de-invierno"
    When they create a new post that would take the slug "botas-de-invierno"
    Then the new post is given a different slug
    And the deleted post keeps its own slug

Feature: Deleting a blog category that is in use

  Scenario: Deleting a blog category still in use is hard-blocked with a count
    Given a blog editor, with the blog category "Guías" assigned to 5 posts
    When they try to delete "Guías"
    Then deletion is blocked with a message stating that 5 posts use it
    And "Guías" is still in the blog category catalog
    And no confirm-and-proceed path is offered

  Scenario: Draft posts count towards the block
    Given a blog editor, with the blog category "Guías" assigned to 3 posts, all drafts
    When they try to delete "Guías"
    Then deletion is blocked with a message stating that 3 posts use it

  Scenario: Deleted posts still count towards the block
    Given a blog editor, with the blog category "Guías" assigned to 1 post that has been deleted
    When they try to delete "Guías"
    Then deletion is blocked with a message stating that 1 post uses it
    And "Guías" is still in the blog category catalog

  Scenario: The block names a single post in the singular
    Given a blog editor, with the blog category "Guías" assigned to 1 post
    When they try to delete "Guías"
    Then deletion is blocked with a message stating that 1 post uses it

  Scenario: Deleting an unused blog category still works
    Given a blog editor, with the blog category "Guías" assigned to no posts
    When they delete "Guías"
    Then "Guías" is removed from the blog category catalog

  Scenario: Reassigning the last post frees the category for deletion
    Given a blog editor, with the blog category "Guías" assigned to 1 post
    When they move that post to another category
    Then "Guías" can then be deleted

  Scenario: No privilege level can force a blocked category deletion
    Given a signed-in Super Admin, with the blog category "Guías" assigned to 5 posts
    When they try to delete "Guías"
    Then deletion is blocked exactly as it is for any other administrator
```

## Files to create/modify

### Migrations

| Path | What & why |
| --- | --- |
| `database/migrations/<ts>_create_blog_posts_table.php` | **New.** Greenfield UUID table. Its timestamp must be **strictly later** than 0058's `create_blog_categories_table`, because the FK is declared inline. |
| `database/migrations/<ts+1>_create_blog_post_tag_table.php` | **New.** The tag pivot; later still, since it FKs into **both** `blog_tags` (0059) and `blog_posts`. |

```php
// <ts>_create_blog_posts_table.php
Schema::create('blog_posts', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('blog_category_id')->constrained()->restrictOnDelete();
    $table->string('title', 255);
    $table->string('slug', 255)->unique();
    $table->mediumText('body')->nullable();                          // nullable — see D-4
    $table->string('status', 20)->default(BlogPostStatus::Draft->value);
    $table->timestamp('published_at')->nullable();
    $table->timestamps();
    $table->softDeletes();                                           // see D-7

    // deleted_at leads: the SoftDeletingScope puts `deleted_at IS NULL` into
    // EVERY query on this table, including 0064's scheduler sweep. See D-9.
    $table->index(['deleted_at', 'status', 'published_at']);
});
```

```php
// <ts+1>_create_blog_post_tag_table.php — the shape 0059's D-8 specified for this story
Schema::create('blog_post_tag', function (Blueprint $table): void {
    $table->foreignUuid('blog_tag_id')->constrained()->cascadeOnDelete();
    $table->foreignUuid('blog_post_id')->constrained()->cascadeOnDelete();

    $table->primary(['blog_tag_id', 'blog_post_id']);
});
```

Nine things in those two files are decisions, not defaults, each with its own entry below:
`restrictOnDelete()` + NOT NULL on `blog_category_id` (**D-2**), `slug` existing at all and carrying
a `unique()` (**D-3**), `mediumText` **nullable** on `body` (**D-4**), `string('status', 20)` **with**
a `->default()` (**D-5**), the single nullable `published_at` (**D-6**), `softDeletes()` (**D-7**),
the composite-PK pivot with no surrogate id and no timestamps (**D-8**), the
`(deleted_at, status, published_at)` composite index (**D-9**), and the **absence** of any
`normalized_*` column (**D-10**). `down()` in both files is the exact
`Schema::dropIfExists(...)` inverse; because Laravel rolls back in reverse timestamp order, the pivot
drops before `blog_posts`, so the pair is genuinely symmetric.

> ⚠️ **Do not add `$table->index('blog_category_id')`, `$table->index('blog_tag_id')` or
> `$table->index('blog_post_id')`.** InnoDB creates the FK index itself, and a hand-written one
> duplicates it — the shape of the `users_uuid_unique` debt in
> [errors-log-archive.md](../../docs/errors-log-archive.md#a-redundant-users_uuid_unique-index-survived-the-uuid-primary-key-conversion--2026-08-12).
> This is [migrations.md](../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)'s
> shipped rule; `create_passkeys_table`'s explicit `$table->index('user_id')` is the documented
> divergence, not the pattern. **Verify with `php artisan db:table blog_posts` and
> `php artisan db:table blog_post_tag` after migrating**, never by reading the migration — a
> migration cannot show you an index nobody wrote.

### Enum — `app/Enums/`

| Path | What & why |
| --- | --- |
| `app/Enums/BlogPostStatus.php` | **New.** `case Draft = 'draft'; case Published = 'published'; case Scheduled = 'scheduled';` — the PRD's Borrador / Publicado / Programado. TitleCase keys, lowercase backing values, per project `CLAUDE.md` and [naming.md](../../docs/conventions/naming.md#classes). |

**No `label()` method**, deliberately — per [naming.md](../../docs/conventions/naming.md#translation-keys)'s
rule that *a `label()` on an enum is not automatic*: add it when a **second** consumer appears, not
when the first one does. This story renders nothing; 0063 is the first consumer and may add it then.
This is the same call task 0018 made for `SalesRegionKind`.

### Model, factory, validation trait

| Path | What & why |
| --- | --- |
| `app/Models/BlogPost.php` | **New.** `use HasFactory, HasUuids, SoftDeletes;` (**D-7**), `#[Fillable(['title', 'body', 'blog_category_id', 'status'])]`, a `casts()` returning `['status' => BlogPostStatus::class, 'published_at' => 'datetime', 'deleted_at' => 'datetime']`, the `category()` / `tags()` relations, the `slug`-deriving `saving` hook (**D-3**), and the `scopeForCategory()` / `scopeForTag()` query helpers (**D-11**). **No `delete()` override** — unlike `App\Models\User`, the slug is deliberately *not* obfuscated on delete (**D-7b**). No `#[Hidden]` (nothing sensitive). `slug` and `published_at` are **omitted from `#[Fillable]`** — the mass-assignment guard this repo uses for `users.status` and every seeder-owned `sales_regions` column. |
| `app/Models/BlogCategory.php` | **Modify (0058 creates it).** Gains exactly one method: `/** @return HasMany<BlogPost, $this> */ public function posts(): HasMany`. It is what the delete guard counts through. 0058 deliberately omitted it ("`posts()` references a class and table that do not exist until 0061"). |
| `app/Models/BlogTag.php` | **Modify (0059 creates it).** Gains exactly one method: `/** @return BelongsToMany<BlogPost, $this> */ public function posts(): BelongsToMany`. 0059's scope fence names this story as its owner. |
| `database/factories/BlogPostFactory.php` | **New**, via `php artisan make:factory BlogPostFactory --model=BlogPost --no-interaction`. `blog_category_id => BlogCategory::factory()` so a bare `->create()` stands alone; `status => Draft` deliberately matching the column default; `published_at => null`. **Does not set `slug`** — the model hook derives it, which is itself a small proof the hook fires on the insert path. States: `draft()`, `published()`, `scheduled()`, `withTags(int $count)`. |
| `app/Concerns/BlogPostValidationRules.php` | **New**, `<Noun>ValidationRules` / `<noun>Rules()` per [naming.md](../../docs/conventions/naming.md#traits-and-their-methods), where the noun is the **field**, not the model. Full rule set in **D-12**. |

> **Naming trap, inherited from 0024's own debate and live again here.** 0058 claims `nameRules()`
> on `BlogCategoryValidationRules` and 0059 claims `nameRules()` / `nameFormatRules()` on
> `BlogTagValidationRules`. PHP fatals on a conflicting method when two traits are composed onto one
> class, and the obvious future consumer — 0063's post editor with create-a-tag-on-the-fly — could
> plausibly compose more than one. So **every leaf method here is field-named and unambiguous**:
> `titleRules()`, `bodyRules(BlogPostStatus $status)`, `blogCategoryIdRules()`, `statusRules()`,
> `publishedAtRules(BlogPostStatus $status)`, `tagNamesRules()`. None collides with either sibling
> trait, and all still end in `Rules`, so the convention holds.

### Actions — `app/Actions/Blog/`

The **area** folder 0058's **D-14** and 0059 both already committed to (it holds categories, tags and
posts alike, mirroring the single `blog.*` permission tier that gates all three). This story adds
three files to it and **modifies one**.

| Path | What & why |
| --- | --- |
| `CreateBlogPost.php` | **New.** `__invoke(string $title, string $body, string $blogCategoryId, BlogPostStatus $status, ?string $publishedAt, array $tagNames): BlogPost`. Authorizes `create` first (**D-13**), sanitizes the body (**D-14**), validates, builds the row from a **literal whitelist** (never a spread of `$validated`), and delegates tags to `SyncBlogPostTags` inside one transaction (**D-15**). **Dispatches `NotifyBlogPostPublished` after the commit when the new post's status is `Published`** (**D-19**). |
| `UpdateBlogPost.php` | **New.** `__invoke(BlogPost $blogPost, string $title, string $body, string $blogCategoryId, BlogPostStatus $status, ?string $publishedAt, array $tagNames): BlogPost`. **Calls `$blogPost->refresh()` as its literal first statement** — before authorization and before the pre-save status read (**D-19a**) — then authorizes `update`; same sanitize / validate / transaction handling. **Dispatches `NotifyBlogPostPublished` after the commit on a transition *into* `Published`** (**D-19**). |
| `DeleteBlogPost.php` | **New.** `__invoke(BlogPost $blogPost): bool`. Authorizes `delete` on the target first (**D-13**), then a plain instance `->delete()` — which under `SoftDeletes` stamps `deleted_at` rather than removing the row (**D-7**). **Instance delete only, never the query builder**, per [base-standards.md](../../docs/conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder). |
| `RestoreBlogPost.php` | **New.** `__invoke(BlogPost $blogPost): bool`. `DeleteBlogPost`'s exact mirror image — authorizes **`restore`** on the target first (**D-13**, **D-20**), then a plain instance `->restore()`. The caller resolves the target with `withTrashed()`, since a default query cannot see it. Needs **no** category-existence guard (**D-20**). |
| `SyncBlogPostTags.php` | **New.** `__invoke(BlogPost $blogPost, array $tagNames): void`. The **single writer** of the `blog_post_tag` pivot, shared by `CreateBlogPost` and `UpdateBlogPost` so the logic exists once — the shape 0024's **D-17** established with `SyncProductGallery`. Resolves each submitted name through 0059's `FindOrCreateBlogTag`, then `sync()`s the resulting id set (**D-17**). |
| `DeleteBlogCategory.php` | **Modify (0058 creates it; its D-10 says the file exists as its own file precisely so this story extends it).** `__invoke()` gains the count-and-block guard. This is the story's second deliverable — full shape in **D-18**. |

All five new actions constructor-inject `App\Actions\Auth\LogRefusedPrivilegedAttempt`;
`CreateBlogPost` / `UpdateBlogPost` additionally constructor-inject `SyncBlogPostTags` and the body
sanitizer, and `SyncBlogPostTags` constructor-injects `FindOrCreateBlogTag`. Constructor injection is
required here, not stylistic: each `__invoke()` signature is a **public contract** matched verbatim
by 0063 and by every direct-call test, so widening it with an internal collaborator is the
anti-pattern [code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)
documents. `App\Actions\SalesRegions\SetSalesRegionActive` is the shipped precedent for one action
constructor-injecting another — verified at `HEAD`:

```php
// app/Actions/SalesRegions/SetSalesRegionActive.php — the real, shipped shape
public function __construct(
    private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    private readonly SetDefaultSalesRegion $setDefaultSalesRegion,
) {}
```

**`Create` + `Update`, not a set of narrow verbs and not a single `SaveBlogPost`.** 0058's **D-2**
chose `Rename` because `BlogCategory` has exactly one mutable field; a post has six (title, body,
category, status, publication date, tags), and the PRD's own framing is a "list + editor". So
`App\Actions\Users\UpdateUser` and `app/Actions/Products/` are the models to copy — the Epic 4
stories are consistent with each other, not divergent. *Rejected:* `PublishBlogPost` /
`ScheduleBlogPost` as separate verbs; no PRD scenario treats either as a distinct operation, and
0063's editor would have to fan one form submit out to three actions.

### The category-delete guard retrofit

| Path | What & why |
| --- | --- |
| `app/Actions/Blog/DeleteBlogCategory.php` | **Modify.** The single file 0058 created as a seam for exactly this. Full shape, count-query properties, exception type and error-bag key in **D-18**. |

### Translations

| Path | What & why |
| --- | --- |
| `lang/en/blog.php` | **New — this story creates the file.** Verified: `lang/en/` today holds only `navigation.php`, `roles.php`, `sales-regions.php`, `users.php`. 0058 and 0059 both deliberately created none. The only key owned here is `blog.categories.delete_blocked`. |
| `lang/es/blog.php` | **New**, key-for-key identical, per [naming.md](../../docs/conventions/naming.md#translation-keys). |

> **Placement note, recorded so nobody "tidies" it later.** The string is *about* categories but
> lives in `blog.php` under a `'categories'` group, because the message is about **posts using** the
> category and this story is the posts story — the identical reasoning 0024 applied to putting
> `products.categories.delete_blocked` in `products.php`. Alternatives were a `blog-categories.php`
> domain file for one key, or extending 0058's file (there isn't one).
>
> ⚠️ **File-ownership hand-off.** Stories **0062** and **0063** will both want `lang/{en,es}/blog.php`
> for their own UI copy. **0061 has the lower id and therefore creates it; 0062 and 0063 must extend
> it.** If they run uncoordinated, one silently overwrites the other's keys — and a key missing from
> `lang/es` renders as its own raw key with no error.

### Consumed, not created by this story

- `App\Actions\Blog\FindOrCreateBlogTag` — story [0059](0059-blog-tags-backend.md)'s reusable
  resolver. **This story is its only current caller for the attach-during-post-save path** (0060's
  tag-management screen does not use it). Its per-branch authorization (**D-13**) and its
  re-query-on-lost-race semantics (0059's **D-10**) are consumed unchanged, never re-implemented.
- `App\Actions\Auth\LogRefusedPrivilegedAttempt` — the refusal audit line (story 0015b), already
  constructor-injected into eight domain actions.
- The HTML sanitizer and `config/html-sanitizer.php` — story
  [**0024a**](done/0024a-product-description-html-sanitization.md)'s **D-16** deliverable (split out of 0024
  on 2026-09-01). **Consumed, never forked** (**D-14**, **OQ-4**).
- `App\Actions\Blog\NotifyBlogPostPublished` — story **0065**'s deliverable,
  `__invoke(BlogPost $blogPost): void`. This story **calls** it from two sites and neither defines nor
  modifies it (**D-19**); what it notifies, whom, and through which channel is entirely 0065's.

### Explicitly **not** touched

`database/seeders/RolePermissionSeeder.php` (the `blog.*` permissions are already seeded — verified:
`MODULES` contains `'blog'` and `ACTIONS` is the four CRUD verbs, so **zero seeder change**) ·
`routes/**` · `config/modules.php` · `app/Livewire/**` · `resources/views/**` · `tests/Browser/**` ·
`app/Actions/NormalizeForSearch.php` (**D-10** — this story does not call it at all) · anything
belonging to 0062 (categories UI), 0063 (posts UI), 0064 (scheduler) or 0065 (notification).

## Tests to perform

Backend only — **no browser tests**, since this story ships no screen.

> **Read this before writing any negative-validation test** — inherited verbatim from 0058's own test
> list, because the same ordering applies. The actions authorize themselves **before** they validate,
> so a direct call from a test with no authenticated actor throws `AuthorizationException`, **not**
> `ValidationException`. Every validation test below must therefore `actingAs()` an actor holding the
> relevant `blog.*` permission first, or it will pass for entirely the wrong reason — green, and
> blind to the rule it claims to pin.

> **Two time-sensitive disciplines this story introduces.** (a) Every `published_at` boundary test
> **must freeze the clock** with `Carbon::setTestNow()` — a test computing `now()->addSecond()` and
> trusting wall-clock timing is flaky by construction on a slow CI run. (b) The `>` vs `>=` boundary
> must be asserted **from both sides**, the discipline
> [security/step-up-authentication.md](../../docs/security/step-up-authentication.md) established for
> the password-freshness window.

**Unit — `tests/Unit/Concerns/BlogPostValidationRulesTest.php`** (new)
- [ ] `titleRules()`, `blogCategoryIdRules()`, `statusRules()`, `tagNamesRules()` each return the
      expected rule array in isolation. *Risk if missing:* nothing else exercises the trait
      independently of a real row.
- [ ] `publishedAtRules($status)` returns a **different** rule set per status — `prohibited` for
      `Draft`, `required|date|after:now` for `Scheduled`, `nullable|date` for `Published`. *Risk if
      missing:* the two fields are coupled (status decides what date is legal) and a naive
      unconditional `after:now` would wrongly refuse a `Published` post's historical date, which is
      the normal case for an already-published post.
- [ ] `bodyRules($status)` returns `nullable` for `Draft` and `required` for **both** `Published` and
      `Scheduled` (**D-4**) — three assertions, one per case, so a rule that only special-cases
      `Published` cannot pass. *Risk if missing:* the confirmed empty-draft-body decision becomes
      implicit in the action instead of stated in the rule set, and the `Scheduled` half is the one a
      partial implementation drops.

**Feature — `tests/Feature/Models/BlogPostTest.php`** (new; mirrors `tests/Feature/Models/UserTest.php`)
- [ ] A factory-created post's `id` is a UUID **v7** string (`Str::isUuid($id, 7)`). *Risk:*
      `HasUuids` silently not wired ships a non-time-ordered or auto-increment id.
- [ ] Two posts created in immediate succession sort lexicographically in creation order
      (`strcmp($first->id, $second->id) < 0`) — catches a v4 generator substituted for v7.
- [ ] `title`, `body`, `blog_category_id` and `status` are mass-assignable and **`slug` /
      `published_at` are not** — a forged `BlogPost::create([... 'slug' => 'hijacked'])` stores the
      *derived* value. *Risk if missing:* a caller can decouple the URL key from the title it
      represents, or stamp an arbitrary publication date past the status rules.
- [ ] **The `saving` hook derives `slug` on insert and re-derives it on a retitle** — two assertions,
      not one. *Risk if missing:* a hook that fires only on insert leaves a retitled post's slug
      pointing at its old title (**R-3**).
- [ ] Saving a post **without touching `title`** does not rewrite `slug` — pins the `isDirty('title')`
      guard.
- [ ] `blog_category_id` is **NOT NULL at the database level**: a raw
      `DB::table('blog_posts')->insert([...without blog_category_id...])` throws an integrity error,
      not merely a validation refusal. *Risk if missing:* "exactly one category" is proven only at the
      validation layer, and a seeder or import could still write a categoryless post.
- [ ] `category()` returns the correct `BlogCategory`; `tags()` is a `BelongsToMany` through
      `blog_post_tag` and returns the correct set.
- [ ] `scopeForCategory()` and `scopeForTag()` each return only matching posts, with a **decoy row**
      in a different category / carrying a different tag in every fixture. *Risk if missing:* a scope
      that returns everything passes a presence-only assertion trivially.
- [ ] The model **does** use `SoftDeletes` (**D-7**): deleting a factory post leaves the row present
      with `deleted_at` set (`assertSoftDeleted`, never `assertDatabaseMissing`), and the post
      disappears from a default `BlogPost::query()` while `withTrashed()` still finds it. *Risk if
      missing:* the trait is the whole confirmed decision; without it a delete is destructive and
      nothing else in the suite says so.
- [ ] **The model does not override `delete()`, and a trashed post keeps its slug** (**D-7b**): after
      deleting, the row's `slug` is byte-identical to what it was before. *Risk if missing:* someone
      copies `App\Models\User::delete()`'s obfuscation by analogy, and a restore then either loses the
      URL or collides — the failure the decision exists to prevent, invisible until a restore is
      attempted.
- [ ] **A trashed post's slug is still refused to a new post** — proving `Rule::unique()` does not
      apply the soft-delete scope here, which is what makes "stays reserved" true with no code
      (**D-7b**). Pair it with the positive control: a *different* title still saves fine.

**Feature — `tests/Feature/Blog/CreateBlogPostTest.php`** (new)
- [ ] A valid create persists title / body / category / status and returns the model.
- [ ] Omitting the status persists `Draft`, never `Published` — the column default *and* the action
      agree.
- [ ] A blank or over-length `title` is refused; derive the boundary from the same constant the
      migration uses (**R-4**), and assert the **pair** (exactly at the maximum accepted, one over
      refused).
- [ ] A `blog_category_id` pointing at a non-existent or malformed-UUID category is refused by
      `Rule::exists()` as a `ValidationException` — **not** by letting the FK throw a raw
      `QueryException`. *Risk if missing:* a broken reference becomes a 500 instead of a form error.
- [ ] **An invalid `status` string is refused as a `ValidationException`, never an uncaught
      `\ValueError` from the enum cast.** *Risk if missing:* this is exactly
      [task 0015's finding F8](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)
      recurring — Livewire's `EnumSynth` hydrates a forged backing value through `$type::from()`
      **before** validation runs. This story ships the repo's first new status-backed enum since that
      lesson landed, so it is a live precedent rather than a hypothetical.
- [ ] The body is stored **sanitized**, and an `<img src="https://…">` inserted from the shared
      gallery **survives** sanitization intact (**D-14**). *Risk if missing:* the single
      highest-severity failure in the story — a sanitizer allow-list that strips `<img>` silently
      destroys every image an editor inserted, and only a rendered page reveals it.
- [ ] A `<script>` tag, an `on*` handler and a `javascript:` URI in the submitted body never reach
      the column.
- [ ] **A `Draft` saves with a null body and with `''`** — both accepted, and the persisted value is
      null in the first case (**D-4**). *Risk if missing:* the confirmed "an editor may save a draft
      before writing anything" behaviour is the story's most user-visible new allowance and nothing
      else asserts it.
- [ ] **A `Published` save with no body is refused**, and a **`Scheduled`** save with no body is
      refused — two cases, not one. *Risk if missing:* a `required_if:status,published`-shaped rule
      passes the first and silently allows a bodiless scheduled post, which then goes live empty when
      0064's scheduler flips it.
- [ ] A whitespace-only body on `Published` is refused — proving the trim runs **before** validation,
      the same trap 0058's whitespace-name case records (`required` treats `'   '` as present).

**Feature — `tests/Feature/Blog/UpdateBlogPostTest.php`** (new)
- [ ] A valid update persists every changed field.
- [ ] Changing the category to a non-existent id is refused the same way create is — the full
      validation depth is re-asserted on the update path **independently**, not assumed symmetric
      with create (**R-5**, 0058's R-6 one entity over).
- [ ] Re-saving with no changes at all succeeds and leaves the row genuinely unchanged.
- [ ] Retitling re-derives the slug (paired with the model test above, at the action's call site).
- [ ] **Promoting a bodiless `Draft` to `Published` is refused, and the post is still a `Draft`
      afterwards** (**D-4**) — two assertions, since a rule that throws *after* writing would pass a
      throw-only test. *Risk if missing:* this is the transition the create-path body tests cannot
      reach, and the one where a bodiless post would actually become publicly visible.
- [ ] The same promotion **succeeds** once a body is supplied in the same save — the control, without
      which a rule that refuses every promotion passes.

**Feature — `tests/Feature/Blog/BlogPostStatusAndPublicationDateTest.php`** (new — its own file)

Split out deliberately: the case density below would bury the invariant inside the create/update
files, the same reasoning 0059 used to split `FindOrCreateBlogTagTest.php` out of
`CreateBlogTagTest.php`. **Every case here freezes the clock.**

- [ ] `Scheduled` + a **past** date → refused.
- [ ] `Scheduled` + a date **exactly equal to `now()`** → refused, pinning the boundary as strictly
      `>` (**D-6**). Assert the adjacent accepted case (`now()->addSecond()`) in the same file, so `>`
      is distinguishable from `>=`.
- [ ] `Scheduled` + a **future** date → accepted, and the date is persisted.
- [ ] `Scheduled` + a **null** date → refused.
- [ ] `Published` + a null date → accepted, and `published_at` is stamped with the **current moment**.
- [ ] `Published` + a **past** date → accepted, and the supplied date is persisted verbatim — the
      normal case for backdating an already-published post, and the case a blanket `after:now` rule
      would wrongly refuse.
- [ ] `Draft` + any submitted date → accepted, and `published_at` is persisted as **null**. *Risk if
      missing:* a stale future date left on a `Draft` row looks fine in every UI and corrupts the
      invariant the moment the row is later re-promoted (**R-2**).
- [ ] `Scheduled` → `Draft` transition clears `published_at`.
- [ ] `Draft` → `Scheduled` with no date supplied and none stored → refused, asserted on the **update**
      path specifically.
- [ ] **Retitling a `Scheduled` post whose date has already passed succeeds** — the single most
      important case in this file and the one a naive implementation fails. *Risk if missing:* an
      unconditional `after:now` makes every edit to an overdue scheduled post impossible, and the
      failure only appears once real time has passed the stored date. See **D-6**.

**Feature — `tests/Feature/Blog/BlogPostPublishedNotificationTest.php`** (new — its own file, **D-19**)

Its own file for the reason `BlogPostStatusAndPublicationDateTest.php` is: the "did it fire / did it
not" axis is orthogonal to what create and update otherwise assert, and burying it in both would put
half the rule in each. **Bind `NotifyBlogPostPublished` to a spy** (it is constructor-injected, so
this needs no container hackery) and assert invocation count and argument — never assert on 0065's
notification class, channel or payload, which this story does not own.

- [ ] **Creating a post with status `Published` dispatches exactly once, with that post.** *Risk if
      missing:* this is the entire gap story 0065 found — a post published at creation notified nobody,
      silently, and no error appeared anywhere.
- [ ] Creating with `Draft` and creating with `Scheduled` each dispatch **zero** times — two cases, so
      a condition that fires on "any create" cannot pass.
- [ ] **Updating a `Draft` into `Published` dispatches exactly once.**
- [ ] **Re-saving an already-`Published` post dispatches zero times** — a title-only edit, and a
      tag-only edit. *Risk if missing:* this is the assertion that pins the **transition** guard rather
      than a state check, and without it every subsequent edit re-announces the post to its
      subscribers. Assert **zero**, not "not more than once".
- [ ] `Published` → `Draft` → `Published` dispatches **once per transition into published** (twice
      total), proving the guard reads the pre-save value rather than a one-time flag.
- [ ] Updating `Scheduled` → `Published` dispatches once; updating `Draft` → `Scheduled` dispatches
      zero times (that outcome is 0064's sweep, not this story's).
- [ ] **A failed save dispatches zero times** — drive it through the real rollback path **D-15**
      already establishes: an actor holding `blog.edit` but not `blog.create` saving a `Published` post
      with one new tag name. *Risk if missing:* a dispatch placed inside the transaction still fires on
      a rollback, so subscribers are told about a post that was never saved — and nothing else in the
      suite would notice, because the post's absence looks like an ordinary refusal.
- [ ] **`RestoreBlogPost` on a previously-published post dispatches zero times** (**D-20**). *Risk if
      missing:* this is the case an observer-based implementation gets wrong, and the one whose failure
      is most visible to real subscribers.
- [ ] **The concurrent-modification case: a stale instance must not re-announce** (**D-19a**, closing
      0065's R-1). Arrange it as three steps against **one** row, with no mocking of the model layer:
      (a) fetch the post into `$stale` while it is `Scheduled`; (b) simulate 0064's sweep transitioning
      that same row to `Published` **through a separate query/instance**, so `$stale` is now behind
      reality; (c) call `UpdateBlogPost` with `$stale` and a **no-op edit** (same title, same status,
      same tags). **Assert the spy fired exactly once across the whole scenario** — the sweep's own
      announcement — **not twice**. *Risk if missing:* this is the entire content of **D-19a**, it is
      invisible to every single-instance test in the file, and its production symptom is subscribers
      being told twice about one post with no error anywhere. Note the assertion must count across
      steps (b) and (c) together; asserting only "step (c) fired zero times" would also pass if the
      refresh were removed and step (b) had never announced at all.
- [ ] **A dirtied caller instance cannot smuggle a column through the update** (**D-19a**'s second
      effect): set an attribute the action does not own (e.g. `$post->slug = 'hijacked'`) on the
      instance before calling, and assert the persisted row is unchanged in that column. *Risk if
      missing:* this is the `save()`-writes-the-whole-dirty-set hole
      [model-instance-trust.md](../../docs/security/model-instance-trust.md#save-writes-the-whole-dirty-set-so-the-single-named-writer-is-a-convention-not-an-enforcement)
      records as **still open** on `UpdateSalesRegion`; the `refresh()` closes it here, and without a
      test nothing stops a later refactor from moving that line and silently reopening it. Belongs in
      `UpdateBlogPostTest.php` rather than this file, since it is not about notifications.
- [ ] **Explicitly not tested here:** anything about the notification's content, recipients, channel or
      queuing — story 0065 owns all of it, and asserting it here would create a second specification of
      0065's behaviour that can drift from the first.

**Feature — `tests/Feature/Blog/BlogPostTagAssignmentTest.php`** (new — its own file)
- [ ] Saving a post with an existing tag's exact name attaches that row and creates no duplicate.
- [ ] Saving with a **case-differing** name (`"Running"` against a stored `"running"`) attaches the
      existing row. *Risk if missing:* this is the assertion that proves the save path calls
      `FindOrCreateBlogTag` and not `CreateBlogTag` — the wrong one throws a `ValidationException`
      here and is invisible to every exact-match test.
- [ ] Saving with an **accent-differing** name likewise attaches the existing row.
- [ ] Saving with an unknown name **creates** the tag and attaches it (`wasRecentlyCreated` true on
      the tag).
- [ ] Saving with three distinct names attaches all three pivot rows in one save.
- [ ] **On update, a name omitted from the submitted set is detached from that post, and the tag row
      itself survives** in the catalog, still attached to any other post using it (**D-17**). Seed a
      second post sharing that tag as the control.
- [ ] An actor holding `blog.edit` but **not** `blog.create` can attach an **existing** tag, and is
      **refused** when one submitted name is new — 0059's **D-11** per-branch ability exercised
      through its first real caller.
- [ ] **That refusal rolls the whole save back**: the post's own columns are unchanged and **no**
      pivot row from the valid names survives (**D-15**). *Risk if missing:* a half-saved post with
      two of three tags attached is a worse state than an outright failure, and nothing else in the
      suite would catch it.

**Feature — `tests/Feature/Blog/DeleteBlogCategoryTest.php`** — **EXTEND 0058's file, do not create a
new one.** This is the precedent 0058's **D-10** names explicitly ("`DeleteBlogCategory` exists as its
own file now specifically so story 0061 extends this one file"), and it mirrors how 0024 extends
0023's `DeleteProductCategoryTest.php`.
- [ ] **0058's own cases stay green, unmodified**: deleting an unused category hard-deletes the row;
      the freed name is immediately reusable; deleting an unknown/malformed-UUID category still 404s
      and is **not** swallowed by the new guard (proves the guard's early return does not shadow the
      not-found path).
- [ ] Deleting a category with N posts throws **and** the row still exists afterwards
      (`assertDatabaseHas`) — a guard that deletes-then-throws would pass a throw-only test.
- [ ] **Every dataset row seeds decoy posts in a *different* category.** Without the decoy,
      `BlogPost::count()` and `$category->posts()->count()` are indistinguishable and the test cannot
      fail for the reason it exists (0024's own instruction).
- [ ] **The count is unfiltered by status**: a category holding 3 posts that are **all drafts** is
      blocked, and the message states 3. *Risk if missing — and this is the likeliest implementation
      bug in the whole story:* a stray `->where('status', Published)` on the count reads naturally
      ("in use" sounds like "publicly visible"), and it would let an administrator delete a category
      out from under a dozen unpublished drafts. Its production consequence is a raw FK error instead
      of the friendly message.
- [ ] **`trans_choice()` renders correctly for 1 and for N** — assert the literal digits, **never**
      by re-invoking `trans_choice()` with the same arguments (tautological). Three dataset rows
      (N=1, N=2, N=12) so a hardcoded "1 or 2" cannot pass.
- [ ] **A soft-deleted post still blocks, and the count includes it** (**D-7d**): a category whose
      only post has been deleted is refused, and the message states **1**, not 0. *Risk if missing —
      and this is the second-likeliest implementation bug in the story, created by the confirmed
      soft-delete decision:* an unscoped `posts()->count()` reads 0, the guard passes, the
      `restrictOnDelete()` FK refuses the statement anyway, and the `23000` catch re-counts to 0 —
      producing the refusal message *"this category is used by 0 posts"*. Assert the **digit**, so a
      guard that blocks for the right reason with the wrong number still fails.
- [ ] Deleting an **unused** category still succeeds — the control, without which a guard that blocks
      everything passes trivially. Seed a **trashed post in a different category** in this case
      specifically, so a `withTrashed()` count that forgot to scope by category cannot pass it.
- [ ] Reassigning the last post to another category frees the original for deletion.
- [ ] **No confirm-and-proceed path**, proven three ways per 0024's pattern: (a) reflection —
      `__invoke()` takes exactly one `BlogCategory` parameter and no `bool $force`; (b) calling twice
      in succession is refused both times; (c) a **Super Admin** is refused identically. (c) is the
      strongest, and the one that actually distinguishes a data-integrity rule from an authorization
      check.
- [ ] **The race and the FK backstop**: register a `BlogCategory::deleting` hook in the test that
      assigns a post to the category between the count and the `DELETE`. The outcome must be a clean
      `ValidationException`, never a raw `QueryException` or a 500, and the category must survive —
      which holds only because the FK is `restrictOnDelete()` (**D-2**). Drive the collision through
      the **real** constraint, never a mocked exception.
- [ ] The refusal is **logged** with `target_type: 'blog_category'` and the snake_case reason
      `category_still_in_use`, asserted against the context array rather than a rendered string.
- [ ] **The error-bag key is `blogCategoryId`**, asserted explicitly — the hand-off contract story
      **0062** binds its `@error` outlet to (**D-18**).

**Feature — `tests/Feature/Blog/DeleteBlogTagTest.php`** — **EXTEND 0059's file.** This is the test
0059's **D-8** and **R-6** explicitly deferred to this story, and it is the one that closes 0059's
named residual risk.
- [ ] Deleting a tag attached to N posts removes exactly its `blog_post_tag` rows — asserted with
      `assertDatabaseMissing('blog_post_tag', ['blog_tag_id' => $tag->id])` against the **real** pivot,
      never a stub.
- [ ] **Every one of those posts survives, untouched, with its remaining tags intact** — the control.
      Without it, a bug that deletes the *post* instead of detaching the tag still passes a
      "the pivot row is gone" assertion.
- [ ] This doubles as a regression guard on the FK's delete rule: if anyone writes
      `restrictOnDelete()` on `blog_tag_id`, this test goes red rather than production doing so.
- [ ] **Deleting a tag also detaches it from a *trashed* post** (**D-7c**) — the tag-side cascade is
      unaffected by the post-side soft delete, because tags still hard-delete. *Risk if missing:* a
      restored post would come back carrying a tag that no longer exists in the catalog, which no
      other test in either story would notice.

**Feature — `tests/Feature/Blog/DeleteBlogPostTest.php`** (new)
- [ ] Deleting a post **soft-deletes** it: `assertSoftDeleted`, and the row is still physically
      present. *Risk if missing:* nothing else pins that this action is non-destructive, which is the
      entire confirmed decision.
- [ ] The deleted post disappears from a default query and from `scopeForCategory()` /
      `scopeForTag()`, and `withTrashed()` still finds it. *Risk if missing:* a `SoftDeletes` trait
      that is present but bypassed by a scope written with `DB::table()` looks identical in the row.
- [ ] **A soft-deleted post keeps its `blog_post_tag` rows** (**D-7c**) — assert against the pivot
      **directly** (`assertDatabaseHas('blog_post_tag', …)`), never via `$post->tags()`, and confirm
      every tag it used is still in `blog_tags`. *Risk if missing:* this is what makes a restore
      lossless; if the cascade ever did fire, the tags would be gone with no error and the loss would
      only surface when someone restored a post and found it untagged.
- [ ] Deleting an unknown or malformed-UUID post fails cleanly (`ModelNotFoundException` / 404).
- [ ] **Not tested here:** that a *tag* delete detaches from a trashed post (that belongs with the tag
      cascade cases in `DeleteBlogTagTest.php`), and the restore round-trip (its own file, below).

**Feature — `tests/Feature/Blog/RestoreBlogPostTest.php`** (new — **D-20**)
- [ ] Restoring a trashed post clears `deleted_at` and returns it to a default query — the base case.
- [ ] **The round-trip preserves title, body, category and tags** — delete, restore, then assert every
      field and the pivot rows. *Risk if missing:* this is the assertion that makes "recoverable" mean
      something; each half is already covered by `DeleteBlogPostTest.php`, but only the round-trip
      proves they compose.
- [ ] **The restored post reclaims its own slug**, unchanged. *Risk if missing:* pairs with
      **D-7b**'s reservation — if a future change ever freed the slug on delete, this is the test that
      goes red rather than a restore silently 404-ing later.
- [ ] **A tag deleted while the post was trashed does not come back** (**D-7c**, **R-17**): the post
      restores with the surviving tags only, and the deleted tag is absent from both `blog_tags` and
      the pivot. Seed a second tag as the control, so "restores with no tags at all" cannot pass.
- [ ] **Restoring is gated on `blog.edit`** (**D-20**): an actor holding `blog.edit` succeeds; an
      actor holding **`blog.delete` but not `blog.edit`** is refused. *Risk if missing:* the second
      case is the whole content of the gating decision, and a policy method that reused
      `DELETE_PERMISSION` by copy-paste would pass every test that only exercises a full-permission
      actor.
- [ ] Restoring a post that is **not** trashed is a harmless no-op rather than an error — `restore()`
      on a live model returns without changing the row.
- [ ] The refusal is **logged** with `target_type: 'blog_post'` and asserted against the context array,
      like every other refusal on this screen.
- [ ] **Explicitly not tested:** that a restore cannot dangle its `blog_category_id`. That is
      structurally impossible (**D-20**) — `restrictOnDelete()` refuses to delete a category any
      trashed post references — so a test would be asserting a state the database cannot produce, which
      is the vacuous-assertion failure mode
      [errors-log-archive.md](../../docs/errors-log-archive.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18)
      records. The property is already pinned from the other side, by the trashed-post block case in
      `DeleteBlogCategoryTest.php`.

**Feature — `tests/Feature/Policies/BlogPostPolicyTest.php`** (new; mirrors `BlogTagPolicyTest.php`)
- [ ] **All five** abilities (`viewAny` / `create` / `update` / `delete` / `restore`) get **both an
      allow and a deny test**, per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)'s
      authorization rule.
- [ ] **`restore` is allowed by `blog.edit` and refused to a `blog.delete`-only actor** (**D-20**) —
      asserted at the policy level as well as through the action, since this is the one ability whose
      permission string is not the one its name suggests.
- [ ] **A narrowness test per ability**: an actor holding a related-but-wrong `blog.*` permission
      (e.g. `blog.view` when the ability under test is `update`) is still denied. *Risk if missing:*
      a method that accidentally asks `hasAnyPermission('blog.*')` passes every other test in the file.
- [ ] A `Super Admin` actor is allowed through `Gate::before`.
- [ ] The permission names are asserted against `RolePermissionSeeder`'s seeded catalog (seed it and
      call `forgetCachedPermissions()` in `beforeEach`) — a name not in the catalog throws
      `PermissionDoesNotExist` at runtime, so this is a correctness test, not a style one.

**Feature — `tests/Feature/Blog/BlogPostAuthorizationTest.php`** (new; **D-13**'s own coverage)
- [ ] Each action, called directly by an actor **without** the relevant `blog.*` permission, throws
      `AuthorizationException` and performs **no write** — the test that proves a non-dashboard caller
      (an Artisan command, a queued job, 0064's scheduler) inherits the rule.
- [ ] Each refusal is **logged** with `target_type: 'blog_post'`, asserted against the context array.
- [ ] **Cross-screen context-key equivalence**: capture a refusal from this story and one from an
      existing screen in a single `Log::spy()` session and set-equate their key sets, per step 4 of
      [the refusal-logging recipe](../../docs/architecture/authorization.md#copyable-what-a-third-admin-screen-inherits).
      This is what proves the recipe generalised to a fourth domain without silently growing a fifth
      context key nobody documented.
- [ ] **A must-not-over-log test**: a permitted create / update / delete writes **no** warning.

**Explicitly not tested here**
- `HasUuids`, Eloquent timestamps, `Rule::exists`'s own SQL, or `BelongsToMany::sync()`'s own
  behaviour — framework/vendor per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md).
- The **sanitizer's own allow-list semantics** — story 0024a's `SanitizeProductDescription` tests own
  that. This story asserts only that the body goes **through** it, pinned by the `<img>`-survives and
  `<script>`-stripped cases above (**D-14**).
- `App\Actions\NormalizeForSearch`'s folding table — story 0022's unit test owns it, and this story
  does not call it at all (**D-10**).
- `FindOrCreateBlogTag`'s own reuse/create/race semantics — story 0059 owns them. This story tests
  only its **call site**.
- Migration `up()`/`down()` mechanics — `RefreshDatabase` proves every migration runs on every feature
  test; `down()` symmetry is a code-review concern.
- **An `arch()` rule asserting independence from the product taxonomy.** `App\Models\ProductCategory`
  does not exist in this tree, so a literal `->not->toUse(ProductCategory::class)` is a fatal
  class-not-found at collection time, not a red test — the identical reasoning 0058's **OQ-2** and
  0059 both recorded. If Phase 2 wants one anyway, it must be **one rule per namespace**, never
  `expect([...])`, which is disjunctive and has already shipped vacuous here once
  ([errors-log-archive.md](../../docs/errors-log-archive.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18)).

## Expected outcome

A `blog_posts` table exists with a UUID v7 primary key, a required category enforced by a
`restrictOnDelete()` FK, a unique title-derived `slug`, a sanitized WYSIWYG `body`, a three-case
Draft/Published/Scheduled status defaulting to Draft, and a single nullable `published_at` whose
meaning is fixed by the status beside it. A `blog_post_tag` pivot exists with both foreign keys
cascading, so deleting either parent detaches the association at the database level with no app-side
orchestration. A blog editor's create / update / delete operations are available as invokable domain
actions with shared, trait-held validation, each authorizing itself and logging refusals, and a
`BlogPostPolicy` expresses who may perform them. **A delete is recoverable**: the row survives with
`deleted_at` set, keeps its slug and its tag associations, and disappears from every default query,
and a fifth action — `RestoreBlogPost`, gated on `blog.edit` — brings it back whole. A `Draft` may be
saved before its body is written, while a `Published` or `Scheduled` post may not. Tags are attached by name in one save, reusing an
existing tag or minting a new one through story 0059's `FindOrCreateBlogTag`, with the whole
post-plus-tags write atomic.

Separately, deleting a blog category that any post still references is refused with a message naming
the exact count, drafts included, at every privilege level including Super Admin — and deleting an
unused category continues to work exactly as story 0058 built it.

Publishing a post announces it: both paths that reach `Published` from this story — an update into it
and a creation already in it — dispatch story 0065's `NotifyBlogPostPublished` after the commit, once
per transition and never on a re-save or a restore (**D-19**). 0064's scheduled sweep is the third
such path and dispatches it too.

Nothing is user-visible yet: the screens that consume this are stories 0062 and 0063, the scheduled
auto-publish transition is 0064, and the notification itself — its content, recipients and channel —
is 0065's.

## Acceptance criteria
- [ ] `blog_posts` exists with `id` (UUID v7 PK), `blog_category_id` (**NOT NULL** FK,
      `restrictOnDelete`), `title`, `slug` (unique), `body` (**nullable**), `status`, `published_at`
      (nullable), `created_at`, `updated_at`, `deleted_at` (nullable) — and nothing else.
- [ ] `blog_post_tag` exists with `blog_tag_id` + `blog_post_id`, a composite primary key, **both**
      FKs `cascadeOnDelete()`, no surrogate `id` and no timestamps — the exact contract 0059's **D-8**
      wrote for this story.
- [ ] **Neither table carries a hand-written index on any FK column**, verified with
      `php artisan db:table` after migrating rather than by reading the migration.
- [ ] `App\Models\BlogPost` uses `HasUuids` **and `SoftDeletes`**, casts `status` to `BlogPostStatus`
      and `published_at` / `deleted_at` to `datetime`, and exposes `slug` / `published_at` as
      **non-fillable**.
- [ ] **Deleting a post is recoverable**: the row survives with `deleted_at` set, disappears from
      every default query and from both scopes, keeps its `blog_post_tag` rows, keeps its slug
      reserved, and a restore returns it with title, body, category and tags intact. `BlogPost`
      overrides **no** `delete()` and obfuscates nothing.
- [ ] **`App\Actions\Blog\RestoreBlogPost` exists**, authorizes **`restore`** as its own first
      statement, logs its refusals, and restores through the model instance. A restored post reclaims
      its own slug and does not regain a tag deleted meanwhile.
- [ ] **`BlogPostPolicy` defines five abilities over four permission strings**: `restore` gates on
      **`blog.edit`**, so a `blog.delete`-only actor can delete a post but not bring it back. **No new
      permission is added to the seeded catalog.**
- [ ] **No force-delete path exists anywhere in `app/`** — `forceDelete()` has no caller.
- [ ] **Publishing a post dispatches story 0065's `NotifyBlogPostPublished`, from both of this story's
      two paths**: an update transitioning **into** `Published`, **and a post created already
      `Published`** — the third trigger, which neither this story's original D-19 nor 0064's hand-off
      accounted for. Both dispatch **after the commit** and only on the success path.
- [ ] **It fires once per transition and never otherwise**: re-saving an already-`Published` post, a
      `Draft` or `Scheduled` save, a failed/rolled-back save, and a `RestoreBlogPost` on a
      previously-published post each dispatch **zero** times.
- [ ] **This story defines no notification class, channel, recipient list or observer** — it calls
      0065's action and nothing more.
- [ ] **`UpdateBlogPost` calls `$blogPost->refresh()` as its literal first statement**, before
      `Gate::authorize()` and before the pre-save status read (**D-19a**), so a **stale** caller
      instance cannot produce a duplicate notification and a **dirtied** one cannot smuggle a column
      the action does not own into the `UPDATE`.
- [ ] **A trashed post still blocks its category's deletion**, and the block's count includes it — the
      count is `withTrashed()`, matching what the `restrictOnDelete()` FK itself counts.
- [ ] **A `Draft` may be saved with an empty or null body; `Published` and `Scheduled` may not** — the
      rule fires on the create path *and* on a Draft→Published promotion, and it is expressed as a
      status-parameterised rule rather than `required_if`.
- [ ] `slug` is derived from `title` by a `saving` hook on every write that changes `title`, and is
      never accepted from the caller.
- [ ] A post can be created with all core fields; blank, over-length, missing-required and
      unknown-category inputs are each refused with a validation message and write no row.
- [ ] **A forged `status` value is refused by validation, never as an uncaught `\ValueError`.**
- [ ] **Status governs `published_at` completely**: `Draft` stores null whatever is submitted;
      `Scheduled` requires a strictly future date; `Published` accepts a past date and stamps `now()`
      when none is given; and **editing an unrelated field on a `Scheduled` post whose date has
      already passed still succeeds**.
- [ ] **The body is sanitized before it is persisted**, on the create path *and* the update path,
      through story 0024a's existing sanitizer and its existing allow-list — **no second allow-list is
      added** — and an `<img>` inserted from the shared media gallery survives it intact.
- [ ] A post can hold multiple tags; submitting a name reuses an existing tag (including one
      differing only by case or accent) and an unknown name creates one, through 0059's
      `FindOrCreateBlogTag` and no other path.
- [ ] **The post write and its tag sync are atomic**: a refusal during tag resolution leaves neither
      the post's own columns nor any pivot row committed.
- [ ] **`App\Actions\Blog\SyncBlogPostTags` is the only writer of `blog_post_tag` anywhere in `app/`.**
- [ ] **Deleting a blog category assigned to N posts is blocked with a message stating N**, the
      category survives, drafts count towards N, there is no confirm-and-proceed path at any privilege
      level, and the database FK refuses independently if the application check is ever bypassed.
- [ ] The block's refusal is a `ValidationException` keyed on **`blogCategoryId`**, rendered through
      `trans_choice()` for both the singular and the plural.
- [ ] Deleting an unused blog category still works exactly as story 0058 built it, and 0058's own
      delete tests pass **unmodified**.
- [ ] **Deleting a tag really does remove it from every post that used it**, proven against the real
      pivot — closing the residual risk 0059's **R-6** named and could not test.
- [ ] Authorization is expressed in `BlogPostPolicy` **and enforced by each action itself**, with both
      an allow and a deny test per ability, a narrowness test per ability, and a direct-call refusal
      test per action.
- [ ] `lang/en/blog.php` and `lang/es/blog.php` are created key-for-key identical, and no user-facing
      string is hardcoded.
- [ ] No route, Livewire component, Blade view, browser test, `config/modules.php` entry or
      permission-catalog change is added, and `App\Actions\NormalizeForSearch` is neither called nor
      modified.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] All **three** quality gates run **unscoped** and each result recorded explicitly, including any
      that was not run: `php artisan test` (not `--filter`), `vendor/bin/pint --format agent` (not
      `--dirty`), and **Larastan level 7** (`vendor/bin/phpstan analyse`). The third is the one
      nothing else prompts you to run, and a record naming only two of the three is a record of two
      gates — see
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26).
      **This story registers a model event, so its blast radius is the whole suite by construction**;
      the unscoped run is not optional.
- [ ] Index reality verified with `php artisan db:table blog_posts` **and**
      `php artisan db:table blog_post_tag` after migrating — not by reading the migrations.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). **Point the audit at D-14 specifically**: that the body
      is sanitized on both write paths, that the reused allow-list was not widened, and that the
      sanitize-then-validate ordering holds.
- [ ] Documentation updated (docs-keeper): `docs/database/schema.md` gains `blog_posts` and
      `blog_post_tag` sections plus ER entities and the deliberate-index-omission notes;
      `docs/architecture/authorization.md` gains `BlogPostPolicy`; `docs/conventions/base-standards.md`'s
      directory listing gains `App\Models\BlogPost`, `App\Enums\BlogPostStatus` and
      `BlogPostValidationRules`; **[ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md)'s
      "future" list drops Blog Posts** — verified: its line 11 currently reads *"Blog Categories, Blog
      Tags, Blog Posts — future, PRD Epic 4 … not yet implemented"*, and this story is the last of the
      three, so that whole line goes.
- [ ] **Hand-off recorded for story 0062** (blog categories UI): the delete-confirmation modal binds
      its `@error` outlet to the error-bag key **`blogCategoryId`** verbatim (**D-18**), renders the
      `trans_choice()` message rather than composing its own count string, and offers **no**
      confirm-and-proceed control at any privilege level. It must also call `Gate::authorize()` in the
      component as well — defence in depth, a layer and not a redundancy. **And one thing it cannot
      infer from the message alone (D-7d):** the count it renders includes **trashed** posts, so an
      administrator may be blocked by posts that appear nowhere in 0063's list. 0062 should not try to
      fix that in its own copy; the exit is 0063's trash affordance below.
- [ ] **Hand-off recorded for story 0063** (blog list + post editor UI), now carrying a **fourth,
      load-bearing** item: it consumes `scopeForCategory()` / `scopeForTag()` for its list filters
      (**D-11**); it passes the **complete** tag-name set on every save, since an omission detaches
      (**D-17**); it must never call `SyncBlogPostTags` or `FindOrCreateBlogTag` directly, only the
      post actions; it extends `lang/{en,es}/blog.php` rather than creating it; **and it must provide
      a way to reach trashed posts**, and **restore** from there. Without one, **D-7d**'s category
      block has no exit: a category can be permanently undeletable because of a post no screen
      displays. Both scopes and the list's default query exclude trashed rows, so this is a deliberate
      second view rather than a filter toggle. **The action it calls ships here (D-20) — 0063 must not
      author one**, per the convention that a UI story consumes `app/Actions/` and never writes to it:

      ```php
      // resolve with withTrashed(): a default query cannot see the row
      $post = BlogPost::withTrashed()->findOrFail($id);

      ($restoreBlogPost)($post);   // App\Actions\Blog\RestoreBlogPost::__invoke(BlogPost): bool
      ```

      Method-inject `RestoreBlogPost` on the Livewire action method, per
      [code-style.md](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method).
      Gate the row control on **`blog.edit`**, not `blog.delete` (**D-20**) — so the per-row
      `Gate::allows('restore', $post)` hint mirrors what the click actually does. **Force-delete is
      deliberately not available**; restore is the only exit, and it is sufficient.
- [ ] **Hand-off recorded for story 0060** (tag management UI), and it is a **"change nothing"**
      hand-off rather than an obligation: a plain `withCount('posts')` on the tag list already
      **excludes** soft-deleted posts, because the count subquery applies `BlogPost`'s
      `SoftDeletingScope` (**D-7c**). That is the right number for a screen, so 0060 needs no
      adjustment. What 0060 must **not** do is copy **D-7d**'s `withTrashed()` — that scope belongs to
      a guard fronting a `restrict` FK, and on a rendered usage count it would report posts the reader
      cannot see.
- [ ] **Hand-off recorded for story 0064** (scheduled auto-publish): this story ships the column and
      the validation rule, **never** the scheduler. 0064 needs exactly three facts from here — the
      column is `published_at` (nullable `timestamp`), the status is `BlogPostStatus::Scheduled`, and
      the query it runs is
      `BlogPost::where('status', Scheduled)->where('published_at', '<=', now())`, served by the
      `(deleted_at, status, published_at)` composite index this story adds (**D-9**). 0064 owns
      **only** an Artisan command and its schedule entry — no migration, no column, no model change.
      Two further constraints it inherits from **D-7**: the sweep must **not** use `withTrashed()`, so
      a deleted scheduled post never silently goes live (the default `SoftDeletingScope` gives it
      that for free — the risk is adding `withTrashed()` by reflex), and the index's leading
      `deleted_at` is what keeps that scoped query a leftmost-prefix match. It must also decide
      whether flipping the status writes through `UpdateBlogPost` (inheriting its authorization, which
      a console caller has no actor for) or through a narrower dedicated action; that is 0064's
      decision, flagged here so it is not discovered late.
- [ ] **Hand-off recorded for story 0065** (published-post notification): the four confirmed
      notification events in [PRD](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications)
      include *"a blog post is published or a scheduled post goes live"* — which enumerates
      **outcomes**, and **three** code paths reach them (**D-19**): an update **into** `Published`, a
      **creation already `Published`**, and 0064's scheduled sweep. **This story owns the first two
      and dispatches 0065's `NotifyBlogPostPublished` from both**; 0064 owns the third. 0065 therefore
      defines the notification — what it contains, who receives it, the channel, whether it queues —
      and this story owns only *when it is called*. **One eligibility constraint it inherits from
      D-7/D-20:** a **restored** post must not re-fire. Restoring a previously-published post fires
      `restoring`/`restored` while leaving `status` at `Published`, so **D-19**'s
      transition-not-state guard already excludes it and `RestoreBlogPost` deliberately dispatches
      nothing — but an observer keyed on `saved` or `restored` would re-announce a post subscribers
      already heard about, and 0065 is the story that picks. Recorded so it is a decision there rather
      than a surprise in production.
- [ ] Acceptance criteria met.

## Documented functional decisions

### D-1 — Domain artifacts only; no Livewire component, route or view

The UI is stories 0062/0063; building a screen now would either sit unrouted and untested end to end,
or invent a route the product owner has not asked for. This follows 0058's **D-1**, 0059's **D-1**,
0024's **D-1** and the `RequestEmailChange`/`ConfirmEmailChange` precedent. It also means **no
`config/modules.php` entry**: per [api/routes.md](../../docs/api/routes.md#app-owned-routes), a gated
module route and its registry entry ship together, and this story ships neither.

### D-2 — `blog_category_id` is NOT NULL with `restrictOnDelete()`

The load-bearing FK decision in the migration, and the one that makes **D-18**'s guard defence in
depth rather than the only protection.

- **Not `cascadeOnDelete()`.** It does the exact *opposite* of the requirement: deleting "Guías" would
  silently delete every post in it. The PRD hard-blocks that deletion with a count precisely so it
  cannot happen.
- **Not `nullOnDelete()`.** It would force the column nullable, permanently un-enforcing "a post has
  exactly one category" (PRD's own scenario), in exchange for a behaviour the PRD forbids. There is no
  PRD-sanctioned path where a post ends up categoryless as a side effect of a category delete.
- **`restrictOnDelete()` makes the block a database invariant.** It still refuses a bulk cleanup, a
  seeder, or `BlogCategory::where(...)->delete()` through the **query builder**, which per
  [base-standards.md](../../docs/conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder)
  skips model-level behaviour entirely.

This is the same reasoning `products.product_category_id` uses (0024 **D-9**/**D-14**), and it is the
*opposite* answer from `blog_post_tag`'s cascades (**D-8**) for a stated reason: a post carries
independently-authored content a cascade would destroy — the `sales_regions.parent_id` case — while a
pivot row carries no state of its own and is worthless once either parent is gone — the
`passkeys.user_id` case.

`constrained()` needs **no** explicit table-name argument here: `blog_category_id` correctly infers
`blog_categories`, unlike `sales_regions.parent_id`, which would infer a `parents` table.

**NOT NULL forecloses an "uncategorised" post entirely**, and two consequences follow that are worth
recording now rather than discovering at Phase 3: `CreateBlogPost`'s category parameter is mandatory
with no empty branch and 0063's category selector gets no "none" option; and **D-18**'s guard has no
escape hatch — reassignment to a *different* category is the only way to free one, never reassignment
to null.

⚠️ **`BlogPost` soft-deletes (D-7), and that makes this FK *stronger*, not weaker — but it also
makes the application-level count wrong unless it is written for it.** The direction is worth being
precise about, because the neighbouring precedent points the opposite way. 0024's **R-11** warns that
adding `SoftDeletes` to `ProductCategory` — the **parent** — would disarm the database half of its
guard, since a soft-deleted parent is an `UPDATE` and never triggers an FK. Here it is the **child**
that soft-deletes, and the consequence inverts: a trashed post is still a physical row holding a live
`blog_category_id`, so `restrictOnDelete()` refuses the parent's deletion whether or not the child is
trashed. Nothing is disarmed. What that does create is a mismatch with any count written in PHP —
resolved in **D-7d**, which is why the guard counts `withTrashed()`.

### D-3 — `slug` ships in this story, unique, derived from `title` by a model hook *(recorded dissent)*

**`backend-expert` argued for omitting `slug` entirely**, on two real grounds: PRD assumption 14 lists
slug/SEO fields under Epic 5's translatable content, and nothing in this phase resolves a post by URL
(PRD's [Out of scope](../../docs/PRD/PRD.md#out-of-scope) excludes public storefront browsing), so a
column no route reads is speculative scaffolding of the kind `sales_regions`' **D-6** and 0058's
**D-6** consistently reject.

**`database-expert` argued for including it, and the facilitator adopted that**, on the argument that
actually distinguishes this case from 0058's: **assumption 14 names slug/SEO fields for *posts*
specifically**, and 0058's own **D-6** leans on that distinction in the opposite direction — *"the PRD
distinguishes the two, and inferring a category slug from a post requirement would be inventing
scope."* The inverse of that sentence is the argument for a post slug: the PRD named the post, so
including it is honouring scope rather than inventing it. It is also what the story brief scoped in.

**Derived, never accepted from the caller.** `slug` is omitted from `#[Fillable]` and written by a
`saving` hook guarded on `isDirty('title')`, mirroring 0058's and 0059's `normalized_name` hooks
exactly so the three Epic 4 tables cannot drift:

```php
// app/Models/BlogPost.php
protected static function booted(): void
{
    static::saving(function (self $post): void {
        if ($post->isDirty('title')) {
            $post->slug = Str::slug($post->title);
        }
    });
}
```

Note **`booted()`, not `boot()`** — the `App\Models\Role` precedent is a vendor-hook-ordering
workaround for a subclassed package model and does not apply to a class extending `Model` directly.
The same three constraints 0058's **D-12(b)** records apply here: guard on `isDirty()`, and treat the
blast radius as the whole suite, since a model event binds every `BlogPost` in every test.

**`Str::slug()`, explicitly not `NormalizeForSearch`** — see **D-10**.

**Unique**, because a duplicate slug is a real, distinguishable-from-fine bug (two posts silently
competing for one URL), which earns a genuine constraint rather than application discipline. What
happens on a **collision** is **OQ-2**. Width 255, matching `title`, since `Str::slug()` output tracks
its input roughly 1:1 and a tighter cap would create a silent truncation-then-collision failure mode
for a long title.

**The Epic 5 cost, stated rather than avoided**, exactly as 0058's **D-7** does for `name`: once
`title`/`slug` become per-locale translatable fields, uniqueness moves to whatever child table holds
the per-locale value and this story's unique index gets dropped in that migration. Build the correct
table for today's requirement; let Epic 5 pay its own cost.

### D-4 — `body` is `mediumText`, **nullable** *(the type diverges from the story brief — see OQ-3)*

> ✅ **Nullability confirmed by the product owner, 2026-08-27.** The escalated question — *may a Draft
> be saved with an empty body?* — was answered **yes**: a Draft may carry an empty or null body, while
> **Published and Scheduled must have a non-empty one**. That is what the column and the rule below
> now express, and it is no longer an open question. Only the **type** (`mediumText` vs. `LONGTEXT`)
> remains open, as **OQ-3**.

**The column is nullable**, so `null` is the representation of "not written yet" and the schema
permits the state the product owner confirmed. **The validation rule is what enforces the
distinction**, parameterised on the submitted status exactly like `publishedAtRules()` (**D-6**) —
one mechanism for both status-dependent fields rather than two:

```php
protected function bodyRules(BlogPostStatus $status): array
{
    return match ($status) {
        BlogPostStatus::Draft => ['nullable', 'string'],
        BlogPostStatus::Published,
        BlogPostStatus::Scheduled => ['required', 'string'],
    };
}
```

**`match` on the typed parameter, deliberately not `required_if:status,published`.** The actions take
`BlogPostStatus $status` as a **typed constructor-style argument**, not as a form field, so the
validated data array a direct caller passes need not contain a `status` key at all — and
`required_if` silently treats an absent other-field as "condition not met", i.e. it would **fail
open** and let a bodiless Published post through on exactly the call path that has no HTTP request
behind it. Matching on the parameter cannot fail that way. (`required_if` would be the right shape if
the status arrived in the same `$validated` array; it does not.)

**`required` rather than `filled`**, because `required` already refuses `''`, `null` and a
whitespace-only string once trimmed — and the actions trim the body before validating, the same
ordering **D-14**'s sanitize-then-validate rule imposes.

**The promotion path is the case that makes this more than a create-time rule.** A Draft saved with
no body, later switched to Published, must be refused **at that transition** — the rule reads the
**submitted** status, so it fires on `UpdateBlogPost` exactly as it does on create, with no second
guard needed. It has its own scenario and its own test.

### D-4b — Why `mediumText` rather than `LONGTEXT` *(diverges from the story brief — see OQ-3)*

⚠️ **The story brief specified `LONGTEXT`. `database-expert` argued for `mediumText` and the
facilitator adopted it**; this divergence is recorded loudly rather than applied silently, and
**OQ-3** exists so the product owner can overrule it.

The argument: `products.description` is `mediumText` (0024's **D-4**) for a reason that transfers
directly — a `TEXT` column's 65,535 **bytes** against a `max:` rule counting **characters** is a
silent `22001` waiting to happen once a WYSIWYG starts emitting markup, and `MEDIUMTEXT` (16 MB)
makes the validation rule the binding limit instead. Against `LONGTEXT` (4 GB): no legitimate authored
post gets within three orders of magnitude of 16 MB — a very long, heavily formatted post with 200
`<img src="…">` tags lands comfortably under 1 MB — and choosing the unbounded type removes the one
structural signal that a runaway payload (someone defeating the no-base64 policy and inlining a
multi-megabyte image) is a bug rather than content. **These are estimates from markup arithmetic, not
measurements**; `vendor/` is absent from this worktree so nothing here was executed.

**No cast** — it is HTML; an `array`/`json` cast would corrupt it.

**Consequence to implement knowingly** (`database-expert`'s point, and the same one 0024 recorded as
its **R-9**): in InnoDB DYNAMIC a short `MEDIUMTEXT` value stays **inline** and fattens the clustered
index, the exact defect [schema.md](../../docs/database/schema.md) records for `users`' two `TEXT`
columns. The mitigation is a query rule, not a schema one: **0063's blog list must select explicit
columns, never `SELECT *`** (**R-7**).

### D-5 — `status` is a `string(20)` column + a PHP backed enum, **with** a default

`string` + a PHP backed enum over a native MySQL `enum`, the precedent `users.status` and
`sales_regions.kind` both set: a native `enum` needs DDL for each new value and orders by ordinal,
while `Rule::enum(BlogPostStatus::class)` is the validation boundary so the database need not
re-enforce the value set.

**It takes a `->default('draft')`, and this is the one place the column diverges from
`sales_regions.kind`'s deliberate no-default rule** — for the reason 0024's **D-6** already drew out.
`sales_regions.kind` has no default because every row there is written explicitly by a seeder, so a
default would let a mis-seeded row pass as a `Country`. `blog_posts` is the opposite case: every row
originates from a human filling in a create form, and a post genuinely has a natural starting state
before its author has decided to publish anything. That state is Draft, which is what the PRD's own
list screenshot shows as the first badge. `products.status` defaults to `draft` on identical
reasoning; this story applies the *defaulted* branch of 0024's own distinction rather than inventing a
new rule.

### D-6 — One `published_at` column, whose meaning is fixed by the status beside it *(recorded dissent on naming)*

**One nullable `timestamp`, named `published_at`, not two columns and not `scheduled_for`.**

| Status | `published_at` | Meaning |
| --- | --- | --- |
| `Draft` | always `null` | not committed to any date |
| `Scheduled` | a **strictly future** datetime | the instant it is due to go live |
| `Published` | a past-or-present datetime | the instant it went live |

"Scheduled" **is** "published in the future" — the standard CMS shape — not a distinct concept needing
its own column. *Rejected:* the two-column alternative (`scheduled_for` for intent, `published_at` as
an immutable "went live" fact). Nothing in 0061–0065's stated scope reads the *original* scheduled
instant once a post actually publishes, so the second column would carry no consumer.
**`published_at` over `scheduled_for`** because two of the three statuses use it for a publication
fact and only one for an intention; naming it after the minority case would misdescribe it two-thirds
of the time.

**The invariant is a validation rule parameterised on the submitted status**, not a database
constraint — the same placement `sales_regions.is_default`'s single-default invariant uses (enforced
by the action, not the DDL):

```php
protected function publishedAtRules(BlogPostStatus $status): array
{
    return match ($status) {
        BlogPostStatus::Draft => ['prohibited'],
        BlogPostStatus::Scheduled => ['required', 'date', 'after:now'],
        BlogPostStatus::Published => ['nullable', 'date'],
    };
}
```

`after:now` is **strictly** `>`, which is the intended boundary: a date equal to the current instant
is not meaningfully "scheduled", it is already publishable. Assert it **from both sides**, per
[step-up-authentication.md](../../docs/security/step-up-authentication.md)'s rule for telling `>` from
`>=`.

Three behaviours the rule alone cannot express, which the actions enforce as defence in depth:

- **A `Draft` save nulls `published_at`** regardless of what was submitted, rather than trusting
  `prohibited` alone. Leaving a stale future date on a `Draft` row looks fine in every UI and corrupts
  the invariant the moment the row is re-promoted (**R-2**).
- **A `Published` save with no date stamps `now()`.** A published post with no publication date has no
  coherent meaning and would render as a blank in 0063's date column.
- **⚠️ The `after:now` rule applies only when `published_at` is actually being changed, or when the
  status is transitioning *into* `Scheduled`.** This is `backend-qa`'s sharpest finding and it is a
  real trap: an editor retitling a `Scheduled` post whose date has already passed (0064 has not flipped
  it yet, or 0064 does not exist) resubmits the stored date, and an unconditional `after:now` refuses
  the save. The failure appears only once real time has passed the stored date, which is exactly the
  kind of bug that ships green. It has its own test, named as the most important case in its file.

### D-7 — `BlogPost` uses `SoftDeletes` *(human-confirmed 2026-08-27)*

> ✅ **Confirmed by the product owner.** The escalated question — *should a deleted post be
> recoverable?* — was answered **yes**, on the reasoning `database-expert` raised during the debate
> and the facilitator escalated rather than settling: **a post is a far stronger "I need that back"
> candidate than a taxonomy label.** Accidentally deleting a 3,000-word article is a materially
> different loss from deleting a tag name, and `status = Draft` does not cover "I deleted a
> *published* post by mistake" at all. `blog_posts` therefore gets `deleted_at` and the model gets
> `SoftDeletes` — making `BlogPost` the **second** model in this repo to use it, after
> `App\Models\User` (task 0005).

**This deliberately diverges from its two Epic 4 siblings, and the divergence is the decision.**
0058's **D-3** and 0059's **D-5** both hard-delete, and both are still right: a category or tag row is
a **label**, trivially re-creatable by retyping its name, and 0059's case is stronger still because a
soft delete would actively break the pivot cascade its PRD scenario depends on. Neither argument
transfers to a row whose content *is* the work. The three taxonomy arguments, taken in turn:

- **The `Rule::unique()`-does-not-see-trashed-rows point still holds, and here it is a *feature*, not
  a cost.** It is what makes the slug stay reserved with no code — see **D-7b**.
- **The pivot-cascade point applies to the post side, and its consequence is the opposite of a
  problem.** A soft delete is an `UPDATE`, so `blog_post_tag.blog_post_id`'s `cascadeOnDelete()` never
  fires and the post's pivot rows **survive**. That is exactly what makes a restore lossless: the post
  comes back with its tags still attached. Destroying them on delete would make "recoverable" a lie.
- **PRD assumption 17** rules out an **audit / change-history log** — a record of *who changed what,
  when*. That is a different feature from an undo window on a single destructive action, and reading
  it as forbidding this was the over-reading the escalation existed to catch.

**Three interactions this creates, each answered below rather than left to be discovered:** what a
delete does to the slug (**D-7b**), what it does to the pivot (**D-7c**), and — the one that changes
shipped behaviour in this very story — what it does to **D-18**'s count guard (**D-7d**).

### D-7b — The slug stays reserved on delete; there is **no** `delete()` override

`App\Models\User::delete()` obfuscates `email` so the address is freed for reuse. **`BlogPost` does
the opposite: it overrides nothing, and a trashed post keeps its slug.** Three reasons, in descending
weight:

1. **A restore must return the post to its own URL.** Obfuscating the slug would mean a restore either
   cannot recover it (permanent link rot on a post that was deliberately brought back) or must
   re-derive it — and re-derivation can then collide with a slug taken in the meantime, so the restore
   *fails*. Restorability is the entire content of **D-7**; a design that makes restore lossy or
   fallible defeats the decision that motivated it.
2. **Nobody is blocked by the reservation.** An email address is a real-world identifier a *different
   person* may legitimately need, which is what justifies freeing it. A slug is derived from a title,
   and an editor reusing a title simply gets `mi-post-2` from **OQ-2**'s collision handling. The cost
   is one suffixed slug; the cost of the alternative is a broken restore.
3. **`User`'s own stated reason does not transfer.** [schema.md](../../docs/database/schema.md#soft-deletes)
   gives two: freeing the address, and **revoking everything keyed by that string** —
   `password_reset_tokens`, which has no FK and would otherwise hand a live reset link to whoever
   claims the address next. **Nothing in this database is keyed by a blog slug**: no tokens, no auth,
   no string-joined table. The security half of the `User` pattern is entirely absent, so copying its
   shape would be cargo-culting a fix for a problem this model does not have.

**It costs no code, which is the tell that it is the right default.** `Rule::unique()` does **not**
apply the soft-delete scope (verified on `users`), so the unique index and the validation rule both
already see trashed rows — "stays reserved" is what happens if nobody writes anything, and *freeing*
the slug would be the change requiring deliberate work.

**Recorded consequence:** a trashed post permanently holds its slug, invisibly. An editor who reuses
its exact title gets `botas-de-invierno-2` while `botas-de-invierno` sits in the trash. Mild, and
self-explanatory once the trashed post is found — which is what makes 0063's trash affordance
(**D-7d**) worth having for a second reason.

### D-7c — The pivot rows survive a soft delete, deliberately

`blog_post_tag.blog_post_id` is `cascadeOnDelete()` (**D-8**) and a soft delete is an `UPDATE`, so
**the cascade does not fire and the post keeps its tag associations while trashed.** That is required
for the lossless restore **D-7** exists to provide, and it is the one place this story's soft delete
and 0059's hard delete interact:

- **0059's own cascade is unaffected.** Tags are still hard-deleted (0059's **D-5**), so
  `DeleteBlogTag` still detaches the tag from every post — *including trashed ones*, which is correct:
  a tag that no longer exists should not come back attached to a restored post.
- ✅ **A tag's "used by N posts" count excludes trashed posts by default, which is the behaviour a
  screen wants — so story 0060 needs to do nothing.** `withCount('posts')` applies `BlogPost`'s
  `SoftDeletingScope` **inside the count subquery**, so a trashed post drops out of the count without
  anyone asking. Including trashed rows is the thing that takes deliberate work:

  ```php
  // app/Livewire/Roles/Index.php:324 and :408 — the shipped opt-in, and the proof of the direction
  ->withCount(['users' => fn ($query) => $query->withTrashed()])
  ```

  Both of that screen's call sites write the constrained closure rather than a bare
  `withCount('users')`, and they do so in a screen whose holder count is **required** to include
  trashed holders (`schema.md` and `Role::guardAgainstHolders()` both say so). **An explicit opt-in is
  only necessary against a default that excludes** — if `withCount()` already included trashed rows,
  that closure would be a no-op nobody would have written, twice. **Verified by reading real shipped
  code that demonstrates the opt-in is necessary, not by execution** (`vendor/` is absent here —
  **V-8**); three independent readings agree on the direction, which is why it is stated as a fact
  rather than left open.

  ⚠️ **The hazard is the opposite of what it first looks like, and it is adjacent in this very file.**
  **D-7d**'s category guard *requires* `withTrashed()`, because a `restrict` FK counts trashed rows. A
  tag's usage count *must not* have it, because a screen showing "used by 3 posts" when two are in the
  trash is lying to the reader. **The two counts sit two decisions apart and want opposite scopes** —
  so the copy-the-neighbour mistake here over-counts a tag rather than under-counting a category. The
  discriminator is what the number is *for*: **a guard fronting a foreign key counts what the database
  counts; a number rendered to a human counts what the human can see.**

### D-7d — A trashed post **still blocks** its category's deletion, and the count says `withTrashed()`

This is the interaction most likely to be got wrong, and it is **forced** rather than chosen.

`blog_posts.blog_category_id` is `restrictOnDelete()` (**D-2**), and **a trashed post is still a
physical row holding a live foreign key**. So `DELETE FROM blog_categories …` is refused by MySQL
whether or not the referencing post is trashed. An application count that *excluded* trashed posts
would therefore pass its own guard, hit the FK, and land in **D-18**'s `23000` catch — which re-counts
and, excluding trashed rows again, would report **"this category is used by 0 posts"**. A refusal
message stating zero is worse than no message.

**So the count is `$blogCategory->posts()->withTrashed()->count()`, and the guard blocks on a trashed
post exactly as on a live one.** The rule generalises: **an application-level in-use guard sitting in
front of a `restrict` FK must count exactly the rows that FK counts** — which is all of them, since a
foreign key has no notion of a soft delete.

This repo has made the identical call once already, for a different underlying reason, and the
precedent is worth reading beside this one — `App\Models\Role::guardAgainstHolders()`, verified at
`app/Models/Role.php:341`:

```php
// withTrashed(): a soft-deleted holder still counts. The morph
// relation otherwise applies User's SoftDeletingScope, so a trashed
// holder would silently count as zero, this guard would let the
// delete through, and the FK cascade on model_has_roles would then
// destroy that holder's role grant with no error anywhere
if ($this->users()->withTrashed()->exists()) {
```

There the danger is a **cascade destroying data**; here it is a **restrict refusing the statement**.
Opposite mechanisms, same conclusion — which is what makes "count what the FK counts" the durable
form of the rule rather than "copy `Role`".

⚠️ **The accepted cost, recorded rather than glossed: an administrator can meet a block naming posts
they cannot see.** "This category is used by 1 post — reassign it before deleting" is unactionable if
that post is in the trash and no screen lists trashed posts. Three notes. **(a)** It is *correct* — the
data really is still referenced, and silently allowing the delete is not an option the FK offers.
**(b)** It is **not** an argument for excluding trashed posts from the count, for the reason above.
**(c)** It is a real obligation on **story 0063**, recorded in the Definition of Done: the blog list
needs a way to reach trashed posts, and the exit from this block is a **restore**. Since 2026-08-27
this story ships `RestoreBlogPost` for exactly that (**D-20**), so 0063 builds the affordance and
calls the action rather than authoring one. Force-delete is still **not** shipped and is not required
to clear the block: restoring a post and reassigning its category frees the original just as
reassigning a live post's does.

### D-8 — The `blog_post_tag` pivot is exactly the shape 0059's D-8 specified, confirmed rather than inherited

`database-expert` was asked to challenge it and **confirmed it without changes**, having worked the
reasoning through against both real read patterns rather than accepting the sibling story's authority:

- **`blog_tag_id` leads the composite PK.** `WHERE blog_tag_id = ?` (0063's post-list-by-tag filter)
  is then served by the clustered index's own leftmost prefix, and because InnoDB physically orders
  rows by the PK, every pivot row for one tag is **contiguous on disk** — a tight range scan rather
  than scattered I/O.
- **`WHERE blog_post_id = ?`** (the editor loading a post's tags) is *not* a leftmost prefix, but
  InnoDB auto-creates a supporting index on any FK column not already covered, which `constrained()`
  triggers at zero migration cost. **So both read patterns are served regardless of the PK's column
  order**; what the ordering buys is the contiguity above, and the tag-filtered list is the
  higher-traffic, unbounded-result-set read of the two. There is no argument for reversing it, and
  reversing it purely for symmetry with `product_media`'s `(product_id, media_id)` — which orders
  around gallery position, a completely different need — would be worse, not neutral.
- **Both sides `cascadeOnDelete()`.** A pivot row carries no state of its own and is worthless once
  either parent is gone — the `passkeys.user_id` case, not the `sales_regions.parent_id` one. This is
  the constraint 0059's `DeleteBlogTag` docblock records as a **load-bearing cross-story promise**:
  its delete is unconditional *because* the database detaches. Writing `restrictOnDelete()` here would
  turn every in-use tag deletion into a database error and silently contradict 0059's own shipped
  test — and 0059's **R-6** names this story's author as the person most likely to make that mistake
  by copying `sales_regions`' habit. **Note the asymmetry `SoftDeletes` introduces (D-7c):** the
  `blog_tag_id` cascade fires (tags hard-delete), while the `blog_post_id` cascade does **not** fire on
  a soft delete — so a trashed post keeps its tags and a restore is lossless. Both halves are correct;
  they simply have different triggers now.
- **No surrogate `id`, no `timestamps()`.** `role_has_permissions` is this repo's real composite-PK
  pivot precedent and carries neither — verified at
  `database/migrations/2026_07_12_181045_create_permission_tables.php:114`. Nobody needs to know
  *when* a tag was attached, only *that* it is.
- **No `position` column.** `product_media` has one because gallery ordering is a real editable fact
  about the pivot row; tags are conventionally an unordered set, and nothing in the PRD orders them.
  Do not add one by reflexive analogy — that is an additive migration if it is ever actually asked for.

**Two migration files, not one.** `blog_post_tag` cannot be inlined into `create_blog_posts_table`,
because it FKs into `blog_tags` *and* `blog_posts` — the same reason `product_media` is its own file.

### D-9 — The `(deleted_at, status, published_at)` composite index, and why it departs from this repo's default

> **`deleted_at` leads, and that is a direct consequence of D-7 rather than a preference.**
> [schema.md](../../docs/database/schema.md#users) states the rule for `users.status` in as many
> words: *"If one is ever added it must be composite `(deleted_at, status)`, never plain `status`,
> because the `SoftDeletingScope` puts `deleted_at IS NULL` into every one of those queries."* Once
> `BlogPost` soft-deletes, 0064's sweep is really
> `WHERE deleted_at IS NULL AND status = 'scheduled' AND published_at <= ?`, so a `(status,
> published_at)` index is no longer the leftmost-prefix match for the query it exists to serve. This
> is the second-order effect of the confirmed soft-delete decision that the story's original index
> choice did not account for, and it costs nothing to get right now.

**Both experts independently recommended it, and both flagged the departure.** This repo's standing
rule (`users.status`, `sales_regions.is_active`/`kind`) is that a low-cardinality categorical column
on a 10²–10³-row backoffice table is close to the worst possible index candidate. Two things
distinguish this case:

- **Frequency and permanence.** `users.status` is read when a human opens a list. Story 0064's
  `WHERE status = 'scheduled' AND published_at <= NOW()` runs on a schedule, forever, and its cost
  compounds with table growth in a way an occasional click does not.
- **Selectivity is high for *this* predicate** even though `status`'s overall cardinality is low: at
  any moment `Scheduled` is a tiny minority of rows, so the cron touches a handful of index entries
  instead of scanning the table on every tick.
- **`blog_posts` is the one table in this domain with an unbounded growth story.** `users` is bounded
  by headcount and `sales_regions` is a fixed ~254-row catalog; years of published content is exactly
  the scenario where "add it when it's slow" becomes a migration-under-load rather than a clean
  `Schema::table()` on a small index.

**Neither column earns a standalone index.** `status` alone is the cardinality argument above.
`published_at` alone is worse than low-selectivity — its values are *meaningless* without the status
beside them, since a null, a future date and a past date coexist in one column with no shared ordering
semantics across statuses.

**Recorded honestly: this is speculative headroom, not a measured need.** At today's size a full scan
every 60 seconds is lost in buffer-pool noise. If Phase 2 prefers to defer it and let 0064 add it once
the scheduler's query plan is real, that is defensible and consistent with precedent — what must not
happen is the decision being silently defaulted either way (**OQ-6**).

### D-10 — This story does **not** use `NormalizeForSearch`, and `blog_posts` carries no `normalized_*` column

Stated explicitly because both sibling Epic 4 tables have one and a reviewer will look for it. Both
experts reached the same conclusion independently, on two separate grounds:

1. **`title` is not a uniqueness-gated taxonomy name.** [0032's D-N1](done/0032-shipping-geography-catalog-seed.md)'s
   whole premise is a catalog label that must be unique within its catalog, where "Guías" and "guías"
   are two humans meaning the same thing. Two posts can legitimately share a title (a series, a
   "Part 2"), so there is **no uniqueness rule on `title` at all** — normalized or otherwise — and
   therefore no TOCTOU race to close and no fold to store.
2. **`slug`'s uniqueness needs no shadow column, because a slug is already normalized by
   construction.** D-N1 exists to reconcile human-typed input against a byte-comparing PHP check and a
   case-insensitive collation. `Str::slug()` is *itself* a lowercasing, accent-stripping,
   ASCII-hyphenating transform, so by the time a value reaches the column the ambiguity is already
   collapsed. A `normalized_slug` would be indexing a fold of a fold.

**Consequences:** `Str::lower()` / `Str::ascii()` / any call to `App\Actions\NormalizeForSearch`
appearing in this story's model, trait or actions is a review finding — not because a second fold
would drift, but because it would be *wrong here*. And unlike 0058/0059, this story adds **no**
re-seed/recompute obligation to that shared class: a change to the project normaliser does not touch
`blog_posts` at all.

⚠️ `Str::slug()` and `NormalizeForSearch` are **different transforms for different jobs** and must not
be unified. A URL slug hyphenates and preserves word boundaries; a search fold collapses whitespace
and is not URL-safe. They coincidentally agree on case and accents, which is exactly what makes the
mistake plausible.

### D-11 — `BlogPost` ships `scopeForCategory()` and `scopeForTag()` for story 0063

PRD Epic 4's acceptance criteria explicitly require the admin list to filter by category and by tag,
and its `Scenario Outline: Filter the blog list by taxonomy` scripts both. Defining the scopes here —
while the FK and the pivot relation are freshly built and already under test — is cheaper and safer
than 0063 re-deriving an ad-hoc `whereHas` later, and matches this repo's existing shape for a
reusable filter (`Role::selectable()`).

```php
public function scopeForCategory(Builder $query, string $blogCategoryId): Builder
{
    return $query->where('blog_category_id', $blogCategoryId);
}

public function scopeForTag(Builder $query, string $blogTagId): Builder
{
    return $query->whereRelation('tags', 'blog_tags.id', $blogTagId);
}
```

Neither needs a new index: `forCategory` rides the FK's InnoDB-mandated index, and `forTag`'s join
benefits from `blog_post_tag`'s composite PK leading with `blog_tag_id` (**D-8**) — a genuinely happy
alignment, worth confirming with `EXPLAIN` at Phase 3 rather than assuming.

**Scope fence:** these are query helpers, not authorization. They do not filter by permission, and
0063 must not treat them as if they did.

### D-12 — The validation rule set, and its two status-parameterised members

```php
trait BlogPostValidationRules
{
    /** @return array<int, ValidationRule|array<mixed>|string> */
    protected function titleRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /** @return array<int, ValidationRule|array<mixed>|string> */
    protected function blogCategoryIdRules(): array
    {
        return ['required', 'string', Rule::exists('blog_categories', 'id')];
    }

    /** @return array<int, ValidationRule|array<mixed>|string> */
    protected function statusRules(): array
    {
        return ['required', Rule::enum(BlogPostStatus::class)];
    }

    // publishedAtRules(BlogPostStatus $status) — see D-6
    // bodyRules(BlogPostStatus $status)        — see D-4
    // tagNamesRules()                          — array of trimmed, non-blank strings
}
```

Two things carried deliberately. **`Rule::exists()` on the category, not a bare string** — so an
unknown id is a form error rather than a raw `QueryException` from the FK; the constraint is the
last-word backstop behind the rule, never the primary check, the same relationship
`CreateUser` has with the `users.email` unique index. And **`Rule::enum()` on the status**, which is
what keeps a forged value a `ValidationException` rather than the uncaught `\ValueError` task 0015's
finding F8 recorded — note that in a Livewire caller the enum cast can run *before* validation, so a
typed enum property is the trap and a string property validated with `Rule::enum()` is the fix. 0063
inherits that constraint.

`titleRules()`' `max:255` and the migration's `string('title', 255)` must stay in lockstep (**R-4**);
derive the boundary test from the same constant.

### D-13 — Every action authorizes itself, and every refusal is logged

All five actions call the policy as their own first statement, before reading or writing anything,
via `LogRefusedPrivilegedAttempt::authorize()` rather than a bare `Gate::authorize()` — the
[refusal-logging recipe](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail),
with `target_type: 'blog_post'` passed **explicitly** (the recipe records that `resolveTarget()`
auto-resolves only `User` and `Role`, so a new domain must pass it).

**Two idioms are live in this codebase and they disagree**, so the choice is stated rather than
inherited. `app/Actions/SalesRegions/` and both Epic 4 siblings (0058's **D-13**, 0059's **D-12**)
self-authorize; 0024's **D-15** deliberately does not. **This story follows the Blog folder's own
precedent**, because `app/Actions/Blog/` will already contain seven self-authorizing actions by the
time these land, and not following it would make one folder internally inconsistent — which is the
"third idiom" 0024's own D-15 warns against, arrived at from the opposite direction.

> ✅ **Strengthened, not weakened, on 2026-09-01 — the disagreement has largely dissolved.**
> [0024](done/0024-products-core-crud-backend.md) **reversed** its **D-15**/**RQ-10** at its three-way
> split (its **C-1**): the decision had rested on a claim that `App\Actions\Users\CreateUser` and
> `UpdateUser` contain no `Gate` call, and they do. Its four product actions now self-authorize. So
> this story's conclusion is unchanged and its *reasoning gets simpler*: there is no longer a genuine
> second idiom to weigh against — `Users/`, `Roles/`, `SalesRegions/`, `Media/` and now `Products/`
> all self-authorize, with `app/Actions/ProductCategories/` (0023) the one explicitly-flagged
> exception, deferred to 0025. Read "two idioms are live" as historical.

**Gating is the already-seeded `blog.*` tier; no new module slug.**
[architecture/authorization.md](../../docs/architecture/authorization.md) states granularity is
*"deliberately coarse per module: `products.*` covers categories and variants, `blog.*` covers
categories and tags"* — this story extends that framing to posts, which is the reading PRD Epic 1's
"Blog (with categories & tags)" as one permission-gated module already implies. Verified:
`RolePermissionSeeder::MODULES` contains `'blog'` and `ACTIONS` is the four CRUD verbs, so all four
strings exist today with **zero** seeder change.

`BlogPostPolicy` gets **five** abilities — `viewAny`, `create`, `update`, `delete` and **`restore`**
(**D-20**) — with the permission names as `public const` on the class that owns the rule, following
`SalesRegionPolicy` rather than `UserPolicy`'s repeated literals; the third policy in `app/Policies/`
to do so after 0058's and 0059's. **`restore` reuses `EDIT_PERMISSION`** rather than introducing a
fifth constant, because it is the same permission string, not a coincidentally equal one:

```php
public function restore(User $actor, BlogPost $target): bool
{
    return $actor->hasPermissionTo(self::EDIT_PERMISSION);
}
```

Five abilities over four permission strings is the first such mapping in this repo, and it is
deliberate — the ability names what the *actor is doing*, the constant names which *grant* allows it,
and **D-20** is where the two stop being one-to-one.

**`SyncBlogPostTags` does not re-authorize the post.** Its caller did, one statement above, in the
same request. What it does contribute is that every tag row it might create inherits
`FindOrCreateBlogTag`'s **per-branch** check (0059's **D-11**): `blog.view` to reuse an existing name,
`blog.create` to mint a new one. The user-visible consequence, stated plainly: **an actor holding
`blog.edit` but not `blog.create` can attach existing tags but is refused the moment a typed name is
new.** That refusal must surface, not be silently swallowed by dropping the unmatched name — dropping
it would be a second, undocumented interpretation of the editor's own input, and they would watch
"invierno" vanish with no explanation.

### D-14 — The `body` is sanitized on write, reusing story 0024a's sanitizer and its existing allow-list

**Not a new decision — an inherited constraint.** 0024's **D-16** carries a scope fence naming this
story in advance, verified verbatim at
`ai-spec/tasks/done/0024-products-core-crud-backend.md:1309-1311`:

> *"the sanitizer is applied to `products.description` only. 0021's WYSIWYG editor and Epic 4's blog
> body are separate stories; when the blog arrives it must **reuse this configuration** rather than
> define a second allow-list, or the two drift."*

So: **no new Composer dependency, no second `config/html-sanitizer.php`, no blog-specific allow-list.**
Sanitize **on write, before persistence** — the property that binds every call site forever, so a
seeder, an Artisan command or a future import inherits the guarantee without knowing it exists.
Sanitizing on render is bypassed by the first consumer that forgets, and this codebase already has the
rule that [a control enforced only in a component is bypassed by every other call site](../../docs/security/livewire-authorization.md).
The stored value is therefore always safe HTML, which is what will let 0063 render it unescaped.

**Would sanitizing strip the shared gallery's images? No — verified against both sides of the
contract, not assumed.** 0021's **D7** (`ai-spec/tasks/done/0021-wysiwyg-rich-text-editor-component.md:478`)
states the editor emits a **bare** `<img src="…" alt="…">` and nothing else, explicitly *because*
0024a's allow-list has no `<figure>`/`<figcaption>`; and 0024a's allow-list independently includes
exactly `<img src alt>` with http/https-only schemes. The two match by construction, because the
allow-list was scoped to what the shared toolbar can produce and the toolbar is shared with blog.

**Residual, flagged rather than asserted closed:** if the shared gallery (0020) ever inserts a
client-side preview `<img>` on a `blob:` or `data:` URI and that markup reached a saved body
un-swapped, the scheme allow-list would strip it. That belongs to 0020/0063's own suites, since this
story only consumes whatever markup the editor hands it — but it is why the `<img>`-survives test
above is a required case here rather than a nicety.

**Ordering:** sanitize before any length validation, per D-16's own constraint 1. In practice moot
here — see **OQ-3** on whether `body` carries a `max:` rule at all.

### D-15 — The post write and its tag sync are one transaction

`CreateBlogPost` / `UpdateBlogPost` wrap the post's own `save()` **and** the `SyncBlogPostTags` call in
a single `DB::transaction()`. Without it, a refusal during tag resolution (the `blog.create` branch of
**D-13**) leaves a post whose title, body and category committed while its tags did not — a worse
state than an outright failure, and one no error message describes.

⚠️ **Read [errors-log.md's transaction-wrapper entry](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21)
before writing this.** Wrapping code in a transaction is a change to **every** side effect that code
already performs, including ones the diff does not show. Two land inside this boundary and must be
examined deliberately rather than discovered: `FindOrCreateBlogTag`'s own insert — which 0059's
**D-10** deliberately leaves *untransacted*, resolving a lost `23000` race by re-querying rather than
throwing, and which must keep working inside an outer transaction — and
`LogRefusedPrivilegedAttempt`'s write, which is a log call and therefore unaffected by a rollback, so
a refused save still leaves its audit line. Neither is a reason not to wrap; both are reasons to state
what the wrap does.

### D-16 — `DeleteBlogPost` ships *(human-confirmed 2026-08-27)*

> ✅ **Confirmed by the product owner.** The escalated question — *is a post deletable at all, given
> PRD Epic 4's `Feature: Blog posts` scripts create, image-insert and one-category scenarios and **no**
> post-delete scenario, unlike its category and tag blocks?* — was answered **yes**, together with
> **D-7**'s soft-delete shape. The two were one decision: posts are deletable, and the deletion is
> recoverable.

The three supporting arguments raised in the debate, recorded because they are what a reviewer will
want to see rather than the confirmation alone:

1. **`blog.delete` is seeded and would otherwise be permanently dead.** `SalesRegionPolicy` is the
   precedent for the opposite call (0017 deliberately left `create`/`delete` undefined because that
   catalog is fixed and seeded), and the distinguishing test is whether a real path exists — for a
   fixed catalog it does not, for user-authored content it plainly does.
2. **0063's list needs it.** A backoffice content list with no delete row action is not a pattern this
   PRD's prototype shows anywhere.
3. **It gives the pivot's post-side behaviour a real caller to test through**, rather than a bare
   model `->delete()` in a test with no production equivalent.

**Its mirror image, `RestoreBlogPost`, ships alongside it** — see **D-20**, which supersedes this
decision's original "no restore path in this story" note.

### D-20 — `RestoreBlogPost` ships here, gated on `blog.edit` *(added 2026-08-27 at story 0063's request)*

> ✅ **Added after the fact, and the reason is a convention rather than a change of mind.** This story
> originally shipped `DeleteBlogPost` with no restore sibling, on the `App\Models\User` precedent
> where `SoftDeletes::restore()` exists on the model with **zero call sites** anywhere in the app —
> and left "reaching a trashed post" to 0063 as a UI affordance (**D-7d**). Story **0063**
> (blog-posts-list-editor-ui) then flagged the gap correctly: **a UI story may not author domain
> logic under `app/Actions/`.** 0060 and 0062 both consume actions from 0058/0059/0061 and author
> none, so a `RestoreBlogPost` written in 0063 would be the first UI story in this epic to break that
> line. The action therefore belongs here, and the `User` precedent turns out to be an argument about
> *`User`* — nothing ever needed to restore an account — rather than a rule about soft-deleted models.

**The shape is `DeleteBlogPost`'s, mirrored:**

```php
// app/Actions/Blog/RestoreBlogPost.php
public function __invoke(BlogPost $blogPost): bool
{
    $this->logRefusedPrivilegedAttempt->authorize(
        'restore', $blogPost, targetType: 'blog_post', targetId: $blogPost->id,
    );

    return (bool) $blogPost->restore();
}
```

Same folder, same constructor-injected `LogRefusedPrivilegedAttempt`, same
authorize-as-the-first-statement rule (**D-13**), same instance-not-query-builder rule. **The caller
must resolve the target with `withTrashed()`** — a default `BlogPost::findOrFail()` cannot see a
trashed row, so 0063's row action reads from the trashed listing it already has to build.

**Gated on `blog.edit`, not `blog.delete` and not a new tier.** Three reasons, and the second is the
one that settles it:

1. **There is no `restore` permission to use.** `RolePermissionSeeder::ACTIONS` is the four CRUD verbs
   and nothing else, so a dedicated ability would be a **catalog change** — the same argument
   `SalesRegionPolicy` made when it declined to invent a second tier for its default swap
   ([authorization.md](../../docs/architecture/authorization.md#salesregionpolicy--the-third-policy-and-the-first-with-no-target-branch)).
   The permission model here is deliberately coarse, and this is not the story to widen it.
2. **Restore is the *non-destructive* direction, so it should not require the destructive
   permission.** An actor holding `blog.edit` can already rewrite a post's title, body, category,
   tags and status; making a hidden row visible again is strictly less powerful than any of those,
   and far less powerful than deleting it. Gating restore on `blog.delete` would mean the safest
   operation on the screen required the most dangerous grant.
3. **It keeps `blog.delete` meaning exactly one thing** — "may remove content from view" — rather than
   "may move content in and out of view", which is what a combined tier would mean.

⚠️ **The accepted asymmetry, recorded because a reviewer will ask:** an actor holding `blog.edit` but
not `blog.delete` can **restore** a post they could not have deleted. That is intentional and benign —
it cannot destroy anything, and the post was already visible to them before someone else trashed it.
The inverse (`blog.delete` without `blog.edit`) can delete but not restore, which is the direction
worth having asymmetric: the person who can hide content is not automatically the person who decides
it comes back.

**No category-existence guard is needed, and this is a structural guarantee rather than an
assumption.** The obvious worry is a post restoring into a dangling `blog_category_id` because its
category was deleted while the post sat trashed. **That cannot happen**, for a reason that does not
depend on any application check: `blog_posts.blog_category_id` is `restrictOnDelete()` (**D-2**), and
a trashed post is still a physical row holding a live foreign key (**D-7d**), so **MySQL itself
refuses** to delete a category any trashed post references. The application-level count in **D-18**
counts `withTrashed()` for the same reason and refuses first with a friendlier message — but even a
raw `DELETE`, a seeder, or a query-builder bypass that skipped every model event would still be
refused by the constraint. The guarantee is the database's, so `RestoreBlogPost` may restore
unconditionally.

Two further "does it need a guard?" questions, both answered by decisions already made:

- **Can the slug have been taken while the post was trashed?** No — a trashed post keeps its slug
  reserved and `Rule::unique()` does not apply the soft-delete scope (**D-7b**), so nothing could
  have claimed it. This is the second time **D-7b**'s choice pays for itself, and it is precisely the
  failure mode the obfuscate-on-delete alternative would have created.
- **Can its tags have gone?** Yes, and that is correct rather than a guard's job: a tag hard-deleted
  while the post was trashed cascaded through the pivot, so the post restores with fewer tags
  (**D-7c**, **R-17**). Restoring must not resurrect a tag that no longer exists in the catalog.

**Still not shipped: force-delete.** Permanently destroying a trashed post has no PRD scenario, no
confirmed product decision, and no caller — and unlike restore, it is irreversible, so it is not a
gap to close by symmetry. 0063's trash affordance may offer restore alone.

### D-17 — Tag editing is a full-replace `sync()`: an omitted name detaches

`SyncBlogPostTags` resolves every submitted name to an id and calls `$blogPost->tags()->sync($ids)`,
so a name absent from the submitted set is **detached from that post**. The tag row itself is never
deleted — it is a taxonomy entity the post does not own, and removing it from the catalog is 0060's
screen, not a side effect of a post save.

**Why the full-replace-`sync()` trap this repo has hit twice does not bite here — stated rather than
assumed.** [errors-log.md](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20)
records the rule that *absence in a payload from a partially-visible form is not a decision* — the
roles screen's permission matrix, where an actor who cannot see `roles.manage-administrators` would
silently revoke it by omission. The distinguishing property is **visibility**: a post editor's tag
field is a chip control showing **every** tag currently on the post, so an omission genuinely *is* the
editor's decision to remove it.

⚠️ **That safety is conditional on the field staying unfiltered**, exactly as
[the Roles screen's own ⚠️](../../docs/architecture/authorization.md#the-second-grant-meta-rule-you-cannot-grant-what-you-do-not-hold)
is. **If story 0063 ever renders a filtered or paginated tag field — hiding any tag a post currently
holds — this decision must be revisited before that ships**, because at that moment an omission stops
being a decision and `sync()` becomes a silent revoke. Recorded in the action's docblock, where 0063's
author will be reading.

### D-18 — The category-delete guard: exact file, method, shape and exception type

**File:** `app/Actions/Blog/DeleteBlogCategory.php`. **Method:** `__invoke(BlogCategory $blogCategory): bool`.
**Before this story** (0058) its body is a plain instance `->delete()` behind an authorization call.
0058's **D-10** states the file exists as its own file *specifically* so 0061 extends it — this is that
extension, and with `BlogCategory::posts()` it is the **only** change to 0058's shipped code.

```php
public function __invoke(BlogCategory $blogCategory): bool
{
    $this->logRefusedPrivilegedAttempt->authorize(
        'delete', $blogCategory, targetType: 'blog_category', targetId: $blogCategory->id,
    );

    // withTrashed(): a soft-deleted post still holds a live blog_category_id, so
    // the restrictOnDelete() FK refuses regardless of deleted_at. An unscoped
    // count would pass this guard, hit the FK, and report "used by 0 posts".
    // See D-7d.
    $inUseCount = $blogCategory->posts()->withTrashed()->count();

    if ($inUseCount > 0) {
        throw $this->blockedByPosts($blogCategory, $inUseCount);
    }

    try {
        return (bool) $blogCategory->delete();
    } catch (QueryException $e) {
        // 23000 here is blog_posts.blog_category_id refusing under restrictOnDelete():
        // a post was assigned to this category between the count above and this delete.
        // The count is the primary guard; the FK is the last word -- the same relationship
        // CreateUser has with the users.email unique index.
        if ($e->getCode() === '23000') {
            throw $this->blockedByPosts($blogCategory, $blogCategory->posts()->withTrashed()->count());
        }

        throw $e;
    }
}

private function blockedByPosts(BlogCategory $blogCategory, int $count): ValidationException
{
    $this->logRefusedPrivilegedAttempt->log(
        reason: 'category_still_in_use',
        targetType: 'blog_category',
        targetId: $blogCategory->id,
    );

    return ValidationException::withMessages([
        'blogCategoryId' => trans_choice('blog.categories.delete_blocked', $count, ['count' => $count]),
    ]);
}
```

**The count query** is `COUNT(*)` over `blog_posts.blog_category_id`, served by that FK's own
auto-created index — a secondary-index range scan with no table access, so **this story adds no
unindexed query**. Three properties of it are deliberate:

- **Unfiltered by status.** A `Draft` or `Scheduled` post still occupies the category; counting only
  `Published` ones would let an administrator delete a category out from under a dozen unpublished
  drafts. This is the likeliest implementation bug — "in use" *reads* like "publicly visible", and the
  PRD's own wording ("used by 5 posts") makes no such distinction — and it has its own test.
- **Unfiltered by `deleted_at` either — `withTrashed()` is mandatory**, because the FK behind this
  guard cannot see a soft delete (**D-7d**). This is the one property of the count that the confirmed
  soft-delete decision changed, and getting it wrong produces a "used by 0 posts" refusal rather than
  a silent hole — loud, but nonsensical. It has its own test.
- **No `lockForUpdate()`.** Locking a category's whole post set for a rare admin operation is a wide
  lock to buy what `restrictOnDelete()` already guarantees.

**Exception type: `ValidationException`.** *Rejected:* a domain exception. The decisive reason is that
it is the one exception Livewire already routes into a component's error bag with no plumbing at the
call site, so 0062's delete modal renders the message with an `@error` block and catches nothing. A
`RuntimeException` subclass would need a `try`/`catch` at *every* call site, and any that forgot would
get an unhandled 500 — the exact failure this guard exists to prevent.
`App\Exceptions\RoleInUseException` is this repo's nearest domain exception and is the wrong shape:
its `render()` returns a **409**, converging on an HTTP status, and this refusal wants to be a form
error. `CreateUser` converting a `23000` into a `ValidationException` sets the precedent.

*Acknowledged counter-argument, recorded so Phase 5 does not re-litigate it:* `ValidationException`
conflates "your input was invalid" with "the world's state forbids this", and the actor submitted
nothing invalid. Considered, and outweighed by the rendering argument — the identical trade 0024's
**D-14** made.

**The error-bag key `'blogCategoryId'` is a hand-off contract** — 0062 must bind its `@error` to it.
Record it in the action's docblock; `CreateUser` sets the same precedent by throwing on `'email'`.

**The refusal is logged like any other**, per step 2 of the refusal recipe: a non-`Gate` refusal calls
`->log()` on the line above the `throw`, with a snake_case reason distinct from any permission name.
`category_still_in_use` joins `default_must_be_active` and
`default_deactivation_requires_replacement` as the third of its kind. This is a **domain invariant,
not an authorization rule** — it answers *"would the data still be valid"*, not *"may this actor"* —
which is why a Super Admin is refused identically and why it can never be a policy method. See
[A domain invariant is not an authorization rule](../../docs/architecture/authorization.md#a-domain-invariant-is-not-an-authorization-rule-and-does-not-live-here).

**The message uses `trans_choice`, not a bare `:count`**, because the singular differs:

```php
// lang/en/blog.php — owned by THIS story
'categories' => [
    'delete_blocked' => '{1} This category is used by 1 post — reassign it before deleting.'
        .'|[2,*] This category is used by :count posts — reassign them before deleting.',
],
```

with a key-for-key Spanish counterpart. Note the wording follows the PRD's own worked example
verbatim, including the "reassign … before deleting" clause, which is stronger than the product
equivalent and is what makes the no-confirm-and-proceed rule readable to the administrator.

**Why there is no confirm-and-proceed path, ever** — three independent reasons, any one sufficient:

1. **The PRD says so, twice**: *"deletion is always blocked (no confirm-and-proceed path)"* and
   *"they must reassign those posts before it can be deleted"*. It is stated for sibling entities
   across the PRD — a house pattern, not a per-entity preference.
2. **`blog_category_id` is NOT NULL, so there is no coherent "proceed."** It would have to null the
   column (the schema forbids it), cascade-delete the posts (catastrophic, never asked for), or
   reassign them to a fallback category nobody has defined. Every branch is worse than refusing.
3. **The database would refuse anyway** under `restrictOnDelete()`, so a confirm button could not
   work.

### D-19 — Publishing notifies, and there are **three** triggers, not two *(revised 2026-08-27 at story 0065's request)*

> ⚠️ **This decision previously said the opposite, and the reversal is recorded rather than
> overwritten.** As originally written, D-19 read *"This story fires **no** event, model observer or
> notification"* — 0065 owned the notification end to end, and this story merely shipped the manual
> `Draft`→`Published` transition. Story **0065** (now done) found the gap that makes that untenable,
> and the coordinator confirmed the fix as in scope.

**The gap:** `CreateBlogPost` accepts `BlogPostStatus $status`, so **a post can be created already
`Published`** without ever passing through an update. That path was accounted for by neither this
story's original D-19 nor 0064's hand-off — both said "two triggers" — so a post published at
creation would have notified nobody, silently, and the failure would look like nothing at all rather
than like an error.

PRD's [confirmed notification list](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications)
says *"a blog post is published or a scheduled post goes live"*, which enumerates **outcomes**, not
code paths. Three code paths reach the first outcome and one reaches the second:

| # | Trigger | Owner | Fires from |
| --- | --- | --- | --- |
| 1 | An existing post is updated **into** `Published` | **this story** | `UpdateBlogPost` |
| 2 | A post is **created** already `Published` | **this story** | `CreateBlogPost` |
| 3 | A `Scheduled` post's date arrives and the sweep flips it | story **0064** | its scheduled command |

**Two dispatch sites, both in this story**, calling story 0065's
`App\Actions\Blog\NotifyBlogPostPublished::__invoke(BlogPost): void` — constructor-injected like every
other collaborator (**D-13**), never `new`-ed:

```php
// app/Actions/Blog/UpdateBlogPost.php — trigger 1
// FIRST statement: the caller's instance may be stale or dirtied. See D-19a.
$blogPost->refresh();

$this->logRefusedPrivilegedAttempt->authorize('update', $blogPost, targetType: 'blog_post', targetId: $blogPost->id);

$wasPublished = $blogPost->getRawOriginal('status') === BlogPostStatus::Published->value;

DB::transaction(function () use (…) { /* save + SyncBlogPostTags — D-15 */ });

if (! $wasPublished && $blogPost->status === BlogPostStatus::Published) {
    ($this->notifyBlogPostPublished)($blogPost);
}
```

```php
// app/Actions/Blog/CreateBlogPost.php — trigger 2
if ($blogPost->status === BlogPostStatus::Published) {
    ($this->notifyBlogPostPublished)($blogPost);
}
```

**Four properties of the dispatch, each a decision rather than a detail:**

- **After the commit, never inside the transaction** (**D-15**). A notification sent from inside
  `DB::transaction()` still goes out when the transaction later rolls back — the tag-sync refusal in
  **D-15** is a live rollback path on both actions — and an unsendable notification cannot be
  recalled. This is [the errors-log's transaction-wrapper rule](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21)
  applied deliberately at the point of writing rather than discovered by a later audit, and it is the
  same *after the commit* placement `security/authorization-patterns.md` requires of the permission
  cache flush.
- **Success path only.** An `AuthorizationException`, a `ValidationException` or a step-up refusal
  returns before the dispatch is reached, because the dispatch is the action's last statement.
- **On the *transition*, not on the state** (trigger 1). `UpdateBlogPost` compares the **pre-save**
  value — read with `getRawOriginal('status')` **before** the transaction, matching how
  `App\Actions\Users\UpdateUser` reads its own pre-change status — so re-saving an already-`Published`
  post (a typo fix, a tag change) notifies nobody. Without that guard, every subsequent edit
  re-announces the post. **That read is only trustworthy against a re-fetched instance — see D-19a.**
- **`CreateBlogPost` needs no such comparison**, because a newly created row has no prior state: its
  condition is a plain status check, and that asymmetry is why the gap was missable in the first place.

**Still 0065's, and untouched by this story:** what the notification contains, who receives it, the
channel, and whether it queues. This story owns only *when it is called*.

### D-19a — `UpdateBlogPost` re-reads its subject as its first statement *(closes 0065's R-1)*

> ✅ **Found by story 0065 against 0061's shipped design, and closed here.** 0065 recorded it as its
> own **R-1**, *"open against 0061's shipped code"*. **It is now closed** — 0065's Phase 2 reviewer
> should re-check this section rather than re-open it independently.

**The gap.** `getRawOriginal('status')` reads the *instance the caller handed over*. That defends
against a **dirtied** attribute — `getRawOriginal()` returns the pre-`fill()` value — but not against
a **stale** one. Concretely: a Livewire component loads a post, the editor spends two minutes on a
typo fix, and in the interim **0064's scheduler sweep transitions that same post to `Published`**. The
save then reads a pre-save status of `scheduled` from an instance that no longer reflects the row,
sees a false transition *into* `Published`, and dispatches a **second, duplicate** notification for a
transition that already happened and was already announced. No error, no failed request — subscribers
simply hear about the same post twice.

**The fix, and it is one line:**

```php
// app/Actions/Blog/UpdateBlogPost.php — the FIRST statement of __invoke()
$blogPost->refresh();
```

**`refresh()`, not `fresh()`** — this repo's existing convention, and the only real precedent for
re-reading a caller-supplied instance is
[`App\Actions\SalesRegions\SetSalesRegionActive`](../../app/Actions/SalesRegions/SetSalesRegionActive.php)`:143`,
which uses `refresh()`. The difference matters here: `fresh()` returns a **new** instance, so the
caller's own object would stay stale and the action's return value would be a different object than
the one passed in; `refresh()` mutates in place, so the Livewire component holding the model sees the
corrected state too.

**It closes a second hole this story would otherwise have inherited, and that is the stronger reason
to place it first.** `refresh()` calls `setRawAttributes()` with the row's real columns and then
`syncOriginal()`, so it **discards every attribute the caller dirtied before calling**. That matters
because [security/model-instance-trust.md](../../docs/security/model-instance-trust.md#save-writes-the-whole-dirty-set-so-the-single-named-writer-is-a-convention-not-an-enforcement)
records `save()`-writes-the-whole-dirty-set as **known and still open** on
`App\Actions\SalesRegions\UpdateSalesRegion` — a caller who dirties a column the action does not own
persists it, `#[Fillable]` notwithstanding. `UpdateBlogPost` ends in the same `fill(...)->save()`
shape and would have shipped the identical flaw; refreshing first removes it structurally rather than
by adding a second guard. *(Read from `refresh()`'s documented semantics, **not** verified by
execution — `vendor/` is absent here, **V-8**.)*

**Placed before `Gate::authorize()`, deliberately.**
[base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s
⚠️ records that *"authorize before the first write"* and *"re-read what you authorize against"* pull
in opposite directions. Three reasons the re-read wins here:

1. **The status comparison is downstream of it and must see the real row** — non-negotiable, and the
   whole point of the fix.
2. **Authorizing after it means the policy can never be shown attacker-controlled attributes.**
   `BlogPostPolicy::update()` ignores its `$target` today (like `SalesRegionPolicy`), so ordering
   cannot change today's outcome — but a policy that authorized against a *dirtied* instance is
   precisely the shape `model-instance-trust.md` exists to prevent, and refresh-first is the
   arrangement that stays correct the day a target-dependent branch is added. The alternative would
   need a ⚠️ on the policy telling a future author to re-verify; this needs none.
3. **The cost is one `SELECT` on a refused call**, which is negligible for an operation whose refusals
   are rare and which has already resolved a model by primary key to get here.

⚠️ **This narrows the window; it does not close it, and the file should not claim otherwise.** A sweep
landing between the `refresh()` and the transaction still produces the duplicate. Fully closing it
means capturing the pre-save status **inside** `DB::transaction()` from a `lockForUpdate()` re-read —
the shape [model-instance-trust.md](../../docs/security/model-instance-trust.md#a-guard-must-re-read-its-subject-under-lock-inside-its-own-transaction)
prescribes for a **domain invariant**. **Deliberately not adopted**, on proportionality: the
consequence here is a duplicate notification, not a corrupted row or a bypassed guard, and taking a
row lock on every post save to prevent a rare double-announcement is the same wide-lock-for-small-gain
trade **D-18** already declined. Recorded as **R-18** so the residual is a known, argued position
rather than an oversight.

**Only `UpdateBlogPost` needs this.** `CreateBlogPost` has no prior instance to be stale.
`DeleteBlogPost` and `RestoreBlogPost` make no decision from prior state — `delete()` and `restore()`
are effectively idempotent against a stale instance, and neither dispatches a notification.

⚠️ **A restore must not re-notify** — `RestoreBlogPost` (**D-20**) deliberately does **not** dispatch.
Restoring a previously-published post leaves `status` at `Published` with no transition, so trigger 1's
own guard already excludes it; that is a property of keying on the transition, and it is stated here
because an observer on `saved` or `restored` would not have it. See the 0065 hand-off.

## Scope fences: what this story must NOT do

- No Livewire component, route, Blade view, sidebar entry, `config/modules.php` entry or browser test
  (0062, 0063).
- **No scheduled command, no `Schedule::` entry, no auto-transition of any kind** (0064). This story
  creates the column and the validation rule the scheduler reads; it does not read them itself.
- **No notification *class*, no mail, no channel, no recipient list, and no model observer** — story
  0065 owns all of it. This story calls 0065's `NotifyBlogPostPublished` from two sites and defines
  nothing (**D-19**). The dispatch is an explicit call in each action, deliberately **not** a
  `saved`/`restored` model observer, which would fire on every re-save and on a restore.
- No WYSIWYG editor (0021), no media-picker UI (0020), and **no image handling of any kind**: the
  `body` is opaque HTML this story sanitizes and stores, nothing more. No `media` FK, no
  `blog_post_media` pivot, no featured image.
- No second HTML sanitizer, no second allow-list, no new Composer dependency (**D-14**).
- No call to `App\Actions\NormalizeForSearch`, no `normalized_*` column, no local fold helper
  (**D-10**).
- No new permission module slug and no `RolePermissionSeeder` change — `blog.*` is already seeded.
- **No force-delete action** (**D-20**). `SoftDeletes::forceDelete()` exists on the model for free and
  this story adds no caller: permanently destroying a post has no PRD scenario and is irreversible, so
  it is not a gap to close by symmetry with restore. `RestoreBlogPost` **is** shipped (**D-20**).
- **No screen affordance for reaching trashed posts** — the listing, the row action and the
  confirmation are 0063's (**D-7d**). This story ships the action it calls, not the control.
- **No `delete()` override on `BlogPost`, and no slug obfuscation on delete** (**D-7b**) — the
  `App\Models\User::delete()` shape is deliberately *not* copied.
- No SEO meta fields, no translations table, no per-locale columns or any other i18n scaffolding
  (Epic 5).
- No changes to `blog_categories`' or `blog_tags`' own schema, validation, or CRUD actions beyond the
  two relation methods and the one guard this story is explicitly chartered to add.
- No public-facing filtering, route or archive page — PRD's Out of scope excludes it explicitly. The
  scopes in **D-11** are for the **admin** list only.

## Dependencies, risks and open questions

### Verified environment findings

Executed or read against this worktree during the debate.

- **V-1 — Neither dependency exists in code.** `app/Models/` holds only `Role.php`, `SalesRegion.php`
  and `User.php`; `app/Actions/` holds only `Auth/`, `Fortify/`, `Roles/`, `SalesRegions/`, `Users/`;
  there is no `blog_categories` or `blog_tags` migration. **0058 and 0059 are task files, not shipped
  code**, and both still sit in `ai-spec/tasks/` rather than `done/`.
- **V-2 — `blog` is already in the seeded permission catalog.** `RolePermissionSeeder.php:25` lists
  `'blog'` among `MODULES`; `ACTIONS` is the four CRUD verbs. **Zero seeder change.**
- **V-3 — `lang/en/` holds four files** (`navigation.php`, `roles.php`, `sales-regions.php`,
  `users.php`) and **no `blog.php`** — so this story genuinely creates it.
- **V-4 — There is no engine split in the test matrix.** `phpunit.xml` pins
  `DB_CONNECTION=mysql` and `DB_DATABASE=testing`; `config/database.php` pins
  `utf8mb4_unicode_ci` and `'strict' => true`. 0023's R-2 (SQLite in CI) is **stale** and must not be
  inherited — 0058's R-2 and 0059's D-13 already record this, and it was re-verified here rather than
  trusted. Strict mode matters: it is what makes a NOT NULL column a real constraint rather than a
  silent `''`.
- **V-5 — `role_has_permissions` is the composite-PK pivot precedent and carries no timestamps and no
  surrogate id** (`create_permission_tables.php:114`). **D-8** rests on it.
- **V-6 — `App\Actions\SalesRegions\SetSalesRegionActive` really does constructor-inject another
  action**, and its refusal call really is
  `->authorize('update', $region, targetType: 'sales_region', targetId: $region->id)` — both quoted
  from the shipped file, not from a sibling task's description of it.
- **V-7 — ADR 0001 line 11 reads** *"Blog Categories, Blog Tags, Blog Posts — future, PRD Epic 4 …
  not yet implemented."* This story is the last of the three.
- **V-8 — `vendor/` is absent from this worktree**, so nothing requiring PHP execution was verified:
  the `mediumText` sizing arithmetic in **D-4**, `Str::slug()`'s exact output, and the `EXPLAIN` plans
  in **D-11** are all reasoned rather than measured, and are flagged as such at each site per this
  project's [hedge rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24).
- **V-9 — `tests/Unit/Concerns/` does not exist yet.** 0058 creates it. This story's
  `BlogPostValidationRulesTest.php` lands in a folder its sibling introduces.

### Dependencies

- **0058 (blog categories backend) — hard, blocking.** This story FKs into `blog_categories`, adds a
  relation method to its model, and *edits a file it creates*. Not yet implemented (**V-1**).
- **0059 (blog tags backend) — hard, blocking.** The pivot FKs into `blog_tags`, this story adds a
  relation method to its model, and `SyncBlogPostTags` calls its `FindOrCreateBlogTag`. Not yet
  implemented (**V-1**).
- **[0024a](done/0024a-product-description-html-sanitization.md) (product description HTML sanitization) —
  soft, for the HTML sanitizer only** (**D-14**, **OQ-4**). Its **D-16** owns
  `symfony/html-sanitizer`, `config/html-sanitizer.php` and the allow-list this story consumes.
  ⚠️ **Repointed 2026-09-01**: this named 0024, which no longer owns the sanitizer — it was split into
  its own story, which in turn depends on 0024 for the `CreateProduct`/`UpdateProduct` it wires into.
  **That makes the OQ-4 race below cheaper, not moot**: 0024a is a small story whose only hard
  dependency is 0024's actions, so "0024 → 0024a" is a shorter path to the sanitizer than the whole of
  0024 used to be.
- **0022 — not a dependency**, unlike its sibling Epic 4 stories: this story does not call
  `NormalizeForSearch` at all (**D-10**).
- Per [workflow.md](../../docs/workflow.md#task-ordering-rule) the numbering is already correct; what
  must be enforced is the **sequencing** — 0058 and 0059 both reach Phase 7 before 0061 starts Phase 3.
- **Stories 0062, 0063, 0064 and 0065 all depend on this one.** 0062 needs **D-18**'s guard and its
  error-bag key; 0063 needs the whole component contract plus **D-11**'s scopes; 0064 needs **D-6**'s
  column and **D-9**'s index; 0065 needs **D-19**'s three triggers — of which **this story dispatches
  two** and 0064 the third.

### Risks

- **R-1 — The pivot's cascade direction is a cross-story promise this story is the one that must
  keep.** 0059's `DeleteBlogTag` is unconditional *because* `blog_post_tag.blog_tag_id` cascades, and
  **0061 is the story that actually writes that FK**. Copying `sales_regions.parent_id`'s
  `restrictOnDelete()` habit would silently break 0059's own already-green "an in-use tag deletes
  successfully" test the moment real pivot rows exist — 0059's **R-6** names this exact scenario, and
  it is written into `DeleteBlogTag`'s docblock precisely because this story's author is who will be
  reading it. Closed by the extended `DeleteBlogTagTest.php` case.
- **R-2 — A stale future `published_at` on a `Draft`.** If a `Scheduled`→`Draft` transition merely
  makes the date meaningless rather than nulling it, the row looks fine in every UI and corrupts the
  invariant the moment it is re-promoted. Closed by **D-6**'s action-level null and its test.
- **R-3 — A `slug` hook that fires only on insert.** A retitled post keeps its old slug, silently, and
  the row looks correct everywhere. Closed by the two-assertion model test (insert **and** retitle) —
  0058's **R-3a**, one entity over.
- **R-4 — `title`'s length trio drifting apart.** The validation `max:255`, the migration's
  `string('title', 255)` and `slug`'s own `string('slug', 255)`. If any moves without the others, a
  validation refusal becomes a truncation or a `22001`. **Note this story does *not* inherit 0058/0059's
  `Str::ascii()` expansion hazard** (their **R-4**), because it stores no fold — but `Str::slug()` is
  also not length-preserving in general, so `slug`'s width must be ≥ `title`'s, which is why both are
  255 rather than the slug being tighter.
- **R-5 — Validation reused asymmetrically between create and update.** A status-parameterised rule
  helper threaded through on one call path but not the other fails silently in exactly one direction.
  Closed by re-asserting the full validation depth on the update path independently — 0058's **R-6**
  and 0059's **R-7**, and doubly live here because **two** of the rule methods take a parameter.
- **R-6 — Stored XSS via `body`. Mitigated by D-14, not eliminated.** The column is written only
  through the two actions, both of which sanitize, so the stored value is always safe HTML — and that
  is what will permit 0063 to render it unescaped. Two residual exposures remain and belong in the
  Phase 4 audit, inherited verbatim from 0024's **R-12**: any *future* writer that bypasses the actions
  (a seeder, an import, a raw `update()`) reopens it, because the guarantee lives in the action and not
  in the column; and the allow-list itself is now the control, so a tag added to it later without
  thought is a new sink. Rated high before mitigation — the render is unescaped by necessity and
  `Administrator` holds `blog.create`.
- **R-7 — `SELECT *` on the blog list** drags `body` out of the clustered index on every row
  (**D-4**). A constraint 0063 inherits, and sharper than 0024's **R-9** because a post body is
  typically far larger than a product description.
- **R-8 — A partially-committed post save.** Closed by **D-15**'s transaction; the risk is recorded
  because the failure only appears under the `blog.edit`-without-`blog.create` role shape, which no
  casual test exercises.
- **R-9 — The `after:now` rule refusing every edit to an overdue scheduled post.** **D-6**'s third
  bullet. It ships green, appears only once wall-clock time passes a stored date, and is invisible to
  any test that does not freeze the clock and deliberately move it forward.
- **R-10 — `sync()` becoming a silent revoke if 0063 filters the tag field.** **D-17**'s ⚠️. Safe
  today by construction; unsafe the moment a rendered control stops showing every tag a post holds.
- **R-11 — No `trans_choice` precedent in `lang/blog.php`**, which this story creates. `roles.php`'s
  `delete_blocked` is the shape to copy, and Spanish pluralisation is not identical to English; both
  locale files land in the same change.
- **R-12 — The reassign-away race is not testable here.** If the last post is reassigned *between*
  the count and the delete, the count says 1 while reality says 0. It needs genuine concurrency
  against an open `RefreshDatabase` transaction. **Fail-closed (refuse; the retry succeeds) is the
  correct behaviour and is recorded as a decision**, not left as an unasserted assumption — 0024's
  **R-14**, one entity over.
- **R-13 — `lang/*/blog.php` is claimed by three stories** (0061, 0062, 0063). Uncoordinated, one
  silently overwrites the others' keys, and a key missing from `lang/es` renders as its own raw key
  with no error. Mitigated by the ownership hand-off in the Translations section.
- **R-14 — An unscoped `posts()->count()` in the category guard, now that posts soft-delete.**
  **D-7d**'s failure mode, and the sharpest new risk the confirmed soft-delete decision introduces:
  the guard reads 0, passes, the FK refuses anyway, and the catch block re-counts to 0 — so the
  administrator is shown *"used by 0 posts"*. It fails **loudly but incoherently**, which is easier to
  diagnose than a silent hole and easier to ship than an obvious one, since every test using only
  live posts passes. Closed by the dedicated trashed-post block test.
- **R-15 — A `restrictOnDelete()` FK and a soft-deleted child are a standing mismatch, not a one-off.**
  A foreign key cannot see `deleted_at`, so **any** future in-use guard counting soft-deleted children
  in front of a restricting FK inherits **D-7d**'s rule. `blog_posts.blog_category_id` is this repo's
  first such pair; `products.product_category_id` (0024) is the same shape and is safe today **only
  because `Product` hard-deletes** — 0024's own **R-11** already flags that adding `SoftDeletes` there
  would disarm the database half of its guard. Worth carrying to whichever story next soft-deletes a
  child of a restricting FK.
- **R-16 — A trashed post can make a category permanently undeletable from the UI.** The block is
  correct and the data really is referenced, but the administrator has no exit until 0063 ships a
  trash affordance (**D-7d**). Recorded as an accepted, named cost with an owner rather than left to
  surface as a support question — and it is a *usability* dead end, never a data-integrity one.
- **R-18 — The duplicate-notification race is narrowed, not closed** (**D-19a**). `refresh()` shrinks
  the window from the caller instance's whole lifetime — a Livewire page open for minutes — to the
  microseconds between the re-read and the transaction. A sweep landing inside *that* window still
  double-announces. Accepted deliberately rather than closed with a `lockForUpdate()` inside the
  transaction: the consequence is a duplicate notification, not a corrupted row or a bypassed guard,
  and a row lock on every post save is the same wide-lock-for-small-gain trade **D-18** declined.
  **The honest statement of the residual is part of the decision** — if a later story finds real
  duplicates in production, the fix is the locked read, and it is already described in **D-19a**.
- **R-19 — A refactor moving `refresh()` off the first line reopens two holes at once**, and both fail
  silently. Below the `Gate::authorize()` call it stops protecting the policy from a dirtied instance;
  below the `getRawOriginal('status')` read it stops protecting the notification from a stale one;
  removed entirely it reopens the whole-dirty-set write. Nothing about any of those produces an error
  — which is why **D-19a** states the placement as a rule and two tests pin it from different angles.
- **R-17 — A restore re-attaching stale tags.** A post trashed while tagged `running`, with `running`
  then deleted from the catalog, restores untagged rather than broken — because the tag's own hard
  delete cascaded through the pivot even while the post sat trashed (**D-7c**). That is the correct
  outcome, and it is recorded here because the *intuitive* expectation is the opposite ("my restored
  post lost a tag"), so it is a support answer rather than a bug. Pinned by the trashed-post case in
  `DeleteBlogTagTest.php`.

### Resolved questions

**Three of the questions this debate escalated were answered by the product owner on 2026-08-27, before
Phase 2.** Recorded with the confirmed answer and the dropped alternative, so a later reader sees what
was decided and why rather than an unexplained gap in the numbering — the format 0024 and 0009 both
use. The numbers are **not** reused: **OQ-1**, **OQ-3(b)** and **OQ-5** are retired, and the surviving
questions keep their original numbers so cross-references from other files do not rot.

| Was | Question | Confirmed answer |
| --- | --- | --- |
| **OQ-1** | Does `DeleteBlogPost` ship at all, given PRD Epic 4 scripts no post-delete scenario? | **Yes.** Posts are deletable; the action ships. See **D-16**. |
| **OQ-5** | Should a deleted post be recoverable? | **Yes — `SoftDeletes`.** A post is a far stronger "I need that back" candidate than a taxonomy label, and PRD assumption 17 rules out an *audit log*, which is a different feature. `BlogPost` becomes the repo's second soft-deleting model. See **D-7**, and **D-7b**/**D-7c**/**D-7d** for the three interactions it creates. |
| **OQ-3(b)** | May a `Draft` be saved with an empty body? | **Yes**, while `Published` and `Scheduled` must have a non-empty one — enforced by a status-parameterised `bodyRules()`, not `required_if`. See **D-4**. |

The two answers were taken together rather than separately, and that is what settled **D-16**: "posts
are deletable" and "deletion is recoverable" are one product decision, not two. **The soft-delete
answer had three second-order consequences the debate had not needed to consider**, all resolved above
rather than deferred — the slug's fate on delete (**D-7b**), the pivot's (**D-7c**), and the one that
changed shipped behaviour in this story, the category guard's count (**D-7d**), which also moved
**D-9**'s index to lead with `deleted_at`.

### Open questions

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule these are recorded rather than
guessed. **None blocks Phase 2 review. OQ-2 and OQ-3 must be settled before Phase 3.**

- **OQ-2 — What happens when two titles slugify to the same value? ✅ RESOLVED 2026-08-30 — option (b),
  refuse with a validation error on `title`.** The human chose this over the originally-recommended
  auto-suffix, explicitly favouring predictability over never blocking an editor. **D-3** makes `slug`
  unique; the `saving` hook derives it and, on a collision, the create/update action surfaces a
  validation error keyed on `title` (a `23000` from the unique index, caught and rethrown as
  `ValidationException::withMessages(['title' => …])`, or a pre-flight `exists()` check before the
  insert — either is acceptable, but the pre-flight check is race-prone under concurrent saves of the
  identical title and must still fall back to the `23000` catch as the last-word guard, per this
  project's [signed-link-verification.md](../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)
  precedent). This closes the collision question for every Epic 5 story that inherited it as an open
  dependency: 0078 (Blog Posts translatable retrofit) assumed this exact resolution already and needs
  no rework; 0079 (Blog Post editor language tabs) can now render the refusal on the **title** field for
  the language being edited (there is no separate slug field to render it on, since the slug stays
  derived-only per 0078's D-4).

  ⚠️ **The confirmed soft delete still applies to the chosen option.** Because a trashed post keeps its
  slug reserved (**D-7b**) and `Rule::unique()` does not apply the soft-delete scope, the collision check
  must see trashed rows too — a title that would collide with a trashed post's slug is refused exactly
  as if the trashed post were live. This was originally written as a note on the *rejected* auto-suffix
  option; it applies unchanged to refuse-with-validation, since either way the check must query the same
  rows the unique index sees.
  **(a) Auto-suffix** and **(c) user-editable slug** were the two rejected alternatives — recorded rather
  than deleted, per this project's convention for documenting a real fork.

- **OQ-3 — Is `body` `mediumText` or `LONGTEXT`?** *(This was two questions; its second half — may a
  `Draft` have an empty body? — was confirmed by the product owner and is now **D-4**. See
  [Resolved questions](#resolved-questions).)* The story brief specified `LONGTEXT`;
  `database-expert` argued `mediumText` and **D-4b** adopted it. **Recommendation: `mediumText`
  (recommended)** — it matches `products.description`, keeps the validation rule the binding limit,
  and preserves a structural signal that a multi-megabyte body is a bug rather than content. This is
  flagged rather than applied silently precisely because it diverges from the brief. *Alternative:*
  `LONGTEXT` as the brief specified, at the cost of that signal. **Nothing else in the story depends
  on the answer** — the column is nullable either way, and the status-parameterised rule is unaffected.

- **OQ-4 — Sequencing of the shared HTML sanitizer between [0024a](done/0024a-product-description-html-sanitization.md)
  and 0061.** *(Repointed 2026-09-01: the sanitizer was **D-16** of story 0024 when this question was
  written; it is now its own story, 0024a, whose sole hard dependency is 0024's two write actions.)*
  0024a's **D-16** owns `symfony/html-sanitizer` and `config/html-sanitizer.php`, and neither exists in
  the tree today (**V-1**). This is the same shape as the `NormalizeForSearch` ownership race 0058's and 0059's
  **OQ-2** both record. **Recommendation: whichever of 0024 / 0061 reaches Phase 3 first creates the
  package, the config and the sanitizing action to 0024a's D-16 spec verbatim, and the other consumes
  it unchanged (recommended)** — rather than serialising Epic 4 behind an Epic 2 story. The invariant
  is non-negotiable either way: **exactly one sanitizer and exactly one allow-list exist in the tree.**
  What must not happen under time pressure is a blog-specific allow-list "just for now" — that is the
  drift 0024's own scope fence was written to prevent. **Note the dependency-approval consequence:** if
   0061 lands first, it inherits 0024's obligation to record the approved new Composer dependency, per
  project `CLAUDE.md`'s "do not change dependencies without approval" rule.

- **OQ-6 — Ship the `(deleted_at, status, published_at)` index now, or let 0064 add it?** **D-9** ships
  it, and both experts recommended that, while both also flagged it as a departure from this repo's
  small-table cardinality rule and as speculative rather than measured. **Recommendation: ship it now
  (recommended)** — the write cost on a low-write table is negligible, the index shape matches 0064's
  query exactly with no ambiguity about composite order, and `blog_posts` is the one table in this
  domain with an unbounded growth story. *Alternative:* defer to 0064, which then owns the decision
  once its query plan is real. Either is defensible; what is not acceptable is letting it default
  silently. **The column order is no longer part of this question** — `deleted_at` must lead once
  `BlogPost` soft-deletes, per [schema.md](../../docs/database/schema.md#users)'s own rule for
  `users.status`, so only *whether* the index ships here is open, not *what it looks like*.

- **OQ-7 — Refusal-logging test file naming: fold or split?** Two conventions are live in this repo
  today. Users/Roles/SalesRegions each have a **separate** `RefusalLoggingTest.php` (verified: all
  three files exist), while 0058 and 0059 fold the assertion into their `*AuthorizationTest.php`.
  **Recommendation: fold, matching the immediate Epic 4 siblings (recommended)** — intra-epic
  consistency beats cross-epic consistency for a file a reader opens while working on Epic 4. Flagged
  explicitly rather than defaulted because
  [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#folder-structure)'s
  generalisable rule is that **a story file naming a test path is making a convention decision, and
  the path belongs in the Phase 2 review.**

## Provenance

Phase 1 (Three Amigos) debate run on 2026-08-27 with `backend-expert` (files and approach),
`database-expert` (schema, FK semantics, indexes) and `backend-qa` (test design), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate). Derived from
[PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's three Gherkin blocks and its Blog acceptance
criteria, plus assumptions 13, 14, 17 and 19 and the cross-cutting notifications list. The
`blog_posts`-completes-the-taxonomy scoping, the 0058 → 0061 hand-off of the in-use delete guard and
the 0059 → 0061 hand-off of the pivot contract all mirror the confirmed 0023 → 0024 decomposition,
recorded here so no missing piece reads as an oversight.

All three amigos' contributions are reflected above. **Two of their findings changed this document
rather than merely supporting it, and each was independently verified by the facilitator against the
real tree before being accepted**, per this project's rule that a second-hand claim is a flag that
nobody ran the code:

1. **`backend-expert` found that 0024a's D-16 carries a scope fence naming *this* story in advance** —
   the blog body must reuse the product sanitizer's configuration rather than define a second
   allow-list. Confirmed by reading `ai-spec/tasks/done/0024-products-core-crud-backend.md:1309-1311`
   directly. It also found the matching half on the other side: 0021's **D7** emits a *bare*
   `<img src alt>` precisely because 0024a's allow-list has no `<figure>`, confirmed at
   `ai-spec/tasks/done/0021-wysiwyg-rich-text-editor-component.md:478`. Together these turn "will
   sanitization eat the gallery's images?" from an open worry into a verified no, and produced
   **D-14** plus its required regression test.
2. **`backend-qa` found the `after:now` trap** — an unconditional future-date rule makes every edit to
   an already-overdue `Scheduled` post impossible, a bug that ships green and surfaces only once
   wall-clock time passes a stored date. Recorded as the third bullet of **D-6**, as **R-9**, and as
   the case explicitly named most important in its own test file.

**Two conflicts between contributions were resolved by the facilitator rather than left implicit.**

**(a) `body`'s column type.** The story brief and `backend-expert` said `LONGTEXT`; `database-expert`
argued `mediumText` on the concrete grounds that it matches `products.description`, keeps the
validation rule the binding limit, and preserves a structural signal that a multi-megabyte body is a
bug rather than content. **Resolved in favour of `mediumText`** — but because this diverges from the
brief, it is recorded loudly in **D-4** and escalated as **OQ-3(a)** rather than applied silently.

**(b) Whether `slug` exists at all.** `backend-expert` argued for omitting it entirely (no consumer
this phase; Epic 5 owns slug/SEO fields; a column no route reads is speculative scaffolding).
`database-expert` and the story brief both argued for including it. **Resolved in favour of
including it**, on the argument that actually separates this case from 0058's identical-looking
decision: PRD assumption 14 names slug/SEO fields for **posts specifically**, and 0058's own **D-6**
leans on that same distinction in the opposite direction. `backend-expert`'s dissent is recorded in
full in **D-3** rather than dropped, because its "no consumer yet" point remains true and is exactly
what **OQ-2**'s collision question inherits.

A third potential conflict resolved cleanly rather than needing arbitration: `backend-expert` noted
that **two self-authorization idioms are live in this codebase** — `app/Actions/SalesRegions/` and
both Epic 4 siblings self-authorize, while 0024's **D-15** deliberately does not — and chose the Blog
folder's own precedent, since not following it would make a single folder internally inconsistent.
The facilitator accepted that reasoning unchanged (**D-13**). *(2026-09-01: 0024 reversed D-15, so the
second idiom has all but disappeared — the conclusion holds and the argument for it is now shorter.
See the ✅ note on **D-13**.)*

**One thing this story deliberately does *not* inherit from its Epic 4 siblings, stated so its absence
is not read as an oversight:** the stored `normalized_name` + `NormalizeForSearch` convention that
0058's **D-4** and 0059's **D-3** both build on, and which [0032's **D-N1**](done/0032-shipping-geography-catalog-seed.md)
establishes project-wide. Both experts independently concluded it has **no bearing here**, for two
separate reasons — `title` carries no uniqueness rule at all, and a `Str::slug()` output is already
normalized by construction — so this story neither stores a fold nor calls the shared normaliser, and
adds no re-seed obligation to it. That conclusion is recorded as **D-10** rather than left unstated,
since a reviewer moving from 0058 or 0059 to this file will look for the pattern and needs to find the
reason it is absent.

### Revised 2026-08-27 — two escalated product questions confirmed

**The product owner answered three of this story's escalated open questions** (recorded as a set in
[Resolved questions](#resolved-questions)), and the two substantive ones changed the design rather
than merely ratifying it:

1. **Blog posts are deletable, via soft delete** (**OQ-1** + **OQ-5**, taken as one decision). Added
   `blog_posts.deleted_at` and `SoftDeletes` on the model, `DeleteBlogPost` promoted from
   conditional to shipped, a `Feature: Deleting a blog post` Gherkin block, a
   `DeleteBlogPostTest.php` case list, and four acceptance criteria. **D-7** was rewritten from a
   hard-delete refusal into the confirmed decision, with its three taxonomy arguments answered one by
   one rather than deleted — two of them still hold and one now argues *for* the new shape.
2. **A `Draft` may be bodiless; `Published` and `Scheduled` may not** (**OQ-3(b)**). `body` is now
   nullable, and **D-4** carries the status-parameterised `bodyRules()` plus the reason it is a `match`
   on the typed parameter rather than `required_if` — which would fail **open** on a direct call where
   no `status` key is present in the validated array.

3. **`RestoreBlogPost` ships here rather than in 0063** (**D-20**, added later the same day at story
   0063's request). This story had left restoring to 0063 as a UI affordance, citing `App\Models\User`
   — where `SoftDeletes::restore()` has **zero call sites**. 0063 correctly objected on a convention
   rather than a preference: **a UI story consumes `app/Actions/` and never authors it**, which 0060
   and 0062 both honour. The `User` precedent turned out to be a fact about `User` (nothing ever
   needed to restore an account), not a rule about soft-deleted models. Gated on **`blog.edit`**, not
   `blog.delete` and not a new permission — the seeded catalog has only the four CRUD verbs, and
   restore is the non-destructive direction. `BlogPostPolicy` therefore has **five abilities over
   four permission strings**, the first such mapping in this repo.

4. **Publishing notifies, and there are three triggers, not two** (**D-19**, revised at story 0065's
   request). `CreateBlogPost` accepts a status, so a post can be **created already `Published`** — a
   path neither this story's original D-19 nor 0064's hand-off accounted for, and one that would have
   announced nothing, silently. Both this story's paths now dispatch 0065's `NotifyBlogPostPublished`
   after the commit; 0064's sweep is the third. **D-19 previously said this story fired nothing at
   all**, and that reversal is recorded in the decision rather than overwritten.
5. **`UpdateBlogPost` re-reads its subject first** (**D-19a**, closing 0065's **R-1**). 0065 verified
   the trigger-1 dispatch and found that `getRawOriginal('status')` defends against a *dirtied*
   instance but not a *stale* one: a scheduler sweep landing between page load and save makes an
   editor's no-op edit look like a fresh transition into `Published` and fire a duplicate
   announcement. Closed with `$blogPost->refresh()` as the action's first statement — which also
   closes the `save()`-writes-the-whole-dirty-set hole `model-instance-trust.md` records as **still
   open** on `UpdateSalesRegion`, and which this story would otherwise have shipped identically.

**Three second-order consequences fell out of the soft-delete answer, and none of them was in the
original decision's scope** — they are the reason this revision is more than an insertion:

- **The category-delete guard's count had to change** (**D-7d**). A trashed post still holds a live
  `blog_category_id`, and `restrictOnDelete()` cannot see `deleted_at`, so an unscoped count would
  pass its own guard and then produce the refusal *"used by 0 posts"*. The count is now
  `withTrashed()`, matching what the FK itself counts. `App\Models\Role::guardAgainstHolders()` is the
  repo's precedent — reached from the opposite mechanism (a cascade destroying data rather than a
  restrict refusing) and arriving at the same rule, which is what makes "count what the FK counts" the
  durable form.
- **The composite index had to be reordered** (**D-9**). `deleted_at` now leads, because the
  `SoftDeletingScope` puts `deleted_at IS NULL` into 0064's sweep and
  [schema.md](../../docs/database/schema.md#users) states exactly this rule for `users.status`.
- **The slug's fate on delete became a real design call** (**D-7b**), and it is answered *against* the
  `App\Models\User::delete()` precedent: no override, no obfuscation, the slug stays reserved.
  Obfuscating it would make a restore lossy or fallible, which defeats the decision that motivated the
  soft delete — and `User`'s own stated reason (revoking everything keyed by the freed string) has no
  analogue here, since nothing in this database is keyed by a slug.

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Four items deserve an explicit look
there rather than at implementation time:

1. **OQ-2** — slug collision handling, which must be settled before the `saving` hook can be written,
   and which the soft delete narrowed: the collision check must count trashed rows.
2. **OQ-3** — `body`'s column type, the one remaining divergence from the story brief.
3. **OQ-4** — the sanitizer ownership race with 0024, including who records the dependency approval.
4. **OQ-6** — whether the composite index ships here or in 0064; its *shape* is no longer open.
5. **OQ-7** — the refusal-logging test path, which is a convention decision and therefore belongs in
   the Phase 2 review by this project's own rule.

One thing Phase 2 should check that is **not** an open question: **D-7d**'s accepted cost (**R-16**) —
an administrator can be blocked by a post they cannot see until story 0063 ships a trash affordance.
The decision is sound and the obligation is recorded in the Definition of Done, but it is the kind of
cross-story dependency that is cheapest to confirm now and expensive to discover in 0063's own review.
