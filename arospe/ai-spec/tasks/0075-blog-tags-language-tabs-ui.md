# [0075] Blog Tags screen — language tabs

> ## ⚠️ Read first — one resolved decision, and three questions still open
>
> Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule, these are escalated rather
> than silently assumed. **Q-1 was blocking and is now RESOLVED** (human decision, 2026-08-30); it is
> kept rather than deleted because two sibling stories briefly shipped different answers, and a later
> reader needs to know which won. **Q-2, Q-3 and Q-4 remain open**, and are unaffected by that
> resolution. Full options are in [§5's open questions](#open-questions-for-the-product-owner).
>
> 0. **Sibling story [0071](0071-product-categories-language-tabs-ui.md) was written while this debate
>    was running, and this file has been reconciled against it.** It did not exist when this debate
>    began — verified then, and the file's own timestamp is **57 seconds** before this one's. It is
>    the same pattern for Product Categories, it names 0075 by number as a consumer, and **most of its
>    decisions are adopted here** (see **R-1** for the full adopted/diverged table). Two of its
>    decisions **overturned** conclusions this debate had reached: tab switching (**D-7**) and how a
>    blanked field behaves (**D-8**).
> 1. ✅ **Q-1 — RESOLVED by the human, 2026-08-30. A dedicated backend action, and the component
>    authorizes too.** The confirmed rule is *defence in depth: authorized and validated on both the
>    front and the back*, established for real in 0071's **D-4** and generalised to the four siblings
>    in its **D-13**. This story's **D-3** had proposed the action and was right; it is now **confirmed
>    rather than recommended**. **D-13 addresses this screen by name**: because 0060's **D-1**
>    structurally forbids this component from validating, there is no component-side *validation* layer
>    to add — and defence in depth still holds, because the **action is self-sufficient by
>    construction**, authorizing and validating regardless of what any caller did. The component still
>    **authorizes**. The test is *"if I delete the component, is the operation still protected?"* — and
>    here it is. See **D-3**, and **D-12** for the error-key consequence this resolution creates.
> 2. **Q-2 — Whether 0075 should exist as a separate story at all** (`frontend-expert`'s zero-order
>    finding). 0060's component binds a `public string $name` to `blog_tags.name`, a column 0074
>    **deletes**. So 0060-as-written is broken the moment 0074 lands, whichever ships first. This is
>    0074's own **R-1** ("is this a retrofit at all?") recurring one layer up. **Not acted on** — the
>    14-story decomposition is confirmed and this debate does not reopen it — but recorded so the
>    product owner meets a decision rather than a silence.
> 3. **Q-3 — What happens on Save when one language validates and another does not.** **D-9** decides
>    all-or-nothing; it is product-visible and Phase 2 should ratify it rather than inherit it.

## Description

Add per-store-language name editing to the Blog Tags management screen that story
[0060](0060-blog-tags-ui.md) specifies, so an administrator can provide a tag's `name` in every
**active** store language through language tabs — [PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization):
*"Each active store language then appears as a **tab** … (and in the taxonomy management screens),
switching the translatable fields in place"*, and *"**Category and tag names** … each becomes a
per-store-language field with the same tab-based editor UX."*

It consumes story [0074](0074-translatable-content-retrofit-blog-tags-backend.md)'s
`blog_tag_translations` retrofit and story [0070](0070-translatable-content-mechanism-product-categories-backend.md)'s
`HasTranslations` / `SetTranslation` mechanism, and story [0068](0068-store-languages-catalog-backend.md)'s
`StoreLanguage::active()` scope. It adds **one** backend artifact — the authorizing, validating write
path none of those three ships (**Q-1**, **D-3**).

> **This story answers a question three backend stories left open, and it is the *second* to do so.**
> [0070's **Q3**](0070-translatable-content-mechanism-product-categories-backend.md) — *"which story
> owns the language-tabs UI for the taxonomy screens?"* — was recorded with **no recommendation**,
> explicitly because that debate could not see the 14-story plan. 0072, 0076 and 0078 each re-raise it
> unresolved. This story closes it for Blog Tags with 0070's option **(a)**, a dedicated Epic 5 UI
> story per taxonomy.
>
> ⚠️ **On sibling precedent, stated precisely because the fact changed mid-debate.** When this debate
> opened, neither `0071-product-categories-language-tabs-ui.md` nor
> `0073-blog-categories-language-tabs-ui.md` existed in `ai-spec/tasks/` — verified, and both amigos
> were briefed on that basis, so their contributions were made with **no** sibling to follow. **0071
> was written concurrently and landed before this file was saved.** It has been read in full and
> reconciled against; this story now **consumes** its shared tab-strip component rather than
> re-deriving one. `0073` still does not exist. The adopted/diverged breakdown is **R-1**.

## Type

**fullstack (related_task_id: 0074)** | includes database-expert: **no** (no migration, no column, no
index — `blog_tag_translations` is 0074's)

> ✅ **Confirmed, not proposed.** The brief fixed this as **frontend** and it was debated as such
> (`frontend-expert` + `frontend-qa`, per
> [workflow.md](../../docs/workflow.md#task-classification-rule)'s Frontend rule). The human's
> 2026-08-30 decision on **Q-1** settles it the other way: **D-3** adds
> `App\Actions\Blog\SetBlogTagTranslation`, so this is not frontend-only work by this project's own
> definitions. The shape is not unprecedented — 0060 is typed `frontend | fullstack
> (related_task_id: 0059)`. ⚠️ **The one real consequence: the story's single backend class was
> designed in a debate with no `backend-expert` and no `backend-qa` in it.** Phase 2 should add a
> `backend-qa` pass over `SetBlogTagTranslationTest.php` specifically — backlog item 4.

## PRD coverage

| PRD Epic 5 element | Owned here |
| --- | --- |
| *"Each active store language surfaces as a tab … in the taxonomy management screens"* | ✅ for **Blog tags** |
| *Scenario Outline: Taxonomy names are translatable per store language* — the `Blog tag` example row | ✅ this story |
| The same outline's `Product category` / `Blog category` rows | ❌ stories **0071** / **0073** (unwritten) |
| *"A missing translation falls back to the default store language"* | ✅ as **rendering**; the mechanism is 0070's |
| *Switching an editor's language tab switches only translatable fields* | ✅ trivially — a tag has exactly one translatable field and no non-translatable one (**D-6**) |
| *"Removing a store language warns before affecting translations"* | ❌ story **0069** (the Store Languages screen). This story only honours the **consequence**: a removed language gets no tab (**D-5**) |
| Product / Blog **post** editors' tabs | ❌ stories **0027** / **0063** and their Epic 5 pairs |

## Three Amigos participants

`product-owner` (facilitator) + `frontend-expert` + `frontend-qa`, per
[workflow.md](../../docs/workflow.md#task-classification-rule)'s Frontend classification. **Both were
dispatched as real subagents and both returned.** No `backend-expert` or `database-expert` was
convened — which, given **D-3**, is itself a finding and is recorded as **Q-1** rather than papered
over: the one backend artifact this story needs was designed by a frontend expert and has had no
`backend-qa` test-design pass.

Nothing outside this file was created or modified. Stories 0060, 0071, 0073 and 0074 are untouched.

## 1. Refined user story

> **As** a blog editor working in a store that publishes in more than one language,
> **I want** to provide each tag's name in every active store language from one place,
> **so that** the tag catalog reads correctly in every language the store authors in, without my
> having to leave the tag screen or guess which names are still missing.

> **As** the engineer building the first of three taxonomy language-tab screens,
> **I want** the tab strip, the per-language write path and the untranslated-state rendering settled
> once, against a screen with exactly **one** translatable field,
> **so that** Product Categories and Blog Categories copy a proven shape instead of each inventing
> one, and the harder multi-field editors inherit a pattern rather than a precedent argument.

## Gherkin — 2. Detailed acceptance criteria (Given/When/Then)

Every scenario opens with a named business-role actor — **"a blog editor"**, the actor PRD Epic 4,
0059, 0060 and 0074 all already use — and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Per-store-language names on the blog tag screen

  # --- The tab strip ---

  Scenario: A blog editor sees one tab per active store language
    Given a blog editor, with Spanish, English and French active as store languages
    When they open the edit form for a blog tag
    Then they see one language tab for each of Spanish, English and French

  Scenario: A removed store language is offered no tab
    Given a blog editor, with German removed as a store language
    When they open the edit form for a blog tag
    Then no German tab is shown

  Scenario: The store default language's tab is the one shown first
    Given a blog editor, with Spanish as the store default and French also active
    When they open the edit form for a blog tag
    Then the Spanish tab is the active tab

  # --- Reading a translation, and reading its absence ---

  Scenario: A blog editor sees a stored translation in its own tab
    Given a blog editor, with a tag named "running" in Spanish and "course à pied" in French
    When they open that tag's French tab
    Then the French name field reads "course à pied"

  Scenario: An untranslated language shows an empty field rather than the default's name
    Given a blog editor, with a tag named "running" in the default store language and no French translation
    When they open that tag's French tab
    Then the French name field is empty and the store default's "running" is shown only as guidance

  Scenario: A tag untranslated in the store default is listed without a name
    Given a blog editor, with a tag named only in French and Spanish as the store default
    When they open the blog tag screen
    Then that tag is listed with a placeholder instead of a name

  # --- Writing a translation ---

  Scenario: A blog editor translates a tag into an additional language
    Given a blog editor holding the blog edit permission, with French active as a store language
    When they save the tag with its French name set to "course à pied"
    Then the French translation is stored alongside the existing Spanish one

  Scenario: Re-translating a tag replaces its existing translation for that language
    Given a blog editor, with a tag already named "course à pied" in French
    When they save the tag with its French name changed to "trail"
    Then the French translation reads "trail" and no second French translation exists

  Scenario: Leaving an untranslated language untouched creates no translation
    Given a blog editor, with a tag named "running" in the default store language and no French translation
    When they save the tag with only its Spanish name edited
    Then no French translation is created

  Scenario: A blog editor translates a tag into two languages in one save
    Given a blog editor, with English and French active as store languages
    When they save the tag with both its English and French names filled in
    Then both translations are stored

  Scenario: Clearing an existing translation is refused
    Given a blog editor, with a tag named "course à pied" in French
    When they save the tag with the French name field emptied
    Then they are shown a validation message on the French name field
    And the French translation still reads "course à pied"

  Scenario: Leaving the store default language's name empty is refused
    Given a blog editor, with Spanish as the store default
    When they save a tag with its Spanish name field emptied
    Then they are shown a validation message on the Spanish name field

  # --- Refusals ---

  Scenario Outline: A duplicate name within one store language is refused
    Given a blog editor, with the tags "course à pied" and "randonnée" both named in French
    When they save "randonnée" with its French name set to <colliding_name>
    Then they are shown a validation message on the French name field
    And "randonnée" keeps its French name

    Examples:
      | colliding_name  |
      | "course à pied" |
      | "Course à pied" |

  Scenario: The same name in two different store languages is accepted
    Given a blog editor, with a tag named "running" in French
    When they save a different tag with its Spanish name set to "running"
    Then the change is accepted

  Scenario: A tag keeps its own name when re-saved in the same language
    Given a blog editor, with a tag named "course à pied" in French
    When they save that same tag with its French name unchanged
    Then the save is accepted rather than refused as a duplicate

  Scenario: A refusal in one language discards the whole save
    Given a blog editor editing a tag's Spanish and French names, where the French name duplicates another tag
    When they save the tag
    Then neither the Spanish nor the French name is changed

  Scenario: A refusal on a hidden tab brings that tab forward
    Given a blog editor viewing the Spanish tab, having entered a duplicate French name
    When they save the tag
    Then the French tab becomes the active tab and shows the validation message

  Scenario: A refused name in the store default language is shown on its own tab
    Given a blog editor, with Spanish as the store default and another tag already named "running"
    When they save a tag with its Spanish name set to "running"
    Then they are shown a validation message on the Spanish name field

  # --- Creating ---

  Scenario: A blog editor creates a tag in the store default language
    Given a blog editor holding the blog create permission
    When they submit a new blog tag named "running"
    Then the tag holds exactly one translation, in the store default language

  Scenario: The create form offers no language tabs
    Given a blog editor, with Spanish, English and French active as store languages
    When they open the form to create a blog tag
    Then a single name field is shown and no language tabs appear

  # --- Authorization ---

  Scenario: An administrator without the blog edit permission cannot translate a tag
    Given a signed-in administrator who does not hold the blog edit permission
    When they attempt to save a tag's French name
    Then the attempt is refused

  Scenario: An administrator needs no store-language permission to translate a tag
    Given a blog editor holding the blog edit permission and no store-language permissions
    When they save a tag's French name
    Then the translation is stored, because authoring content is not managing the language catalog

  Scenario: A removed store language cannot be written to
    Given a blog editor, with German removed as a store language
    When they attempt to save a German name for a tag
    Then the attempt is refused
```

> **Two scenarios deliberately absent, both of which would be ghost scenarios under
> [rule 6](../../docs/testing/frontend/gherkin-guidelines.md#6-no-ghost-scenarios).**
> **(a) "A blog editor creates a tag in several languages at once."** `frontend-qa` flagged this
> explicitly and declined to write it; `frontend-expert` reached the same place from the other
> direction. `CreateBlogTag::__invoke(string $name)` writes the default language only and 0074's
> **D-7** keeps that signature deliberately, so the capability does not exist and PRD describes no
> such action (**D-6**).
> **(b) "Removing a store language warns the editor about this screen's translations."** That warning
> is story 0069's screen, and 0068's **D-8** `translationUsageCount()` is what feeds it. This story
> owns only the consequence — the tab disappears — which *is* scripted above.

## Files to create/modify

**Owned by this story:**

| Path | Change | Why |
| --- | --- | --- |
| `app/Actions/Blog/SetBlogTagTranslation.php` | **New.** | The authorizing, validating per-language write path that does not exist today (**D-3**, **Q-1**). |
| `app/Livewire/BlogTags/Index.php` | **Modify** (0060's). | `public array $names`, `public string $activeLanguageId`, `#[Locked] $originalTranslatedLanguageIds`, the new **`setActiveLanguageTab(string $languageId)`** the shared strip hardcodes, and the rewritten `save()` / `loadTags()` (**D-4**, **D-7**, **D-8**). |
| `resources/views/livewire/blog-tags.blade.php` | **Modify** (0060's, the *flat* path). | Renders `<x-language-tab-strip>` (**0071's**, consumed not authored) plus one panel per active language, and the list's untranslated placeholder (**D-1**, **D-2**, **D-8**). |
| `resources/views/components/language-tab-strip.blade.php` | **NOT touched — 0071's.** | Consumed at its prop contract `['languages', 'active', 'errorLanguageIds']`. If this story needs it changed, that is a change to 0071's component with three other consumers — raise it, do not fork it. |
| `lang/en/blog-tags.php`, `lang/es/blog-tags.php` | **Modify** (0060's). | Tab labels, the fallback-guidance string, the untranslated list placeholder. Key-for-key identical. |
| `tests/Feature/Blog/BlogTagsIndexTest.php` | **Modify** (0060's). | Rewritten — see the disposition table in §3. |
| `tests/Feature/Blog/BlogTagsIndexRenderingTest.php` | **Modify** (0060's). | Tab rendering, the negative structural assertions. |
| `tests/Feature/Blog/SetBlogTagTranslationTest.php` | **New.** | The new action's own authorize / validate / uniqueness / `23000` tests — one file per action, the 0059/0074 precedent. |
| `tests/Browser/BlogTags/IndexTest.php` | **Modify** (0060's, path per its **V-1**). | The three cases only a real browser can prove (§3). |

**Explicitly NOT touched:**

| File | Owner | Note |
| --- | --- | --- |
| `database/migrations/*`, `app/Models/BlogTag.php`, `app/Models/BlogTagTranslation.php` | 0074 | This story adds no column and no model. |
| `app/Concerns/BlogTagValidationRules.php` | 0059, **re-signed by 0074** | Consumed at its **post-0074** signature (**R-4**). Not edited here. |
| `app/Actions/Blog/{Create,Rename,Delete,FindOrCreate}BlogTag.php` | 0059 / 0074 | Signatures unchanged. `FindOrCreateBlogTag` is **never called** by this screen (0060's fence, still binding). |
| `app/Concerns/HasTranslations.php`, `app/Actions/Translations/SetTranslation.php` | 0070 | Consumed unmodified — a sibling is a consumer, never a re-implementer. |
| `app/Models/StoreLanguage.php` | 0068 | Read-only consumer of `scopeActive()` and `defaultStoreLanguage()`. |
| `app/Policies/BlogTagPolicy.php`, `database/seeders/RolePermissionSeeder.php` | 0059 / 0002 | **No new ability, no new permission.** Verified: `blog` is already in the shipped `MODULES`, so the catalog stays at **42** and `Administrator` at 41 of 42 (**D-11**). |
| `routes/blog-tags.php`, `config/modules.php`, `lang/{en,es}/navigation.php` | 0060 | The route, the `blog` sidebar group and its registry entry are 0060's. **Verified: `config/modules.php` holds three groups / four items and no `blog` group today.** This story adds none. |
| `resources/views/components/sidebar-nav.blade.php` | 0013 | Append data to the registry, never edit the reader. |
| Product categories / blog categories / blog posts | 0025 / 0062 / 0063 and their Epic 5 pairs | **R-1**. |

### The one new backend artifact

```php
App\Actions\Blog\SetBlogTagTranslation::__invoke(
    BlogTag $blogTag, StoreLanguage $storeLanguage, string $name
): BlogTagTranslation
```

**The full contract, its five properties and what it must not re-derive are in [D-3](#4-documented-functional-decisions)** —
deliberately stated once rather than quoted twice, since two copies of one contract in one file is the
drift this project's conventions spend most of their effort preventing. In summary: it authorizes
`update` on the **`BlogTag`** (never on the translation row), validates with 0074's re-signed
`nameRules()`, derives its error key as `names.{$storeLanguage->id}` (**D-12**), constructor-injects its
collaborators, refuses an inactive store language itself rather than trusting the tab strip (**D-5**),
and is the **only** class in the story that imports `SetTranslation`.

## 3. QA test cases / validation scenarios

Levels per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md). **The calibration
0060 set still binds and is inherited deliberately**: this plan does not re-run 0074's suite one layer
up. 0074 proves normalisation, trimming, boundary, race and per-language uniqueness exhaustively at
the action layer; this story asserts that the **screen routes into the same shared rule**, with named
canaries.

### Which of 0060's test cases stop being valid

`frontend-qa`'s finding, and it is **real scope rather than a byproduct** — the same warning 0074's
**R-7** issues about 0059's suite, arriving one layer up.

| 0060 test case | Disposition under 0074 + this story |
| --- | --- |
| *"Each row exposes exactly `{id, name, canEdit, canDelete}`"* | **Rewritten.** `name` is no longer a column; it is `translated('name')` resolved for the store default, and may be `null` (**D-8**). |
| *"A valid name persists exactly one row"* | **Rewritten** — one `blog_tags` row **and** one `blog_tag_translations` row, in the default language. |
| *"Blank / whitespace-only names produce `assertHasErrors(['name'])`"* | **Split.** The create path keeps the `name` key; the edit path's key is now per-language (**D-7**). |
| *"A duplicate name (exact case)"*, and the case / accent canaries | **Rewritten per language** — a duplicate *within* one language errors; the identical string in a *different* language does not. |
| *"One length-boundary canary"* | **Survives**, retargeted at a per-language field. 0060's **OQ-2** (derive the maximum from the shared constant) still applies. |
| *"`save()`'s injected actions are `CreateBlogTag` / `RenameBlogTag`, never `FindOrCreateBlogTag`"* | **Extended**, not replaced — `SetBlogTagTranslation` joins the allow-list and `FindOrCreateBlogTag` stays forbidden. |
| The four rename tests, including the `#[Locked]` retarget test | **Re-derived per language.** The retarget test must throw *whichever* tab is active. |
| *"The create/edit modal contains exactly **one** input and no `<select>`"* | **Inverted.** The edit modal now holds **N** inputs, one per active language. Rewritten to assert exactly N — see the negative assertion below. |
| `blog-tag-name-input` as a single hook | ⚠️ **Corrected 2026-08-30 — split by screen, not replaced everywhere.** The **create** form is unchanged (see the row above and the acceptance criteria below: one field, `CreateBlogTag`, no tab state) and keeps the bare `blog-tag-name-input` hook. Only the **edit** modal's hook becomes `blog-tag-name-input-{storeLanguageId}` (**D-10**), one per active language. Every browser test filling the *edit* form's field is rewritten; the create form's own test is untouched. This corrects an internal contradiction a sibling coordination pass found: this table previously read as if the hook changed everywhere, which conflicts with "create is unchanged: one field... no tabs" stated elsewhere in this file. |
| Everything about the delete modal (0060's **D-2**, its signature negative assertions) | **Untouched.** Deletion is not translatable and this story does not go near it. |
| `tests/Feature/Policies/BlogTagPolicyTest.php` | **Untouched** — no new ability. |

### Feature — `tests/Feature/Blog/SetBlogTagTranslationTest.php` (new)

**Every case here is a *direct call* on the action, never through the component** — that is the whole
point of layer 2 (**D-3**). If any case in this file needs `Livewire::test()` to set it up, the rule
under test has leaked back into the caller.

- [ ] **The action is self-sufficient: called directly, with no component anywhere, it still refuses an
      unauthorized actor and still refuses an invalid name.** *Why it can fail:* this is the entire
      justification for the human's two-layer decision, and it is the one assertion that would still
      pass if someone "simplified" the validation back into `save()` — no, precisely: it is the one
      that would **fail**, and nothing else would. It is the file's reason to exist.
- [ ] Writes a translation in the named language and leaves every other language's row untouched.
- [ ] Re-invoking for the same language **updates** rather than inserting a second row.
- [ ] Refuses without `blog.edit`; a Super Admin holding zero permission rows passes via `Gate::before`.
- [ ] Requires **no** `store-languages.*` permission — 0074's **D-12** boundary, asserted directly.
- [ ] Refuses an **inactive** store language (**D-5**). *Why it can fail:* the component filters the
      tab strip, so an action trusting its caller passes every UI-driven test and fails only against a
      forged payload.
- [ ] Per-language uniqueness: same normalised name in the same language refused; the **byte-identical**
      string in a different language accepted. *Why this exact pairing:* it is the only test proving
      the scope is per-language, and a fixture differing in case would pass under a rule that ignores
      language scoping entirely, because the incidental difference would be doing the work (0074's own
      framing).
- [ ] Re-saving the tag's **own** name in the same language is accepted — 0074's **D-6** exclusion
      keying on `blog_tag_id`, exercised for the first time from a real caller.
- [ ] **The wrong-id canary**, deliberate rather than implicit (0074 **D-6**/**R-5**): tags A and B
      both named in French; re-save A's French name unchanged; assert success. A generic self-rename
      test catches this too, but *"A collided with itself"* is a far faster diagnosis from failure
      output alone.
- [ ] A forged `store_language_id` producing a **foreign-key** `23000` is not misattributed as a
      duplicate-name validation error. *Why:* the table carries two `UNIQUE`s and two FKs, so a
      blanket `23000` → "name taken" translation is wrong.
- [ ] Blank / whitespace-only refused on **every** language path, not only the default.
- [ ] **The error key is `names.{storeLanguageId}` and is *derived* from the passed language, not
      accepted as a parameter** (**D-3**, 0071 **D-13**). *Why it can fail:* a caller-supplied key is
      the shape [errors-log.md](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20)
      records as making a guard only as strong as its call sites, and it would let the component
      silently point a refusal at the wrong tab.
- [ ] Every refusal writes exactly one `Log::warning('Privileged action refused', …)` with
      `target_type: 'blog_tag'`.

### Feature (component) — `tests/Feature/Blog/BlogTagsIndexTest.php`

- [ ] **`openEditModal()` populates `$names` from the raw translation rows, not from `translated()`.**
      Arrange a tag with a Spanish name and no French row; assert `$names[$frenchId] === ''`, **not**
      the Spanish string. ***The single most important test in this story*** — see **D-2** and **R-2**.
- [ ] `$names` holds a key for **every** active store language, including untranslated ones, and every
      value is a string. *Why:* an omitted key desyncs Livewire's array dehydration; a `null` is the
      generalised form of the hazard [errors-log-archive.md](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16) records.
- [ ] `$names` holds **no** key for an inactive store language.
- [ ] **Saving with an untranslated tab left empty creates no translation row for it.** Assert the
      tag's translation **count** is unchanged. *Why it can fail:* any implementation that submits
      every tab's displayed value passes every other test in this file and fails only this one.
- [ ] Saving two languages in one submit writes both, and authorizes **once per language written** —
      not once for `$activeLanguageId`. *Why it can fail:* a gate keyed on the active tab lets a forged
      multi-language payload smuggle a write into a language never authorized.
- [ ] Emptying a previously-translated field **does not delete** the existing translation (**D-8**).
- [ ] A refusal in one language leaves **every** language unwritten (**D-9**), asserted against the
      database, not the error bag.
- [ ] The errored language becomes `$activeLanguageId` (**D-7**).
- [ ] **A refused *default-language* edit renders its message on the default tab's field** — the
      **D-12** adapter, asserted with `assertHasErrors(['names.'.$defaultId])` and explicitly
      `assertHasNoErrors(['name'])`. ***The second-highest-value test in this story.*** *Why it can
      fail:* `RenameBlogTag` throws on `name` while the field binds to `names.{id}`, and without the
      re-key the modal stays open showing **nothing** — and because this component performs no
      validation of its own, that is not a rare race here but the **ordinary** path for every blank,
      duplicate or over-length default-language name.
- [ ] The **create** path still errors on the bare `name` key and needs no adapter (**D-12**) — the
      negative control that stops someone "unifying" the two paths.
- [ ] **The component authorizes even though it does not validate** (**D-3** layer 1): a denied actor is
      refused by `save()` before any action is constructed. *Why it can fail:* reading 0060's D-1 as
      "the component does nothing" is the exact misreading 0071's **D-13** was written to prevent.
- [ ] A forged `$activeLanguageId` naming an inactive or unknown language does not reach a write.
- [ ] The list's displayed name resolves for the **store default**, asserted with two *different*
      fixture strings across two languages. *Why:* a non-null assertion passes against a resolver that
      picked the first translation row it found.
- [ ] A tag with no default-language translation lists a placeholder and raises no error (**D-8**,
      0074's **R-9**).
- [ ] The `#[Locked]` retarget test from 0060, re-run with a non-default tab active.
- [ ] Create is unchanged: one field, `CreateBlogTag`, exactly one translation row in the default
      language, and **no** tab state touched.

### Feature (rendering) — `tests/Feature/Blog/BlogTagsIndexRenderingTest.php`

- [ ] One tab per active store language, selected by the shared strip's own
      `data-test="language-tab-{storeLanguageId}"` (**D-10**) — **never** by counting rendered strings,
      and never by matching a language name or two-letter code (0071 **D-11**).
- [ ] **Negative:** an inactive language has **no** tab and **no** input. The inverse of 0060's own
      "exactly one input" guard: here the stray element is an editing surface for a language the store
      no longer authors in.
- [ ] Exactly **N** `blog-tag-name-input-{id}` hooks for N active languages.
- [ ] Every per-language input is present in the DOM regardless of which tab is active, so a test can
      select any language's field without first driving a tab click (**D-1**).
- [ ] An untranslated tab renders the store default's value as **guidance** (a `placeholder`), never as
      the field's value — asserted on the attribute, not on page text (**D-2**, **R-3**).
- [ ] A validation error renders against the failing language's own field.
- [ ] The active tab is marked structurally (`aria-selected` / a `data-test` state hook), not by a CSS
      class substring (**R-3**).
- [ ] Row action hooks and the whole delete modal are **unchanged** from 0060 — re-asserted because the
      row shape changed underneath them.
- [ ] A disabled control is matched by `disabled="disabled"`, never a bare `disabled` substring —
      0060's **R-4**, unchanged, and now recurring at each new tab control.

### Browser — `tests/Browser/BlogTags/IndexTest.php`

Only cases a real browser can prove; `Livewire::test()->set()` writes the property directly and never
goes through a compiled `wire:model` or `wire:click`.

- [ ] **Switching tabs preserves an unsaved edit.** Type into French, click the Spanish tab, click
      back; assert the French text survived. ***The highest-value browser test*** — it is the entire
      justification for **D-7**'s client-side switching, and no component test can observe it.
- [ ] Filling two languages across a real tab click and saving; re-opening shows both. Proves
      `wire:model` on a **dynamic array key** actually delivers the typed value (**R-5**).
- [ ] A duplicate name in a **hidden** tab: save while a different tab is visible, assert the errored
      tab comes forward and its message is visible (**D-7**, **R-3**).
- [ ] One continuous smoke pass — open edit → switch tabs → save → cancel — with
      `assertNoJavaScriptErrors()` after every step.

> **Browser rules that bind this file**, from
> [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded):
> `->waitForEvent('networkidle')` is **banned outright**; a short bounded `->wait(n)` with a stated
> reason is the one accepted mitigation. Read the DOM's own `[wire:snapshot]` ground truth rather than
> waiting longer.

### Fixtures

```php
$spanish = StoreLanguage::factory()->default()->create();   // is_default + is_active
$english = StoreLanguage::factory()->create();
$french  = StoreLanguage::factory()->create();
$german  = StoreLanguage::factory()->inactive()->create();  // "removed" — D5 of 0068
```

Both factory states are 0068's. Translation rows are arranged through
`BlogTagTranslationFactory::forLanguage()` (0074's), **never** by hand-building the
`(blog_tag_id, store_language_id)` pair.

⚠️ **`StoreLanguage::defaultStoreLanguage()`'s static memo must be reset between tests** — 0070's
**R-6**, inherited by 0074 as its **R-10**. `frontend-qa` spelled out the failure: the first test in a
process to resolve the default "wins" for every later test, so a test creating its own `default()`
language silently resolves the fallback against a **torn-down** row id — or, worse, a coincidentally
still-valid one from another fixture, giving a green test asserting against the wrong row. **The reset
mechanism itself is 0070's to ship and must be confirmed at Phase 3**; the obligation to call it is
not in doubt.

### Deliberately NOT tested here

- **0074's per-language uniqueness matrix in full**, its whitespace canaries, and `NormalizeForSearch`'s
  folding table — action-layer, 0074's and 0022's. Named canaries only, per 0060's calibration.
- **`HasTranslations`' generic mechanics** — the bounded eager load, the memo, the per-field fallback
  contract. 0070's, tested once against `ProductCategory`. This story proves only that the screen
  *wires into* them.
- **`SetTranslation` in isolation**, including its deliberate lack of authorization — 0070's **D-9**.
- **`BlogTagPolicy`'s allow/deny matrix** — 0059's. Wiring tests only.
- **The backfill, the migrations, the `translation_relations` drift guard** — 0074's / 0070's.
- **`StoreLanguage`'s CRUD, its invariants and the removal warning** — 0068's and 0069's.
- **The sidebar registry cross-check** — 0018 verified the two generic drift guards pick a new entry
  up for free, and this story adds no entry at all.
- **The delete flow** — 0060's, untouched.

## Expected outcome

A blog editor opening a tag's edit form sees one tab per **active** store language, the store
default's tab first. Each tab holds that language's stored name, or an **empty** field when the tag is
untranslated there — with the default's name offered as guidance rather than pre-filled, so nothing is
written that the editor did not type. They fill in any subset of languages and save once; only the
languages they actually changed are written, and a refusal in any one of them discards the whole save
and brings the offending tab forward with its message.

Names remain unique **per store language**, so two tags may not both be "course à pied" in French
while either is free to be "course à pied" in Spanish. The list column shows each tag's name in the
store default language, with a placeholder — never a blank or an error — for a tag not translated
there, which after a store-default change may be most of the catalog.

Creating a tag is **unchanged**: one field, one translation, the store default language. An
administrator without `blog.edit` is refused at the action, and every refusal is recorded with
`target_type: 'blog_tag'`. A removed store language keeps its stored translations readable and gains
no tab, and cannot be written to even by a forged payload.

## Acceptance criteria

- [ ] The edit form renders **0071's shared `<x-language-tab-strip>`**, one tab per
      `StoreLanguage::active()` row, ordered default-first, each carrying the strip's own generic
      `data-test="language-tab-{storeLanguageId}"`; a removed language has no tab and no input.
- [ ] `App\Livewire\BlogTags\Index` exposes **`setActiveLanguageTab(string $languageId)`**, the method
      name the shared strip hardcodes, and tab switching is a server round trip (**D-7**).
- [ ] Each per-language input carries `data-test="blog-tag-name-input-{storeLanguageId}"`, and **no
      assertion anywhere in this story matches on a language name or a two-letter code** (0071 **D-11**).
- [ ] **The form is populated from raw `blog_tag_translations` rows. `translated()`'s fallback is
      never used to fill an input** — an untranslated language's field is empty, and the default's
      value appears only as a `placeholder`.
- [ ] Saving writes only the languages whose value changed; an untouched untranslated tab creates no
      row. Blanking follows **D-8**'s three branches — the default language and any
      previously-translated language are `required`, so clearing either is **refused**, never a silent
      no-op and never a delete.
- [ ] A validation refusal in any language leaves **every** language unwritten, and the errored
      language becomes the active tab.
- [ ] Name uniqueness is enforced per store language, through `nameRules()` at its post-0074 signature;
      the same name in two languages is accepted and a tag re-saving its own name is accepted.
- [ ] **`App\Actions\Blog\SetBlogTagTranslation` is self-sufficient**: it authorizes
      `BlogTagPolicy::update` through `LogRefusedPrivilegedAttempt` **above** its `SetTranslation`
      call, runs its own `Validator` using 0074's re-signed `nameRules()`, derives its error key as
      `names.{storeLanguageId}` rather than accepting one, and refuses an inactive store language —
      all of it true when called directly, with no component involved.
- [ ] **The component authorizes the whole batch before any action runs**, as layer 1, and does **not**
      validate (0060 **D-1**). Deleting the component must not leave the operation unprotected.
- [ ] **No component imports `SetTranslation`** — it is reached only from
      `SetBlogTagTranslation` (0071 **D-13**).
- [ ] A refused **default-language** edit is re-keyed `name` → `names.{defaultId}` so it renders on the
      default tab (**D-12**); the create path keeps the bare `name` key and gains no adapter.
- [ ] Per-row `canEdit`/`canDelete` still come from the same policy methods the mutating methods use.
- [ ] The list resolves each name for the **store default** language — never the admin UI locale — and
      renders a placeholder when it resolves to `null`.
- [ ] The create form is unchanged: one field, `CreateBlogTag`, no tabs.
- [ ] `closeModal()` resets the tab state and the whole `$names` array, and calls `resetValidation()`.
- [ ] No `wire:model`-bound value is ever `null`, and every active language has an explicit `''` key.
- [ ] `FindOrCreateBlogTag` is not referenced anywhere in this story.
- [ ] No migration, model, policy, factory, seeder, permission, route or `config/modules.php` change;
      the catalog stays at **42**.
- [ ] Copy lives in `lang/{en,es}/blog-tags.php`, key-for-key identical across both locales.

## Definition of Done

- [ ] Tests written and green, plus the **full** suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md#full-test-suite-gate-rule)'s Full Test Suite Gate Rule.
- [ ] **All three quality gates run unscoped and each result recorded, including "not run"** —
      `php artisan test`, `vendor/bin/pint --format agent`, `vendor/bin/phpstan analyse` (Larastan
      level 7). The third is the one nothing else prompts you to run; see
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26).
- [ ] **Stories 0060, 0068, 0070 and 0074 are closed first**, and **every** interface claim in this
      file re-verified against `HEAD` with its disposition recorded — **R-4**, and the
      [deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23).
- [ ] **Q-1 answered before Phase 3**, since it decides whether `SetBlogTagTranslation` is built here
      or consumed.
- [ ] Code reviewed (code-reviewer). Point the review at **D-2** (the population rule), **D-9**
      (atomicity) and **D-1** (the tab mechanism, once Flux's real component set is known).
- [ ] No security findings (appsec-auditor). Point the audit at: `SetBlogTagTranslation`'s gate sitting
      **above** the `SetTranslation` call; authorization firing once **per language written**; the
      inactive-language refusal living in the **action**, not only the view; and `$activeLanguageId` /
      `$editingTagId` staying `#[Locked]`.
- [ ] Documentation updated (docs-keeper) — at minimum
      [api/routes.md](../../docs/api/routes.md) (the `blog-tags.index` subsection gains the tab
      contract and its hooks), [architecture/authorization.md](../../docs/architecture/authorization.md)
      (recording again that translated content adds **no** ability, and that
      `SetBlogTagTranslation` is the first action to authorize a write it delegates to a primitive that
      does not), and [conventions/naming.md](../../docs/conventions/naming.md) if `SetBlogTagTranslation`
      sets a naming precedent for its two siblings.
- [ ] **0070's Q3 marked answered** for Blog Tags, so 0071/0073 inherit a decision rather than
      re-litigating it.
- [ ] Acceptance criteria met.

## 4. Documented functional decisions

**D-1 — The tab strip is *consumed* from story 0071, not built here.** 0071's **D-1** extracts the
strip as a shared anonymous Blade component (`language-tab-strip.blade.php`) with the prop contract
`['languages' => Collection, 'active' => string, 'errorLanguageIds' => array<int, string>]`, and it
names 0073/0075/0077/0079 by number as the consumers. **This story is the second instance, so it
consumes rather than re-derives** — which is also what turns 0071's extraction from a guess into a
verified factoring. Two obligations come with it: the component **hardcodes a call to
`setActiveLanguageTab(string $languageId)`**, so `App\Livewire\BlogTags\Index` must expose a method by
exactly that name (**D-7**); and the strip owns its own `data-test="language-tab-{id}"` hook, which is
generic rather than domain-prefixed (**D-10**).

*What this decision replaced.* This debate had independently concluded — on `frontend-expert`'s
analysis and story [0069](0069-store-languages-settings-ui.md)'s **D-3** precedent — that the strip
should be built from `flux:button`, because `composer.json` requires only the **free** `livewire/flux`
`^2.13.1` (no `flux-pro`, no private repository), `vendor/` is absent, and a repo-wide grep finds **no
`flux:tab` anywhere**. That reasoning is not withdrawn — it is now **0071's to own**, and it should be
what the shared component is built from. ⚠️ Two things carry forward regardless of who builds it: *if
Phase 3 confirms `flux:tabs` ships in the Free tier*, swapping the strip's internals is a safe cosmetic
follow-up, since the hooks and behaviour are the contract rather than the element; and **no `role="tab"`
/ `aria-selected` markup exists anywhere in this repo today** (verified), so accessible tab semantics
are genuinely new and must be authored deliberately rather than assumed to come with a component.

**D-2 — Every per-language input is populated from its own stored translation row, never from
`translated()`. This is the single most important decision in the story.** `HasTranslations::translated()`
is the documented read API and returns the **fallback** when a language has no row — which is correct
for *rendering* and catastrophic for *populating a form*. `frontend-qa` identified the consequence and
ranked it its highest-value test: a tab showing the fallback is byte-identical to a tab showing a real
translation, so an implementation that populates inputs with `translated()` and then submits every
tab's value writes the **default language's string into every other language**, permanently, the first
time anyone presses Save. That converts a tag with one honest translation into N identical ones and
silently destroys the graceful degradation the whole mechanism exists to provide. So: the form reads
`$tag->translations->firstWhere('store_language_id', $id)?->name ?? ''`, and the default's value is
surfaced to the editor as a **`placeholder`** — visible guidance, never a submitted value.
⚠️ **This is exactly the mistake a competent developer will make**, because `translated()` is the API
every other page of `docs/` points at. Note also the relationship to 0074's **D-9**: that decision
accepts two tags *rendering* identically under fallback as correct; this decision is what stops the
same fallback becoming a *write*. The two are not in tension — they are the read and write halves of
one rule.

✅ **Independently reached by two separate debates, which is the strongest signal in either file.**
Story 0071's **D-6** states the identical rule for Product Categories — *"the edit field reads the raw
translation row; the list cell reads `translated()`… conflating them is the sharpest bug this story can
ship"* — and its own two amigos reached it independently of each other and of this debate. Four
independent arrivals at the same rule, across two taxonomies, is why it is the first thing Phase 2
should protect. 0071 adds one mechanical consequence this file had reached from the other direction
(see **R-8**) and states it more sharply: **`scopeWithTranslationsFor()` is the wrong tool for the
modal** — it always narrows to (requested, default), at most two languages, because 0070 built it for
list rendering and shipped no UI. The modal needs the raw value for **every** active language, so it
loads `$tag->load(['translations' => fn ($q) => $q->whereIn('store_language_id', $activeIds)])`. That
is a genuine limitation of 0070's contract, not a misuse of it.

**D-3 — This story ships `App\Actions\Blog\SetBlogTagTranslation`, a self-sufficient action that
authorizes *and* validates; the component authorizes too but cannot validate, and that is correct
rather than a missing layer.** *(Human architectural decision, 2026-08-30, establishing the pattern in
0071's **D-4** and generalising it in its **D-13**. This story had independently proposed the action —
`frontend-expert`, `frontend-qa` and the facilitator each reached it — and the decision confirms it.)*

The gap it closes: `RenameBlogTag` writes the default language only (0074 **D-7** keeps its signature);
`SetTranslation` authorizes and validates **nothing** (0070 **D-9**, for the sound structural reason
that a self-authorizing `update` would make *creating* require `blog.edit`); `FindOrCreateBlogTag` is
forbidden on this screen. 0070's **D-12** predicted the gap and assigned it to *"whichever UI story
adds it"*.

| Layer | Where | What it does | What it protects |
| --- | --- | --- | --- |
| **1 — component** | `App\Livewire\BlogTags\Index::save()` | `Gate::authorize()` on the whole batch, before any action runs. **No `$this->validate()`** — 0060 **D-1** | fails fast before a transaction opens, and keeps the per-row `canEdit` hint honest |
| **2 — action** | `App\Actions\Blog\SetBlogTagTranslation` | `Gate::authorize('update', $blogTag)` **then** its own `Validator::make(...)->validate()` | binds **every** caller — a future importer, Artisan command or queued job inherits the whole rule with no component in sight |

**Why the missing component-side validation is not a hole.** 0071's **D-13** names this screen as *"the
case that looks like an exception and is not"*: 0059 already made the tag actions responsible for their
own validation, so adding a component-side copy would duplicate a rule the action owns and invite the
two to drift — exactly what
[base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s
*"move the rule, never copy it"* forbids. The principle is *"the operation is protected without relying
on its caller"*, not *"the check appears in exactly two files"*. ⚠️ **The asymmetry is the whole rule
and is easy to invert:** component-only is **never** acceptable (0008a's finding — every non-dashboard
caller inherits nothing); action-only **is** acceptable wherever a component cannot validate without
duplicating. The reviewer's test is *"if I delete the component, is the operation still protected?"*

The contract follows 0071's **D-13** verbatim rather than being re-derived:

```php
// app/Actions/Blog/SetBlogTagTranslation.php
final class SetBlogTagTranslation
{
    public function __construct(
        private readonly SetTranslation $setTranslation,                     // reached from NOWHERE else
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly NormalizeForSearch $normalizeForSearch,
    ) {}

    public function __invoke(BlogTag $blogTag, StoreLanguage $storeLanguage, string $name): BlogTagTranslation
    {
        $this->logRefusedPrivilegedAttempt->authorize('update', $blogTag);   // BlogTagPolicy::update -> blog.edit
        // refuse an inactive store language outright (D-5)
        // trim, then Validator::make(...) with nameRules($this->normalizeForSearch, $storeLanguage->id, $blogTag->id)
        //   -- 0074 D-6's signature: per-language scope on normalized_name, self-exclusion by blog_tag_id
        // error key DERIVED, never parameterised: "names.{$storeLanguage->id}"   (D-12)
        // catch 23000 on (store_language_id, normalized_name) -> ValidationException on that same key
        return ($this->setTranslation)($blogTag, $storeLanguage, ['name' => $trimmed]);
    }
}
```

Five properties, each an existing convention applied rather than a new rule: it authorizes `update` on
the **`BlogTag`**, never on the translation row (0074 **D-12** — translated content adds no ability and
there is deliberately no `BlogTagTranslationPolicy`); the `Gate` check sits **above** the
`SetTranslation` call (0074 **D-12**'s ordering constraint, since the primitive is not a checkpoint);
collaborators are **constructor-injected** because `__invoke()` is a public contract
([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)),
while the action itself is **method-injected** into `save()`; the error key is **derived, never passed
in** (**D-12**); and **no component imports `SetTranslation`** — 0071 **D-13**'s explicit
must-not-re-derive list.

*Rejected: the component calls `SetTranslation` directly.* This was 0071's own original shape and the
human overruled it. It contradicts 0060's **D-1** and leaves the rule unreachable to every
non-dashboard caller. *Rejected: widening `RenameBlogTag::__invoke()` with a language parameter* —
0070's **D-12** and 0074's **D-7** both explicitly refuse to widen a public contract for this, and
0060's tests bind to the current shape.

**D-4 — Language tabs are **edit-only**; the create form keeps 0060's single field.** `CreateBlogTag`
writes the store default and 0074's **D-7** keeps that deliberately, so a multi-language create has no
backend to call. Both amigos converged: `frontend-expert` scoped its whole design to edit, and
`frontend-qa` declined to write a multi-language create scenario as a ghost scenario. This also keeps
0074's **D-7** honest end to end — a tag is *authored* in the default language and *translated*
afterwards, from the post editor's on-the-fly path and from this screen alike. *Rejected: render tabs
on create and write the extra languages in a second step.* It doubles the write paths for a workflow
PRD never describes, and it is the shape that produces `frontend-qa`'s risk 9 — typed text in a
non-default create tab silently discarded with no error.

**D-5 — Only `StoreLanguage::active()` rows get a tab, and the *action* enforces it too.** PRD says
*"each **active** store language"*, and 0068's **D-5** makes removal a `is_active = false` toggle that
**preserves** the row and its translations. So a removed language's content stays readable (0074's own
Gherkin requires it) while gaining no editing surface. The non-obvious half: filtering the tab strip in
the **view** is a UI hint, not a control — a forged `wire:call` naming a removed language's id would
otherwise write to it. `SetBlogTagTranslation` therefore re-checks, which is the row-level counterpart
of task 0017's *"authorize every row the operation writes"* rule.

**D-6 — There are no non-translatable fields to keep outside the tabs, and that is why this screen is
the right place to settle the pattern.** PRD's rule that *"non-translatable fields stay outside the
language tabs and are shown once"* is satisfied vacuously: 0059's **D-6** gave `BlogTag` no `slug`, no
`description`, no `sort_order` and no `usage_count`, and 0074 leaves the parent row identity-only. So a
tag has exactly **one** translatable field and **zero** non-translatable ones. Recorded rather than
skipped, because it is what makes this story the cheapest possible first instance of the pattern — and
because 0076's **R-1** already warns that the Products editor faces the same problem across **five**
translatable fields *plus* non-translatable ones. Do not read this story's simplicity as evidence the
pattern is simple.

**D-7 — All active languages are held in one `public array $names`, and tabs switch on a *server round
trip* via `setActiveLanguageTab(string $languageId)` — not client-side Alpine.** ⚠️ **This reverses
what this debate concluded.** `frontend-expert` recommended client-side switching, and the facilitator
adopted it, on the data-loss argument: with server-side switching an editor filling French and clicking
Spanish appears to lose the French text. **0071's D-2 overturns that, and its argument is decisive:
only the server knows which tab a validation error landed on.** An Alpine-only switch has no way to
learn, after a failed `save()`, which language was refused — closing that would need a cross-render
signalling mechanism nobody here has built. Worse, this file's own first draft was **internally
incoherent**: it declared a `#[Locked] $activeLanguageId` *and* client-side Alpine switching, leaving
two competing owners of "which panel is visible", so its own error-focusing mitigation could not have
worked. A plain `public string $activeLanguageId` driving `@if` lets `save()` set the active tab to the
first erroring language *before* the failed-validation re-render.

The data-loss concern is answered rather than dismissed: Livewire sends every dirty deferred
`wire:model` property on any action call, so text typed into a hidden tab survives the switch.
⚠️ **That is 0071's own explicitly-unverified claim** (`vendor/` absent), and its named fallback binds
here too — if the browser test *"typing, switching away and back preserves the text"* fails, the panels
render with `x-show` (kept in the DOM) rather than `@if` (removed from it). That test is
**execution-verification, not a regression guard**.

One obligation survives from the original decision unchanged: every active language must have an
explicit `''` key in `$names` — never omitted, never `null` — the generalised form of the
[`<select>` desync hazard](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16).
0060's *"no `<select>` here, so that trap does not apply"* stops being true and must not be carried
forward.

**D-8 — The list shows the **store default** language's name, and a `null` renders as a placeholder.**
Never the admin UI locale: PRD is explicit that the two layers must not be conflated, and 0074's **D-7**
already rejects keying anything off the ES/EN admin locale for exactly this reason. `translated('name')`
with no argument resolves to the default per 0070's contract. When it returns `null` — which 0074's
**R-9** says is *"potentially most of the catalog"* immediately after a store-default change — the row
renders the em-dash-style placeholder `users.blade.php` / `roles.blade.php` / `sales-regions.blade.php`
already use, never a blank and never an error. ⚠️ **0060's D-9 `orderBy('name')` is no longer
executable**, because there is no `name` column to sort — `frontend-expert`'s correction. Sort after
fetch, keeping the `id` tiebreak.

**Blank handling is 0071's D-7, adopted verbatim rather than re-derived**, and it **corrects** what
this debate had written. This file's first draft made a blanked field a silent no-op in every case;
0071's three-branch rule is better and is what makes 0074's own *"A blank translation is refused"*
scenario hold at the UI layer, since `SetTranslation` validates nothing:

| Tab | Rule | Blanking it |
| --- | --- | --- |
| the **store default** language | always `required` | refused |
| a **non-default, previously untranslated** language | `nullable` | a no-op — no row is created |
| a **non-default, previously translated** language | `required` | **refused** |

The condition is *"was this language translated when the modal opened"* — a fact about the **session**,
not about the field — so it lives in the component and **must not** be pushed into
`BlogTagValidationRules`, which has to stay reusable by three sibling screens. The consequence, which
0071 raises as its own **Q-1** and this story inherits: **there is no way to remove a translation once
written.** That is an accepted gap, not an oversight.

**D-9 — One Save is all-or-nothing across languages.** The write loop is wrapped in a
`DB::transaction()`, so a `ValidationException` on the third language rolls back the first two. The
reason is the same one 0074's **D-5** used to *override* 0059's no-transaction decision: once an
operation spans more than one row, a partial commit is a state no screen can explain and no later query
expects. The cost is real and product-visible — a rejected French name discards an otherwise-valid
Spanish edit — which is why it is **Q-3** as well as a decision. Mitigated by **D-7**: the editor is
returned to the failing tab with their typed values still on screen, so the correction is one edit away
rather than a re-entry. *Rejected: per-language independent commits*, which leave the editor guessing
which of five tabs actually saved. ⚠️ Per
[errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21),
a transaction wrapper is a change to **every** side effect the wrapped code performs — here that
includes `LogRefusedPrivilegedAttempt`'s writes. Confirm at Phase 3 that a rolled-back save still
leaves its refusal log line committed; an audit trail that disappears with the rollback would be a
silent regression of the whole refusal-logging convention.

**D-10 — The *tab* hook is the shared, generic `language-tab-{storeLanguageId}`; the *panel* hooks are
domain-prefixed, `blog-tag-name-input-{storeLanguageId}`.** ⚠️ **Half of this is a reconciliation with
0071, which reached the opposite answer for the tab hook and is right.** Both amigos here proposed
`blog-tag-language-tab-{id}` independently, on 0060's **V-2** reasoning (name the full domain, so
nothing collides across three taxonomy screens). That reasoning cannot bind the tab, because **0071's
D-1 makes the strip a shared component that emits its own hook** — a domain-prefixed tab hook would
require every consumer to pass its own prefix in, for no benefit, and would break the one-identifier
property. So the split follows ownership rather than taste: **the shared strip's hooks are generic,
this screen's own panel hooks are domain-prefixed.** V-2's argument survives exactly where it still
applies. Both key on the **store-language id** rather than the ISO code, matching the property key —
and 0071's **D-11** binds here too: **no assertion in this story may match on a language name or a
two-letter code.**

**D-11 — No new permission, no new ability, no new policy.** 0074's **D-12** applied unchanged, and
**verified against the shipped `RolePermissionSeeder` rather than inherited**: `MODULES` already
contains `blog` *and* `store-languages`, so all four `blog.*` permissions exist today, the catalog
stays at **42** and `Administrator` at 41 of 42. Authoring a translation is *using* a configured
language, not managing the catalog, so no `store-languages.*` permission is required — 0068's **D-18**
draws exactly this boundary, and it gets its first UI consumer here.

**D-12 — The default-language edit keys its refusals on `name` while every field binds to
`names.{languageId}`, so the component re-keys them. ⚠️ Here the adapter sits on the *primary* path,
not on a backstop — which makes it materially more load-bearing than in 0071, where the same ⚠️ was
first raised.** 0060's interface contract records that `CreateBlogTag` and `RenameBlogTag` throw
`ValidationException` keyed **`name`** (0059's shape, frozen by 0074 **D-7**), while this screen's edit
fields are bound to **`names.{languageId}`** (**D-7**). An unadapted refusal therefore lands on a key
no field renders: the modal stays open with **no message anywhere**, which is the silent-refusal
failure mode 0018 shipped as a blocking finding.

**Why it is worse here than in 0071, stated because the difference is the reason this needs its own
test rather than an inherited note.** 0071's component validates first (its layer 1), so a `name`-keyed
throw from the default-language action is *"realistically the `23000` race backstop"* — rare. **This
component cannot validate at all** (0060 **D-1**, and **D-3** above), so for the **default language**
the action's throw is the *only* validation path: every blank, over-length, duplicate, case-only and
accent-only refusal on the default tab arrives keyed `name`. The adapter is exercised on ordinary
input, not on a race.

So `save()` catches `ValidationException` from the default-language write and re-keys
`name` → `names.{$defaultLanguageId}` — 0071's three-line adapter, in the one place it belongs.
*Rejected: widening `CreateBlogTag` / `RenameBlogTag` to key on `names.{id}`* — that changes a public
contract 0060's tests and 0074's own suite bind to, from a story forbidden to edit either file, and
0074 **D-7** keeps those signatures deliberately. *Considered and not adopted: route the default
language through `SetBlogTagTranslation` too*, which would make every key uniform and delete the
adapter outright. It is genuinely tempting and is the cleaner design read in isolation — rejected
because it diverges from the master pattern 0071 **D-13** sets for all four siblings, it orphans
`RenameBlogTag` from the only screen that calls it, and it would silently change 0060's
*"`save()`'s injected actions are `CreateBlogTag` / `RenameBlogTag`"* assertion. **Flagged for Phase 2**
as the one place this story knowingly takes the more complex option for cross-story consistency; if
Phase 2 prefers the uniform route, it should be adopted for all four siblings in 0071 first, never
here alone.

**The create path needs no adapter and must not grow one.** Tabs are edit-only (**D-4**), so the create
modal binds a single `$name` field and `CreateBlogTag` throws on `name` — already the key the field
renders. The mismatch is a property of the *edit* form's array binding, not of the actions.

## 5. Dependencies, risks, open technical questions

### Dependencies

- **[0074](0074-translatable-content-retrofit-blog-tags-backend.md)** — hard, **not implemented**.
  `blog_tag_translations`, `BlogTagTranslation`, the re-signed `nameRules()`, per-language uniqueness.
- **[0060](0060-blog-tags-ui.md)** — hard, **not implemented**. The screen, the route, the sidebar
  group, the lang files, the policy call site. This story modifies its component and view.
- **[0070](0070-translatable-content-mechanism-product-categories-backend.md)** — hard, **not
  implemented**. `HasTranslations`, `SetTranslation`, `defaultStoreLanguage()` and its memo.
- **[0068](0068-store-languages-catalog-backend.md)** — hard, **not implemented**. `StoreLanguage`,
  `scopeActive()`, and the factory states every fixture here uses.
- **[0071](0071-product-categories-language-tabs-ui.md)** — **new, hard, and unusual**: this story
  consumes the shared `language-tab-strip.blade.php` component 0071's **D-1** extracts, and inherits
  its **D-2**, **D-6**, **D-7**, **D-8** and **D-11** rather than re-deriving them (**R-1**). ⚠️ **This
  is a *frontend-to-frontend* dependency between two same-epic UI stories, which this project has no
  precedent for** — every prior pairing is backend-before-frontend. It also inverts the numeric
  ordering convention only in appearance: 0071 < 0075, so
  [workflow.md](../../docs/workflow.md#task-ordering-rule)'s rule is satisfied, but the *reason* is a
  shared component rather than an interface contract. Phase 2 should confirm the sequencing explicitly
  — **0071 must reach Phase 3 first**, or this story has no strip to consume.
- **[0059](0059-blog-tags-backend.md)** — transitively, via 0060 and 0074.
- Already-shipped: the seeded `blog.*` permissions (**verified**), `Gate::before`, policy
  auto-discovery, `LogRefusedPrivilegedAttempt` (0015b), the sidebar registry (0013), the wired-up
  browser suite (0006b).
- **No new Composer package.**

### Risks

- **R-1 — Reconciled against sibling story [0071](0071-product-categories-language-tabs-ui.md), which
  was written concurrently and landed 57 seconds before this file was saved.** It did not exist when
  the debate opened, so **neither amigo saw it** and both contributed as if this were the first
  language-tabs story. The reconciliation was done by the facilitator after the fact, by reading 0071
  in full. Dispositions:

  | Question | 0071 | This story |
  | --- | --- | --- |
  | Raw row for the edit field, `translated()` for the list | **D-6** | **D-2** — reached *independently*, adopted ✅ |
  | Only active languages get a tab | **D-5** | **D-5** — independently identical ✅ |
  | `$names` array keyed by store-language id | **D-3** | **D-7** — identical shape ✅ |
  | Error keys `names.{languageId}` | **D-8** | **D-7** — identical ✅ |
  | List sorts in PHP, not SQL | **D-12** | **D-8** — independently identical ✅ |
  | Tab switching | **D-2** server round trip | **D-7 reversed** to match — 0071's argument is better ⬅️ |
  | Blanking a translated field | **D-7** refused | **D-8 corrected** to match — this file had it wrong ⬅️ |
  | The tab strip | **D-1** extracted shared component | **D-1** now *consumes* it ⬅️ |
  | Tab `data-test` hook | generic `language-tab-{id}` | **D-10 split** — generic strip, prefixed panels ⬅️ |
  | Authorization + validation for a per-language write | **D-4** rewritten to two layers | **D-3** — same pattern, **resolved by the human** ✅ |
  | Error key `names.{languageId}`, derived not parameterised | **D-13** | **D-3** / **D-12** — inherited ✅ |
  | Default-language actions key on `name`, needing an adapter | **D-4**'s ⚠️ | **D-12** — applies, and **more sharply** ⬅️ |

  **The last conflict closed on 2026-08-30.** It was real while it lasted and was partly forced —
  0060's **D-1** forbids *this* component from validating, while 0025's equivalent does not — and the
  human resolved it in the direction this file had proposed, with 0071's **D-13** adding the piece
  neither debate had: *action-only is acceptable precisely where a component cannot validate without
  duplicating; component-only never is.* Both files now describe one pattern. `0073` still does not
  exist and inherits it. **One thing this story adds back to the family**: 0071's error-key ⚠️ is
  described there as a race backstop, and on **this** screen it is the primary path (**D-12**), because
  the component performs no validation to catch the ordinary cases first. 0073 will look like 0075 here,
  not like 0071, if its own base screen also validates in its actions.
- **R-2 — The `translated()`-populates-the-form mistake fails silently and destructively.** **D-2**
  closes it; the dedicated test is what keeps it closed. Written up separately from D-2 because the
  failure mode deserves naming: nothing errors, every happy-path test passes, and the damage is a
  slowly-growing pile of spurious identical translations that looks like real data.
- **R-3 — Three assertion traps this screen adds to 0060's.** *(a)* A page-global `assertSee($name)`
  was already unsafe for substring reasons (0060 **R-4**); here it is unsafe for a *second, independent*
  reason — the same string may legitimately render under two languages (0074 **D-9**), so a pass proves
  nothing about which tab produced it. *(b)* A fallback `placeholder` and a real value can be
  byte-identical, so any assertion claiming a translation was *written* must check the row, not the
  rendered text. *(c)* Asserting a tab is "active" by CSS class substring is fragile against Blaze/Alpine
  — use a structural hook, and verify against **compiled** output rather than the Blade source, which
  is the lesson [both 2026-08-16 Flux/Blaze entries](../../docs/errors-log.md) and the 2026-08-26
  `@js()` correction all teach.
- **R-4 — Every interface claim in this file is a claim about four unimplemented task files.**
  0059, 0060, 0068, 0070 and 0074 are all Phase 1 documents; `app/Models/BlogTag.php`,
  `app/Models/StoreLanguage.php` and `App\Concerns\HasTranslations` do not exist, and `vendor/` is
  absent so nothing could be verified by execution. Both amigos flagged this independently. Per the
  [deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23),
  **re-verify each against `HEAD` before Phase 3 and record every disposition, including "already
  closed"**. The claims most likely to have moved: `nameRules()`'s exact signature (0074 **D-6** says
  Phase 3 settles the Laravel expression), whether `SetTranslation` can write `store_language_id` at all
  (0074's **R-2**, unresolved), and the memo-reset mechanism (0070 **R-6**).
- **R-5 — `wire:model` on a dynamic array key is unexercised in this repo.** `wire:model="names.{{ $id }}"`
  with UUID keys is ordinary Livewire, but nothing here has used it, and this project has been bitten
  twice by bindings that pass every component test and fail in a real browser (the `<select>` desync,
  the Sales Regions rate input). `Livewire::test()->set()` cannot catch it. The browser test asserting a
  value typed into a **hidden** tab still dehydrates correctly is the only proof.
- **R-6 — 0060's own interface contract is stale before this story starts.** It quotes
  `BlogTag // #[Fillable(['name'])] … normalized_name derived by a saving() hook` — every clause of
  which 0074 falsifies (`#[Fillable([])]`, no `normalized_name` column, the hook relocated to
  `BlogTagTranslation`). Anyone implementing 0060 from its own quoted contract writes against a model
  shape that will not exist. This story cannot fix 0060's file (it does not edit other stories) —
  raised as backlog item 1.
- **R-7 — Scope creep into `FindOrCreateBlogTag`, inherited from 0060's R-7 and made worse.** A tabs UI
  touches more languages and therefore offers more places to reach for "reuse if it already exists",
  which would turn every duplicate refusal into a silent success. Pinned by the injected-actions
  assertion.
- **R-8 — N+1 across tabs**, 0070's **R-4** in its one-character shape: `$tag->translations()->where(…)`
  (the relation *method*, always re-queries) versus `$tag->translations->firstWhere(…)` (the *property*,
  respects eager loading). The list needs `withTranslationsFor()`; the **edit** modal deliberately needs
  `load('translations')` **unscoped**, because that scope narrows to two languages and the form needs
  all of them. Do not "optimise" the edit path onto the list path's scope.
- **R-9 — The Gherkin domain glossary has no i18n vocabulary.**
  [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md#domain-glossary)'s glossary
  covers auth only and carries an explicit `TODO` for the content domain. This story introduces *store
  language*, *store default language*, *language tab* and *translation* into project Gherkin for the
  first time. Terms used here follow PRD Epic 5's own wording; the glossary should absorb them
  (backlog item 5).

### Open questions for the product owner

Each carries a recommendation, per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule.

**Q-1 — ✅ RESOLVED by the human, 2026-08-30. Kept, with the resolution recorded rather than deleted,
because two sibling stories briefly shipped different answers and a later reader needs to know which
one won and why.**

The confirmed rule: **a per-language write is authorized and validated on both the front and the back —
defence in depth, not either/or.** The pattern is established for real in 0071's **D-4** and generalised
to all four siblings in its **D-13**. For *this* screen, **D-13** addresses the case by name: 0060's
**D-1** structurally forbids the component from validating, so there is no component-side validation
layer to add, and **the principle still holds because the action is self-sufficient by construction** —
it authorizes and validates regardless of any caller. The component still authorizes.

- **Adopted: (a)** — `App\Actions\Blog\SetBlogTagTranslation`, and the story is reclassified
  **fullstack**. This is what **D-3** had proposed independently, on three grounds the resolution
  confirms: 0070's **D-12** literally anticipated it (*"called by whichever UI story adds it"*);
  [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  requires the rule to live in the class performing the operation, since otherwise no queued job or
  Artisan caller inherits it (0008a's finding); and it is the only option compatible with 0060's D-1.
- **Rejected: (b)**, the component calling `SetTranslation` directly — 0071's original shape, overruled
  by the same decision.
- **Not taken: (c)/(d)**, moving the action into 0074 or a new `0074a`. Both remain defensible on
  classification grounds and neither was chosen; the action lives beside the caller that motivates it.
- **The one residual cost is unchanged and is now the story's main review risk:** its single backend
  class was designed in a debate with no `backend-expert` and no `backend-qa` present — backlog item 4.

**Q-1b — New, and created by Q-1's resolution: should the *default* language also route through
`SetBlogTagTranslation`?** **D-12** says no, for cross-story consistency, and accepts a three-line
error-key adapter as the price. It is the one place this story knowingly takes the more complex option.
- **(a) Keep the split — default via `RenameBlogTag`, others via the new action — _(recommended)_.**
  Matches 0071 and the master pattern, keeps `RenameBlogTag` the named writer of the default-language
  name (0074 **D-7**'s framing), and leaves 0060's injected-actions assertion true.
- **(b) Route every language through `SetBlogTagTranslation`.** Uniform error keys, no adapter, one code
  path — genuinely cleaner read in isolation. Costs: it orphans `RenameBlogTag` from its only screen,
  changes a 0060 test contract, and diverges from a pattern 0071 sets for four stories. **If preferred,
  adopt it in 0071 first and inherit it here** — never here alone.

**Q-2 — Should the language tabs be folded into 0060 rather than shipped as 0075?**
`frontend-expert`'s zero-order finding, and it is well argued: 0060's component binds `public string $name`
to a column 0074 **deletes**, so 0060-as-written is broken in both orderings — implement it first and it
dies when 0074 lands; implement 0074 first and 0060 is unbuildable as specified. This is 0074's own
**R-1** recurring one layer up.
- **(a) Keep 0075 separate — _(recommended)_.** The 14-story decomposition is confirmed, Epic 5 ships
  last by PRD's own roadmap, and the pairing matches this project's backend-then-frontend convention.
  The mitigation is not restructuring but **sequencing**: 0060 must not reach Phase 3 before 0074, and
  0060's stale contract needs correcting in place (backlog item 1).
- **(b) Amend 0060 to specify tabs from the start** and retire 0075. Genuinely cheaper if neither has
  been implemented when this is read — no dead single-language component is ever written. Its cost is
  that it re-opens a confirmed decomposition and makes 0060 an Epic 4 story carrying an Epic 5
  requirement, which no other story in the plan does.
- **This debate did not act on it.** The finding is recorded, not executed.

**Q-3 — When one language's name is refused, should the other languages' edits still save?**
**D-9** decides **no** (all-or-nothing). It is product-visible, so it is listed rather than buried.
- **(a) All-or-nothing — _(recommended)_.** Consistent with 0074's **D-5** reasoning about multi-row
  writes, and **D-7** returns the editor to the failing tab with their typing intact, so the cost is one
  correction rather than a re-entry.
- **(b) Per-language independent commits.** Nothing valid is ever lost — but the editor must work out
  which of several tabs actually saved, and a half-translated tag is a state no screen explains.

**Q-4 — Should the list flag tags that are untranslated in the store default?**
**D-8** renders a placeholder. `frontend-expert` additionally proposed a small badge — "not yet
translated into ⟨default⟩" — reasoning that 0074's **R-9** makes this a *common* state after a default
change rather than an anomaly, and that an editor otherwise cannot distinguish "no name" from "not
translated yet".
- **(a) Placeholder plus a badge — _(recommended)_.** Low cost, and it is the same instinct as the Users
  screen's muted pending-email notice: a UI hint for a real recurring state.
- **(b) Placeholder only.** Less markup; leaves a genuinely confusing state unexplained.
- Purely presentational either way — no contract changes.

### Inherited open questions — listed, deliberately not resolved here

- **0070's Q1** (must every entity always hold a default-language translation) — **D-8**'s placeholder
  and 0074's **R-9** both assume the answer may be *no* in practice, even if it is *yes* by design.
- **0070's Q2** (uniqueness in every language vs. the default only) — this story renders whatever 0074
  enforces. If Q2 resolves to default-only, the duplicate-refusal scenarios above narrow.
- **0074's Q-1 / Q-2** (which language an on-the-fly tag is authored in; whether the post editor's tag
  field sits inside language tabs) — both belong to 0061/0063/0079. **D-4** is consistent with 0074's
  **D-7** either way.
- **0060's OQ-1** (is `BlogTagPolicy` target-dependent), **OQ-2** (the length constant), **OQ-3**
  (does validation live in the action — **D-3** assumes yes and is rewritten if not).

## 6. Technical tasks for later backlog creation

Derived from this debate; **none are in scope for 0075**.

1. **Correct 0060's stale interface contract in place** — **R-6**. It quotes a `BlogTag` shape 0074
   falsifies in every clause. This story does not edit other stories' files.
2. **Answer 0070's Q3 for Product Categories and Blog Categories** by writing 0071 and 0073 against
   this file's decisions, or by consciously diverging and reconciling all three.
3. ~~**Extract a shared `<x-language-tabs>` component once a second taxonomy screen exists.**~~
   **Already discharged by 0071's D-1**, which extracted it. Kept struck through rather than deleted
   because the *reasoning* still matters and is now confirmed rather than hypothetical: this file
   argued a component factored out of one caller is a guess, and **this story is the second caller
   that turns it into a verified factoring**. The live version of the item is: *0073 and 0077/0079 must
   consume the same strip, and 0077/0079 are where its single-field assumption first meets a
   multi-field panel.*
4. **Give `SetBlogTagTranslation` a `backend-qa` test-design pass** if **Q-1** resolves to (a) — a
   backend class designed entirely within a frontend debate is exactly the gap this project's
   classification rule exists to prevent.
5. **Add i18n vocabulary to the Gherkin domain glossary** — **R-9**. Its `TODO` block already asks the
   product owner for the content domain's canonical terms; *store language*, *store default language*,
   *language tab* and *translation* now have real usage to standardise against.
6. **`ModuleRouteAccessTest.php` still covers two routes while more exist** — inherited unclosed from
   0017/0018/0068/0070/0074, and untouched here since this story adds no route.
7. **Extend the Parallel Agent File-Ownership Rule to cover shared *design* authority, not only shared
   files** — see the ⚠️ in Provenance. Two Phase 1 debates decided one cross-cutting pattern
   independently, one minute apart, writing disjoint files; the existing rule is satisfied and the
   collision still happened. The cheap fix is procedural: when an epic contains sibling stories that
   will share a component or a convention, **name one of them the pattern-owner in the decomposition**
   and have the others consume it, rather than letting whichever runs first become the owner by
   accident.

## Provenance

**Phase 1 Three Amigos debate, 2026-08-30.** Participants: `product-owner` (facilitator),
`frontend-expert`, `frontend-qa` — **both dispatched as real subagents, both returned normally.**
Nothing outside this file was created or modified; stories 0060, 0071, 0073 and 0074 are untouched, and
no application code or test was written.

**Where the three converged, independently.** *(a)* **The write-path gap (D-3).** All three identified
that no class can write a non-default-language name with authorization and validation. The facilitator
found it while reading 0070's **D-12** before dispatching; both amigos found it unprompted from
opposite directions — `frontend-expert` from the action layer's convention, `frontend-qa` from
"what is the highest authorization risk on this screen". `frontend-qa` additionally ranked an unauthorized
`SetTranslation` call its **number-one** risk. Three independent arrivals is why this is written as a
decision. *(b)* **Tabs are edit-only (D-4)** — `frontend-expert` scoped its design to edit; `frontend-qa`
independently refused to write a multi-language create scenario, calling it a ghost scenario. *(c)*
**Hook naming (D-10)** — both proposed the language-id-suffixed, full-domain form.

**The most useful thing this debate produced was a tension, not an agreement.** `frontend-expert`'s
headline recommendation (design **B**: hold every language in one array, switch client-side) and
`frontend-qa`'s headline risk (a fallback-populated form silently writing the default's text into every
language) are in direct conflict: B is exactly the design that makes QA's risk reachable, because every
tab's value is submitted together. **The resolution is that each closes the other's failure**, and it is
what **D-2** plus **D-7** encode: B removes QA's data-loss risk (an unsaved edit surviving a tab switch),
and D-2's *populate from the raw row, never from `translated()`*, combined with a changed-and-non-blank
diff at save time, removes QA's duplication risk. Neither amigo proposed the pair; it is the
facilitator's synthesis, and **D-2**'s dedicated test is what holds it together.

**Where they split, and how it was resolved.** *(i)* `frontend-qa` left the A-vs-B fork open as a
question; `frontend-expert` recommended B with reasons. **B adopted**, on `frontend-expert`'s
unsaved-edit argument, which QA's own risk 5 independently corroborates. *(ii)* `frontend-qa` listed
the list-view display language as undesignable; `frontend-expert` decided it from PRD and 0074's **D-7**.
**Decided (D-8)** — the argument that the admin UI locale is a different layer is already settled
project doctrine, not a new call. *(iii)* `frontend-qa` asked for a fallback-vs-real visual indicator as
a product question; **D-2** answers it structurally with a `placeholder`, which makes the distinction
real in the DOM and testable, without needing a design decision first.

**Four facts were verified by the facilitator against the live tree rather than inherited.** *(1)*
`blog` **and** `store-languages` are already in the shipped `RolePermissionSeeder::MODULES` — so the
catalog stays at 42 (**D-11**). *(2)* `config/modules.php` holds three groups and four items with **no**
`blog` group, confirming the registry entry is 0060's and not this story's. *(3)* `0071` and `0073` do
**not** exist in `ai-spec/tasks/`, so there was no sibling precedent and none could be followed
(**R-1**). *(4)* `livewire/flux` is the **free** package with no `flux-pro` and no private repository,
and no `flux:tab` appears anywhere in `resources/` — which, with `vendor/` absent, is what makes **D-1**
a decision under uncertainty rather than a component choice.

**One decision was found already made elsewhere rather than re-derived.** `frontend-expert` correctly
reported it could not verify whether `<flux:tabs>` exists. Story [0069](0069-store-languages-settings-ui.md)'s
**D-3** had already faced the identical question for `flux:card`, on identical evidence, days earlier —
so **D-1** follows an established Epic 5 precedent instead of inventing one.

**Two things this debate could not verify and deliberately did not assert**: whether `<flux:tabs>` ships
in Flux Free (**D-1**, **R-4**), and whether `wire:model` against a dynamic UUID array key round-trips
correctly under Livewire 4 in a hidden Alpine block (**R-5**). Both are recorded as Phase 3 execution
obligations, per this project's [standing rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24)
that an unverified mechanism written up confidently is worse than an open question written up plainly.

**Human architectural decision, 2026-08-30 — recorded after the debate and after the 0071
reconciliation below.** The human confirmed the master pattern: *a per-language write is authorized and
validated on both the front and the back — defence in depth, not either/or.* It is established in
0071's **D-4** and generalised to the four siblings in its **D-13**, which addresses this screen by
name. **This resolves this file's own Q-1, in the direction this debate had independently proposed**:
all three participants here had concluded a dedicated action was needed, and **D-3** had specified one
before the decision arrived. What the decision added, and what neither this debate nor 0071's had
articulated, is the asymmetry that makes 0060's un-validating component *not* an exception —
*action-only is acceptable precisely where a component cannot validate without duplicating;
component-only never is.* Changes: **D-3** rewritten around the two-layer table and D-13's verbatim
contract, **D-12** added for the error-key adapter, the Type line changed from *proposed* to confirmed
**fullstack**, **Q-1** marked resolved and **Q-1b** opened in its place, and the Gherkin, test plan and
acceptance criteria extended.

**One thing this story contributes back to the family rather than only inheriting.** 0071's error-key
⚠️ describes the adapter as guarding *"realistically the `23000` race backstop"*, because its component
validates first. On this screen the component **cannot** validate (0060 **D-1**), so the same adapter
sits on the **primary** path: every ordinary blank, over-length or duplicate default-language name
arrives keyed `name` while the field binds to `names.{defaultId}`. That is a difference in kind, not
degree — it turns an edge-case guard into the main error route — and it is why **D-12** gives it a
dedicated test rather than inheriting a note. Any sibling whose base story put validation in its actions
(0073, plausibly) will look like this one, not like 0071.

**Post-debate reconciliation with story 0071, done by the facilitator after both amigos returned.**
0071 did not exist when this debate opened — verified then, and both amigos were briefed on that basis,
so **neither saw it and neither's contribution is affected by it**. It was found during the
link-integrity pass at the end, in `git status`, 57 seconds after it was written. It was then read in
full and this file was revised: **four decisions changed** (**D-1**, **D-7**, **D-8**, **D-10**), one
gained a confirmation (**D-2**), one backlog item was struck through as already discharged, one
dependency was added, and **R-1** was rewritten from *"there is no sibling"* into the
adopted/diverged table. Two of those changes **overturned conclusions this debate had reached** —
0071's server-round-trip argument is better than this file's client-side one, and its
refuse-a-blanked-translation rule is correct where this file's silent no-op was wrong. The first
overturn also exposed a genuine incoherence in this file's own first draft, recorded in **D-7** rather
than quietly fixed: it had specified a `#[Locked] $activeLanguageId` *and* Alpine switching, leaving
two owners of "which panel is visible", so its own error-focusing mitigation could not have worked.

⚠️ **This is the [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule)
arriving in a form that rule does not currently cover.** No file was written twice — 0071 and 0075
touched disjoint paths, so the rule as written was satisfied. What collided was **design authority**:
two debates independently deciding one shared pattern, each believing itself the first, one minute
apart. The rule reasons about *files an agent will write*; this cost was incurred by files two agents
would **decide about**. Raised as backlog item 7, since a 14-story epic with four sibling UI stories
will reproduce it.

**Not run by this phase**, per [workflow.md](../../docs/workflow.md): the INVEST check (Phase 2), TDD
implementation (Phase 3), security audit (Phase 4), code review (Phase 5), or the docs pass (Phase 6).
