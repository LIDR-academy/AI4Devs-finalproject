# [0030a] Attribute value rename — usage warning and SKU-collision error rendering

## Description
The attribute types screen ([0030](0030-product-attribute-types-and-values-ui.md)) lets an
administrator rename any value inline in its type's edit modal, and story 0029's
`SyncProductAttributeValues::reDeriveVariantSkusForRenamedValues()` correctly re-derives every
variant SKU built on that value in the same transaction — refusing the whole rename, with nothing
written, whenever the resulting derivation is invalid: it collides with another product's or
variant's SKU (`derived_sku_taken`, including via the translated race-condition backstop, which
re-emits the same message), reduces to an empty segment (`derived_sku_empty_segment`), or exceeds
the SKU length cap (`derived_sku_too_long`). All reachable refusals in this cascade are keyed
`sku` — verified by reading `TranslateProductVariantUniqueViolation`'s other branch
(`combination`-keyed, for the `product_variants` combination-hash index) and confirming it cannot
fire here, since the cascade's `UPDATE` only ever writes `sku`/`updated_at` and never touches
`product_id`/`combination_hash`. Today the screen gives the administrator **no warning before
saving** that a rename affects any variants at all, and **no visible message at all** for any of
these refusals: the modal simply stays open with no feedback, because the view has no error outlet
for the `sku` key. This story adds both.

## Type
fullstack — not split into FE/BE sub-tasks; the whole change is one new bulk-count query plus one
Livewire component/view amendment on an already-shipped screen, too small to justify a split, the
same call [0029a](0029a-attribute-in-use-delete-guards-backend.md) made for an equally small
touch to this same component | includes database-expert: no (no schema/migration/index change —
the query reads the existing `product_variant_values` pivot, whose covering FK index already
serves it; see the technical-approach note below on which shipped query this actually mirrors)

## Provenance

> 🟠 **This is not a fresh Three Amigos debate — it is two amendments 0031's own Phase 1 debate
> found and recommended against 0030's already-shipped screen, split out as their own story rather
> than performed inside 0031.** [0031](0031-product-variants-editor-ui.md)'s **D-16** ("The
> attribute-value rename edge case, resolved") and its **OQ-10** name both gaps explicitly:
>
> - **(a)** *"Does anything need to warn before the rename? Yes — and it belongs to 0030, not
>   here… Recommended: a non-blocking inline notice in 0030's value repeater when an in-use
>   value's text is edited, stating how many variant SKUs will be rewritten."*
> - **(b)** 🔴 *"The missing collision-error rendering… `products.variants.derived_sku_taken` can
>   surface on a taxonomy screen that has no SKUs on it — and 0030 has no key, no field and no
>   copy for it… This is a gap, not a preference."*
>
> Both were **re-verified by direct execution** (not merely re-read) before this task was written,
> against the real shipped code on `feature-entrega2-ARP`: a Pest test driving
> `Livewire::test(Index::class)->call('openEditModal', $typeB->id)->set('values', [...renamed...])->call('save')`
> against a fixture where the rename produces a colliding derived SKU confirms
> `$component->errors()->getMessages()` really does contain
> `['sku' => ['The derived SKU 0001-M is already in use by another product or variant.']]`,
> `showModal` stays `true` (no data loss — the transaction rolled back correctly), and the
> renamed variant's SKU is unchanged in the database. `resources/views/livewire/products/attribute-types.blade.php`
> was confirmed to carry `@error('values')` and `@error('productAttributeTypeId')` but **no**
> `@error('sku')` anywhere — so today that populated, correct error message is silently discarded
> by the view. The test used to confirm this was a throwaway file, run once and deleted; it is not
> part of this repo.
>
> **Amended after Phase 2 (code-reviewer) FAILed the first draft — two blocking findings, both
> fixed below rather than argued with:**
> 1. The first draft put the new per-row usage count inside `$values` itself — the component's one
>    deliberately client-writable, un-`#[Locked]` property. `$types`' own docblock two properties
>    above cites [security/livewire-authorization.md](../../../docs/security/livewire-authorization.md)'s
>    rule that every server-derived property is `#[Locked]`; putting a server-derived count in the
>    untrusted array contradicts the rule the same class already follows, and would have required
>    widening the view's existing `@continue` guard (the one 0028's own Phase 4 finding F-1 added,
>    with a 20-line comment directly above it) to also check the new key or crash on a forged
>    payload missing it. Fixed by moving the count to its own `#[Locked]` property (see Files,
>    below) — no `$values` shape change, no `@continue` guard change, no crash surface.
> 2. The first draft's scope, Gherkin and tests only ever named the `derived_sku_taken` collision
>    message, when in fact every `sku`-keyed refusal reachable through this rename cascade is
>    equally invisible today. Widened throughout below.

