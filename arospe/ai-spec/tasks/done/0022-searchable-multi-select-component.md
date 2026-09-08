# [0022] Shared searchable, server-side-filtered multi-select component

## Description
Build the reusable Livewire component every large-catalog picker in Epic 2 binds to: a text input
with a **debounced, server-side** search, a dropdown of matching options fetched per keystroke-burst,
selected values rendered as removable chips, and an explicit "no results" empty state. This story
ships **only the shell plus its prop/contract surface** — no models, no migrations, no catalog
queries, and neither consumer's data layer. It exists as its own story because two unrelated Epic 2
screens need the identical widget over datasets three orders of magnitude apart in size, and
building it twice inside those screens would guarantee two divergent implementations.

## Type
frontend | includes database-expert: **no**

The component owns no table, no query and no migration — its whole point is that it never knows what
it is searching. The one place data shape is decided is the `MultiSelectOptionsResolver` interface
below, and the two implementations of it belong to **0027** and **0034**, not here.

**PRD coverage.** This component is **implied infrastructure, not a directly-cited PRD feature** —
there is no `Feature:` block in [PRD](../../../docs/PRD/PRD.md) naming it, and this story's own Gherkin
therefore describes the *widget's* behaviour rather than restating either consumer's scenarios. It
underwrites exactly two acceptance criteria, one per consumer:

