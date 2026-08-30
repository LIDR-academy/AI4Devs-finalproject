# [0079] Blog post editor — language tabs (frontend)

## Description
Retrofit story [0063](0063-blog-posts-list-editor-ui.md)'s Blog post list and routed editor page so a
post's **title** and **body** are authored per active store language through language tabs, satisfying
[PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization)'s *"each active store language
surfaces as a tab in the Product and **Blog editors**"* and its `Switching an editor's language tab
switches only translatable fields` scenario. Consumes story
[0078](0078-translatable-content-retrofit-blog-posts-backend.md)'s retrofit — which **deletes the
`blog_posts.title` and `blog_posts.body` columns this screen currently reads** — and story
[0071](0071-product-categories-language-tabs-ui.md)'s shared tab-strip pattern, both unchanged.

It also adds **one backend action**, `App\Actions\Blog\SetBlogPostTranslation`, so that writing a
non-default-language translation is authorized and validated at **two independent layers** — the
component *and* a self-sufficient domain action — per the master pattern 0071's **D-13** establishes
and names this story by number.

**This is the last of Epic 5's 14 stories and the fourth consumer of a pattern three siblings already
refined.** Almost nothing here is new mechanism; what *is* new is named in
[What is genuinely this story's](#what-is-genuinely-this-storys-and-not-a-siblings).

> ## ⛔ Read this first — the brief that opened this debate contained a false premise, and it is corrected here rather than propagated
>
> The coordinator's brief stated that *"slug is per-language-unique and **administrator-facing** (not
> auto-derived the way 0061 originally had it)"*. **That is false against 0078 as written**, verified
> by reading the file rather than by trusting the summary:
>
> - 0078 **D-4** relocates 0061's `saving` hook **onto `BlogPostTranslation`**, guarded on
>   `isDirty('title')`, and derives each language's slug from **that language's own title**.
> - `BlogPostTranslation` declares **`#[Fillable(['title', 'body'])]`** — `slug` is omitted
>   *"because it is **derived**"* (0078, Files to create/modify).
> - 0078's own Gherkin scripts **"A blog editor cannot supply a slug directly"** → *"the stored slug is
>   the one derived from the title, not the one submitted."*
> - 0063 renders **no slug field of any kind** today (verified: `grep -i slug` over 0063 returns three
>   hits, none of them a form control).
>
> What 0078 landed on is *"the same slug mechanism 0061 had, moved down a table and scoped per
> language."* An administrator-facing slug is 0061 **OQ-2** option **(c)**, which that story
> **explicitly did not recommend** and which nothing has since adopted. The likely source of the
> confusion is that 0078 *did* change the slug's **uniqueness scope** (global → per store language) and
> *did* give the validation trait its first `slugRules()`, which reads like "the slug became a real
> field" without being that.
>
> **This matters structurally, not pedantically.** It removes an input, a `$slugs` state array, 0077's
> entire blur-prefill affordance (**D-9** there) and 0077's `'' → NULL` slug-uniqueness trap
> (**D-4** there) from this story's scope — and it creates a problem no sibling has: **a refusal about
> a slug has no slug field to land on** (**D-2**, **Q-2**).
>
> Per this project's rule that [a second-hand claim is a flag that nobody checked](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24),
> this is recorded as a correction with its evidence rather than silently worked around. **Both amigos
> were asked to challenge it independently and both confirmed it against the files.**

> **Nothing this story depends on exists in code.** Verified against the live tree at authoring time:
> `app/Livewire/` holds `Actions, Media, Roles, SalesRegions, Settings, Users` and no `BlogPosts/`;
> `app/Models/` holds `Media, Role, SalesRegion, User` and no `BlogPost` or `StoreLanguage`;
> `app/Actions/` holds `Auth, Fortify, Media, Roles, SalesRegions, Users` and **no `Blog/`**;
> `app/Concerns/` holds six validation traits and no `HasTranslations`; `lang/en/` holds
> `media.php, navigation.php, roles.php, sales-regions.php, users.php` and no `blog*.php`;
> `routes/` holds `roles, sales-regions, settings, users, web` and no `blog-posts.php`;
> `resources/views/components/` holds nine files and **no `language-tab-strip.blade.php`**.
> `composer.json` requires **`livewire/flux` (free) with no `livewire/flux-pro`**. There is **no
> `vendor/` directory**, so nothing below was settled by executing Laravel, Livewire, Alpine or Flux
> code. Stories 0020, 0021, 0058, 0059, 0060, 0061, 0062, 0063, 0068, 0070, 0071, 0074 and 0078 are
> **all Phase 1 files**. **Phase 3 must re-verify every signature named here against `HEAD` before
> writing a line** — the [deferred-findings failure mode](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23),
> at this epic's widest exposure yet: **thirteen unshipped stories** (**R-12**).

## Type
frontend | includes database-expert: **no** | consumes **0078** (the retrofit), **0071** (the tab strip),
**0070** (the mechanism), **0068** (`StoreLanguage`), **0063** (the screen), **0061**/**0059**/**0058**
(the domain), **0021** (the WYSIWYG), **0024** (the sanitizer, transitively)