## Gherkin

```gherkin
Feature: Attribute value rename — usage warning and SKU-collision error

  Scenario: A catalog administrator sees how many variants a value affects before renaming it
    Given a catalog administrator, with an attribute type "Talla" holding the value "M" used by two product variants
    When they open that type's edit form
    Then that value's row shows a notice stating it is used by two variants

  Scenario: A value used by no variants shows no usage notice
    Given a catalog administrator, with an attribute type "Talla" holding the value "M" used by no product variants
    When they open that type's edit form
    Then that value's row shows no usage notice

  Scenario: Saving a rename that collides with an existing SKU is rejected with a visible message
    Given a catalog administrator renaming an attribute value in a way that would duplicate another product's or variant's derived SKU
    When they save the form
    Then a validation message states that the derived SKU is already in use
    And the form remains open
    And no value is changed in the database

  Scenario: Saving a rename that would produce an unusable derived SKU is rejected with a visible message
    Given a catalog administrator renaming an attribute value to text that cannot contribute anything to a SKU
    When they save the form
    Then a validation message explains the value cannot be used to derive a SKU
    And the form remains open

  Scenario: Saving a rename that does not collide succeeds and the notice reflects the new text
    Given a catalog administrator, with an attribute type "Talla" holding the value "M" used by one product variant
    When they rename that value to "M2" and save
    Then the form closes and the type lists the renamed value
    And that variant's SKU reflects the new value
```

> Follows [gherkin-guidelines.md](../../../docs/testing/frontend/gherkin-guidelines.md) rules 1 (named
> business-role actor) and 3 (one `When` per scenario). No scenario is written for "rename a value
> used by zero variants, no collision possible" as a *collision* case — that path cannot produce
> the refusal in scope here and a scenario for it would be a ghost scenario per that same guide's
> rule 6. The fourth scenario (empty-segment/too-long refusal) stands in for **any** non-collision
> `sku`-keyed refusal — see Tests to perform for which one Phase 3 should actually drive, and why.

## Files to create/modify

- `app/Models/ProductAttributeValue.php` — **modify.** Add a bulk usage-count method,
  `variantUsageCounts(array $valueIds): array<string, int>` (keyed by value id). **This mirrors
  `App\Actions\Products\SyncProductAttributeValues::firstValueInUse()`'s reasoning, not
  `ProductAttributeType::variantUsageCount()`'s** — `firstValueInUse()`'s own docblock states that a
  per-*value* count needs no `DISTINCT`, because `product_variant_values`' composite primary key
  `(product_variant_id, product_attribute_value_id)` already makes `(variant, value)` unique, unlike
  the type-level query, which must deduplicate across a type's several values. The new method is
  **not a duplicate** of `firstValueInUse()`: that one is a private, early-exit "does any of these
  ids show usage, stopping at the first" check built for a delete refusal; this one is a public,
  read-**every**-row bulk count built for display, and no shipped code today answers that question
  for more than one id. One query for the whole type's values (up to 100 per 0028's `max:100`),
  never one query per row — `GROUP BY product_attribute_value_id`, no `DISTINCT` needed for the
  reason above. `firstValueInUse()` itself is untouched — refactoring it to share this method is
  explicitly out of scope (see below) to avoid destabilizing 0029a's shipped, audited delete guard
  for an unrelated display feature.