> - [ ] Products are assignable to one or more Sales Regions via a searchable multi-select where
>       selecting Spain surfaces its fiscal sub-entries.
> — [§2.2 Products](../../../docs/PRD/PRD.md#22-products)

> - [ ] The zone's geography picker is a **searchable, server-side-filtered multi-select** with a
>       "no results" empty state — the same shared component the product editor's Sales Region picker
>       uses. A client-side filter is explicitly insufficient at this dataset's size.
> — [§2.4 Shipping](../../../docs/PRD/PRD.md#24-shipping) (rewritten 2026-08-17)

**Why server-side filtering is the requirement, not an implementation preference.** The shared media
gallery ([§2.3](../../../docs/PRD/PRD.md#23-shared-media-gallery)) has a superficially similar
search-with-empty-state, and it is the wrong precedent to copy: its dataset is an uploaded image
library, and §2.4 states outright that "a client-side filter like the media gallery's does not scale"
to ~8,100 rows. The distinguishing constraint of this story is that **the option list is never fully
sent to the browser**.

**Boundaries with the sibling Epic 2 stories.**

- **0026 — product ↔ Sales Region assignment and tax resolution backend.** Owns the persistence side
  of the product-region assignment, and is the **first consumer of the D12 rejection contract**: its
  save must refuse outright when the submitted selection contains an id the resolver cannot vouch for.
- **0027 — product editor's Sales Region picker** (~250 seeded rows). Owns its own
  `MultiSelectOptionsResolver` implementation, the "selecting Spain surfaces its fiscal sub-entries"
  rule, and its embedding in the product editor. Consumes this component; does not modify it.
- **0034 — shipping-zone geography picker** (~8,100 municipios + 17 comunidades autónomas + all ISO
  countries). Owns its resolver, the by-level grouping *content*, and the search query/index. This
  story owns only the *ability* to render grouped results — plus, since 2026-08-18, the **bounded chip
  area** prop in D14 that keeps a many-entry zone from growing the editor unboundedly.
- **0032 — shipping geography catalog seed** (`ai-spec/tasks/done/0032-shipping-geography-catalog-seed.md`,
  done). Supplies the rows 0034 searches. No coupling to this story at all **except** the
  shared normalizer in D13, which its catalog rows must be matched through.
- **0033 — shipping zones backend.** Same D13 relationship as 0032: its geography catalog search must
  fold text through the one shared normalizer, not its own copy of the rule.

**Nothing in this story depends on any of them**, which is the point: it is buildable and testable
today against a test-only resolver, and it is the dependency all three pickers are blocked on.

## Documented functional decisions

The contract below is the deliverable that matters most. **0027 and 0034 bind to it without
re-deciding any of it**; any change to it after Phase 2 is a change to three stories, not one.

### D1 — How a consumer supplies results: a class-string resolver **(confirmed)**

Three mechanisms were debated. **A closure cannot be a component property** (not serializable across
`/livewire/update` re-hydration), which eliminates the obvious form immediately.

| Option | Verdict |
|---|---|
| (a) Abstract component the consumer **extends** | Workable, rejected on cost: one full Livewire component class **plus** its own request lifecycle and test surface per consumer, for what is fundamentally one query. |
| (b) Child **dispatches an event**, parent answers | **Rejected.** Livewire has no synchronous dispatch-and-return; it needs a listener plus a dispatch back keyed by component id, with a real risk of an extra round trip per keystroke. No precedent anywhere in `app/Livewire/**`. |
| (c) **Class-string implementing a 2-method interface**, passed to `mount()` | **Confirmed by the product owner (2026-08-18).** A string serializes cleanly, and the consumer writes one Action-shaped class — zero new Livewire components, zero new views per consumer. Matches the `app/Actions/` convention this codebase already leans on ([code-style.md](../../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method)). |

```php
// app/Livewire/Components/MultiSelectOptionsResolver.php
namespace App\Livewire\Components;

interface MultiSelectOptionsResolver
{
    /**
     * Options matching $term, capped at $limit.
     *
     * $term arrives ALREADY NORMALIZED by App\Actions\NormalizeForSearch (D13) — lowercased,
     * accent-folded, trimmed, internal whitespace collapsed. The implementation MUST fold the
     * haystack side with that same utility (or match a column already stored folded); comparing
     * a folded needle against an unfolded haystack silently matches nothing.
     *
     * @return array<int, array{id: string, label: string, group: string|null, disabled: bool}>
     */
    public function search(string $term, int $limit): array;

    /**
     * Authoritative labels for ids that are already selected, independent of any search term.
     *
     * TOTAL FUNCTION (D12, 2026-08-18): returns exactly one entry per requested id, or throws.
     * It MUST NOT return a short array — an id it cannot vouch for is an error to be reported,
     * never an entry to omit.
     *
     * @param  array<int, string>  $ids
     * @return array<int, array{id: string, label: string, group: string|null, disabled: bool}>
     *
     * @throws \App\Exceptions\UnresolvedSelectionException when any id cannot be resolved
     */
    public function resolveSelected(array $ids): array;
}
```

Consumer usage — the whole integration surface a picker story writes:

```blade
<livewire:components.searchable-multi-select
    :option-resolver="\App\Actions\Products\SearchSalesRegions::class"
    wire:model="regionIds"
    field="regionIds"
    :label="__('products.region_picker.label')"
/>
```

### D2 — Why the interface has **two** methods, not one

`search()` answers "what matches this term". `resolveSelected()` answers "what are the authoritative
labels for these ids, right now, regardless of the search box". They cannot be the same call, because
of the chip-label trap: an administrator who selects *Canarias* and then searches *Francia* must keep
a correctly-labelled *Canarias* chip, even though *Canarias* is no longer in the result set. Deriving
chip labels from `$results` renders that chip blank or raw-id. **Chip labels come only from
`resolveSelected()`**, refreshed on mount and after every select/remove.

### D3 — Option array shape

`array{id: string, label: string, group: string|null, disabled: bool}`.

- **`id` is `string`**, never `int`, so both consumers fit without the shell caring — 0027's region ids
  and 0034's ids (UUID per [ADR 0001](../../../docs/decisions/0001-uuid-primary-keys.md), or a composite
  like `municipio:28079`) both serialize identically.
- **`group`** is the level/section heading (`"Municipio"`, `"Comunidad Autónoma"`, `"País"`) that
  0034's grouped-by-level AC needs; `null` for 0027's flat list, which renders no headings at all.
- **`disabled`** lets a resolver keep an option *visible but unselectable* rather than omitting it,
  which would look to the user like "my search found nothing".

### D4 — Selection state carries **ids only**, never labels

```php
#[Modelable] public array $selected = [];      // bare id strings — the parent's wire:model target
#[Locked]    public array $selectedOptions = []; // id => {label, group} — chip display only
```

This is the load-bearing security decision. `$selected` is client-writable by construction (it is the
`wire:model` surface); if it also carried labels, a tampered payload would render an attacker-chosen
label against a real id. It carries ids alone.

> ~~**Any id `resolveSelected()` does not vouch for is silently dropped** — from the render *and* from
> the next dehydrated `$selected`. That single rule makes a tampered id array, a deleted row, and a
> re-seeded catalog all fail the same safe way.~~
>
> **Superseded 2026-08-18 by D12** (product-owner decision, raised from 0026's debate). The
> *ids-only* half of D4 stands unchanged and is still the security rule; only the **disposal** of an
> unvouched-for id changes. Silent dropping was written here as a deliberate fail-safe, and as a
> **security** posture it was sound — but it is unacceptable as **product** behaviour, because it
> converts "one of your regions no longer exists" into a save that succeeds with a quietly smaller
> selection nobody is told about. An unresolvable id is now **reported and refused**, never dropped.
> See [D12](#d12--an-unresolvable-id-is-rejected-never-silently-dropped-confirmed).

`#[Modelable]` was chosen over a bespoke event contract so the consumer writes plain
`wire:model="regionIds"`, matching this repo's idiom everywhere else.

> **Deliberately not `#[Locked]`: `$selected`.** It is the model binding; locking it would break the
> binding. The security property is enforced by *never reading a label off it*, not by locking it —
> which is why it holds regardless of how `#[Modelable]`'s client-side entanglement syncs. See OQ-6.

### D5 — Public surface (the complete contract)

```php
#[Locked]    public string $optionResolver;        // class-string; is_subclass_of()-validated in mount()
#[Modelable] public array  $selected = [];         // bare ids; never null (D8)
#[Locked]    public array  $selectedOptions = [];  // id => {label, group}
             public string $search = '';
#[Locked]    public array  $results = [];          // server-derived; current page of matches
             public string $label = '';
             public string $placeholder = '';
             public string $field = 'selected';    // error-bag key, so $errors->has($field) works
             public int    $minSearchLength = 1;   // see OQ-2
             public int    $debounceMs = 300;
             public int    $resultLimit = 20;
             public string $emptyStateText = '';   // blank => lang fallback
             public bool   $disabled = false;

// Added 2026-08-18 — both purely additive, see D14 and D12.
#[Locked]    public ?string $maxChipAreaHeight = null;        // CSS length; null => unbounded (D14)
#[Locked]    public array   $unresolvableSelected = [];       // ids resolveSelected() refused (D12)
```

Methods: `mount()`, `updatedSearch()`, `selectOption(string $id)`, `removeOption(string $id)`,
and `assertSelectionResolvable()` (D12, the helper a consumer calls from its own save path).

> **No `maxSelections` prop — confirmed by the product owner (2026-08-18).** Neither consumer has a
> known cap: a product may sit in any number of Sales Regions, and a shipping zone may bundle
> arbitrarily many geography entries. A cap is therefore **not shipped as an unused mechanism**; the
> first consumer story that genuinely needs one adds the prop then, which is a purely additive change
> to this contract and breaks no existing binding.

### D6 — `#[Locked]` placement, and why each one is load-bearing

- **`$optionResolver`** — without it, a tampered `/livewire/update` payload chooses which server-side
  class the component instantiates and calls with an attacker-supplied term. That is an arbitrary
  disclosure primitive, not a cosmetic bug. It is set once, server-side, from the consumer's own Blade
  attribute, so locking costs nothing.
- **`$selectedOptions`** and **`$results`** — server-derived display state, per
  [livewire-authorization.md](../../../docs/security/livewire-authorization.md#every-server-derived-property-is-locked-not-just-the-ids)'s
  rule that the test is "is this value ever legitimate request input", not "is it an id".
- **`$unresolvableSelected`** (added 2026-08-18) — same rule: it is a server-derived *verdict*. If the
  client could write it, it could clear its own error state, and the in-field warning D12 relies on
  becomes decorative.
- **`$maxChipAreaHeight`** (added 2026-08-18) — this one is locked for a **different** reason than the
  others: it is not a verdict, it is a value that flows into a rendered `style` attribute. A
  client-writable string reaching `style` is a CSS-injection primitive, so it is locked *and*
  format-validated in `mount()` (D14). Set once, server-side, from the consumer's Blade attribute —
  locking costs nothing, exactly as with `$optionResolver`.

### D7 — Authorization belongs to the resolver, **never** to the shell

The shell has no idea what a Sales Region or a municipio is and must not decide who may see one. Any
row-level authorization lives in the consumer's `search()`/`resolveSelected()` — the same shape as
`App\Livewire\Users\Index::loadUsers()`'s per-row `Gate::allows()`. **This story ships no
`Gate::authorize()` call of its own**, deliberately: it has nothing meaningful to authorize against,
and the screen it is embedded in is already gated. Reviewers should expect its absence, not flag it.

What the shell *does* owe: `selectOption()`, `removeOption()` and `updatedSearch()` must each refuse
when `$disabled` is true, server-side — hiding the input is not a control, per
[livewire-authorization.md](../../../docs/security/livewire-authorization.md#gate-at-the-top-of-every-method-that-mutates-or-discloses).

### D8 — Four known traps this component must be built around

1. **`@js()` on every id in a `wire:*` argument** — `wire:click="selectOption(@js($option['id']))"`,
   same for `removeOption`. Mandatory, not stylistic: a value interpolated into a `wire:` directive
   lands in a JS evaluator where Blade's escaping is undone
   ([blade-livewire-output-encoding.md](../../../docs/security/blade-livewire-output-encoding.md)). It
   matters *more* here than on the Users screen, because these ids may come from an external fixture
   (INE municipio codes, ISO country codes) rather than being UUIDs by construction.
2. **A disabled `flux:menu.item` gets two full `@if`/`@else` branches, never a conditionally-bound
   prop.** Under `livewire/blaze` a Flux prop that decides whether a wrapper renders counts as
   *present* whenever the attribute is written on the tag at all — the trap already recorded in
   [errors-log.md](../../../docs/errors-log.md) and worked around in
   `resources/views/livewire/users.blade.php`. Reuse that shape; do not rediscover it.
3. **`$selected` defaults to `[]`, never `null`.** The literal native-`<select>` desync in the errors
   log does not apply (there is no native `<select>` here), but its general rule does: a bound
   property must hold a real empty value in the type the DOM expects.
4. **A conditional `disabled` on a `<flux:*>` tag is a full `@if`/`@else` tag pair, never a bare
   `@disabled(...)` / `:disabled="..."` attribute.** Added 2026-08-31, from the newest
   [errors-log.md](../../../docs/errors-log.md#a-bare-disableddisabled-inside-a-fluxbutton-tags-attribute-list-corrupts-the-whole-compiled-view--2026-08-31)
   entry (story 0021's Phase 5 finding N4, reproduced via `Blade::render()`). Written inside a
   `<flux:*>` tag's attribute list, that directive does **not** resolve to a conditional `disabled=""`
   the way it would on a plain HTML `<button>` — `livewire/blaze`'s compile-time folding corrupts the
   tag's **whole** attribute string into invalid PHP, a syntax error that breaks the entire compiled
   view rather than merely mis-rendering one control. This story hits it directly: the search
   `flux:input` is disabled when `$disabled` is true, and a `disabled: true` option's control is
   disabled per-row (D3). Branch the whole tag both times. It shares its root cause with point 2 above
   — Blaze not tolerating a directive where a plain attribute is expected — and is the **third** such
   trap the errors log records; the difference is that this one fails loudly rather than silently, but
   only for whoever renders the page first.

### D9 — Debounce, truncation, and why a result limit is mandatory

> **Phase 6 correction (2026-08-31, `docs-keeper`): the paragraph below describes a mechanism that was
> never shippable and was corrected before Phase 3 wrote real code around it.** `wire:model.live.debounce.{$debounceMs}ms="search"`
> cannot compile: Blade's `ComponentTagCompiler` parses a component tag's attribute **names** with a
> regex that excludes `{`/`}`/`$`, so an interpolated duration inside the modifier chain is not a shape
> the compiler can parse at all — a different and previously-undocumented failure from every
> `livewire/blaze` attribute-*value* trap this project's errors log already records. **What actually
> shipped**, in `resources/views/livewire/components/searchable-multi-select.blade.php`, is a plain
> (non-`.live`) `wire:model="search"` plus a hand-rolled Alpine `x-on:input="clearTimeout(...);
> searchDebounceTimeout = setTimeout(() => $wire.set('search', $event.target.value),
> {{ $debounceMs }})"` — the same mechanism `wysiwyg-editor.blade.php` already established for its own
> debounce, still driving the identical `updatedSearch()` `updated<Property>()` lifecycle hook once the
> timeout fires. See
> [errors-log.md](../../../docs/errors-log.md#a-livewire-directive-modifiers-duration-cannot-be-interpolated-as-part-of-a-component-tags-attribute-name--2026-08-31)
> for the full mechanism and
> [conventions/base-standards.md](../../../docs/conventions/base-standards.md#flux-frees-ui-dropdown-requires-a-real-button-trigger-descendant--confirmed-twice-not-a-one-off)
> for D10's own parallel correction, below. The paragraph immediately below is left standing as the
> record of what Phase 1 specified, not as a description of the shipped view.

`wire:model.live.debounce.{$debounceMs}ms="search"` drives an `updatedSearch()` hook — plain Livewire,
no hand-rolled Alpine debounce (nothing in `app/Livewire/**` hand-rolls one today).

```php
public function updatedSearch(): void
{
    // D13: one shared normalizer, applied here so every resolver receives an identically
    // folded term. This subsumes the old trim() — and OQ-5's whitespace-only case with it.
    $term = app(NormalizeForSearch::class)->__invoke($this->search);

    if (mb_strlen($term) < $this->minSearchLength) {
        $this->results = [];

        return;
    }

    // Over-fetch by the current selection count so excluding already-selected rows (D11)
    // can never leave fewer than $resultLimit + 1 candidates behind.
    $fetchLimit = $this->resultLimit + 1 + count($this->selected);

    $this->results = app($this->optionResolver)->search($term, $fetchLimit);
}
```

> **`minSearchLength` is measured against the *normalized* term, not the raw input** (changed
> 2026-08-18 by D13). `"  ñ  "` is length 1, not 5, and `"   "` is length 0 — which is why OQ-5 is
> now resolved rather than open. **The action is resolved with `app()`, deliberately, and the
> per-method action-injection convention does *not* apply here**: `updatedSearch()` is a Livewire
> `updated<Property>()` **lifecycle hook**, and Livewire invokes lifecycle hooks through
> `wrap($component)->__call($name, $params)` with fixed parameters rather than a container `call()`,
> so a type-hinted parameter would never be resolved. This is exactly the `app()` carve-out
> [code-style.md](../../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)
> states — *a method whose parameter list is fixed by something other than this class may use `app()`,
> and nothing else may* — established by story 0020's `Gallery::updatedPendingUploads()`, which
> resolves its own two collaborators the same way for the same reason. Do not "fix" this into a
> method-injected signature.

**Fetch `resultLimit + 1` (plus the selection count), trim back to `resultLimit`.** The `+ 1` detects
"there are more matches" without a second `COUNT(*)`, and is what tells the view to render the "narrow
your search" row. An unbounded result set would reintroduce exactly the non-scaling behaviour §2.4
rejects, just moved server-side: a 2-character term over 8,100 municipios plausibly matches hundreds of
rows, and rendering them all sizes the `/livewire/update` payload and DOM diff for the worst case on
every keystroke.

Open/close, outside-click dismissal and menu focus come from `flux:dropdown` (`ui-dropdown`) — already
a live pattern in `resources/views/components/desktop-user-menu.blade.php` and
`resources/views/layouts/app/sidebar.blade.php`, so no bespoke Alpine is needed for them.

> **Phase 6 correction (2026-08-31): this paragraph did not survive Phase 3 either — see D10 below,
> which was forced to abandon `flux:dropdown` for the identical reason `wysiwyg-editor.blade.php`
> already had.** `ui-dropdown` requires a real `<button>` descendant to resolve its trigger
> (`this.querySelector("button")`), and `flux:input` renders none, so this mechanism throws on every
> page load rather than merely failing to style correctly. The shipped mechanism is a hand-rolled
> `x-show`/`x-cloak`/`x-on:click.outside`/`x-on:keydown.escape.window` popover instead — bespoke Alpine
> genuinely was needed. Left standing below as the record of what Phase 1 specified.

### D10 — Flux **Free** has no combobox; this is hand-assembled

Verified: `vendor/livewire/flux/stubs/resources/views/flux/select/variants/` contains only
`default.blade.php` (a native `<select>`), and no `flux:autocomplete` / `flux:combobox` /
`flux:command` exists anywhere in `vendor/livewire/flux/`. The component is assembled from
`flux:input` + `flux:dropdown` + `flux:menu.group` / `.heading` / `.item` + `flux:badge` /
`flux:badge.close`. `flux:menu.group` and `flux:menu.heading` are exactly what 0034's grouping needs.

> **Phase 6 correction (2026-08-31): the `flux:dropdown` half of this decision did not survive Phase 3
> and is now false as a description of what shipped.** Verified live, not reasoned about:
> `flux:dropdown` (`ui-dropdown`) resolves its trigger with `this.querySelector("button")`
> (`vendor/livewire/flux/dist/flux.min.js`), a hard requirement `ui-menu`'s own `boot()` depends on to
> attach its keydown listener. `flux:input` — this component's trigger — renders only an `<input>`, no
> `<button>` descendant, so `querySelector("button")` returns `null` and the listener attachment throws
> `Cannot read properties of null (reading 'addEventListener')` on **every page load**, confirmed via
> `assertNoJavaScriptErrors()`. This is the identical failure `wysiwyg-editor.blade.php`'s own D8 link
> popover already hit and worked around, and this component is that pattern's **second** use, not a
> new one: `flux:menu` / `.group` / `.heading` / `.item` are kept for their styling (plain
> presentational components, no `ui-menu` custom element among them), and only the outer
> `<flux:dropdown>`/`ui-dropdown` wrapper is replaced with a hand-assembled
> `x-show`/`x-cloak`/`x-on:click.outside`/`x-on:keydown.escape.window` popover. See
> [conventions/base-standards.md](../../../docs/conventions/base-standards.md#flux-frees-ui-dropdown-requires-a-real-button-trigger-descendant--confirmed-twice-not-a-one-off)
> for the now-generalised rule and
> [the searchable-multi-select view's own file-banner comment](../../../resources/views/livewire/components/searchable-multi-select.blade.php)
> for the exact reproduction. Everything else in this decision — the "no combobox in Flux Free" finding,
> `flux:input` as the trigger, `flux:menu.group`/`.heading`/`.item`/`flux:badge`/`flux:badge.close` as
> the presentational building blocks — shipped exactly as written.

### D11 — An already-selected option is **excluded** from the results **(confirmed)**

Confirmed by the product owner (2026-08-18): once a value is selected it disappears from the result
list entirely, rather than remaining visible in a disabled/checked state. The chip row is the single
place a selection is represented, so the widget never shows the same value twice in two different
idioms — and at 8,100 rows, result-list space is scarce enough that spending rows on things the
administrator has already picked is a real cost.

The exclusion is applied **in the shell, after the resolver returns** — deliberately not by passing an
exclusion list into `search()`, which would widen the now-locked D1 interface and push the same
filtering duty onto every future resolver implementation:

```php
$this->results = collect($fetched)
    ->reject(fn (array $option): bool => in_array($option['id'], $this->selected, true))
    ->take($this->resultLimit)
    ->values()
    ->all();
```

Two consequences worth stating explicitly:

- **The over-fetch in D9 exists because of this rule.** Filtering after a `resultLimit + 1` fetch could
  return fewer than `resultLimit` rows whenever matches are already selected, making the list appear to
  shrink as the administrator works. Over-fetching by `count($selected)` bounds that away.
- **`selectOption()` must still be a defensive no-op for an already-selected id.** Exclusion makes the
  double-select unreachable *through the UI*, which is not the same as unreachable: `/livewire/update`
  is an independent entry point. The duplicate guard stays server-side and stays tested.

This supersedes the `disabled` flag only for the already-selected case. `disabled` remains in the D3
option shape for its original purpose — an option a **resolver's business rule** marks unselectable
while still worth showing (0027's fiscal-sub-entry rules are the expected first user).

### D12 — An unresolvable id is **rejected**, never silently dropped **(confirmed)**

**Confirmed by the product owner (2026-08-18)**, raised from 0026's Three Amigos debate. This
**supersedes the silent-drop rule in [D4](#d4--selection-state-carries-ids-only-never-labels)**;
that paragraph is struck through rather than deleted, because the reasoning behind it is still why
the *ids-only* half of D4 holds.

**The product rule.** A save whose selection contains any id the resolver cannot vouch for — a region
deleted between form-load and save, a re-seeded catalog, a tampered payload — is **rejected in its
entirety, with a validation error naming the problem**. It is never partially saved, and the
administrator is never left believing they saved something they did not.

**The mechanism: `resolveSelected()` becomes a total function, or throws.**

```php
// app/Exceptions/UnresolvedSelectionException.php
namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown by a MultiSelectOptionsResolver::resolveSelected() implementation when it cannot
 * vouch for every requested id. Deliberately has NO render() method — unlike its sibling
 * App\Exceptions\ImmutableRoleException, this must never reach the HTTP layer as a status
 * code. It is a value carrier for a caller that is expected to catch it and translate it
 * into a field-level validation error (D12).
 */
class UnresolvedSelectionException extends RuntimeException
{
    /** @param  array<int, string>  $missingIds */
    public function __construct(public readonly array $missingIds)
    {
        parent::__construct('Unresolvable selection: '.implode(', ', $missingIds));
    }
}
```

`resolveSelected(array $ids)` must return **exactly one entry per requested id**, or throw. Returning
a short array is now a contract violation, not a supported outcome.

**Why an exception rather than a result object.** A `ResolvedSelection { resolved[], missing[] }`
value object was the obvious alternative and is **rejected**, for four reasons:

| | Exception (chosen) | Result object (rejected) |
|---|---|---|
| Consumer forgets to check | Operation aborts — **fails closed** | `->missing` unread ⇒ **silently reproduces the exact bug this decision exists to kill** |
| Return type of `resolveSelected()` | Unchanged (`array<…>`), so no resolver signature widens | Changes for every implementation — a three-story contract break |
| New class needed | One exception in the **existing** `app/Exceptions/` | A value object with no home (`app/Support/` does not exist; creating it needs approval — the same reason OQ-3 rejects `app/Contracts/`) |
| Codebase precedent | `App\Exceptions\ImmutableRoleException` is this exact shape | none |

The first row is decisive. The defect being fixed is *invisible partial success*; a mechanism whose
default-on-neglect outcome is also invisible partial success cannot be the fix.

**What each layer does with it.**

1. **The resolver** (0026 / 0027 / 0034) throws, carrying the ids it could not resolve.
2. **The shell** catches it at its two *display* call sites only — `mount()` and the chip refresh
   after every select/remove — because an editor must still render when the catalog has moved under
   it. It does **not** drop the ids. It:
   - keeps the unresolvable ids in `$selected`, so nothing is lost behind the administrator's back;
   - records them in `#[Locked] $unresolvableSelected`;
   - renders each as a distinct **"unavailable" chip** the administrator can remove;
   - calls `addError($this->field, __('components.searchable_multi_select.unresolvable_selection'))`
     so the field opens in a visible error state.
3. **The consumer's save path** re-checks independently — `$this->assertSelectionResolvable()` on the
   shell, or its own `resolveSelected()` call — and translates the exception into
   `ValidationException::withMessages([...])`, aborting the whole write. **This re-check is
   mandatory, not belt-and-braces**: the shell's flag is UI state and `/livewire/update` is an
   independent entry point, so a save must never trust it. This is the same "a rule enforced only in
   a component is bypassed by every other call site" rule as
   [livewire-authorization.md](../../../docs/security/livewire-authorization.md#gate-at-the-top-of-every-method-that-mutates-or-discloses).

**The unavailable chip shows a generic localized label, never the raw id.** D4's reasoning extends
here: ids in `$selected` are client-writable, so echoing one into the chip row hands an attacker a
free text slot in trusted UI chrome. The chip reads
`components.searchable_multi_select.unavailable_option` and the ids travel in the exception message
and the log, not the DOM.

**Consumer obligation, stated once so 0026 / 0027 / 0034 copy it verbatim:** every write path that
persists a selection sourced from this component MUST resolve that selection first and MUST reject
the entire operation on `UnresolvedSelectionException` — never `array_intersect()` the submitted ids
against the valid ones and proceed with the remainder.

### D13 — One centralized search-term normalizer, `App\Actions\NormalizeForSearch` **(confirmed)**

**Confirmed by the product owner (2026-08-18)**, raised from 0034's debate. Search-term normalization
must be **byte-identical** across 0022's shell, 0026's resolver, 0032/0033's geography catalog search
and 0034's picker — searching `Nino` must find `Niño` in every one of them, and `A Coruña` must be
reachable as `a coruna`. Four independent re-implementations of "lowercase and strip accents" would
diverge on the first edge case (`ß`, `ç`, an emoji, a double space), and the divergence would surface
as "the same search works on one screen and not another".

**Location: `app/Actions/NormalizeForSearch.php`** → `App\Actions\NormalizeForSearch`, invokable,
`__invoke(string $value): string`.

Directly under `app/Actions/`, not in a subfolder, because
[base-standards.md](../../../docs/conventions/base-standards.md#directory-structure) says exactly that:
"A new action goes in the subfolder for its domain (**or directly under `app/Actions/` if it belongs
to none**)". Normalization belongs to no domain — products, geography and Sales Regions all call it.
The naming follows the same file's convention for single-purpose invokables: imperative verb phrase,
no `Action`/`Service` suffix (`Logout`, `CreateNewUser`, `RequestEmailChange` → `NormalizeForSearch`).
It is named `…ForSearch`, not `…SearchTerm`, on purpose: **both sides of the comparison go through
it** — the needle a user typed *and* the haystack value a resolver matches against.

> **`app/Support/TextNormalizer.php` was considered and rejected.** `app/Support/` does not exist in
> this repo (verified: `app/` holds `Actions`, `Concerns`, `Console`, `Enums`, `Exceptions`, `Http`,
> `Listeners`, `Livewire`, `Models`, `Notifications`, `Policies`, `Providers`), so creating it is a
> **new base folder** requiring approval under base-standards — the identical reason OQ-3 already
> rejects `app/Contracts/` for the D1 interface. `app/Concerns/` was also rejected: it holds
> validation-rule *traits* whose every method is suffixed `Rules`
> ([naming.md](../../../docs/conventions/naming.md#traits-and-their-methods)), which this is not. If
> `app/Support/` is ever approved for other reasons, moving this class is a mechanical rename with a
> single call-site sweep — see OQ-8.

**Exact behaviour — four steps, in this order:**

```php
public function __invoke(string $value): string
{
    return (string) preg_replace(
        '/\s+/u',
        ' ',
        Str::ascii(Str::lower(trim($value)))
    );
}
```

1. `trim()` — strip leading/trailing whitespace.
2. `Str::lower()` — mb-safe lowercasing (`mb_strtolower`). **Before** the folding step, matching the
   order this repo already uses in
   [`FortifyServiceProvider`](../../../app/Providers/FortifyServiceProvider.php)'s login-throttle key.
3. `Str::ascii()` — accent/diacritic folding.
4. `preg_replace('/\s+/u', ' ', …)` — collapse internal whitespace runs to a single space, so
   `"a   coruna"` and `"a coruna"` are one term.

**`Str::ascii()`, deliberately not `Str::transliterate()`** — and this is the one non-obvious call in
D13, verified by execution rather than reasoned about:

| Input | `Str::transliterate(Str::lower(…))` | `Str::ascii(Str::lower(…))` |
|---|---|---|
| `Niño` | `nino` | `nino` |
| `café☕` | `cafe?` ← **literal `?` injected** | `cafe` |
| `Ñ东` | `nDong ` ← **uppercase leaks past step 2** | `n` |
| `东京` | `Dong Jing ` | `` (empty) |

`Str::transliterate()`'s default `$unknown = '?'` writes a literal `?` into the term for any
unmappable character, which then matches nothing in a `LIKE` query and reads to the user as "search is
broken"; it also romanizes CJK, re-introducing uppercase *after* the lowercase step. `Str::ascii()`
drops what it cannot map, which is the correct behaviour for a search needle. **The existing
`Str::transliterate` call in `FortifyServiceProvider` is deliberately left alone** — it builds a
rate-limit key, not a search term, and changing its shape would silently reset live throttle counters.
It is cited above only as precedent for the lower-then-fold *ordering*.

**Verified postconditions** (assert these in the unit test): output is lowercase ASCII with no
leading/trailing whitespace and no internal whitespace runs; the function is **idempotent**
(`f(f(x)) === f(x)`); and step 3 emits no uppercase for lowercased input — checked across the whole
U+00C0–U+024F Latin range, so the pipeline needs no trailing second `Str::lower()`.

**Who must call it, and where:**

- **0022 (this story)** — `updatedSearch()` normalizes before the length check and before calling
  `search()` (see the amended D9). The resolver therefore always receives a normalized term.
- **0026 / 0027 / 0034 resolvers** — normalize the **haystack** with the same utility, or match a
  column already stored folded. The `search()` docblock in D1 now states this.
- **0032 / 0033** — geography catalog search and any pre-folded/normalized column the seeder writes.

**The rule, for the other stories to quote:** no consumer reimplements lowercasing, accent-stripping,
trimming or whitespace collapsing inline. `Str::lower()`/`Str::ascii()` appearing anywhere in a search
path other than inside `NormalizeForSearch` is a review finding.

### D14 — `maxChipAreaHeight`: a bounded, scrollable chip area **(confirmed, purely additive)**

**Confirmed by the product owner (2026-08-18)**, raised from 0034's debate. A shipping zone may bundle
dozens or hundreds of geography entries; with an unbounded chip row, the chip area grows without limit
and pushes the rest of the zone editor off-screen. The picker needs a **bounded, internally scrollable
chip area**.

```php
#[Locked] public ?string $maxChipAreaHeight = null;   // e.g. '12rem'; null => unbounded
```

- **`null` is the default and means unbounded** — today's exact behaviour. When the prop is omitted,
  the chip container renders with **no `style` attribute and no overflow class at all**, so the DOM is
  byte-identical to what 0027 and 0034 are written against today. This is what makes the change
  *purely additive*: it is the same "add the prop when a consumer genuinely needs it" path the D5 note
  reserved for `maxSelections`, now actually exercised.
- **When non-null**, the chip container gets `style="max-height: {value}"` plus `overflow-y-auto`, and
  the chip area is exposed as a scrollable region with an accessible name so a keyboard user can reach
  it (`role="group"` + `aria-label`, consistent with OQ-7's in-scope ARIA list).

**Shape: a CSS length string, not an int of pixels and not a row count.**

- A **CSS length** (`'12rem'`, `'240px'`) lets a consumer express the bound in `rem`, which respects
  the user's root font size — a px bound silently clips more content for anyone who has scaled their
  text up, and Tailwind v4's scale is rem-based anyway.
- A **row count** (`maxChipAreaRows = 4`) was rejected: chips wrap at variable widths, so rows→height
  is not a stable mapping and the prop would mean something different at every viewport width.

**Validated in `mount()`, alongside the existing `is_subclass_of()` guard.** The value flows into a
rendered `style` attribute, so it is checked against a strict allow-list —
`/^\d+(\.\d+)?(rem|em|px|vh)$/` — and anything else throws `InvalidArgumentException`. That is a
developer error surfaced at first render, in the same place and shape as the resolver-class guard;
combined with `#[Locked]` (see D6), no client-supplied string can ever reach `style`.

**Explicitly not in scope for this prop:** a "+N more" collapsed summary, a chip-area resize handle,
or virtualized chip rendering. Scrolling is the whole feature; if a consumer later needs a collapsed
summary, that is another additive prop under the same rule.

## Gherkin

Actor is phrased **"a catalog administrator using a searchable multi-select field"** — deliberately
naming no consumer domain. This is shared infrastructure with no screen of its own, and saying "Sales
Region" or "municipio" here would be a ghost precondition
([rule 6](../../../docs/testing/frontend/gherkin-guidelines.md#6-no-ghost-scenarios)) about screens that
do not exist. Every scenario follows
[rule 1](../../../docs/testing/frontend/gherkin-guidelines.md#1-imperative-vs-declarative-scenarios)
(named business-role actor) and
[rule 3](../../../docs/testing/frontend/gherkin-guidelines.md#3-single-when-per-scenario) (one `When`).

```gherkin
Feature: Searchable multi-select field

  Scenario: Search results narrow to matches as the administrator types
    Given a catalog administrator using a searchable multi-select field
    When they search for a term matching some of the field's available options
    Then only the matching options are offered

  Scenario: No matching options shows an explicit empty state
    Given a catalog administrator using a searchable multi-select field
    When they search for a term that matches no available option
    Then an explanatory "no results" message is shown instead of a list of options

  Scenario: A term shorter than the field's minimum offers nothing
    Given a catalog administrator using a searchable multi-select field
    When they search with a term shorter than the field's minimum search length
    Then no options are offered and no search is performed

  Scenario: Selecting an option adds it as a removable chip
    Given a catalog administrator using a searchable multi-select field
    When they select an offered option
    Then it appears as a removable chip among the field's selected values

  Scenario: Removing a chip deselects that option
    Given a catalog administrator using a searchable multi-select field,
      with an option already selected
    When they remove that option's chip
    Then the option is no longer among the field's selected values

  Scenario: An already-selected option is no longer offered among the results
    Given a catalog administrator using a searchable multi-select field,
      with an option already selected
    When they search for a term matching that already-selected option
    Then it is not offered among the results, appearing only as a chip
      among the selected values

  Scenario: A selected option keeps its label after it drops out of the current results
    Given a catalog administrator using a searchable multi-select field,
      with an option already selected
    When they search for a term that no longer matches that already-selected option
    Then its chip still shows its correct label among the selected values

  Scenario: Values selected before the field was opened are shown as chips
    Given a catalog administrator opening a searchable multi-select field
      that already has several values selected
    When the field is shown to them
    Then each already-selected value appears as a removable chip with its correct label

  Scenario: Too many matching options are reported as needing a narrower search
    Given a catalog administrator using a searchable multi-select field backed by
      more matching options than the field offers at once
    When they search with a broad term
    Then only the field's usual number of options is offered
    And they are told to narrow their search to see the rest

  Scenario: Matching options from different groups are offered grouped
    Given a catalog administrator using a searchable multi-select field
      whose options belong to different groups
    When they search with a term matching options across more than one group
    Then the matching options are offered grouped under their respective group

  Scenario: An option marked unavailable cannot be selected
    Given a catalog administrator using a searchable multi-select field,
      with an offered option marked unavailable by a business rule
    When they try to select that option
    Then it is not added to the selected values, and the reason is explained

  Scenario: A disabled field accepts no changes
    Given a catalog administrator viewing a searchable multi-select field that is disabled
    When they try to select an option
    Then the selected values do not change

  Scenario: A value the catalog no longer offers is flagged rather than dropped
    Given a catalog administrator using a searchable multi-select field
      holding a selected value the catalog no longer offers
    When the field is shown to them
    Then that value is marked as unavailable among the selected values
      and the field reports that it must be resolved before saving

  Scenario: Saving a selection containing an unavailable value is refused outright
    Given a catalog administrator using a searchable multi-select field
      holding a selected value the catalog no longer offers
    When they save the form
    Then the whole save is refused with a validation error explaining the unavailable value
      and none of the selection is persisted

  Scenario: Removing the unavailable value lets the save proceed
    Given a catalog administrator whose save was refused for holding an unavailable value
    When they remove that value's chip
    Then the field no longer reports an unavailable value

  Scenario: Searching without accents finds accented options
    Given a catalog administrator using a searchable multi-select field
      offering an option whose label contains accented characters
    When they search for that label written without its accents
    Then that option is offered

  Scenario: Search matching ignores letter case
    Given a catalog administrator using a searchable multi-select field
    When they search for a term matching an option's label in a different letter case
    Then that option is offered

  Scenario: A search term of only spaces offers nothing
    Given a catalog administrator using a searchable multi-select field
    When they search with a term made only of spaces
    Then no options are offered and no search is performed

  Scenario: A field with a bounded chip area scrolls instead of growing
    Given a catalog administrator using a searchable multi-select field
      configured with a bounded chip area, holding more selected values than fit in it
    When the field is shown to them
    Then the chip area keeps its bounded height and its contents scroll

  Scenario: A field without a bounded chip area grows to fit its chips
    Given a catalog administrator using a searchable multi-select field
      configured with no chip-area bound, holding many selected values
    When the field is shown to them
    Then every chip is visible without scrolling the chip area
```

> **One scenario is deliberately absent, pending a product decision** — writing it now would invent a
> business rule nobody has confirmed (rule 6): whether a just-focused, empty field browses a starting
> set of options or shows nothing until typing (OQ-2).
>
> **No maximum-selections scenario exists** because there is no maximum — confirmed 2026-08-18, see D5.
> **Re-selecting an already-selected value has no scenario either**, since D11 makes it unreachable
> through the UI; it survives as a defensive server-side test, not as user-facing behaviour.
>
> **Amended 2026-08-18.** The former scenario *"A value that is no longer available is dropped rather
> than shown"* is **superseded** — it asserted the silent drop D12 abolishes, and asserting it now
> would lock in the defect. It is replaced by the three unavailable-value scenarios above.
>
> **On the save scenario and rule 6.** "Saving … is refused outright" is the one scenario here that
> reaches past the widget into a form it does not own, which normally reads as a ghost scenario. It is
> kept deliberately, because D12's whole point is a rule the **consumer** must honour, and a contract
> that is never stated as behaviour is a contract nobody implements. It is exercised here against the
> test host page's own save control (see "Test double"), and 0026 / 0027 / 0034 each restate it
> against their real screen. No consumer domain is named in the wording.

## Files to create/modify

**Owned by this story:**

- `app/Livewire/Components/SearchableMultiSelect.php` — **new.** The concrete, final component
  (not abstract — see D1). Holds the public surface in D5, the `is_subclass_of()` mount guard, the
  debounce hook, and the reconciliation that drops unvouched-for ids.
- `app/Livewire/Components/MultiSelectOptionsResolver.php` — **new.** The two-method interface in D1,
  with `resolveSelected()`'s total-function contract and `search()`'s normalized-term precondition.
- `app/Exceptions/UnresolvedSelectionException.php` — **new (2026-08-18, D12).** Carries
  `array $missingIds`. Lands in the **existing** `app/Exceptions/` next to `ImmutableRoleException`,
  so no new base folder. Deliberately has **no** `render()` method — unlike its sibling, it must never
  become an HTTP status; it is always caught and translated into a validation error.
- `app/Actions/NormalizeForSearch.php` — **new (2026-08-18, D13).** The single shared normalizer,
  directly under `app/Actions/` per the "belongs to no domain" clause in base-standards. Four steps:
  `trim` → `Str::lower` → `Str::ascii` → collapse whitespace.
- `resources/views/livewire/components/searchable-multi-select.blade.php` — **new.** The one shared
  view: the `flux:input` trigger, the `flux:dropdown` + `flux:menu` result list (grouped when any
  result carries a `group`, flat when none do), the chip row (bounded and scrollable only when
  `$maxChipAreaHeight` is set — D14), the unavailable-chip variant and its field-level error (D12),
  the empty state, and the truncation row.
- `lang/en/components.php` + `lang/es/components.php` — **existing files this story extends, not new.**
  Story 0021 created both for the shared WYSIWYG editor, and each currently holds a single top-level
  `wysiwyg` key. This story **appends one sibling top-level key**, `searchable_multi_select`, beside it
  — never touching or nesting under `wysiwyg`. (Both files carry a header comment from 0021 naming this
  story by number and saying exactly that: whichever of 0021/0022 reached Phase 3 first creates the
  paths, the other extends them under its own top-level key. 0021 got there first.) The new key holds
  `components.searchable_multi_select.*`: empty state, truncation notice, chip-remove `aria-label`,
  unavailable-option explanation, plus the two D12 keys `unresolvable_selection` — the field error —
  and `unavailable_option` — the generic chip label that stands in for the raw id, and the
  chip-area `aria-label` from D14. English source strings; both files stay key-for-key identical per
  [naming.md](../../../docs/conventions/naming.md#translation-keys).
- `tests/Support/Livewire/ArrayMultiSelectOptionsResolver.php` — **new.** The test-only resolver
  (see "Test double" below).
- `tests/Feature/Components/SearchableMultiSelectTest.php` — **new.** Component-level tests.
- `tests/Unit/Actions/NormalizeForSearchTest.php` — **new (2026-08-18, D13).** The normalizer is a
  pure function, so it gets a unit test rather than a feature test — `tests/Unit/` already mirrors
  `app/` structure. This is the one place the exact folding table in D13 is asserted, so every other
  story can depend on it instead of re-testing accent handling.
- `tests/Browser/Components/SearchableMultiSelectTest.php` — **new.** Browser tests, in the mirrored
  subfolder the convention calls for (`playwright-setup.md` records that `tests/Browser/UsersIndexTest.php`
  sits flat as a one-off departure — do not copy that).

**Directory justification.** `app/Livewire/Components/` is a **subfolder of the existing
`app/Livewire/` base directory**, exactly as `Actions/`, `Settings/` and `Users/` already are — the
"don't create new base folders without approval" rule in
[base-standards.md](../../../docs/conventions/base-standards.md#directory-structure) governs new
top-level directories under `app/`, which this is not. `Components` was chosen over `Shared`/`UI` to
mirror `resources/views/components/`, giving `app/Livewire/Components/` = reusable Livewire-backed UI
against `resources/views/components/` = reusable plain Blade. **This was raised as OQ-3 and is now
resolved** — not by this story, but by story 0021 shipping `App\Livewire\Components\WysiwygEditor`
there first; the folder is an established convention in
[base-standards.md](../../../docs/conventions/base-standards.md#directory-structure), so this story
follows it rather than setting it. See the Resolved-questions section.

**View resolution.** The [`Index`-in-a-subfolder exception](../../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
does **not** apply — it keys off the class literally being named `Index`. `SearchableMultiSelect`
follows the ordinary kebab-case mirror rule:
`App\Livewire\Components\SearchableMultiSelect` → `resources/views/livewire/components/searchable-multi-select.blade.php`.
Confirm against Livewire's `Finder` in Phase 3 before relying on it.

**Explicitly NOT this story:**

| File / concern | Owner |
|---|---|
| Any `MultiSelectOptionsResolver` implementation over real data | 0027 (Sales Regions), 0034 (geography) |
| The "selecting Spain surfaces its fiscal sub-entries" rule | 0027 |
| By-level grouping *content* and the search query/index behind it | 0034 |
| The geography catalog table, fixture and seeder | 0032 |
| `routes/web.php`, `resources/views/layouts/**`, any existing screen | untouched — this component has no route and no sidebar entry |
| Catching `UnresolvedSelectionException` in a real save path | 0026 (first), then 0027 / 0034 |
| Any *call site* of `NormalizeForSearch` outside this component | 0026, 0032, 0033, 0034 |

> **Ownership note added 2026-08-18.** `App\Actions\NormalizeForSearch` and
> `App\Exceptions\UnresolvedSelectionException` are **created and unit-tested by this story** even
> though neither is part of the widget itself, precisely so no sibling story creates a second copy.
> 0026, 0032, 0033 and 0034 **consume** them and must not redefine, wrap, or fork either one; a
> second normalizer anywhere in the tree is the exact failure D13 exists to prevent. If a consumer
> finds the behaviour wrong, that is an amendment to D13 here — a one-file change with a shared unit
> test — not a local override.

## Tests to perform

Level chosen per [coverage-policy.md](../../../docs/testing/frontend/coverage-policy.md): browser tests
only where the DOM/JS round-trip is itself the risk. That balance tilts further toward browser tests
than any previous story here, because this is the first widget in the codebase whose *input mechanism*
(debounced `wire:model.live` into a JS-driven result list) is hand-assembled rather than a plain form
control.

**Component tests** (`tests/Feature/Components/SearchableMultiSelectTest.php`):

- [ ] Typing a term narrows `$results` to matches.
- [ ] Below `minSearchLength`, no resolver call is made and `$results` stays empty.
- [ ] At exactly `minSearchLength`, the resolver **is** called (boundary — off-by-one is the realistic bug).
- [ ] A whitespace-only term is treated as empty (pending OQ-5).
- [ ] Selecting an offered option updates both `$selected` and `$selectedOptions`.
- [ ] Removing a chip removes the id from both.
- [ ] An already-selected option is **excluded** from `$results` when the search term matches it (D11).
- [ ] Re-selecting an already-selected id via a direct method call produces no duplicate — the defensive guard D11 leaves in place for the `/livewire/update` entry point.
- [ ] A no-match search leaves `$results` empty and renders the empty state.
- [ ] Exactly `resultLimit` matches → **no** truncation row.
- [ ] `resultLimit + 1` fetched → trimmed to `resultLimit`, truncation row shown.
- [ ] With several options already selected, a broad search still yields a **full** `resultLimit` list — proves D9's over-fetch, and fails if the exclusion is applied to a plain `resultLimit + 1` fetch.
- [ ] The resolver is always called with `resultLimit + 1 + count($selected)` — bounded, never unbounded (asserted via the double's call log).
- [ ] A 10,000-row fixture still yields exactly `resultLimit` rendered options (the real "it scales" assertion — see below).
- [ ] Preselected ids passed to `mount()` render as chips, sourced from `resolveSelected()`.
- [ ] **Changing the search term does not change `$selectedOptions`** — the D2 chip-label regression, asserted directly.
- [ ] Grouped results render under their group heading; `group: null` results render with no heading.
- [ ] A `disabled: true` option cannot be selected server-side.
- [ ] With `$disabled` true, `updatedSearch()`, `selectOption()` and `removeOption()` all no-op.
- [ ] `set('optionResolver', ...)` / `set('selectedOptions', ...)` / `set('results', ...)` / `set('unresolvableSelected', ...)` / `set('maxChipAreaHeight', ...)` each throw `CannotUpdateLockedPropertyException` — a regression-proof against someone dropping a `#[Locked]`.
- [ ] `mount()` rejects a class-string that does not implement `MultiSelectOptionsResolver`.

**D12 — rejecting unresolvable ids** (these replace the superseded silent-drop test):

- [ ] **Tampered `$selected`:** an injected id the resolver cannot vouch for is **kept** in `$selected`, listed in `$unresolvableSelected`, and raises a validation error on `$field` — it is *not* dropped. This is the direct regression-proof against the old D4 behaviour, and it must fail if anyone reinstates the drop.
- [ ] A preselected id that no longer resolves at `mount()` renders as an unavailable chip and puts the field in an error state, rather than throwing out of `mount()` and 500-ing the host screen.
- [ ] The unavailable chip's rendered text is the localized generic label and **does not contain the raw id** — asserted with an id chosen to be conspicuous in the DOM.
- [ ] `assertSelectionResolvable()` throws `ValidationException` (not a bare `UnresolvedSelectionException`) when any selected id is unresolvable, and returns cleanly when all resolve.
- [ ] Removing the unavailable chip clears both `$unresolvableSelected` and the field error, and `assertSelectionResolvable()` then passes.
- [ ] `UnresolvedSelectionException::$missingIds` carries **every** unresolvable id, not just the first — a resolver failing three ids reports three.
- [ ] A resolver that (wrongly) returns a short array instead of throwing is still caught: the shell treats any requested id absent from the return as unresolvable. Defence in depth against a consumer implementing the interface incorrectly.
- [ ] `UnresolvedSelectionException` has **no** `render()` method — an architecture-style assertion, so nobody "helpfully" adds one and turns a validation concern into a 403/500.

**D13 — normalized search** (component-level; the folding table itself is unit-tested separately):

- [ ] A search term written without accents matches an accented option label (`nino` finds `Niño`).
- [ ] A search term in a different case matches (`NIÑO`, `niño`, `Nino` all find the same option).
- [ ] The resolver receives an **already-normalized** term — asserted from the double's call log, which is the only way to prove the shell normalizes rather than each resolver doing it.
- [ ] A whitespace-only term normalizes to empty, so no resolver call is made (this is OQ-5, now covered by D13 rather than left implicit).
- [ ] `minSearchLength` is measured against the **normalized** term: with `minSearchLength = 2`, `"  ñ  "` performs no search, and `" ñu "` does.

**D14 — bounded chip area:**

- [ ] Omitting `maxChipAreaHeight` renders the chip container with **no** `style` attribute and no overflow class — the additive-change proof, and the test that fails if the default stops being unbounded.
- [ ] Setting `maxChipAreaHeight = '12rem'` renders `max-height: 12rem` plus the overflow class on the chip container, with its accessible name present.
- [ ] `mount()` throws `InvalidArgumentException` for a value outside the allow-list — cover a bare number (`'12'`), a disallowed unit (`'12%'`), and a style-injection attempt (`'1rem; background: url(x)'`).

**Normalizer unit tests** (`tests/Unit/Actions/NormalizeForSearchTest.php`):

- [ ] The exact D13 folding table as a dataset: `Niño → nino`, `A Coruña → a coruna`, `Almuñécar → almunecar`, `ß → ss`, `ç → c`, `Ölüdeniz → oludeniz`.
- [ ] `café☕ → cafe` and `Ñ东 → n` — the two cases that pin `Str::ascii()` over `Str::transliterate()`. These are the tests that fail if someone swaps the function, and the comment must say so.
- [ ] Leading/trailing whitespace is trimmed and internal runs collapse: `"  A   Coruña  " → "a coruna"`.
- [ ] Idempotence: `f(f(x)) === f(x)` across the whole dataset.
- [ ] The empty string and a whitespace-only string both normalize to `''`.
- [ ] Output is always lowercase ASCII — asserted as a property over the dataset, not per-case.

**Browser tests** (`tests/Browser/Components/SearchableMultiSelectTest.php`):

- [ ] Real typing into the search input narrows the rendered list — proves `wire:model.live.debounce` is actually wired, which no component test can show.
- [ ] Debounce coalesces a rapid keystroke burst into **fewer resolver calls than keystrokes**, asserted from the double's call log rather than from wall-clock timing (non-tautological, non-flaky).
- [ ] A real click on a result option adds a visible chip **and removes that option from the visible result list** (D11, through a real re-render rather than a recomputed array).
- [ ] A real click on a chip's remove control removes it, and the option becomes offerable again on the next matching search.
- [ ] The empty state is **visible** on a no-match search (not merely present in the DOM).
- [ ] Preselected values render as chips **on first paint**, before any interaction — the closest structural analogue to the errors-log hydration bug.
- [ ] A selected chip keeps its label after an unrelated search (the D2 trap, through real hydration).
- [ ] An option whose **id contains a quote character** is selectable without a JS error — the only test that can catch a missing `@js()`, since a component test never reaches a JS evaluator.
- [ ] A `disabled: true` option shows its explanation on hover — mirroring the Users screen's disabled-row-action test, including its "hover the wrapper, not the `pointer-events-none` child" workaround.
- [ ] **Typing an unaccented term surfaces the accented option in the real rendered list** (D13) — the round-trip proof that normalization survives `wire:model.live`'s encoding, which no component test covers.
- [ ] **A selection holding an unresolvable id renders the unavailable chip and the field error on first paint** (D12), and the host page's save control refuses with a visible validation message rather than saving a subset.
- [ ] **With `maxChipAreaHeight` set, the chip container's rendered `scrollHeight` exceeds its `clientHeight` while the field's own height stays bounded** (D14) — measured from the real layout, since "it scrolls" is not observable in markup. The same assertion inverted (no overflow, container grows) for the unbounded default.
- [ ] `->assertNoJavaScriptErrors()` in **every** browser test (mandatory per [test-quality-checklist.md](../../../docs/testing/frontend/test-quality-checklist.md)).

**Not tested, deliberately:** dark-mode rendering. Per
[test-quality-checklist.md](../../../docs/testing/frontend/test-quality-checklist.md), visual regression
earns its place only where visual correctness is the requirement; nothing in §2.2/§2.3/§2.4 asks for
dark-mode-specific behaviour here, and this is a shell, not a designed page.

> **This does not contradict the "renders correctly in light and dark mode" acceptance criterion** —
> the two are about different things and both stand. That AC is a **design/manual-review** expectation:
> build the component out of Flux components and Tailwind `dark:` variants exactly as every other
> screen in this app already does, and confirm it by looking at it, the same way every previous UI
> story here has. What is excluded is only an **automated visual-regression test** asserting it, which
> this codebase has never had for any screen and which would be the wrong first place to introduce one.

### Test double — how this is testable with no consumer

Neither consumer exists, so there is no model or dataset to search. Verified facts:
`composer.json`'s `autoload-dev` maps `"Tests\\": "tests/"`, and **no** `tests/Support/` or
`tests/Fixtures/` directory exists yet.

- **`Tests\Support\Livewire\ArrayMultiSelectOptionsResolver`** — one generic double implementing the
  interface over a constructor-injected in-memory array, plus a **call log** so tests can assert
  "called N times, with limit X" — and, since D13, "called with *this exact normalized term*" —
  without any timing assertion. The same class serves the flat 250-row shape and the grouped
  geography shape. Per D12 it is a **conforming** implementation: its `resolveSelected()` throws
  `UnresolvedSelectionException` for unknown ids rather than returning a short array, and it carries
  a deliberate opt-in "misbehaving" mode that returns short instead, used only by the defence-in-depth
  test above. Its rows include accented labels (`Niño`, `A Coruña`) so the normalization tests have
  something real to fold against.
- **Wiring:** bind the configured instance per test with
  `$this->app->instance(ArrayMultiSelectOptionsResolver::class, new ArrayMultiSelectOptionsResolver($rows))`,
  then pass its class-string as `optionResolver`. Standard container swap; no change to the contract.
- **A browser test needs a real URL**, which a Livewire component alone is not. Register a host view
  and route **entirely inside `tests/`** — a fixture Blade file under `tests/Browser/Components/fixtures/`
  registered via `View::addLocation(...)`, and a `Route::get('/__test/searchable-multi-select', ...)`
  declared in the test file itself. This touches no application file, so it stays inside this story's
  scope boundary. **Since D12 the host page also needs a save control** — a trivial parent Livewire
  component whose `save()` calls `assertSelectionResolvable()` and otherwise does nothing. It persists
  nothing and models no domain; it exists so the "refused outright" scenario can be exercised against
  a real button rather than asserted in the abstract.

> **The honest limitation, stated rather than buried.** A green suite against an isolated host page
> proves the shell's own mechanics work *in a vacuum*. It does **not** prove the component survives its
> real embedding — inside a `flux:modal` (z-index, overflow, scroll context), competing with sibling
> `wire:model` fields for the same round trip, or fed a real Eloquent-backed resolver. Closing that gap
> here would mean inventing embedding scenarios for screens nobody has designed. Instead it is a
> **forward dependency**: 0027 and 0034 each carry a Definition-of-Done item to add one browser test
> exercising this component in its real embedding with its real resolver.

### On "it scales to 8,100 rows"

Proving real-world throughput is **not this story's job** — that would be a load test in a browser
test's costume, and it would be asserting behaviour owned by 0032's index and 0034's query, neither of
which exists. Per [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md)'s proportionality
rule, what this story asserts instead is the **bounded contract** that makes 8,100 rows safe: a result
set capped at `resultLimit` regardless of dataset size, a resolver never asked for more than
`resultLimit + 1 + count($selected)`, and one resolver call per settled search rather than one per
keystroke. All three are deterministic and non-flaky.

## Expected outcome

A consumer story can drop `<livewire:components.searchable-multi-select :option-resolver="..."
wire:model="..." />` into any form, implement one small resolver class, and get: a search box that
queries the server after a 300 ms pause, a dropdown of at most 20 matches (grouped by level when the
resolver supplies groups), an explicit "no results" state, a "narrow your search" notice when more
matches exist, removable chips for every selection whose labels stay correct no matter what the search
box currently holds, and a selection array the parent reads through plain `wire:model`. Values already
selected drop out of the result list and live only as chips until removed. Options the resolver marks
unavailable are visible but unselectable with an explanation. Searching is **accent- and
case-insensitive** through one shared normalizer, so `nino` finds `Niño` identically in every screen
that uses the widget. An id the resolver no longer vouches for is **flagged in the field and refuses
the save**, so a selection is never quietly persisted a value short. Consumers that need it can bound
the chip area to a fixed height and let it scroll, and consumers that don't get today's unbounded
behaviour with byte-identical markup. The widget produces no JavaScript console errors, and works
identically over 250 rows and over 8,100.

## Acceptance criteria

- [ ] A single shared Livewire component provides the searchable multi-select; neither consumer story needs its own copy of the widget.
- [ ] Search is **server-side filtered** — the full option list is never sent to the browser.
- [ ] Typing performs a debounced search (`debounceMs`, default 300) rather than one request per keystroke.
- [ ] Below `minSearchLength`, no search is performed and no options are offered.
- [ ] Results are capped at `resultLimit` (default 20); when more matches exist, a "narrow your search" notice is shown.
- [ ] Selecting an option adds a removable chip; removing the chip deselects it and makes the option offerable again.
- [ ] An already-selected option is **excluded from the result list entirely** (not shown disabled), while a further selection of the same id via a direct call remains a server-side no-op.
- [ ] A search that matches nothing shows an explicit empty state, not an empty list.
- [ ] Chips render correct labels for preselected values on mount, and **keep them** when the current search no longer matches those values.
- [ ] Results are rendered grouped when the resolver supplies a `group`, and flat when it does not.
- [ ] Options marked `disabled` by the resolver are offered but not selectable, with the reason explained.
- [ ] A `disabled` field performs no search and changes no selection, enforced **server-side**, not only in markup.
- [ ] Selection state carries **ids only**; no label is ever read off the client-writable `$selected`.
- [ ] Any id `resolveSelected()` cannot vouch for is **reported and refused, never dropped**: it is kept in the selection, shown as an unavailable chip carrying a generic localized label (never the raw id), raises a field-level validation error, and makes `assertSelectionResolvable()` throw `ValidationException` so the consumer's save is refused in its entirety.
- [ ] `resolveSelected()` is contractually **total** — one entry per requested id or `UnresolvedSelectionException` carrying every unresolvable id; the shell additionally treats a short return as unresolvable.
- [ ] Search terms are folded through **one shared `App\Actions\NormalizeForSearch`** (trim → lower → `Str::ascii` → collapse whitespace); matching is accent- and case-insensitive, `minSearchLength` is measured against the normalized term, and no lowercasing/accent-stripping is reimplemented anywhere else in a search path.
- [ ] `maxChipAreaHeight` bounds the chip area and makes it scroll when set, and changes nothing at all when omitted — no `style` attribute, no overflow class, markup identical to before the prop existed.
- [ ] `$optionResolver`, `$selectedOptions`, `$results`, `$unresolvableSelected` and `$maxChipAreaHeight` are `#[Locked]`; `mount()` rejects a class-string not implementing the interface, and a `maxChipAreaHeight` outside the CSS-length allow-list.
- [ ] Every id interpolated into a `wire:*` argument goes through `@js()`.
- [ ] The component performs no authorization of its own; that responsibility sits with the resolver and is documented as such.
- [ ] All copy is English source through `__()` in `lang/en/components.php`, mirrored key-for-key in `lang/es/components.php`; no hardcoded literals.
- [ ] The component renders correctly in light and dark mode (a **design/manual-review** expectation —
  Flux components and Tailwind `dark:` variants used throughout, consistent with every other screen in
  this app — deliberately **not** covered by an automated visual-regression test; see "Not tested,
  deliberately" in the Tests section, which this does not contradict) and produces no JavaScript
  console errors (this half **is** automated, via `->assertNoJavaScriptErrors()` in every browser test).
- [ ] The contract in **Documented functional decisions** is implemented exactly as written, so 0027 and 0034 can bind to it unchanged.

## Dependencies, risks, open questions

**Dependencies: none.** This is new shared infrastructure. It is the *blocker* for 0027 and 0034, and
should be sequenced before both per [workflow.md](../../../docs/workflow.md)'s task-ordering rule
(a dependency's number is lower than its dependents' — 0022 < 0027 < 0034 already holds).

**Risks.**

- **Contract churn is now a *four*-story change.** Once 0026/0027/0034 are written against D1–D5, D11
  and D12–D14, altering the interface means reopening all four. The mechanism itself is settled (OQ-1,
  resolved), so the residual risk is narrower: treat any Phase 3 pressure to widen `search()`'s
  signature — an exclusion list, a group filter, a cursor — as a contract change needing the same
  multi-story review, not as an implementation detail. D11 deliberately absorbs the first such
  pressure in the shell instead. **The 2026-08-18 amendments are themselves an instance of this
  risk materializing**, and they are the reason D12/D13/D14 are written as prescriptively as they are:
  0026, 0032, 0033 and 0034 are being amended in parallel to bind to these exact names.
- **D12 changes a behaviour previous reviewers approved as a security fail-safe.** The silent drop was
  deliberate and defensible; the amendment does not make it wrong so much as *insufficient*, and the
  struck-through paragraph in D4 exists so nobody "restores" it in Phase 3 believing they are fixing a
  regression. The tests carry the same warning: the tampered-`$selected` test is explicitly the
  regression-proof against reinstating the drop.
- **Two of the new classes live outside this story's own namespace** (`App\Actions\NormalizeForSearch`,
  `App\Exceptions\UnresolvedSelectionException`) and have consumers before they have a second author.
  The mitigation is that both are tiny, pure and unit-tested here; the failure mode to watch for in
  review is a sibling story quietly adding its own normalizer instead of injecting this one.
- **First hand-assembled composite widget in this codebase.** Every previous screen used a plain form
  control. Flux Free gives no combobox, so `flux:dropdown` + `flux:menu` is being used for something
  it was not designed for (search results, not a static action menu). Expect Phase 3 to hit at least
  one Flux/Blaze rendering surprise of the kind already recorded twice in
  [errors-log.md](../../../docs/errors-log.md).
- **The isolated-host test gap** described above — mitigated, not eliminated, by the forward
  dependency on 0027/0034.

### Resolved questions

- **OQ-1 — resolver mechanism. Resolved 2026-08-18: the class-string resolver (D1c) is confirmed.**
  A consumer implements `MultiSelectOptionsResolver`'s `search()` + `resolveSelected()` and passes the
  class-string; the abstract-extends-a-base-component alternative (D1a) is rejected. **This is now the
  locked contract for 0027 and 0034 to bind against** — see D1–D5. No blocking questions remain.
- **OQ-4 — already-selected options and a selection cap. Resolved 2026-08-18, in two parts.**
  (a) A selected option is **excluded from the results entirely**, not shown disabled — see the new
  **D11**, the amended Gherkin scenario, and the over-fetch it forces on D9. (b) **No `maxSelections`
  cap is known or needed**, so the prop is not shipped at all rather than shipped unused; the first
  consumer story that needs one adds it as a purely additive change (see the note under D5).
- **OQ-5 — whitespace-only terms. Resolved 2026-08-18 by D13**, and more broadly than it was asked:
  the term is no longer merely trimmed, it is run through `App\Actions\NormalizeForSearch`, which
  trims, lowercases, accent-folds and collapses internal whitespace. A whitespace-only term normalizes
  to `''` and performs no search, and `minSearchLength` is measured against the normalized string.
- **Disposal of an unresolvable id. Resolved 2026-08-18 by D12** (this question was never numbered —
  it was settled inside D4 at Phase 1 and reopened by 0026's debate). Rejected outright with a
  validation error; the previous silent drop is struck through in D4, not deleted.
- **Bounded chip display. Resolved 2026-08-18 by D14** (raised by 0034's debate): the additive
  `maxChipAreaHeight` prop, defaulting to `null` = unbounded = today's behaviour.
- **OQ-3 — `app/Livewire/Components/` as the home for shared Livewire components. Resolved
  2026-08-31, and not by this story.** It was raised here because it would set the precedent for every
  future shared component; **story 0021 got there first** and shipped `App\Livewire\Components\WysiwygEditor`
  into exactly that folder, which is now documented in
  [base-standards.md](../../../docs/conventions/base-standards.md#directory-structure) as an established
  subfolder ("not a module area like the others — it holds reusable, content-agnostic components a
  screen embeds"). So this story **follows** the convention rather than establishing it, and the
  "Directory justification" paragraph above is retained as background, not as an open decision. The
  rejection of a new `app/Contracts/` base folder for the D1 interface stands unchanged — it does not
  exist, and creating it would need approval.

**Still-open questions.** None are blocking — all can be settled during Phase 3.

- **OQ-2 — `minSearchLength` default, and whether an empty focused field browses.** Recommend
  **"must type first"** for both consumers **(recommended)**: for 8,100 municipios an unfiltered
  starting set has no meaningful relevance order and defeats the reason §2.4 rejects a client-side
  filter; 250 regions could tolerate browsing, but a shared default should favour the consumer where
  the wrong choice is actively harmful. A later `browseOnFocus` prop can add it per-consumer without
  changing the contract.
- ~~**OQ-3 — `app/Livewire/Components/` as the home for shared Livewire components.**~~ **Moved to
  Resolved 2026-08-31** — settled independently by story 0021 shipping there first. See above.
- ~~**OQ-5 — whitespace-only terms.**~~ **Moved to Resolved 2026-08-18** — subsumed by D13's
  normalizer. See above.
- **OQ-6 — `#[Modelable]` + `#[Locked]` interaction, to verify in Phase 3, not decide now.**
  `#[Locked]` is enforced by `BaseLocked::update()` on the client-initiated-update path, while
  `#[Modelable]`'s server-side sync is a raw property write — so parent↔child propagation is
  unaffected either way. What was **not** traced is whether `#[Modelable]`'s client-side Alpine
  entanglement syncs back through the same hook a bare `wire:model` would. **This design does not
  depend on the answer** (D4 deliberately does not lock `$selected`), but Phase 3 should confirm it
  empirically before anyone "tidies up" by adding a lock there.
- **OQ-7 — ARIA scope.** Recommend keeping full WAI-ARIA 1.2 `combobox` conformance
  (`role="combobox"`, `aria-expanded`, `aria-activedescendant`, roving tabindex) **out of scope
  (recommended)**: nothing in the PRD states an accessibility requirement, `flux:menu` is a menu
  widget rather than a listbox, and forcing combobox semantics onto it is materially more Alpine work
  than this story implies. In scope instead: real `flux:label` association, `aria-label` on each chip's
  remove control (matching the Users screen's icon-only-button convention), keyboard operability via
  Flux's own menu primitive, and an `aria-live="polite"` result-count/empty-state announcement. If a
  concrete WCAG obligation exists, say so now — it changes the estimate materially. **Added
  2026-08-18:** D14's bounded chip area joins that in-scope list (`role="group"` + `aria-label` on the
  scrollable container, so it is reachable and named), and D12's field-level error must be announced
  through the same `aria-live` region rather than only rendered.

  > **Phase 6 honesty note (2026-08-31): two of the four in-scope items above shipped, two did not,**
  > and D10's forced deviation is the reason for both misses. "Keyboard operability via Flux's own
  > menu primitive" assumed the results dropdown would render inside a real `<ui-menu>` (per the
  > original D9/D10 text) — D10's manual popover keeps `flux:menu.item` as a plain presentational
  > component with no `ui-menu` custom element wrapping it at all, per its own Phase 6 correction, so
  > the roving-tabindex/arrow-key navigation a real `ui-menu` would have supplied for free was never
  > delivered; the only keyboard operability that shipped is `x-on:keydown.escape.window` (close on
  > Escape) and native tab order through the input and any focusable chip controls. The
  > `aria-live="polite"` result-count/empty-state/D12-error announcement region was never added at
  > all — `resources/views/livewire/components/searchable-multi-select.blade.php` renders no
  > `aria-live` region anywhere. **What did ship**, verified against the real view: real `flux:label`
  > association on the search input, `aria-label` on every chip's `flux:badge.close` remove control
  > (both the resolved and the D12 unavailable-chip variant), and D14's `role="group"` + `aria-label`
  > on the bounded chip container. Recorded as a real gap rather than closed silently — if arrow-key
  > navigation or a live-region announcement becomes a concrete requirement, it is new work against
  > this component, not a bug in what shipped against an item this decision had already scoped out.
- **OQ-8 — `app/Support/` as a future home for `NormalizeForSearch`.** Recommend **leaving it at
  `App\Actions\NormalizeForSearch` for now (recommended)**, per D13's reasoning: it needs no approval,
  it is exactly what base-standards prescribes for an action belonging to no domain, and it keeps this
  story unblocked. Raised only because "an invokable action that is really a pure function" is a
  slightly loose fit, and because a second such helper would make the case for an approved
  `app/Support/` base folder. If the product owner would rather approve `app/Support/` now, say so
  before Phase 3 — after 0026/0032/0033/0034 have call sites it is a five-file rename instead of one.
  Non-blocking either way; the *behaviour* in D13 is fixed regardless of where the class lives.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met

## Provenance
Written in Phase 1 (Three Amigos) on 2026-08-17 for Epic 2, from
[§2.2](../../../docs/PRD/PRD.md#22-products), [§2.3](../../../docs/PRD/PRD.md#23-shared-media-gallery) (read
for contrast) and the [§2.4 Shipping](../../../docs/PRD/PRD.md#24-shipping) section rewritten the same
day. Participants: `product-owner`, `frontend-expert`, `frontend-qa` — classified **frontend** per
[workflow.md](../../../docs/workflow.md)'s task-classification rule, with `database-expert` deliberately
**not** convened since the story creates no table, migration or query. No application code was written
in this phase.

**Amended 2026-08-18 by `product-owner`**, folding in two confirmed user decisions that surfaced in
*other* stories' Phase 1 debates and landed on this shared contract:

1. **From 0026's debate — D12.** Silent-dropping an unresolvable id is rejected as product behaviour;
   a save carrying one is now refused in its entirety with a validation error. This **supersedes** the
   corresponding rule in D4, which is struck through rather than removed, and retires one Gherkin
   scenario in favour of three.
2. **From 0034's debate — D13 and D14.** One centralized search-term normalizer
   (`App\Actions\NormalizeForSearch`) that every consumer in the ecosystem must share, and a purely
   additive `maxChipAreaHeight` prop for a bounded, scrollable chip area.

Consequential edits in the same pass: D1's interface docblocks, D5's public surface, D6's lock
reasoning, D9's `updatedSearch()`, the files list, the test lists, the acceptance criteria, the
expected outcome, and the resolution of OQ-5 (plus the new, non-blocking OQ-8). Still no application
code written. 0026, 0032, 0033 and 0034 are being amended in parallel to consume these decisions;
this file is the authoritative source for all three contracts.

**Amended 2026-08-31 by `product-owner` — a real Phase 2 INVEST loop, not a polish pass.**
`code-reviewer`'s Phase 2 validation returned **FAIL** with two blocking defects, both corrected here
before Phase 3: **B1**, D9's `updatedSearch()` was written with a method-injected
`NormalizeForSearch` parameter, which Livewire never resolves for an `updated<Property>()` lifecycle
hook (it invokes those with fixed parameters), so the snippet and its cited convention are replaced
with the `app()` carve-out that actually governs the case; and **B2**, `lang/{en,es}/components.php`
were listed as **new** files when story 0021 already created both — this story extends them with a
sibling top-level key. Three non-blocking notes were applied in the same pass: the fourth D8 Flux/Blaze
trap from the 2026-08-31 errors-log entry, a reconciliation of the light/dark acceptance criterion with
the deliberate no-visual-regression decision, and OQ-3 moved to Resolved now that story 0021 has
already established `app/Livewire/Components/`. No decision (D1–D14) changed meaning.

**Amended 2026-08-31 by `docs-keeper` — Phase 6 documentation sync, after Phase 3–5 shipped real code
against this spec.** Two decisions this file states as *what Phase 1 specified* turned out not to
survive Phase 3 intact, and both are corrected in place with the original text left standing as the
historical record: **D9**'s `wire:model.live.debounce.{$debounceMs}ms` mechanism could never compile
(Blade's `ComponentTagCompiler` cannot interpolate a value into a component tag's attribute *name*),
so the shipped debounce is the same hand-rolled Alpine `setTimeout()` + `$wire.set()` mechanism
`wysiwyg-editor.blade.php` already established; and **D10**'s `flux:dropdown` mechanism throws on
every page load against a `flux:input` trigger (`ui-dropdown`'s `querySelector("button")` requirement
is unmet), so the shipped popover is the identical `x-show`/`x-cloak`/`click.outside` shape D10's own
sibling decision already used once before, in `wysiwyg-editor.blade.php`'s link popover. Both are now
durable rules in [conventions/base-standards.md](../../../docs/conventions/base-standards.md#directory-structure)
and (for the debounce case) [errors-log.md](../../../docs/errors-log.md). **OQ-7's ARIA scope is also
corrected from an intent statement to a shipped-state record**: real `flux:label` association and
per-chip `aria-label`s (including D14's chip-area `role="group"`) shipped as specified, but keyboard
arrow-key/roving-tabindex navigation and the `aria-live="polite"` announcement region did not — both
casualties of D10's forced popover deviation, which left `flux:menu.item` a plain presentational
component with no real `ui-menu` behind it. No test, no acceptance criterion and no `D1`–`D14` decision
itself changed meaning in this pass — only the prose describing two mechanisms and one scope item was
brought into agreement with the code that actually shipped.