> **On the classification — settled, not re-escalated.** This story stays **frontend** while adding one
> `app/Actions/Blog/` class, which is the shape 0071, 0073, 0075 and 0077 all ship. The coordinator has
> fixed this and the human has already answered it once for this family; it is recorded rather than
> re-opened. The action is a thin, self-authorizing, self-validating wrapper over a primitive 0070
> already ships — no model, migration, schema, route, policy or permission change, so
> `includes database-expert` stays **no**. Splitting would put the screen and the guard it depends on in
> different stories.
>
> ⚠️ **One thing Phase 2 should notice anyway, because it is worse here than in any sibling:** this
> story's action is the family's **second multi-field** one *and* the first whose validation depends on
> a column living on a **different table** (0078's **R-9**), which is a larger backend surface inside a
> frontend-classified story than 0071/0073/0075 carry. It is still not a *database* surface.

## Three Amigos participants

`product-owner` (facilitator) + `frontend-expert` + `frontend-qa`, per
[workflow.md](../../docs/workflow.md#task-classification-rule)'s Frontend classification. **Both amigos
were dispatched as real subagent calls and both returned full contributions.** Their material is
reflected below, including **four points where the facilitator corrected or overruled a contribution**
(**V-1**–**V-4**) and **six points where the two converged independently**, which is the strongest
signal in this debate. See [Provenance](#provenance).

## 1. Refined user story

> **As** a blog editor publishing in more than one language,
> **I want** each post's title and body to be authored per active store language through tabs inside
> the one post editor, with the post's category, status, publication date and tags shown once outside
> them,
> **so that** I can translate a post without leaving the screen, and a language I have not written yet
> is visibly empty rather than silently pre-filled with content I never wrote.

> **As** the engineer closing out Epic 5,
> **I want** the fourth and final language-tabs screen to *consume* the pattern three siblings already
> refined rather than re-derive any part of it,
> **so that** the one thing this story genuinely adds — a two-field panel around a `wire:ignore`d
> rich-text region, on a screen whose slug has no field and whose validation reads a column on another
> table — is the only thing anybody has to review carefully.

**Scope fence — this story ships no schema and no route.** No migration, no model, no column, no
policy, no permission, no `config/modules.php` entry, no route. It widens two Livewire components and
two Blade views, **adds one domain action**, **consumes** 0071's shared tab strip, and appends one lang
group.

**Scope fence — this story is not the 0063 amendment.** 0078's technical task 1 assigns the
coordinator *"one coherent amendment covering all three Epic 5 taxonomy/content retrofits at once"* for
0063. That amendment is **not written here** (this story edits no other story's file), and its scope is
**larger than 0078's own R-1(a) states** — see **R-1**, which names a fourth break site 0078 misses.

## Gherkin — 2. Detailed acceptance criteria (Given/When/Then)

Every scenario opens with a named business-role actor — **"a blog editor"**, the actor 0061, 0063 and
0078 all use, from the PRD's own Epic 4 scenarios — and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Blog post content authored per store language

  # --- The tabs themselves ---

  Scenario: A blog editor sees one tab per active store language
    Given a blog editor, with Spanish and French active as store languages
    When they open a blog post in the editor
    Then a tab is offered for Spanish and a tab is offered for French

  Scenario: A removed store language is offered no tab
    Given a blog editor, with French removed as a store language
    When they open a blog post in the editor
    Then no French tab is offered

  Scenario: The default store language's tab is the one shown first
    Given a blog editor, with Spanish as the store default and French also active
    When they open a blog post in the editor
    Then the Spanish tab is the one shown

  Scenario: A store with a single active language still presents a coherent editor
    Given a blog editor, with Spanish as the only active store language
    When they open a blog post in the editor
    Then the title and body render without an unusable tab strip

  # --- What is inside a tab and what is not ---

  Scenario: The post's shared fields are presented once, not once per language
    Given a blog editor, with three active store languages
    When they open a blog post in the editor
    Then the category, status, publication date and tags are each offered exactly once

  Scenario: Switching tabs leaves the post's shared fields alone
    Given a blog editor with a post open in the editor
    When they switch to the French tab
    Then the category, status, publication date and tags are unchanged

  Scenario: Switching tabs stores nothing
    Given a blog editor with a post open in the editor
    When they switch to the French tab
    Then the post's stored content is unchanged in every store language

  # --- Reading a translation ---

  Scenario: A tab shows the title authored in its own language
    Given a blog editor, with a post titled "Botas de invierno" in Spanish and "Bottes d'hiver" in French
    When they switch to the French tab
    Then the title field shows "Bottes d'hiver"

  Scenario: A tab shows the body authored in its own language
    Given a blog editor, with a post whose body is written in Spanish and in French
    When they switch to the French tab
    Then the rich-text editor shows the French body and no longer the Spanish one

  Scenario: An untranslated language's tab shows empty fields rather than the fallback
    Given a blog editor, with a post written in Spanish only
    When they switch to the French tab
    Then the title and body fields are empty rather than showing the Spanish content

  Scenario: An untranslated language's tab says the post is not yet translated
    Given a blog editor, with a post written in Spanish only
    When they switch to the French tab
    Then they are told the post has no content in that language yet

  Scenario: A field absent in one language opens empty while its sibling opens filled
    Given a blog editor, with a post whose French title exists and whose French body does not
    When they switch to the French tab
    Then the French title is shown and the body field is empty rather than showing the Spanish body

  Scenario: Unsaved text on a hidden tab survives switching tabs
    Given a blog editor who has typed "Bottes d'hiver" on the French tab
    When they switch to the Spanish tab and back to the French tab
    Then the French tab still shows "Bottes d'hiver"

  # --- Writing a translation ---

  Scenario: A blog editor translates a post into an additional language
    Given a blog editor, with a post written in Spanish only
    When they save the post with a French title and body entered on the French tab
    Then the post carries a French translation alongside its Spanish one

  Scenario: A blog editor corrects a title in one language only
    Given a blog editor, with a post titled in both Spanish and French
    When they save the post with the French title changed
    Then the French title is changed and the Spanish title is unchanged

  Scenario: Creating a post records the content entered on the default language tab
    Given a blog editor holding the blog create permission
    When they save a new post with a title and body entered on the default language tab
    Then the post is created holding one translation, in the default store language

  Scenario: Saving an untranslated tab without filling it in creates no translation
    Given a blog editor viewing a post's empty French tab
    When they save the post without entering any French content
    Then the post still holds no French translation

  # --- The derived slug ---

  Scenario: Translating a post derives that language's slug from that language's title
    Given a blog editor, with a post written in the default store language
    When they save the post with "Bottes d'hiver" entered on the French tab
    Then the post's French slug is derived from that French title

  Scenario: Retitling a post in one language leaves another language's slug untouched
    Given a blog editor, with a post titled in both Spanish and French
    When they save the post with only its French title changed
    Then the Spanish slug is unchanged

  Scenario: A blog editor is offered no way to type a slug
    Given a blog editor, with French active as a store language
    When they open a blog post in the editor
    Then no slug field is offered on any language tab

  # --- Requiredness, per tab ---

  Scenario: The default store language's title is required
    Given a blog editor editing a blog post
    When they save the post with the default language's title left blank
    Then they are shown a validation message on that tab's title field

  Scenario: A title is required once a language has been written in at all
    Given a blog editor who has entered a French body and left the French title empty
    When they save the post
    Then they are shown a validation message on the French tab's title field

  Scenario: Emptying a language that was already translated is refused
    Given a blog editor, with a post already translated into French
    When they save the post with the French title and body both cleared
    Then they are shown a validation message on the French tab's title field

  Scenario: Publishing a post needs a body only in the default store language
    Given a blog editor, with a post whose default-language body is written and whose French body is empty
    When they save the post as published
    Then the save is accepted

  Scenario: Publishing a post with no body in the default store language is refused
    Given a blog editor, with a post whose default-language body is empty
    When they save the post as published
    Then they are shown a validation message on the default tab's body field

  Scenario: Two posts may share a title within one store language
    Given a blog editor, with a post titled "Resumen semanal" in the default store language
    When they save another post with the same title on that same tab
    Then the save is accepted, because a post title carries no uniqueness rule

  # --- A refusal the editor is not looking at ---

  Scenario: A refusal on a hidden tab brings that tab into view
    Given a blog editor viewing the Spanish tab, having left the French title blank beneath a French body
    When they save the post
    Then the French tab is brought into view carrying the validation message

  Scenario: A tab carrying a refusal is marked in the tab strip
    Given a blog editor whose save was refused because of the French tab's title
    When they switch away to the Spanish tab
    Then the French tab is still marked as carrying a problem

  Scenario: A refusal in one language leaves every other language unwritten
    Given a blog editor who has entered a valid Spanish title and an invalid French one
    When they save the post
    Then neither the Spanish nor the French content is changed

  # --- Content safety ---

  Scenario: A body written in a non-default language is stored safely
    Given a blog editor on a post's French tab
    When they save a French body containing a script tag
    Then the stored French body holds no script tag

  # --- The list, which has no tabs ---

  Scenario: The list shows each post's title in the store's default language
    Given a blog editor, with a post titled "Botas de invierno" in Spanish, the store default
    When they open the blog posts screen
    Then the post is listed as "Botas de invierno"

  Scenario: A post with no title in the store default is listed without one
    Given a blog editor, with a post holding no title in the store default language
    When they open the blog posts screen
    Then the post is listed with a placeholder in place of a title and no error is raised

  # --- Authorization, unchanged in kind ---

  Scenario: An administrator who may only view the blog cannot author a translation
    Given a signed-in administrator holding only the blog view permission
    When they open a blog post in the editor
    Then the attempt is refused

  Scenario: A blog editor needs no store-language permission to author a translation
    Given a blog editor holding the blog edit permission and no store language permissions
    When they save a post with a title entered on the French tab
    Then the translation is stored

  # --- The backend layer, which protects callers that are not this screen ---

  Scenario: A caller without the blog edit permission cannot write a translation directly
    Given an administrator holding only the blog view permission
    When the translation writer is invoked directly to set a post's French title
    Then the attempt is refused and no translation is stored

  Scenario: A direct caller cannot store a blank title
    Given a blog editor holding the blog edit permission
    When the translation writer is invoked directly with a blank French title
    Then the attempt is refused and no translation is stored

  Scenario: A direct caller's body is sanitized before it is stored
    Given a blog editor holding the blog edit permission
    When the translation writer is invoked directly with a French body containing a script tag
    Then the stored French body holds no script tag

  Scenario: A direct caller may store a translation with no body at all
    Given a blog editor holding the blog edit permission, with a published post
    When the translation writer is invoked directly with a French title and no French body
    Then the translation is stored, because a body is required only in the default store language
```

> **Three scenarios deliberately *not* scripted**, per
> [rule 6](../../docs/testing/frontend/gherkin-guidelines.md#6-no-ghost-scenarios) (no ghost scenarios):
>
> - **"a blog editor removes a translation."** 0071's **Q-1** resolved **(a) — no removal** and 0077's
>   **Q-4** and **D-18** decide it identically. There is no such behaviour to script.
> - **"a blog editor reads content held in a removed store language."** The data survives (0068 **D5**,
>   0070 **D-6**) but no screen offers a surface for it (**D-5**), exactly as 0071 **D-5** and 0073
>   decide. Scripting it would assert a feature every sibling declines to build.
> - **"two posts collide on a slug."** ⛔ **Deliberately unscripted because the answer is unknown** —
>   0061's **OQ-2** is open, and the two candidate outcomes produce *opposite* scenarios (silent
>   success with a suffixed slug, versus a refusal with nowhere to render). See **R-4** and **Q-2**;
>   writing either one now would bake in a guess.

## Files to create/modify

### Create

| Path | Change |
| --- | --- |
| `app/Actions/Blog/SetBlogPostTranslation.php` | **New — layer 2.** The self-sufficient translation writer (**D-8**). `app/Actions/Blog/` is the **area** folder 0058 **D-14** established and that 0061's five post actions and 0078's backfill already occupy — *not* an entity folder. This follows 0073's precedent, not 0071's. |
| `tests/Feature/Blog/SetBlogPostTranslationTest.php` | **New.** **Direct-call** tests, with **no `Livewire::test()` anywhere in the file** — the layer a component test structurally cannot prove. |
| `tests/Feature/Blog/BlogPostEditorLanguageTabsTest.php` | **New.** Component-level tab behaviour and the per-tab state machine (**D-10**). |
| `tests/Feature/Blog/BlogPostEditorTranslationValidationTest.php` | **New.** Per-language requiredness, the default-only body rule, the refusal-routing and the error-key adapter. |
| `tests/Browser/BlogPosts/EditorLanguageTabsTest.php` | **New — mirrored subfolder**, per 0063 **D-21** and 0071 **D-9**. Everything that can fail silently lives here. |

**No new Blade component.** `resources/views/components/language-tab-strip.blade.php` is **0071's**;
this story is its **fourth** consumer and must not fork, copy or widen it (**D-5**).

### Modify

| Path | Change |
| --- | --- |
| `app/Livewire/BlogPosts/Editor.php` | **0063's.** `public string $title` / `$body` → `public array $titles` / `$bodies` keyed by store-language id; adds `$languages`, `$defaultLanguageId`, `$originalTranslatedLanguageIds`, `$activeLanguageId`, `setActiveLanguageTab()`; `mount()` hydrates from raw rows; `save()` gains `SetBlogPostTranslation` plus the `title`/`body` → `titles.{defaultId}`/`bodies.{defaultId}` adapter. See **D-3**, **D-6**, **D-8**, **D-9**, **D-14**. |
| `resources/views/livewire/blog-posts/editor.blade.php` | **0063's.** The single title input and single WYSIWYG become `<x-language-tab-strip>` plus one panel per active language, each holding a title input and its **own** `WysiwygEditor` instance, all mounted and hidden with `x-show` (**D-4**). Category, status, date and tags move **outside** the strip if they are not already. |
| `app/Livewire/BlogPosts/Index.php` | **0063's.** `loadPosts()` / the list query rewritten against the translated schema — this is a **three-retrofit** rewrite, not just this story's slice (**D-7**, **R-1**). |
| `resources/views/livewire/blog-posts.blade.php` | **0063's.** The list's title cell gains an em-dash branch for a `null` resolution. |
| `lang/en/blog-posts.php`, `lang/es/blog-posts.php` | **0063 creates them** (its **D-17**); this story appends one `editor.tabs.*` group. Key-for-key identical. |
| `tests/Feature/Blog/BlogPostsEditorTest.php`, `BlogPostsEditorRenderingTest.php`, `BlogPostsIndexQueryTest.php`, `BlogPostsIndexRenderingTest.php` | **0063's** — only where their own cases assert against the dropped `title`/`body` columns or the single-instance editor. Disposition table below. |

> ⚠️ **`lang/*/navigation.php` and `config/modules.php` are untouched** — 0063 already registers
> `items.blog_posts` (its **D-16**), and adding tabs changes no route and no registry entry.

### Deliberately not touched

| File | Owner |
| --- | --- |
| `resources/views/components/language-tab-strip.blade.php` | **0071** — consumed, never edited (**D-5**) |
| `app/Concerns/HasTranslations.php`, `app/Actions/Translations/SetTranslation.php` | 0070 — consumed, never re-implemented. `SetTranslation` is reached **only** from inside `SetBlogPostTranslation`, never from a component (**D-8**) |
| `app/Models/BlogPost.php`, `BlogPostTranslation.php`, `StoreLanguage.php` | 0078 / 0068 |
| `app/Concerns/BlogPostValidationRules.php` | 0061, re-scoped by **0078**; this story is a **consumer** and adds no method — but see **Q-1**, which is the one place that may not hold |
| `app/Actions/Blog/{Create,Update,Delete,Restore}BlogPost.php`, `SyncBlogPostTags.php`, `BackfillBlogPostTranslations.php` | 0061 / 0078 — signatures unchanged per 0078 **D-12**. ⚠️ **This row no longer covers the whole folder** — this story *adds* `SetBlogPostTranslation.php` beside them |
| `app/Actions/Blog/FindOrCreateBlogTag.php`, `{Create,Rename,Delete}BlogTag.php` | 0059 / 0074 — **never called directly** (0061's hand-off forbids it). But see **R-3**, an unresolved cross-story gap |
| `app/Actions/Products/SanitizeProductDescription.php` | 0024 — the **only** class in the app that touches the HTML sanitizer; **consumed by injection**, never re-implemented (**D-8**, **V-1**) |
| `app/Livewire/Components/WysiwygEditor.php`, `app/Livewire/Media/Gallery.php` | 0021 / 0020 — embedded N times, **never edited** (**D-4**) |
| `app/Policies/BlogPostPolicy.php`, `database/seeders/RolePermissionSeeder.php` | 0061 — five abilities, catalog stays at **42** (**D-18**) |
| `routes/blog-posts.php`, `config/modules.php`, `lang/*/navigation.php` | 0063 — no route, no registry entry, no sidebar change |
| `config/store-languages.php` | 0078 already appends `blog_post_translations` |
| The delete-confirmation modal and the trashed-posts section | 0063 **D-12**/**D-15** — untouched by tabs |

### Layer 2 — `App\Actions\Blog\SetBlogPostTranslation`

```php
namespace App\Actions\Blog;

final class SetBlogPostTranslation
{
    use BlogPostValidationRules;

    public function __construct(
        private readonly SanitizeProductDescription $sanitizeProductDescription,  // 0024's — V-1
        private readonly SetTranslation $setTranslation,                          // reached from NOWHERE else
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Authorize, validate and persist one blog post's translatable content in one store language.
     *
     * NON-DEFAULT languages only. The default language is written by CreateBlogPost /
     * UpdateBlogPost, whose signatures 0078 D-12 keeps unchanged.
     *
     * There is deliberately NO $slug parameter: BlogPostTranslation's saving hook derives it
     * from $title the instant SetTranslation's updateOrCreate() calls save() (0078 D-4).
     *
     * @throws AuthorizationException  when the actor lacks blog.edit
     * @throws ValidationException     keyed "titles.{$language->id}" / "bodies.{$language->id}"
     */
    public function __invoke(
        BlogPost $blogPost,
        StoreLanguage $language,
        string $title,
        ?string $body = null,
    ): BlogPostTranslation {
        $this->logRefusedPrivilegedAttempt->authorize('update', $blogPost, 'blog_post');

        $title = trim($title);
        $body = $body === null ? null : $this->sanitizeProductDescription($body);  // BEFORE validate() — D-8

        $id = $language->id;

        Validator::make([
            "titles.{$id}" => $title,
            "bodies.{$id}" => $body,
        ], [
            "titles.{$id}" => $this->titleRules($id),        // 0078 D-11: language param, NO uniqueness — D-13
            "bodies.{$id}" => $this->translatedBodyRules(),  // NOT bodyRules($status) — D-11, Q-1
        ])->validate();

        return ($this->setTranslation)($blogPost, $language, [
            'title' => $title,
            'body' => $this->nullIfBlank($body),            // '' must never reach the column — D-8
        ]);
    }
}
```

Following 0071 **D-13**'s master contract and 0077 **D-19**'s named-parameters rule, with the
Blog-side specifics **verified against 0061/0078 rather than ported from a sibling**. The seven
properties, and the two places this action is *unlike* every sibling, are in **D-8**.

### The component surface, diffed against 0063's

```php
namespace App\Livewire\BlogPosts;

class Editor extends Component
{
    use BlogPostValidationRules;   // 0078-widened: titleRules(string $storeLanguageId)

    /** @var array<string, string> keyed by store_language_id; '' means "not typed". NEVER null. */
    public array $titles = [];     // REPLACES 0063's `public string $title = ''`
    /** @var array<string, string> keyed by store_language_id; bound to N WysiwygEditor instances. NEVER null. */
    public array $bodies = [];     // REPLACES 0063's `public string $body = ''`

    /** @var array<int, array{id: string, code: string, name: string, isDefault: bool}> */
    #[Locked] public array $languages = [];                    // ACTIVE only, default first (D-5)
    #[Locked] public string $defaultLanguageId = '';
    /** @var array<int, string> language ids this post already held a translation in, at mount. */
    #[Locked] public array $originalTranslatedLanguageIds = [];  // feeds D-10's blanked branch

    public string $activeLanguageId = '';   // overwritten to a real id before first render (D-5)

    // --- 0063's non-translatable state, entirely unchanged ---
    public string $blogCategoryId = '';
    public string $status = BlogPostStatus::Draft->value;   // plain string, never a typed enum (0061 D-12)
    public string $publishedAt = '';
    public array $tagNames = [];                            // the post's COMPLETE set (0061 D-17)
    #[Locked] public ?string $editingBlogPostId = null;

    public function setActiveLanguageTab(string $languageId): void;   // NEW — no Gate check (D-5)

    public function save(
        CreateBlogPost $c,
        UpdateBlogPost $u,
        SetBlogPostTranslation $t,      // layer 2 — method-injected (D-8)
        LogRefusedPrivilegedAttempt $l,
    ): void;

    // mount / prefill / delete paths keep 0063's signatures.
}
```

⚠️ **`App\Actions\Translations\SetTranslation` must not appear in this component's imports at all.**
It is 0070's deliberately-unguarded persistence primitive. A `SetTranslation` import under
`app/Livewire/` is a Phase 5 review finding and is worth an explicit grep at Phase 4 (0071 **D-13**'s
third non-re-derivable rule).

**This supersedes 0063's committed surface rather than extending it** — `public string $title` and
`public string $body` cannot survive 0078 **D-4** dropping both columns. Recorded as an amendment
needing explicit Phase 2 sign-off, not a silent override (**R-1**).

### What is genuinely this story's, and not a sibling's

Almost every mechanism here is inherited. Four things are not, and they are what Phase 2 should read
closely:

- **A two-field panel wrapped around a `wire:ignore`d region.** 0077 has five fields but only one
  stateful; the taxonomy siblings have one field and none. Blog Posts is the only screen where a
  *partially* filled tab (body typed, title blank) is a reachable, legal-looking state that must be
  refused rather than skipped (**D-10**, and `frontend-qa`'s §7 finding).
- **A translatable field whose refusal has no field to land on.** The slug is derived and rendered
  nowhere, so a slug-uniqueness refusal — if 0061's **OQ-2** resolves that way — must be re-keyed onto
  the title. No sibling has this problem: every one of them has a `name` or `slug` input of its own
  (**D-2**, **Q-2**).
- **A validation rule keyed on a column in another table.** `bodyRules(BlogPostStatus $status)` reads
  `blog_posts.status` while validating `blog_post_translations.body` (0078 **R-9**). Under 0078's
  **Q-1(a)** that rule must bind the **default language only**, which means this action cannot simply
  call it (**D-11**, **Q-1**).
- **N media galleries, not N editors.** 0021 **D4** embeds `<livewire:media.gallery>` *inside*
  `WysiwygEditor`, so N language panels mount N galleries — a cost **no sibling states**, including
  0077, which has the identical exposure (**D-4**, `frontend-expert`'s finding).

## Tests to perform — 3. QA test cases / validation scenarios

`frontend-qa`'s contribution, adopted essentially as delivered, with two facilitator additions marked.

**Calibration:** this story does **not** re-run 0078's, 0070's or 0063's suites one layer up. Those
prove the fallback chain, per-field resolution, the slug-derivation hook, `SetTranslation`'s semantics,
the backfill, the soft-delete reservation, the policy matrix and the publication rules at their own
layers. This story asserts only that the **screen routes into those rules and renders their outcome**.

> **Read before writing any negative-validation test.** 0061's **D-13** makes every action authorize
> *before* it validates, so a direct call with no permitted actor throws `AuthorizationException`,
> **not** `ValidationException`. `actingAs()` an actor holding `blog.edit` first, or the test passes for
> entirely the wrong reason. Inherited from 0078's own blockquote and 0073's.

### The three `Livewire::test()` blind spots — and a conditional fourth

`frontend-qa` confirms this screen lands in **all three** of this repo's recorded blind spots at once,
identically to 0077 and *worse* on one axis:

| Blind spot | Why it bites here |
| --- | --- |
| An uncompiled `wire:click`-style attribute | 0071's strip passes `setActiveLanguageTab` through `{{ Js::from(...) }}`; a silent stringification makes every tab inert with no PHP error, no console error and no failed request — and `Livewire::test()->call('setActiveLanguageTab', $id)` passes throughout |
| A `null`-bound control | **Worse than Products.** 0063 **D-6** already documents six never-`null` bindings; `$title`/`$body` becoming arrays makes the rule bind **2×N** leaves instead of two |
| A `wire:ignore`d region that never updates | 0021 **D9**: no client-side refresh hook. N instances, `x-show` only (**D-4**) |
| ⚠️ *Conditional fourth* — a **client-side slug preview** | Only exists if this story renders one. `Str::slug()` routes through `Str::ascii()` and diverges from any JS slugifier on `ñ`, `ç`, `ü`, `ß` (0077 **D-9**), so a live preview would display one slug while the server stores another. **D-2** declines the live form for exactly this reason; **Q-2** puts the decision to the product owner rather than letting it arrive as a Phase 3 "UX improvement" |

### The single highest-value test in this story

**Opening an untranslated French tab, saving with no French input, must create no French translation
row — and therefore reserve no French slug.**

*Risk if missing:* this is the fallback-leak test every sibling names as its sharpest risk (0071
**D-6**, 0077 **Q-1**), but Blog Posts compounds it in a way no sibling can. Because slug uniqueness is
`(store_language_id, slug)` and the slug is derived the instant a row is written (0078 **D-4**), a
leaked fallback does not merely manufacture a spurious duplicate translation — it **silently squats a
slug slot in a language the post was never meant to occupy**. A second, genuinely-translated post that
later takes the identical French slug is then refused against a translation nobody authored, and the
failure is **delayed, lands on an unrelated post, and carries no diagnostic pointing back at the
cause**. That is the same shape 0078 **D-6** records for the trashed-post reservation.

### Feature — `tests/Feature/Blog/SetBlogPostTranslationTest.php` — layer 2, direct-call only

> **This file must contain no `Livewire::test()` call anywhere.** Its entire purpose is to prove the
> action protects a caller that is **not** this screen. The action is resolved with
> `app(SetBlogPostTranslation::class)`, **never** `new` — three actions gained their first constructor
> dependency in task 0015b and every `new` call site broke at once
> ([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)).

- [ ] An actor holding only `blog.view` throws `AuthorizationException` and writes **nothing** —
      asserted on the row count, not only on the throw. *Why:* the single case proving 0008a's gap is
      closed; a component test cannot show it, and it is the whole reason layer 2 exists.
- [ ] An actor holding `blog.edit` and **zero** `store-languages.*` permissions succeeds (0078 **D-14**).
- [ ] A Super Admin holding zero permission rows succeeds, via `Gate::before`.
- [ ] **Authorization precedes validation** — a blank title from an *unpermitted* actor throws
      `AuthorizationException`, not `ValidationException` (0061 **D-13**'s ordering, at the new action).
- [ ] A blank and a whitespace-only title → `ValidationException` keyed `titles.{languageId}`, no row
      written.
- [ ] **Two posts may share a title within one language → accepted.** *Risk if missing:* **the negative
      control that matters most on this screen.** 0061 **D-10** forbids title uniqueness (a series, a
      "Part 2"), unlike `name` on all three sibling entities — so an author mechanically following
      0071/0077's master pattern adds a uniqueness rule *for consistency* and nothing catches it. This
      is the [`@js()`-cleanup-for-consistency failure mode](../../docs/errors-log.md#two-directive-calls-in-one-blade-component-tags-attribute-string-silently-fail-to-compile--2026-08-26)
      arriving in a validation rule. Both `frontend-qa` and the facilitator flagged it independently.
- [ ] **The action accepts a blank body for any language, unconditionally, regardless of the post's
      `status`** — asserted against a **`Published`** post. *Risk if missing:* this is 0078's backlog
      item 1 arriving as a real defect; see **V-2**, where the first draft of this very action got it
      wrong.
- [ ] A body containing `<script>` is stored **sanitized**, through this path, with no component in the
      loop — proving layer 2 is self-sufficient rather than relying on the component's pass (0078
      **R-8**).
- [ ] **Sanitize runs before validate.** A body consisting *only* of markup the allow-list strips
      sanitizes to empty; on the **default** language of a `Published` post that must be **refused as
      blank**, not accepted as populated. ⚠️ Note this case is *not* reachable through this action
      (which never writes the default language) — it belongs in the component file below, and is listed
      here so the pairing is deliberate rather than an omission.
- [ ] `''` for `$body` persists as `null`, never `''` (**D-8**).
- [ ] The persisted `slug` always equals the derivation of the persisted title — and **the signature
      carries no `$slug` parameter at all**, asserted structurally rather than behaviourally.
- [ ] Re-invoking for the same `(post, language)` **updates rather than duplicates** — one row-count
      assertion, not a re-derivation of `SetTranslation`'s `updateOrCreate`.
- [ ] An **inactive** store language is still writable through the action. *Risk if missing:* someone
      adds a defensive `is_active` guard and silently defeats 0070 **D-6**. Tab *rendering* filters on
      active (**D-5**); the write path must not.
- [ ] The error keys are `titles.{languageId}` / `bodies.{languageId}`, asserted **literally** and
      derived from `$language->id` inside the action, never accepted as a parameter.
- [ ] Every refusal logs once with `target_type: 'blog_post'`, per 0061 **D-13**'s recipe.
- [ ] The action is **resolved from the container, never `new`-ed**, in every test.
- [ ] ⚠️ **Architecture guard:** `App\Actions\Translations\SetTranslation` appears in **no** import
      under `app/Livewire/` — **one `arch()` rule per namespace, never `expect([...])`**, and proven
      able to fail, per [the vacuous-`arch()` entry](../../docs/errors-log.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18).

### Feature — `tests/Feature/Blog/BlogPostEditorLanguageTabsTest.php`

- [ ] The tab set equals `StoreLanguage::active()`, default first — asserted as a **count** against an
      N-active-language fixture, never "contains Spanish and French" (**D-15**).
- [ ] Loading a post hydrates **both** fields for **every** language, asserted field-by-field rather
      than spot-checked — with two fields, a per-*row* swap and a per-*field* swap are hard to separate.
- [ ] **The fallback does not leak into either edit field.** A post written in Spanish only, opened on
      the French tab, renders `''` for title **and** `''` for body — never the Spanish values. *Risk if
      missing:* the highest-value test above.
- [ ] **Per-field, not per-row, at the form layer:** a post whose French title exists and whose French
      body does not renders the French title **and an empty body** — never the Spanish body. *Why:* the
      property no single-field sibling can demonstrate, and the form-layer counterpart of 0078's
      **D-10**.
- [ ] Switching tabs writes **nothing** — post count, `blog_post_translations` count and the target's
      `updated_at` all unchanged. *Risk if missing:* an implementation that "saves the current tab
      before switching" turns every tab click into a partial write, which no atomicity test can catch
      because the writes are separate requests.
- [ ] The whole set of non-translatable properties is byte-identical across a tab switch, snapshotted
      and compared **as one array** — never per-field, or the list silently stops covering whatever a
      later story adds.
- [ ] Saving with the default tab filled and one other language filled calls the default-language
      action **and** `SetBlogPostTranslation` — asserted as **two separate calls with two separate
      arguments**, never one call carrying both.
- [ ] Editing **only** the French tab calls `SetBlogPostTranslation` for French and does **not** rewrite
      the default row. *Risk if missing:* the save collapses back to "always rewrite the default",
      silently corrupting a deliberately French-only edit.
- [ ] **Tamper:** a payload carrying a language key that is inactive, nonexistent or never rendered
      writes **no row for it**. Assert the exact set of persisted `store_language_id` values **equals**
      the active set — `toContain` is not sufficient. *Risk if missing:* the wrong loop is an
      arbitrary-row-insert primitive into `blog_post_translations`, bounded only by the FK.
- [ ] `$originalTranslatedLanguageIds` is `#[Locked]` — a forged value must not turn a **blanked** tab
      into an **untouched** one, which would silently destroy content (**D-10**).
- [ ] A store with exactly **one** active language renders coherently — degenerate, cheap, and the state
      every fresh install starts in.
- [ ] The store default changes under an existing catalog: a Spanish-only post, French promoted to
      default, editor reopened → the French tab renders blank without throwing and the Spanish tab still
      shows its content (0070 **R-2**).
- [ ] A forged `setActiveLanguageTab()` against an unknown or inactive language id fails cleanly and
      never reaches `SetBlogPostTranslation` with `null`.

### Feature — `tests/Feature/Blog/BlogPostEditorTranslationValidationTest.php`

- [ ] **D-10's three states, one test each.** *Untouched* (title and body blank, never translated) → no
      row, no error, save succeeds. *Engaged* (either field non-blank) → title required for that
      language. *Blanked* (both blank, previously translated) → refused, keyed `titles.{id}`, row
      intact. *Risk if missing:* untouched and blanked look identical in the payload and differ only by
      `$originalTranslatedLanguageIds`, so one implementation satisfies whichever case is tested.
- [ ] **The two-field engagement case, unique to this screen:** a tab with **body filled and title
      blank** is *engaged*, therefore **refused for a missing title** — never silently skipped as if
      nothing was typed. `frontend-qa`'s finding; no single-field sibling can demonstrate it.
- [ ] The **default** language's title is refused when blank, unconditionally (0070 **Q1(a)**).
- [ ] **The default-only body rule, as a pair.** *(a)* A `Published` post with a blank **default** body
      → refused. *(b)* A `Published` post with a written default body and a **blank French** body →
      **accepted**. *Risk if missing:* (b) is the retroactive-unpublish problem 0078's **Q-1** was raised
      to avoid, and 0078's backlog item 1 names this exact test by name.
- [ ] Promoting a bodiless draft to `Published` is refused for the **default** language's bodilessness
      only — a bodiless **French** tab never blocks promotion. (Retarget of 0063's existing case.)
- [ ] **A refusal keyed to a non-visible tab.** Spanish tab active, French tab engaged-and-blank-titled,
      save → assert **both** `assertHasErrors(['titles.'.$frenchId])` **and** that `$activeLanguageId`
      has moved to French. *Risk if missing:* the textbook "the save silently did nothing" bug — 0018's
      finding A-1 and its B1 arriving together. **The single highest-value component test.**
- [ ] **A default-language refusal renders on the default tab's field.** Force `UpdateBlogPost` to throw
      its `title`-keyed `ValidationException` and assert the component surfaces it as
      `titles.{defaultId}` (**D-9**'s adapter). *Risk if missing:* a race-path refusal renders nowhere
      and the editor sees a save that did nothing.
- [ ] A refused save writes nothing across **three** tables — `blog_posts`, `blog_post_translations`
      (asserted as an exact per-language row set) and `blog_post_tag`.
- [ ] A `<script>` typed into the **French** body is stored sanitized, **through the component** —
      proving the wiring reaches the sanitizer on a non-default tab (0078 **R-8**). One test only; the
      allow-list, scheme rules and idempotence are 0024's.
- [ ] **Sanitize-before-validate on the default language:** a default-language body consisting only of
      stripped markup sanitizes to empty and is **refused as blank** on a `Published` post.
- [ ] An actor holding only `blog.view` cannot write **any** tab's translation — asserted **at the
      component**, with the same case asserted **at the action** in the direct-call file. The pair is
      deliberate: it is what proves the two layers are independent rather than one check observed twice.
- [ ] ⛔ **The slug-collision block is `pending(0061 OQ-2)` and must not be written against a guess.**
      Both candidate outcomes produce opposite tests — see **R-4** and **Q-2**.

### Rendering — extend `tests/Feature/Blog/BlogPostsEditorRenderingTest.php`

- [ ] **All N panels are present in the DOM simultaneously** — the assertion that catches someone
      "optimising" `x-show` into `@if` (**D-4**). Assert `data-test="language-panel-{id}"` exists for a
      **non-active** language.
- [ ] N `WysiwygEditor` instances render, one per active language, each with its own `wire:key`.
- [ ] **No `<livewire:media.gallery>` tag appears in any view this story writes** — still true, and
      still worth asserting, but ⚠️ **it no longer means what 0063 **D-14** meant by it**: N galleries
      now mount *transitively*, one inside each editor (**D-4**).
- [ ] The non-translatable controls — category, status, publication date, tag field — render **exactly
      once**. Three rules make this assertion real rather than vacuous: match on the `data-test` hook
      **including the closing quote** (the [`<ui-checkbox` prefix trap](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21));
      use a **three-language** dataset, because at N=1 the assertion cannot fail and at N=2 an off-by-one
      is indistinguishable from a wrapper; and assert the translatable hooks against the **derived**
      language count, never a literal.
- [ ] Every translatable control sits **inside** its `language-panel-{id}` and every non-translatable
      one **outside** — which makes "outside the tabs" a checked property rather than a coincidence.
- [ ] An untranslated tab renders empty fields **plus** its "not yet translated" hint — the DOM
      counterpart of the no-leak test.
- [ ] A tab carrying an error renders its marker on the **tab header**, and the marker is **absent** for
      clean languages.
- [ ] **No slug input renders on any tab** — the DOM assertion for **D-2**.
- [ ] The list's title cell renders the **resolved** title and an em dash when it resolves to `null`.

### Browser — `tests/Browser/BlogPosts/EditorLanguageTabsTest.php`

Per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md), browser tests earn their
place only where the real-DOM/JS round trip **is** the risk. Every test closes with
`->assertNoJavaScriptErrors()`. **`->waitForEvent('networkidle')` is banned outright** — read
`[wire:snapshot]` before reaching for a short bounded `->wait(n)` with a stated reason.

- [ ] **B-1 — a real click on a tab actually switches it.** The compiled-attribute case: the shape that
      made every Sales Regions row toggle a dead no-op, and which `Livewire::test()` passes against
      throughout.
- [ ] **B-2 — the body swaps in the `wire:ignore`d region.** Fixture: the **default** body carries a
      unique marker and the **French** body carries a *distinct* one; **both must be populated, or both
      halves below are vacuously satisfiable.** Three assertions: the region scoped to the French
      panel's hook **contains** the French marker; that same region **does not contain** the default
      marker — ***this half is the actual test***, since an implementation that appends, renders both,
      or leaves a stale copy passes the first half while being wrong; and no JS errors.
- [ ] **B-3 — a third tab with a title but no body renders an empty region**, never the default body —
      the per-field rule proven at the level where a stale `wire:ignore`d region is visible at all.
- [ ] **B-4 — unsaved input survives a switch, read off the DOM**, not off the property. Under `x-show`
      the input is never unmounted, so this is a **regression guard on the markup** (an `x-show`
      expression matching the wrong tab id renders plausibly and is invisible to `Livewire::test()`).
- [ ] **B-5 — a typed draft survives a switch past the 400 ms debounce.** Uses a short bounded
      `->wait(1)` — the [documented carve-out](../../docs/testing/frontend/playwright-setup.md#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded)
      in its strongest form, because the reason is a **contract**: 0021 **D9** debounces `$wire.set` at
      400 ms. The comment must say exactly that.
- [ ] **B-6 — a non-active tab's refusal is visible without further clicking.**
- [ ] **B-7 — a real `fill()` on a non-default tab followed by a real Save persists that language's
      content** — the new code path this story adds.

### Which of 0063's own test cases stop being valid

`frontend-qa`'s disposition, adopted as delivered.

| 0063 case | Disposition |
| --- | --- |
| "A blank title is refused with the message keyed to that field" | **Invalidated — rekey.** `title` → `titles.{languageId}`, plus the default-language adapter (**D-9**). |
| "`Draft` + empty body accepted; `Published`/`Scheduled` + empty body refused" (0063 **D-9**, three cases) | **Invalidated — rescope** to *"the **default language's** body"*, **and add** the new case: a non-default tab's empty body on a `Published` post is **accepted**. |
| "Promoting a bodiless draft to published is refused" | **Invalidated — rescope** to default-language bodilessness. |
| "The list query selects explicit columns and never `body`" (0061 **R-7**) | **Invalidated — replaced, not retargeted.** `body` is no longer a `blog_posts` column at all. Replace with: the list's translation eager-load is explicitly column-scoped to exclude `body` (0078 **D-8**), **and** the editor's is not (**D-7**). |
| "The WYSIWYG is embedded once with a stable `wire:key`" | **Invalidated — becomes N embeds**, the single-instance framing dropped entirely. |
| The forged-`status` / `\ValueError` guard (0063 **D-6**) | **Unaffected** — `status` stays on the parent. |
| `Scheduled` + date-boundary tests, incl. "retitling a `Scheduled` post whose date has passed succeeds" (0061 **R-9**) | **Largely unaffected** — but *"retitling"* must now name **which** language; both the default-language and a non-default retitle are distinct valid scenarios and both should exist. |
| Tag reuse / case / accent / detach / partial-permission-rollback tests | **Unaffected** — tags are non-translatable (**D-12**). |
| Restore-rendering ("the restored row carries its category and tags") | **Widened** — the restore round-trip is now a **per-language** guarantee (0078 **D-5**). |
| — | **New, no 0063 precedent:** the list's title resolves through `translated()`, so a `null` resolution renders a **placeholder, not an error** — reachable transiently right after a store-default change (0070 **R-2**). |

### Deliberately NOT tested here

| Not tested here | Owner |
| --- | --- |
| `translated()`'s fallback chain, per-field resolution, the default-language memo, `withTranslationsFor()`'s query bound | 0070 |
| The slug-derivation hook itself (insert, retitle, `isDirty` guard, forged-attribute override), the backfill, the soft-delete slug reservation, the `23000`-vs-FK misattribution | 0078 |
| `SetTranslation`'s `updateOrCreate` semantics | 0070 — one row-count assertion here, no re-derivation |
| The HTML sanitiser's allow-list, scheme rules and idempotence | 0024 **D-16** / 0061 **D-14** |
| The WYSIWYG's tag emission, caret restore, toolbar `aria-pressed`, link sanitisation | 0021 |
| The media gallery's search/upload/tile cap | 0019/0020 |
| `StoreLanguage` CRUD and the add/remove/default-swap invariants | 0068 |
| `BlogPostPolicy` asked directly via `Gate::forUser(...)` | 0061 |
| `Str::slug()`'s transliteration table, `trans_choice`'s plural engine, `HasUuids`, Eloquent timestamps | vendor / [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md) |

## Expected outcome

A blog editor opening a post sees a tab per active store language, the store default selected. Each tab
holds that language's **own** title and body — blank, and visibly marked as untranslated, where none
exists, never silently pre-filled with the fallback — while the category, status, publication date and
tag chips sit outside the tabs and are shown once. Switching tabs swaps both fields, including the
rich-text body, with no loss of unsaved work and no write of any kind. Saving writes the default
language through `CreateBlogPost`/`UpdateBlogPost` and every other **engaged** language through
`SetBlogPostTranslation`, all inside one transaction; a tab left wholly blank writes nothing and the
language keeps falling back. Each language's slug is derived from that language's own title with no
slug field anywhere on the screen. A refusal in any language marks that language's tab, activates it,
and leaves every table unwritten — and a post may be published with a body in the store default alone,
so adding a store language never retroactively unpublishes anything. The list renders each post's title
resolved through the store default, with an em dash where it resolves to nothing.

Behind the screen, `App\Actions\Blog\SetBlogPostTranslation` authorizes `blog.edit`, sanitizes the body
and validates the title before any translation is persisted, **independently of who called it**. An
administrator refused at the screen is refused identically by a direct call from an Artisan command, a
queued job or a future importer, and 0070's unguarded `SetTranslation` primitive is reachable from
nowhere else in the application.

## Acceptance criteria

- [ ] The editor renders exactly one tab per **active** store language, resolved through
      `StoreLanguage::active()`, with the store default selected on open.
- [ ] **`title` and `body` render inside the tab panels, once per language; `blog_category_id`,
      `status`, `published_at` and the tag field render exactly once, outside them**, and are unaffected
      by a tab switch.
- [ ] **No slug field renders on any tab**, and no `$slugs` property exists — each language's slug is
      derived from that language's own title by 0078's model hook (**D-2**).
- [ ] **Every language panel is mounted and hidden with `x-show`; no panel is conditionally rendered
      with `@if`** — pinned by a test asserting a non-active panel is still present in the DOM (**D-4**).
- [ ] One `WysiwygEditor` instance renders per active language, each seeded from **its own** value at
      its own client init, with a per-language `wire:key` (**D-4**).
- [ ] Each tab's fields show that language's **own** translation, read from the raw translation row —
      **never** through `translated()`'s fallback (**D-6**).
- [ ] The editor's translation load covers **every active language including `body`**, while the list's
      excludes `body` — the two are **different queries and must not share one helper** (**D-7**).
- [ ] Saving writes the default language through `CreateBlogPost`/`UpdateBlogPost` and every other
      engaged language through **`SetBlogPostTranslation`** — never through `SetTranslation` directly,
      which appears in **no** import under `app/Livewire/` (**D-8**, greppable).
- [ ] **`SetBlogPostTranslation` authorizes `update`, sanitizes and validates itself**, so a direct
      caller with no component is refused identically; proven by direct-call tests that mount no
      component.
- [ ] **The component authorizes and validates too, before calling it**, and both layers are covered by
      their own tests. Neither may be removed as duplication (**D-9**).
- [ ] A refusal from either layer lands on `titles.{languageId}` / `bodies.{languageId}` and renders on
      that language's tab, including a default-language refusal re-keyed from the `title` / `body` keys
      0061's actions throw (**D-9**).
- [ ] A validation refusal keyed to a hidden tab **switches the active tab to that language** and marks
      it in the strip; the marker persists while the editor navigates away.
- [ ] The default language's title is required; an **engaged** non-default language's title is required;
      a wholly untouched language is skipped and written nowhere; a **blanked** previously-translated
      language is refused (**D-10**).
- [ ] **A body is required only in the store default language**, and only when `status` is `Published`
      or `Scheduled`; a blank non-default body never blocks a save at any status (**D-11**).
- [ ] **Two posts may share a title within one store language** — no uniqueness rule was added while
      re-scoping uniqueness (**D-13**).
- [ ] A blank `body` is persisted as `NULL`, never `''` (**D-8**).
- [ ] The body is sanitized before persistence on **every** language path, through 0024's existing
      allow-list, with **no second allow-list added** (**D-8**, 0078 **R-8**).
- [ ] The tag field renders once, outside the tabs, and still carries the post's **complete** set
      (**D-12**).
- [ ] A removed store language contributes no tab, and its stored content is neither shown nor
      destroyed (**D-5**).
- [ ] Every tab, panel, field and error marker carries a `data-test` hook; **no assertion anywhere in
      this story matches on a language name, a two-letter code, or an admin-locale status label**
      (**D-15**).
- [ ] No `wire:model`-bound value is ever `null` — including every one of the 2 × N leaves.
- [ ] The tab strip's dynamic attribute values use `{{ Js::from(...) }}`, never `@js(...)`, verified
      against **compiled output** rather than the absence of an error.
- [ ] No new permission, ability, policy, route, migration, model or `config/modules.php` entry; the
      catalog stays at **42**. **Exactly one action is added** (`SetBlogPostTranslation`); 0061's and
      0078's six existing Blog Post actions, 0070's `SetTranslation`, 0024's sanitizer and
      `BlogPostValidationRules` are all **unmodified** — subject to **Q-1**.
- [ ] `lang/en/blog-posts.php` and `lang/es/blog-posts.php` stay key-for-key identical; no user-facing
      string is hardcoded in a view.

## Definition of Done
- [ ] Tests written and green (**full suite unscoped**, not `--filter`) — including the seven browser
      tests, which are the only level that can observe three of this story's failure modes
- [ ] `vendor/bin/pint --format agent` run **unscoped**, not `--dirty`
- [ ] **Larastan level 7 run and recorded** — named explicitly because
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26)
      records three consecutive stories whose verification notes listed two of three gates and were read
      as records of all three. **A record naming two gates is a record of two gates.**
- [ ] **Compiled output of the tab strip and the N panels verified by rendering**, not by the absence of
      an error
- [ ] Code reviewed (`code-reviewer`)
- [ ] No security findings (`appsec-auditor`) — **point the audit at:** both layers of the per-tab write
      path (a `blog.view` actor refused by the component *and* by `SetBlogPostTranslation` called
      directly); that `SetTranslation` is reachable from nowhere but the action (grep `app/Livewire/`);
      that the action's error keys are derived from `$language->id` and never accepted as parameters;
      **0078's R-8** (every per-language body write path sanitizes, and `SetTranslation` was not taught
      to); the client-controlled language keys in `$titles`/`$bodies` and the server-side intersection
      that narrows them; `$originalTranslatedLanguageIds` being `#[Locked]` while the two field arrays
      are not; and the transaction-nesting/notification-placement interaction in **D-14**
- [ ] **0061's OQ-2 is closed and its answer re-scoped per language** before Phase 3 — a **hard gate**,
      not a risk to monitor (**R-4**)
- [ ] **Q-1 and Q-2 answered** before Phase 3
- [ ] Documentation updated (`docs-keeper`) — at minimum `docs/api/routes.md` (the editor's tabbed
      panels and their `data-test` hooks) and `docs/conventions/naming.md`. **Verify whether
      0071/0073/0075/0077's own docs passes already made these claims** rather than restating them
- [ ] **Recorded as a handoff, not done here:** the sibling amendments in **R-1**, **R-2** and **R-3**.
      This story edits no other story's file
- [ ] Acceptance criteria met

## 4. Documented functional decisions

**D-1 — Two fields go inside the tabs; everything else renders once outside them.** 0078 **D-1** fixes
the translatable set at `title`, `body` and `slug`, and the PRD puts *"price, stock, SKU, **status,
dates**"* explicitly outside the language tabs. So: **inside** — the title input and the WYSIWYG body,
one pair per language. **Outside, once** — the category `<select>`, the status `<select>`, the
conditionally-revealed `published_at` input (0063 **D-7**) and the bespoke tag chip field (**D-12**).
The slug is translatable but has no control at all (**D-2**), which is why this is a *two*-field panel
for a *three*-field entity. Both amigos reached this placement independently and neither proposed
moving anything else.

**D-2 — The slug is derived per language and gets no input; the screen shows it read-only or not at
all.** This is the correction the ⛔ block at the top of this file establishes: 0078 **D-4** derives
each language's slug from that language's own title inside `BlogPostTranslation`'s `saving` hook,
`#[Fillable]` omits it, and 0078 scripts *"a blog editor cannot supply a slug directly."* 0063 renders
no slug field today and this story adds none. Three consequences, each a real design constraint rather
than an absence:

- **No `$slugs` state array, no `slugRules()` call from this screen, and no blur-prefill affordance.**
  0077's **D-9** — the whole `Str::ascii()`-versus-JS-`slugify` fidelity argument — has **no analogue
  here**, and 0077's **D-4** `'' → NULL` slug-uniqueness trap is structurally unreachable, because a
  `NOT NULL` derived column can never be blank.
- **A read-only disclosure is permitted; a *live* preview is not.** `frontend-expert` proposed showing
  the persisted slug per tab ("will be published at `/blog/{slug}`"), sourced from that language's
  **persisted** `BlogPostTranslation` row and omitted for an untranslated tab. That is safe because it
  is presentational and reads a stored value. A **live** preview re-derived client-side from the
  unsaved title is **rejected**: `frontend-qa` identifies it as a genuine fourth `Livewire::test()`
  blind spot, since a JS slugifier and PHP's `Str::slug()` diverge on exactly the `ñ`/`ç`/`ü`/`ß`
  characters a Spanish/French blog uses, so the preview would display one slug while the server stored
  another, invisibly. **Whether to render the read-only form at all is Q-2**, because it is a product
  question rather than a technical one.
- **A slug-uniqueness refusal has no field to land on.** No sibling has this problem — each has a
  `name` or `slug` input of its own. If 0061's **OQ-2** resolves to *refuse-with-validation*, the
  refusal must be re-keyed onto `titles.{languageId}`, on the reasoning that retitling is the only
  action an editor can take to resolve it. See **R-4** and **Q-2**.

**D-3 — Two parallel arrays keyed by store-language id, following 0077's C-4 reversal rather than its
first draft.** `public array $titles` and `public array $bodies`, each `array<string, string>` keyed by
store-language **id**, plus `#[Locked] $languages`, `#[Locked] $defaultLanguageId`, `#[Locked]
$originalTranslatedLanguageIds` and the unlocked `public string $activeLanguageId`.

- **Parallel arrays, not one nested `$translations`.** 0071 **D-13** specifies the multi-field error key
  as `"{$field}s.{$language->id}"` and names *"the derived-not-parameterised error key"* as something a
  sibling must not re-derive. The error key and the state shape are **not independent** in Livewire —
  Flux's `wire:model` error integration and `SupportValidation`'s `Utils::hasProperty()` filter both key
  off the property path — so adopting 0071's key **is** adopting parallel arrays. 0077 reached this
  conclusion the hard way, by reversing its own first draft (its **C-4**); this story inherits the
  settled answer.
- **Keyed by id, not `code`.** 0078's `titleRules(string $storeLanguageId)` takes the id, and 0071
  **D-11** forbids matching on a code anywhere. UUIDs contain no `.`, so `titles.019a…` resolves
  correctly as a validation key.
- **Neither field array can be `#[Locked]`** — they are the `wire:model` targets. That is what makes
  the server-side language intersection in **D-14** necessary rather than optional.
  `$originalTranslatedLanguageIds` **is** locked, because **D-10**'s blanked branch reads it: a forged
  value would let an actor blank away an existing translation without tripping the refusal, silently
  destroying content. 0071 **D-3** and 0077 **D-2** reach the identical conclusion for the identical
  reason.
- **`$activeLanguageId` stays unlocked and never binds a `<select>`** — it drives an `x-show`
  comparison, so the [null-bound-`<select>` trap](../../docs/errors-log.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)
  is structurally inapplicable, recorded so nobody "defensively" applies it. The trap **does** still
  bind `$blogCategoryId` and `$status`, unchanged from 0063 **D-6**.

**D-4 — One `WysiwygEditor` instance per active language, all mounted, hidden with `x-show` — and the
N-galleries cost that comes with it, which no sibling states.** 0021 **D9** says the `contenteditable`
region seeds from `$value` at **client initialisation only**, is never re-written by a Livewire
re-render, and the component has **no** refresh hook. 0077's **D-1** weighed four options against that
constraint and adopted N instances; 0071's second post-debate amendment then made `x-show` the
**universal** panel-rendering mode for every consumer, explicitly so that siblings *"inherit the fix
with no change on their end."* This story inherits both, unmodified:

```blade
<livewire:components.wysiwyg-editor
    wire:model="bodies.{{ $language['id'] }}"
    wire:key="blog-post-body-editor-{{ $language['id'] }}"
    :label="__('blog-posts.editor.body_label')"
/>
```

⚠️ **`@if` instead of `x-show` will look like an optimisation and is the silent killer.** It tears down
N `wire:ignore`d regions on every switch, and 0021 has no hook to restore them. There is no PHP error,
no console error, and nothing a component test can see. **B-4 and the all-N-panels rendering assertion
exist for this.**

> ⚠️ **N editors means N media galleries, and this is stated here because *no* story in the family
> states it.** 0021 **D4** embeds `<livewire:media.gallery>` **inside** `WysiwygEditor`, wrapped in
> `@can('viewAny', Media::class)` and not consumer-configurable. So mounting N editors mounts **N
> gallery children simultaneously** — N `<dialog>` elements, N upload listeners, N
> `Gate::authorize('viewAny', Media::class)` calls — regardless of which tab is visible. 0077 has the
> identical exposure and its **D-1** discusses only editor multiplicity; 0063 **D-14**'s assertion
> *"no `<livewire:media.gallery>` tag appears in any view this story writes"* stays **literally true**
> while ceasing to mean what it meant, because the mounts are now transitive. Three obligations follow:
> the per-language `wire:key` must cascade correctly into each nested gallery (0021 **D5**'s uniqueness
> machinery, at N instead of 1); a **bounded query-count test proven able to move** is needed, per the
> [count-assertion rule](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21);
> and page weight at N=3+ is a real Phase 3 verification item, not a theoretical one.
> `frontend-expert`'s finding, and the sharpest thing in this story that is not about correctness.

**D-5 — The tab strip is *consumed* from 0071; active-tab tracking is server-side; only active
languages get a tab.** Three settled inheritances, none re-derived:

- **The strip.** `resources/views/components/language-tab-strip.blade.php` is 0071's, prop contract
  `['languages' => Collection, 'active' => string, 'errorLanguageIds' => array<int, string>]`, **strip
  only** — panels are the consumer's. This story is its fourth consumer and must not fork, copy or
  widen it. It hardcodes a call to `setActiveLanguageTab(string $languageId)`, which this component
  therefore exposes by that exact name.
- **Server-tracked `$activeLanguageId`, `x-show` panels.** This is 0077's **C-2** reconciliation
  adopted whole: 0071's tracking axis (*"a validation error can land on any tab, and only the server
  knows which"*) combined with 0077's rendering axis (`x-show`, because of the `wire:ignore`d region).
  The two axes are independent and must not be re-bundled. This story has the **identical**
  WYSIWYG-in-tabs problem 0077 solved, so it inherits the combined shape with no argument of its own.
- **Only `StoreLanguage::active()` rows get a tab.** 0070 **D-6** is emphatic that `translated()` must
  never filter on `is_active` and that *"the `is_active` filter belongs one layer up, at the UI's
  'which tabs do I render' decision"*. 0071 **D-5** is that decision and 0073/0075/0077 all follow it.
  Content in a removed language is **hidden, not shown read-only, and never destroyed**; it becomes
  editable again the instant the language is reactivated, with zero code here. ⚠️ **The write path must
  not inherit this filter** — `SetBlogPostTranslation` accepts an inactive language, and a test pins it.

**D-6 — The edit fields read the raw translation row; the list cell reads `translated()`.** 0071
**D-6** calls conflating these *"the sharpest bug this story can ship"*, and 0077's **Q-1** was resolved
by the human the same way. `translated('title', $frenchId)` applies the fallback **by design**, which is
correct for the list (a row must render *something*) and wrong for the edit input: binding it into the
French field means an editor who saves without touching that tab silently manufactures a French
translation byte-identical to the Spanish one, which they never typed and cannot tell apart afterwards.

So `mount()` loads
`$blogPost->load(['translations' => fn ($q) => $q->whereIn('store_language_id', $activeIds)])` and reads
each language's own row, rendering `''` where none exists.

> ⚠️ **`scopeWithTranslationsFor()` is the wrong tool for the editor**, and this is a genuine limitation
> of 0070's contract rather than a misuse of it: that scope always narrows to (requested, default) — at
> most two languages — because it was built for single-language-with-fallback resolution on a *list*
> path. The editor needs the raw value for **every** active language. Recorded so a Phase 3 author does
> not reach for the shared scope on the assumption that it is always the right one. It **is** the right
> one for the list (**D-7**).

**Blog Posts sharpens this one notch past every sibling: the fallback must not leak *per field*.** A
post whose French title exists and whose French body does not must open with the French title **and an
empty body** — not the Spanish body. That is the form-layer counterpart of 0078's **D-10**, and it is
the property no single-field taxonomy screen can demonstrate.

**D-7 — The list and the editor need *opposite* eager loads, and they must not share one helper.
(Converged independently by both amigos, which is the strongest signal in this debate.)** 0078 **D-8**
makes the list's obligation explicit: `blog_post_translations` now carries `title`, `slug` *and* `body`
together, so a list query must scope its translation load to explicit columns **excluding `body`**
(`->with(['translations' => fn ($q) => $q->select('blog_post_id', 'store_language_id', 'title', 'slug')])`),
never a bare `with('translations')` — otherwise 0061 **R-7**'s inline-`mediumText` clustered-index cost
returns through a different door, and under 0063's **pagination** it returns per page.

The editor needs the **exact opposite**: `body` for **every** active language, because each of the N
`WysiwygEditor` instances seeds once from its own value at its own client init (**D-4**). Narrow that
load and the non-active tabs hydrate empty — which looks exactly like the fallback-leak bug's inverse
and is equally invisible to a component test.

**If a developer factors these into one shared `withTranslationsScoped()` helper — which is a plausible
thing to do, since both screens live under Blog — one of the two regresses silently.** Either the list
regains the cost 0061 **R-7** exists to avoid, or the editor's hidden tabs stop hydrating. This gets its
own acceptance criterion and its own test asserting the two call sites use **different** column sets,
rather than a note nobody re-reads.

**D-8 — `SetBlogPostTranslation`'s contract, and the two places it is unlike every sibling.** The
class follows 0071 **D-13**'s master shape and 0077 **D-19**'s named-parameters rule. Seven properties
are the family's, applied unchanged:

1. **Authorization is its own first statement**, outside any transaction, per
   [the action-owns-the-rule convention](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers).
   It authorizes `update` on the **`BlogPost`** — which resolves to `blog.edit` through
   `BlogPostPolicy::EDIT_PERMISSION` — never on the translation row, and there is deliberately no
   `TranslationPolicy` (0078 **D-14**). Not `blog.create`: translating an existing post is editing it,
   and 0070 **D-9** is explicit that a self-authorizing `update` inside the shared primitive is what
   would wrongly make *creating* require the edit permission.
2. **It routes through `LogRefusedPrivilegedAttempt::authorize()`, not a bare `Gate::authorize()`**,
   with `target_type: 'blog_post'` passed **explicitly** — 0061 **D-13**'s established idiom for this
   folder, which by the time this lands holds seven self-authorizing actions. This is the one place
   this story diverges from 0071/0077, whose Product-side actions do not log; following the *entity's*
   folder rather than the *pattern's* sibling is 0073's precedent applied again.
3. **Sanitization runs before `validate()`.** 0061 **D-14** and 0024 **D-16** constraint 1 require it,
   so a body whose *pre*-sanitisation length exceeds a rule but whose sanitised form does not is judged
   on the sanitised value. Putting it here rather than only in the component is what closes 0078's
   **R-8** structurally rather than by remembering.
4. **Error keys are derived internally** as `"titles.{$language->id}"` / `"bodies.{$language->id}"`,
   never accepted as parameters — the [guard-took-the-state-it-guarded](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20)
   shape.
5. **It reuses `BlogPostValidationRules` and writes no local rule** — subject to **Q-1**.
6. **Named parameters, never `array $fields`** (0077 **D-19**): an array is a pass-through surface the
   action would have to whitelist anyway, whereas named parameters make the whitelist *the signature*,
   unforgeable. The required-vs-optional split is expressed in the types (`string $title` against
   `?string $body`).
7. **Collaborators are constructor-injected** (the documented `code-style.md` exception, since
   `__invoke()`'s parameter list is a public contract), while the action itself is **method-injected**
   into `save()`. **Resolved from the container, never `new`-ed, including in tests.**

**Two places this action is unlike every sibling:**

- **It takes no `$slug` parameter, and that is the whole slug story.** `SetTranslation`'s
  `updateOrCreate()` calls `save()`, which fires `BlogPostTranslation`'s own `saving` hook, which
  derives the slug from the title — **without `SetTranslation` knowing the column exists** (0078
  **D-4**). Nothing in this story touches a slug at any point. That makes it *simpler* than
  `SetProductTranslation`, not more complex.
- **It injects a class from another area folder.** The sanitizer is
  `App\Actions\Products\SanitizeProductDescription` — 0024 declares it *"the **only** class in the app
  that touches the HTML sanitizer"* and 0061 **D-14** reuses it deliberately rather than defining a
  second allow-list. So an `app/Actions/Blog/` class constructor-injects an `app/Actions/Products/`
  one, which looks wrong at a glance and is correct: the alternative is the drift 0024's own scope
  fence exists to prevent. **(V-1.)**

**One more property, from 0077 D-4's shape applied to a different column:** `''` must become `null`
before it reaches `body`, at the **action boundary**, so a caller with no component inherits it too.
Unlike 0077 the reason is not a uniqueness constraint — `body` has none — it is that 0078's whole
per-field fallback design depends on an absent value resolving through the chain. If `HasTranslations`
distinguishes absence with `!== null` rather than `blank()`, a stored `''` in French renders as an
empty body instead of falling back to the default's, silently defeating **Q-1(a)**. ⚠️ **This is not
stated in 0078, 0070 or 0077** — `frontend-expert` raised it and it is recorded as **new**, with
Phase 3 required to verify it against `HasTranslations`' real implementation.

**D-9 — The component validates too, and its error-key adapter is a backstop rather than the primary
path.** 0071 **D-4**'s two-layer table applies: layer 1 (the component) fails fast before a transaction
opens and renders every refusal on the right tab; layer 2 (the action) binds **every** caller with no
component in sight.

**Why the component validates here, when 0075's does not.** 0075 **D-3** is the documented exception,
and its cause is specific: 0060 **D-1** is a *screen-story decision* that its component neither composes
the validation trait nor calls `$this->validate()`, so adding a layer there would duplicate a rule the
action owns. **0063 makes no such decision.** It never specifies `$this->validate()` either way — but it
*does* require casting `BlogPostStatus::from(...)` *"only after `validate()` passes"* (its **D-6**),
which only makes sense with a component-side validate, and it composes no equivalent of 0060's D-1
anywhere. So Blog Posts sits with 0071/0073/0077, not with 0075. ⚠️ **0063's silence is a real
ambiguity and Phase 2 must ratify this reading rather than inherit it** (**R-6**); if 0063's Phase 3
lands without component validation, this decision inverts to 0075's shape and the adapter below becomes
primary-path rather than backstop.

**The adapter.** `CreateBlogPost`/`UpdateBlogPost` throw `ValidationException` keyed **`title`** /
**`body`** (0061's shape, frozen by 0078 **D-12**), while every field on this screen binds to
`titles.{languageId}` / `bodies.{languageId}`. An unadapted refusal lands on a key no field renders:
the editor sees a save that did nothing, which is 0018's blocking finding. So `save()` catches the
default-language write's `ValidationException` and re-keys `title` → `titles.{defaultId}`, `body` →
`bodies.{defaultId}`. `blogCategoryId`, `status`, `publishedAt` and `tagNames` need **no** adapter —
their keys are untouched by the retrofit.

Because layer 1 validates first, this adapter is realistically reached only on a race backstop (a
`23000` slipping past the pre-check) — 0071's situation, not 0075's, where the same adapter sits on the
primary path and is exercised by ordinary input. *Rejected:* widening 0061's two actions to key on
`titles.{id}`, which changes a public contract 0063 and every direct-call test bind to, from a story
forbidden to edit either file.

**D-10 — Untouched / engaged / blanked, keyed on `title`.** 0077 **D-18**'s triple, adapted to a
two-field panel. `blog_post_translations.title` is `NOT NULL` (0078's migration), so "write whatever
they typed" is not available and the rule must be stated:

| State | Condition | Behaviour |
| --- | --- | --- |
| **Untouched** | title blank **and** body blank, **and** the language held no translation before this edit | **Skipped.** No row, no slug derived, no validation, no error. The language keeps falling back through `HasTranslations` exactly as a never-translated one does. |
| **Engaged** | title **or** body non-blank | `title` becomes **`required` for that language**; `body` stays optional (**D-11**). |
| **Blanked** | title blank **and** body blank, **but** the language *did* hold a translation | **Refused**, keyed `titles.{id}`. Blanking is not a delete path — 0071 **Q-1**, 0077 **Q-4**, both resolved the same way. |

The **default** language's title is unconditionally required (0070 **Q1(a)**).

**All-or-nothing binds the *tab*, not the field set** — the tab is either in play or it is not, and once
it is in play only the `NOT NULL` column is mandatory. ⚠️ **"Engaged" is computed server-side from the
narrowed payload, never from a client-sent flag** — a boolean the client controls would be **D-14**'s
hole in a new costume.

**The case unique to a two-field panel, and worth its own test:** a tab with **body filled and title
blank** is *engaged* and therefore **refused**, not silently dropped as if nothing was typed. No
single-field sibling can be partially filled at all, so this state has no precedent to copy.
`frontend-qa`'s finding.

**D-11 — A body is required only in the store default language, and `SetBlogPostTranslation` must
therefore not call `bodyRules($status)`.** 0078's **Q-1 resolved (a)**: a post is publishable once its
default-language body exists, and other languages fall back until translated. Two consequences, and the
second is where a first draft of this story got it wrong:

- **The default language keeps 0061's rule unchanged.** `bodyRules(BlogPostStatus $status)` returns
  `nullable` for `Draft` and `required` for `Published`/`Scheduled` (0061 **D-4**), evaluated against
  the **submitted** status inside `CreateBlogPost`/`UpdateBlogPost`. Nothing about that moves.
- **A non-default language's body is *unconditionally* optional.** Since `SetBlogPostTranslation` is the
  non-default writer, it must **never reach `bodyRules()`'s `required` branch** — otherwise publishing a
  post would demand a French body, which is exactly the retroactive-unpublish problem 0078's Q-1 was
  raised to prevent and which its **backlog item 1** names by name: *"0063's future per-language
  body-edit path must scope `bodyRules($status)` so it does **not** require a body in every active
  language before publishing — only the default's."*

⚠️ **The *mechanism* for expressing that is genuinely undecided and is escalated as Q-1**, because
0078's trait is not this story's file. `bodyRules()` takes a `BlogPostStatus` and there is no
status-free variant.

**This is also 0078's R-9 — a validation rule keyed on a column in another table — reaching its one
real consumer.** `status` lives on `blog_posts`; `body` lives on `blog_post_translations`. Under
Q-1(a) the coupling collapses to "the default language only", which is the cheapest possible answer and
the reason R-9 is a design note here rather than a hazard.

**D-12 — The tag field stays outside the tabs, rendered once. This closes 0074's Q-2.** 0074 **Q-2**
asks *"does the post editor's tag field sit inside or outside the language tabs?"*, recommends **(a)
outside**, and assigns the decision to *"story 0061 and its UI sibling"* — which is this story.
**Adopted: (a).** A post's tag *attachments* are a relationship that does not vary by language; the tag
*names* are 0074's and are translatable on the taxonomy screen, not here. 0078 **D-1** states the same
conclusion, and PRD's own rule that non-translatable fields *"stay outside the language tabs and are
shown once"* points the same way. **This also confirms 0074's Q-1(a)** — an on-the-fly tag is authored
in the store default — since a field outside the tabs has no per-language context to author in.

⚠️ **But it leaves a real cross-story gap this story cannot close alone** — see **R-3**.

**D-13 — A post title carries no uniqueness rule, and that is a negative control rather than an
omission.** 0061 **D-10** is explicit that two posts may legitimately share a title (a series, a "Part
2"), and 0078 **D-11** carries it forward: `titleRules()` gains a `$storeLanguageId` parameter but
**still carries no uniqueness rule**, because *"add uniqueness while you're re-scoping uniqueness"* is a
plausible drift. Every sibling in this family has a unique `name`; this one does not.

**Stated as a decision because the risk is a mechanical port.** An author following 0071/0077's master
pattern — where per-language `name` uniqueness is *the* headline rule — will add title uniqueness for
consistency, and nothing will catch it. `frontend-qa` names it as the negative control it would "bet
real money" a first draft gets wrong, and the facilitator flagged it independently. It is the
[cleanup-for-consistency failure mode](../../docs/errors-log.md#two-directive-calls-in-one-blade-component-tags-attribute-string-silently-fail-to-compile--2026-08-26)
arriving in a validation rule instead of a Blade attribute. **The uniqueness that *does* exist is on the
derived `slug`, per `(store_language_id, slug)` — and it has no field (D-2).**

**D-14 — Save composition, the payload narrowing, and the transaction that must not swallow the
notification.** Ordering: authorize → read the server-derived active-language list → **narrow the
client payload against it** → sanitize → validate → open transaction → default language through
`CreateBlogPost`/`UpdateBlogPost` → `SetBlogPostTranslation` per **engaged** non-default language →
commit → (0061's post-commit notification dispatch, untouched).

- **The narrowing is not optional.** `$titles`/`$bodies` are unlocked (**D-3**), so their **keys** are
  client-controlled and land in a `store_language_id` FK column. A forged payload naming a real-but-
  inactive language (0068 **D5** makes removal an `is_active` flip, so the row still exists and the FK
  accepts it) injects content into a language the store removed. `save()` builds `$languages` from
  `StoreLanguage::query()->active()->get()` and reads each array **by that list's ids**, before
  validating; keys outside the set are dropped silently. ❌ `foreach ($this->titles as $id => $value)`
  is the bug, and it is the natural way to write it. ✅ The action's **typed `StoreLanguage`
  parameter** closes the same hole structurally at layer 2 — neither is optional (0077 **D-3**).
- ⚠️ **Transaction nesting reaches two levels and interacts with a post-commit dispatch nothing in
  0078 discusses.** An outer `DB::transaction()` in `save()` wraps 0061 **D-15**'s own transaction
  inside `CreateBlogPost`/`UpdateBlogPost`. Laravel turns the inner one into a savepoint — but 0061
  **D-19** dispatches the published-post notification **after** its commit, and 0078 **D-13** keeps it
  there deliberately. **An outer transaction moves that "after the commit" point**, so a notification
  0061 designed to fire only on a durable transition could fire inside an outer scope that later rolls
  back. This is precisely the
  [transaction-wrapper rule](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21) —
  *wrapping existing code in a transaction is a change to every side effect that code already
  performed, and the diff will not show you the one that moved.* `frontend-expert`'s finding; **the
  sharpest new risk this story adds**, and it must be resolved by execution at Phase 3, not reasoned
  about (**R-5**).
- **All-or-nothing across languages** is the intended semantics (0075 **D-9**'s reasoning): a refusal in
  the third language rolls back the first two, and **D-5**'s tab-focusing returns the editor to the
  failing tab with their typed values on screen, so the correction is one edit away.

**D-15 — `data-test` hooks, and the assertion hazards this screen adds.** The strip's own hooks —
`language-tabs`, `language-tab-{id}`, `language-tab-default-badge-{id}`, `language-tab-error-{id}` —
come from 0071's component and are **consumed, not defined here**. This story defines
`language-panel-{id}`, `blog-post-title-input-{id}` and `blog-post-body-editor-{id}` (wrapping each
WYSIWYG, so 0021's own `wysiwyg-*` hooks, which now repeat N times, are always addressable within a
scope), plus a read-only `blog-post-slug-{id}` if **Q-2** resolves that way.

0071 **D-11**'s rule binds unchanged: **no assertion in this story may match on a language name or a
two-letter code.** Three hazards this screen adds beyond 0077's *"every markup assertion now matches N
times"*:

- **A blog category could legitimately be named "Français"** — 0071 **D-11**'s own third hazard,
  transplanted, and now with a *second* translatable surface on the same page: the category `<select>`'s
  option labels are themselves translated (0073's retrofit) and render beside the post's own tabs.
- **Tag chips collide with body prose.** A tag named "invierno" appears inside a title "Botas de
  invierno" and inside N body panels. Scope every tag assertion to its own hook.
- ⚠️ **This is the first language-tabs screen where admin-UI-locale chrome sits beside store-language
  content in one DOM.** `BlogPostStatus::label()` renders "Borrador"/"Publicado"/"Programado" (0063
  **D-18**) in the *admin* locale, while the panels hold *store*-language prose — and "borrador" is
  plausible text inside a real Spanish article body. A careless `assertSee('Borrador')` intended for the
  status control can match inside a WYSIWYG region instead. `frontend-qa`'s finding; no sibling has a
  comparable admin-locale label competing for the same fixture space.

**D-16 — Copy extends `lang/{en,es}/blog-posts.php`, not `blog.php`.** 0063 **D-17** resolved a
contradiction between 0060 **D-8** and 0061's hand-off in favour of a per-screen file, and created
`lang/{en,es}/blog-posts.php` for exactly this screen's copy. This story appends one `editor.tabs.*`
group (the untranslated-tab hint, the tab-error marker's `aria-label`, the read-only slug label if
**Q-2** adopts it), key-for-key identical across both locales. ⚠️ **0078's R-11 lists 0063 among four
stories writing `lang/*/blog.php`** — that is **stale**, superseded by 0063's own D-17, and this story
follows the settled decision rather than the earlier instruction. **A language's own display name is
data**, read from `store_languages.name`, and must never be routed through `__()`.

**D-17 — Test paths: `tests/Feature/Blog/`, browser tests mirrored.** 0063 **D-21** settles both:
Feature tests go in the shared `tests/Feature/Blog/` area folder with disambiguating file names, and
browser tests go in the **mirrored** `tests/Browser/BlogPosts/`. 0071 **D-9** independently reaches the
same mirrored conclusion. Verified against the tree: there are **three** flat browser files
(`UsersIndexTest.php`, `SalesRegionsIndexTest.php`, `RolesIndexTest.php`) and **one** mirrored
(`Auth/LoginSmokeTest.php`) — the flat ones are recorded **debt, not precedent**, and this story does
not add a fourth.

**D-18 — No new permission, ability, policy or route.** 0078 **D-14** applied unchanged, and **verified
against the shipped seeder rather than inherited**: `RolePermissionSeeder::MODULES` contains `blog`, so
all four `blog.*` permissions exist today, the catalog stays at **42** and `Administrator` at 41 of 42.
Authoring a translation is *using* a configured language, not managing the catalog, so **no
`store-languages.*` permission is required** — 0068 **D18** draws that boundary. `BlogPostPolicy`'s five
abilities are untouched, and there is deliberately **no `TranslationPolicy`**. No **step-up** — re-typing
a post's French title is neither identity-sensitive nor hard to reverse.

## 5. Dependencies, risks, open technical questions

### Dependencies

- **[0078](0078-translatable-content-retrofit-blog-posts-backend.md)** — hard, blocking, **not
  implemented**. Supplies `blog_post_translations`, `BlogPostTranslation` and its slug hook, the widened
  `titleRules()`, the unchanged `CreateBlogPost`/`UpdateBlogPost` signatures and the registry entry.
  **Its own hard gate — 0061's OQ-2 — is inherited here** (**R-4**).
- **[0063](0063-blog-posts-list-editor-ui.md)** — hard, blocking, not implemented. The list, the routed
  editor, the routes, the registry entry and the lang files this story widens. See **R-1**.
- **[0071](0071-product-categories-language-tabs-ui.md)** — hard. The shared strip, `setActiveLanguageTab()`,
  the two-layer pattern, the `x-show` rendering mode, the derived error key. **Consumed, never edited.**
- **[0077](0077-product-editor-language-tabs-ui.md)** — soft but load-bearing. Not a code dependency;
  it is where the multi-field, routed-page, WYSIWYG-in-tabs shape was worked out, and this story adopts
  its **C-2** reconciliation, **D-18** state triple and **D-19** parameter rule wholesale.
- **[0070](0070-translatable-content-mechanism-product-categories-backend.md)** — hard.
  `HasTranslations`, `SetTranslation`, `defaultStoreLanguage()`. Consumed unmodified.
- **[0068](0068-store-languages-catalog-backend.md)** — hard. `StoreLanguage`, `scopeActive()`,
  `is_default`.
- **[0021](0021-wysiwyg-rich-text-editor-component.md)** — hard. Its **D9** is the constraint **D-4** is
  built around; consumed **unmodified**, N times.
- **[0024](0024-products-core-crud-backend.md)** — soft, for `SanitizeProductDescription` only,
  consumed exactly as 0061 **D-14** consumes it.
- **[0061](0061-blog-posts-core-crud-backend.md)** / **[0059](0059-blog-tags-backend.md)** /
  **[0058](0058-blog-categories-backend.md)** — hard, transitively via 0063.
- Sequencing, strictly: **0058 → 0059 → 0061 → 0063 → 0068 → 0070 → 0074 → 0078 → 0079**, each fully
  closed before the next starts.
- **No new Composer package. No new permission.**

### Risks

- **R-1 — This story supersedes part of 0063's committed contract, and the amendment 0063 needs is
  bigger than 0078's own R-1(a) states.** 0078 names three break sites in 0063 (`select([… 'title' …])`,
  `category:id,name`, `tags:id,name`). **There is a fourth it does not name, and it is in the file this
  story opens:** 0063 **D-10** hydrates the tag chip field with `$blogPost->tags->pluck('name')`, and
  0074 **drops `blog_tags.name`** (verified: its second migration is
  `dropColumn(['name', 'normalized_name'])`). So 0063 is broken by **three** Epic 5 stories across
  **four** sites, and the editor — not just the list — is one of them. Everything falsified here is an
  amendment 0063 owns and that **this story must not write**: `public string $title` / `$body`, the
  single-WYSIWYG-embed rendering test, the list query, the tag hydration, and 0063 **D-14**'s
  "no gallery tag" assertion (still literally true, no longer meaning what it meant — **D-4**).
- **R-2 — 0078's R-1 assigns 0063's amendment to the coordinator, and this story cannot ship a screen
  whose list query throws.** If 0063 ships before 0078, the Blog Posts list **throws a SQL error** until
  this story lands — a window in which a shipped screen is broken, exactly as 0071 **R-2** records for
  Product Categories. **D-7** supplies the replacement query; who applies it is the coordinator's call,
  and the honest answer is probably "this story, for this screen" (0071 resolved its own equivalent
  **Q-3** that way).
- **R-3 — `FindOrCreateBlogTag` has no language context after 0074, and no story resolves it.
  (`frontend-expert`'s finding, corroborated by the facilitator's own grep.)** 0074 makes tag names
  per-language with a `(store_language_id, normalized_name)` fold. The post editor's chip field sits
  **outside** the tabs (**D-12**), so it has no per-language context to resolve or create against. The
  only coherent answer is **always the store default**, regardless of which tab the editor is viewing —
  which is what 0074 **D-7** and its **Q-1(a)** already decide, so the *behaviour* is settled. What is
  **not** settled is whether `FindOrCreateBlogTag::__invoke(string $name)` keeps its signature (0074
  **D-7** says yes) while its *lookup* must now span a translation table, and whether 0063's
  `pluck('name')` hydration becomes `translated('name')`. Neither 0078 (whose scope fence excludes tag
  names as *"0074's, already retrofitted"*) nor 0074 (which defers the UI half here) closes it.
  **Escalated as a coordination item, not assumed.**
- **R-4 — 0061's OQ-2 is a hard gate on Phase 3, not a risk to monitor.** 0078 **R-4** records it as
  open and its own follow-up review states plainly that if it resolves to auto-suffix rather than
  refuse-with-validation, *"`slugRules()` and this story's whole slug-uniqueness Gherkin block need a
  **structural rewrite**, not a reshape."* The same binds here and **harder**, because this screen has
  **no slug field to render a refusal on** (**D-2**): under (a) auto-suffix there is no error at all and
  the screen may need to *disclose* the suffixed slug back to the editor; under (b) refuse-with-
  validation the message must be re-keyed onto the title. `frontend-qa` recommends marking the whole
  block `pending(OQ-2)` rather than writing brittle tests against a guess, and that is adopted.
- **R-5 — The outer transaction may move 0061's post-commit notification dispatch.** **D-14**'s ⚠️.
  This is the errors-log's transaction-wrapper rule arriving with a *notification* rather than a cache
  flush as the side effect that moved, and it is invisible in the diff. **Must be resolved by execution
  at Phase 3.**
- **R-6 — Whether 0063's component validates is genuinely ambiguous, and D-9 rules on it rather than
  inheriting it.** 0063 never states `$this->validate()` either way; its **D-6** implies one. If Phase 2
  or 0063's own Phase 3 lands without component validation, **D-9** inverts to 0075's shape and its
  error-key adapter moves from backstop to primary path — which changes what the adapter's test is
  *for*, not just where it sits. Ratify explicitly.
- **R-7 — `slugRules()` is specified with no named caller.** 0078 **D-11** adds the trait's first
  `slugRules()` *"because uniqueness is now conditional on a language and a bare `23000` cannot say
  which of two `UNIQUE`s fired"* — but the slug is never form-submitted, so nothing in 0078 says who
  calls it. The only coherent caller must validate the **derived** value (`Str::slug($title)`) before
  the model hook writes it, which means a write path must pre-compute a value it does not own. Whether
  that belongs in `SetBlogPostTranslation`, in the two 0061 actions, or nowhere until OQ-2 closes is
  **unresolved**; it is entangled with **R-4** and should be settled with it. Facilitator's finding.
- **R-8 — The list and editor eager loads are opposite and a shared helper breaks one silently**
  (**D-7**). Both amigos found this independently. It has an acceptance criterion and a test rather than
  a note, because the failure is invisible on both sides — a too-narrow load leaves hidden tabs empty
  (looks like a hydration bug), a too-wide one restores a performance cost nothing asserts.
- **R-9 — N galleries** (**D-4**). Page weight, query count and `wire:key` cascade at N=3+. Not a
  correctness risk that anything here proves, which is precisely why it needs a bounded query-count test
  proven able to move.
- **R-10 — Every markup assertion now matches N times, and this screen has more colliding surfaces than
  any sibling** (**D-15**). Including the first admin-locale-chrome-beside-store-content collision in
  the family.
- **R-11 — Refusal logging is asymmetric across this family and this story picks a side.**
  `SetBlogPostTranslation` routes through `LogRefusedPrivilegedAttempt` because 0061 **D-13** makes that
  the Blog folder's idiom; 0071's and 0077's Product-side equivalents do **not** log, and 0071 **R-7**
  records that as a deliberate deferral. So after this story the Blog translation path logs and the
  Product one does not. **Consistent within each folder, inconsistent across the family** — recorded so
  a reviewer meets a decision rather than a silence.
- **R-12 — This story's design is provisional against thirteen unshipped stories at once** — 0020,
  0021, 0024, 0058, 0059, 0060, 0061, 0062, 0063, 0068, 0070, 0074 and 0078 are all Phase 1 text, and it
  binds to 0078's *widened* trait which itself binds to 0061's *unimplemented* one. This is the widest
  exposure in the epic. **Phase 3 must re-verify every signature against `HEAD` first**, and record each
  disposition including "already closed".
- **R-13 — A verification claim in 0071 is wrong as written, and the same shape may have propagated.**
  0071's opening states *"Verified at authoring time: `grep -rn "flux:tab\|role=\"tab\"" resources/`
  returns **zero hits**."* Run against the tree today that command returns **119 hits** — all of them
  `flux:table`, because `flux:tab` is a prefix of it. **The conclusion is correct** (there is genuinely
  no tabbed markup; `grep -rnE 'flux:tab[^l]|flux:tabs|role="tab"'` returns nothing), but the cited
  command could not have produced the cited result. This is the repo's own
  [prefix-trap failure mode](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21)
  appearing inside a *verification claim in a story file* rather than in a test — the same trap as
  `<ui-checkbox` matching `<ui-checkbox-group` and `assertSee('0%')` matching `10%`. Nothing here
  depends on it; recorded because this project's stale-claim rule is that a false premise reaches a
  fourth story by being copied, and 0073 carries a similar phrasing.

### Open questions for the product owner

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule, each carries a recommendation
rather than a silent assumption. **Neither blocks Phase 2 review; both must close before Phase 3.**

**Q-1 — How does `SetBlogPostTranslation` express "a non-default body is never required" without
writing a local rule or lying to `bodyRules()`?** **D-11** settles the *behaviour* (0078's Q-1(a));
this is about the mechanism, and it matters because 0078's trait is not this story's file to edit.
`bodyRules(BlogPostStatus $status)` returns `nullable` for `Draft` and `required` otherwise (0061
**D-4**), and there is no status-free variant.

- **(a) 0078's trait gains a `translatedBodyRules()` with no status parameter — _(recommended)_.**
  Honest, self-documenting, and it puts the rule where every sibling's rules live. Its cost is that it
  is an edit to 0078's file, so it is a **coordination action** rather than something this story can do
  — which is exactly why it is a question rather than a decision. It is additive and breaks nothing.
- **(b) Call `bodyRules(BlogPostStatus::Draft)` from the action, with a comment.** Costs nothing, needs
  no cross-story edit, and produces the correct rule set today — but it reads as a lie at the call site
  (the post is not a draft), and it silently couples this action to `Draft`'s branch continuing to mean
  "optional" forever.
- **(c) Write `['nullable', 'string']` inline in the action.** Rejected: 0073 states the rule that a
  translation action validates *"reusing the entity's `<Noun>ValidationRules` — never a locally written
  rule"*, and a second definition of "what a valid body is" is exactly the drift the traits exist to
  prevent.

**Q-2 — Does a language tab disclose its derived slug, and if so how?** **D-2** rules out a *live*
client-side preview on fidelity grounds (`Str::slug()` versus any JS slugifier diverges on `ñ`/`ç`/`ü`/
`ß`). What remains is a product call about whether an editor should see the URL their post will have.

- **(a) A read-only, per-tab display of the **persisted** slug, omitted for an untranslated tab —
  _(recommended)_.** An editor authoring for the web has a legitimate need to see the URL, it is
  presentational with no binding and no validation key, and reading the stored value can never disagree
  with what the server did. Its cost is that a *just-typed, unsaved* title shows the **old** slug until
  save, which needs a label that says so.
- **(b) No slug disclosure at all.** Simplest, matches 0063 today, and is defensible while there is no
  public storefront to visit the URL on (PRD's Out of scope). Costs the editor any visibility into an
  identifier the system derives on their behalf.
- **(c) A live client-side preview.** **Rejected on evidence**, not preference — see **D-2**.
- ⚠️ **This question interacts with R-4.** If 0061's OQ-2 resolves to **auto-suffix**, a collision is
  resolved silently server-side and the editor gets a slug they never saw and were never told about —
  which makes (a) substantially more valuable, possibly necessary. **Answer OQ-2 first.**

### Inherited open questions — listed, deliberately not resolved here

- **0061's OQ-2** (slug collision handling) — **R-4**, a hard gate rather than an inheritance.
- **0070's Q1** (must every entity always hold a default-language translation) — this story assumes its
  recommended **(a) yes**, which is what makes **D-10**'s default-required branch coherent.
- **0074's Q-1** (which language an on-the-fly tag is authored in) — **D-12** confirms its **(a)**, and
  **R-3** records the half that is still open.
- **0063's OQ-1 … OQ-7** — none touched by this story.
- **0071's R-7 / 0077's R-10** (refusal logging on the Product-side screens) — **R-11** records that
  this story takes the opposite side for the Blog folder, deliberately.

## 6. Technical tasks for later backlog creation

Derived from this debate; **none are in scope for 0079.**

1. **Write the single coherent 0063 amendment** covering all three Epic 5 retrofits (0072, 0074, 0078)
   **plus this story's** — 0078's technical task 1, **widened by R-1** to include the fourth break site
   (`$blogPost->tags->pluck('name')` in the editor's `mount()`) that 0078's own R-1(a) does not name.
   The coordinator's, not this story's.
2. **Close 0061's OQ-2 before this story reaches Phase 3, and re-scope its answer per language**
   (**R-4**). This is a gate on 0078 *and* on 0079, and 0079's version is harder because there is no
   slug field to carry a refusal.
3. **Decide `FindOrCreateBlogTag`'s post-0074 lookup shape** (**R-3**) — a real gap between 0074 and
   0063/0079 that neither file closes.
4. **Add a status-free `translatedBodyRules()` to `BlogPostValidationRules` in 0078** if **Q-1(a)** is
   adopted — a small, additive, cross-story edit.
5. **Decide refusal logging for the Product-side translation actions** (0071 **R-7**, 0077 **R-10**),
   now that the Blog side logs and the Product side does not (**R-11**). The honest unit of work is all
   of `SetProductCategoryTranslation` and `SetProductTranslation` at once.
6. **Correct 0071's `flux:tab` verification claim** (**R-13**) and check whether 0073 carries the same
   phrasing, so a later reader does not inherit a command that cannot produce its stated result.
7. **State the N-galleries cost in 0077 as well** (**D-4**) — it has the identical exposure and its
   **D-1** discusses only editor multiplicity.
8. **Retire the three flat `tests/Browser/` files** into mirrored subfolders — 0069's backlog item 5,
   still open after four Epic 5 UI stories (**D-17**).
9. **Surface "this language holds content but is no longer active"** — 0069's backlog item 3, declined
   by 0070, 0072, 0074, 0078 and every UI sibling (**D-5**). After four translation tables and four
   tabbed screens, it has been deferred by nine stories.
10. **`ModuleRouteAccessTest.php` still covers two routes while more exist** — inherited unclosed from
    0017/0018/0068/0070/0072/0074/0078, and untouched here since this story adds no route.

## Provenance

**Phase 1 Three Amigos debate, 2026-08-30.** Facilitator: `product-owner`. Classification was fixed as
**frontend** by the coordinator; this is the **last** story of a confirmed 14-story decomposition of
PRD Epic 5, and **no further decomposition was performed**. **Both amigos were dispatched as real
subagent calls and both returned full contributions**, and this file was composed **only after both
were in hand** — recorded because 0076's provenance documents a facilitator composing before its amigos
reported and being contradicted on two substantive points, and 0078's records a debate that ran with
one specialist of three.

**Nothing outside this file was created or modified.** No application code, test, view, config, lang
file or migration, and no sibling story's file — including 0021, 0058, 0059, 0060, 0061, 0062, 0063,
0068, 0070, 0071, 0073, 0074, 0075, 0077 and 0078.

### Where the two amigos converged independently — the strongest signal in this debate

Six points, each reached from opposite directions:

1. **The list and the editor need opposite eager loads and must not share a helper** (**D-7**) —
   `frontend-expert` from the contract side (*"`withTranslationsFor()` is the wrong tool for the
   editor"*), `frontend-qa` from the test side (*"if List and Editor share one query-builder helper, one
   of the two screens breaks silently"*).
2. **The `'' → null` boundary for `body`** (**D-8**) — both flagged it as a real, unstated risk, neither
   found it in 0078, 0070 or 0077.
3. **The untouched/engaged/blanked triple keyed on `title`** (**D-10**) — both produced the same table
   independently, and both singled out the body-filled-title-blank case as the one no sibling can
   demonstrate.
4. **Title carries no uniqueness rule and needs a negative control** (**D-13**).
5. **0061's OQ-2 is a hard gate, not a monitorable risk** (**R-4**).
6. **The slug premise in the coordinator's brief is false** — both were asked to challenge it and both
   confirmed it independently against the files.

### Facilitator corrections and overrules

- **V-1 — `frontend-expert` invented a sanitizer class that does not exist.** Its action sketch
  constructor-injects `SanitizeBlogPostBody` *"whatever 0061 D-14 names its sanitizer"*. **Verified
  against 0061 rather than propagated:** 0061 **D-14** reuses **0024's `SanitizeProductDescription`**
  and explicitly forbids a blog-specific allow-list, quoting 0024's own scope fence
  (*"when the blog arrives it must **reuse this configuration** rather than define a second
  allow-list"*). 0024 additionally declares that class *"the **only** class in the app that touches the
  HTML sanitizer"*. Corrected in **D-8**, with the cross-area injection recorded as intentional rather
  than as a smell.
- **V-2 — `frontend-expert`'s action sketch contained the exact bug 0078 predicts, and `frontend-qa`
  independently caught it.** The sketch validates `"bodies.{$id}" => $this->bodyRules($blogPost->status)`
  — which, since `bodyRules()` returns `required` for `Published`/`Scheduled` (0061 **D-4**), would
  demand a French body before a post could be published. That is the retroactive-unpublish problem
  0078's **Q-1** was raised to prevent and which its **backlog item 1** names by name. `frontend-qa`
  reached the opposite conclusion unprompted (*"this action accepts a blank body for any language,
  unconditionally, regardless of the post's `status`"*). **QA's reading is adopted** (**D-11**), the
  mechanism is escalated as **Q-1**, and the case is now a required test asserted against a `Published`
  post. Recorded rather than silently fixed, because a sketch that looks right and is wrong in one
  parameter is exactly what a Phase 3 author would copy.
- **V-3 — `frontend-expert`'s reasoning for "the component validates" was imprecise, though its
  conclusion stands.** It argued the 0075 exception applies *"only because 0059's actions were already
  self-validating with no prior component layer to duplicate."* That does not discriminate: 0058's
  actions self-validate too (its **D-13**) and 0073's component validates anyway. **The real
  discriminator is 0060's D-1**, a *screen-story* decision that its component neither composes the trait
  nor calls `$this->validate()` — and **0063 makes no such decision**. Corrected in **D-9**, with the
  ambiguity recorded as **R-6** rather than resolved by assertion.
- **V-4 — `frontend-qa` raised a design question neither the brief nor any sibling settles**, and the
  facilitator escalated it rather than deciding: whether the screen discloses the derived slug at all
  (**Q-2**). `frontend-expert` proposed a read-only display; `frontend-qa` identified a *live* preview
  as a fourth `Livewire::test()` blind spot. **D-2** rules out the live form on the evidence and leaves
  the read-only form to the product owner, since it is a question about what an editor needs to see.

### Facts verified by the facilitator against the real tree rather than taken from a task file

`app/Livewire/`, `app/Actions/`, `app/Models/`, `app/Concerns/`, `lang/en/`, `routes/` and
`resources/views/components/` all listed and quoted in the header block above; **no `vendor/`**;
`composer.json` requires `livewire/flux` with **no `livewire/flux-pro`**, so `flux:tabs` is a Pro
component and 0071's hand-rolled strip stands (0077 **D-11**'s finding, re-confirmed); **no tabbed
markup exists** (`grep -rnE 'flux:tab[^l]|flux:tabs|role="tab"' resources/` returns nothing) — **but
0071's own cited command returns 119 hits**, all `flux:table`, which is **R-13**; `tests/Browser/` holds
**three flat files and one mirrored**, so 0071 **D-9**'s count is still accurate and 0069 **D-17**'s is
still an under-count; 0074's second migration is `dropColumn(['name', 'normalized_name'])`, which is
what makes **R-1**'s fourth break site real; 0063 contains exactly **three** occurrences of "slug" and
**none** is a form control; and 0074 **Q-2** assigns the tag-field placement question to *"story 0061
and its UI sibling"*, which is what **D-12** closes.

**Not run by this phase**, per [workflow.md](../../docs/workflow.md): the INVEST check (Phase 2), TDD
implementation (Phase 3), security audit (Phase 4), code review (Phase 5), or the docs pass (Phase 6).
