# [0063] Blog posts — list + editor UI

> ## ⚠️ Epic 5 amendments — this file predates **three** translatable-content retrofits and has been amended, 2026-08-30, to stay accurate
>
> This story was debated on 2026-08-27 against a schema in which a post had **one** title, **one**
> body and **one** slug, a blog category had **one** name and a blog tag had **one** name. **Three
> separate, already-finalized Epic 5 stories each drop one of those column sets**, and this screen is
> the only file in the epic that all three break. Per
> [0078's technical task 1](0078-translatable-content-retrofit-blog-posts-backend.md#6-technical-tasks-for-later-backlog-creation)
> — *"0063 needs one coherent amendment covering all three Epic 5 taxonomy/content retrofits at once,
> not three separate ones"* — this is that single amendment.
>
> **The six upstream files, three backend/UI pairs:**
>
> | Pair | What it removes from under this screen |
> | --- | --- |
> | [**0072** — Blog Categories backend](0072-translatable-content-retrofit-blog-categories-backend.md) + [**0073** — Blog Categories language tabs](0073-blog-categories-language-tabs-ui.md) | Drops `blog_categories.name` **and** `normalized_name` into `blog_category_translations`. A category's name is now `translated('name', $languageId)`. |
> | [**0074** — Blog Tags backend](0074-translatable-content-retrofit-blog-tags-backend.md) + [**0075** — Blog Tags language tabs](0075-blog-tags-language-tabs-ui.md) | Drops `blog_tags.name` **and** `normalized_name` into `blog_tag_translations`, with uniqueness re-scoped per store language. A tag's name is read the same way. |
> | [**0078** — Blog Posts backend](0078-translatable-content-retrofit-blog-posts-backend.md) + [**0079** — Blog post editor language tabs](0079-blog-post-editor-language-tabs-ui.md) | **The largest.** Drops `blog_posts.title`, `body` **and** `slug` into `blog_post_translations`, one row per `(post, store language)`, with `UNIQUE(store_language_id, slug)`. `BlogPost` narrows to `#[Fillable(['blog_category_id', 'status'])]`. 0079 then turns this story's editor into per-language tabs and adds `App\Actions\Blog\SetBlogPostTranslation`. |
>
> **These are corrections, not a redesign.** This story's job is unchanged — the list, the routed
> editor, the filters, delete, the trashed section, the registry entry — and it does **not** grow the
> language-tabs UI, which is **0079's**. What is corrected below is every place this file asserts
> something the three retrofits make false.
>
> **Four facts to carry into every correction below**, because they answer most of the questions the
> rest of this block raises:
>
> 1. **The slug is derived per language and is never administrator-facing.** 0078 **D-4** relocates
>    0061's `saving` hook onto `BlogPostTranslation`, guarded on `isDirty('title')`, deriving *that
>    language's* slug from *that language's* title; `#[Fillable]` omits `slug`, and 0078 scripts *"a
>    blog editor cannot supply a slug directly."* **This screen therefore renders no slug field, adds
>    no `$slugs` state and gains no slug input** — see the [verified check](#verified-no-single-slug-assumption-survives-in-this-file)
>    below, and 0079's own ⛔ block, which corrects an earlier coordinator brief that said the
>    opposite.
> 2. **A slug collision is refused with a validation error, not auto-suffixed** — 0061's **OQ-2**,
>    resolved 2026-08-30 to option **(b)** ([0078 **R-4**](0078-translatable-content-retrofit-blog-posts-backend.md), ✅ CLOSED).
>    Since there is no slug field, that refusal must land on the **title** field of whichever language
>    is being edited (0079 **D-2**, **R-4**).
> 3. **`status`, `published_at`, `blog_category_id` and the tag set stay *outside* the tabs and render
>    exactly once.** PRD Epic 5 puts *"status, dates"* explicitly outside the language tabs; 0078
>    **D-1** and 0079 **D-1**/**D-12** both state it. Nothing in this amendment moves them into
>    per-language state, and a reader who thinks it does has misread it.
> 4. **The list must keep excluding `body`, and the obligation *moves* rather than disappearing**
>    (0078 **D-8**). `blog_posts` no longer holds `body` at all, so the `select()` cannot exclude it —
>    the **translation eager load** must, and the editor's must do the opposite. See the
>    [D-4 correction](#d-4--the-list-query-explicit-columns-two-eager-loads-real-pagination) and
>    0079 **D-7**.
>
> **Where the corrections are**, each marked in place with what the text used to say:
>
> | Site | What changed |
> | --- | --- |
> | [Description](#description) | the editor's fields are per-language; the list's title is resolved |
> | [Gherkin](#gherkin) | a reading note — no scenario is struck |
> | [Interface contract consumed](#interface-contract-consumed) | `BlogPost`'s dropped columns and narrowed `#[Fillable]`, `BlogCategory`'s, `FindOrCreateBlogTag`'s moved lookup, the widened validation trait |
> | [Files to create/modify](#files-to-createmodify) | which of these files **0079** also opens |
> | [Tests to perform](#tests-to-perform) | the invalidated cases, per 0079's own disposition table |
> | **[D-4](#d-4--the-list-query-explicit-columns-two-eager-loads-real-pagination)** | **the list query — it names three dropped columns and does not run** |
> | [D-5](#d-5--two-taxonomy-filters-url-bound--the-first-filters-this-repo-has-shipped) | the filters still bind ids; their **option labels** are now resolved |
> | [D-6](#d-6--every-wiremodel-bound-propertys-type-and-empty-value) | `$title`/`$body` become arrays (0079's); `$status`/`$publishedAt` **unchanged**; `$deletingBlogPostTitle` is fed from a dropped column |
> | [D-9](#d-9--the-bodiless-draft-rule-surfaces-as-a-validation-message-not-a-disabled-control) | the rule rescopes to the **default language's** body |
> | [D-10](#d-10--the-tag-field-is-bespoke-and-binds-names-searchablemultiselect-is-structurally-ruled-out) | `$blogPost->tags->pluck('name')` — the **fourth** break site, which 0078's own R-1(a) does not name |
> | [D-12](#d-12--the-trashed-affordance-is-a-collapsed-section-on-the-list-not-a-filter-and-not-a-route) | the trashed query names two dropped columns |
> | [D-14](#d-14--the-wysiwyg-seam-and-why-this-story-embeds-no-gallery) | one WYSIWYG → **N**; the no-gallery assertion stays literally true and stops meaning what it meant |
> | [D-15](#d-15--the-delete-confirmation-and-closemodal-clears-validation) | the modal names the target by a resolved title |
> | [Scope fences](#scope-fences-what-this-story-must-not-do) | *"no new file under `app/Actions/`"* — still true **of this story**; *"no per-locale tabs"* — still true, and now **0079's** |
> | [Acceptance criteria](#acceptance-criteria) | three criteria falsified |
> | [Definition of Done](#definition-of-done) | two items added |
> | [Dependencies](#dependencies) | four hard dependencies added, and the sequencing that follows |
> | [Open questions](#open-questions) | **OQ-10**, new: which store language the screen's **taxonomy labels** resolve in |
>
> **What needed a decision and how each was settled** — stated here rather than left to be inferred:
>
> - **Which language the list renders the post title in — ✅ already answered, and not by this
>   amendment.** [0079](0079-blog-post-editor-language-tabs-ui.md) scripts it
>   (*"The list shows each post's title in the store's default language"*), states it in its Expected
>   outcome and pins it in its disposition table. **The store default**, consistent with
>   [0027's OQ-10](0027-products-list-and-editor-ui.md#open-questions), resolved the same way on
>   2026-08-30 for the Products list.
> - **Which language the editor opens on — ✅ already answered by 0079.** The store default's tab
>   (its Gherkin *"The default store language's tab is the one shown first"*, and its acceptance
>   criteria).
> - **Ordering — ✅ no question arises, and this file gets credit for it.** This story orders by
>   `created_at DESC, id ASC` and **never** `orderBy('title')` (**D-4**), deliberately, because 0061
>   **D-10** gives posts no title uniqueness. So unlike 0027 — which needed
>   `scopeOrderByTranslatedName()` and a resolved OQ-10 before its ordering test's fixture could be
>   written — nothing here orders by a translated column, and 0078 ships no ordering scope for posts.
> - **Which language the *taxonomy* labels resolve in (the category cell, both filter dropdowns, the
>   editor's category select, the tag chips) — ⚠️ named by no story, and now [OQ-10](#open-questions).**
>   Adopted here as the store default **by analogy** with 0027's OQ-10 and with 0079's own list
>   decision, and recorded honestly as an adoption rather than as an independent ruling — **Phase 2
>   must ratify it.** The argument that settles it is 0027's: a category rendered one way in a row and
>   another way in the filter above it is worse than either choice alone.
> - **Two questions belonging to 0079 land on the editor this story builds and are *not* resolved
>   here** — its **Q-1** (how `SetBlogPostTranslation` expresses "a non-default body is never
>   required" without editing 0078's trait) and its **Q-2** (whether a tab discloses its derived slug
>   read-only). Both are that story's to close before its Phase 3.
> - **One genuinely open cross-story gap is inherited, not closed:** [0079's **R-3**](0079-blog-post-editor-language-tabs-ui.md) —
>   `FindOrCreateBlogTag` has no language context after 0074, and neither 0074 nor 0078 closes it.
>   The *behaviour* is settled (the store default, 0074 **D-7**/**Q-1(a)**, confirmed by 0079
>   **D-12**); what is unsettled is whether the signature and the lookup shape survive intact.
>
> **This amendment edits no other story's file**, per the rule every file in this epic follows.

## Description
The Blog module's headline screen, and the last of Epic 4's three: a permission-gated **post list**
(title, category, status badge, date, filter by category, filter by tag, a way to reach deleted
posts) plus a routed **post editor** (title, category select, status select with a conditionally
revealed publication date, a WYSIWYG body, and a tag chip field that both reuses existing tags and
creates new ones on the fly). It is **UI only**: every write goes through story
[0061](0061-blog-posts-core-crud-backend.md)'s domain actions, and this story writes **nothing** under
`app/Actions/` — matching how 0060 and 0062 only ever call actions their backend siblings own.

It also discharges an obligation 0061 wrote into its own Definition of Done by name: **a way to reach
trashed posts.** Without one, 0061's **D-7d** category-delete block has no exit — a blog category can
be permanently undeletable because of a post that no screen displays.

Covers [PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog posts` scenarios, the two
**post-editor** scenarios inside `Feature: Blog tags` (*Reuse an existing tag from the post editor*,
*Create a new tag on the fly from the post editor* — the management-screen scenarios beside them are
story [0060](0060-blog-tags-ui.md)'s, not this one's), the `Scenario Outline: Filter the blog list by
taxonomy`, and Blog acceptance criteria 1, the create-on-the-fly half of 3, and 4.

> ⚠️ **Correction, 2026-08-30 — the paragraph above reads as one title, one body and one category
> name per post, and after the three Epic 5 retrofits none of those is singular.** It opened *"a
> permission-gated **post list** (title, category, status badge, date, …) plus a routed **post
> editor** (title, category select, status select …, a WYSIWYG body, and a tag chip field …)"*.
> Read it now as:
>
> - **The list's `title` and `category` cells are *resolved*, not selected.** A post's title comes
>   from `translated('title', $languageId)` against `blog_post_translations` (0078 **D-4**), a
>   category's name from `translated('name', $languageId)` against `blog_category_translations`
>   (0072). Both can resolve to `null` — a reachable state after a store-default change (0070
>   **R-2**) — which renders an **em dash**, never an error. The language is the **store default**
>   for the title (0079) and, per [OQ-10](#open-questions), for the category too.
> - **The editor's `title` and body are authored once per active store language**, inside language
>   tabs — but the tabs are **[0079](0079-blog-post-editor-language-tabs-ui.md)'s to build, not this
>   story's**. This story still ships the single-field editor as written until 0079 lands on top of
>   it; what is corrected here is only what this file *asserts*.
> - **`status`, the publication date, the category select and the tag chips render exactly once,
>   outside any tab** (0078 **D-1**, 0079 **D-1**/**D-12**). Nothing about the status badge, the
>   conditional date reveal or the filters becomes per-language.
> - **The tag chips' labels are resolved too** (0074), and the field still binds **names** rather
>   than ids (**D-10**) — which is what makes 0079's **R-3** an open gap rather than a mechanical
>   rename.
>
> **The screen's shape, its routes, its permission gate, its trashed section and its registry entry
> are all unaffected.**

## Type
frontend | includes database-expert: **no**

## Three Amigos participants

`product-owner` (lead/facilitator) + `frontend-expert` (files and approach) + `frontend-qa` (Gherkin
and test design). Both were convened as subagents under an explicit read-only instruction and both
contributions are reflected below. **Four conflicts between them were resolved by the facilitator
rather than left implicit** (**C-1**–**C-4**), and **seven findings came from the facilitator's own
verification rather than from either amigo** (**V-1**–**V-7**) — see [Provenance](#provenance).

`database-expert` is **not** convened: this story adds no table, column, migration, index or query
plan. Its one query is a `select()` list over a table 0061 designs, and its one new write (**D-13**)
is a `restore()` on an existing column.

## PRD coverage

| PRD scenario / criterion | Owned here |
| --- | --- |
| *Create a post* → "the post appears in the blog list with its status badge and date" | The editor's create path and the list's rendering. 0061 owns the persistence. |
| *Insert an image into a post body from the shared gallery* | The WYSIWYG seam (**D-14**). 0021 owns the insertion mechanics; 0020 owns the gallery. |
| *A post has exactly one category* | The category control being a single `<select>` with no multi-select affordance and no "none" option (**D-6**). |
| *Reuse an existing tag from the post editor* | The tag chip field (**D-10**). 0059 owns `FindOrCreateBlogTag`'s matching. |
| *Create a new tag on the fly from the post editor* | The same field, plus the `blog.create` refusal surfacing rather than 403-ing (**D-11**). |
| *A post can hold more than one tag* | The chip field's multi-value shape. |
| `Scenario Outline: Filter the blog list by taxonomy` | Both filters (**D-5**), consuming 0061's `scopeForCategory()` / `scopeForTag()`. |
| Blog AC 4 — "the admin blog list can be filtered by category and by tag" | The whole of **D-5**. |
| 0061's **D-7d** hand-off — an exit for the category-delete block | The trashed-posts affordance (**D-12**). Not a PRD line; a cross-story obligation. |

**Deliberately not covered here:** the blog *category* CRUD screen (story **0062**, being written in
parallel) and the tag *management* screen (story **0060**, done). This story consumes both taxonomies
read-only, except through the post editor's own tag field.

## Gherkin

Every scenario opens with the named business-role actor **"a blog editor"** and carries exactly one
`When`, per [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.
The actor term and the entity term **"post"** are taken verbatim from the PRD and from 0061's own
Gherkin — see **D-22** on why "post" rather than "article", which closes a live `TODO (product owner)`
in that guidelines file.

> ⚠️ **Correction, 2026-08-30 — read every mention of a post's *title* or *body*, and every category
> and tag *name*, as "in one store language". No scenario below is struck**; every one still
> describes real behaviour, and the actor, the entity term and the single-`When` discipline are all
> unchanged. Four groups need reading with 0072/0074/0078/0079 in mind:
>
> - **The list scenarios** (*"each post is shown with its title, category, status badge and date"*)
>   render a title and a category name resolved for **one** language — the **store default** (0079;
>   [OQ-10](#open-questions) for the category half). A post or category translated in no language at
>   all renders an em dash rather than raising, and that case is worth its own scenario in 0079's
>   file, where it already exists.
> - **The editor scenarios** (*"they create a post titled …"*, *"they retitle it to …"*, *"a post
>   cannot be saved without a title"*) describe the **default language's tab** once 0079 lands. They
>   remain literally true of this story as shipped, and 0079 adds the per-language scenarios beside
>   them rather than replacing them.
> - **The body scenarios** (*"Publishing a post with no body is refused"*, *"Promoting a bodiless
>   draft to published is refused"*) rescope to the **default language's** body only — 0078's
>   **Q-1**, resolved 2026-08-30 to option **(a)**. A blank **French** body must never block
>   publishing, or adding a store language retroactively unpublishes the catalog. See the
>   [D-9 correction](#d-9--the-bodiless-draft-rule-surfaces-as-a-validation-message-not-a-disabled-control).
> - **The tagging scenarios** (*"A tag differing only by case reuses the existing tag"*) still hold,
>   with their matching now scoped to one store language's `normalized_name` partition (0074
>   **D-8**) — the store default, per 0074 **D-7**. Note 0074 **R-6**'s consequence, which this
>   screen is the first UI to expose: an editor reading French-rendered tag names and typing a French
>   name gets a lookup against the **default** partition, so a tag already translated into French
>   with that name is invisible to the reuse check.
>
> **Nothing is added here.** The per-language scenarios — one tab per active language, an
> untranslated tab opening empty rather than pre-filled, a refusal on a hidden tab bringing it into
> view — belong to [0079's own Gherkin](0079-blog-post-editor-language-tabs-ui.md) and are
> deliberately not duplicated into this file.

```gherkin
Feature: The blog post list

  Scenario: A blog editor views the list of posts
    Given a blog editor, with several posts across categories and tags
    When they open the blog list
    Then each post is shown with its title, category, status badge and date

  Scenario: A newly created post appears in the list
    Given a blog editor who has just created a post
    When they return to the blog list
    Then the new post appears with its status badge and date

  Scenario: The list shows an empty state when no post exists
    Given a blog editor, with no posts at all
    When they open the blog list
    Then they are told there are no posts yet

  Scenario Outline: Filter the blog list by taxonomy
    Given a blog editor viewing the blog list across several categories and tags
    When they filter the list by <filter>
    Then only posts matching <filter> are shown

    Examples:
      | filter     |
      | a category |
      | a tag      |

  Scenario: Clearing a taxonomy filter restores the full list
    Given a blog editor who has filtered the blog list by a category
    When they clear that filter
    Then every post is shown again

  Scenario: Filtering returns to the first page of results
    Given a blog editor on the second page of the blog list
    When they filter the list by a category
    Then they are shown the first page of the filtered results

  Scenario: A deleted post is absent from the list
    Given a blog editor, with a post that has been deleted
    When they open the blog list
    Then that post is not shown among the posts

Feature: Creating and editing a post

  Scenario: A blog editor creates a post
    Given a blog editor, with the category "Guías" in the catalog
    When they create a post titled "Botas de invierno" in that category with a status and a body
    Then the post is saved and appears in the blog list

  Scenario: A blog editor retitles an existing post
    Given a blog editor editing the post "Botas de invierno"
    When they retitle it to "Botas de invierno 2026"
    Then the post is shown under its new title in the blog list

  Scenario: A post cannot be saved without a category
    Given a blog editor composing a new post
    When they try to save it without choosing a category
    Then the save is refused and the reason is shown beside the category field

  Scenario: A post cannot be saved without a title
    Given a blog editor composing a new post
    When they try to save it with a blank title
    Then the save is refused and the reason is shown beside the title field

  Scenario: A blog editor inserts an image into a post body from the shared gallery
    Given a blog editor composing a post body
    When they insert an image from the shared media gallery
    Then the image appears inline in the body

  Scenario: Abandoning the editor saves nothing
    Given a blog editor who has filled in a new post without saving it
    When they leave the editor
    Then no post is added to the blog list

Feature: Post status and the publication date

  Scenario: Choosing a status of Draft shows no publication-date field
    Given a blog editor composing a post
    When they set the status to Draft
    Then no publication-date field is shown

  Scenario: Choosing a status of Scheduled reveals the publication-date field
    Given a blog editor composing a post
    When they set the status to Scheduled
    Then a publication-date field is shown

  Scenario: Scheduling a post without a publication date is refused
    Given a blog editor composing a post
    When they try to save it as scheduled without giving a publication date
    Then the save is refused and the reason is shown beside the publication-date field

  Scenario: Scheduling a post for a date that has passed is refused
    Given a blog editor composing a post
    When they try to schedule it for a date that has already passed
    Then the save is refused and the reason is shown beside the publication-date field

  Scenario: Publishing a post without a publication date stamps it as published now
    Given a blog editor, with a draft post
    When they publish it without giving a publication date
    Then the post is shown as published, dated today

  Scenario: A blog editor edits a scheduled post whose date has already passed
    Given a blog editor, with a scheduled post whose publication date has already passed
    When they retitle it without touching its status or its date
    Then the save is accepted

  Scenario: Returning a scheduled post to draft clears its publication date
    Given a blog editor, with a post scheduled for a future date
    When they return that post to draft
    Then the post is shown as a draft with no publication date

Feature: A post's body

  Scenario: A blog editor saves a draft before writing its body
    Given a blog editor composing a new post
    When they save it as a draft with a title and no body
    Then the post is saved as a draft

  Scenario: Publishing a post with no body is refused
    Given a blog editor composing a post
    When they try to save it as published with an empty body
    Then the save is refused and the reason names the missing body

  Scenario: Scheduling a post with no body is refused
    Given a blog editor composing a post
    When they try to save it as scheduled with an empty body
    Then the save is refused and the reason names the missing body

  Scenario: Promoting a bodiless draft to published is refused
    Given a blog editor, with a draft post that has never had a body
    When they try to change its status to published without writing a body
    Then the save is refused and the post is still shown as a draft

Feature: Tagging a post from the editor

  Scenario: A blog editor reuses an existing tag
    Given a blog editor composing a post, with the tag "running" already existing
    When they add "running" from the tag field
    Then "running" is attached to the post, not duplicated

  Scenario: A tag differing only by case reuses the existing tag
    Given a blog editor composing a post, with the tag "running" already existing
    When they add "Running" from the tag field
    Then the existing "running" tag is attached to the post

  Scenario: A blog editor creates a new tag on the fly
    Given a blog editor composing a post, with no tag named "invierno"
    When they add "invierno" from the tag field and save
    Then a new tag "invierno" is created and attached to the post

  Scenario: A post can carry more than one tag
    Given a blog editor composing a post already tagged "running"
    When they add the tag "invierno"
    Then the post is shown carrying both "running" and "invierno"

  Scenario: A blog editor removes a tag from a post
    Given a blog editor editing a post tagged "running" and "invierno"
    When they remove "invierno" and save
    Then the post is shown carrying "running" alone
    And "invierno" is still available to attach to other posts

  Scenario: An editor who may not create tags is told before they try
    Given a blog editor who may edit posts but may not create tags
    When they type a tag name that does not yet exist
    Then the control that would add it is shown as unavailable, with the reason

Feature: Deleting and recovering a post

  Scenario: A blog editor deletes a post
    Given a blog editor, with the post "Botas de invierno" in the list
    When they confirm deleting it
    Then "Botas de invierno" no longer appears in the blog list

  Scenario: Cancelling a delete confirmation leaves the post untouched
    Given a blog editor who has opened the delete confirmation for a post
    When they cancel instead of confirming
    Then the post still appears in the blog list

  Scenario: A blog editor finds a deleted post
    Given a blog editor, with a post that has been deleted
    When they open the deleted-posts section
    Then the deleted post is listed there

  Scenario: A blog editor restores a deleted post
    Given a blog editor viewing the deleted-posts section, with the deleted post "Botas de invierno"
    When they restore it
    Then "Botas de invierno" appears in the blog list again, with its category and tags intact
    And it is no longer listed among the deleted posts

  Scenario: An editor who may not edit posts is offered no way to restore one
    Given a blog editor who may delete posts but may not edit them, viewing a deleted post
    When they look at that post's row in the deleted-posts section
    Then the control that would restore it is shown as unavailable

Feature: The blog posts screen is permission-gated

  Scenario: An administrator without the blog permission cannot open the blog list
    Given a signed-in administrator who does not hold the blog viewing permission
    When they try to open the blog list
    Then they are refused

  Scenario: An administrator without the blog permission is offered no link to it
    Given a signed-in administrator who does not hold the blog viewing permission
    When they view the dashboard navigation
    Then no link to the blog posts screen is shown

  Scenario: A Super Admin reaches the blog list
    Given a signed-in Super Admin holding no permission rows of their own
    When they open the blog list
    Then the list is shown
```

> **One PRD scenario is deliberately not translated as its own scenario**: *"A post has exactly one
> category"*. Its `When they select a category / Then the post has exactly that one category` asserts
> a **control shape** (one `<select>`, no multi-select affordance, no "none" option), which
> [rule 2](../../docs/testing/frontend/gherkin-guidelines.md#2-no-overly-technical-details) puts in the
> Pest translation rather than in a scenario, and which the create scenario above already exercises.
> Restating it would be a [ghost scenario](../../docs/testing/frontend/gherkin-guidelines.md) —
> `frontend-qa`'s call, adopted.

## Interface contract consumed

> **Read every line below as a claim about a *task file*, not about code.** **V-1**: none of stories
> 0020, 0021, 0022, 0058, 0059 or 0061 exists in this tree — `app/Models/` holds only `Role.php`,
> `SalesRegion.php`, `User.php`, and `app/Livewire/` holds only `Actions/`, `Roles/`, `SalesRegions/`,
> `Settings/`, `Users/`. Per this project's
> [deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23),
> **every citation below must be re-verified against `HEAD` before Phase 3**, and each disposition
> recorded — including "already closed". Five to seven stories land between this debate and that
> point.

From **[0061](0061-blog-posts-core-crud-backend.md)** — the whole backend:

```php
App\Models\BlogPost                       // HasUuids (v7), SoftDeletes, #[Fillable(['title','body','blog_category_id','status'])]
                                          //   casts: status => BlogPostStatus, published_at/deleted_at => datetime
                                          //   category(): BelongsTo, tags(): BelongsToMany
                                          //   scopeForCategory(Builder, string $blogCategoryId)   <- takes an ID
                                          //   scopeForTag(Builder, string $blogTagId)             <- takes an ID
App\Enums\BlogPostStatus                  // Draft='draft' | Published='published' | Scheduled='scheduled'; NO label() yet (D-18)
App\Policies\BlogPostPolicy               // FIVE abilities over FOUR permission strings:
                                          //   viewAny/create/update/delete -> blog.view/create/edit/delete
                                          //   restore                      -> blog.edit   (0061 D-20)
                                          //   VIEW_/CREATE_/EDIT_/DELETE_PERMISSION public consts
App\Actions\Blog\CreateBlogPost           // __invoke(string $title, string $body, string $blogCategoryId,
                                          //          BlogPostStatus $status, ?string $publishedAt, array $tagNames): BlogPost
App\Actions\Blog\UpdateBlogPost           // __invoke(BlogPost $blogPost, ...same six...): BlogPost
App\Actions\Blog\DeleteBlogPost           // __invoke(BlogPost $blogPost): bool   -- soft delete
App\Actions\Blog\RestoreBlogPost          // __invoke(BlogPost $blogPost): bool   -- authorizes `restore` (0061 D-20)
App\Concerns\BlogPostValidationRules      // titleRules(), blogCategoryIdRules(), statusRules(),
                                          //   bodyRules(BlogPostStatus), publishedAtRules(BlogPostStatus), tagNamesRules()
```

Five constraints 0061 binds this story to, quoted rather than paraphrased:

- **The complete tag-name set goes on every save** — `SyncBlogPostTags` is a full-replace `sync()`, so
  an omitted name **detaches** (0061 **D-17**). Its safety is conditional on the field staying
  unfiltered (**D-10**).
- **Never call `SyncBlogPostTags` or `FindOrCreateBlogTag` directly** — only the post actions.
- **Never `SELECT *`** — `body` is `mediumText` and stays inline in the clustered index (0061 **R-7**).
- **`status` must be a plain string property, never a typed enum**, because Livewire's `EnumSynth`
  hydrates a forged value through `from()` *before* validation (0061 **D-12**, task 0015's F8).
- **Provide a way to reach trashed posts, and restore from there** (0061 **D-7d**/**R-16**) — while
  **not authoring the action**: `RestoreBlogPost` ships in 0061 (**D-20**), is **method-injected** on
  the Livewire action method, and its target is resolved `withTrashed()` because a default query
  cannot see the row. **Force-delete is deliberately not available**; restore is the only exit.

From **[0059](0059-blog-tags-backend.md)**: `FindOrCreateBlogTag::__invoke(string $name): BlogTag` —
name-keyed, case- and accent-insensitive via `normalized_name`, and asking a **different ability per
branch** (`blog.view` to reuse, `blog.create` to mint — its **D-11**). Reached only through the post
actions. From **[0058](0058-blog-categories-backend.md)**: `App\Models\BlogCategory`, `#[Fillable(['name'])]`.

From **[0021](0021-wysiwyg-rich-text-editor-component.md)** **D3**/**D4**:

```blade
<livewire:components.wysiwyg-editor wire:model="body" wire:key="blog-post-body-editor" :label="__('…')" />
```

`#[Modelable] public string $value` (never `null`), plus `$label` / `$placeholder` / `$disabled`. **It
embeds the media gallery itself** — so this story embeds **no** `Gallery` (**D-14**), and passes it
nothing about media.

From **[0020](done/0020-shared-media-gallery-modal-ui.md)** **D2**: consumed *transitively only*. Named
here so a reviewer can confirm this story writes no `select-event`, no `#[On]` listener and no
`:multi` prop anywhere.

From **[0060](0060-blog-tags-ui.md)** **D-4**: `config/modules.php`'s `groups.blog` already exists —
this story **appends an item to it**, and does not create it.

> ⛔ **Correction, 2026-08-30 — six lines of the contract block above are falsified by the three Epic 5
> retrofits, and two more arrive that it never listed.** The block is left intact as the
> 0058/0059/0061-era contract and corrected here rather than rewritten in place, because most of it is
> still exactly right — the policy's five abilities, the four post actions' **signatures**, the two
> scopes and `BlogPostStatus` are all unchanged.
>
> | Line as written | After Epic 5 |
> | --- | --- |
> | `App\Models\BlogPost … #[Fillable(['title','body','blog_category_id','status'])]` | **`#[Fillable(['blog_category_id', 'status'])]`** — 0078 **D-9**, and the first retrofit whose parent keeps a **non-empty** `#[Fillable]`, so a reviewer arriving from the taxonomy siblings should not look for the zero-fillable shape. `title`, `body` and `slug` are **gone from the table**, along with `slug`'s `UNIQUE`. |
> | *(not listed)* | **`App\Models\BlogPostTranslation`** — `#[Fillable(['title', 'body'])]`, `slug` omitted because it is **derived** by that model's own `saving` hook. `BlogPost` gains `use HasTranslations;` + `translationModel()`, so `translated('title')` / `translated('body')` / `translated('slug')` resolve requested → store default → `null`, **per field**, and never throw (0070 **D-6**, 0078 **D-10**). |
> | `App\Models\BlogCategory, #[Fillable(['name'])]` | **`#[Fillable([])]`** — 0072 drops `name` **and** `normalized_name`. A category's name is `translated('name', $languageId)`. |
> | `FindOrCreateBlogTag::__invoke(string $name): BlogTag` — "name-keyed, case- and accent-insensitive via `normalized_name`" | **Signature unchanged** (0074 **D-7**), semantics narrowed: the lookup moves to `blog_tag_translations` scoped to **one** store language — the store default — so the fold is now `(store_language_id, normalized_name)`. ⚠️ **0079's R-3 records that this is not fully settled**: whether the signature really survives while its lookup spans a translation table is an open cross-story gap neither 0074 nor 0078 closes. |
> | `App\Concerns\BlogPostValidationRules` — `titleRules()`, `bodyRules(BlogPostStatus)` | `titleRules()` gains a **`string $storeLanguageId`** parameter and still carries **no uniqueness rule** (0078 **D-11** — two posts may share a title, and "add uniqueness while you're re-scoping uniqueness" is the named drift). The trait gains its **first `slugRules()`**, whose self-exclusion is an explicit `blog_post_id` clause and **never `->ignore()`**. **`bodyRules(BlogPostStatus $status)` is unchanged** — 0078 corrected an earlier draft that widened it too. |
> | *(not listed)* | **`App\Actions\Blog\SetBlogPostTranslation`** — added by **0079**, not by this story. It is the *only* class permitted to import 0070's unguarded `SetTranslation`, and `SetTranslation` must appear in **no** import under `app/Livewire/`. |
> | *"Never `SELECT *` — `body` is `mediumText` and stays inline in the clustered index"* | **Still binding, and the obligation moves.** `blog_posts` no longer holds `body`, so the parent `select()` cannot exclude it; `blog_post_translations` now carries `title`, `slug` **and** `body` together, so the **translation eager load** is what must exclude `body` on the list and must **include** it in the editor. The two are different queries and must not share a helper (0078 **D-8**, 0079 **D-7**). |
>
> Two constraints from the same block are **unchanged and worth re-stating**, because they are the
> two most likely to be "fixed" by a Phase 3 author porting a sibling: the **complete tag-name set
> still goes on every save** (`SyncBlogPostTags` is a full-replace `sync()`, 0061 **D-17**), and
> `SyncBlogPostTags` / `FindOrCreateBlogTag` are **still never called directly**.
>
> **The re-verification obligation above hardens rather than relaxes.** This block was already a set
> of claims about *task files*; it is now a set of claims about task files that four further Phase 1
> stories have since amended. Phase 3 re-verifies every line against `HEAD` and records each
> disposition, including "already closed".

## Files to create/modify

| Path | Change | Why |
| --- | --- | --- |
| `app/Livewire/BlogPosts/Index.php` | **New.** | The list. Class-based per [base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file). Namespace in **D-2**. |
| `resources/views/livewire/blog-posts.blade.php` | **New — the *flat* path.** | The [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name): `.index` is dropped and the folder kebab-cases. **Do not create `livewire/blog-posts/index.blade.php`, and check afterwards that an `artisan make:` scaffold did not deposit one** — task 0017's did, and it broke nothing and simply sat there. |
| `app/Livewire/BlogPosts/Editor.php` | **New.** | The routed create/edit page (**D-1**). |
| `resources/views/livewire/blog-posts/editor.blade.php` | **New — the ordinary mirror.** | `Editor` is not named `Index`, so the exception does not apply. It sits one level *deeper* than the list's view; [naming.md](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name) already records that asymmetry as expected. |
| `routes/blog-posts.php` | **New.** | Three routes, one `auth`+`verified` group — the one-file-per-area convention. Snippet in **D-3**. |
| `routes/web.php` | **Modify — one `require` line.** | `require __DIR__.'/blog-posts.php';` |
| `app/Enums/BlogPostStatus.php` | **Modify — add `label()`.** | 0061 explicitly defers it to "the first consumer", and this story has three (**D-18**). **This is the only file outside `app/Livewire/**`, `routes/`, `config/` and `lang/` that this story writes.** |
| `config/modules.php` | **Modify — one `items.blog_posts` entry, inserted *before* `blog_tags`.** | **D-16**. Position is load-bearing (**V-2**), not an append. |
| `lang/en/navigation.php`, `lang/es/navigation.php` | **Modify — one `items.blog_posts` leaf each.** | The registry-mirroring rule. Key-for-key identical. |
| `lang/en/blog-posts.php`, `lang/es/blog-posts.php` | **New.** | This screen's own copy (**D-17**). Key-for-key identical. |
| `tests/Feature/Blog/BlogPostsIndexTest.php` | **New.** | List component + the four-case route gate. |
| `tests/Feature/Blog/BlogPostsIndexQueryTest.php` | **New.** | The explicit-column `select()` and the N+1 guard. |
| `tests/Feature/Blog/BlogPostsIndexRenderingTest.php` | **New.** | Markup-level assertions, including the negative ones. |
| `tests/Feature/Blog/BlogPostsEditorTest.php` | **New.** | The largest file: save orchestration, the conditional date, the tag field. |
| `tests/Feature/Blog/BlogPostsEditorRenderingTest.php` | **New.** | Option sets and embedded-component markup guards. |
| `tests/Feature/Navigation/SidebarModuleGatingTest.php` | **Modify.** | Three entry-specific assertions (**D-16**). The two *generic* drift guards cover the new entry for free — do not hand-write a redundant copy, which is the mistake 0018's own plan made. |
| `tests/Browser/BlogPosts/IndexTest.php` | **New.** | The list's real-DOM cases. Path per **D-21**. |
| `tests/Browser/BlogPosts/EditorJourneyTest.php` | **New.** | The one comprehensive happy-path journey (**D-21**). |
| `tests/Unit/ArchitectureTest.php` | **Modify (optional — OQ-7).** | One single-namespace fence, never `expect([...])`. |

### Explicitly NOT touched

| File / concern | Owner |
| --- | --- |
| `database/migrations/**`, `database/seeders/**` | Nobody — `blog` is already in `RolePermissionSeeder::MODULES` (**V-3**), so all four `blog.*` permissions exist with **zero** seeder change |
| `app/Models/BlogPost.php`, `BlogCategory.php`, `BlogTag.php` | 0061 / 0058 / 0059 |
| `app/Actions/Blog/{Create,Update,Delete,Restore}BlogPost.php`, `SyncBlogPostTags.php` | 0061 — consumed unmodified. **`RestoreBlogPost` included**: this story method-injects and calls it, and writes nothing under `app/Actions/` (**D-13**) |
| `tests/Feature/Blog/RestoreBlogPostTest.php` | 0061 (**D-20**) — it owns the action's own tests; this story tests only the **rendered** half, in its own Index files |
| `app/Actions/Blog/FindOrCreateBlogTag.php` | 0059 — **never called directly** (0061's own hand-off forbids it) |
| `app/Actions/Blog/{Create,Rename,Delete}BlogTag.php`, `DeleteBlogCategory.php` | 0059 / 0058+0061 |
| `app/Policies/BlogPostPolicy.php` | 0061 — **five** abilities since its D-20 revision; this story consumes `restore` and adds none |
| `app/Concerns/BlogPostValidationRules.php` | 0061 — consumed through the actions |
| `app/Livewire/Components/WysiwygEditor.php`, `app/Livewire/Media/Gallery.php`, `SearchableMultiSelect.php` | 0021 / 0020 / 0022 — embedded or *not used*, never edited |
| `resources/views/components/sidebar-nav.blade.php`, `layouts/app/sidebar.blade.php` | 0013 — **append data to the registry, never edit the reader** |
| `lang/{en,es}/blog.php` | 0061 — **not extended by this story** (**D-17**) |
| `lang/{en,es}/blog-tags.php`, the tag management screen | 0060 |
| The blog categories screen | **0062** (being written in parallel — see **R-9**) |
| `app/Actions/NormalizeForSearch.php` | 0022 — reached only transitively |

> ⚠️ **Correction, 2026-08-30 — nine of the files above are also opened by
> [0079](0079-blog-post-editor-language-tabs-ui.md), and one entry in the *not touched* table needs
> narrowing.** Neither table changes: every file this story creates it still creates, and every file
> it declines to touch it still declines to touch. What is added is the **sequencing constraint**,
> which under this repo's
> [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule) is a
> real scheduling fact rather than a footnote — this story's **R-9** already names 0062 as a
> parallel-write hazard, and 0079 is a second, larger one.
>
> **0079 modifies, in this story's own output:** `app/Livewire/BlogPosts/Editor.php`,
> `resources/views/livewire/blog-posts/editor.blade.php`, `app/Livewire/BlogPosts/Index.php`,
> `resources/views/livewire/blog-posts.blade.php`, `lang/{en,es}/blog-posts.php`,
> `tests/Feature/Blog/BlogPostsEditorTest.php`, `BlogPostsEditorRenderingTest.php`,
> `BlogPostsIndexQueryTest.php` and `BlogPostsIndexRenderingTest.php`. **0079 must never be batched
> with this story**, and it lands strictly after it.
>
> **0079 also creates, beside them:** `app/Actions/Blog/SetBlogPostTranslation.php`,
> `tests/Feature/Blog/SetBlogPostTranslationTest.php`, `BlogPostEditorLanguageTabsTest.php`,
> `BlogPostEditorTranslationValidationTest.php` and `tests/Browser/BlogPosts/EditorLanguageTabsTest.php`
> — a **third** browser file in the mirrored folder **D-21** establishes, so that decision holds and
> is not re-litigated.
>
> **The one narrowing:** `resources/views/components/language-tab-strip.blade.php` is
> [**0071's**](0071-product-categories-language-tabs-ui.md) and is **consumed, never edited, forked or
> copied** — by 0073, 0075, 0077 and 0079 alike. It does not appear in either table above because it
> did not exist when this file was written; add it to the *not touched* list mentally, owned by 0071.
>
> **`config/modules.php` and `lang/{en,es}/navigation.php` are untouched by 0079** — tabs change no
> route and no registry entry, so **D-16**'s insertion-position decision and its coordination with
> 0062 stand exactly as written.

## Tests to perform

> **Read before writing any of these.** 0061's actions **authorize before they validate**, so a
> direct-call test with no authenticated actor throws `AuthorizationException`, not
> `ValidationException`. Every test below runs `actingAs()` an actor holding the relevant `blog.*`
> permission — or it passes for entirely the wrong reason.

> ⚠️ **Correction, 2026-08-30 — six cases below are invalidated by the three retrofits, one of them
> ⛔ *fatally* (it asserts against a column that will not exist). The dispositions are
> [0079's own](0079-blog-post-editor-language-tabs-ui.md), adopted verbatim rather than re-derived.**
> Every other case in every file below is **unaffected** — the route gate, the ordering, the
> soft-delete, the refusal logging, the filters, the `\ValueError` guard, the date boundary, the
> restore block and the whole trashed section survive unchanged, because none of them touches a
> translated column.
>
> | Case, as written | Disposition |
> | --- | --- |
> | ⛔ *"The list query selects **explicit columns and never `body`**"* (`BlogPostsIndexQueryTest`) | **Replaced, not retargeted.** `body` is not a `blog_posts` column at all after 0078, so the assertion cannot be re-pointed. Replace with **two** assertions: the list's **translation eager load is column-scoped to exclude `body`**, and the **editor's is not** (0078 **D-8**, 0079 **D-7**). Keep the `DB::listen()` mechanism — reading the component still proves nothing. |
> | *"A blank title is refused with the message keyed to that field"* | **Rekey.** `title` → `titles.{languageId}`, plus 0079 **D-9**'s adapter for the default-language write, whose action still throws on the bare `title` key. |
> | *"`Draft` + empty body accepted; `Published`/`Scheduled` + empty body refused"* (three cases) | **Rescope** to the **default language's** body, **and add** the new case 0078's Q-1(a) makes load-bearing: a `Published` post with a written default body and a **blank non-default** body is **accepted**. |
> | *"Promoting a bodiless draft to published is refused"* | **Rescope** to default-language bodilessness. A bodiless French tab never blocks promotion. |
> | *"The WYSIWYG is embedded once with a stable `wire:key`"* | **Invalidated — becomes N embeds**, one per active store language, each with its own `wire:key`. The single-instance framing is dropped entirely. |
> | *"Retitling a `Scheduled` post whose date has passed succeeds"* (0061 **R-9**) | **Largely unaffected, but "retitling" must now name a language** — the default-language and a non-default retitle are two distinct valid scenarios and both should exist. This case remains the most important in its file. |
>
> **Two cases are unaffected in a way worth stating**, because both look like they should have moved:
> the **forged-`status` / `\ValueError` guard** (**D-6**) is untouched — `status` stays on the parent —
> and the **tag reuse-by-case / reuse-by-accent** cases still hold, with their fold now scoped to one
> store language's partition (0074 **D-8**).
>
> **One case is worth *adding* to `BlogPostsIndexRenderingTest.php`**, with no 0063 precedent: a post
> that resolves to **no** title, and a category that resolves to **no** name, each render a
> placeholder rather than raising — a state reachable in normal operation right after a store-default
> change (0070 **R-2**).
>
> **Not added here:** the per-language tab tests, the two-layer authorization tests and the
> `SetBlogPostTranslation` direct-call file. Those are 0079's, in its own four new files, and
> duplicating them here would test one rule at two layers of the same story.

**Feature — `tests/Feature/Blog/BlogPostsIndexTest.php`**
- [ ] The four-case route gate on `blog-posts.index`: guest → login redirect; an actor without
      `blog.view` → 403; an actor holding exactly `blog.view` → 200; a **Super Admin holding zero
      permission rows** → 200. *Risk if missing:* a `Livewire::test()` call never goes through route
      middleware at all, so the component tests below prove nothing about the gate.
- [ ] The same four cases on `blog-posts.create` and `blog-posts.edit` — all three gate on
      `can:blog.view` (**D-3**), so a reviewer who "tightens" one route silently changes the contract.
- [ ] A **misspelled ability denies silently**, so each 200 case is asserted positively beside its 403
      — the module-gate pattern's own rule.
- [ ] `$posts` carries the documented row shape, and each row's `canEdit`/`canDelete` agrees with
      `BlogPostPolicy`. *Risk if missing:* a regression in the hint's derivation passes every other
      test in the file.
- [ ] Ordering is `created_at DESC, id ASC`, asserted with a **decoy** row created in between.
- [ ] Deleting a post through the row action soft-deletes it (`assertSoftDeleted`, never
      `assertDatabaseMissing`) and it leaves the list.
- [ ] `deleteBlogPost()` re-reads its target with `findOrFail()` and re-authorizes — a forged
      `deletingBlogPostId` for a post the actor may not delete is refused.
- [ ] Every refusal on this screen is **logged** with `target_type: 'blog_post'`, asserted against the
      context array rather than a rendered string, and a **permitted** action writes no warning.

**Feature — `tests/Feature/Blog/BlogPostsIndexQueryTest.php`**
- [ ] The list query selects **explicit columns and never `body`** (0061 **R-7**). Assert against the
      real executed SQL via `DB::listen()`, not by reading the component. *Risk if missing:* this is
      the one performance constraint 0061 hands over by name, and a `SELECT *` looks identical in
      every rendering test.
- [ ] No N+1: rendering N posts each with a category and tags issues a bounded number of queries.
      Assert the **count**, with a dataset of N=1 and N=5 so a per-row query cannot pass.
- [ ] `forCategory()` / `forTag()` are the filters' implementation — with a **decoy post** in another
      category and carrying another tag in every fixture. *Risk if missing:* a filter that returns
      everything passes a presence-only assertion trivially.
- [ ] Both filters compose (category **and** tag together narrow further, not replace).
- [ ] Changing a filter **resets pagination to page 1** (**D-5**). *Risk if missing:* an editor
      filtering from page 3 lands on an empty page and reads it as "no results", which is
      indistinguishable from a broken filter.
- [ ] Neither scope returns trashed posts, and the trashed section's own query returns **only** them.

**Feature — `tests/Feature/Blog/BlogPostsIndexRenderingTest.php`**
- [ ] Each status renders its own badge — three cases, asserted through
      `data-test="status-badge-blog-post-{id}"`, **never** a page-global `assertSee('Borrador')`.
      *Risk if missing:* see **R-4**; a page-global status assertion passes the moment any row has
      that status, which on a blog list is almost always.
- [ ] The date cell is asserted through `data-test="date-blog-post-{id}"` for the same reason.
- [ ] Row actions carry their `data-test` hook on **both** the enabled and the disabled branch.
- [ ] A disabled row action is matched on `disabled="disabled"`, **never** a bare `disabled`
      substring — Flux's own `disabled:opacity-75` class carries that word on the *enabled* branch.
- [ ] The empty state renders when no post exists, and does **not** render when one does.
- [ ] The trashed section renders **closed** on first paint, and its count matches the trashed rows.
- [ ] **Negative:** with no trashed posts, the trashed section is absent entirely rather than rendering
      an empty shell.

**Feature — `tests/Feature/Blog/BlogPostsEditorTest.php`** — the largest file
- [ ] Create persists title, category, status, body and tags, and redirects to the list.
- [ ] Edit loads an existing post into every field, including its tag chips.
- [ ] `mount()` on the edit route authorizes `update`; on the create route, `create`.
- [ ] A blank title, a missing category and an unknown category id are each refused with the message
      keyed to that field.
- [ ] **A forged `status` string is refused by validation, never as an uncaught `\ValueError`**
      (**D-6**). *Risk if missing:* task 0015's finding F8, recurring — and this story is where the
      constraint 0061 handed over is actually exercised.
- [ ] `Draft` + empty body → **accepted**; `Published` + empty body → **refused**; `Scheduled` + empty
      body → **refused**. Three cases, not one. *Risk if missing:* a `required_if`-shaped rule passes
      the first and silently allows a bodiless scheduled post that goes live empty when 0064 flips it.
- [ ] **Promoting a bodiless draft to published is refused, and the post is still a draft afterwards**
      — two assertions, since a rule that throws *after* writing passes a throw-only test.
- [ ] The same promotion **succeeds** once a body is supplied in the same save — the control.
- [ ] `Scheduled` + past date → refused; + a date **exactly `now()`** → refused; + `now()->addSecond()`
      → accepted. **Freeze the clock** and assert the boundary **from both sides**, so `>` is
      distinguishable from `>=`.
- [ ] **Retitling a `Scheduled` post whose date has already passed succeeds** — the single most
      important case in this file (0061 **R-9**). *Risk if missing:* it ships green and only fails once
      wall-clock time passes a stored date, at which point every edit to an overdue scheduled post is
      impossible.
- [ ] `Published` + no date → `published_at` stamped now; `Draft` + a submitted date → stored `null`.
- [ ] Tag reuse by exact name, by **case-differing** name and by **accent-differing** name each attach
      the existing row and create no duplicate. *Risk if missing:* the case test is what proves the
      save path reaches `FindOrCreateBlogTag` rather than `CreateBlogTag`, and it is invisible to every
      exact-match test.
- [ ] An unknown name creates the tag and attaches it; three names attach three pivot rows in one save.
- [ ] **A name removed from the chip set is detached, and the tag row survives in the catalog** — seed
      a second post sharing that tag as the control (0061 **D-17**).
- [ ] **An actor holding `blog.edit` but not `blog.create` attaches an existing tag successfully and is
      refused when one name is new**, and **that refusal rolls the whole save back** — no pivot row
      from the valid names survives, and the post's own columns are unchanged. *Risk if missing:* this
      role shape is not `Administrator`, so it needs a **custom role fixture**; every test using the
      seeded Administrator passes while it is broken (**R-3**).
- [ ] `$tagNames` is never `null` and never partial — it always carries the post's complete set.

**Feature — `tests/Feature/Blog/BlogPostsEditorRenderingTest.php`**
- [ ] The category `<select>` renders every category plus a **disabled** placeholder, and the status
      `<select>` renders exactly `BlogPostStatus::cases()`.
- [ ] The publication-date field's **presence** is the assertion: absent for `Draft` and `Published`,
      present for `Scheduled`.
- [ ] The WYSIWYG is embedded once with a stable `wire:key`, and **no `<livewire:media.gallery>` tag
      appears in this view at all** (**D-14**). *Risk if missing:* a second gallery embed would collide
      with the one 0021 mounts internally, and nothing else would catch it.
- [ ] The "add new tag" control renders `disabled` inside an explicit `<flux:tooltip>` for an actor
      without `blog.create`, and enabled with it.
- [ ] Every chip carries `data-test="tag-chip-{name}"`, so removing one specific tag is unambiguous.

**The restore's *rendered* half — in `BlogPostsIndexTest.php` / `BlogPostsIndexRenderingTest.php`,
not a file of its own.** 0061's **D-20** owns `tests/Feature/Blog/RestoreBlogPostTest.php` and every
assertion about the action itself (the round-trip's data, the slug reclaim, the meanwhile-deleted tag,
the direct-call refusal, the refusal log). This story tests only what a *screen* can get wrong, and
deliberately does not re-derive 0061's rules:

- [ ] `restoreBlogPost()` resolves its target **`withTrashed()`** and restores it: the post leaves the
      trashed section and reappears in the main table in the same request. *Risk if missing:* a plain
      `findOrFail()` 404s on **every** trashed post — loud rather than silent, but it is the one
      mechanical detail 0061's hand-off calls out, and nothing else on this screen exercises it.
- [ ] The restored row carries its category and its tags in the rendered list — the **rendered** half
      of 0061's *"A deleted post is recoverable rather than destroyed"*, binding to that scenario
      rather than restating its data assertions.
- [ ] **The restore control is gated on `blog.edit`, via `Gate::allows('restore', $post)`** — an actor
      holding `blog.edit` sees it enabled; an actor holding **`blog.delete` but not `blog.edit`** sees
      it **disabled**, with the `data-test` hook present on both branches. *Risk if missing:* this is
      the rendered half of 0061's *"An administrator without the blog editing permission cannot restore
      a post"*, and the partial grant is a **real reachable shape** — `delete` and `restore` gate on
      **different** permissions (**D-13**), so an actor can legitimately hold one and not the other.
      Neither the seeded `Administrator` nor a full-`blog.*` role exercises it, so it needs its own
      custom role fixture (**R-3**).
- [ ] A forged `restoringBlogPostId` naming a post the actor may not restore is refused by the action,
      and the component writes nothing — the hint is a layer, never the control.
- [ ] **No force-delete control exists anywhere in the rendered markup** (**D-13b**) — a negative
      assertion, because 0061 makes its absence a decision rather than an omission.

**Feature — `tests/Feature/Navigation/SidebarModuleGatingTest.php`** (extend)
- [ ] A role holding exactly `blog.view` sees `sidebar-group-blog` and `sidebar-link-blog_posts`.
- [ ] A role holding the related-but-different `blog.edit` sees **neither** — the narrowness test.
- [ ] The Blog group vanishes entirely, heading included, for a role holding no `blog.*` ability.
- [ ] **Do not re-implement the registry↔route cross-check** — the two generic drift guards already
      pick the new entry up for free, which 0018 verified against its own diff.

**Browser — `tests/Browser/BlogPosts/IndexTest.php`** (path per **D-21**)
- [ ] The list renders with `assertNoJavaScriptErrors()`.
- [ ] Both filters, driven by **real interaction**, narrow the visible rows. *Risk if missing:* see
      **R-1** — a `<flux:select>` + `wire:model` binding has a **recorded, unresolved** race under
      Playwright in this repo, and this screen carries more selects than any shipped one.
- [ ] The trashed section expands on click and its restore action returns the post to the main table.
- [ ] Delete → confirm → the row leaves the table; delete → **cancel** → the row remains.

**Browser — `tests/Browser/BlogPosts/EditorJourneyTest.php`** — one comprehensive journey
- [ ] **The status → publication-date reveal, driven by a real `<select>` interaction.** *Only* a
      browser test reaches this: a component test can assert the rendered HTML contains the field but
      cannot prove the client-side reveal fires.
- [ ] **A `<select>` pick of the *first* option**, for both status and category. *Risk if missing:*
      the [null-`<select>` desync](../../docs/errors-log.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16),
      which neither `Livewire::test()->set()` nor a scripted `->select()` can reproduce. The two fail
      **differently** here and both are worth driving: `status` has a real fallback (`Draft`), so it
      fails *quietly correct-looking*; `blog_category_id` has **none** (NOT NULL, no "none" option), so
      it fails as a validation refusal that reads like a UI bug.
- [ ] Typing into the WYSIWYG, saving, reopening, and finding the body intact — the only place a
      `wire:ignore` sync regression is observable at all.
- [ ] Inserting an image from the gallery into the body at the caret — two hand-rolled JS surfaces
      interacting, the case 0027's own journey test exists for.
- [ ] Typing a tag name and confirming it with the keyboard, then removing a chip — the chip field has
      no `wire:model` equivalent a component test can drive.

### Deliberately not tested here

| Not tested here | Owner |
| --- | --- |
| `slug` derivation, `SoftDeletes` mechanics, the `published_at` rule set, the tag pivot's sync/detach semantics, `BlogPostPolicy`'s four abilities | 0061 |
| `FindOrCreateBlogTag`'s own reuse/create/race semantics and its folding | 0059 |
| The WYSIWYG's tag emission, caret restore, toolbar `aria-pressed` | 0021 |
| The media gallery's search, upload, tile cap, detail editing | 0019 / 0020 |
| `SearchableMultiSelect`'s debounce and truncation | 0022 — **not used by this story at all** (**D-10**) |
| The HTML sanitizer's allow-list | 0024, consumed unchanged through 0061 |
| The blog-category delete block's count, race and logging | 0058 + 0061; this story consumes only the fact that an exit must exist |
| The scheduled auto-publish transition | 0064 |
| The published-post notification | 0065 |

## Expected outcome

A blog editor holding `blog.view` reaches a **Blog → Posts** screen from the sidebar and sees every
post with its title, category, status badge (Borrador / Publicado / Programado) and date, newest
first, paginated, filterable by category and by tag. Beneath the table a collapsed **deleted posts**
section lists soft-deleted posts and offers a restore action, so 0061's category-delete block has an
exit. A primary action opens a routed editor at its own URL, where the post's title, category,
status, publication date (revealed only when Scheduled is chosen), WYSIWYG body and tag chips are
edited and saved through 0061's actions in one transaction. Typing a tag name reuses an existing tag
regardless of case or accents, or creates a new one on save; removing a chip detaches that tag from
this post alone. A draft may be saved before its body is written; a published or scheduled post may
not, and the refusal renders beside the body. An administrator without `blog.view` gets a 403 and is
offered no link to the screen at all.

Nothing about the data model changes: this story adds no table, column, migration or index, and
**writes no domain action at all** — the restore calls 0061's `RestoreBlogPost` (**D-13**).

## Acceptance criteria
- [ ] `GET /blog/posts` (`blog-posts.index`), `/blog/posts/create` and `/blog/posts/{blogPost}/edit`
      exist in `routes/blog-posts.php`, each gated `can:blog.view`, and `web.php`'s whole diff is one
      `require` line.
- [ ] `config/modules.php` gains an `items.blog_posts` entry whose `permissions` is **exactly**
      `['blog.view']`, in the **`blog` group story 0060 created** — not a second group — positioned
      **before** `blog_tags`, with matching leaves in `lang/{en,es}/navigation.php`.
      `sidebar-nav.blade.php` and `sidebar.blade.php` are **not** edited.
- [ ] The list renders title, category, status badge and date per row, ordered newest-first, paginated,
      with per-row edit/delete actions rendered enabled or disabled from `canEdit`/`canDelete` and a
      `data-test` hook on **both** branches.
- [ ] The list query **selects explicit columns and never `body`**, and issues no per-row query.
- [ ] Filtering by category and by tag each narrow the list, compose with one another, are reflected
      in the URL, and **reset pagination to page 1**.
- [ ] A collapsed deleted-posts section lists soft-deleted posts and restores them **through 0061's
      `RestoreBlogPost`**, resolving the target `withTrashed()`, and the restored post returns to the
      list with its category and tags intact.
- [ ] The restore control is gated on **`blog.edit`** via `Gate::allows('restore', $post)` — so an
      actor holding `blog.delete` but not `blog.edit` sees it disabled — and **no force-delete control
      exists anywhere on the screen**.
- [ ] **No file is created under `app/Actions/`**, and `app/Policies/BlogPostPolicy.php` is unchanged.
- [ ] The editor is a **routed page**, not a modal, and create and edit resolve the same component.
- [ ] Every `wire:model`-bound property is non-`null` with a real empty value in the type the DOM
      expects, and **`status` is a plain `string`, never a typed enum**.
- [ ] The publication-date field is present **only** when Scheduled is selected, and its refusals
      render beside it.
- [ ] A draft saves with an empty body; a published or scheduled post does not, and a bodiless
      draft→published promotion is refused with the post left a draft.
- [ ] The tag field shows **every** tag currently on the post as a removable chip, submits the complete
      set on every save, and never calls `SyncBlogPostTags` or `FindOrCreateBlogTag` directly.
- [ ] An actor without `blog.create` sees the "add a new tag" control disabled with a reason, and the
      server-side refusal remains the real control.
- [ ] The WYSIWYG is embedded once, and **no `<livewire:media.gallery>` appears in this story's views**.
- [ ] Every refusal is logged with `target_type: 'blog_post'`; a permitted action logs no warning.
- [ ] `lang/{en,es}/blog-posts.php` are created key-for-key identical and no user-facing string is
      hardcoded. `lang/{en,es}/blog.php` is **not** touched.
- [ ] No migration, no column, no seeder change, no policy change, and no edit to any 0058/0059/0061
      model, action or trait.

> ⚠️ **Correction, 2026-08-30 — three criteria above are falsified, one holds for a reason worth
> naming, and one is worth adding.** Every other criterion — the three routes and their gate, the
> registry entry and its position, the row actions' `data-test` hooks on both branches, the filters'
> composition and page reset, the trashed section and its `withTrashed()` resolution, the restore
> gate, the no-force-delete rule, the routed-editor shape, the conditional date field, the tag
> field's complete set, the `blog.create` hint, the refusal logging and the lang files — is
> **unaffected**.
>
> | Criterion, as written | After Epic 5 |
> | --- | --- |
> | *"The list query **selects explicit columns and never `body`**, and issues no per-row query."* | **Replaced.** `body` is not a `blog_posts` column, so the `select()` cannot exclude it. The criterion becomes: **the list's translation eager load is column-scoped to exclude `body`, the editor's includes it, and the two do not share a helper** (0078 **D-8**, 0079 **D-7**). The no-per-row-query half is unchanged and now also covers the two taxonomy loads. |
> | *"The list renders title, category, status badge and date per row…"* | **Still true, with the title and the category **resolved** rather than selected** — store default for the title (0079), [OQ-10](#open-questions) for the category — and a `null` resolution rendering an **em dash**, never an error or a blank. |
> | *"The WYSIWYG is embedded once, and no `<livewire:media.gallery>` appears in this story's views."* | **First half invalidated** — after 0079 it is **N** embeds, one per active store language, each with its own `wire:key`. **Second half kept verbatim**: still true, still worth asserting, and no longer implying one gallery on the page (**D-14** correction). |
> | *"Every `wire:model`-bound property is non-`null` … and **`status` is a plain `string`, never a typed enum**"* | ✅ **Holds, and the first half *widens*** — after 0079 the rule binds **2 × N** array leaves rather than two properties. The `status` half is untouched: `status` stays on the parent and stays a plain string (0061 **D-12**). |
> | *"**No file is created under `app/Actions/`**, and `BlogPostPolicy` is unchanged."* | ✅ **Both halves still true of this story.** 0079 adds one action; the policy's five abilities and the **42**-permission catalog are untouched by every Epic 5 blog story (0078 **D-14**, 0079 **D-18**). |
> | *(worth adding)* | **A post that resolves to no title, and a category that resolves to no name, each render a placeholder rather than raising** — a state reachable in normal operation right after a store-default change (0070 **R-2**), and one no criterion above covers. |

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] All **three** quality gates run **unscoped** and each result recorded explicitly, including any
      not run: `php artisan test` (not `--filter`), `vendor/bin/pint --format agent` (not `--dirty`),
      and **Larastan level 7**. A record naming two of three is a record of two gates — see
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26).
- [ ] **Every citation in [Interface contract consumed](#interface-contract-consumed) re-verified
      against `HEAD` before Phase 3, with each disposition recorded** — including "already closed".
      **V-1**: none of the six dependency stories exists in code today.
- [ ] The flat view path confirmed **by running the component**, and the tree checked for a stray
      `resources/views/livewire/blog-posts/index.blade.php` scaffold.
- [ ] Code reviewed (code-reviewer). **Point Phase 2 at OQ-4 first** — the filters' liveness against
      **R-1**'s recorded `<flux:select>` race is now the open decision with the widest blast radius,
      since this screen ships four such controls.
- [ ] No security findings (appsec-auditor). **Point the audit at D-11**: that the disabled "add tag"
      control is a *hint* and the server-side `blog.create` refusal is intact and un-bypassable.
- [ ] Documentation updated (docs-keeper): `docs/api/routes.md` gains a `blog-posts.index` subsection
      and its registry-entry note; `docs/architecture/authorization.md`'s sidebar-registry section
      records the **insertion-position** property (**V-2**) that the first four entries could not show;
      `docs/conventions/base-standards.md`'s directory listing gains `app/Livewire/BlogPosts/` and
      `routes/blog-posts.php`.
- [ ] **`docs/testing/frontend/gherkin-guidelines.md`'s glossary `TODO (product owner)` closed for the
      blog half** — the canonical term is **post** (**D-22**) — and that section's own justification
      corrected: it still reads *"`app/Models/` contains only `User`"*, false since task 0016, which is
      this project's recurring
      [bare-negative-claim](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)
      failure mode.
- [ ] **`docs/testing/frontend/playwright-setup.md`'s file count corrected** — it says the browser
      suite holds three files; `ls tests/Browser/` returns **four** (**V-4**). 0060's Phase 1 already
      caught this and it is still open; whichever story closes first should fix it once.
- [ ] **Hand-off recorded for story 0062** (blog categories UI), which is being written in parallel and
      cannot know these: it appends `items.blog_categories` to the **same** `groups.blog` group, and
      **position within `items` decides render order** (**V-2**) — so 0062 and 0063 must agree on the
      order rather than both appending. It also inherits the `lang/` resolution in **D-17**. And per
      0061's **D-7d**, the count in its delete-block message includes **trashed** posts, whose exit is
      this story's trashed section.
- [ ] **Hand-off recorded for story 0064** (scheduled auto-publish): this screen renders the
      `Scheduled` badge and the `published_at` date it will flip. When it does, a post moves between
      badges with **no UI change required here** — but if 0064 ever adds a "last swept at" or failure
      state, this list is where it would surface.
- [ ] Acceptance criteria met.

> ⚠️ **Correction, 2026-08-30 — two items to add, both cheap and both easy to lose.** Everything above
> stands unchanged, including the three-gates rule and the hand-offs to 0062 and 0064.
>
> - [ ] **[OQ-10](#open-questions) ratified before Phase 3 starts** — which store language this
>       screen's **taxonomy labels** resolve in. Adopted here as the store default by analogy with
>       [0027's own resolved OQ-10](0027-products-list-and-editor-ui.md#open-questions) and with
>       0079's list decision, and recorded as an adoption rather than an independent ruling. It gates
>       [D-4](#d-4--the-list-query-explicit-columns-two-eager-loads-real-pagination)'s corrected
>       query, both filter dropdowns, the editor's category select, the tag chips **and**
>       `$deletingBlogPostTitle` — five sites that must all get the **same** answer.
> - [ ] **The re-verification item above now spans four more stories.** It already required every
>       citation in [Interface contract consumed](#interface-contract-consumed) to be re-checked
>       against `HEAD`; 0072, 0074, 0078 and 0079 have since amended what those citations describe, so
>       the check is against the **post-retrofit** shape and each disposition — including "already
>       closed" — is recorded. This is the
>       [deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)
>       at this file's widest exposure: **ten** unshipped stories now stand between this debate and
>       Phase 3.
>
> **The `docs-keeper` line does not widen.** The screen-side facts it already names are unchanged, and
> the Epic 5 schema, authorization and naming facts belong to 0072/0074/0078's own docs passes — 0079's
> own Definition of Done carries the instruction to *verify whether those passes already made the
> claim* rather than restating it.

## Documented functional decisions

### D-1 — The editor is a routed page, not a modal

The Users (0006), Roles (0011), Sales Regions (0018), Product Categories (0025) and Blog Tags (0060)
screens all put create/edit in a `flux:modal`, so this is a deliberate divergence from the house
pattern and needs its reasons stated. Both amigos converged on it independently.

The decisive reason is a mechanism, not a component count. **[0021](0021-wysiwyg-rich-text-editor-component.md)'s
D9 states the `contenteditable` region is seeded from `$value` at *client initialisation only*, and
never re-written by a Livewire re-render.** A modal that closes and reopens for a different post
therefore either remounts the editor (needing a `wire:key` dance to force it) or serves the previous
post's body. On a routed page every "open a different post" is a fresh mount and the problem cannot
occur. 0021's D9 explicitly says the consuming story "should be told rather than discovering it" —
this is that.

Three supporting reasons: the form composes a WYSIWYG with its own toolbar and popover, a nested
gallery `<dialog>`, and a chip field, which is a stacking-context problem with no clean answer inside
a `flux:modal`'s own native `<dialog>`; a URL per post gives deep links, the back button and a safe
redirect-after-save; and 0027 made the identical call for the identical composition.

*Rejected:* a modal, for the reasons above. *Rejected:* a single-page list-plus-inline-editor — it
reproduces the remount problem while also giving up the URL.

### D-2 — The identifier family is `blog-posts` / `blog_posts` / `BlogPosts` *(resolved conflict — C-1)*

`frontend-expert` proposed `App\Livewire\Blog\Index` + `Blog\Editor`, route `blog.index`, view
`livewire/blog.blade.php`. `frontend-qa` proposed `App\Livewire\BlogPosts\Index`, route
`blog-posts.index`. **Resolved in favour of QA's, on 0060's own words rather than on preference.**

[0060](0060-blog-tags-ui.md)'s **D-3** is the file that owns this question, and it cuts both ways in
its two halves. Its body says `blog-tags.index` "leaves `blog-categories.index` and a bare
`blog.index` — the natural name for 0063's post list — both free and unambiguous", which is what
`frontend-expert` cited. But its *Rejected* clause, arguing against a different alternative, names the
consequence explicitly: it "would make 0063's post list either **`Blog\Index` (colliding conceptually
with the area)** or `Blog\Posts` (inconsistent with the other two)." The component-name objection is
0060's own, written before this debate.

Four reasons the entity name wins:

1. **`Blog` is the *area*, and the area name is already spoken for by the things all three screens
   share** — `app/Actions/Blog/`, `tests/Feature/Blog/`, `config/modules.php`'s `groups.blog`.
   Using it *also* as one screen's component namespace makes "Blog" mean both "the module" and "the
   posts screen" in the same tree. **The rule this establishes: an area name for shared folders, an
   entity name for per-screen identifiers.** 0060 already follows it (`App\Livewire\BlogTags\Index`,
   tests in `tests/Feature/Blog/`), so this is consistency, not novelty.
2. **Three sibling screens, three entity-named namespaces** — `BlogPosts`, `BlogCategories`,
   `BlogTags`. Under the alternative, one is the area and two are entities.
3. **The `data-test` hooks are already decided as full-domain** (0060's **V-2**:
   `edit-blog-tag-{id}`, because a hook "names the model, not an abbreviation"). `edit-blog-post-{id}`
   inside a component called `Blog\Index` is internally inconsistent; inside `BlogPosts\Index` it is
   the namespace read back.
4. **It keeps `current_when` unambiguous by construction.** `blog-posts.*` cannot ever collide with
   `blog-tags.*` or `blog-categories.*`. `blog.*` happens not to match `blog-tags.index` today (the
   hyphen is not a dot), which is a fact about `Str::is()` that a reader must *derive* rather than see.

The cost is the shorter `/blog` URI. **The URI is `/blog/posts`**, which is the `sales-regions.index`
shape exactly — a nested URI (`/taxes/sales-regions`) with a flat route name — and consistent with
`/blog/tags` and `/blog/categories`.

So: `App\Livewire\BlogPosts\{Index,Editor}` · `routes/blog-posts.php` · `blog-posts.index` /
`.create` / `.edit` · `resources/views/livewire/blog-posts.blade.php` (flat, the `Index` exception)
and `livewire/blog-posts/editor.blade.php` (the ordinary mirror) · registry key `blog_posts` ·
`data-test="sidebar-link-blog_posts"`.

> **`blog_posts` is the registry's second genuinely multi-word key**, after `sales_regions` (task
> 0018). Same rule, same three identifiers moving together — config key, translation leaf, `data-test`
> hook — and the *values* in the same entry stay kebab-case because none of them is a registry key.

### D-3 — Three routes, all gated `can:blog.view`

```php
// routes/blog-posts.php
use App\Livewire\BlogPosts\Editor as BlogPostsEditor;
use App\Livewire\BlogPosts\Index as BlogPostsIndex;

Route::middleware(['auth', 'verified'])->group(function () {
    // `can:blog.view`, not Spatie's `permission:` -- same reason as users.index /
    // roles.index / sales-regions.index / blog-tags.index: Livewire 4's
    // PersistentMiddleware allowlist carries Laravel's `Authorize` (`can:`) but not
    // Spatie's `PermissionMiddleware`, so a `permission:`-gated route would protect
    // the initial GET only, leaving every save()/deleteBlogPost() /livewire/update
    // round-trip unauthorized. See docs/architecture/authorization.md.
    Route::livewire('blog/posts', BlogPostsIndex::class)
        ->middleware(['can:blog.view'])->name('blog-posts.index');
    Route::livewire('blog/posts/create', BlogPostsEditor::class)
        ->middleware(['can:blog.view'])->name('blog-posts.create');
    Route::livewire('blog/posts/{blogPost}/edit', BlogPostsEditor::class)
        ->middleware(['can:blog.view'])->name('blog-posts.edit');
});
```

The verbatim duplication of that comment from the three existing area files is **the convention, not
an oversight** — a reader auditing one area file must not have to open another to learn why.

**`can:blog.view` on all three, not `can:blog.create` / `can:blog.edit` on the create and edit
routes.** The finer abilities are authorized *inside* `Editor` (`create` / `update` in `mount()` and
`save()`, `delete` in the list's `deleteBlogPost()`), which is what actually protects the mutations
over `/livewire/update`. Object-form authorization (`can:update,blogPost`) was considered and
**not adopted**: whether a bound route parameter re-resolves on a `/livewire/update` round trip is
**unverified in this codebase** — no shipped route uses that form — and 0027's D-2 recorded the same
reasoning and the same refusal to find out inside a feature story. Recorded as a Phase 3 verification
item, not adopted on faith.

`Editor::mount(?BlogPost $blogPost = null)` branches on the parameter. Two routes onto one component
because create and edit share every field, every rule and the entire save path; two classes would
duplicate the save path to vary one branch. `HasUuids` makes a malformed non-UUID `{blogPost}` a 404
before any query runs.

*Rejected:* one route with an optional parameter (`blog/posts/{blogPost?}/edit` → `blog/posts//edit`
for the create case, and one route name for two entry points).

### D-4 — The list query: explicit columns, two eager loads, real pagination

> ⛔ **Correction, 2026-08-30 — the query below no longer runs. It names *three* dropped columns, and
> this is the sharpest break the three Epic 5 retrofits make in this file.** It is
> [0078's **R-1(a)**](0078-translatable-content-retrofit-blog-posts-backend.md) — *"the worst-hit file
> in the whole Epic 5 plan"* — and 0079's scope fence puts it **outside** that story
> (*"this story is not the 0063 amendment"*), so **nobody else fixes it**. It is this file's, and the
> corrected shape is below.
>
> **What breaks, exactly three things:**
>
> 1. `->select([… 'title' …])` names a column **0078 drops**. A partial select is a sharper break than
>    an `orderBy` because the column is named explicitly — the query fails rather than mis-sorting.
> 2. `'category:id,name'` names a column **0072 drops**.
> 3. `'tags:id,name'` names a column **0074 drops**.
>
> **The replacement, and the four properties it must have:**
>
> ```php
> BlogPost::query()
>     ->select(['id', 'blog_category_id', 'status', 'published_at', 'created_at'])   // no `title` — it left the table
>     // The clustered-index obligation MOVED rather than disappearing (0078 D-8):
>     // blog_post_translations carries title, slug AND body together, so the list's
>     // translation load must exclude `body` explicitly. The EDITOR's must include it.
>     // These are two different queries and MUST NOT share a helper (0079 D-7).
>     ->with(['translations' => fn ($q) => $q->select('blog_post_id', 'store_language_id', 'title', 'slug')])
>     ->with(['category' => fn ($q) => $q->withTranslationsFor()])   // 0072 — never `category:id,name`
>     ->with(['tags' => fn ($q) => $q->withTranslationsFor()])       // 0074 — never `tags:id,name`
>     ->when($this->categoryFilter !== '', fn ($q) => $q->forCategory($this->categoryFilter))
>     ->when($this->tagFilter !== '', fn ($q) => $q->forTag($this->tagFilter))
>     ->orderByDesc('created_at')->orderBy('id')
>     ->paginate(self::PAGE_SIZE);
> ```
>
> - **The `body` exclusion is preserved, and it is the one thing easiest to lose.** 0061 **R-7**'s
>   inline-`mediumText` clustered-index cost does not go away when the column moves tables — it
>   returns through a different door, and **under this screen's pagination it returns per page**. A
>   bare `with('translations')` reinstates it silently, with no test failing.
> - **The two taxonomy loads become one eager load each over the translation relation**, following
>   [0073 **D-12**](0073-blog-categories-language-tabs-ui.md)'s shape: resolve and, where a sibling
>   screen sorts, sort **in PHP through `translated()`**, never through a SQL join filtered to one
>   language — a join **bypasses the fallback chain** and silently mis-orders or (with `INNER`) omits
>   any row lacking a default-language translation.
> - **`translated()` reads the already-loaded relation and issues no query**, so the N+1 guard below
>   still binds — but note the one-character trap 0070 **R-4** records: `$model->translations` (the
>   **property**, respects eager loading) versus `$model->translations()` (the **method**, always
>   re-queries). It survives a copy from a sibling undetected.
> - **Everything else in this decision is unchanged**: pagination, the page-size constant, both
>   `when()` filters, and the ordering.
>
> ✅ **The ordering needs no change at all, and this file earns that.** It orders by
> `created_at DESC, id ASC` and deliberately **not** `orderBy('title')` — see the paragraph below,
> written before Epic 5 existed and correct for a different reason (0061 **D-10**: posts carry no
> title uniqueness). So unlike [0027](0027-products-list-and-editor-ui.md), which needed a whole new
> `scopeOrderByTranslatedName()` and a resolved OQ-10 before its ordering test could be written, and
> unlike 0062/0025, whose `orderBy('name')` breaks outright — **this story's ordering survives the
> retrofit untouched**, and 0078 ships no ordering scope for posts because none is needed. Do not
> "improve" it into a translated sort.
>
> ⚠️ **The `tags:id,name` eager load's *justification* also needs re-reading.** The paragraph below
> keeps it *"even though the PRD's list columns do not include tags"*, so the tag filter's state is
> legible. That reasoning is unchanged — but the label it renders is now resolved per language, which
> is [OQ-10](#open-questions). If Phase 2 decides the list shows no tags at all, drop the eager load
> with it rather than leaving it loading translations nothing renders.

```php
BlogPost::query()
    ->select(['id', 'blog_category_id', 'title', 'status', 'published_at', 'created_at'])
    // NEVER body -- mediumText, 0061 D-4b/R-7. That obligation is handed to this story by name,
    // and is sharper than 0027's own R-9 because a post body dwarfs a product description.
    ->with(['category:id,name', 'tags:id,name'])
    ->when($this->categoryFilter !== '', fn ($q) => $q->forCategory($this->categoryFilter))
    ->when($this->tagFilter !== '', fn ($q) => $q->forTag($this->tagFilter))
    ->orderByDesc('created_at')->orderBy('id')
    ->paginate(self::PAGE_SIZE);
```

**Pagination, diverging from every shipped list screen, for 0061's own stated reason.** Users, Roles,
Sales Regions and Blog Tags are all unpaginated because each is a bounded lookup table. 0061's **D-9**
calls `blog_posts` *"the one table in this domain with an unbounded growth story"* — the same property
that made 0027 diverge. Adding `WithPagination` later changes the component's public surface
(`array` → `LengthAwarePaginator`) and every test written against it; shipping it now costs one trait.
Page size is a single named constant (**OQ-5**).

**`orderByDesc('created_at')->orderBy('id')`, not `orderBy('title')`.** Posts carry no uniqueness
pressure on their title (0061 **D-10**: two posts may legitimately share one), and recency is what an
editor scans a content list for. The `id` tiebreak is free and, with UUIDv7, is a meaningful
creation-order tiebreak — which matters more under pagination than without it, since two posts sharing
a timestamp would otherwise reshuffle between pages.

**`tags:id,name` is eager-loaded even though the PRD's list columns do not include tags**, because the
tag *filter* must render a chip or a name somewhere for the filtered state to be legible, and a
per-row lazy load is an N+1 by construction. If Phase 2 decides the list shows no tags at all, drop
the eager load with it — do not leave it loading data nothing renders.

### D-5 — Two taxonomy filters, `#[Url]`-bound — the first filters this repo has shipped

No shipped screen filters: Users, Roles, Sales Regions and Blog Tags all render their whole table, and
0027 explicitly defers filtering to its own OQ-4. **There is no precedent to copy**, so Phase 2 should
treat this as new territory rather than a settled convention.

```php
#[Url(as: 'category')] public string $categoryFilter = '';
#[Url(as: 'tag')]      public string $tagFilter = '';
```

- **`#[Url]`, so a filtered view is bookmarkable and shareable.** This is the repo's **first** use of
  `#[Url]` (**V-5** — `grep` returns none), so its interaction with `WithPagination`'s own `page`
  parameter is a Phase 3 verification item, not an assumption.
- **Both bind IDs, not names or slugs** — forced by 0061's **D-11**, whose scopes take
  `string $blogCategoryId` / `string $blogTagId`. Verified against the quoted signatures.
- **Both are plain `''`-defaulted strings**, never `null`, per **D-6**. `''` matches the "All
  categories" / "All tags" placeholder `<option value="">`, which here is a *legitimate selectable
  value* — unlike the editor's category placeholder, which must be `disabled` (**D-6**).
- **Changing either filter resets the page to 1.** Livewire's `WithPagination` does not do this for
  you on an arbitrary property change. Without it, an editor filtering from page 3 lands on an empty
  page and reads it as "no results" — indistinguishable from a broken filter. It has its own test.
- **A single-value `<select>` each, not `SearchableMultiSelect`.** A list filter selects one value and
  needs no chips, no autocomplete and no create path; reaching for 0022's component here would be
  using machinery built for a different job.

⚠️ **These selects inherit a recorded, unresolved flakiness — see R-1.** Whether they are bound
`wire:model.live` (instant) or `wire:model` plus an explicit apply is deliberately left to **OQ-4**,
because the answer interacts with that race.

> ⚠️ **Correction, 2026-08-30 — the filters' *bindings* survive the retrofits untouched; their
> *option labels* do not.** ✅ **Both bullets above stay true and are worth re-reading as
> confirmations rather than corrections:** the two properties still bind **ids** (0061 **D-11**'s
> scopes are unchanged by any Epic 5 story — `forCategory()` / `forTag()` still take
> `string $blogCategoryId` / `string $blogTagId`), and both are still `''`-defaulted plain strings
> matching a legitimately selectable placeholder. Nothing about `#[Url]`, the page reset, or the
> single-value shape moves.
>
> **What changes is one line of markup per filter.** The `<option>` labels are category and tag
> **names**, which 0072 and 0074 move to translation tables — so each label is
> `translated('name', $languageId)` rather than `$category->name`, and the option sets must be loaded
> with the same translation eager load as the list itself (**D-4**), never as a second unbounded
> query. Two consequences:
>
> - **A label can resolve to `null`.** An option rendering an empty string is worse than one rendering
>   an em dash, because it looks like a rendering bug rather than an untranslated row — and unlike a
>   table cell, the *value* still has to be the id. Render the placeholder-style em dash, keep the
>   `value` intact.
> - **Which language — [OQ-10](#open-questions).** Adopted as the store default, matching the list's
>   own row labels; a category named one way in a row and another in the dropdown above it is worse
>   than either choice alone. The same answer governs the editor's category select and the tag chips.
>
> ⚠️ **`R-1`'s `<flux:select>` Playwright race is *unchanged in kind and worse in count*.** This
> decision already ships four such controls; once [0079](0079-blog-post-editor-language-tabs-ui.md)
> lands the same page also carries a tab strip whose own dynamic attributes must use
> `{{ Js::from(...) }}` rather than `@js(...)`. Neither problem causes the other, and **OQ-4** is
> still the open decision with the widest blast radius on this screen.

### D-6 — Every `wire:model`-bound property's type and empty value

The [null-`<select>` desync](../../docs/errors-log.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)
is the single most relevant prior incident to this screen, and this screen carries **more bound
controls than any shipped one**. The rule — *a `wire:model`-bound property must never be `null`; give
it a real empty value in the type the DOM expects* — applies to all of them, with the right empty
value differing per field:

| Property | Declaration | Why this one |
| --- | --- | --- |
| `$title` | `public string $title = '';` | Ordinary text. |
| `$blogCategoryId` | `public string $blogCategoryId = '';` | `''` matches the placeholder `<option value="">`. Because `blog_category_id` is **NOT NULL** with no "none" option (0061 **D-2**), that placeholder must be genuinely `disabled` — "no category" is a transient pre-selection state, never a persistable one. |
| `$status` | `public string $status = BlogPostStatus::Draft->value;` — **plain string, never `BlogPostStatus`** | 0061 **D-12** names this a constraint 0063 inherits: Livewire's `EnumSynth` hydrates a forged backing value through `from()` **before** validation, so a typed enum property turns tampering into an uncaught `\ValueError` (task 0015's F8). Cast with `BlogPostStatus::from(...)` only **after** `validate()` passes. Defaulting to a **real backing value** rather than `''` matches `sales_regions`' own resolution of the same trap. |
| `$publishedAt` | `public string $publishedAt = '';` | `''` is `datetime-local`'s own native empty value. |
| `$body` | `public string $body = '';` | Bound through 0021's `#[Modelable] public string $value`, which has the same never-`null` rule. |
| `$tagNames` | `public array $tagNames = [];` | Always the post's **complete** set (**D-10**). |
| `$categoryFilter` / `$tagFilter` | `public string … = '';` | **D-5**. |

`$posts`, `$editingBlogPostId`, `$deletingBlogPostId` and `$deletingBlogPostTitle` are `#[Locked]`,
following the newer `SalesRegions\Index::$regions` precedent and 0060's **D-6**.

> ⚠️ **Correction, 2026-08-30 — two rows of the table above are superseded by
> [0079](0079-blog-post-editor-language-tabs-ui.md), five are untouched, and one `#[Locked]` property
> is fed from a column that no longer exists.**
>
> **The rule itself does not merely survive — it *widens*, and this is the single most important
> sentence in this correction.** *A `wire:model`-bound property must never be `null`; give it a real
> empty value in the type the DOM expects.* After 0079 the editor's translatable state is **two arrays
> keyed by store-language id**, so the rule binds **2 × N leaves** rather than two properties, and
> every one of them is a `wire:model` target. 0079 records this screen as landing in that blind spot
> harder than any sibling for exactly this reason.
>
> | Row | Disposition |
> | --- | --- |
> | `$title` — `public string $title = ''` | **Superseded by 0079**: `public array $titles = []`, keyed by store-language id, `''` meaning "not typed", **never `null`**. Not this story's to write. |
> | `$body` — `public string $body = ''` | **Superseded by 0079**: `public array $bodies = []`, one leaf per language, each bound to its **own** `WysiwygEditor` instance (**D-14** correction). 0021's `#[Modelable] public string $value` never-`null` rule binds every leaf. |
> | `$status` | ✅ **Unchanged, and deliberately so.** `status` stays on `blog_posts` (0078 **D-1**), so it remains a single plain `string` defaulting to a real backing value, and 0061 **D-12**'s `EnumSynth`/`\ValueError` constraint is untouched. **Do not let this become per-language.** |
> | `$publishedAt` | ✅ **Unchanged** — PRD Epic 5 puts *"status, dates"* explicitly outside the tabs. Its conditional reveal (**D-7**) and its timezone rule (**D-8**) are unaffected. |
> | `$blogCategoryId` | ✅ **Unchanged** — it binds an **id**, and 0072 drops only the name. The placeholder is still `disabled`, because `blog_category_id` is still `NOT NULL` with no "none" option. Only the option **labels** resolve differently ([D-5](#d-5--two-taxonomy-filters-url-bound--the-first-filters-this-repo-has-shipped) correction). |
> | `$tagNames` | ✅ **Shape unchanged** — still `array`, still the post's **complete** set. But it holds **names**, and after 0074 a name belongs to a language; see the [D-10 correction](#d-10--the-tag-field-is-bespoke-and-binds-names-searchablemultiselect-is-structurally-ruled-out). |
> | `$categoryFilter` / `$tagFilter` | ✅ **Unchanged** — both bind ids. |
>
> **Plus one property the table does not list, and no upstream story names either.**
> `#[Locked] public string $deletingBlogPostTitle` is populated by `confirmDelete()` from
> `$target->title` — **a column 0078 drops**. That read becomes
> `$target->translated('title', $languageId) ?? ''`, and three things follow: the property stays
> `#[Locked]` and stays server-assigned from a freshly-read row; the **coalesce is mandatory**,
> because `translated()` returns `null` for a post untranslated in both the requested and the default
> language and the never-`null` rule binds this property too; and **which language is
> [OQ-10](#open-questions)** — the same answer as the list, since a confirmation naming a post
> differently from the row the editor just clicked is worse than either choice alone.
>
> This is the exact shape [0027's `$deletingProductName`](0027-products-list-and-editor-ui.md) carries
> (0076's **R-1(b)**, named there as that story's hand-off). **Here it is named by nothing** — neither
> 0078's **R-1(a)**, which lists three break sites, nor 0079's **R-1**, which adds a fourth. It is
> found by reading this file rather than by following the upstream hand-offs, and it is recorded as
> this amendment's own finding.

### D-7 — The publication-date field is revealed client-side, on the Sales Regions precedent

Two precedents exist and they differ for a real reason. Users' Administrator-tier notice uses
`wire:model.live` plus a server `@if`, because the notice reflects **server** state (a
`#[Computed]` reading session freshness) that the client cannot know. The Sales Regions modal's
replacement select uses `x-show="! $wire.active"`, because the condition is a value the browser
already holds.

This is the second case: whether the status is `Scheduled` is known client-side the instant the
`<select>` changes. So the field's wrapper carries
`x-show="$wire.status === '{{ \App\Enums\BlogPostStatus::Scheduled->value }}'"` and needs no round
trip — snappier, and matching the more recent precedent. The **server** remains the authority:
`publishedAtRules($status)` (0061 **D-6**) is `prohibited` for Draft, `required|date|after:now` for
Scheduled, `nullable|date` for Published, whatever the client rendered.

⚠️ **The field's *presence* is the assertion, not its value** — a rendering test asserts it absent for
Draft and Published and present for Scheduled, and only a browser test proves the reveal actually
fires from a real interaction.

### D-8 — `datetime-local`, and the timezone rule that comes with it

`<flux:input type="datetime-local" wire:model="publishedAt" />`, following the shape Sales Regions set
for `rate` (`type="text" inputmode="decimal"`, never `type="number"`): pick the native input type that
matches the data rather than reaching for a widget. ⚠️ **Unverified — `vendor/` is absent (V-6)**:
that Flux Free forwards an arbitrary `type=` on `flux:input`, and whether Flux Free ships a date
picker at all, are both Phase 3 checks (**OQ-6**).

**The timezone is a real, silent risk and `frontend-expert`'s sharpest finding.** A `datetime-local`
value carries **no offset** — it is ambiguous browser-local wall-clock time. `after:now` compares
against `now()`, which Carbon resolves in `config('app.timezone')`. If the submitted string is parsed
as UTC while the app's timezone is not (or the reverse), the strictly-`>` boundary is silently off by
the offset — the *same* boundary 0061's **R-9** already flags one layer up, arriving through a
different door. **Rule: parse the raw string explicitly against `config('app.timezone')` rather than
letting an implicit assumption decide**, and freeze the clock near a boundary in the tests.

### D-9 — The bodiless-Draft rule surfaces as a validation message, not a disabled control

0061's **D-4** allows a Draft to be bodiless while Published and Scheduled may not. The UI has two
ways to say so:

- **(a) Let the save run and render the refusal beside the body field** — **adopted**.
- (b) Proactively disable the Published/Scheduled options while the body is empty — **rejected**, for
  a mechanical reason rather than a stylistic one. 0021's **D9** syncs the `wire:ignore`d editable
  region at **defined sync points, not continuously**, so a server-side "is the body empty" predicate
  would be **stale by construction** — flickering, or wrong, exactly when it matters. It also composes
  badly with the promotion case, where the rule depends on the *stored* post rather than on current
  form state.

This is also the house pattern: every domain-invariant refusal in this codebase renders as an inline
error (Sales Regions' `replacementDefaultId`, the category-delete block), never as a pre-emptively
disabled control. **The UI surfaces a refusal; it does not re-derive the rule.** Both amigos
independently recommended (a).

> ⚠️ **Correction, 2026-08-30 — the decision above is unchanged; the rule it surfaces now has a
> language scope, and getting that scope wrong breaks publishing for the whole catalog.**
> **(a) is still adopted** and (b) is still rejected for the same mechanical reason — 0021 **D9**'s
> `wire:ignore`d region makes "is the body empty" unknowable server-side between sync points, and
> after 0079 there are **N** such regions rather than one, so the argument gets *stronger*.
>
> **What changes: the rule binds the store default language's body only.** 0078's **Q-1**, resolved
> 2026-08-30 to option **(a)**: a post is publishable once its **default-language** body exists, and
> every other language falls back until translated.
>
> - **A blank non-default body must never block a save, at any status.** The alternative — requiring a
>   body in every active language — means **adding a French tab retroactively unpublishes every
>   published post in the catalog**, which is a severe and surprising side effect of a settings
>   change. 0078 raised its Q-1 specifically to prevent it, and its **backlog item 1** names this
>   screen's future per-language body path by name.
> - **The refusal still renders beside the body field — of the language it belongs to.** Under 0079
>   the key is `bodies.{defaultId}`, and a default-language refusal arriving on the bare `body` key
>   from `CreateBlogPost`/`UpdateBlogPost` is re-keyed by 0079 **D-9**'s adapter. Without it the
>   editor sees a save that did nothing.
> - **The promotion case rescopes identically:** promoting a bodiless draft is refused for the
>   **default** language's bodilessness, and a bodiless French tab never blocks it.
>
> ⚠️ **The *mechanism* is 0079's open Q-1, not settled here.** `bodyRules(BlogPostStatus $status)`
> returns `required` for `Published`/`Scheduled` and has no status-free variant, so how the
> non-default write path expresses "unconditionally optional" — a new `translatedBodyRules()` added
> to 0078's trait (0079's recommendation), or calling `bodyRules(Draft)` with a comment — must close
> before 0079's Phase 3. **Writing an inline `['nullable','string']` in a component or action is
> explicitly rejected** by 0073's rule that a translation writer reuses the entity's
> `<Noun>ValidationRules` and never a locally written rule.

### D-10 — The tag field is bespoke and binds **names**; `SearchableMultiSelect` is structurally ruled out

**0022's component cannot do this job, and the reason is contractual rather than cosmetic.** Its whole
interface is a two-method resolver keyed on **ids** (`search(string $term, int $limit): array`,
`resolveSelected(array $ids): array`), and its **D12** makes `resolveSelected()` *total*: it **throws**
on any id it cannot vouch for, and the shell refuses the save rather than tolerate a partial result. A
tag that does not exist yet **has no id**. There is no write path anywhere in that interface, because
the contract has no expression for "this does not exist, create it". Bolting create-on-the-fly on
would mean widening a **confirmed, cross-story contract** that 0026, 0027 and 0034 all bind to
without re-deciding — 0022's story's call, not this one's.

So: a bespoke chip field living **inside `BlogPosts\Editor`**, not a new reusable component, because
there is exactly one consumer today. It borrows the *shape* (chips, debounced suggestions,
already-selected excluded from results) and binds on **names**, because 0059's whole resolution model
is name-based and case/accent-insensitive.

- **`public array $tagNames = []` is the post's complete set**, hydrated in `mount()` from
  `$blogPost->tags->pluck('name')`.
- **Nothing is created until Save.** `SyncBlogPostTags` → `FindOrCreateBlogTag` runs inside 0061's
  transaction, per name. An editor who types "invierno" and abandons the page creates nothing.
- **The chip list is never filtered, paginated or truncated.** This is not cosmetic: 0061's **D-17** ⚠️
  says the full-replace `sync()` is safe *only* while the field shows every tag the post holds — the
  moment one is hidden, an omission stops being the editor's decision and becomes a silent revoke,
  which is [the exact trap this repo has already hit twice](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20).
  **This constraint must be repeated in the component's own docblock**, where the next author reads.
- **Suggestions exclude names already on the post**, compared case-insensitively, matching 0022's D11
  rule and 0059's own folding semantics.

> ⚠️ **Correction, 2026-08-30 — the hydration line above names a dropped column, and this is the
> break site that neither 0078 nor its own R-1 catches.** *"`public array $tagNames = []` is the
> post's complete set, hydrated in `mount()` from `$blogPost->tags->pluck('name')`"* — and
> [0074](0074-translatable-content-retrofit-blog-tags-backend.md) drops `blog_tags.name` **and**
> `normalized_name` (verified: its second migration is `dropColumn(['name', 'normalized_name'])`).
>
> **0078's R-1(a) lists three break sites in this file and this is not one of them; it is
> [0079's **R-1**](0079-blog-post-editor-language-tabs-ui.md), found by opening the editor rather than
> by following the hand-off — so this file is broken by three Epic 5 stories across *four* sites, and
> the editor is one of them, not just the list.** The hydration becomes a resolved read
> (`translated('name', $languageId)` per tag, coalescing a `null` away), loaded through the same
> translation eager load the list uses (**D-4** correction) rather than as a per-chip query.
>
> **Four properties of this decision survive the retrofit, and three of them get *sharper*:**
>
> - ✅ **The field still binds names, not ids** — 0059's resolution model is name-based, and
>   `FindOrCreateBlogTag::__invoke(string $name)` keeps its signature (0074 **D-7**). So **D-10**'s
>   whole argument against `SearchableMultiSelect` is untouched: 0022's resolver is still id-keyed and
>   a tag that does not exist yet still has no id.
> - ✅ **Nothing is created until Save**, still inside 0061's transaction, still one
>   `FindOrCreateBlogTag` call per name.
> - ⚠️ **"The chip list is never filtered, paginated or truncated" becomes *more* load-bearing, not
>   less.** 0061 **D-17**'s full-replace `sync()` is safe only while the field shows every tag the
>   post holds — and after 0074 a chip whose name resolves to `null` in the rendered language is a
>   **new way to hide one**. A chip that renders blank must still be present, still removable and
>   still submitted; dropping it from the set would turn an unrelated translation gap into a silent
>   detach. **This sentence belongs in the component's own docblock beside the existing one.**
> - ⚠️ **"Suggestions exclude names already on the post, compared case-insensitively" is now scoped to
>   one language's fold.** After 0074 the comparison is against `(store_language_id,
>   normalized_name)`, so "case-insensitively" means *within one store language's partition*.
>
> **Which language, and the cost that comes with it.** The store default — 0074 **D-7**/**Q-1(a)**,
> confirmed by 0079 **D-12**, which closes 0074's **Q-2** by putting the tag field **outside** the
> language tabs, rendered once. A field outside the tabs has no per-language context to author in, so
> the default is the only coherent answer. ⚠️ **0074's own R-6 is the consequence, and this screen is
> its first UI**: an editor reading French-rendered tag names and typing a French name gets a lookup
> against the **default** partition, which misses, and mints a new tag whose *default-language* name is
> that French string — even though a tag already translated into French with that name exists. It is
> invisible to the reuse check entirely, and create-on-the-fly's whole point is speed with no curation
> step. Accepted as a curation problem for the tag management screen (0075) rather than solved here.
>
> ⛔ **One genuinely open gap, inherited and not closed by this amendment:**
> [0079's **R-3**](0079-blog-post-editor-language-tabs-ui.md). The *behaviour* is settled, but whether
> `FindOrCreateBlogTag::__invoke(string $name)` really keeps its signature while its lookup spans a
> translation table is closed by neither 0074 (which defers the UI half here) nor 0078 (whose scope
> fence excludes tag names as *"0074's, already retrofitted"*). **A coordination item, not a guess.**

### D-11 — The `blog.create` tag guard is a UI hint over an intact server refusal

0059's **D-11** makes `FindOrCreateBlogTag` ask a **different ability per branch**: `blog.view` to
reuse an existing name, `blog.create` to mint a new one. Left alone, an actor holding `blog.edit` but
not `blog.create` types a new name, saves, and gets an **uncaught `AuthorizationException` — a hard
403 on the whole page**, which is not "the refusal surfaces" in any useful sense.

So the component computes `Gate::allows('create', BlogTag::class)` and, when false, renders the
**"add this as a new tag" control `disabled`** inside an explicit `<flux:tooltip>` giving the reason.
Suggestions stay fully usable, so the actor can still attach existing tags — which is exactly the
partial-grant experience 0059's D-11 built the per-branch check for.

⚠️ **This is a hint, never a layer.** The server-side refusal inside `FindOrCreateBlogTag` remains the
real, un-bypassable control, and the ⚠️ 0061's **D-13** records still holds: the refusal **must
surface**, never be swallowed by silently dropping the unmatched name — the editor would watch
"invierno" vanish with no explanation, which is a second, undocumented interpretation of their input.
**Phase 4 should audit exactly this**: that disabling the control changed no server-side behaviour.

### D-12 — The trashed affordance is a collapsed section on the list, not a filter and not a route

0061's **D-7d**/**R-16** make this an obligation rather than a nicety: without an exit, a blog category
is permanently undeletable because of a post no screen shows. Three shapes were considered:

| Option | Verdict |
| --- | --- |
| A "Trashed" value in a status filter | **Rejected.** It replaces the live table, so an editor restoring several posts loses the list they were working from — and it makes "trashed" masquerade as a fourth `BlogPostStatus`, which it structurally is not (`deleted_at`, not `status`). |
| **A collapsed, closed-by-default section beneath the table** *(adopted)* | This is a **shipped precedent in this repo**: task 0018's "Show all countries (N)" block on the Sales Regions screen — a small, rarely-touched, closed-on-first-paint block beneath the primary table with its own row actions. No new route, no second registry entry, and active and trashed are visible on one screen. |
| A separate `blog/posts/trash` route | **Rejected as heavier than the problem.** A fourth route and a fourth registry decision, with most of the list markup duplicated, for what 0061's own **R-16** calls "a usability dead end, never a data-integrity one". |

Its query is `BlogPost::onlyTrashed()->select([...])->with('category:id,name')->orderByDesc('deleted_at')->get()`,
rendered **independently of the filters** — matching how 0018's collapsed section ignores the active
table's state. It deliberately does **not** route through `scopeForCategory()`/`scopeForTag()`, which
apply the default `SoftDeletingScope` and would return nothing.

**Restore only; no force-delete** — and since 0061's revision this is *its* decision, not a choice
this story makes: **D-20** states outright that "force-delete is deliberately not available; restore
is the only exit, and it is sufficient." It is also the safer half on its own merits, since restoring
lets the editor then reassign the post's category through the ordinary edit form, freeing the blocked
category with no destructive step. See **D-13b**.

The section's restore control calls 0061's `RestoreBlogPost` and is gated on `blog.edit` through
`Gate::allows('restore', $post)` — **D-13**.

> ⚠️ **Correction, 2026-08-30 — the trashed section's query names two dropped columns and needs the
> same treatment as D-4's, with one difference worth stating.** As written it is
> `BlogPost::onlyTrashed()->select([...])->with('category:id,name')->orderByDesc('deleted_at')->get()`:
> the `select([...])` carries `title` (0078 drops it) and `category:id,name` names a column 0072
> drops.
>
> The replacement mirrors **D-4**'s — a `body`-excluding translation eager load plus a
> `withTranslationsFor()`-style load on `category` — with three things unchanged and worth
> re-confirming, because a rewrite is exactly where they get dropped:
>
> - ✅ **It still orders by `deleted_at DESC`**, a parent column, so no translated sort is involved
>   and no ordering question arises here either.
> - ✅ **It still deliberately avoids `scopeForCategory()`/`scopeForTag()`**, which apply the default
>   `SoftDeletingScope` and would return nothing. Epic 5 changes nothing about that.
> - ✅ **It still `get()`s rather than paginating**, and still renders independently of the filters.
>
> ⚠️ **And the section's own reason for existing gets a per-language dimension.** 0061's **D-7d**
> category-delete block counts `blog_posts` rows `withTrashed()`, and **0078 D-5 confirms that count
> is untouched** — no `blog_posts` row moved, only three of its columns did. So this affordance
> discharges exactly the obligation it always did. What is new is that a trashed post now also **holds
> its slug reserved per language** (0078 **D-5**), so a restore returns the post whole in every
> language — which is why 0079's disposition table **widens** this story's *"the restored row carries
> its category and tags"* case into a per-language guarantee rather than invalidating it.

### D-13 — The restore **consumes** 0061's `RestoreBlogPost`; this story writes no action *(settled — see the note below)*

> ✅ **Settled by 0061's revision, and this replaces the escalation that stood here.** This section
> previously proposed that 0063 author `app/Actions/Blog/RestoreBlogPost.php` itself, and escalated
> two questions: whether a UI story may write under `app/Actions/` at all (**OQ-1**) and which ability
> a restore should ask (**OQ-2**, where the two amigos disagreed). **Story 0061 has since answered
> both in its own D-20**: it ships `RestoreBlogPost` and a **fifth** `BlogPostPolicy` ability,
> `restore`, gated on **`blog.edit`**. Its hand-off is explicit — *"The action it calls ships here
> (D-20) — 0063 must not author one"*. Recorded rather than quietly deleted, so the resolution reads
> as a decision rather than as an unexplained gap.

**So the scope fence is restored to the ordinary shape**: this story writes nothing under
`app/Actions/`, matching 0060 and 0062, which only ever call actions their backend siblings own. Both
questions are answered by a dependency and were never this story's to settle.

`RestoreBlogPost` is **method-injected** on the Livewire action method, per
[code-style.md](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method) — the
same rule every other action call site on this screen follows, since a Livewire action method has no
external signature contract to protect:

```php
// App\Livewire\BlogPosts\Index
public function restoreBlogPost(RestoreBlogPost $restoreBlogPost): void
{
    // withTrashed(): the default query cannot see the row -- 0061's D-20 hand-off is
    // explicit that resolving the target is the caller's job, and a plain findOrFail()
    // here would 404 on every trashed post the section is displaying.
    $post = BlogPost::withTrashed()->findOrFail($this->restoringBlogPostId);

    ($restoreBlogPost)($post);   // __invoke(BlogPost): bool -- authorizes `restore` itself

    unset($this->trashedPosts);
    $this->resetPage();
}
```

Two properties this inherits rather than decides:

- **The action authorizes `restore` as its own first statement**, so this component's own check is a
  layer, not the control — the same defence-in-depth relationship every other action on this screen has.
- **The target is resolved `withTrashed()`.** This is the one non-obvious mechanical detail, and
  getting it wrong fails *loudly* (a 404 on every restore) rather than silently, which is the better
  of the two failure modes but still worth stating.

**The per-row hint is `Gate::allows('restore', $post)`**, not `'delete'` and not `'update'` — mirroring
what the click actually does, which is the rule every other row hint on this screen follows (**D-4**).
Since `restore` gates on `blog.edit` while `delete` gates on `blog.delete`, **an actor holding
`blog.delete` but not `blog.edit` sees delete enabled and restore disabled** — a real, reachable
partial-grant shape, and one the tests exercise rather than assume.

### D-13b — Force-delete is not available at all

0061's **D-20** hand-off settles this too: *"Force-delete is deliberately not available; restore is the
only exit, and it is sufficient."* This story therefore ships **no** force-delete control, and the
question this section previously carried as **OQ-3** is closed by the same revision. `App\Models\User`
remains the precedent that `forceDelete()` may exist on a model with no call site anywhere in the app.

### D-14 — The WYSIWYG seam, and why this story embeds **no** gallery

```blade
<livewire:components.wysiwyg-editor
    wire:model="body"
    wire:key="blog-post-body-editor"
    :label="__('blog-posts.editor.body_label')"
/>
```

That is the **entire** integration surface. 0021's **D4** is explicit that `WysiwygEditor` embeds
`<livewire:media.gallery>` *itself*, with all four attributes fixed by that story and not
consumer-configurable, and wraps the embed in `@can('viewAny', Media::class)` so an actor lacking
`media.view` does not mount a child that would 403 the whole host page.

**Consequences this story must honour rather than re-derive:**

- **No `<livewire:media.gallery>` tag appears in any view this story writes**, and no `select-event`,
  `:multi` or `#[On]` listener either. A rendering test asserts its absence (**R-6**).
- **No second `@can('viewAny', Media::class)` wrapper** around the editor tag — it would be redundant
  and would hide the editor entirely rather than just its image button.
- **The form body is never wrapped in a conditional `@if`** that could remount the editor mid-edit —
  losing unsaved content is the exact failure **D-1** exists to prevent, and a careless `@if` would
  reintroduce it locally.

**No featured image, and no gallery embed of this story's own.** 0061's scope fence is categorical:
"no `media` FK, no `blog_post_media` pivot, no featured image". The PRD's blog editor caption mentions
the shared gallery only for **body image insertion**, which is 0021's. A featured image would need a
column 0061 did not create.

> ⚠️ **Correction, 2026-08-30 — one embed becomes **N**, and the negative assertion below stays
> *literally* true while ceasing to mean what it meant.** After
> [0079](0079-blog-post-editor-language-tabs-ui.md) **D-4** the editor mounts **one `WysiwygEditor`
> per active store language**, all mounted simultaneously and hidden with `x-show`, each bound to its
> own `bodies.{languageId}` leaf with a per-language `wire:key`. Three consequences:
>
> - **The `wire:key` above is no longer a constant.** `wire:key="blog-post-body-editor"` becomes
>   `blog-post-body-editor-{{ $language['id'] }}`, and 0021 **D5**'s uniqueness machinery has to hold
>   at N instances rather than one.
> - ⛔ **`x-show`, never `@if`.** This is 0079's named silent killer, inherited by the markup this
>   story writes: an `@if` looks like an optimisation and tears down N `wire:ignore`d regions on every
>   tab switch, which 0021 has **no hook to restore**. No PHP error, no console error, and nothing a
>   component test can see. It is the same class of failure the third bullet below already forbids —
>   *"the form body is never wrapped in a conditional `@if` that could remount the editor mid-edit"* —
>   arriving one level up, and **that bullet is now load-bearing rather than defensive**.
> - ⚠️ **N editors means N media galleries, and no story in the family states this except 0079.**
>   0021 **D4** embeds `<livewire:media.gallery>` *inside* `WysiwygEditor`, wrapped in
>   `@can('viewAny', Media::class)` and not consumer-configurable — so N panels mount N `<dialog>`
>   elements, N upload listeners and N `Gate::authorize('viewAny', Media::class)` calls, regardless of
>   which tab is visible. **The rendering assertion *"no `<livewire:media.gallery>` tag appears in any
>   view this story writes"* remains literally true and must be kept** — it still catches a second
>   direct embed, which is what **R-6** exists for — but it no longer implies "one gallery on the
>   page". Page weight and query count at N=3+ are a real Phase 3 verification item for 0079, needing
>   a **bounded query-count test proven able to move**, per this repo's count-assertion rule.
>
> ✅ **Everything else in this decision is unchanged**: no `select-event`, no `#[On]` listener, no
> `:multi` prop, no second `@can` wrapper, no featured image, no `media` FK. 0061's scope fence is
> untouched by Epic 5, which adds no media column to any blog table.

### D-15 — The delete confirmation, and `closeModal()` clears validation

A `flux:modal` naming the target, mirroring `Users\Index` and `SalesRegions\Index`: `#[Locked]
$deletingBlogPostId` re-read with `findOrFail()` and re-authorized in `deleteBlogPost()`, inner
content wrapped in `@if ($showDeleteModal)` so only one "Cancel" control is ever in the DOM.

**`closeDeleteModal()` must call `resetValidation()`.** Livewire persists the error bag across
requests via `SupportValidation::dehydrate()`/`hydrate()`, so a refused action followed by *Cancel*
leaves a stale message rendering with no field and no context — a **blocking bug** in task 0018 before
it was caught, and one 0025 recorded independently. Cheaper to write now than to find at Phase 5.

The **cancel path has its own test**: the Users screen's finding A-1 shows that a missing cancel-path
assertion is how a "the click does nothing" bug ships unnoticed for a whole story.

> ⚠️ **Correction, 2026-08-30 — the modal names its target by a *resolved* title.** Everything
> mechanical in this decision is unchanged — `#[Locked] $deletingBlogPostId`, the `findOrFail()`
> re-read, the re-authorization, the `@if ($showDeleteModal)` wrapper, `resetValidation()` on cancel
> and the cancel-path test all survive Epic 5 untouched. The one changed line is the read that fills
> `$deletingBlogPostTitle`, and it is written up in full in the
> [D-6 correction](#d-6--every-wiremodel-bound-propertys-type-and-empty-value): `$target->title`
> becomes `$target->translated('title', $languageId) ?? ''`, the coalesce is mandatory, and the
> language is [OQ-10](#open-questions) — the same one the row above it renders.
>
> ⚠️ **`resetValidation()` on cancel gets *more* important, not less.** Once 0079's tabs land, a
> refused save can key its error onto a **hidden** tab's field (`titles.{languageId}`), so a stale
> error bag surviving a cancel is now a message with no field, no context **and no visible tab** —
> the same blocking bug 0018 shipped, one layer harder to diagnose.

### D-16 — The registry entry joins `groups.blog`, and its **position** is the decision *(V-2)*

```php
// config/modules.php -- inserted BEFORE items.blog_tags, not appended after it
'blog_posts' => [
    'group' => 'blog',
    'label' => 'navigation.items.blog_posts',
    'icon' => 'document-text',
    'route' => 'blog-posts.index',
    'current_when' => 'blog-posts.*',
    'permissions' => ['blog.view'],     // exactly the ability routes/blog-posts.php enforces
],
```

**`frontend-expert` recorded item ordering as unverified (its own risk 7). The facilitator verified
it, and it is not merely a preference — it changes the file's diff shape.**
`resources/views/components/sidebar-nav.blade.php` builds its groups with
`collect(config('modules.items'))->filter(...)->groupBy('group', preserveKeys: true)` and then
`@foreach ($groupedItems[$groupKey] as $itemKey => $item)`. Both `groupBy()` and the `@foreach`
preserve insertion order, so **render order is `items` declaration order**.

Posts is the epic's headline screen, so it renders **first** in the Blog group — which means this
story **inserts** its literal above `items.blog_tags` rather than appending below it. That is a
genuine, small divergence from the registry's usual "append data, never behavior" framing (task 0018's
own ✅ describes the cost as "two appended array literals"), and it is worth recording because **0062
faces the same choice and the two stories must agree.** Recommended final order: **Posts, Categories,
Tags** — the content first, then the taxonomies that classify it, coarsest first.

⚠️ **0060's group ships `expandable => false` with one entry.** With three entries it should almost
certainly become `expandable => true` with an `expanded_when` of `'blog-posts.*'`… except that a
pattern naming only one screen would collapse the group while an editor sits on the Tags screen.
0060's own D-4 says a group's `expandable` flag "is a one-key edit to a group they did not author —
worth a line in their own files". This is that line, and it is **OQ-8**, because the right
`expanded_when` depends on whether 0062 has landed.

### D-17 — Copy lives in a new `lang/{en,es}/blog-posts.php` *(resolved conflict — C-2)*

**Two already-written sibling stories contradict each other here**, and neither amigo could resolve it
alone. 0060's **D-8** explicitly *rejects* a shared `blog.php` for UI copy — "one screen, one domain
file… it recreates precisely the file-ownership hazard the
[Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule) makes a
real scheduling constraint — for no benefit". 0061's hand-off says the opposite for this story by
name: "it extends `lang/{en,es}/blog.php` rather than creating it".

**Resolved in favour of 0060's D-8: this story creates `lang/{en,es}/blog-posts.php` and does not
touch `blog.php`.** Three reasons:

1. **The two files hold different *kinds* of string.** 0061 created `blog.php` for exactly one key,
   `blog.categories.delete_blocked` — a **domain** message about a rule, rendered by whichever screen
   happens to hit it. This story produces no such cross-screen message; it produces **screen copy**,
   which every precedent in the repo (`users.php`, `roles.php`, `sales-regions.php`, `blog-tags.php`)
   puts in a per-screen file. So the two stories are not actually disagreeing about the same thing.
2. **The hazard is real and immediate.** 0062 is being written **in parallel right now** (**R-9**).
   Three stories sharing one lang file is precisely the collision the Parallel Agent File-Ownership
   Rule exists to prevent, and 0061's own **R-13** flags it as a risk in its own file.
3. **0060's is the reasoned decision.** It was debated, with its alternative stated and rejected;
   0061's is a one-clause forward-looking instruction written before that debate existed. This
   project's rule is that a later instruction contradicting a settled decision is **withdrawn in
   writing** rather than silently followed — recorded here so 0061's hand-off reads as superseded
   rather than as an omission.

⚠️ **`lang/{en,es}/navigation.php` *is* shared and *is* touched by all three Blog screens** — that is
unavoidable (it mirrors the registry) and is a two-leaf append, not a structural edit.

### D-18 — `BlogPostStatus::label()` ships here, and this is the first story to earn it

0061 deliberately shipped **no** `label()`, citing
[naming.md](../../docs/conventions/naming.md#translation-keys)'s rule that *a `label()` on an enum is not
automatic — add it when a **second** consumer appears, not when the first one does* — and noting "0063
is the first consumer and may add it then."

**This story adds it, and the rule is what says so: there are three consumers on this one screen** —
the list's status badge, the editor's status `<select>` over `cases()`, and (pending **OQ-4**) a status
filter. That is exactly the "second consumer appears" trigger, and it is the *opposite* answer from
task 0018's for `SalesRegionKind`, which declined `label()` because `kind` was rendered as text in
exactly one place. Both calls follow the same rule; the inputs differ.

`public function label(): string { return __('blog-posts.statuses.'.$this->value); }`, mirroring
`UserStatus::label()` (**V-7** — the only `label()` in the tree today) — with the leaves in this
story's own lang file per **D-17**, not in `blog.php`.

### D-19 — Status badge colours

`Draft → zinc`, `Scheduled → amber`, `Published → lime`, rendered with a `match` on the enum inside the
view and a defensive `@else`, mirroring `users.blade.php`'s shipped shape exactly. The palette follows
`UserStatus`'s own three-way `lime`/`zinc`/`red` semantics, with `amber` for Scheduled because it is
*pending* rather than *wrong* — `red` would misread a correctly-scheduled post as an error state.

⚠️ **The PRD specifies no colours** (it names only the Spanish labels Borrador / Publicado /
Programado), so this is an invented mapping and **OQ-9** exists for it. It is recorded rather than
defaulted because a badge palette is the kind of thing nobody revisits once shipped.

### D-20 — `data-test` hooks name the full domain

Per 0060's **V-2** ruling — a hook "names the model, not an abbreviation", forestalling collisions
across three sibling Blog screens — and per
[playwright-setup.md](../../docs/testing/frontend/playwright-setup.md)'s ⚠️ that "prefer visible text"
**inverts** on an admin list whose row controls are icon-only.

`edit-blog-post-{id}` · `delete-blog-post-{id}` · `restore-blog-post-{id}` ·
`status-badge-blog-post-{id}` · `date-blog-post-{id}` · `create-blog-post-button` ·
`category-filter` · `tag-filter` · `trashed-posts-toggle` · `status-select` · `category-select` ·
`published-at-field` · `tag-field` · `tag-chip-{name}` · `add-new-tag-button` ·
`sidebar-link-blog_posts`.

Every row hook renders on **both** the enabled and the disabled branch, so a test selects the same
control either way.

⚠️ **Three page-global assertions are unsafe on this screen specifically**, and this is sharper here
than on any prior list because a blog list realistically has many rows sharing a status and
overlapping dates — the [`assertSee('0%')`-matches-inside-`10%`](../../docs/errors-log.md) trap's
analogue: a status word (`assertSee('Borrador')` passes the moment *any* row is a draft), a date
fragment, and a tag name (which appears both as a filter option and in a row). Assert all three
through their row-scoped hooks. And a disabled-state helper must match `disabled="disabled"`, never a
bare `disabled` substring — Flux's own `disabled:opacity-75` class carries that word on the **enabled**
branch.

### D-21 — Test paths: `tests/Feature/Blog/`, and **mirrored** browser paths *(resolved conflict — C-3)*

Named explicitly because
[playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#folder-structure) states the
generalisable rule: **"a story file that names a test path is making a convention decision, so the
path belongs in the Phase 2 review"** — noting that twice now it has not been, and twice the
convention has lost by default.

**Feature: `tests/Feature/Blog/`**, with the disambiguation in the file names
(`BlogPostsIndexTest.php`, not `IndexTest.php`). This applies 0060's **V-3** finding unchanged: every
domain area in this repo keeps its component tests and its action tests in **one** folder, and 0059
and 0061 have already claimed `tests/Feature/Blog/`. A `tests/Feature/BlogPosts/` would split one
domain across two folders for the first time. Note the folder is named after the **area** while the
component namespace is the **entity** — the same asymmetry 0060 flagged, and the same one **D-2**'s
rule predicts.

**Browser: `tests/Browser/BlogPosts/{IndexTest,EditorJourneyTest}.php` — mirrored.**
`frontend-expert` left this open ("worth re-litigating"); `frontend-qa` applied 0060's V-1 resolution.
**QA's is adopted, and this story does not reopen it**: 0060 already had this exact debate against the
same evidence (three of four existing files sit flat) and ruled that the page owning the question says
the mirrored form is the convention and the flat files are **debt, not precedent**. Choosing flat here
would be the fourth default-loss.

**Two files, not one**, following 0027: the list's real-DOM cases and one comprehensive editor
journey. This screen is a list **and** a composed editor, unlike Roles/SalesRegions/BlogTags, which
are list-plus-modal screens covered by a single file.

### D-22 — The canonical term is "post", and this closes a live product-owner TODO

[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md)'s domain glossary carries an
explicit, unanswered `TODO (product owner)` asking, among other things: *"(a) for a blog entry, is the
term 'post' or 'article'?"* That is this facilitator's call, and Epic 4 cannot ship three screens'
worth of Gherkin without answering it.

**The canonical English term is "post"**, with the actor **"blog editor"**. Both are taken verbatim
from the PRD's own Epic 4 scenarios and are already used consistently by 0058, 0059, 0060 and 0061, so
this ratifies existing practice rather than imposing a new term. **"Article" is the Spanish UI copy's
own rendering** (the PRD's list caption reads *"Nuevo artículo"*), which is a translation choice living
in `lang/es/blog-posts.php`, **not** a second domain term — an English scenario must never say
"article".

Recorded in the Definition of Done as a docs-keeper hand-off, together with a correction that section
needs anyway: its stated justification is *"No blog or ecommerce domain exists in the code yet
(`app/Models/` contains only `User`)"*, which has been false since task 0016 shipped `SalesRegion` —
this project's recurring
[bare-negative-claim](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)
failure mode, arriving in a file nobody opens while adding a model.

## Scope fences: what this story must NOT do

- **No migration, no column, no index, no seeder change.** `blog.*` is already seeded (**V-3**).
- **No edit to any 0058/0059/0061 model, action, trait or policy, and no *new* file under
  `app/Actions/` either** — with exactly one named exception, `BlogPostStatus::label()` (**D-18**),
  which 0061 explicitly delegated to its first consumer. `RestoreBlogPost` ships in 0061 (**D-20**)
  and is **called, never authored** (**D-13**).
- **No direct call to `SyncBlogPostTags` or `FindOrCreateBlogTag`** — 0061's hand-off forbids it.
- **No `<livewire:media.gallery>` embed, no `select-event`, no featured image, no `media` FK** — the
  gallery is 0021's business (**D-14**).
- **No edit to `SearchableMultiSelect`** — widening 0022's confirmed resolver contract to support
  create-on-the-fly is that story's decision, not this one's (**D-10**).
- **No edit to `sidebar-nav.blade.php` or `sidebar.blade.php`** — the registry is extended by
  **data**; the reader is untouched.
- **No second sidebar group** — `groups.blog` is 0060's and already exists (**D-16**).
- **No `lang/{en,es}/blog.php` edit** (**D-17**).
- **No force-delete affordance** (**D-13b**, 0061's own **D-20**), no restore of anything but a post.
- **No scheduled-publish sweep, no notification, no event** — 0064 and 0065.
- **No public-facing route, archive page or storefront filtering** — the PRD's Out of scope excludes
  it; 0061's scopes are for the **admin** list only.
- **No SEO/meta fields, no per-locale tabs** — Epic 5.

> ⚠️ **Correction, 2026-08-30 — every fence above still binds this story, and two of them now mean
> something narrower than they did.** Nothing here is lifted: this amendment corrects what the file
> *asserts*, and grants it no new scope.
>
> - ***"No SEO/meta fields, no per-locale tabs — Epic 5."*** **Both halves are still true of this
>   story**, and the sentence has stopped being a statement about the schema. **Per-locale tabs are
>   [0079's](0079-blog-post-editor-language-tabs-ui.md)**, built on this editor and explicitly not
>   here. **SEO/meta fields still do not exist anywhere** — 0078's **Q-2** resolved 2026-08-30 to
>   option **(a), out of scope**: 0061 ships no meta columns and a translation retrofit is the wrong
>   place to invent them. Note this is a *per-entity* decision rather than a family-wide one — 0076
>   gave Products `meta_title`/`meta_description` on its own debate's recommendation, and the two
>   answers differing is deliberate.
> - ***"No new file under `app/Actions/` … with exactly one named exception, `BlogPostStatus::label()`."***
>   **Still exactly true of this story.** 0079 adds `App\Actions\Blog\SetBlogPostTranslation` beside
>   0061's and 0078's — but that is 0079's file, in 0079's diff, and this story still writes nothing
>   under `app/Actions/`. A reviewer meeting seven Blog actions after 0079 lands should not read that
>   as this fence having been broken.
>
> **Three fences to *add* for the same reason the two above needed narrowing** — each is a rule 0079
> and its siblings inherit, and each is greppable at review:
>
> - **`App\Actions\Translations\SetTranslation` must appear in no import under `app/Livewire/`.** It is
>   0070's deliberately-unguarded persistence primitive; only `SetBlogPostTranslation` may reach it
>   (0071 **D-13**, 0079 **D-8**). Worth an explicit grep at Phase 4.
> - **`resources/views/components/language-tab-strip.blade.php` is 0071's — consumed, never forked,
>   copied or widened.** This screen would be its fourth consumer.
> - **No slug field, no `$slugs` property, no client-side slug preview** — see the verified check
>   below.

### Verified: no single-slug assumption survives in this file

The one check this amendment was asked to run explicitly, because
[0079's own ⛔ block](0079-blog-post-editor-language-tabs-ui.md) records a coordinator brief that
asserted the opposite (*"slug is per-language-unique and administrator-facing"*) and was **false
against 0078 as written**. Verified by grep rather than by recollection: **`slug` appears three times
in this file and none of them is a form control, a bound property, a rendered cell, a `data-test` hook
or a validation key.** The three, with their dispositions:

| Site | Text | Disposition |
| --- | --- | --- |
| *Deliberately not tested here* table | *"`slug` derivation … | 0061"* | ✅ **Still correct, and still 0061's-then-0078's.** The derivation hook **moves** to `BlogPostTranslation` (0078 **D-4**) and becomes per-language, but it remains something this story does not test. |
| The restore block | *"the slug reclaim"* — listed among 0061's own `RestoreBlogPostTest.php` assertions | ✅ **Still correct, and now a *per-language* guarantee** (0078 **D-5**): a trashed post keeps its slug reserved **in each language it was translated into**, and free in a language it never was. Still 0061/0078's test, not this story's. |
| **D-5** | *"Both bind IDs, not names or slugs"* | ✅ **Unchanged and now doubly true** — the filters bind ids, and a slug is not a candidate for anything on this screen. |

**So this file never assumed a single slug, never rendered one, and needs no correction on that
axis** — which is worth recording as a positive rather than a silence, since the sibling brief that
got it wrong would have added an input, a `$slugs` state array, a blur-prefill affordance and a
client-side preview, all of which 0079 **D-2** rules out. **The one real consequence is the
opposite of an addition:** a slug-uniqueness refusal (0061 **OQ-2**, resolved to option **(b)**,
refuse-with-validation) **has no slug field to land on**, so it must be re-keyed onto the **title**
of the language being edited — 0079 **D-2**/**R-4**, on the reasoning that retitling is the only
action an editor can take to resolve it.

## Dependencies, risks and open questions

### Verified environment findings

Executed read-only against this worktree during the debate. **`vendor/` is absent (V-6)**, so nothing
requiring PHP execution was verified and every such claim is flagged at its site, per this project's
[hedge rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24).

- **V-1 — Not one dependency exists in code.** `app/Models/` holds `Role.php`, `SalesRegion.php`,
  `User.php`. `app/Livewire/` holds `Actions/`, `Roles/`, `SalesRegions/`, `Settings/`, `Users/`.
  `app/Actions/` holds `Auth/`, `Fortify/`, `Roles/`, `SalesRegions/`, `Users/`. Stories 0020, 0021,
  0022, 0058, 0059 and 0061 are **task files, not shipped code**, and all six still sit in
  `ai-spec/tasks/` rather than `done/`.
- **V-2 — Sidebar render order is `config('modules.items')` declaration order.** Read from
  `sidebar-nav.blade.php`: `->groupBy('group', preserveKeys: true)` then `@foreach`, both
  order-preserving. This closes `frontend-expert`'s own open risk and turns **D-16** from an append
  into an insertion.
- **V-3 — `blog` is already in the seeded catalog.** `RolePermissionSeeder::MODULES` contains
  `'blog'`; `ACTIONS` is the four CRUD verbs. **Zero seeder change.**
- **V-4 — `tests/Browser/` holds four files**, not the three
  [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md) claims: `Auth/LoginSmokeTest.php`,
  `RolesIndexTest.php`, `SalesRegionsIndexTest.php`, `UsersIndexTest.php`. 0060's Phase 1 caught the
  same under-count and it is still open.
- **V-5 — This repo has no `#[Url]`, no `WithPagination`, no `paginate()` and no date input anywhere.**
  `grep` over `app/Livewire/` and `resources/views/` returns none of them. This screen is the **first**
  of each, which is why **D-4**, **D-5** and **D-8** are flagged as new territory rather than as
  applied convention.
- **V-6 — `vendor/` is absent**, so Flux Free's real component surface (**D-8**, **OQ-6**) and the
  Pest browser DSL's real method list are unverified here.
- **V-7 — `UserStatus::label()` is the only `label()` on any enum in the tree**, and
  `SalesRegionKind` deliberately has none — the two poles **D-18** reasons between.

### Dependencies

- **0061 — hard, blocking, and total.** The model, the enum, all four actions, the validation trait,
  the policy and both scopes. Not implemented (**V-1**).
- **0058 / 0059 — hard.** The category select's options and the tag field's suggestions.
- **0021 (WYSIWYG) — hard.** The body editor. Also **0020** transitively, since 0021 embeds it.
- **0060 — soft but real.** It creates `groups.blog`. If 0063 somehow ships first it must create the
  group itself, following 0060's **D-4** shape verbatim.
- **0022 — explicitly *not* a dependency** (**D-10**), unlike 0027's editor.
- **0062 — not a dependency**, but a **parallel-write hazard** (**R-9**).
- Per [workflow.md](../../docs/workflow.md#task-ordering-rule) the numbering is already correct; what must
  be enforced is the **sequencing** — 0058, 0059, 0061, 0020, 0021 and 0060 all reach Phase 7 before
  this story starts Phase 3.

> ⚠️ **Correction, 2026-08-30 — four Epic 5 stories join this list, and the sequencing sentence above
> is now the load-bearing half of this section.** None of the six dependencies above is displaced;
> what is added is where this story sits relative to the retrofits.
>
> | Story | Kind | Why |
> | --- | --- | --- |
> | [**0072**](0072-translatable-content-retrofit-blog-categories-backend.md) | **hard**, not implemented | Drops `blog_categories.name`. Two of this screen's queries and two of its option sets name it. |
> | [**0074**](0074-translatable-content-retrofit-blog-tags-backend.md) | **hard**, not implemented | Drops `blog_tags.name`. The list's eager load and the editor's chip hydration name it. |
> | [**0078**](0078-translatable-content-retrofit-blog-posts-backend.md) | **hard, blocking, total**, not implemented | Drops `blog_posts.title`/`body`/`slug`. The list query, the editor's two fields, the delete modal's label and the body rules all depend on it. |
> | [**0079**](0079-blog-post-editor-language-tabs-ui.md) | **depends on this story**, not the reverse | It builds the language tabs *on top of* this editor and rewrites this list's query. It must land **strictly after** this story and must never be batched with it. |
> | [**0070**](0070-translatable-content-mechanism-product-categories-backend.md) / [**0068**](0068-store-languages-catalog-backend.md) | hard, transitively | `HasTranslations`, `translated()`, `withTranslationsFor()`, `SetTranslation`, `StoreLanguage` and its `is_default` row. Consumed, never re-implemented. |
> | [**0071**](0071-product-categories-language-tabs-ui.md) | soft, via 0079 | Owns `<x-language-tab-strip>`, `setActiveLanguageTab()` and the two-layer pattern 0079 consumes. |
>
> **The sequencing, strictly:** 0058 → 0059 → 0061 → **0063** → 0068 → 0070 → 0072 → 0074 → 0078 →
> 0079, each fully closed before the next starts, with 0020/0021/0060 landing before this story as
> already required.
>
> ⚠️ **There is one ordering the coordinator should decide rather than inherit**, and it is
> [0078's **R-14**](0078-translatable-content-retrofit-blog-posts-backend.md) reaching this file: if
> **0078 lands before 0061 is implemented**, the far cheaper path is to amend 0061 so `title`, `body`
> and `slug` are *never created* on `blog_posts` — which deletes 0078's second migration, its
> backfill and its sharpest hazard (a backfill that silently and permanently empties every
> already-trashed post). **This story is unaffected either way** — it reads the post-retrofit shape
> regardless — but the decision is cheaper to make than to reverse, and this file is where its cost
> is most visible.

### Risks

- **R-1 — This screen carries more `<select>` controls than any shipped one, and `<flux:select>` has a
  recorded, unresolved Playwright race.**
  `tests/Browser/SalesRegionsIndexTest.php` documents it in its own comments: *"the replacement
  `<flux:select>`'s `wire:model` binding itself intermittently fails to register a Playwright-driven
  `->select()` under this same real-browser automation — confirmed by DOM inspection"*, mitigated but
  **not provably eliminated** by a bounded `->wait()`. The recorded next step is *"either a Pest-level
  retry for this one test or replacing the native `<flux:select>` with a `wire:click`-per-option
  control (menu/listbox) — not a longer sleep."* This story ships **four** such controls (status,
  category, and both filters), so it inherits a known unsolved problem at four times the exposure.
  Feeds **OQ-4**.
- **R-2 — The `datetime-local` timezone offset** (**D-8**). Silently shifts the strictly-`>` boundary
  by `config('app.timezone')`'s offset; only visible near a boundary, and invisible to any test that
  does not freeze the clock there.
- **R-3 — The `blog.edit`-without-`blog.create` role shape needs a *custom* role fixture.** The seeded
  `Administrator` holds everything, so every test using it passes while **D-11** is broken. The tag
  refusal is the only place in this story where a partial grant behaves differently, and it is the
  first UI consumer of 0059's per-branch ability.
- **R-4 — A page-global status/date/tag assertion is a near-certain first bug** (**D-20**), and sharper
  here than on any prior screen because a blog list has many rows sharing a status.
- **R-5 — `sync()` becomes a silent revoke the moment the chip field filters or truncates**
  (0061 **D-17** ⚠️, **D-10**). Safe today **by construction**, unsafe the day someone adds
  pagination or a "show more" to the chip list. Recorded in the component's own docblock.
- **R-6 — A second gallery embed.** Nothing errors if this story embeds `<livewire:media.gallery>`
  alongside the one 0021 mounts internally; the two would simply collide over the caret and the
  event names. Closed by the absence assertion in the rendering test (**D-14**).
- **R-7 — Filters plus pagination is new territory** (**V-5**). The page-reset-on-filter behaviour, the
  `#[Url]`↔`page` interaction, and `.live` debounce are all first-instance decisions here.
- **R-8 — `delete` and `restore` gate on *different* permissions, so a partial grant is reachable.**
  Since 0061's **D-20** puts `restore` on `blog.edit` while `delete` stays on `blog.delete`, an actor
  holding one and not the other sees one row control enabled and the other disabled. That is correct,
  but it is invisible to every test whose actor holds the seeded `Administrator` or a full `blog.*`
  role, so it needs its own custom role fixture (**R-3**'s shape, a second time). *This risk replaces
  the one that stood here* — that `RestoreBlogPost` was backend code inside a UI story — which 0061's
  revision removed entirely by shipping the action itself.
- **R-9 — Three stories claim `config/modules.php`, `lang/{en,es}/navigation.php` and the `blog` group:
  0060 (done), 0062 (being written in parallel *right now*) and this one.** Under the
  [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule) this is
  a real scheduling constraint, not a footnote: 0062 and 0063 must not implement concurrently, and they
  must agree on **item order** (**V-2**) and on the group's `expandable` flag (**OQ-8**). **D-17**
  removes the lang-file half of this hazard by giving each screen its own file.
- **R-10 — Every citation in this file is a claim about a task file, not about code** (**V-1**). Six
  dependency stories land between this debate and Phase 3. Closed only by the re-verification item in
  the Definition of Done.
- **R-11 — The WYSIWYG's `wire:ignore` region makes "the body is empty" unknowable server-side between
  sync points** (0021 **D9**). This is why **D-9** refuses the disabled-control shape; it is recorded
  as a risk because a later story "improving" the UX by adding that control would reintroduce it.

> ⚠️ **Correction, 2026-08-30 — every risk above survives Epic 5, three of them get sharper, and four
> are added.** Nothing is retired: **R-1** (four `<flux:select>` controls against a recorded
> Playwright race), **R-2** (the `datetime-local` offset), **R-3**/**R-8** (the two partial-grant role
> fixtures), **R-4** (page-global status/date/tag assertions), **R-5**, **R-6**, **R-7**, **R-9**,
> **R-10** and **R-11** all still hold as written.
>
> **Three that sharpen:**
>
> - **R-4** — the collision surface grows. 0079 **D-15** records this as the **first** screen in the
>   family where **admin-UI-locale chrome sits beside store-language content in one DOM**:
>   `BlogPostStatus::label()` renders "Borrador" in the *admin* locale while a panel holds *store*-language
>   prose, and "borrador" is plausible text inside a real Spanish article body. A careless
>   `assertSee('Borrador')` aimed at the status control can match inside a WYSIWYG region. Assert
>   through the row-scoped hooks **D-20** already mandates.
> - **R-5** — the silent-revoke window widens. The chip field is unsafe the moment it filters or
>   truncates, and after 0074 a chip whose name resolves to `null` is a **new way to hide one**. See
>   the [D-10 correction](#d-10--the-tag-field-is-bespoke-and-binds-names-searchablemultiselect-is-structurally-ruled-out).
> - **R-11** — the reason **D-9** refuses the disabled-control shape gets stronger, because after 0079
>   there are **N** `wire:ignore`d regions rather than one.
>
> **Four added:**
>
> - **R-12 — The list and the editor need *opposite* eager loads, and a shared helper breaks one
>   silently.** 0079's **R-8**, converged on independently by both of its amigos. A too-narrow load
>   leaves hidden tabs empty (reads as a hydration bug); a too-wide one restores 0061 **R-7**'s
>   clustered-index cost **per page**. Both are invisible to a component test, which is why 0079 gives
>   it an acceptance criterion and a test rather than a note. Factoring the two into one
>   `withTranslationsScoped()` helper is the plausible mistake — both screens live under Blog.
> - **R-13 — `$deletingBlogPostTitle` is fed from a dropped column and *no upstream story names it*.**
>   Recorded in the [D-6 correction](#d-6--every-wiremodel-bound-propertys-type-and-empty-value). It is
>   the same shape [0027's `$deletingProductName`](0027-products-list-and-editor-ui.md) carries, where
>   0076's **R-1(b)** *does* name it — here neither 0078's three-site R-1(a) nor 0079's four-site R-1
>   does. Found by reading this file rather than by following a hand-off, which is precisely the
>   failure mode a hand-off-driven amendment produces.
> - **R-14 — A refusal can key onto a tab nobody is looking at.** Once 0079 lands, a save refused on a
>   hidden language's title renders on a field that is not on screen unless the component switches the
>   active tab to it — 0018's finding A-1 ("the click did nothing") and its B1 (a stale error bag)
>   arriving together. 0079 owns the mechanism (**D-9**, **D-14**) and names it its single
>   highest-value component test; it is recorded here because **D-15**'s `resetValidation()` on cancel
>   is this file's half of it.
> - **R-15 — 0074's near-duplicate tag hazard reaches its first UI here.** 0074 **R-6**: an editor
>   working in French types a French tag name, the reuse lookup runs against the **default**
>   partition, misses, and mints a near-duplicate — at exactly the speed create-on-the-fly was built
>   to enable. Accepted as a curation problem for 0075's screen, not solvable here, and recorded so a
>   reviewer meets a decision rather than a silence.

### Open questions

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule these are recorded rather than
guessed. **None blocks Phase 2 review.**

> ✅ **OQ-1, OQ-2 and OQ-3 are closed by story 0061's revision** and are kept here as retired entries
> rather than deleted, so a cross-reference does not rot and the resolution reads as a decision. **The
> numbers are not reused.**
>
> | Was | Question | Resolution |
> | --- | --- | --- |
> | **OQ-1** | May this UI story author `RestoreBlogPost` itself? | **No.** 0061's **D-20** ships the action; its hand-off says *"0063 must not author one"*. This story only consumes it, matching 0060 and 0062. See **D-13**. |
> | **OQ-2** | Which ability gates a restore? | **`blog.edit`**, through a **fifth** `BlogPostPolicy` ability, `restore` — 0061's **D-20**. The option this debate flagged as most correct but most expensive (a real `restore()` policy method) is the one 0061 took, at no cost to this story. |
> | **OQ-3** | Ship a force-delete, or defer? | **Not available at all** — 0061's **D-20**: *"force-delete is deliberately not available; restore is the only exit."* See **D-13b**. |
>
> Worth recording for its own sake: **OQ-2's outcome vindicates escalating rather than picking.** Both
> amigos' recommendations (`blog.delete`, `blog.edit`) were arguments *within* the four existing
> abilities, and the answer was the fifth option this debate raised only because the disagreement
> forced it to be written down. Silently adopting either amigo's pick would have shipped a hint that
> disagreed with the action 0061 then wrote.

- **OQ-4 — Are the two filters `wire:model.live`, or `wire:model` plus an explicit "Apply"?**
  This is not a style question: it interacts with **R-1**'s recorded `<flux:select>` race, and `.live`
  is the flakier shape. **(a) `.live` (recommended)** — instant filtering is what a list filter is
  *for*, `Users\Index`'s role select is the in-repo precedent for a `.live`-bound select, and the
  browser tests carry the documented bounded-`->wait()` mitigation. **(b)** An explicit Apply button —
  fewer round trips and no race, but a worse experience and no precedent here.

- **OQ-5 — The page size** (**D-4**). **(a) 25 (recommended)**, matching 0027's own proposal, as a
  single named constant. Nothing else in the repo paginates, so there is no precedent to match.

- **OQ-6 — `datetime-local`, or something else?** Unverifiable here (**V-6**). **(a) `datetime-local`
  (recommended)** — native, no JS, matches the "pick the input type that fits the data" instinct Sales
  Regions established. **(b)** A Flux date component, *if* Flux Free ships one — a Phase 3 check, not
  an assumption. Note **D-8**'s timezone rule applies to either.

- **OQ-7 — An `arch()` fence for `App\Livewire\BlogPosts\*`?** **(a) Add one (recommended, cheap)** —
  one rule per namespace, **never** `expect([...])`, which is disjunctive and has already shipped
  vacuous in this repo once. **(b)** Skip it; 0058/0059's own fences already cover the models.

- **OQ-8 — Does `groups.blog` become `expandable` now, and with what `expanded_when`?** 0060 shipped it
  `expandable => false` with one entry, exactly as `taxes` did. With three entries it should probably
  expand, but the pattern is awkward: `'blog-posts.*'` alone would collapse the group while an editor
  sits on Tags. **(a) Leave it as 0060 shipped it and revisit once 0062 lands (recommended)** — a
  three-item flat group is perfectly readable, and this avoids two parallel stories editing the same
  group key. **(b)** Make it expandable with a multi-pattern `expanded_when`, which the registry's
  `request()->routeIs()` consumer supports since that method is variadic — **unverified against the
  config's single-string shape**, so it would need a Phase 3 check.

- **OQ-9 — The status badge palette** (**D-19**). The PRD names only the labels. **(a) `zinc` /
  `amber` / `lime` for Draft / Scheduled / Published (recommended)** — extends `UserStatus`'s shipped
  semantics, with `amber` for "pending" rather than `red` for "wrong". **(b)** Any other mapping the
  product owner prefers; it is a one-line `match`.

> ⚠️ **Correction, 2026-08-30 — one question is added and the six above are unaffected.** OQ-4
> through OQ-9 concern the filters' liveness, the page size, the date input, an `arch()` fence, the
> group's `expandable` flag and the badge palette — Epic 5 touches none of them, and **OQ-4 remains
> the open decision with the widest blast radius on this screen**.

- **OQ-10 — Which store language do this screen's *taxonomy* labels resolve in? ✅ RATIFIED 2026-08-30
  — option (a), the store default.** The human confirmed this directly for all five sites at once (the
  list's category cell, the category filter's options, the tag filter's options, the editor's category
  `<select>` options, and `$deletingBlogPostTitle`), consistent with the same answer already given for
  the post title (0079), for 0027's own OQ-10, and for every other "which language does a backend/UI
  artifact default to" question this epic has raised. No longer an adoption pending ratification.

  **The post-title half of this question is already answered and is not re-opened**:
  [0079](0079-blog-post-editor-language-tabs-ui.md) resolves the list's title to the **store default**
  (its Gherkin, its Expected outcome and its disposition table all say so) and opens the editor on the
  **store default's** tab. **Ordering raises no question at all**, because **D-4** orders by
  `created_at` and never by a translated column. What remains unnamed by *any* story is the language
  the screen's **taxonomy and target labels** resolve in — **five sites, which must all get the same
  answer**: the list's category cell, the category filter's options, the tag filter's options, the
  editor's category `<select>` options, and `$deletingBlogPostTitle`.

  **(a) The store default _(recommended, adopted)_.** Three reasons, none of them novel. It is the one
  language guaranteed to resolve for every row (0070 **Q1(a)**: every entity always holds a
  default-language translation), so a cell or an option can never render blank for a *reachable
  ordinary* reason. It is the answer [0027's OQ-10](0027-products-list-and-editor-ui.md#open-questions)
  received from the human on 2026-08-30 for the structurally identical question on the Products list —
  **and that resolution explicitly covered its `$deletingProductName` too**, on the reasoning that *a
  confirmation naming a record differently from the row above it is worse than either choice alone*,
  which is exactly why the five sites here are bundled into one question. And it matches what 0079
  already decided for the post title on this very screen, so the row's title and the row's category
  resolve consistently.

  **(b) The administrator's UI locale.** Rejected for the reason 0077 and 0027 both give: it conflates
  the two i18n axes [0068](0068-store-languages-catalog-backend.md) draws apart deliberately — the
  **interface** language (ES/EN, an administrator preference) and the **store content** languages
  (open-ended, a catalog property) — and it would make two administrators see different labels on the
  same page.

  **(c) A per-administrator language switcher on the list.** Genuinely useful to a translator auditing
  coverage, **named by nothing in the PRD**, and additive on top of (a) at any time. Not now: this
  screen already carries four `<select>` controls against a recorded Playwright race (**R-1**).

  ⚠️ **Nothing Blog-specific argues against (a)**, and this was checked rather than assumed — the one
  candidate argument, that a *tag* is authored in the store default anyway (0074 **D-7**), points
  toward (a) rather than away from it. **Whatever the answer, it is not derivable from the code**:
  every option compiles and every option renders something plausible, which is the shape this
  project's contracts require to be escalated rather than assumed.

## Provenance

Phase 1 (Three Amigos) debate run on 2026-08-27 with `frontend-expert` (files and approach) and
`frontend-qa` (Gherkin and test design), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate). Both were dispatched concurrently
under an explicit **read-only** instruction — neither wrote any file — which is the
[Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule) applied
at debate time rather than at implementation time. `database-expert` was not convened: this story adds
no schema, no query plan and no index.

Derived from [PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog posts`, the two
post-editor scenarios inside `Feature: Blog tags`, the taxonomy-filter `Scenario Outline`, and Blog
acceptance criteria 1, 3 and 4 — plus the four hand-off items
[0061](0061-blog-posts-core-crud-backend.md)'s Definition of Done addresses to this story by name.

**Four conflicts between the two amigos were resolved by the facilitator rather than left implicit.**

**C-1 — The component namespace and route family.** `frontend-expert` argued `App\Livewire\Blog\Index`
+ route `blog.index`, citing 0060's D-3 as reserving "a bare `blog.index` — the natural name for
0063's post list". `frontend-qa` argued `App\Livewire\BlogPosts\Index` + `blog-posts.index`.
**Resolved in favour of QA's**, on evidence neither amigo cited: 0060's D-3 contains *both* claims, and
its *Rejected* clause names `Blog\Index` as "colliding conceptually with the area" in so many words.
The decision and the rule it generalises — **area name for shared folders, entity name for per-screen
identifiers** — are in **D-2**. `frontend-expert`'s reading is recorded rather than dropped, because
its "the URI should be short" point is real and is what **D-2** pays for.

**C-2 — The lang file.** `frontend-expert` recommended a per-screen `blog-posts.php` following 0060's
**D-8**; 0061's own hand-off instructs this story to extend `blog.php`. `frontend-qa` did not take a
position. **Resolved in favour of the per-screen file** (**D-17**), on the ground that separates the
two: 0061's `blog.php` holds a **domain message** about a rule, while this story produces **screen
copy**, and every precedent in the repo puts screen copy in a per-screen file. 0061's instruction is
recorded as **superseded in writing** rather than silently ignored, per this project's rule for a
later instruction contradicting a settled decision.

**C-3 — The browser test path.** `frontend-expert` left it open ("worth re-litigating"); `frontend-qa`
applied 0060's V-1 ruling and recommended mirrored. **Resolved in favour of mirrored** (**D-21**), and
deliberately **not** re-litigated: 0060 already settled it against the identical evidence, and
[playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#folder-structure) records that the
convention has already lost by default twice.

**C-4 — The restore ability.** `frontend-expert` recommended `blog.delete`; `frontend-qa` recommended
`blog.edit`. **Escalated as OQ-2 rather than resolved**, because the two arguments were genuinely
balanced and the third option neither amigo raised — a proper `BlogPostPolicy::restore()`, Laravel's
own convention — was the most correct answer *and*, at the time, the most expensive, since it meant
editing a shipped policy.

> ✅ **Since answered by story 0061's revision, and the outcome is the argument for escalating.** 0061's
> **D-20** added exactly that fifth `restore` ability, gated on **`blog.edit`**, and shipped
> `RestoreBlogPost` itself — so the expensive option became free to this story, and `frontend-qa`'s
> permission was the right one for a reason neither amigo gave. **Had the facilitator picked either
> recommendation silently, this screen would have shipped a per-row hint asking an ability the action
> does not check** — the enabled-then-refused drift this project's `Gate::allows()`-is-a-hint rule
> exists to prevent. Recorded because the escalation, not the analysis, is what produced the correct
> result.

**Seven findings came from the facilitator's own verification rather than from either amigo**, recorded
as **V-1**–**V-7**. Three changed the document rather than merely supporting it:

1. **`frontend-expert` recorded item ordering in `config/modules.php` as unverified** (its own risk 7,
   stated honestly as "a preference to state and verify at Phase 3"). Verified by reading
   `sidebar-nav.blade.php` directly: `groupBy(..., preserveKeys: true)` plus a `@foreach` preserve
   insertion order, so render order **is** declaration order. That turns **D-16** from an append into
   an **insertion**, and makes item ordering a coordination point with 0062 (**R-9**) rather than a
   free choice.
2. **The `<flux:select>` Playwright race** (**R-1**). Neither amigo surfaced it; it is documented in
   `tests/Browser/SalesRegionsIndexTest.php`'s own comments as mitigated-but-not-eliminated, with a
   recorded next step. This screen ships four such controls, so it is the story with the largest
   exposure to a known unsolved problem — which is why **OQ-4** exists rather than defaulting to
   `.live`.
3. **`V-5`: the repo has no `#[Url]`, no pagination and no date input at all.** Both amigos proposed
   all three by analogy with 0027, which is itself unimplemented — so three of this story's design
   choices are **first-instance decisions for this codebase**, not applied conventions, and
   **D-4**/**D-5**/**D-8** now say so rather than implying precedent.

**One question this debate answered that belongs to the product owner rather than to either amigo**:
the canonical term for a blog entry, an open `TODO (product owner)` in
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md)'s glossary. Answered **"post"**
(**D-22**), ratifying what the PRD and all four Epic 4 stories already do, with "artículo" recorded as
Spanish copy rather than as a second domain term.

**One thing this story deliberately does *not* inherit from its closest sibling, stated so its absence
is not read as an oversight:** 0027's `SearchableMultiSelect` embed. The products editor uses 0022's
component for sales regions, and a reader moving from that file to this one will look for it in the
tag field. It is absent for a **contractual** reason, not a stylistic one — 0022's resolver interface
is id-keyed and its `resolveSelected()` throws on any id it cannot vouch for, so a tag that does not
exist yet is unrepresentable in it. **D-10** records the reasoning, because the alternative — widening
a confirmed contract that three other stories bind to — is a decision belonging to 0022's story rather
than to this one.
