# [0024a] Product description — HTML sanitization on write

> **Split out of [0024](../done/0024-products-core-crud-backend.md) on 2026-09-01**, after that story failed
> its Phase 2 INVEST review and the coordinator approved a three-way split. This file owns everything
> that was **D-16** and **RQ-1** there: the Composer dependency, the allow-list config, the
> `SanitizeProductDescription` action, the wiring into the two write paths, and the security-critical
> test file.
>
> **The decision keeps the label `D-16`**, because eight sibling files (0027, 0029, 0061, 0076, 0077,
> 0079 and `done/0021`) cite `0024 **D-16**` by number. Following such a citation now lands here, on a
> section headed D-16, rather than on a renamed entry a reader has to reconcile.

## Description

`products.description` holds HTML produced by [story 0021](../done/0021-wysiwyg-rich-text-editor-component.md)'s
WYSIWYG editor, and story 0027 will render it **unescaped** — that is the whole point of a rich-text
field. This story is what makes that safe: it adds `symfony/html-sanitizer` (an **already-approved**
new dependency), an allow-list configuration limited to the toolbar's own tag set, a single
`App\Actions\Products\SanitizeProductDescription` action, and the wiring that runs it **on write,
before validation**, inside both `CreateProduct` and `UpdateProduct`.

It is **backend only** and adds no column, no migration, no route and no screen. It changes two
existing actions and adds three files.

**This story is a blocking prerequisite of every consumer that renders or re-binds a product
description** — 0027, 0061, 0076, 0077 and 0079 (**D-A2**). Until it ships, `products.description` is
an unsanitized column, which [0024](../done/0024-products-core-crud-backend.md)'s own scope fence keeps safe
only by forbidding any reader.