- `app/Livewire/Products/AttributeTypes/Index.php` — **modify.**
  - Add `#[Locked] public array $valueUsageCounts = [];` (keyed by value id — `array<string, int>`),
    alongside the component's other `#[Locked]` server-derived properties. **Deliberately not a key
    inside `$values`** — see Provenance's amendment note 1.
  - `openEditModal()`: call the new bulk method once with the type's own value ids and assign the
    result to `$valueUsageCounts`. No change to how `$values` rows are built.
  - `closeModal()` / `openCreateModal()`: add `valueUsageCounts` to the existing
    `reset(['editingTypeId', 'name', 'values'])` call in both — harmless today (a create-mode row
    has no `id`, so nothing would render regardless) but keeps the property's lifecycle symmetric
    with `$values`' own, rather than leaving a previous type's counts sitting in memory.
  - `addValue()` / `save()`: no other change.
  - No change to `save()`'s exception handling — Livewire's own `ValidationException` → `$errors`
    routing already delivers the `sku`-keyed message for all four refusals; nothing needs to
    intercept or remap it (see OQ-B below for why per-row attribution was considered and rejected
    for v1).
- `resources/views/livewire/products/attribute-types.blade.php` — **modify.**
  - Inside the values repeater, render a muted inline notice beside any row whose usage count is
    greater than zero (`data-test="value-in-use-notice-{{ $row['key'] }}"`), using the new
    trans_choice key below. Rendered unconditionally when the count is positive — not only after
    the text is edited — see OQ-C. ⚠️ **Do not read the count as the bare
    `$valueUsageCounts[$row['id']] ?? 0` expression** — the existing `@continue` guard deliberately
    lets a row with no `id` key through (an `addValue()`-created row), and `null`/missing-key array
    access on the left side of `??` still raises a deprecation notice on every such row. Guard it
    the same way the row's existing `$rowHook` two lines below already does:
    `is_string($row['id'] ?? null) ? ($valueUsageCounts[$row['id']] ?? 0) : 0`.
  - A whole-modal `@error('sku')` callout, styled and placed exactly like the two existing
    precedents in this same file (`@error('values')` / `@error('productAttributeTypeId')`):
    `<flux:callout variant="danger" icon="x-circle" heading="{{ $message }}" data-test="attribute-type-rename-sku-collision" />`.
    This single outlet renders **whichever** of the four `sku`-keyed messages `save()` throws —
    `derived_sku_taken`, `derived_sku_empty_segment`, `derived_sku_too_long`, or the translated
    unique-violation race message — with no per-message branching needed in the view.
- `lang/en/products.php` + `lang/es/products.php` — **modify.** One new `trans_choice()` key under
  the existing `variants` group (not `attribute_types` — see OQ-D), alongside the sibling
  `value_in_use`/`type_in_use` keys it is stylistically identical to:
  `'rename_notice' => 'Renaming this value will update the SKU of :count variant.|Renaming this value will update the SKU of :count variants.'`.
  No new key is needed for any of the four collision/derivation messages — all already exist under
  `products.variants.*` and are already what `SyncProductAttributeValues`/`DeriveVariantSku` send;
  this story only gives them somewhere to render.
- `tests/Feature/Products/AttributeTypesIndexRenderingTest.php` — **modify.** Add: the usage notice
  renders for an in-use value and not for an unused one; the `sku`-keyed message renders as the
  callout above with the modal still open, for **both** the collision case and at least one
  non-collision case (see Tests to perform); `$valueUsageCounts` is not part of the payload
  `save()` builds for `SyncProductAttributeValues` (a one-line assertion now that the count lives
  outside `$values` entirely, rather than the defence-in-depth test the first draft needed).
- `tests/Browser/Products/AttributeTypesIndexTest.php` — **modify.** One browser test: rename an
  in-use value into a colliding SKU through the real repeater and Save button, assert the callout
  renders with the exact `derived_sku_taken` copy, assert the modal is still open, and assert
  `->assertNoJavaScriptErrors()` — the collision path is a `DB::transaction()` rollback under a real
  request, and this project's own errors-log records more than one case where a refusal path was
  never actually exercised through the real component before shipping.

**Explicitly NOT this story:**

