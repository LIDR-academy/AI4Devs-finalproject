# [0020] Shared media gallery modal (frontend)

## Description
Frontend half of the Shared Media Gallery ([PRD §2.3](../../../docs/PRD/PRD.md#23-shared-media-gallery)):
the reusable modal that Products and Blog both open to pick or upload images. It replaces the
placeholder view story **0019** ships for `App\Livewire\Media\Gallery` with the real screen — a tile
grid, a debounced title/description search with an explicit empty state, an upload dropzone
(drag-and-drop) plus a "Subir" file-picker button, single-select vs multi-select modes, and inline
title/description editing on upload and on a selected tile.

This story owns **no table, no migration, no upload/conversion logic and no permission-catalog
change** — all of that is [0019](../done/0019-media-library-upload-and-conversions-backend.md), and this
story consumes it unchanged. It is the same split story **0004 → 0006** already ran for the Users
screen: backend ships the component's server-side surface, frontend dresses it.

## Type
frontend | fullstack (related_task_id: **0019**) | includes database-expert: **no**

The one server-side addition is `App\Actions\Media\UpdateMediaDetails` (see [D10](#d10--inline-titledescription-editing-lives-on-two-surfaces-and-needs-one-new-action)),
which writes two already-existing, already-validated columns through an already-planned policy
ability. It introduces no schema change and no new query shape, which is why `database-expert` is
not convened.

## Three Amigos participants

`product-owner` (lead) + `frontend-expert` + `frontend-qa`.

> **Process note.** Both experts were convened as subagents and both delivered. Their contributions
> are folded in below rather than quoted wholesale. **Every mechanical claim that could be checked
> against this machine was executed, not reasoned about** — Livewire's upload event listener, its
> `dispatch()`/`dispatchTo()` routing, the Pest browser plugin's real method surface, Flux Free's
> component inventory, the prototype's own `insertLabel` line, and the absence of a
> `max_execution_time` override. Each such claim is marked **(verified)** with what was found.
> Claims that could not be executed (browser drag-and-drop behaviour against markup that does not
> exist yet) are recorded as risks, not asserted.

## Phase 2 — INVEST validation (passed)

**Verdict: ✅ PASS** — `code-reviewer`, 2026-08-28. Moved to `ai-spec/tasks/in-progress/` as
[Phase 3 step 0](../../../docs/workflow.md#phase-3--tdd-mandatory-in-this-order); implementation
starts here. **Read this section before writing the first test.**

PASS on all six INVEST letters. **"Small" is the weakest** — this story is larger than any prior
single-story UI task, and a future story of this shape could reasonably be split. That was raised as
a *non-blocking* recommendation only: this story was already fully scoped and every open question
confirmed by the coordinator on 2026-08-18, so **it proceeds as one story and is not to be split.**

### Dependency 0019 is closed, and its code is real

Verified in this worktree — not assumed from the task file's `done/` location. The reconciliations
below are therefore against **shipped code**, not against a plan.

### Divergences between 0019's shipped code and this document's assumptions

**These are not errors in this document** — it was written before 0019 shipped and explicitly warned
this could happen. They are reconciliations Phase 3 must make deliberately, each one a decision to
record rather than a drift to absorb silently.

| # | This document assumes | 0019 actually shipped | Phase 3 action |
|---|---|---|---|
| 1 | `$search` property + a `#[Computed]` tile list already exist | Neither. 0019 shipped **only** the query scope `Media::search(Builder, string $term)` as a `#[Scope]` attribute, with **no default argument** | **D6 must ADD `$search` and the computed tile list**, not reconcile an existing one |
| 2 | An array upload property `$pendingUploads` with `multiple` | `public ?UploadedFile $photo` — **singular** | D7/D9's change is *both* a rename **and** a semantic change (single file → array). Legitimate — 0019's own **D4 named multi-file as its revisit trigger** — but implement it as a **deliberate, documented supersession of D4**, never as if it already existed |
| 3 | An `updatedPendingUploads()` handler | The handler is **`upload()`** | Rename/redesign consciously; don't assume the lifecycle-hook name |
| 4 | D10's per-tile inline-edit state is free to use `$title` / `$description` | The component **already owns `public string $title` / `public string $description`** as the *pending-upload* form fields | **D10 must use different property names** — a straight reuse silently collides two unrelated forms |
| 5 | (unmentioned) | `upload()` already carries an **undocumented `RateLimiter` throttle**: 10/hour, key `media-upload:{userId}`, refusing via `ValidationException` | Bounds **D9's multi-file-batch tests (cap corrected to 3, see D9)** and **any browser test uploading repeatedly as the same actor**. Plan fixtures around it |
| 6 | D10/D12 gate `updateMediaDetails()` with a bare `Gate::authorize()` | Shipped `Gallery.php` gates via `App\Actions\Auth\LogRefusedPrivilegedAttempt->authorize(...)` in **both** `mount()` and `upload()` | **D12's new `updateMediaDetails()` must use the same logging wrapper**, matching the shipped screen and this project's refusal-logging convention ([authorization.md](../../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail)) — **not** the bare `Gate::authorize()` D10/D12 currently specify |
| 7 | `MediaPolicy::update()` and `MediaValidationRules::mediaDetailsRules()` are as described | **Exactly as assumed** | ✅ No reconciliation needed |

### Phase 6 to-do — a pre-existing docs inconsistency, unrelated to this story

Found during Phase 2 review. **Do not fix it during Phase 3** — it is not this story's content, and it
is recorded here only so it is not lost before `docs-keeper` reaches Phase 6.

> [`docs/README.md`](../../../docs/README.md) and
> [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md) both currently
> claim that *"`LogRefusedPrivilegedAttempt` appears nowhere under `app/{Livewire,Actions}/Media/`"*.
> **This is false as of `HEAD`** — it is used **twice** in `Gallery.php` (see divergence #6 above).
> This is stale drift from story 0019's own docs pass, which predates a later fix round.
>
> **Owner:** `docs-keeper`, this story's Phase 6.

## Phase 3 — TDD (record)

`frontend-qa` (red) + `frontend-expert` (green). Component tests (`tests/Feature/Media/GalleryTest.php`,
`GalleryRenderingTest.php`), the D16 harness (`app/Livewire/Dev/MediaGalleryHarness.php` +
`tests/Feature/Dev/MediaGalleryHarnessRouteTest.php`) and browser tests
(`tests/Browser/Media/GalleryTest.php`) were all written and driven green against the reconciled
D2–D16 contract. Two real bugs were found and fixed mid-phase, both via the D16 harness (invisible to
a standalone `Livewire::test()` mount): the root `<flux:modal>` carried its own literal
`wire:model="open"`, colliding with the parent's `#[Modelable]` binding
(`ModelableRootHasWireModelException`); and nothing in the shipped component actually invoked
`upload()` after a file was staged (D11's title-auto-derive plus a real `updatedPendingUploads()`
lifecycle hook were both missing). One test — the reopen/leaked-state browser test — carries a
long-standing, honestly-documented, genuinely non-deterministic residual (see its own inline
docblock and Phase 5 below).

## Phase 4 — Security audit (record)

Three rounds, `appsec-auditor`, all against this worktree.

- **Round 1** (initial implementation): ❌ FAIL — 1 Medium (`App\Livewire\Media\Gallery` kept
  disclosing the whole library — `tiles()`/`toggleSelect()`/`confirmSelection()` — after `media.view`
  was revoked mid-session, since this routeless component has no per-request `PersistentMiddleware`
  backstop), 2 Low (the D16 harness route surviving a stale `route:cache` built under the wrong env;
  `description`'s missing `max:` rule reaching the database as an unhandled `QueryException`). Fixed
  by `frontend-expert`.
- **Round 2** (after the coordinator's decision to implement D8/D9 in full rather than defer them, and
  after those two features were built): ❌ FAIL — 2 Medium (F-A: `$pendingUploads[0]` dereferenced
  before `validate()`, so a crafted non-file client payload threw unhandled instead of failing
  validation cleanly; F-B: a rejected batch stayed on `$pendingUploads`, and since Livewire's
  `WithFileUploads` appends rather than replaces for a `multiple` input, the upload surface stayed
  broken for the rest of the session), 3 Low (F-C: an empty-derived multi-file title reached the
  database, and a stale title could leak onto a later unrelated upload; F-D: only the first of
  several `$failureMessages` was ever rendered, masking a throttle stop behind an unrelated per-file
  message; F-E: D9's own stated "5 files stays inside PHP's 30s `max_execution_time` default with
  margin" justification measured to **34.8s** — over budget with no margin. `MAX_FILES` lowered to
  **3**, measured at ~21s). Fixed directly by the coordinator after the fixing agent exhausted its
  session quota mid-round.
- **Round 3** (re-audit of the F-A…F-E fixes): ✅ **PASS**, with independent re-measurement (5.4s/file,
  16.2s for 3 files, 27.4s for 5 — confirming the same conclusion on different hardware) rather than
  trusting the prior round's numbers.

## Phase 5 — Final code review (record)

Two rounds, `code-reviewer`.

- **Round 1** (before D8/D9 existed): ❌ FAIL — D8 (two-phase in-flight progress) and D9 (multi-file
  upload, 5-file cap) were unimplemented while their AC/Gherkin text remained unstruck; the 60-tile
  truncation notice rendered the wrong lang key (D9's `too_many_files`, not a truncation-specific
  one); an orphaned docblock; two overclaiming docblocks (the D16 harness's 404-indistinguishability
  claim; a browser-test finding's "removes" vs. "reduces" claim); three stale browser-test skip
  reasons citing an already-fixed blocker; no test coverage for the 60-tile cap; and the full
  unscoped suite was red. **Coordinator decision** (asked of the human, not assumed): implement D8
  and D9 in full now, not deferred — see the top of this section.
- **Round 2** (after D8/D9 were implemented and went through Phase 4's three rounds above): ❌ FAIL —
  one blocking item (B-1: the full unscoped suite was red — one browser test's own `->wait(5)` call
  was, per the reviewer's own execution trace, throwing against **its own** 5000ms internal budget,
  a self-inflicted ceiling rather than genuine load latency; reverted to `->wait(2)`, the value
  already established elsewhere in this repo, with the docblock corrected to match what was actually
  observed rather than the plausible-but-wrong theory that motivated widening it in the first place)
  plus five non-blocking findings (N-1: two comments still said "5-file cap"; N-2: this section, which
  did not exist; N-3: `aria-live="polite"` sat on the tile-grid div alone, so the empty-state swap was
  never announced; N-4: the 60-tile truncation notice can fire at exactly 60 with nothing actually
  withheld, deferred — not fixed this round; N-5: the inline-edit bare-identifier `wire:click` call
  and the modal's backdrop/X close path both ship correct but browser-untested, deferred — not fixed
  this round; N-6: a docblock's "removes at the source" overstated a mitigation that reduces rather
  than eliminates a 403 noise source). B-1, N-1, N-3 and N-6 fixed directly by the coordinator; N-4
  and N-5 recorded as accepted, deliberate gaps rather than fixed, given this story's already
  extensive scope.

- **Round 3** (formal re-verification after the coordinator's own direct fixes): ✅ **PASS**, plus one
  named non-blocking follow-up (F-1): the reviewer measured the reopen test's isolated failure rate
  directly — **3 of 12 runs (25%)** — and noticed every failing run's attached context carried a
  `ServeFile` 403 for the test's `Media::factory()->create()` row, an unproven correlation the
  reviewer explicitly declined to assert as causal (Livewire's own error-attachment mechanism only
  surfaces that context on a run that already failed, which the correlation would look identical
  under either way). Proposed experiment, run the same day: swap to `->withRealFiles()` and
  re-measure. **Result: 6 of 12 runs failed (50%)** — worse, not better, and every failure landed at
  the identical `->assertVisible()`/`->fill()` pair as before. The 403 was never causal. Reverted to
  plain `->create()` (matching every other test in the file, no unneeded disk I/O), with both
  12-run samples recorded in the test's own docblock. F-1 is closed: the residual is genuinely the
  click → Livewire → Alpine → native `<dialog>` chain's own occasional latency exceeding
  `Pest\Browser\Playwright\Playwright::$timeout`'s 5000ms ceiling, ruled out from every angle this
  story's own tooling can test (wait duration, wait mechanism, polling assertion, fixture choice) —
  not a claim reached by elimination-in-theory, but by two independent 12-run measurements.

## PRD coverage

This story owns six of §2.3's Gherkin scenarios and four of its acceptance criteria:

- *"Search filters the gallery by title or description"*
- *"The gallery shows an empty state when a search matches nothing"*
- *"Upload an image via the file picker"*
- *"Upload an image by drag-and-drop"*
- *"Single-select mode stages exactly one image"*
- *"Multi-select mode stages several images at once"*

AC **1** (a single shared component reused by Products and Blog), **2** (search + empty state),
**3** (file picker + drag-and-drop) and **6** (single-select stages one, multi-select stages
several).

**Not covered here, deliberately:**

| Out of scope | Owner |
|---|---|
| The WYSIWYG "insert image" integration (§2.3's *"Inserting an image inline from the WYSIWYG editor"*) | **0021**, which depends on this story |
| The product editor's featured-image consumption (§2.3's *"Selecting an image in featured mode sets the featured image"*) | **0027**, which depends on this story |
| Upload validation, `.webp`/`.avif` generation, the `media` table, the search query, the `media.*` permissions | **0019** (done at Phase 1; **not yet implemented** — see [Dependencies](#dependencies-risks--open-questions)) |
| Media deletion | **Nobody, this phase.** Confirmed in 0019 [D11](../done/0019-media-library-upload-and-conversions-backend.md); this story adds no delete affordance to the modal, and a reviewer should expect its absence rather than flag it. |
| A standalone Media Library screen or route | **Nobody, this phase.** Confirmed Phase 0 decision, matching 0019's D10. |

**The visual reference** is the prototype's `openGallery()`
([`docs/arospe-handoff/project/js/common.js`](../../../docs/arospe-handoff/project/js/common.js) lines
226–356) and the screenshot at
[`docs/PRD/images/06-productos-galeria.png`](../../../docs/PRD/images/06-productos-galeria.png):
header with title and a live count subtitle, a search field + "Subir" button on one bar, a dropzone
above the grid, four-across tiles each showing thumbnail + title + description, and a footer with
the selection summary on the left and Cancelar / confirm on the right.

---

## Gherkin

```gherkin
Feature: Searching the shared media gallery

  Scenario: Search filters the gallery by title
    Given a catalog administrator with the media gallery open over a mixed library
    When they search the gallery for a word appearing only in one image's title
    Then only that image is shown as a selectable tile

  Scenario: Search filters the gallery by description
    Given a catalog administrator with the media gallery open over a mixed library
    When they search the gallery for a word appearing only in one image's description
    Then only that image is shown as a selectable tile

  Scenario: The gallery shows an empty state when a search matches nothing
    Given a catalog administrator with the media gallery open
    When they search the gallery for a keyword that matches no image
    Then a "no results" empty state is shown instead of tiles

  Scenario: Clearing the search restores the full gallery
    Given a catalog administrator who has searched the gallery down to a single matching image
    When they clear the search field
    Then every image in the library is shown again
```

```gherkin
Feature: Uploading images into the shared media gallery

  Scenario: Upload an image via the file picker
    Given a catalog administrator who holds media.create with the media gallery open
    When they choose a valid image file with the "Subir" file picker
    Then the image is added to the gallery as a selectable tile

  Scenario: Upload an image by drag-and-drop
    Given a catalog administrator who holds media.create with the media gallery open
    When they drop a valid image file onto the gallery dropzone
    Then the image is added to the gallery as a selectable tile

  Scenario: The gallery reports that an upload is in progress
    Given a catalog administrator who holds media.create with the media gallery open
    When they start uploading a valid image
    Then the gallery shows an in-progress indicator and refuses to start a second upload until it finishes

  Scenario Outline: An invalid upload is rejected inside the modal
    Given a catalog administrator who holds media.create with the media gallery open
    When they upload <invalid_file>
    Then the upload is rejected with an explanatory message shown inside the gallery and no tile is added

    Examples:
      | invalid_file                         |
      | a non-image file                     |
      | an image exceeding the size limit    |
      | an image exceeding the pixel ceiling |
```

```gherkin
Feature: Selecting images in the shared media gallery

  Scenario: Single-select mode stages exactly one image
    Given a catalog administrator picking a featured image in single-select mode, with two selectable tiles visible
    When they select a second tile after already selecting one
    Then only the most recently selected image is staged

  Scenario: Multi-select mode accumulates selections and shows a running count
    Given a catalog administrator adding images in multi-select mode, with several selectable tiles visible
    When they select three of those tiles
    Then the gallery footer reports three images selected

  Scenario: Confirming a multi-select returns the staged selection to the screen that opened the gallery
    Given a catalog administrator who has selected several tiles in multi-select mode
    When they confirm the selection
    Then all the selected images are handed to the screen that opened the gallery

  Scenario: A staged selection survives a search that hides it
    Given a catalog administrator who has selected an image in multi-select mode
    When they search the gallery for a keyword that does not match that image
    Then the image remains staged and is still reported in the footer count

  Scenario: Cancelling the gallery discards the staged selection
    Given a catalog administrator who has selected images in the gallery
    When they cancel the gallery
    Then nothing is handed to the screen that opened it, and reopening the gallery shows no staged selection
```

```gherkin
Feature: Editing image details in the shared media gallery

  Scenario Outline: An inline title and description edit persists
    Given a catalog administrator who holds media.edit, with <tile_context>
    When they save an inline change to that tile's title and description
    Then the tile shows the new title and description after the gallery is reopened

    Examples:
      | tile_context                          |
      | an image they have just uploaded      |
      | an image already stored in the library |
```

```gherkin
Feature: Authorization on the shared media gallery

  Scenario: An administrator without media.view is not offered the gallery
    Given a signed-in administrator who holds no media permission, on a screen that embeds the gallery
    When the screen is displayed
    Then the gallery is not offered, and the rest of the screen is unaffected

  Scenario: An administrator without media.create cannot upload
    Given a signed-in administrator who holds media.view but not media.create, with the gallery open
    When they attempt to upload an image
    Then the upload is refused and no tile is added

  Scenario: An administrator without media.edit cannot save an inline detail change
    Given a signed-in administrator who holds media.view but not media.edit, with the gallery open
    When they attempt to save an inline change to a tile's title
    Then the change is refused and the tile keeps its original title
```

---

## Verified findings that drive the decisions below

Executed against this repository/machine during the debate. Several decisions would be wrong
without them.

| # | Finding | How it was verified | Consequence |
|---|---|---|---|
| V1 | **None of story 0019's code exists yet.** `app/Livewire/Media/`, `app/Actions/Media/`, `app/Models/Media.php`, `app/Concerns/MediaValidationRules.php`, `lang/{en,es}/media.php` and any `create_media_table` migration are all absent. 0019's file sits at `ai-spec/tasks/` — the **new** stage — not in `done/`. | `ls app/Models app/Livewire lang/en`; `find . -iname "*media*"` outside `vendor/`; `ls ai-spec/tasks/done/`. | 0019 is *written and finalized*, **not implemented**. This story cannot start Phase 3 until 0019 reaches Phase 7. See [risk 1](#dependencies-risks--open-questions). |
| V2 | **Livewire's file-upload trigger is a plain native `change` listener reading `e.target.files`** — `el.addEventListener("change", eventHandler)`. There is **no** built-in drag-and-drop support. | `vendor/livewire/livewire/dist/livewire.js:693`. | Drag-and-drop must be hand-built by assigning the dropped `FileList` onto a hidden input's `.files` and firing `change`. See [D7](#d7--one-hidden-native-file-input-two-triggers). |
| V3 | **`$this->dispatch($name)` with no modifier fires a *bubbling* DOM `CustomEvent` from the dispatching component's own root element**; `->to(ComponentClass)` instead broadcasts **non-bubbling to every mounted instance of that component name** (`dispatchTo` → `componentsByName(componentName)`). **Neither targets one specific child instance by id.** | `vendor/livewire/livewire/dist/livewire.js:6796-6797` and `:6812`. | Decisive for re-entrancy: two galleries on one page cannot be told apart by `->to()`. The event name must come from the consumer. See [D2](#d2--the-consumer-contract). |
| V4 | **The prototype's `mode` option changes exactly one thing: the confirm button's label.** `var insertLabel = multi ? 'Añadir' : (opts.mode === 'featured' ? 'Usar como destacada' : 'Insertar imagen');` — `mode` is referenced nowhere else in `openGallery()`. | `grep -n insertLabel docs/arospe-handoff/project/js/common.js` → lines 241 and 265 only. | "featured" vs "editor" is **not a behavioural mode**. No enum, no `purpose` prop — a consumer-supplied label string covers it entirely. See [D3](#d3--there-is-no-mode-or-purpose-prop). |
| V5 | **Flux Free ships no dropzone primitive.** `flux:input type="file"` wraps its own real `<input>` in a `wire:ignore` div driven by `x-on:click.prevent.stop="$refs.input.click()"` — it owns that input and exposes no drop-target hook. `flux:progress` and `flux:skeleton` **are** present in Free. | `vendor/livewire/flux/stubs/resources/views/flux/input/file.blade.php`, `.../progress.blade.php`, `.../skeleton.blade.php`. | Hand-rolling the dropzone is correct here, not a convention violation — the "prefer Flux" rule applies where a Flux equivalent exists, and none does. |
| V6 | **No `max_execution_time` override in this project's PHP config**, so PHP's 30-second default applies under Sail's web server. | `docker/8.5/php.ini` (sets `post_max_size`/`upload_max_filesize` only). | Bounds how many files one synchronous upload request can convert. Drives the D9 cap, corrected to 3 files by the Phase 4 re-audit — see D9's own correction note. |
| V7 | **The Pest browser plugin has `attach()` for file inputs and `drag()` for element-to-element drags — and `drag()` cannot carry an OS file.** `attach(string $field, string $path)` calls Playwright's `setInputFiles` with a **literal filesystem path**; `drag(string $from, string $to)` calls `dragAndDrop` with two on-page **selectors** and has no concept of an external file. No file-drop helper exists anywhere in the plugin. | `vendor/pestphp/pest-plugin-browser/src/Api/Concerns/InteractsWithElements.php:181-186` and `:207-215`; `Playwright/Locator.php:655-661` and `:747-756`; grep of the whole `src/` tree for `upload|setInputFiles|fileChooser|drag|drop|dataTransfer`. | The file-picker scenario is straightforward; the **drag-and-drop scenario has no first-class API** and needs a hand-rolled `DataTransfer` shim through `Webpage::script()`. See [risk 3](#dependencies-risks--open-questions). |
| V8 | **`assertSee()` takes one synchronous snapshot** — it resolves `getByText()` once, iterates `->all()`, checks `isVisible()` and throws immediately. No retry loop in the PHP wrapper. The plugin ships an explicit `wait(int\|float $seconds)`. | `Api/Concerns/MakesElementAssertions.php:44-61`; `Api/Concerns/InteractsWithTab.php:33-42`. | A browser test that fills the search box and asserts immediately **races the debounce**. An explicit, documented `wait()` is required. Whether Playwright's Node side applies its own actionability timeout underneath could not be verified from PHP source — treat as unproven. |
| V9 | **`assertDataAttribute()` and `assertAriaAttribute()` both exist**, so tile selection state is assertable without CSS-class selectors. | `Api/Concerns/MakesElementAssertions.php:487` and `:477`. | Drives the selector strategy in [D14](#d14-selectors-accessibility-and-the-markup-rules-carried-forward). |
| V10 | **`tests/Browser/` mirrors the app structure, with one recorded departure.** `playwright-setup.md` states task 0006's `tests/Browser/UsersIndexTest.php` sits flat where the mirror would put `Users/IndexTest.php`, and instructs: "put the next browser test in its mirrored subfolder." | `docs/testing/frontend/playwright-setup.md:88`. | This story's browser test goes at `tests/Browser/Media/GalleryTest.php`, not flat. |

---

## Documented functional decisions

### D1 — `App\Livewire\Media\Gallery` is extended in place, not forked

0019's [D10](../done/0019-media-library-upload-and-conversions-backend.md) already commits the class name,
its `mount()`/upload/search surface and its `media.view`/`media.create` gating. A second modal
component was considered and **rejected**: it would either duplicate that surface or force 0019's
placeholder to be deleted and reintroduced. PRD AC 1 says outright there is **one** shared
component.

`resources/views/livewire/media/gallery.blade.php` — the *normal* mirror path, since the class is
not named `Index` and the [`Index`-in-a-subfolder exception](../../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
therefore does not apply — has its placeholder replaced wholesale.

> **Phase 3 must read 0019's real code before writing a line.** Everything below names properties
> and methods that 0019 has *described* but not yet shipped (V1). Whether its upload property is
> `$photo`, `$pendingUpload` or something else, and whether its search property is literally
> `$search`, is unknown. **Reconcile against the shipped code; do not rename 0019's surface to
> match this document.**

### D2 — The consumer contract

This is the deliverable that matters most: **0021 and 0027 bind to it without re-deciding any of
it**, so a change to it after Phase 2 is a change to three stories, not one.

The gallery is a **normal nested Livewire child component**, embedded once per consumer, opened and
closed through a `#[Modelable]` boolean, and returning its selection through a **plain bubbling
`dispatch()` whose event name the consumer supplies at mount time**.

```php
// app/Livewire/Media/Gallery.php — the public surface this story adds on top of 0019's
use Livewire\Attributes\Locked;
use Livewire\Attributes\Modelable;

#[Modelable]
public bool $open = false;              // the parent's own boolean wire:model target

#[Locked]
public bool $multi = false;             // mount-time config; never legitimately changes mid-life

#[Locked]
public string $selectEvent = 'media-selected';   // consumer picks a unique name per embedded instance

#[Locked]
public string $confirmLabel = '';       // blank => lang fallback keyed on $multi (D3)

#[Locked]
public array $selectedIds = [];         // mutated only by toggleSelect()/confirmSelection()

public string $search = '';             // the only client-writable property (D6)
```

Consumer usage — the **entire** integration surface a picker story writes:

```blade
{{-- story 0027's product editor: the featured-image picker, single-select --}}
<livewire:media.gallery
    wire:model="showFeaturedGallery"
    wire:key="featured-image-gallery"
    :multi="false"
    select-event="featured-image-selected"
    :confirm-label="__('products.featured_image.confirm_label')"
/>

{{-- the SAME page's product gallery picker, multi-select, a second independent instance --}}
<livewire:media.gallery
    wire:model="showProductGallery"
    wire:key="product-gallery-picker"
    :multi="true"
    select-event="product-images-added"
/>
```

```php
// the consumer component — one listener per embedded instance, routed by Livewire itself
#[On('featured-image-selected')]
public function setFeaturedImage(array $media): void { /* $media[0] */ }

#[On('product-images-added')]
public function addGalleryImages(array $media): void { /* all of $media */ }
```

**Why a consumer-supplied event name, and why re-entrancy forces it:**

| Option | Verdict |
|---|---|
| `->to(Gallery::class)` targeted dispatch | **Rejected — verified impossible (V3).** `dispatchTo()` resolves by *component name*, not instance id, so it broadcasts to **every** mounted `Gallery`. The two instances in 0027's product editor would both receive every selection. |
| One fixed event name + a `purpose` field the parent's single listener branches on | Workable, strictly worse. It collapses two listeners into one `switch`, discards Livewire's own `#[On(...)]` routing, and makes `assertDispatched()` unable to distinguish which instance fired. |
| **Consumer-supplied event name — (recommended), adopted** | Ordinary DOM bubbling plus `#[On($name)]` does the disambiguation for free. Per-instance assertable. Costs one `#[Locked]` string. |
| `#[Modelable] public array $selectedMedia`, mirroring [0022's](../in-progress/0022-searchable-multi-select-component.md) `$selected` | **Rejected.** 0022's two-way binding works because it carries *ids only* and re-derives labels through `resolveSelected()` on every read — machinery built for a continuously-live catalog. This payload is richer and is produced **once**, at confirm time. A one-shot event is the correct primitive; a two-way binding would reintroduce exactly the staleness problem 0022 built that machinery to avoid. |

**The payload shape — one shape for both modes, always a list:**

```php
/**
 * @return array<int, array{id: string, title: string, description: string|null,
 *                          url: string, webpUrl: string, avifUrl: string,
 *                          width: int, height: int}>
 */
```

Single-select dispatches a list of exactly one; multi-select dispatches N. **A bare object for
single mode was considered and rejected**: it would make the payload's *type* vary by mode, so
every consumer's listener signature would depend on a prop it set elsewhere. One shape,
`$media[0]` for single mode — the same reasoning that keeps `$users` an array in
`App\Livewire\Users\Index` even for a one-row table.

**The payload is re-fetched from the database at confirm time** —
`Media::query()->whereIn('id', $this->selectedIds)->get()` — never assembled from anything the
tile grid rendered. Only ids can be manipulated through a crafted `/livewire/update` payload, and
an id the query does not vouch for is silently dropped, exactly as
[0022's D4](../in-progress/0022-searchable-multi-select-component.md) requires for the same reason.

### D3 — There is no `mode` or `purpose` prop

The brief asks for the "featured" vs generic-insertion contract. **Verified (V4): in the prototype,
`mode` changes exactly one thing — the confirm button's label.** It is referenced on no other line
of `openGallery()`.

| Prototype invocation | Confirm label | This component |
|---|---|---|
| `multi: true` | `Añadir` | `$multi = true`, `$confirmLabel` blank → `media.gallery.confirm_default_multi` |
| `mode: 'featured'` | `Usar como destacada` | `$multi = false`, `:confirm-label="__('products.featured_image.confirm_label')"` |
| `mode: 'editor'` | `Insertar imagen` | `$multi = false`, `:confirm-label="__('blog.editor.insert_image')"` |

So the shared component stays **ignorant of consumer semantics**: it knows how many images may be
staged (`$multi`) and what to write on the button (`$confirmLabel`), and nothing about featured
images or WYSIWYG editors. Introducing a `MediaGalleryPurpose` enum would push Products and Blog
vocabulary into a component shared by both, for zero behavioural gain.

`$confirmLabel` defaulting to `''` rather than `null` follows both the errors-log's non-null-bound-
property rule and [0022's D5](../in-progress/0022-searchable-multi-select-component.md) `$emptyStateText`
precedent — blank means "use the lang fallback", never "unset".

### D4 — Single replaces, multi accumulates, and selected tiles stay visible

```php
public function toggleSelect(string $id): void
{
    if ($this->multi) {
        $this->selectedIds = in_array($id, $this->selectedIds, true)
            ? array_values(array_diff($this->selectedIds, [$id]))
            : [...$this->selectedIds, $id];
    } else {
        $this->selectedIds = [$id];
    }
}
```

Note this **deliberately diverges from [0022's D11](../in-progress/0022-searchable-multi-select-component.md)**,
which removes an already-selected option from its result list. The prototype keeps a selected tile
in the grid with a checkmark overlay (`tile.is-selected` / `tile__tick`,
`common.js:293-296`), and gallery has no scale pressure forcing exclusion — 0019's D7 already
judges the whole table at 10²–10³ rows. Tiles stay put; the view checks membership per tile at
render time.

### D5 — A staged selection is independent of the current search filter

Selecting three images, then searching for a fourth, must not silently discard the first three.
`$selectedIds` is component state, not a projection of the rendered grid, so filtering cannot touch
it; the footer count keeps reporting the true total and the confirm payload keeps carrying it.

This is recorded as a decision rather than left implicit because it is a genuine state-shape choice
with a plausible-looking wrong answer ("selection = what is currently ticked on screen"), and
because it is exactly the class of bug the errors-log's `null`-`<select>` entry warns
`Livewire::test()->set()` cannot detect on its own.

**Consequence for the UI:** when a staged image is filtered out of view, the footer count is the
*only* remaining evidence it is staged. The footer therefore reports the count from
`$selectedIds`, never from the rendered tiles.

### D6 — Debounced search at 300 ms, over a `#[Computed]` tile list

`wire:model.live.debounce.300ms="search"`. **300 ms matches [0022's own default](../in-progress/0022-searchable-multi-select-component.md)**,
so the project's two shared search components do not disagree for no reason; 0019's D7 already
establishes the query itself is sub-millisecond, so the value is a round-trip-count tradeoff, not a
server-load one.

The tile list is a `#[Computed]` property over 0019's search scope
(`Media::query()->search($this->search)->latest()->limit(60)->get()`), matching
`usersSummary()`/`roleOptions()` in `App\Livewire\Users\Index` — **not** a stored `$results` array.
Unlike 0022, there is no exclusion or over-fetch bookkeeping to preserve between renders (D4), so
storing it would only add a property needing its own `#[Locked]`.

`$search` is the component's **only** client-writable property, which is the point: everything else
is either mount-time config or server-derived, and all of it is `#[Locked]`.

**The grid is capped at 60 tiles — confirmed by the coordinator (2026-08-18)**, with a
"narrow your search" notice when the cap truncates the result set, reusing
[0022's](../in-progress/0022-searchable-multi-select-component.md) own truncation-row idiom. Pagination and
infinite scroll were both considered and rejected: 0019 D7 judges the library at 10²–10³ rows, the
PRD's screenshot shows a plain scrolling grid with no pagination control anywhere, and each tile
renders a `<picture>` with three sources (D13), so an uncapped grid is the one shape with a real
rendering cost.

Two consequences worth stating, because the cap interacts with decisions above:

- **The cap applies to the *rendered* grid, never to the selection.** A staged image filtered out
  by the cap stays staged and stays in the confirm payload, exactly as D5 requires for a search
  filter. `$selectedIds` is never derived from the visible tiles.
- **`latest()` makes the cap show the 60 newest**, so a just-uploaded image is always visible —
  which is what keeps the upload scenarios' "the image is added to the gallery as a selectable
  tile" true even in a library past the cap.

### D7 — One hidden native file input, two triggers

**Verified (V2):** Livewire's upload pipeline is driven by a native `change` listener reading
`e.target.files`. **Verified (V5):** Flux Free has no dropzone primitive, and `flux:input type="file"`
owns its own input inside a `wire:ignore` wrapper with no drop hook. So one hidden native input is
hand-rolled and fed from both triggers:

```blade
<input type="file" wire:model="pendingUploads" multiple accept="image/*"
       class="sr-only" x-ref="uploadInput"
       aria-label="{{ __('media.gallery.upload_input_label') }}">

<flux:button icon="arrow-up-tray" x-on:click="$refs.uploadInput.click()"
             wire:loading.attr="disabled" wire:target="pendingUploads"
             data-test="media-upload-button">
    {{ __('media.gallery.upload_button') }}
</flux:button>

<div data-test="media-dropzone"
     x-on:dragover.prevent="dragging = true"
     x-on:dragleave.prevent="dragging = false"
     x-on:drop.prevent="
         dragging = false;
         $refs.uploadInput.files = $event.dataTransfer.files;
         $refs.uploadInput.dispatchEvent(new Event('change'));
     ">
    {{-- dropzone visual; label swaps on `dragging`, mirroring the prototype --}}
</div>
```

Assigning `$event.dataTransfer.files` (already a real `FileList`) onto the input's `.files` and
firing `change` re-enters Livewire's own pipeline unmodified — **no custom upload endpoint, no
second code path, and the drag-and-drop scenario and the file-picker scenario converge on the same
server-side method.** That convergence is also why drag-and-drop is a progressive enhancement
rather than an accessibility gap: the button reaches the identical input.

**This must be confirmed empirically in Phase 3.** Assigning to `HTMLInputElement.files` is
supported in evergreen browsers but has not been executed against this stack —
[risk 2](#dependencies-risks--open-questions).

### D8 — The in-flight state has **two** phases, and only the first has a percentage

0019's D4 asks this story to decide and document the uploading/processing state. There are two
distinct windows, and conflating them produces a progress bar that sits at 100% for several
seconds:

1. **Transport** (browser → temporary storage). Livewire fires `livewire-upload-start` /
   `livewire-upload-progress` / `livewire-upload-finish` on the input element, and
   `$event.detail.progress` is a real 0–100 percentage
   (`vendor/livewire/livewire/dist/livewire.js:674-680`).
2. **Server-side processing** — 0019's synchronous decode plus two Imagick encodes plus the insert,
   all inside the single Livewire request that finishing the upload triggers. **There is no
   percentage available here**; `livewire-upload-progress` has already reported 100 while the
   request is still in flight.

So: a determinate `flux:progress` labelled with the percentage while transport runs, then an
**indeterminate** indicator (a `flux:skeleton` tile labelled "Processing…", both present in Flux
Free per V5) for phase 2, and **both triggers disabled for the whole window** via
`wire:loading.attr="disabled"` `wire:target="pendingUploads"` — the same idiom the Users screen
already uses on Save/Delete.

Disabling is not cosmetic. It is the guard against the failure mode in
[risk 4](#dependencies-risks--open-questions): a multi-second request with no feedback invites a
second upload of the same file, producing two `media` rows for one intended image.

### D9 — Multi-file upload is allowed, processed sequentially, one committed row per file

The prototype's input carries `multiple` and processes each file independently
(`common.js:315-330`). 0019's D4 named multi-file as its revisit trigger for synchronous
conversion, so this story owes it an answer: **allow it, loop `StoreUploadedImage` per file, and
keep each file inside its own D6 transaction** — so one file's failure rolls back only that file
and leaves its siblings committed, matching the prototype's per-file completion.

Validation applies per element at the call site (`'pendingUploads.*' => $this->imageUploadRules()`);
`MediaValidationRules` itself needs no change.

> **Correction (Phase 4 re-audit, D8/D9 fix round): the cap is 3 files, not 5.** The paragraph
> below is left as originally confirmed, with this note on top, per this project's own convention
> of recording a correction rather than silently rewriting history (`docs/errors-log.md`). The
> re-audit *measured* the "stays inside 30s with margin" claim rather than trusting it: five files
> at `MediaValidationRules::MAX_DIMENSION` (4000×4000, the worst legal input) took **34.8s total**
> through `StoreUploadedImage` alone — over PHP's 30s `max_execution_time` default with no margin,
> not under it. Three files measured ~21s, with real margin. `MAX_FILES` (the constant on
> `App\Livewire\Media\Gallery`, `MediaValidationRules::mediaDetailsRules()` is unaffected), the
> `too_many_files` copy in both locales, and every test asserting the boundary were updated from
> 5/6 to 3/4 accordingly. This dev environment's CLI SAPI happens not to enforce
> `max_execution_time` at all, which is what let the over-budget 5-file cap ship without an
> observed failure here — a real FPM deployment inheriting the 30s default would have killed a
> 4-or-5-file request mid-batch.
>
> ~~**The cap is 5 files per drop or per file-picker selection — confirmed by the coordinator
> (2026-08-18).** V6 (no `max_execution_time` override, so PHP's 30-second default) plus 0019 D4's
> "sub-second to a few seconds per file" is what bounds it: five sequential two-format Imagick
> encodes stay inside 30 s with margin, while covering the realistic "drop a product's photo set"
> gesture.~~

The number appears in exactly two places — the validation rule (`'pendingUploads' => ['array', 'max:'.self::MAX_FILES]`)
and the user-facing `media.gallery.too_many_files` key — and **a rejection over the cap must name
the limit**, not fail silently or truncate the selection to the first three.

### D10 — Inline title/description editing lives on two surfaces and needs one new action

Both surfaces, per the confirmed Phase 0 scope:

- **On upload** — the new tile lands with its title/description fields already open for editing.
  The tile *is* the form until dismissed; there is no separate "add details" step, which is what
  keeps the PRD's own one-step *"they choose an image file… then the image is added as a selectable
  tile"* scenario literally true.
- **On a selected tile** — an icon-only pencil action toggles that one tile into edit mode,
  mirroring the Users row-action convention exactly (`aria-label`, `data-test="edit-media-{id}"`,
  `@js($id)` in the `wire:click`).

**Persistence** is `updateMediaDetails(string $id, string $title, ?string $description)` calling a
new invokable `App\Actions\Media\UpdateMediaDetails`, with `Gate::authorize('update', $media)` as
its first statement — the first real exercise of the `media.edit` ability 0019 seeds and stubs but
never uses. Validation reuses `MediaValidationRules::mediaDetailsRules()` **unchanged**, so the
title/description constraints live in exactly one place across upload and edit.

The action writes `title` and `description` **only**. The three path columns stay outside
`#[Fillable]` per 0019's D8 mass-assignment guard, and nothing in this story has any business
touching them.

Naming follows [naming.md](../../../docs/conventions/naming.md#classes): imperative verb phrase, no
`Action` suffix, matching `StoreUploadedImage` / `GenerateImageConversions`.

### D11 — The title is auto-derived from the filename at upload, then editable

`pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)`, matching the prototype's
`file.name.replace(/\.[^.]+$/, '')` (`common.js:322`). This is what reconciles 0019's `NOT NULL`
`media.title` with the PRD's single-step upload scenario, and D10's on-upload inline editing is
then a *rename*, not a required gate.

**Confirmed by the coordinator (2026-08-18):** auto-derive the default title from the filename when
the administrator does not set one inline. Requiring a title before the upload commits was
considered and rejected (it adds a step the PRD scenario does not have); relaxing 0019's `NOT NULL`
was rejected outright as reopening a closed backend decision.

The derived value is a **fallback, not an override**: if the administrator has already typed a title
into the inline fields before the upload commits, that value wins. The filename only fills an
otherwise-empty title, so the column is never `NULL` and the admin is never overwritten.

### D12 — Embedding changes where the `viewAny` gate belongs

0019's D10 says: "there is no `GET /media` route… **all** authorization is the component's own —
`Gate::authorize()` in `mount()`." That was written while Gallery was imagined as a standalone
entry point. Once this story nests it as an **always-mounted child** of another (already gated)
screen, a bare `Gate::authorize('viewAny', …)` in `mount()` would **403 the entire host page** for
any user who can reach the product editor but lacks `media.view` — an unrelated-permission failure
dressed up as a security control.

The resolution adds a layer rather than removing one:

```blade
{{-- the consumer decides whether the child is rendered at all --}}
@can('viewAny', \App\Models\Media::class)
    <livewire:media.gallery ... />
@endcan
```

and Gallery keeps **every** `Gate::authorize()` call 0019 specifies — `viewAny` in `mount()`,
`create` first in the upload method, `update` first in `updateMediaDetails()` — as defense in depth
covering direct `Livewire::test()` mounting and the mounted-then-revoked-mid-session case. Per
[livewire-authorization.md](../../../docs/security/livewire-authorization.md#gate-at-the-top-of-every-method-that-mutates-or-discloses),
hiding a control is never the control.

Within the modal, a user holding `media.view` but not `media.create`/`media.edit` gets the affected
controls **rendered disabled with an explanatory tooltip**, reusing the Users list's
`Gate::allows()`-driven per-row pattern and its two recorded Flux/Blaze traps
([D14](#d14-selectors-accessibility-and-the-markup-rules-carried-forward)) — not hidden, and never
relying on the 403 alone as the user-facing answer.

### D13 — Tiles render `<picture>`, not a bare `<img>`

0019's D8 stores three explicit paths precisely so a consumer can pick the best-supported format,
and `<picture>` is the standard consumer of that:

```blade
<picture>
    <source srcset="{{ $item['avifUrl'] }}" type="image/avif">
    <source srcset="{{ $item['webpUrl'] }}" type="image/webp">
    <img src="{{ $item['url'] }}" alt="{{ $item['title'] }}" loading="lazy">
</picture>
```

No width descriptors: 0019 generates **format** variants, not **size** variants, so this is
format negotiation only. The accessor names are 0019's to finalize — reconcile the exact casing in
Phase 3 (V1).

### D14 Selectors, accessibility, and the markup rules carried forward

- **Tiles**: `data-test="media-tile-{id}"` on the clickable element plus
  `aria-pressed="true|false"` — a toggle, so `aria-pressed` fits better than `aria-selected`, and
  **verified (V9)** both `assertDataAttribute()` and `assertAriaAttribute()` exist, so selection
  state is assertable without brittle CSS-class matching.
- **Icon-only controls** (`edit-media-{id}`, `media-upload-button`, `media-dropzone`,
  `media-confirm`, `media-cancel`) each carry an `aria-label` and a `data-test` hook, present on
  **both** the enabled and the disabled branch, exactly as the Users row actions do
  ([api/routes.md](../../../docs/api/routes.md#usersindex--the-first-permission-gated-route)).
- **`@js()` on every id interpolated into a `wire:*` argument** — `wire:click="toggleSelect(@js($item['id']))"`.
  Mandatory, not stylistic
  ([blade-livewire-output-encoding.md](../../../docs/security/blade-livewire-output-encoding.md)).
- **Never bind a `null` property to a form control** — `$search` is `''`, and the inline-edit
  title/description inputs coerce `null` → `''` on open. The errors-log rule.
- **A disabled control's tooltip is a written-out `<flux:tooltip>` wrapper on its own `@if`/`@else`
  branch**, never `:tooltip="$cond ? … : null"` — the Blaze presence trap — and any
  `cursor-not-allowed!` goes on **that wrapper**, never on the `pointer-events-none` button. Both
  traps are recorded in [errors-log.md](../../../docs/errors-log.md) with their verification method.
- **`aria-live="polite"`** on the result-count / empty-state region, so a debounced result swap is
  announced.

### D15 — Every user-facing string is a translation key

New keys land in 0019's `lang/en/media.php` + `lang/es/media.php`, key-for-key identical, in the
`media.gallery.*` group 0019 already anticipates: `title`, `count_summary`, `search_placeholder`,
`upload_button`, `upload_input_label`, `dropzone_label`, `dropzone_label_dragging`,
`empty_state.title`, `empty_state.body`, `selection_none`, `selection_count`,
`confirm_default_single`, `confirm_default_multi`, `uploading_progress`, `processing`,
`too_many_files`, `action_not_allowed`. Plus a new `media.edit.*` group: `title_label`,
`description_label`, `save`, `cancel`. No new `media.upload.*` / `media.validation.*` keys are
expected — those are 0019's and are reused as-is.

### D16 — The browser-test harness route (**confirmed**)

**Confirmed by the coordinator (2026-08-18), resolving the story's one blocking question.** The
gallery has no route (0019 D10, reconfirmed here) and neither real consumer exists yet (0021, 0027),
so **no URL exists for a browser test to `visit()`**. A `Livewire::test()` feature test is
unaffected — it mounts the component directly — but the whole real-DOM half of this story's
coverage is otherwise unreachable.

This story therefore ships a **minimal, throwaway harness page**, registered **only** when
`app()->environment('testing', 'local')`:

```php
// routes/web.php — temporary scaffolding for story 0020's own browser tests. NOT app surface.
// Delete this block when story 0027 (product editor) provides a real host page for the gallery.
if (app()->environment('testing', 'local')) {
    Route::livewire('dev/media-gallery-harness', MediaGalleryHarness::class)
        ->middleware(['auth', 'verified'])
        ->name('dev.media-gallery-harness');
}
```

Four constraints, all load-bearing:

1. **The environment gate is the security control, and it is a registration-time gate, not a
   middleware check.** The route must not exist at all in production — not exist-and-403. A
   `permission:`/`can:` middleware would still leave the URL registered and discoverable.
2. **It carries `auth` + `verified` anyway**, so a misconfigured environment still cannot expose it
   to an anonymous visitor. Defense in depth behind the gate, not instead of it.
3. **The harness must exercise the real contract**, not a simplified stand-in: it embeds **two**
   gallery instances (one `:multi="false"`, one `:multi="true"`, with distinct `select-event`
   names) and renders what each listener received. That is what makes the re-entrancy acceptance
   criterion (V3, D2) testable at all — a single-instance harness would silently pass a broadcast
   bug.
4. **It is scaffolding with a named expiry**, recorded in the file's own comment: it is deleted by
   story **0027**, which supplies a real host page. This story's Definition of Done includes
   `docs-keeper` recording it as temporary in `docs/api/routes.md`, so it does not quietly become
   permanent app surface.

`appsec-auditor` should confirm the gate in Phase 4 — a test-only route is exactly the kind of
thing that ships by accident.

---

## Files to create/modify

### Create

- `app/Actions/Media/UpdateMediaDetails.php` — invokable; writes `title`/`description` on an
  existing `Media` row (D10). Lives in the `app/Actions/Media/` subfolder 0019 creates.
- `tests/Feature/Media/GalleryTest.php` — component-level interaction logic.
- `tests/Feature/Media/GalleryRenderingTest.php` — markup-level assertions, mirroring the
  `IndexTest.php` / `IndexRenderingTest.php` split already established for `Users\Index`.
- `tests/Browser/Media/GalleryTest.php` — **mirrored subfolder**, per V10. Only the cases a
  `Livewire::test()` genuinely cannot reach (see [Tests to perform](#tests-to-perform)).
- `app/Livewire/Dev/MediaGalleryHarness.php` + `resources/views/livewire/dev/media-gallery-harness.blade.php`
  — the environment-gated browser-test harness ([D16](#d16--the-browser-test-harness-route-confirmed)).
  Embeds **two** gallery instances (single- and multi-select, distinct `select-event` names) and
  renders what each listener received, so the re-entrancy criterion is testable. **Temporary
  scaffolding, deleted by story 0027** — both files carry a comment saying so.
- `tests/Browser/Fixtures/sample-upload.jpg` — a small, real, checked-in JPEG. **Verified (V7):**
  `attach()` takes a literal filesystem path, so `UploadedFile::fake()` cannot be handed to it.

### Modify

- `app/Livewire/Media/Gallery.php` — the public surface in D2, plus `toggleSelect()`,
  `confirmSelection()`, `cancel()`, `updatedPendingUploads()`, `startEditing()`,
  `updateMediaDetails()`, and the `#[Computed]` tile list. **Reconcile against 0019's shipped
  names first (V1, D1).**
- `resources/views/livewire/media/gallery.blade.php` — placeholder replaced with the real modal.
- `app/Policies/MediaPolicy.php` — **verify only, likely no change.** 0019 already plans `update()`
  returning a `media.edit` check "unused by this story but correct from the start"; 0020 is the
  consumer that finally exercises it.
- `app/Concerns/MediaValidationRules.php` — **verify only, likely no change.** `imageUploadRules()`
  applies per array element at the call site (D9); `mediaDetailsRules()` is reused verbatim (D10).
- `lang/en/media.php` + `lang/es/media.php` — the keys in D15, both files in the same change.
- **Docs (Phase 6, `docs-keeper`)** — `docs/api/routes.md` (the gallery is the first shared
  *modal-only* Livewire component with no route of its own; the `users.index` section is the model
  for how its selector/markup contract gets recorded), `docs/architecture/authorization.md` (D12's
  embedded-child gating pattern — the `@can`-wraps-the-embed layer is new), and
  `docs/conventions/base-standards.md` if the nested-child-with-consumer-supplied-event pattern is
  judged a project convention rather than a one-off. Plus `docs/README.md`'s index.

### Modify — the harness only

- `routes/web.php` — the environment-gated harness route from
  [D16](#d16--the-browser-test-harness-route-confirmed), inside an
  `if (app()->environment('testing', 'local'))` block with its deletion trigger in a comment. This
  is the **one** qualification to this story's "no route" boundary, and it is deliberately not a
  production route: the gate is at *registration* time, so the URL does not exist at all in
  production.

### Explicitly NOT touched

**No production route** and no sidebar entry (the harness above is the sole, environment-gated
exception), no migration, no seeder, no `RolePermissionSeeder` change, no new base directory
(`app/Livewire/Dev/` is a subfolder of the existing `app/Livewire/`), no new enum (D3), no delete
affordance, and nothing under `tests/Feature/Seeders/`.

---

## Tests to perform

Frontend-QA contribution. The split below is deliberate and is the load-bearing part: **the
errors-log's `null`-`<select>` entry establishes that `Livewire::test()->set()` can never detect a
whole class of real UI bug, because it writes the property directly and never touches the DOM** —
and that a `selectOption()`-style browser API can miss it too. So interaction logic is proven
cheaply at component level, and only the cases that genuinely require a real DOM go to Chromium.

**Component — `tests/Feature/Media/GalleryTest.php`**
- [ ] Integration: setting the search property filters the exposed tile list by title.
- [ ] Integration: the same by description.
- [ ] Integration: a non-matching term yields an empty tile list.
- [ ] Integration: clearing the term restores the full list.
- [ ] Integration: in single-select mode, selecting a second tile leaves exactly one staged id.
- [ ] Integration: in multi-select mode, selecting three tiles stages three ids; re-selecting one
      removes it (toggle, per D4).
- [ ] Integration: a staged selection survives a search that excludes it, and is still in the
      confirm payload (D5) — **seed the data so an unstaged-on-filter implementation really fails.**
- [ ] Integration: `confirmSelection()` dispatches under the **consumer-supplied** event name, with
      the exact array shape from D2 — assert the shape, not just that something was dispatched.
- [ ] Integration: single-select mode dispatches a **one-element list**, not a bare object.
- [ ] Integration: cancelling dispatches nothing and clears `$selectedIds`.
- [ ] Integration: a confirm payload containing an id no longer in the database silently drops that
      id rather than erroring (the tampered/deleted-row case, D2).
- [ ] Integration: an upload creates a `media` row and the new tile appears at the head of the list.
- [ ] Integration: `updateMediaDetails()` persists title and description.
- [ ] Negative: an invalid upload surfaces a validation message and creates no row.
- [ ] Authorization: a user with no media permission cannot `mount()` (403).
- [ ] Authorization: `media.view` without `media.create` is refused the upload (403) **and** the row
      count is unchanged.
- [ ] Authorization: `media.view` without `media.edit` is refused `updateMediaDetails()` (403)
      **and** the row's title is unchanged.
- [ ] Authorization: a `Super Admin` holding zero explicit permission rows passes all three, via the
      `Gate::before` bypass (mirrors the existing `UserPolicyTest` case).

**Rendering — `tests/Feature/Media/GalleryRenderingTest.php`**
- [ ] The empty-state markup renders when the search matches nothing, and tiles do not.
- [ ] A tile renders its `data-test` hook, its title, its description, and a `<picture>` with both
      `<source type="image/avif">` and `<source type="image/webp">` (D13).
- [ ] `aria-pressed` is `"true"` on a staged tile and `"false"` on an unstaged one.
- [ ] The footer reports the selection count from `$selectedIds`, including while a staged tile is
      filtered out of view (the visible half of D5).
- [ ] The confirm button carries `$confirmLabel` when supplied, and the `$multi`-keyed lang fallback
      when blank (D3).
- [ ] The upload button and dropzone render **disabled with a tooltip** for a `media.view`-only user
      and enabled for a `media.create` holder (D12) — assert the `data-test` hook is present on
      **both** branches.
- [ ] The pencil action renders disabled for a user without `media.edit`.

**Browser — `tests/Browser/Media/GalleryTest.php`** *(against the D16 harness route)*
- [ ] Selecting a tile by a real click toggles its visual state and the footer count — the case
      `Livewire::test()` provably cannot cover.
- [ ] Single-select by real clicks: clicking a second tile visibly deselects the first.
- [ ] Debounced search from real keystrokes narrows the grid — **with one explicit, documented
      `->wait()`**, because `assertSee()` takes a single synchronous snapshot (V8) and would
      otherwise race the debounce. Record the wait as a deliberate trade-off, not a stray `sleep`.
- [ ] File-picker upload via `attach()` against the checked-in fixture adds a tile.
- [ ] Drag-and-drop upload adds a tile — see [risk 3](#dependencies-risks--open-questions) for why
      this one needs a hand-rolled `DataTransfer` shim and what the fallback is.
- [ ] The upload controls are inert while an upload is in flight (D8, and the guard against
      [risk 4](#dependencies-risks--open-questions)).
- [ ] Open → search → cancel → reopen on the **same page load** leaks no search term and no staged
      selection.
- [ ] One representative invalid upload shows its message **inside the modal** and adds no tile —
      proving the UI wiring, not re-proving the server rule.
- [ ] `assertNoJavaScriptErrors()` on the whole flow — the hand-rolled Alpine drop handler (D7) is
      exactly the kind of code that fails silently otherwise.
- [ ] **Re-entrancy**: on the harness page's two instances, confirming the single-select gallery
      updates only its own listener's output and leaves the multi-select one untouched — the case
      V3 proves a `->to()`-based contract would silently fail.
- [ ] Selecting more than 3 files at once is rejected with a message naming the limit (D9, cap corrected from 5).

**Harness gating — `tests/Feature/Dev/MediaGalleryHarnessRouteTest.php`**
- [ ] The harness route resolves under the `testing` environment.
- [ ] **The route is not registered at all under `production`** — assert against the route
      collection (`Route::has('dev.media-gallery-harness')` is `false`), not merely that a request
      404s: D16's gate is non-existence, not refusal, and only the collection assertion can tell
      those apart. This is the regression test that stops the scaffolding shipping.

**Deliberately NOT re-tested in the browser** (per [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md)
and [coverage-policy.md](../../../docs/testing/frontend/coverage-policy.md)): the full upload
validation matrix, the `LIKE`-escaping and case-insensitivity semantics, and the 403 paths — all
already proven server-side by 0019 and by the component tests above. None of it depends on the DOM,
and **every browser test that performs a real upload pays real synchronous Imagick encode time**
inside a Chromium-driven request (there is no `Storage::fake()`-equivalent seam for the imaging
pipeline reachable from that layer), so re-driving proven server rules through the browser buys
nothing and costs CI minutes on a 3-version matrix.

**Test-design traps to avoid**
- `attach()` needs a **literal path on disk** (V7) — `UploadedFile::fake()` is a Feature-test
  construct and cannot be passed to it. That is why a real fixture file is checked in.
- `drag()` drags one **on-page element** onto another (V7). It has no concept of an OS file and
  **cannot** drive the drop-a-file scenario. Do not reach for it.
- Asserting selection state by CSS class is brittle; `assertAriaAttribute()`/`assertDataAttribute()`
  exist (V9) — use them.
- A test that only asserts the end state of an upload will never catch the double-submit in
  [risk 4](#dependencies-risks--open-questions); it takes an interaction *during* the in-flight
  window.

---

## Expected outcome

A catalog administrator on a screen that embeds the gallery opens a modal listing the media library
as tiles, each showing its thumbnail, title and description. Typing in the search box narrows the
grid by title or description after a short pause, and a term matching nothing shows an explicit
"no results" state rather than an empty grid. Dropping an image on the dropzone — or choosing one
with "Subir" — uploads it, shows progress and then a processing indicator while the `.webp`/`.avif`
variants are generated, and adds it as a tile with its title prefilled from the filename and its
detail fields open for editing. Any tile's title and description can be edited inline and persist.
In single-select mode exactly one image stays staged; in multi-select mode selections accumulate,
the footer reports the running count, and confirming hands the whole staged set back to the screen
that opened the gallery. Two galleries on one page stay independent. Story 0021 and story 0027 can
each embed the component with four attributes and one `#[On]` listener.

## Acceptance criteria

- [ ] **(PRD §2.3 AC 1)** One shared component serves every consumer; embedding it takes only the
      props in [D2](#d2--the-consumer-contract), and it contains no Products- or Blog-specific
      vocabulary.
- [ ] **(PRD §2.3 AC 2)** Title/description search filters the grid with a debounce, and a
      non-matching term renders an explicit empty state instead of tiles.
- [ ] **(PRD §2.3 AC 3)** Both the "Subir" file picker and a drag-and-drop onto the dropzone upload
      an image, and both reach the identical server-side method.
- [ ] **(PRD §2.3 AC 6)** Single-select mode stages exactly one image, replacing any prior
      selection; multi-select accumulates, reports a running count in the footer, and confirms with
      the consumer-supplied label.
- [ ] The confirm action dispatches the consumer-supplied event name carrying the exact array shape
      documented in D2, re-read from the database at confirm time — and 0021/0027 can bind to that
      contract without changing this component.
- [ ] Two gallery instances on one page never receive each other's selection.
- [ ] A staged selection survives a search that filters it out of view, and is still delivered on
      confirm.
- [ ] Uploading shows a determinate transport indicator and then an indeterminate processing
      indicator, and both upload triggers are inert for the whole window.
- [ ] A tile's title and description can be edited inline — on a freshly uploaded tile and on an
      existing one — and the change persists, gated on `media.edit`.
- [ ] Authorization: the consumer gates whether the child renders at all, and `mount()`, the upload
      method and `updateMediaDetails()` each `Gate::authorize()` as their first statement. Controls
      the actor may not use render **disabled with a tooltip**, never merely failing on click.
- [ ] Uploading more than 3 files at once is rejected with a message naming the limit (cap corrected from 5); the grid
      renders at most 60 tiles, newest first, with a "narrow your search" notice when truncated —
      and neither cap ever drops a staged selection.
- [ ] No **production** route, no sidebar entry, no delete affordance, no migration, no
      permission-catalog change. The one route this story adds is the D16 harness, registered
      **only** under `testing`/`local`, covered by a test asserting it is absent from the route
      collection in production, and documented as temporary scaffolding that story 0027 deletes.
- [ ] No user-facing string is hardcoded; `lang/en/media.php` and `lang/es/media.php` stay
      key-for-key identical.
- [ ] The full suite is green in a single isolated run
      ([contracts.md](../../../docs/contracts.md)).

## Definition of Done

- [ ] Tests written and green (full suite, isolated run — [contracts.md](../../../docs/contracts.md))
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper) — including D12's embedded-child gating pattern, which
      `architecture/authorization.md` does not currently describe, and the D16 harness route
      recorded in `docs/api/routes.md` as **temporary, environment-gated scaffolding** with story
      0027 named as its deletion trigger
- [ ] Acceptance criteria met

---

## Technical tasks

Ordered. Step 0 is a hard gate.

0. **Confirm story 0019 has completed Phase 7** (V1 — none of its code exists yet) and **read the
   shipped code**, reconciling every property/method/accessor name this document assumes (D1).
   Record any divergence in this file before writing a line.
1. ~~Resolve the blocking open questions with the coordinator.~~ **Done — all four confirmed on
   2026-08-18** and folded into D16 (harness route), D9 (5-file cap), D6 (60-tile cap) and D11
   (auto-derived title). Nothing here blocks Phase 2.
2. `frontend-qa` writes the failing component and rendering tests (red).
3. `frontend-expert` implements the component's public surface (D2), selection semantics (D4, D5)
   and the `#[Computed]` tile list (D6) — green.
4. `App\Actions\Media\UpdateMediaDetails` + the inline-edit methods (D10), and the `MediaPolicy`
   `update()` verification.
5. The Blade view: modal chrome, search bar, dropzone + hidden input (D7), tile grid with
   `<picture>` (D13), footer, in-flight states (D8), disabled branches (D12, D14).
6. `lang/en/media.php` + `lang/es/media.php` keys (D15).
7. The environment-gated harness route, component and view (D16), plus its own gating test.
8. **Verify the drop handler empirically in a real browser** (D7, risk 2) before writing the
   browser test that depends on it.
9. `frontend-qa` writes the browser tests against the harness, including the `DataTransfer` shim or
   its documented fallback (risk 3).
9. Quality gates in order per
   [base-standards](../../../docs/conventions/base-standards.md#quality-gates): filtered tests →
   `vendor/bin/pint --dirty --format agent` → Larastan level 7 → full suite.

---

## Dependencies, risks & open questions

**Dependencies**

- **[0019 — media library upload, conversions and search](../done/0019-media-library-upload-and-conversions-backend.md)
  — Phase 1 complete, implementation NOT started (V1).** This story is blocked on 0019's Phase 7,
  per workflow.md's [task ordering rule](../../../docs/workflow.md#task-ordering-rule). The brief that
  commissioned this debate described 0019 as "already done"; that is true of the *story document*,
  not of the code.
- 0019 records a soft dependency on
  [`0008`](../done/0008-super-admin-role-invariants.md) for its red TDD tests in flight. **That is now
  stale — 0008 closed to `done/` on 2026-08-18**, so it no longer constrains either story's
  baseline. Verified: `ai-spec/tasks/in-progress/` is empty.
- **This story is the blocker for 0021 (WYSIWYG insert-image) and 0027 (product editor featured
  image).** Numbering already satisfies the ordering rule (0019 < 0020 < 0021 < 0027).
- **No dependency on [0022](../in-progress/0022-searchable-multi-select-component.md).** The two shared components
  are independent and deliberately diverge (D4, D6, and the `#[Modelable]` reasoning in D2). PRD
  §2.4 explicitly names the media gallery's search as the **wrong** precedent for 0022's, and the
  inverse holds too.

**Risks**

1. **Building against a contract that does not exist yet (highest).** Every name in this document
   is taken from 0019's *prose*, not its code (V1). Mitigated by technical-task step 0 — but the
   real risk is starting Phase 3 before 0019 closes and silently reshaping 0019's surface to match
   this file instead of the other way round.
2. **The drag-and-drop mechanism is designed but unexecuted.** Assigning a `FileList` onto
   `HTMLInputElement.files` and firing `change` (D7) is the only way to reuse Livewire's pipeline
   given V2, and it is broadly supported — but it has not been run against this stack. Verify in a
   real browser (technical-task step 7) **before** the browser test that depends on it is written.
3. **The drag-and-drop *test* has no first-class API (V7).** `attach()` cannot drop, and `drag()`
   cannot carry a file. The only lever is `Webpage::script()` with a hand-rolled `DataTransfer` +
   `File`, whose exact shape depends on markup that does not exist yet. **Fallback, to be taken
   consciously rather than silently:** cover "drag-and-drop adds a tile" through the same
   `attach()` path as the file picker and record in that test's docblock that true OS-level drop
   dispatch is unverified. That is an honest gap; a green test that secretly proves the wrong thing
   is not.
4. **Double-submit during the synchronous conversion window.** 0019's D6 makes the upload atomic,
   so a half-converted tile cannot exist — but a multi-second silent request invites a second
   upload of the same file, producing two rows for one intended image. D8's disabled-controls rule
   is the guard, and the browser test that exercises it is the only thing that will catch a
   regression, since an end-state assertion never can.
5. **Search racing an in-flight upload.** Two Livewire actions on one component instance. Livewire's
   per-component request queuing probably serialises them, but that is an assumption about
   unwritten code, not a verified fact. Worth one browser test once real markup exists; flagged as
   a stretch case rather than a v1 must-have.
6. **Browser-suite cost.** Every real-upload browser test pays real Imagick encode time inside a
   Chromium-driven request, stacked on Playwright startup, across the 3-PHP matrix 0019's
   `extensions: imagick` change already extends. No new *dependency*, a real new *cost*. Mitigated
   by the deliberate Feature-vs-browser split above.
7. **A narrower custom role loses the gallery silently.** Under D12 the `@can`-wrapped embed means a
   role without `media.view` simply sees no "Add image" affordance — no error, no explanation.
   Latent today (every seeded `Administrator` holds all four `media.*` permissions), but it becomes
   real the moment Epic 1's story 0011 makes custom roles common. Record it in the docs pass rather
   than discovering it in support.

**Open questions**

> **OQ-1 through OQ-4 were resolved by the coordinator on 2026-08-18, each exactly as recommended.**
> They are recorded as confirmed decisions [D16](#d16--the-browser-test-harness-route-confirmed),
> [D9](#d9--multi-file-upload-is-allowed-processed-sequentially-one-committed-row-per-file),
> [D6](#d6--debounced-search-at-300-ms-over-a-computed-tile-list) and
> [D11](#d11--the-title-is-auto-derived-from-the-filename-at-upload-then-editable) respectively, and
> are no longer questions. Only OQ-5 and OQ-6 below remain open, and **neither blocks Phase 2 or
> Phase 3**.

### OQ-5 — Does a `#[Modelable]` boolean round-trip when Flux's modal closes itself?

D2 binds `$open` with `#[Modelable]`, but Flux's `<flux:modal>` closes through its own backdrop / X
button, and whether that propagates back through Livewire's `#[Modelable]` entanglement to the
parent's bound property has not been traced. **This is [0022's own unresolved OQ-6](../in-progress/0022-searchable-multi-select-component.md)
inherited unchanged.** Not blocking Phase 2 — verify empirically in Phase 3 for this component
specifically rather than assuming 0022's eventual finding transfers.

### OQ-6 — Should the nested-child + consumer-supplied-event pattern become a documented convention?

If D2 is accepted, this is the project's second shared Livewire component and the **first** to use a
callback-style event contract. Whether that graduates into
`docs/conventions/base-standards.md` as "how a reusable modal returns a value" — or stays a
one-off recorded only in `api/routes.md` — is a docs-scope call for Phase 6, not a blocker.