Covers [PRD](../../../docs/PRD/PRD.md#22-products) §2.2's rich-text description implicitly rather than by
a named acceptance criterion: the PRD describes the editor, and this is the server-side guarantee that
makes storing its output defensible.

## Type
backend | fullstack (related_task_id: **0027** — products list/editor UI, the first renderer) | includes database-expert: **no**

## Three Amigos participants

Inherited from [0024](../done/0024-products-core-crud-backend.md)'s Phase 1 debate (2026-08-18) —
`product-owner` (lead) + `backend-expert` + `database-expert` + `backend-qa`. No new debate was
convened for the split; the decisions below are the ones that debate reached, moved intact. Their
`backend-qa` content is the test file, which is the largest part of this story.

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: A product description is stored as safe HTML

  Scenario: Rich-text formatting survives being saved
    Given a catalog administrator
    When they save a product whose description uses bold, a heading, a list and a link
    Then the stored description still carries every one of those formats

  Scenario: A script in a description never reaches the database
    Given a catalog administrator
    When they save a product whose description contains a script block
    Then the stored description carries no script
    And the legitimate text around it is still there

  Scenario: An event handler in a description never reaches the database
    Given a catalog administrator
    When they save a product whose description contains an image with an inline error handler
    Then the stored description carries no event handler

  Scenario: A javascript link in a description never reaches the database
    Given a catalog administrator
    When they save a product whose description contains a link to a javascript URI
    Then the stored description carries no javascript URI

  Scenario: Editing a product does not re-mangle an already-clean description
    Given a catalog administrator, with a product whose description was already saved once
    When they save that product again without changing its description
    Then the stored description is byte-for-byte what it was

  Scenario: A long description is measured after cleaning, not before
    Given a catalog administrator
    When they save a product whose description exceeds the length limit only because of markup
      the sanitizer removes
    Then the product is saved

  Scenario: Editing a product sanitizes its description too
    Given a catalog administrator, with an existing product
    When they edit that product and put a script block in its description
    Then the stored description carries no script
```

## Files to create/modify

| Path | What & why |
| --- | --- |
| `composer.json` / `composer.lock` | **Modify.** Add `symfony/html-sanitizer` (**D-16** — a new dependency, **explicitly approved** by the coordinator when resolving 0024's RQ-1, satisfying project `CLAUDE.md`'s "do not change dependencies without approval" rule). Record the **resolved** constraint after running `composer require`; 0019's D1 sets the precedent that the exact version is settled by running it, not asserted in a task file. |
| `config/html-sanitizer.php` | **New.** The allow-list configuration — the WYSIWYG toolbar's tag set and nothing else, plus explicit `allowedLinkSchemes` / `allowedMediaSchemes`. See **D-16**. This is the app's **second** app-owned config file after `config/modules.php`, and it inherits that file's two hard rules: no closures anywhere (`config:cache` serialises with `var_export()`), and no user-facing copy — see [base-standards.md](../../../docs/conventions/base-standards.md#an-app-owned-config-file-is-a-registry-and-must-survive-configcache). |
| `app/Actions/Products/SanitizeProductDescription.php` | **New.** Invokable, `__invoke(?string $html): ?string`. The **only** class in the app that imports the sanitizer, mirroring how 0019 confines the imaging library to `GenerateImageConversions`. |
| `app/Actions/Products/CreateProduct.php` | **Modify** ([0024](../done/0024-products-core-crud-backend.md) creates it). Constructor-injects `SanitizeProductDescription` and calls it on `$description` **before** `validate()` — see **D-A1**. |
| `app/Actions/Products/UpdateProduct.php` | **Modify.** Identical wiring, asserted independently rather than assumed symmetric (**D-A1**). |
| `tests/Feature/Products/ProductDescriptionSanitizationTest.php` | **New.** The security-critical file of this story; see Tests below. |

### Explicitly **not** touched

`app/Models/Product.php` (no cast, no model event — **D-A1**) · `app/Concerns/ProductValidationRules.php`'s
**rule array** (`productDescriptionRules()`'s `max:65535` rule itself is unchanged; only the *order* in
which it runs relative to the sanitizer changes, and that lives in the actions) — but **not** that
method's docblock, which currently states forward-looking, at-the-time-of-writing-still-true prose
(*"`max:65535` currently measures the SUBMITTED value; once 0024a ships its sanitize-before-validate
step, this rule measures the stored value instead"*) that this story's own closure makes false the
moment it ships (Phase 2 finding F-2). Turn it into a plain, present-tense record of the shipped
ordering as part of this story's implementation, not a doc-sync afterthought — it is a one-sentence
edit riding along with the actions it describes. · any migration (no column changes, no backfill — **D-A3**) ·
`app/Livewire/**` · `resources/views/**` · `routes/**` · `lang/**` (this story adds no user-facing
string; **R-16**'s "warn the administrator" idea is 0027's, deliberately) ·
`app/Actions/ProductCategories/**` ([0024b](../0024b-product-category-in-use-delete-guard.md)'s) · Epic 4's
blog body (0061 **reuses** this configuration; it does not fork it — see **D-16**'s scope fence).

## Tests to perform

Backend only. One new file, plus two additions to 0024's existing action tests.

**Feature — `tests/Feature/Products/ProductDescriptionSanitizationTest.php`**

Every case asserts the **persisted** value (`assertDatabaseHas` / a fresh `->fresh()->description`),
never the action's return value — the guarantee being tested is about what is in the column.

- [ ] Each allowed tag survives a round-trip unchanged: dataset over `<strong>`, `<em>`, `<u>`, `<h2>`,
      `<ul><li>`, `<ol><li>`, `<a href="https://…">`, `<img src="https://…" alt="…">`, `<p>`, `<br>`.
      **Without this, a sanitizer configured too tightly would silently destroy legitimate content and
      every "is it stripped?" test below would still pass.** This is the highest-value case in the
      file and it is easy to omit, because it is the only one that fails in the *safe* direction.
- [ ] `<script>alert(1)</script>` does not survive — assert the stored value contains no `<script`,
      **and** that the surrounding legitimate text is still there (a sanitizer that dropped everything
      would pass the first half).
- [ ] Dataset of vectors, each asserted absent from the stored value: an `on*` handler
      (`<img src=x onerror=alert(1)>`), `javascript:` in an `<a href>`, `data:text/html` in an
      `<a href>` and an `<img src>`, `<iframe>`, `<style>`, `<form>`, `<h1>` and `<h3>`, a `style`
      attribute, and an SVG payload — the last one because 0019 excluded SVG from *uploads* for
      exactly this reason, and inline SVG in a description is the same vector by another door.
- [ ] A mangled/unclosed vector (`<scr<script>ipt>`) does not reassemble into a live tag — the case a
      regex-based strip fails and a real parser passes.
- [ ] **Idempotence**: sanitizing an already-sanitized description yields a byte-identical value, so an
      edit round-trip does not mutate the content (**D-16** constraint 2). Two later stories (0076
      **D-8**, 0077 **D-6**) apply the sanitizer a *second* time on the same value and are safe **only**
      because of this property — so this test is load-bearing outside its own story.
- [ ] **Ordering**: a description that is under the length limit *after* sanitization but over it
      before is **accepted** — the assertion that pins "sanitize, then validate length" (**D-16**
      constraint 1). It fails if the two steps are ever swapped.
- [ ] `null` and `''` descriptions pass through untouched, with no sanitizer error.
- [ ] The **update** path sanitizes too, asserted independently — not assumed symmetric with create.
      A sanitizer wired into `CreateProduct` only is a silent hole reachable by editing any product.
- [ ] **A characterization test over a realistic paste** (**R-16**): pin what the sanitizer actually
      *does* to a Word-style paste containing `<span style=…>`, `<o:p>` and smart quotes, so a later
      package upgrade that changes the output is visible in a diff rather than silent. Assert the
      shipped output verbatim; the point is the pin, not the prettiness.

**Feature — `tests/Feature/Products/{Create,Update}ProductTest.php` (extend 0024's files)**
- [ ] One case each asserting that a description containing a script is stored clean, so the guarantee
      is visible from the action's own test file and not only from a file named "sanitization" that a
      future reader might assume covers an optional concern.

**Explicitly not tested**, per [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md):
`symfony/html-sanitizer`'s own parser correctness beyond the vectors above (it is a maintained
library, not this app's code — what is tested is *this app's configuration of it*); the `max:65535`
rule itself (0024's boundary tests own it — this story tests only the **ordering** relative to
sanitization); the WYSIWYG editor's client-side output (0021 owns its own output-HTML contract test,
and this story's allowed-tag dataset is deliberately the same set).

> **The cross-story test 0021 asked for, and where it lands.** `done/0021` records as a named follow-up
> that its own toolbar output should be round-tripped through this sanitizer once
> `config/html-sanitizer.php` exists — i.e. that nothing the editor legitimately produces is stripped.
> **That belongs in this story's allowed-tag dataset**, and the dataset above is written to be exactly
> 0021's eight toolbar actions plus `<p>`/`<br>`. If the two sets ever disagree, the sets are the bug —
> not the test. Record the outcome against 0021's follow-up rather than leaving it open.

## Expected outcome

`products.description` is guaranteed safe HTML **at the column**, not at the render. Every write path
into it — the two actions, and therefore every present and future caller of them, including a seeder,
an Artisan command, an import or a REST controller — passes through one allow-list sanitizer whose
tag set is exactly the WYSIWYG toolbar's. Scripts, event handlers, `javascript:`/`data:` URIs, frames,
forms and inline styles cannot reach the column. The length rule measures the value that is actually
stored. Sanitizing twice is a no-op, which is what lets three later stories apply it again at a second
layer without corrupting content.

Nothing is user-visible: this story adds no screen and no message. What it unblocks is 0027 being able
to render the description unescaped at all.

## Acceptance criteria
- [x] `symfony/html-sanitizer` is added to `composer.json` with its **resolved** constraint recorded,
      and `composer.lock` is committed.
- [x] `config/html-sanitizer.php` holds the allow-list, contains **no closures** and **no user-facing
      copy**, and survives `php artisan config:cache`.
- [x] `App\Actions\Products\SanitizeProductDescription` is the **only** class in `app/` that imports
      the sanitizer — asserted by a test, not by convention.
- [x] **The `description` HTML is sanitized before it is persisted**, against an allow-list limited to
      the WYSIWYG toolbar's own tag set; scripts, event handlers, `javascript:`/`data:` URIs, embedded
      frames and inline styles never reach the column, on the create path **and** the update path.
- [x] **The length limit is applied to the post-sanitization value** — a description over the limit
      only because of markup the sanitizer removes is accepted.
- [x] **Sanitizing is idempotent for well-formed markup** (every shape the WYSIWYG toolbar can produce,
      verified across 15 real shapes) **and converges to a stable value by the second pass otherwise**
      (Phase 5 finding, note (b) — libxml's auto-nesting normalisation can need a second pass to reach
      a fixed point after a blocked wrapper is removed between two same-name elements; every
      intermediate value stays safe HTML, so this is content drift, not a security window). The
      original wording ("`sanitize(sanitize($x)) === sanitize($x)`, asserted byte-for-byte" with no
      qualification) overstated what the shipped code guarantees and is corrected here rather than left
      for a future reader to discover was never quite true — the three downstream consumers (0076 D-8,
      0077 D-6, 0079) depend on **convergence**, which holds, not on strict one-pass equality, which
      does not for pathological input.
- [x] Every tag the WYSIWYG toolbar can produce survives a round-trip unchanged.
- [x] `null` and `''` pass through untouched.
- [x] No migration, no column change, no backfill, no route, no Livewire component, no Blade view, no
      browser test, no permission-catalog change and no new user-facing string.

## Definition of Done
- [x] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [x] **All three quality gates run unscoped and each result recorded — including "not run"**, per
      [errors-log.md](../../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26):
      `php artisan test`, `vendor/bin/pint --format agent`, `vendor/bin/phpstan analyse`.
- [x] Code reviewed (code-reviewer).
- [x] **No security findings (appsec-auditor) — and this is the story's centre, not a formality.**
      Point the audit at: the allow-list's completeness against the toolbar's real output; the
      link/media scheme restrictions (`allowedLinkSchemes` / `allowedMediaSchemes` set explicitly, not
      left to defaults); the sanitize-then-validate ordering; and whether any write path into
      `products.description` exists that does **not** pass through the two actions.
- [x] **Documentation updated (docs-keeper) — Phase 6 run 2026-09-02, verified by the orchestrator.**
      `docs/database/schema.md`'s `products.description` row and its `Indexes` ⚠️ blockquote were both
      **corrected in place** (not merely appended to) from the now-false "stored unsanitized as of this
      story" claim to a ✅ describing the shipped `App\Actions\Products\SanitizeProductDescription`
      mechanism — the exact fix this checkbox demanded. `docs/conventions/base-standards.md` gained
      `SanitizeProductDescription` in the `app/Actions/Products/` listing plus a ⚠️ stating
      `config/html-sanitizer.php` does **not** fit that page's "registry a later story appends to"
      framing — it is a fixed security allow-list a later consumer (0061) must reuse exactly. New
      security page [`docs/security/html-sanitization.md`](../../../docs/security/html-sanitization.md)
      (the app's 12th) documents both Phase 4 findings (F-1 block-vs-drop, F-2
      idempotence-to-convergence) as ❌/✅ pairs from the outset, per the audit-authored-page rule cited
      below. `docs/api/routes.md`'s `WysiwygEditor` section was also corrected — it had speculatively
      credited 0027/0077 with `SanitizeProductDescription`, which is actually this story's class wired
      into 0024's own `CreateProduct`/`UpdateProduct`. `docs/README.md` and `docs/security/README.md`
      indexes updated, and a new `ai-spec/tasks/_digests/epic-2.md` records the load-bearing facts
      (signature, wiring order, allow-list-is-fixed-not-a-registry, convergence-not-equality) for
      0025/0026/0027 to consult instead of re-opening this file.
- [x] **Link-integrity check on both stage moves (Phase 2 finding F-3) — complete.** This story has an
      unusually large inbound citation fan-in — thirteen sibling task files (including `done/0021` and
      `done/0024`) link to it by path — so both the `in-progress/` move and the `done/` closure move
      needed the full two-direction check from
      [workflow.md](../../../docs/workflow.md#link-integrity-check-on-every-stage-move), not an
      abbreviated one. **The `in-progress/` half**: 12 sibling files + `docs/database/schema.md`
      repointed, confirmed by both `docs-keeper` and `code-reviewer` independently. **The `done/` half
      (Phase 7, 2026-09-02)**: 10 open task files, `done/0021`, `done/0024` and `docs/api/routes.md`
      repointed from `in-progress/` to `done/`; a pre-existing, unrelated outbound-link bug in this
      file's own line 235 (two `../` instead of three, resolving outside the repo) was also found and
      fixed while verifying the outbound half. A fresh repo-wide `grep -rn "in-progress/0024a"` returns
      zero hits.
- [x] **The two residual exposures are recorded rather than assumed closed** (**R-12**): a future writer
      that bypasses the actions re-opens the hole, and the allow-list itself is now the control, so a
      tag added to it later without thought is a new sink.
- [x] **Consumers unblocked, in writing**: 0027, 0061, 0076, 0077 and 0079 each depend on this story
      (**D-A2**), and 0024's own scope fence forbidding a `description` reader is lifted by its closure.
      Record it in this file's closure note so the fence is visibly retired rather than forgotten.
- [x] **0021's deferred round-trip follow-up is discharged** — see the note under Tests.
- [x] Acceptance criteria met.

## Documented functional decisions

### D-16 — `description` HTML is sanitized **on write**, with `symfony/html-sanitizer` *(confirmed; approved new dependency)*

*(Moved verbatim from [0024](../done/0024-products-core-crud-backend.md), where it was resolved as **RQ-1** on
2026-08-18. The label is kept so existing citations resolve.)*

**Sanitize on write, before persistence** — not on render. The decisive property is that it binds
**every** call site forever: the actions are the only way a description reaches the column, so a
seeder, an Artisan command, a future import or a REST controller all inherit the guarantee without
knowing it exists. Sanitizing on render is bypassed by the first consumer that forgets, and this
codebase already has the rule that
[a control enforced only in a component is bypassed by every other call site](../../../docs/security/livewire-authorization.md).
The stored value is therefore *always* safe HTML, which is what lets 0027 render it unescaped at all.

**Package: `symfony/html-sanitizer`.** Justification, in the order that decided it:

1. **The Symfony 8.1 line is already installed and locked here** — 49 `symfony/*` packages in
   `composer.lock` (re-verified at Phase 2), of which **21 sit on the `v8.1.x` line** (the other 28 are
   independent `v3.7.x` contracts packages and `v1.37`–`1.38.x` polyfills), pulled in transitively by
   Laravel itself. Adding one more component from a major line the lockfile already pins is the
   smallest possible dependency-graph change, and it cannot introduce a conflicting version of
   anything. *(Corrected at Phase 2, finding F-1 — the original count of "34, all v8.1.x" was wrong;
   the conclusion it supports is unaffected.)*
2. **PHP 8.5 support is certain.** This project runs PHP 8.5 (`composer.json` requires `^8.3`) and
   Symfony 8.1 supports it today. That is not a given for the alternatives — see below.
3. **It is an allow-list sanitizer by construction**, modelled on the W3C HTML Sanitizer API: unknown
   elements and attributes are dropped rather than escaped, which is exactly the HTML-Purifier-style
   semantics required. It also handles the cases a naive strip-tags pass misses — `javascript:` and
   `data:` URI schemes on `<a href>` and `<img src>`, and event-handler attributes.
4. **No disk-cached state.** It compiles nothing to a writable path, so it adds no deployment concern.

*Considered and rejected:* `mews/purifier` and `stevebauman/purify`, the two well-known Laravel
wrappers. Both are Laravel-friendlier on the surface (a facade, a publishable config) but both depend
transitively on `ezyang/htmlpurifier`, which brings two concrete costs this project would carry: its
PHP-version support historically lags (PHP 8.5 compatibility must be confirmed rather than assumed),
and it **caches compiled definitions to disk**, which needs a writable path configured and kept out of
version control. Neither buys anything over a directly-injected sanitizer given the single call site
this story has. *Also rejected:* `strip_tags()` — it takes a tag allow-list but **no attribute
allow-list at all**, so `<a onclick="…">` survives it; it is not a sanitizer.

**The allow-list is exactly the WYSIWYG toolbar's own tag set** ([PRD](../../../docs/PRD/PRD.md) names it:
Bold, Italic, Underline, H2, bullet list, numbered list, link, insert image), and nothing else:

| Allowed | For |
| --- | --- |
| `<strong>` / `<b>`, `<em>` / `<i>`, `<u>` | Bold, Italic, Underline |
| `<h2>` | the H2 button (**only** h2 — not h1, which belongs to the page, nor h3–h6, which the toolbar cannot produce) |
| `<ul>`, `<ol>`, `<li>` | bullet and numbered lists |
| `<a href>` | link — **http/https/mailto schemes only** |
| `<img src alt>` | insert image — **http/https only** |
| `<p>`, `<br>` | the block/line structure any contenteditable emits |

Everything else is dropped: `<script>`, `<style>`, `<iframe>`, `<form>`, every `on*` handler, every
`style` attribute, and `<h1>`/`<h3>`–`<h6>`. **Do not add a tag to this list because the sanitizer
stripped something** — if the toolbar cannot produce it, its presence means the input did not come from
the toolbar. Configure `allowedLinkSchemes`/`allowedMediaSchemes` explicitly rather than relying on
defaults, and keep the list in `config/html-sanitizer.php` so it is reviewable in one place.

**Three implementation constraints, each a real bug if missed:**

1. **Sanitize before validating the length.** `max:65535` must measure what is actually stored;
   sanitizing afterwards means the rule counted markup the column never receives.
2. **Sanitizing is not idempotent-by-assumption — prove it.** An edit round-trip re-sanitizes
   already-sanitized HTML, so `sanitize(sanitize($x)) === sanitize($x)` must hold, or a description
   mutates slightly every time it is saved. **Three later stories depend on this property directly**
   (0076 **D-8** adds a model-event layer that sanitizes a second time; 0077 **D-6** adds a third call
   site inside a Livewire component; 0079 constructor-injects the same class), so it is not a local
   nicety.
3. **It is a data-lossy transform, and the administrator is not told.** Pasting from Word silently
   loses formatting. Accepted for this story (the alternative is a rejection UX the PRD does not
   describe), but recorded as **R-16** and flagged to 0027, which may want to warn.

**Scope fence:** the sanitizer is applied to `products.description` only. Epic 4's blog body is a
separate story; when it arrives it must **reuse this configuration** rather than define a second
allow-list, or the two drift. [0061](../0061-blog-posts-core-crud-backend.md) already records that
obligation and cites this decision by name.

### D-A1 — The call sites are the two actions, before `validate()` — not a model event, not a validation rule

Three placements were available and only one satisfies both constraints (bind every writer; measure
the stored value):

- **✅ In `CreateProduct` and `UpdateProduct`, as the statement immediately before `validate()`.**
  Binds every caller of the actions, and puts the sanitized value in front of the length rule, which
  is **D-16** constraint 1. `SanitizeProductDescription` is **constructor**-injected into both, per
  [code-style.md](../../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)'s
  documented exception — `__invoke()`'s parameter list is a public contract those actions' direct-call
  tests match verbatim, so it must not widen for an internal collaborator.
- **❌ A `saving` model event on `Product`.** It binds *more* writers (a raw `$product->save()` too),
  which is genuinely attractive — but it fires **after** validation, so the length rule would measure
  the submitted value and **D-16** constraint 1 fails. Note this is not a permanent rejection: 0076's
  **D-8** later adds exactly such a hook as a *second* layer while keeping the action call, which is
  safe only because of constraint 2's idempotence. Adding the second layer now would mean shipping the
  belt with no way to test it independently of the braces.
- **❌ A custom validation rule.** A rule that mutates the value under test is the wrong shape —
  Laravel's validator is not a transformer, and the mutation would be invisible at the call site.

**Two call sites, asserted independently.** The single most likely bug in this story is wiring the
sanitizer into `CreateProduct` and forgetting `UpdateProduct`, which leaves a hole reachable by editing
any product — and a test suite that asserts sanitization only through the create path stays green.

**Two implementation notes from Phase 2 review, both mechanical rather than decisions (N-1/N-2):**
`SanitizeProductDescription` **joins** each action's existing canonicalisation block (`trim($name)`,
`Str::upper(trim($sku))`) rather than displacing it, and the sanitized value must **reassign
`$description`** at that point — both the `Validator::make([...])` array built right after and the
`DB::transaction()` closure captured further down read the same local variable, so one reassignment is
what makes a single call satisfy constraint 1 (sanitize-before-length) and the persistence guarantee
together; a call that discards its return value or sanitizes a copy satisfies neither. Also:
`SanitizeProductDescription` is each action's **third** constructor-injected collaborator (after
`LogRefusedPrivilegedAttempt` and `SyncProductGallery`, both already present from story 0024), not the
second — update either action's docblock if it says "both collaborators".

### D-A2 — This story blocks every consumer that renders or re-binds a description

Stated as a decision rather than left in a dependency list, because it is the reason the story exists
as its own unit rather than as a nice-to-have:

| Consumer | Why it is blocked |
| --- | --- |
| **0027** (products list/editor UI) | Renders `description` unescaped and binds 0021's `WysiwygEditor` to it. [api/routes.md](../../../docs/api/routes.md#applivewirecomponentswysiwygeditor--the-gallerys-first-real-consumer-and-the-second-routeless-gated-component) states the rule directly: *"no consumer may bind `wire:model` to a persisted column until that column's own write path runs a server-side sanitizer first."* |
| **0061** (blog posts backend) | Reuses this exact class and config for the blog `body` column. |
| **0076** (products i18n retrofit) | Adds a second call site plus a model-event layer over the same value. |
| **0077**, **0079** (language-tab editors) | Each injects `SanitizeProductDescription` directly. |

**What that means procedurally**: 0024 may close without this story, but **0027 may not start Phase 3
without it**. The fence in 0024's scope section (no code may render `description`) is what holds the
line in between, and it is retired by this story's closure — explicitly, in this file's closure note,
so a reader can tell "lifted" from "forgotten".

### D-A3 — No backfill, and why that is a decision rather than an omission

[migrations.md](../../../docs/database/migrations.md#when-the-new-columns-default-is-wrong-for-existing-rows-backfill-in-the-same-up)
establishes that a change whose effect is wrong for pre-existing rows backfills in the same `up()`. It
does not apply here, and a reader applying it by reflex would write a migration this story must not
have:

- **There is no migration to hang a backfill on** — this story adds no column and alters none.
- **There are no rows to backfill.** `products` is created by [0024](../done/0024-products-core-crud-backend.md)
  and, per that story's own scope fence, has no non-test writer until 0027. Every environment's
  `products` table is either empty or holds only locally-created fixtures.
- **A backfill would be an editorial event disguised as a schema change**, which 0076's **D-9** later
  rejects for the same reason in a case where rows genuinely do exist: re-running the sanitizer over
  historical content silently mutates it according to whatever the allow-list says *today*.

**If Phase 3 finds real rows** (a developer's local database, say), the correct action is to re-save
them through `UpdateProduct`, not to add a migration. Record it if it happens.

## Dependencies, risks and open questions

### Dependencies

- **[0024](../done/0024-products-core-crud-backend.md) (products core CRUD backend) — hard, blocking.** This
  story modifies `CreateProduct` and `UpdateProduct` and tests through them; neither exists before it.
  0024 also creates the `description` column this sanitizes.
- **Independent of [0024b](../0024b-product-category-in-use-delete-guard.md).** They touch disjoint files
  and may ship in either order.
- **[0021](../done/0021-wysiwyg-rich-text-editor-component.md) — soft, and ✅ SATISFIED.** The allow-list
  is defined as that component's toolbar output; its own deferred round-trip follow-up is discharged
  here.
- **This story blocks 0027, 0061, 0076, 0077 and 0079** — see **D-A2**.

### Risks

- **R-12 — Stored XSS via `description`. Mitigated by this story, not eliminated.** After it ships the
  column is written only through the two actions, both of which sanitize, so the stored value is
  always safe HTML — and that is what permits 0027 to render it unescaped. **Two residual exposures
  remain and belong in the Phase 4 audit**: **(a)** any *future* writer that bypasses the actions (a
  seeder, an import, a raw `update()`) re-opens it, because the guarantee lives in the action and not
  in the column — 0076's model-event layer later closes exactly this, which is the acknowledgement
  that it is real; **(b)** the allow-list itself is now the control, so a tag added to it later without
  thought is a new sink. Rated **high before mitigation**: the render is unescaped by necessity and
  `Administrator` holds `products.create`.
- **R-16 — Sanitization is silently lossy.** A description pasted from Word or another CMS loses
  formatting with no warning, and a paste containing a disallowed tag comes back altered rather than
  rejected. Accepted for this story (a rejection UX is described nowhere in the PRD) and flagged to
  **0027**, which may want to surface a notice. It is also why the characterization test above exists:
  pin what the sanitizer *does* to a realistic paste, so a later package upgrade changing that output
  is visible rather than silent.
- **R-A1 — (new, at the split) The interim window in which `products.description` is unsanitized.**
  Between 0024's closure and this story's, the column accepts anything. It is safe only because three
  conditions hold simultaneously — no render path, no non-test writer, and this story blocking every
  consumer — all three recorded in 0024's scope fence. **The risk is procedural, not technical**: the
  failure mode is somebody shipping 0027 (or a seeder with sample products) before this story, not an
  attacker reaching the column. Mitigated by **D-A2**'s written dependency and by 0024's fence; it
  would be closed structurally by keeping `description` out of `#[Fillable]` until now, which 0024
  weighed and recorded as its documented fallback if Phase 2 prefers it.
- **R-A2 — A new Composer dependency is the one thing here that cannot be undone quietly.**
  `symfony/html-sanitizer` is approved, but the approval was given in August against a `composer.lock`
  that has since moved. **Re-verify at Phase 3** that the resolved version still sits on the same
  Symfony major line the lockfile pins, and record the resolved constraint rather than asserting it —
  0019's D1 precedent.

### Resolved questions

- **RQ-1 — Is the `description` HTML sanitized, and where? → Sanitized on write, before
  persistence, with a new approved Composer dependency.** *(Resolved 2026-08-18 as part of
  [0024](../done/0024-products-core-crud-backend.md)'s debate; moved here with the story.)* The allow-list is
  limited to the WYSIWYG toolbar's own tag set. Implemented by **D-16**, which owns the package choice,
  the allow-list table, and the three implementation constraints — most importantly that sanitization
  runs **before** the length rule. *Dropped:* sanitizing on render (bypassed by the first consumer that
  forgets) and storing as given (indefensible while the permission catalog is granular enough to admit
  partly-trusted authors).

**No open questions.** Nothing in this story is blocked on a product decision.

## Provenance

Split out of [0024](../done/0024-products-core-crud-backend.md) on 2026-09-01, on the coordinator's explicit
instruction, after `code-reviewer`'s Phase 2 INVEST review returned **FAIL** and recommended a
three-way split. Its own reasoning for this cut line: the sanitization work adds a Composer
dependency, a config file, a fifth action and a security-critical test file **on top of** an already
large schema change, which is what put 0024 over INVEST's "Small" — and it is independently valuable
(it is the guarantee 0027 needs) and independently testable (its test file asserts persisted values
through the actions, needing no screen).

**D-16 and RQ-1 are moved verbatim**, including their rejected alternatives, because they were
resolved by the coordinator on 2026-08-18 and nothing in the split re-opens them. **D-A1**, **D-A2**
and **D-A3** are new, and each answers a question that only exists *because* of the split: where the
call goes now that it is not being written alongside the actions, what the story's closure unblocks,
and why a story that changes a column's contents ships no migration.

**The one thing this file deliberately does not inherit** is 0024's original framing of R-12 as
"mitigated". Between 0024 and this story the risk is genuinely live, and it is recorded as such in
both files (**R-A1** here, **R-12** there) rather than smoothed over — the interim is safe because of
three named structural conditions, not because the sanitizer exists.

## Closure note (Phase 5, 2026-09-02)

**Consumers unblocked, in writing (DoD item).** This story's closure lifts [0024](../done/0024-products-core-crud-backend.md)'s
own scope fence forbidding any code from rendering, echoing or returning `products.description` to a
client — that fence exists only because no sanitizer was wired in yet, and one now is, on both write
paths, independently verified twice by `appsec-auditor` (initial audit + re-audit after the F-1/F-2
fix round). **0027, 0061, 0076, 0077 and 0079 (D-A2) are unblocked as of this story's Phase 4 PASS.**
The interim risk **R-A1** (an unsanitized column between 0024's closure and this story's) is retired;
**R-12**'s two residual exposures (a future writer bypassing the actions; the allow-list itself
becoming the control) remain open by design and are not affected by this closure.

**0021's deferred round-trip follow-up (DoD item) — discharged, with one caveat found along the way.**
[done/0021](../done/0021-wysiwyg-rich-text-editor-component.md) asked that its own toolbar output be
round-tripped through this sanitizer once `config/html-sanitizer.php` existed, to confirm nothing the
editor legitimately produces is stripped. Confirmed: `ProductDescriptionSanitizationTest.php`'s
allowed-tag dataset round-trips all eight toolbar actions' real output unchanged. **The one thing
0021's original follow-up got slightly wrong**, found during Phase 5 review (finding F-2): the
dataset's Bold/Italic rows initially asserted `<strong>`/`<em>` survive, but 0021's own D2 table
(verified live in Chromium) records the editor actually emits `<b>`/`<i>` for those two buttons — both
pairs are correctly in the allow-list, so there was no functional gap, only a labeling one in the test
data, closed by adding the two missing rows rather than replacing the existing ones (`<strong>`/`<em>`
are still legitimately-allowed tags, just not what these two specific buttons produce).

**Verification record.** All three quality gates, run unscoped, after the Phase 4 and Phase 5 fix
rounds:
- **Tests**: `DB_DATABASE=testing_0024 php -d memory_limit=1G vendor/bin/pest --compact` → 1335 tests,
  1332 passed, 3 skipped, **0 failed** (the one previously-seen failure across this story's several
  full-suite runs was `tests/Browser/Media/GalleryTest.php`'s reopen test, story 0020's own
  pre-existing, docblock-measured 25–50% non-deterministic flake — confirmed unrelated to this story
  by both `code-reviewer`'s Phase 5 pass and an earlier isolated re-run, and absent from the final run).
- **Pint**: `vendor/bin/pint --format agent` (unscoped) → passed, 0 files needing changes.
- **Larastan** (level 7, `phpstan.neon`): `php -d memory_limit=1G vendor/bin/phpstan analyse` (unscoped)
  → passed, 0 errors.