| Concern | Owner |
|---|---|
| The SKU re-derivation and its four refusal cases (`reDeriveVariantSkusForRenamedValues`, `DeriveVariantSku::checked()`) | [0029](0029-product-variants-backend.md) — already shipped, unchanged here |
| `products.variants.derived_sku_taken`/`derived_sku_empty_segment`/`derived_sku_too_long`'s copy | 0029 — reused, not redefined |
| Refactoring `SyncProductAttributeValues::firstValueInUse()` to reuse the new bulk method | Out of scope — 0029a's shipped delete guard is not touched by a display-only feature |
| Per-row attribution of *which* renamed value produced a specific collision | Rejected for v1 — see OQ-B |
| Any change to how `moveValue()`/`removeValue()`/`addValue()` behave | out of scope — untouched |
| The type-level in-use delete guard (`variantUsageCount()`, `deletingTypeUsageCount`) | [0029a](0029a-attribute-in-use-delete-guards-backend.md) — already shipped, unchanged here |

## Tests to perform
- [ ] `openEditModal()` populates `$valueUsageCounts` correctly, including zero for an unused value
      and correct counts when a variant is built on two values of the *same* type (must not be
      conflated the way a `DISTINCT`-per-type count would need to be — confirm no double counting
      is even possible given the pivot's composite primary key, per the model method's own
      docblock).
- [ ] The values repeater renders the usage notice only for rows whose id has a positive count in
      `$valueUsageCounts`.
- [ ] `addValue()`'s freshly appended row (no `id` yet) never renders the notice.
- [ ] Saving a rename that produces a colliding derived SKU (`derived_sku_taken`): the `sku`-keyed
      callout renders with the exact message, the modal stays open, and the renamed value's text is
      unchanged in the database (the whole rename is refused, not partially applied — already
      0029's guarantee; this test confirms the *screen* reflects it, not that the guarantee itself
      holds).
- [ ] Saving a rename that produces an empty-segment or over-length derivation (pick **one** of
      `derived_sku_empty_segment` / `derived_sku_too_long` — whichever is cheaper to arrange from a
      Feature test): the same `sku`-keyed callout renders with that message's own copy, proving the
      outlet is generic rather than hardcoded to the collision wording.
- [ ] Saving a rename that does **not** collide: no callout renders, the modal closes, and the
      value's new text and the affected variant's new SKU are both persisted.
- [ ] `$valueUsageCounts` never appears in the payload `save()` builds for
      `SyncProductAttributeValues` (trivially true once it is a separate property — assert it as a
      regression guard against a future refactor reintroducing it into `$values`).
- [ ] Browser: the full rename → collision → visible callout → modal-still-open flow, through the
      real repeater and Save button, with `->assertNoJavaScriptErrors()`.
- [ ] Full existing suite still green (no regression to the shipped in-use delete guards' own
      `@error('values')` / `@error('productAttributeTypeId')` rendering, which this story's new
      `@error('sku')` block sits alongside, never replaces).

## Expected outcome
Opening a type's edit form shows, beside any value already backing one or more product variants, a
muted notice stating how many variants will have their SKU rewritten if that value's text changes.
The notice is informational only — it never blocks saving. If a rename would produce an invalid or
colliding derived SKU — for any of the four reasons the backend already enforces — saving is
refused with a visible message explaining why, the modal stays open, and nothing is changed in the
database. A rename that produces a valid, non-colliding SKU saves normally, exactly as it does
today.

## Acceptance criteria
- [ ] A value row backing at least one product variant shows an inline notice stating the exact
      variant count, using a `trans_choice()` key under `products.variants.*`.
- [ ] A value row backing no product variants shows no notice.
- [ ] The notice is non-blocking: saving a rename of an in-use value with no resulting SKU
      collision succeeds normally.
- [ ] A rename that triggers **any** `sku`-keyed refusal from the rename cascade (SKU collision,
      empty-segment derivation, over-length derivation, or the translated unique-violation race) is
      rejected with a visible, styled message (matching this screen's two existing `@error(...)`
      callout precedents) naming the specific reason, with the modal remaining open and no database
      write applied.
- [ ] No new translation key is added for any of these four refusal messages — the existing
      `products.variants.*` keys (already produced by `SyncProductAttributeValues`/
      `DeriveVariantSku`) are reused as-is.
- [ ] `lang/en/products.php` and `lang/es/products.php` remain key-for-key identical.
- [ ] The per-value usage count is a separate `#[Locked]` component property, never a key inside the
      client-writable `$values` array.
- [ ] The full existing test suite (Feature + Browser) remains green, including every pre-existing
      `AttributeTypesIndexRenderingTest`/`AttributeTypesIndexTest`/browser assertion.
- [ ] The screen renders correctly in light and dark mode and produces no JavaScript console
      errors.

## Open questions

**OQ-A — Blocking or non-blocking notice?** **Recommended: non-blocking** (0031's own
recommendation, unchanged): the rename is legitimate, transactional and all-or-nothing (0029
D-4.6), so a hard confirmation step would slow down a routine typo fix ("azul marnio" →
"azul marino") for no safety gain the transaction doesn't already provide. A blocking confirmation
naming every affected variant was considered and rejected as disproportionate for a screen whose
own domain (10¹–10² values) rarely has any single value backing more than a handful of variants.

**OQ-B — Whole-modal collision error, or attributed to the specific offending row?** 0031's OQ-10(b)
recommends the latter ("render it against the offending value row, naming the conflicting
record"). **Recommended here: whole-modal `@error('sku')` callout for v1** (the ✅/❌ pair this
story's Files section already commits to), for a concrete reason 0031 did not have visibility
into: `reDeriveVariantSkusForRenamedValues()` aborts on the **first** invalid derivation found
across *all* renamed values in the save, and identifying which specific submitted row produced that
one refusal would require the component to re-run (or the action to expose) a per-value mapping
that does not exist today — real new backend surface for a screen where at most one rename is the
common case anyway. The message already names the specific problem, and the modal stays open with
every field's edits intact, so the administrator loses nothing by having to read which row it came
from themselves. Escalate to per-row attribution only if this proves confusing in practice.

**OQ-C — Live-updating notice as the administrator types, or a static per-row notice fixed at
`openEditModal()` time?** **Recommended: static.** The values repeater's `wire:model` is
deliberately deferred (not `.live` — confirmed by reading the shipped view), so a live-updating
notice would require adding a network round trip on every keystroke purely to refresh a count that
cannot change mid-edit anyway (the usage count is a property of the *stored* value, not of what is
currently typed). Showing the notice unconditionally whenever the count is positive — regardless of
whether the administrator has touched that row yet — is simpler, requires no new reactivity, and is
still accurate: it tells them *before* they start typing that this value is shared.

**OQ-D — Which lang group holds `rename_notice`: `products.variants.*` or
`products.attribute_types.*`?** **Recommended: `products.variants.*`**, matching the precedent this
same screen already set with `value_in_use`/`type_in_use` — both are rendered on the attribute
types screen but live under `variants` because the message is *about* variants, not about the
taxonomy screen itself. Consistency with an already-shipped precedent on the same screen outweighs
grouping by rendering location.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per the
      [Full Test Suite Gate Rule](../../../docs/contracts.md#full-test-suite-gate-rule).
- [ ] `vendor/bin/pint --format agent` (unscoped, **not** `--dirty`) and `vendor/bin/phpstan analyse`
      (level 7) both clean, **and both recorded** — a gate absent from the record is a gate that did
      not run ([errors-log.md](../../../docs/errors-log.md)).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that `$valueUsageCounts` is `#[Locked]`
      and never reachable from the client; that the bulk count query is a single query per
      `openEditModal()` call regardless of how many values the type holds (no N+1); and that the
      generic `@error('sku')` outlet cannot be tricked into rendering a message from an unrelated
      validation path (confirm the `sku` key is exclusive to the rename cascade on this screen).
- [ ] Documentation updated (docs-keeper) — [api/routes.md](../../../docs/api/routes.md)'s
      `product-attribute-types.index` subsection (the new notice, the new `data-test` hooks, and
      the new `@error('sku')` outlet covering all four refusal messages) and
      [database/schema.md](../../../docs/database/schema.md)'s `product_attribute_values` section (the
      new bulk-count method, documented alongside `variantUsageCount()`'s and `firstValueInUse()`'s
      existing entries so the three per-value/per-type query shapes in this domain stay
      cross-referenced rather than silently parallel).
- [ ] Digest entry appended to [`ai-spec/tasks/_digests/epic-2.md`](../_digests/epic-2.md) at Phase
      6/7, per [workflow.md](../../../docs/workflow.md#decision-digest-per-epic), naming the new
      `ProductAttributeValue::variantUsageCounts()` method and the `sku`-keyed generic error outlet
      convention, so a later Epic 2 story does not re-derive either.
- [ ] Acceptance criteria met.
