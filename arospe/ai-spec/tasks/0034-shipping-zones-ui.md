# [0034] Shipping zones — UI (list, editor, geography picker)

## Description
Build the **shipping-zone management screen**: a list of the admin-created zones, a zone editor that
creates / renames / deletes a zone, and — inside that editor — the geography-assignment picker that
lets an administrator add and remove seeded geography-catalog entries at country, comunidad autónoma
or municipio level. The picker is [0022](0022-searchable-multi-select-component.md)'s shared
searchable multi-select bound to this story's own geography resolver; every mutation goes through
[0033](0033-shipping-zones-backend.md)'s four domain actions. This story ships the first — and
currently only — caller of `ShippingZonePolicy`.

## Type
frontend | fullstack (related_task_id: **0033**, the paired backend story) | includes
database-expert: **no**

This story creates no table, no migration and no query of its own beyond the resolver's two bounded
reads over an existing, indexed table (`geography_entries`, owned by
[0032](0032-shipping-geography-catalog-seed.md)), so `database-expert` is deliberately **not**
convened, per [workflow.md](../../docs/workflow.md#task-classification-rule).

> **Scope was widened, deliberately and on record.** Earlier Epic 2 documents describe 0034 as *"the
> zone geography picker"* ([0032](0032-shipping-geography-catalog-seed.md)) or as owning *"its
> resolver, the by-level grouping content, and the search query/index"*
> ([0022](0022-searchable-multi-select-component.md)). 0033's **OQ-C** flagged that those are not the
> same scope, that **0035 already owns `/shipping`**, and recommended widening 0034 to the whole zone
> screen rather than inserting a new story between the two. **That recommendation is accepted here**,
> which also closes 0033's OQ-C and names this story as the consumer 0033's Definition-of-Done
> hand-off requires. A picker with no screen to live in cannot be delivered independently.

**PRD coverage.** [§2.4 Shipping](../../docs/PRD/PRD.md#24-shipping), rewritten 2026-08-17. This
story owns the **rendered UI** for: *Create a shipping zone*, *Rename a shipping zone*, *Delete a
shipping zone no rate rule references*, the *Assign geography entries to a zone at any level*
`Scenario Outline` (all three levels), *The geography picker filters as the administrator searches*,
*The geography picker shows an empty state when a search matches nothing*, *The geography catalog
does not allow inventing new entries* (the UI half — no affordance to add a catalog entry), and
*Creating a shipping zone leaves the Sales Region catalog untouched*.

It underwrites these acceptance criteria from that section: AC 4 (zones are a full admin-CRUD
catalog), AC 6 (a zone bundles entries at any level), AC 7 (the picker is a searchable,
server-side-filtered multi-select with a "no results" empty state), and the UI half of AC 5
(administrators cannot add catalog entries).

**Boundaries with the sibling Epic 2 stories** — referenced, never redefined here:

- **0022 — the shared multi-select.** Owns `App\Livewire\Components\SearchableMultiSelect`, its view,
  `lang/*/components.php`, and the `MultiSelectOptionsResolver` interface. This story **implements**
  that interface and **consumes** the component; it does not modify either — with the single,
  explicitly-negotiated exception in **OQ-A**.
- **0032 — the geography catalog.** Owns `geography_entries`, `GeographyEntry`, `GeographyLevel`,
  the factory, the fixtures and the seeder. This story only **reads** it.
- **0033 — zones backend.** Owns `shipping_zones`, the pivot, `ShippingZone`,
  `ShippingZoneValidationRules`, the four actions, `ShippingZonePolicy`, and the `zones.*` domain
  keys in `lang/*/shipping.php`.
- **0035 — carriers.** Owns `/shipping`, `App\Livewire\Shipping\Index`,
  `resources/views/livewire/shipping.blade.php`, and **creates** `lang/en|es/shipping.php`.
  **Nothing 0035 owns is edited by this story** except that one shared lang pair (see the hazard
  note under *Files*).
- **0036 — rate rules.** Owns `shipping_rates`, the in-use delete count guard, and the
  `zones.delete_blocked` translation key. This story renders that guard's message **without knowing
  it** (see **D-6**).

## Documented functional decisions

Thirteen decisions this debate takes. **D-1 through D-4** are the ones no upstream story settled;
**D-5 onward** apply or narrow an upstream decision to this screen. **D-11, D-12 and D-13 are dated
amendments recorded 2026-08-18**, after this story's own debate, carrying three confirmed user
decisions from the wider Epic 2 Phase 1 round; each names the earlier reasoning it supersedes rather
than deleting it. Nothing here is to be reopened in Phase 3 except on new evidence. Genuinely
unresolved items are in **Open questions**, not here.

---

### D-1 — The screen is its own route, `shipping/zones`. Not a tab inside `/shipping`.

Adopted exactly as [0033 **D-8**](0033-shipping-zones-backend.md) prescribes if a screen is built:
class `App\Livewire\Shipping\Zones` → view `resources/views/livewire/shipping/zones.blade.php`,
route `Route::livewire('shipping/zones', ...)->middleware(['can:shipping.view'])->name('shipping.zones.index')`.

The [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
does **not** apply — it keys off the class literally being named `Index`, and this one is `Zones`. So
the ordinary kebab-case mirror rule holds and the view sits one level deeper than 0035's flat
`livewire/shipping.blade.php`. That asymmetry is expected, and `naming.md` already documents it.

**Why not a tab inside `/shipping`.** Three reasons, in increasing force:

1. **It would mean editing files 0035 owns** — `App\Livewire\Shipping\Index` and
   `resources/views/livewire/shipping.blade.php` — which is the shared-file hazard
   [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule) exists to prevent, on
   a file that 0036 is *also* queued to rewrite for the grouped rate table.
2. **It would make one component own three unrelated concerns** — carrier toggles (0035), zone CRUD
   (here) and rate rules (0036) — each with its own modal, its own validation surface and its own
   permission checks.
3. **`can:`, never `permission:`.** Whichever route it is, the gate must be Laravel's `can:` — the
   rule [api/routes.md](../../docs/api/routes.md#usersindex--the-first-permission-gated-route)
   records, because Livewire 4's `PersistentMiddleware` allow-list carries Laravel's `Authorize` but
   not Spatie's middleware. A tab does not change this; a separate route makes it a fresh, explicit
   decision rather than an inherited one.

**Navigation.** `resources/views/layouts/app/sidebar.blade.php` currently renders exactly two items,
Dashboard and Users, and **0035 adds none for `/shipping`** — verified by reading both files. This
story adds one ungated `flux:sidebar.item` to `shipping.zones.index`, in the same deliberately
cosmetic style `api/routes.md` records for the Users link (access is still refused by `can:` on the
route and re-checked in the component; permission-aware navigation arrives with the sidebar-gating
story **0013**). See the shared-file hazard under *Files* — 0013 will restructure this file.

### D-2 — The create modal takes a **name only**; geography is assigned in the edit modal.

The zone editor is one `flux:modal` used in two modes, matching
[`App\Livewire\Users\Index`](../../app/Livewire/Users/Index.php)'s `openCreateModal()` /
`openEditModal()` shape exactly. In **create** mode it renders the name field alone; in **edit** mode
it renders the name field **and** the geography picker.

Four reasons, and the fourth is the one that decides it:

1. **It is the PRD's own split.** *"Create a shipping zone"* is name-only; *"Assign geography entries
   to a zone at any level"* opens with the precondition *"editing the shipping zone 'Zona Norte'"* —
   a zone that already exists.
2. **It is the action shapes' split.** `CreateShippingZone::__invoke(string $name)` takes a name and
   nothing else; `SyncShippingZoneGeography` is a separate action. 0033 **D-4** made that separation
   deliberate.
3. **0033 D-5 names create-then-populate "the real flow"** and makes a zero-entry zone valid
   precisely so this works.
4. **It keeps the create path free of a second authorization question.** A create modal carrying the
   picker would have `save()` call `CreateShippingZone` *and* `SyncShippingZoneGeography` behind a
   single `Gate::authorize('create', …)` — and a sync is semantically an *update*. With a name-only
   create, the create path never syncs, so `create` gates create and `update` gates rename+sync, with
   no ability having to be stretched to cover an operation it does not name.

**Consequence, stated rather than discovered:** a newly created zone appears in the list covering
nothing, and the administrator opens it again to add coverage. That is two user actions, and it is
the correct two.

### D-3 — A zone's member set is rendered as a **bounded, scrollable chip area** inside the picker, plus a read-only per-level coverage summary beside it.

**This is the decision the brief flagged as unspecified, and it is the highest-stakes UX call in the
story.** A zone may hold one entry or — up to 0033's `max:500` validation ceiling — several hundred
municipios. Four renderings were weighed:

| Option | Verdict |
| --- | --- |
| **(a) 0022's chip row exactly as-is, unbounded** | **Rejected.** At the `max:500` ceiling this is an unusable wall of chips that pushes the modal's own controls off-screen, and it puts up to 500 chip nodes into the DOM diff of every `/livewire/update` round trip the search box triggers. |
| **(b) Bounded, scrollable chip area + read-only per-level summary** | **RECOMMENDED — adopted.** See below. |
| **(c) A separate members table below the picker, with per-row remove** | **Rejected**, and this is the interesting rejection: it would put the selection in **two idioms with two remove controls** — exactly what 0022's **D11** eliminated when it chose to exclude already-selected options from the result list so "the widget never shows the same value twice in two different idioms". Reintroducing that here would undo a decision taken one story earlier. |
| **(d) Collapsed-by-level summary, expanding on demand** | **Rejected.** It hides the selection behind an extra interaction for the *common* case — a zone of three municipios — in order to serve the rare 500-entry case. Optimising the rare case at the expense of the common one is the wrong trade for a management screen. |

**What (b) means concretely.** The chip row stays 0022's — one idiom, one remove control per member,
D11 intact — but it is height-capped and scrolls internally, so the modal's height is bounded by
design rather than by how much coverage the zone happens to have. Alongside it, this story renders a
**read-only** summary line derived from the same selection: `País 1 · Comunidad autónoma 2 ·
Municipio 147`, plus a total. The summary carries **no remove control** — it is information, not a
second affordance — which is what keeps it from becoming option (c) by accident.

**The cost, stated openly: the height cap is a change to a component this story does not own.**
0022's view renders the chip container, so a `max-h-*` / `overflow-y-auto` on it cannot be applied
from the parent — wrapping `<livewire:components.searchable-multi-select>` in a scrolling `div`
would scroll the search input out of view along with the chips, which is worse than the problem.
This is therefore a **purely additive prop on 0022**, and it was raised as **OQ-A** rather than
assumed. 0022's own D5 already establishes the precedent for exactly this shape of change ("the
first consumer story that genuinely needs one adds the prop then, which is a purely additive change
to this contract and breaks no existing binding" — written there about `maxSelections`).

> **OQ-A is RESOLVED (2026-08-18): the prop is being added to 0022.** This story consumes 0022's
> new `#[Locked] public ?string $maxChipAreaHeight = null;` prop (0022 **D14**) — a CSS length
> string such as `'12rem'` — and does **not** define a bounding mechanism of its own. See **D-11**.
>
> ~~**If OQ-A is refused**, the fallback is (a) plus a hard lower cap enforced in this story's own
> validation (e.g. `max:100` rather than 0033's `max:500`).~~ **Superseded 2026-08-18** — the
> fallback is moot now that the prop is confirmed, and it is kept here only so the rejected branch
> stays on record. This story adds **no** `max:` cap of its own; 0033's `max:500` stands unchanged.

### D-4 — The geography resolver runs **three bounded per-level queries**, not one open `LIKE`.

`app/Actions/Shipping/SearchGeographyEntries.php` implements 0022's `MultiSelectOptionsResolver`.
Its `search()` issues **one query per level** — `WHERE level = ? AND normalized_name LIKE 'term%'
LIMIT ?` — and merges the three result sets.

**This is not a style choice; it is the only shape that uses 0032's index.** 0032 ships
`INDEX(level, normalized_name)` and states outright that it is built for "the three bounded per-level
queries story 0034 will run". `level` is the **leading** column, so a query with no equality
predicate on `level` cannot range-scan `normalized_name` at all and degrades to a full scan of
~8,300 rows on every keystroke-burst — reintroducing the non-scaling behaviour §2.4 rejects, just
moved server-side.

Four consequences, each load-bearing:

- **The search term is folded by `App\Actions\NormalizeForSearch`** — the invokable class at
  `app/Actions/NormalizeForSearch.php`, signature `__invoke(string $value): string` (trim →
  lowercase → ASCII-fold → collapse whitespace), created by 0022 (**D13**) — **the very same utility
  0032 uses to compute `normalized_name` at seed time**. This story defines **no normalization rule of
  its own** and must never inline `Str::lower()` / `iconv()` / a local accent map. If the two folded
  even slightly differently, searching "Gijón" would silently return nothing while searching "gijon"
  worked — a failure with no error anywhere. Resolved as a project-wide alignment; see **D-13** and
  **R-1**.
- **`LIKE 'term%'`, prefix-anchored — not `'%term%'`.** A leading wildcard cannot use a B-tree index
  either, which would defeat the whole point. Accepted product consequence: searching "lava" does
  not find "Torrelavega". The PRD's own example types `"Torrelav"`, a prefix, and 0022's truncation
  notice ("narrow your search") covers the rest. Named as **OQ-B** because it is a real, if minor,
  product limitation and not merely an implementation detail.
- **Merge order is broad-to-narrow** (País → Comunidad autónoma → Municipio), then truncate to the
  limit 0022 asked for. Broader entries are far fewer and more likely to be what an administrator
  building a zone means. **Accepted edge case:** a term matching more countries than the limit would
  starve municipios entirely. Real but rare; the alternative (proportional per-level allocation) is
  named in **OQ-B** and is a Phase 3 tuning change, not a contract change.
- **Each of the three queries receives the full `$limit`**, not `$limit / 3`. Dividing it means a
  term matching 20 municipios and no countries returns ~7 results. The cost is at most 3× rows
  fetched, every one of them index-bounded.

`resolveSelected(array $ids)` is a single `whereKey()` read with **no** term and **no** level filter,
mapped to the same option shape. Per 0022's amended contract it is a **total function**: it returns
one option per requested id, or throws `App\Exceptions\UnresolvedSelectionException` (carrying
`public readonly array $missingIds`) when it cannot resolve every id it was given.

> ~~Ids it does not return are dropped by 0022's D4 reconciliation — which is what makes a re-seeded
> catalog, a deleted row and a tampered id array all fail the same safe way.~~ **Superseded
> 2026-08-18.** 0022's amended contract **rejects** rather than drops: an id the resolver cannot
> vouch for makes `resolveSelected()` throw `UnresolvedSelectionException`, which the consumer
> converts into a `ValidationException` that fails the whole save. Display-time reconciliation may
> still render only what `resolveSelected()` vouches for, but a **save** never silently proceeds on
> a subset. See **D-12**.

**The option shape**, per 0022's D3 `array{id: string, label: string, group: string|null, disabled: bool}`:

| Field | Value | Note |
| --- | --- | --- |
| `id` | `(string) $entry->id` | `geography_entries.id` is **bigint** (0032's confirmed UUID-policy exception), and 0022's contract requires a string. The cast back to `int` happens in 0033's `SyncShippingZoneGeography`, which already "casts and de-duplicates before `sync()`". See **R-4**. |
| `label` | country/community: `name`. **municipio: `"{name} ({province_name})"`** | 0032 kept `province_name` denormalized on municipio rows and said it was "available if a future story needs to disambiguate two same-named municipios in different provinces". **This is that story** — a picker listing three identical "Villanueva" entries with no way to tell them apart is the concrete failure it was kept for. |
| `group` | `$entry->level->label()` | 0032's `GeographyLevel` mirrors `UserStatus` including a `label()` reading from `lang/`, so the group headings are translated for free and satisfy the PRD's "grouped by level". |
| `disabled` | **always `false`** | Stated explicitly so nobody invents a rule. In particular, marking an entry unavailable because another zone already covers it would silently contradict 0033 **D-2**. |

### D-5 — Row actions gate on **screen-level** capability flags, not per-row `Gate::allows()`.

The Users screen computes `canEdit`/`canDelete` **per row** because `UserPolicy` carries genuine
per-target rules (Super Admin protection, trashed-target refusal). `ShippingZonePolicy` carries
**none** — 0033 **D-9** ships four uniform abilities, and **D-1** deliberately puts the in-use delete
guard in the *action* rather than the policy, so it is not a per-target policy rule either. Three
`#[Computed]` flags evaluated once per render therefore say exactly as much as N × 3
`Gate::allows()` calls, and say it more honestly.

**What is reused unchanged is the disabled-branch *markup*** — two full `@if`/`@else` branches with
an explicit `<flux:tooltip …>` wrapper on the disabled branch, and `cursor-not-allowed!` on that
**wrapper** rather than on the button. Both are non-obvious and both are already recorded in
[errors-log.md](../../docs/errors-log.md): a Flux prop that decides whether a wrapper renders counts
as *present* under `livewire/blaze` whenever the attribute is written on the tag, and
`disabled:pointer-events-none` takes a disabled button out of hit-testing so a cursor rule on it is
never rendered. Do not rediscover either.

**Revisit trigger, recorded:** if any future story gives `ShippingZonePolicy` a per-target rule, this
must move back to per-row evaluation. The disabled-branch markup is identical either way, so that
change is confined to where the flag is computed.

### D-6 — The delete modal renders **whatever message the action raises**, and this story adds no `zones.delete_blocked` key.

Deleting opens a confirmation modal naming the target — the Users screen's `#[Locked]
$deletingUserName` pattern. `deleteZone()` calls `DeleteShippingZone` and lets any
`ValidationException` surface into an **error region rendered inside the delete modal**, which stays
open so the administrator can read it.

Today that exception never fires: 0033 ships the action as a plain `->delete()` and defers the
count guard to 0036. **The UI is built message-agnostic on purpose** — it binds to the error bag,
not to a string — so when 0036 adds the guard and its `zones.delete_blocked` key, the message
appears with **no change to this story's markup**. 0033 **D-1** explicitly forbids creating that key
before the rule that emits it exists; that prohibition binds this story too. Adding a `:count`
string here whose wording no product owner has approved would be dead copy in two locales.

### D-7 — Save validates everything **first**, then invokes at most two actions.

The edit path's `save()` must apply a rename *and* a coverage replace, which 0033 deliberately kept
as two actions. To keep a partial failure from being the normal case, `save()` validates the full
form — the name rules and `geographyEntryIdsRules()`, both from 0033's
`ShippingZoneValidationRules` — **before** calling either action, then calls `RenameShippingZone`
followed by `SyncShippingZoneGeography`.

**That "validate everything first" ordering is exactly what makes D-12's reject-invalid-ids rule
enforceable**: the existence check over `geographyEntryIds` runs before any action is invoked, so a
stale or invalid id aborts the submit with **neither** the rename **nor** the sync having happened.
There is no branch in which a subset is saved.

**The residual window is named rather than hidden:** after validation passes, a concurrent
name collision can still surface as 0033's `23000`→`ValidationException` conversion, in which case
the rename fails and the coverage is left unchanged. That is recoverable and visible (the modal
stays open with the error), which is the right failure. Wrapping both actions in a component-level
transaction was considered and **rejected**: 0033 chose the action as the unit of atomicity, and a
component that quietly widens that boundary makes the actions' own guarantees untrue for one caller
and not the others.

### D-8 — The list shows **one** coverage count per zone, loaded with `withCount`.

`loadZones()` reads `ShippingZone::withCount('geographyEntries')->orderBy('name')->get()` — one
query, no N+1. The list column shows the total ("147 entries"), and a zone with zero shows a neutral
em dash, not a warning.

Per-level counts in the **list** were rejected: they need three constrained aggregate queries
joining `geography_entries` for a breakdown the PRD never asks for at list level. The per-level
breakdown belongs in the editor (**D-3**), where the administrator is actually working on coverage.

**On flagging empty zones:** 0033 **D-5** permits the screen to warn about a zero-entry zone. This
story renders a **neutral** marker rather than a warning badge, because the consequence of an empty
zone (a rate rule matching no destination) is an Epic 3 pricing concern and styling it as an error
here asserts a rule nobody has agreed. Raised as **OQ-C**, as it is a one-line change either way.

### D-9 — The overlap informational hint is **out of scope**.

0033 **D-2** permits — and pointedly does not require — an informational notice such as *"Gijón is
already covered by Zona Norte"*, naming it "explicitly not a constraint" only so nobody builds it as
a blocking rule. It is not built here: it costs an extra query per save for a nicety the PRD never
asks for, and every line of it is a line a reviewer might later mistake for validation. **What this
story does own is the negative**: assigning an entry another zone already covers must produce **no
error and no warning at all**, and that has a test.

### D-10 — Every id interpolated into a `wire:*` argument goes through `@js()`.

Mandatory, not stylistic, per
[blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md): a value
in a `wire:` directive lands in a JavaScript evaluator where Blade's HTML escaping is undone by the
parser. It matters more on this screen than on the Users screen for the reason 0022's D8 already
gives — geography ids originate in an **external INE/ISO fixture** rather than being UUIDs by
construction, so "the id is structurally safe" is an assumption about a file nobody has sourced yet
(0032's OQ-1). Zone ids are UUIDs and get the same treatment, without exception.

---

### D-11 — The bounded chip area uses **0022's `maxChipAreaHeight` prop**. (recorded 2026-08-18 — resolves OQ-A)

**Confirmed by the user, 2026-08-18.** 0022 is being amended to add exactly the purely additive prop
**D-3** asked for: a way to bound and internally scroll the selected-chips display area so a zone
with many geography members does not grow the editor unboundedly. Its final shape, owned by 0022
(**D14**), is `#[Locked] public ?string $maxChipAreaHeight = null;` — a CSS length string (e.g.
`'12rem'`), validated in 0022's `mount()` against `/^\d+(\.\d+)?(rem|em|px|vh)$/`, where `null` (the
default) means unbounded and renders byte-identical markup to today: no `style` attribute and no
overflow class. This story **consumes** that prop and defines **no** chip-bounding mechanism of its
own.

What this settles, concretely:

- **D-3's option (b) is now fully buildable as designed.** The chip row stays 0022's single idiom
  with one remove control per member (0022's D11 intact); only its container is height-capped, by a
  prop 0022 owns rather than by markup this story would have had to reach into.
- **The refused-branch fallback is dead.** ~~Option (a) plus a hard `max:100` cap owned by this
  story~~ is **superseded** — this story invents no product restriction, and 0033's `max:500`
  ceiling stands unchanged.
- **The `<livewire:components.searchable-multi-select>` embed under *Files* gains that one prop**
  (`:max-chip-area-height="'12rem'"`) and nothing else. The rest of the integration surface is
  unchanged.
- **It is still a shared-component change, so the sequencing note stands:** 0022 must land before
  this story. It is now a landed decision rather than an open negotiation, so it no longer needs a
  negotiation room.

### D-12 — A save carrying **any** stale or invalid geography id is **rejected entirely**, never silently reduced to a valid subset. (recorded 2026-08-18)

**Confirmed by the user, 2026-08-18**, as an amendment to 0022's resolver-based option contract, and
adopted verbatim here for zone-geography membership.

**The rule.** When `save()` validates `geographyEntryIds` and **one or more** ids do not resolve to a
live `geography_entries` row, the **whole save fails** with a clear validation error against the
picker's field. No rename is applied, no `sync()` runs, the modal stays open with the error visible,
and the zone's coverage is left exactly as it was.

**The mechanism, as 0022 finalized it.** `resolveSelected()` is a **total function**: it either
returns one option per requested id or throws `App\Exceptions\UnresolvedSelectionException`, which
carries `public readonly array $missingIds` (every unresolvable id, not just the first). A consumer
is required to call `assertSelectionResolvable()` — 0022's helper, which converts that exception
into a `ValidationException` — **or** `resolveSelected()` itself, in its save path. This story's
`save()` does exactly that, before invoking any action (**D-7**). Catching
`UnresolvedSelectionException` and `array_intersect()`-ing the survivors is explicitly forbidden.

**What this supersedes.** ~~**D-4**'s closing line — "Ids it does not return are dropped by 0022's D4
reconciliation — which is what makes a re-seeded catalog, a deleted row and a tampered id array all
fail the same safe way"~~ — is **superseded**. The *observation* was right (all three inputs fail
identically); the *behaviour* has changed from **drop** to **reject**. Silently dropping is now
explicitly wrong here, and a Phase 3 implementation that filters invalid ids out and saves the
remainder fails this story.

**Why reject is the better rule on this screen specifically** — three reasons, the third decisive:

1. **A silent drop is silent data loss.** An administrator saving a 40-municipio zone against a
   re-seeded catalog would get a zone quietly covering 31 of them, with the screen reporting success.
   The gap then surfaces much later as a rate rule matching no destination — an Epic 3 symptom with
   an Epic 2 cause.
2. **It matches this story's own failure philosophy.** **D-7** already argues that a visible,
   modal-stays-open, nothing-was-written failure is the right failure; a partial write is precisely
   the shape D-7 works to keep from being the normal case.
3. **It removes a reject/drop split across 0022's two consumers.** One contract, one behaviour, one
   thing for a reviewer to check. A shared component whose id-handling differs per consumer is the
   kind of divergence **R-1** exists to warn about, in a different register.

**Scope boundary, so this is not over-read.** Rejection is a **save-time** rule. Nothing here obliges
the editor to render an unresolvable id as a chip: display may still show only what
`resolveSelected()` vouches for (0022's reconciliation). The invariant this story owns is narrower
and absolute — **no submit ever writes a subset of what was submitted.**

**Validation home.** Two layers, neither of them new code this story invents: 0022's
`assertSelectionResolvable()` (the component-side enforcement described above), and 0033's
`geographyEntryIdsRules()` (an `exists`-shaped rule over `geography_entries`), which this story
already consumes and does not redefine — see the consumer-side note in **R-7**.

### D-13 — Picker search uses **`App\Actions\NormalizeForSearch`**. (recorded 2026-08-18 — resolves R-1)

**Confirmed by the user, 2026-08-18.** 0022 is being amended to introduce **one centralized
text-normalizer**, `App\Actions\NormalizeForSearch` — an invokable class at
`app/Actions/NormalizeForSearch.php` with the signature `__invoke(string $value): string`, folding
trim → lowercase → ASCII-fold → collapse whitespace — and 0026, 0032 and 0033 are being aligned to
call that same class. This story calls it too and **describes no normalization logic of its own**.

~~**D-4**'s original bullet described the folding rule inline ("lowercased, accent-folded to ASCII")
and pinned the outcome on 0033's **OQ-A** being settled.~~ **Superseded 2026-08-18**: the rule is no
longer this story's to state, and OQ-A is no longer this story's dependency to wait on. The
resolver's search-term folding and 0032's `normalized_name` computation are now **the same function
call**, which makes divergence structurally impossible rather than merely tested against.

Two things that do **not** change:

- **The accent test stays.** "gijon" must find "Gijón". It no longer guards against two hand-written
  normalisers drifting — it now guards against a *caller* forgetting to route through the utility at
  all, which is the remaining live failure mode and still fails silently.
- **The prefix-anchored `LIKE 'term%'` shape (D-4, OQ-B) is untouched.** Normalization and matching
  are separate concerns; centralizing the former says nothing about the latter.

**Stories aligned on `App\Actions\NormalizeForSearch`: 0022 (owner), 0026, 0032, 0033 and this story
(0034)** — recorded so a future reader sees a project-wide alignment rather than a local convenience.

## Gherkin

Every scenario opens with a named business-role actor and carries a single `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3, and stays
out of DOM/column/status-code detail per rule 2.

```gherkin
Feature: Shipping zone management screen

  Scenario: The zone list shows the zones an administrator has created
    Given a shipping administrator, with the shipping zones "Zona Norte" and "Baleares"
    When they open the shipping zones screen
    Then both zones are listed, each showing how many geography entries it covers

  Scenario: An administrator with no zones yet is shown an empty state
    Given a shipping administrator, with no shipping zone created yet
    When they open the shipping zones screen
    Then an empty state invites them to create their first zone

  Scenario: Create a shipping zone
    Given a shipping administrator on the shipping zones screen
    When they create a shipping zone named "Zona Norte"
    Then "Zona Norte" appears in the shipping zone list

  Scenario: A newly created zone covers nothing yet
    Given a shipping administrator who has just created the shipping zone "Zona Norte"
    When they look at it in the shipping zone list
    Then it is shown as covering no geography entry, and this is not reported as an error

  Scenario: A blank zone name is refused on the screen
    Given a shipping administrator creating a shipping zone
    When they submit the form with a name that is only whitespace
    Then the form reports the problem against the name field and no zone is created

  Scenario: A duplicate zone name is refused on the screen
    Given a shipping administrator, with an existing shipping zone "Península"
    When they submit a new shipping zone named "peninsula"
    Then the form reports the problem against the name field and no second zone is created

  Scenario: Rename a shipping zone
    Given a shipping administrator editing the shipping zone "Zona Norte"
    When they rename it to "Cornisa Cantábrica"
    Then the zone is listed under its new name

  Scenario: A zone may be saved without changing its name
    Given a shipping administrator editing the shipping zone "Zona Norte"
    When they save it again under the name "Zona Norte"
    Then the change is accepted and the zone keeps its name and its coverage

  Scenario: Delete a shipping zone no rate rule references
    Given a shipping administrator, with a shipping zone "Zona Norte" referenced by no rate rule
    When they confirm deleting "Zona Norte"
    Then it no longer appears in the shipping zone list

  Scenario: Deleting a zone asks for confirmation first
    Given a shipping administrator, with a shipping zone "Zona Norte"
    When they choose to delete "Zona Norte"
    Then they are asked to confirm, and the zone is still listed until they do

  Scenario: An administrator can abandon a deletion
    Given a shipping administrator who has been asked to confirm deleting "Zona Norte"
    When they cancel the confirmation
    Then "Zona Norte" is still listed

Feature: Assigning geography to a shipping zone

  Scenario Outline: Assign a geography entry to a zone at any level
    Given a shipping administrator editing the shipping zone "Zona Norte",
      with the geography catalog seeded
    When they add <entry> to the zone
    Then the zone is shown as covering <entry>

    Examples:
      | entry                              |
      | the country "Francia"              |
      | the autonomous community "Galicia" |
      | the municipio "Gijón"              |

  Scenario: A single zone may mix geography levels
    Given a shipping administrator editing the shipping zone "Zona Norte",
      which already covers the country "Francia"
    When they add the municipio "Gijón" to the zone
    Then the zone is shown as covering both, each under its own level

  Scenario: Remove an assigned geography entry from a zone
    Given a shipping administrator editing the shipping zone "Zona Norte",
      which covers the municipio "Gijón"
    When they remove "Gijón" from the zone
    Then the zone no longer covers "Gijón"

  Scenario: A zone's coverage may be emptied entirely
    Given a shipping administrator editing the shipping zone "Zona Norte",
      which covers the municipio "Gijón"
    When they save the zone with no geography entry selected
    Then the zone is shown as covering nothing, and the zone itself is still listed

  Scenario: An entry another zone already covers may still be added
    Given a shipping administrator editing the shipping zone "Zona Norte",
      with the shipping zone "Asturias Centro" already covering the municipio "Gijón"
    When they add "Gijón" to "Zona Norte" as well
    Then the assignment is accepted with no warning, and both zones cover "Gijón"

  Scenario: A save naming a geography entry that no longer exists is refused outright
    Given a shipping administrator editing the shipping zone "Zona Norte",
      whose open editor names a catalog entry that has since been removed
    When they save the zone
    Then the save is refused with an error on the geography field, and the zone's coverage
      is left exactly as it was

  Scenario: A save mixing valid and stale geography entries saves none of them
    Given a shipping administrator editing the shipping zone "Zona Norte",
      having selected the municipio "Gijón" alongside a catalog entry that no longer exists
    When they save the zone
    Then the save is refused, and "Gijón" is not added to the zone either

  Scenario: A refused geography save leaves the zone's name unchanged too
    Given a shipping administrator editing the shipping zone "Zona Norte",
      who has typed the new name "Cornisa Cantábrica" and selected a stale catalog entry
    When they save the zone
    Then the save is refused and the zone is still listed as "Zona Norte"

  Scenario: The geography picker filters as the administrator searches
    Given a shipping administrator editing a shipping zone, with the geography catalog seeded
    When they type "Torrelav" into the zone's geography picker
    Then only catalog entries matching that text are offered, grouped by level

  Scenario: The geography picker shows an empty state when a search matches nothing
    Given a shipping administrator editing a shipping zone
    When they search the geography picker for a term that matches no catalog entry
    Then a "no results" empty state is shown instead of a list of entries

  Scenario: An entry already assigned is no longer offered among the search results
    Given a shipping administrator editing the shipping zone "Zona Norte",
      which already covers the municipio "Gijón"
    When they search the geography picker for "Gijón"
    Then it is not offered among the results, appearing only among the zone's coverage

  Scenario: Two municipios of the same name are told apart by their province
    Given a shipping administrator editing a shipping zone, with the geography catalog seeded
    When they search the geography picker for a municipio name shared by two provinces
    Then each offered entry is shown with the province that distinguishes it

  Scenario: The geography catalog does not allow inventing new entries
    Given a shipping administrator editing a shipping zone
    When they search the geography picker for a place the catalog does not contain
    Then they are offered no way to add it to the catalog, only a "no results" empty state

Feature: Shipping zone screen access

  Scenario: A user without the shipping view permission cannot reach the screen
    Given a signed-in user who does not hold the "view shipping" permission
    When they request the shipping zones screen
    Then access is refused

  Scenario: A user without the shipping create permission cannot create a zone
    Given a signed-in user who does not hold the "create shipping" permission
    When they attempt to create a shipping zone from the screen
    Then the attempt is refused and no zone is created

  Scenario: A user without the shipping edit permission cannot change a zone
    Given a signed-in user who does not hold the "edit shipping" permission
    When they attempt to save a change to a shipping zone
    Then the attempt is refused and the zone is unchanged

  Scenario: A user without the shipping delete permission cannot delete a zone
    Given a signed-in user who does not hold the "delete shipping" permission
    When they attempt to delete a shipping zone
    Then the attempt is refused and the zone still exists

  Scenario: A user who may not change zones is not offered the controls
    Given a signed-in user who holds "view shipping" but not "edit shipping"
    When they open the shipping zones screen
    Then the zone editing controls are shown as unavailable rather than merely failing on use
```

> **Two PRD scenarios are represented here in a deliberately weakened form, and it is better to say
> so than to let the wording imply coverage they do not have.**
>
> - *"The geography catalog does not allow inventing new entries"* — the version above asserts the
>   absence of an affordance in the one place such an affordance conventionally appears (a
>   combobox's empty state, as a "create ‘…’" row). That is falsifiable, but it is the **weaker**
>   half. The stronger half is 0033's backend assertion that no `geography_entries` row is created
>   as a side effect of a save, which fails against a `firstOrCreate`-shaped implementation. Both
>   are needed; neither substitutes for the other.
> - *"Creating a shipping zone leaves the Sales Region catalog untouched"* has **no scenario above
>   at all**, because at the UI layer it would be a ghost scenario
>   ([rule 6](../../docs/testing/frontend/gherkin-guidelines.md#6-no-ghost-scenarios)): `sales_regions`
>   is story 0016's and has no screen. It survives as a named skip — see *Tests to perform*.
>
> **The in-use delete hard-block has no scenario either.** It is confirmed as a decision (0033
> **D-1**) but unimplementable until `shipping_rates` exists (0036). Writing a scenario for it here
> would describe behaviour no code can exhibit. What this story owes it is the message-agnostic
> rendering in **D-6** and one named skip.

## Files to create/modify

### Application

- `app/Livewire/Shipping/Zones.php` — **new.** `#[Title('Shipping zones')]`, `use
  ShippingZoneValidationRules;` (0033's trait). Public surface:

  ```php
  /** @var array<int, array{id: string, name: string, entriesCount: int}> */
  public array $zones = [];

  #[Locked] public ?string $editingZoneId = null;      // server-authoritative; see below
  public bool   $showModal = false;
  public string $name = '';

  /**
   * The picker's wire:model target. Bare ids only, never labels, never null.
   *
   * Deliberately NOT #[Locked]: it is the #[Modelable] binding surface, and locking it
   * would break the binding (0022 D4). Its safety comes from server-side validation --
   * 0033's geographyEntryIdsRules() bounds and existence-checks it, and 0022's
   * assertSelectionResolvable() turns an UnresolvedSelectionException into a
   * ValidationException -- with the pivot FK behind both. Nothing is ever read off it
   * except ids. Any id that fails to resolve REJECTS the whole save; it is never
   * filtered out and saved around (D-12).
   *
   * @var array<int, string>
   */
  public array $geographyEntryIds = [];

  public bool $showDeleteModal = false;
  #[Locked] public ?string $deletingZoneId = null;
  #[Locked] public string  $deletingZoneName = '';
  ```

  Methods: `mount()`, `openCreateModal()`, `openEditModal(string $zoneId)`, `save(...)`,
  `closeModal()`, `confirmDelete(string $zoneId)`, `deleteZone(DeleteShippingZone $delete)`,
  `closeDeleteModal()`, `loadZones()`, and `#[Computed]` `canCreate()` / `canEdit()` /
  `canDelete()` (**D-5**) plus `coverageSummary()` (**D-3**).

  **Authorization, which is the point of this file existing** — 0033 **D-9** ships
  `ShippingZonePolicy` with *zero* call sites, so nothing could regress if it were wrong until now:

  - `mount()` → `Gate::authorize('viewAny', ShippingZone::class)`.
  - `save()` → `Gate::authorize('create', ShippingZone::class)` on the create branch,
    `Gate::authorize('update', $zone)` on the edit branch, as the **first statement** of each branch.
  - `deleteZone()` → `Gate::authorize('delete', $zone)` as its first statement.
  - Route middleware is **not** what protects these. `verified` and Spatie's middleware are absent
    from Livewire's `PersistentMiddleware` allow-list, so `/livewire/update` reaches every method
    directly — [livewire-authorization.md](../../docs/security/livewire-authorization.md).
  - **`SyncShippingZoneGeography` is called only from inside the already-authorized edit branch of
    `save()`.** 0033's hand-off names it "the method most likely to ship ungated because it does not
    look like saving"; keeping it off the public method surface entirely is the structural answer,
    and there is a test asserting no ungated path reaches it.
  - **`$editingZoneId` is `#[Locked]` *and* re-read from the database in `save()`.** 0033's hand-off
    requires the id feeding `Rule::unique()->ignore()` to stay server-authoritative, per
    [livewire-authorization.md](../../docs/security/livewire-authorization.md#locked-is-what-makes-ruleunique-ignore-safe-here).
    A client-writable id there is a rule that can be pointed at someone else's row.

  Actions are injected **per method** as trailing container-resolved parameters, matching
  [code-style.md](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method).

- `app/Actions/Shipping/SearchGeographyEntries.php` — **new.** Implements
  `App\Livewire\Components\MultiSelectOptionsResolver` (0022's interface). Placement mirrors 0022's
  own worked example for the sibling consumer (`\App\Actions\Products\SearchSalesRegions::class`),
  and `app/Actions/Shipping/` already exists as 0033's and 0035's home. Full behaviour in **D-4**.

- `resources/views/livewire/shipping/zones.blade.php` — **new.** Header with the zone total and a
  primary "New zone" button; a `flux:table` of zones (name, coverage count, actions) with icon-only
  row actions carrying `aria-label` plus `data-test="edit-zone-{id}"` / `data-test="delete-zone-{id}"`
  hooks **present on both the enabled and the disabled branch** (the Users-screen convention, so a
  browser test selects a row action the same way regardless); the create/edit `flux:modal` (name
  field always, plus the geography picker and the coverage summary in edit mode); the
  delete-confirmation `flux:modal` naming the target and carrying the error region from **D-6**; and
  an explicit empty state. Both modals' inner content wrapped in `@if ($showModal)` /
  `@if ($showDeleteModal)` so only one "Cancel" control is ever in the DOM — the Users-screen rule.

  The picker embed is the whole of 0022's integration surface:

  ```blade
  <livewire:components.searchable-multi-select
      :option-resolver="\App\Actions\Shipping\SearchGeographyEntries::class"
      wire:model="geographyEntryIds"
      field="geographyEntryIds"
      :label="__('shipping.zones.editor.geography_label')"
      :disabled="! $this->canEdit"
      {{-- 0022's D14 bounded-chip prop: a CSS length string, validated there against
           /^\d+(\.\d+)?(rem|em|px|vh)$/. Omitting it means unbounded. (D-11) --}}
      :max-chip-area-height="'12rem'"
  />
  ```

  That `maxChipAreaHeight` prop is the **only** addition to the embed (**D-11**), and it is a prop
  0022 ships rather than anything this story defines.

- `routes/web.php` — **modify.** One route inside the existing `auth` + `verified` group, per
  **D-1**. `can:shipping.view`, never `permission:` — the route file already carries an inline
  comment saying why on `users.index`; add the same reference rather than restating it.

- `resources/views/layouts/app/sidebar.blade.php` — **modify.** One `flux:sidebar.item` to
  `shipping.zones.index`, ungated, matching the Users item exactly (**D-1**).

- `lang/en/shipping.php` + `lang/es/shipping.php` — **modify.** A `zones.index.*` / `zones.editor.*`
  group for screen copy: headings, the "New zone" button, column labels, the coverage summary and
  its per-level counts, both empty states, the delete-confirmation copy, the row-action
  `aria-label`s, and the "action not allowed" tooltip. Key-for-key identical across both locales,
  English source, per [naming.md](../../docs/conventions/naming.md#translation-keys).
  **No `zones.delete_blocked` key** (**D-6**).

  > **Triple shared-file hazard.** `lang/en|es/shipping.php` is **created by 0035**, **modified by
  > 0033** (the `zones.*` domain keys) and **modified again here**. Per
  > [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent
  > File-Ownership Rule, these three stories must never be implemented by concurrently-dispatched
  > agents. Sequential only: 0035 → 0033 → 0034.
  >
  > A second, smaller one: `resources/views/layouts/app/sidebar.blade.php` is also story **0013**'s
  > (sidebar module gating). Whichever lands second inherits the other's version of the file.

### Not touched by this story

`App\Livewire\Components\SearchableMultiSelect`, its view, `lang/*/components.php` and the
`MultiSelectOptionsResolver` interface (0022 — including the `maxChipAreaHeight` prop of **D-11**,
`App\Actions\NormalizeForSearch` of **D-13**, and `App\Exceptions\UnresolvedSelectionException` with
its `assertSelectionResolvable()` helper of **D-12**, all of which **0022 itself creates**; this
story only consumes them and edits nothing of 0022's). `geography_entries`, its
model, factory, enum, fixtures and seeder (0032). `shipping_zones`, the pivot, `ShippingZone`, the
four actions, `ShippingZoneValidationRules`, `ShippingZonePolicy` (0033). `/shipping`,
`App\Livewire\Shipping\Index`, `resources/views/livewire/shipping.blade.php`,
`ToggleShippingCarrier` (0035). `shipping_rates` and everything about rate rules (0036). No
migration, no seeder, no policy, and **no new permission** — `shipping.view|create|edit|delete`
already exist in `RolePermissionSeeder::MODULES` × `ACTIONS`.

## Tests to perform

Level chosen per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md): browser tests
only where the DOM/JS round-trip is itself the risk; everything else at the cheaper Livewire
component level. **Nothing here re-tests 0022's shell mechanics, 0032's catalog contents, or 0033's
action semantics** — those have owners, and two owners for one fact means both go stale
independently.

**Test-data strategy — never seed the geography catalog.** 0032's real INE fixture does not exist
yet (its **OQ-1**), and 0033 already established the rule: ~8,300 rows inside a `RefreshDatabase`
transaction on every test buys no behavioural signal. Build a handful of rows with
`GeographyEntryFactory`'s `country()` / `community()` / `municipality()` states, with **explicit
names** taken from the PRD (Gijón, Avilés, Siero, Asturias, Galicia, Francia, España) for
traceability — never looked up from a seeded catalog. Parentage only where it is the assertion.

**How "search narrows over a large catalog" is tested without a large catalog.** It is not, and
pretending otherwise would be a load test in a functional test's costume. What is asserted instead
is the **bounded contract** that makes a large catalog safe, exactly as 0022 argued for itself: the
resolver never returns more than the limit it was given; it issues one query per level with an
equality predicate on `level` (so 0032's index is usable); and it is never called with an unbounded
limit. Real latency against realistic volume is a Phase 3 manual check once 0032's fixture exists,
not a Pest assertion.

### `tests/Feature/Shipping/ZonesTest.php` — component level

- [ ] The screen lists zones with their coverage counts, ordered by name.
- [ ] Creating a zone with a valid name adds it to the list, and the modal closes.
- [ ] A whitespace-only name is refused with the error on the **`name`** field; no zone is created.
- [ ] A duplicate name is refused with the error on `name` — as a **dataset** over an exact,
      case-only and accent-only duplicate of an existing "Península". This is the UI-side proof that
      0033's normalised comparison actually reaches the form; without it, CI's SQLite accepts what
      MySQL rejects (0033 **D-6**).
- [ ] Renaming a zone updates the list.
- [ ] **Saving a zone under its own unchanged name succeeds**, and the zone is genuinely unchanged.
      0033 names the missing `->ignore()` as its single most likely bug; at this layer the equivalent
      failure is the form not threading `$editingZoneId` into the rule at all, which fails
      identically and is invisible on the create path.
- [ ] Saving an edit applies the rename **and** the coverage replace in one submit (**D-7**).
- [ ] Deleting through the confirmation flow removes the zone; cancelling leaves it.
- [ ] `confirmDelete()` populates the target's name for the modal, read from the model rather than
      from a client-writable array.
- [ ] Creating a zone leaves it covering nothing (**D-2**), and the list renders that neutrally
      rather than as an error (**D-8**).
- [ ] Saving with an empty selection clears the coverage and **leaves the zone listed** (0033 D-5).
- [ ] **A save carrying a stale/invalid geography id is rejected whole** (**D-12**): the error lands
      on the geography field as a `ValidationException` (never a bare
      `UnresolvedSelectionException` escaping the component), **no** pivot row is written, and the
      zone's existing coverage is byte-for-byte unchanged. Asserted against a freshly re-read model,
      per *Traps*.
- [ ] **A save mixing one valid and one stale id saves neither** — the sharpest form of **D-12**, and
      the one that actually fails against a "catch `UnresolvedSelectionException`, `array_intersect()`
      the survivors and sync the rest" implementation. A test using only invalid ids passes against
      that broken implementation (it syncs an empty set, which looks like a refusal), so this mixed
      case is the load-bearing one.
- [ ] **A rejected geography save also leaves the name unchanged** — the executable form of **D-7**'s
      validate-everything-before-invoking-anything ordering: `RenameShippingZone` must not have run.
- [ ] Assigning an entry another zone already covers succeeds with **no error on any field**
      (**D-9**) — the negative form of 0033 **D-2**, and the guard against someone adding the
      overlap notice as a blocking rule.
- [ ] `loadZones()` issues a bounded number of queries regardless of zone count — asserted with
      `DB::listen`/query-count, the concrete guard on **D-8**'s `withCount` (an N+1 here is invisible
      at three fixture zones and fatal at fifty).
- [ ] `set('editingZoneId', …)`, `set('deletingZoneId', …)` and `set('deletingZoneName', …)` each
      throw `CannotUpdateLockedPropertyException` — a regression-proof against someone dropping a
      `#[Locked]`, which is what keeps `Rule::unique()->ignore()` honest.

### `tests/Feature/Shipping/ZonesAuthorizationTest.php` — component level + HTTP level

- [ ] `GET route('shipping.zones.index')` is refused (403) without `shipping.view` — **HTTP layer**.
- [ ] Each of `save()` (create branch), `save()` (edit branch) and `deleteZone()` is refused via
      `Livewire::test()` for a user lacking `shipping.create` / `shipping.edit` / `shipping.delete`
      respectively, **and the data is unchanged afterwards** — **component layer**. These are
      separate tests from the HTTP one on purpose: per
      [feature-integration-tests.md](../../docs/testing/backend/feature-integration-tests.md), an
      HTTP test and a `Livewire::test()` test cover different entry points and neither substitutes
      for the other.
- [ ] **A `shipping.view`-only user cannot reach `SyncShippingZoneGeography` by any route** — drive
      `save()` directly with a populated `geographyEntryIds` and assert the pivot is untouched. This
      is the executable form of 0033's hand-off warning about the sync action.
- [ ] A Super Admin holding no explicit `shipping.*` grant passes every ability, exercising the
      documented `Gate::before` bypass — **and this story is the first thing anywhere that can catch
      a mis-bound `ShippingZonePolicy`**, since 0033 ships it with zero call sites.
- [ ] A `shipping.view`-only user sees the row actions rendered **disabled**, and a fully-permitted
      user sees them enabled — **both branches**, since the disabled branch is separate markup
      (**D-5**) that can rot independently.
- [ ] `beforeEach` calls `app(PermissionRegistrar::class)->forgetCachedPermissions()` **then**
      `$this->seed(RolePermissionSeeder::class)` — never flush between Act and Assert — and asserts
      against the seeded catalog rather than fabricating `Permission` rows.

### `tests/Feature/Shipping/SearchGeographyEntriesTest.php` — the resolver, component level

- [ ] A prefix term returns matching entries at all three levels, each carrying the right `group`.
- [ ] **A municipio's label carries its province**, and two same-named municipios in different
      provinces are distinguishable (**D-4**) — the concrete payoff of 0032's `province_name`.
- [ ] **An accented catalog name is found by its unaccented spelling and vice versa** — "gijon"
      finds "Gijón". Still the single sharpest test in the file, but its target has narrowed since
      **D-13**: with `App\Actions\NormalizeForSearch` shared by the resolver and 0032's seed-time
      computation, two implementations can no longer drift. What it now catches is a **caller** that
      forgets to route the search term through that class at all — the remaining failure mode, and
      still one with no error anywhere (**R-1**).
- [ ] **The resolver routes its search term through `App\Actions\NormalizeForSearch` and nowhere
      else** — no inlined `Str::lower()`, `iconv()` or local accent map anywhere in
      `SearchGeographyEntries` (**D-13**). Cheap to assert and it pins the rule the accent test can
      only infer.
- [ ] The resolver honours the `$limit` it is given and never returns more.
- [ ] Each level query carries an **equality predicate on `level`** — asserted from the captured SQL,
      because a query without it silently stops using 0032's `INDEX(level, normalized_name)` and
      nothing else in the suite would notice (**D-4**).
- [ ] A term matching nothing returns an empty array (feeding 0022's empty state).
- [ ] `resolveSelected()` returns authoritative labels for arbitrary ids **with no search term
      applied**, and — being total per **D-12** — throws `App\Exceptions\UnresolvedSelectionException`
      for an id that does not exist, with `$missingIds` carrying **every** unresolvable id rather
      than just the first. Note what this does and does not license: an unresolvable id may be
      omitted from the **display**, but that must never be read as permission to save around it.
      The save-side rejection is tested at the component level, above.
- [ ] `disabled` is `false` on every option (**D-4**) — a cheap pin on a rule whose violation would
      silently contradict 0033 D-2.

### `tests/Browser/Shipping/ZonesTest.php` — real browser

This file also discharges **0022's forward Definition-of-Done obligation** on this story: at least
one browser test exercising the shared component **in its real embedding with its real resolver**,
which 0022 could only test in a vacuum against a fake.

- [ ] **Assign a geography entry by really typing and really clicking** — type a prefix, wait for the
      debounced results, click a municipio, see a chip appear, save, reload, see the coverage
      persisted. This is the **highest-severity test in the story** (see *Traps* below).
- [ ] The same journey for a **country**-level and a **comunidad autónoma**-level entry. Expressed as
      a **dataset over the three levels** rather than three tests, because the bodies are identical
      and only the fixture row and the expected group heading differ —
      [rule 4](../../docs/testing/frontend/gherkin-guidelines.md#4-scenario-outline-vs-duplicated-scenarios)
      and the PRD's own `Scenario Outline` shape. Split only if the assertions genuinely diverge.
- [ ] Removing an assigned entry's chip drops it from the coverage, and it becomes offerable again on
      the next matching search.
- [ ] Results render **grouped by level** with visible headings.
- [ ] The "no results" empty state is **visible** (not merely present in the DOM) on a term matching
      nothing — **and that empty state offers no "create this entry" affordance**. This is the
      strongest falsifiable frontend form of the PRD's "the catalog does not allow inventing new
      entries", because a create-on-the-fly control in a combobox conventionally lives exactly there.
      It is honestly the weaker half of that scenario; 0033's "no catalog row created as a side
      effect" is the stronger one.
- [ ] The picker works **inside the modal** — opens, scrolls, and is clickable without being clipped.
      0022 flags modal embedding (z-index, overflow, scroll context) as its explicitly untested gap,
      and this story is where that gap closes.
- [ ] An entry already assigned is **not offered** in the results when searched for (0022 D11,
      through a real re-render rather than a recomputed array).
- [ ] A zone's coverage renders on **first paint** when the edit modal opens for a zone that already
      has entries — the closest structural analogue to the errors-log hydration bug.
- [ ] The full create → rename → delete journey through real clicks, including the delete
      confirmation.
- [ ] `->assertNoJavaScriptErrors()` in **every** browser test — mandatory per
      [test-quality-checklist.md](../../docs/testing/frontend/test-quality-checklist.md).

### Deferred, as exactly two named skips

- [ ] `->skip('shipping_rates does not exist yet — story 0036 must un-skip this')` on one test that
      the delete modal renders the in-use hard-block message when `DeleteShippingZone` raises a
      `ValidationException`. **Name the blocking artifact first and the story id second**, so a grep
      survives renumbering (0033 **R-8**). Note 0033 also records that **no `->skip()` exists
      anywhere in the suite today** — verify `php artisan test --compact` surfaces skips *visibly*
      before relying on one, and treat 0036's Definition of Done as the real enforcement.
- [ ] `->skip('sales_regions has no screen yet — story 0016/0017')` for the PRD's
      "creating a zone leaves the Sales Region catalog untouched" scenario at the UI layer.

### Not worth writing

- **0022's shell mechanics** — debounce coalescing, `resultLimit` truncation, the truncation notice,
  `#[Locked]` enforcement on its own properties, tampered-`$selected` reconciliation. All are in
  0022's own plan against its test double. Re-testing them here duplicates the owner.
- **0033's action semantics** — replace-vs-append, the composite-PK duplicate refusal, literal-not-
  transitive membership, `23000` conversion. Owned and tested there against the actions directly.
- **0032's catalog contents** — counts, parentage, accent round-trips.
- **Eloquent's `withCount` / `belongsToMany` internals**, and any migration mechanics.
- **A route-absence or `arch()` test for "admins cannot invent catalog entries."** 0033 already
  argued this and it applies unchanged: `expect(Route::has(...))->toBeFalse()` asserts nobody added a
  route nobody proposed, and `->not->toUse(GeographyEntry::class)` is flatly false here since the
  resolver legitimately reads the model.
- **Dark-mode visual regression.** Nothing in §2.4 makes visual correctness the requirement.

### Traps — what a naive plan here walks into

- **The single most dangerous gap: `Livewire::test()->set('geographyEntryIds', [...])` cannot prove
  the picker works.** The errors-log entry on the `null`-property/native-`<select>` desync is the
  precedent and it is exact: `set()` writes the property directly and **never touches a DOM element
  at all**, so it is green against a picker that is completely broken in a browser. Worse, that same
  incident records that a browser-automation `selectOption()`-style API **also** missed it — the
  failure mode was a *missing* `change` event. The only thing that catches this class of bug is a
  test that drives the control the way a person does (real typing, real click on a real result row)
  and then asserts the **server-side** value. That is why the assign-by-really-typing browser test is
  named the highest-severity test in this story, and why it must assert persisted coverage after a
  reload rather than a rendered chip.
- **`$geographyEntryIds` must default to `[]`, never `null`** (0022 D8, and the same errors-log
  entry's general rule): a bound property must hold a real empty value in the type the DOM expects.
- **The disabled row-action branch is separate markup**, so it needs its own assertions; and a hover
  assertion on a disabled Flux button must target the `<ui-tooltip>` wrapper, not the button, which
  `disabled:pointer-events-none` removes from hit-testing.
- **Do not assert the pivot through `$zone->geographyEntries` after a save in the same request** —
  assert a freshly re-read model, or the relationship's cached value can make a no-op look like a
  success.

## Expected outcome

`/shipping/zones` is reachable with `shipping.view` and lists every admin-created zone with its
coverage count, ordered by name, with an explicit empty state before the first one exists. A "New
zone" button opens a name-only modal that creates a zone; the row's edit action reopens it with the
name field plus a searchable geography picker that queries the server as the administrator types,
returns a bounded set of matches grouped under **País** / **Comunidad Autónoma** / **Municipio**,
distinguishes two same-named municipios by province, shows an explicit "no results" state, and
offers no way whatsoever to add an entry to the catalog. Selections appear as removable chips in a
height-bounded area — bounded by 0022's own `maxChipAreaHeight` prop — beside a read-only per-level
coverage summary;
saving replaces the zone's coverage with exactly what is selected, an empty selection is accepted,
and a selection containing any stale or invalid entry is **refused outright** rather than saved in
part. Two zones may cover the same municipio with no warning. Deleting asks for confirmation, names the target, and — once 0036
lands — will render its in-use count message with no change to this story's markup. Every mutating
method re-authorizes against `ShippingZonePolicy`, which finally has a caller.

## Acceptance criteria

- [ ] The shipping zone catalog is manageable end-to-end from a real screen: **create, rename and
      delete** *(PRD §2.4 AC 4)*.
- [ ] A zone's geography coverage is assignable at **any of the three levels**, and one zone may
      mix levels *(PRD §2.4 AC 6)*.
- [ ] The picker is the **shared** searchable, server-side-filtered multi-select from 0022 — not a
      second implementation — with a "no results" empty state and results **grouped by level**
      *(PRD §2.4 AC 7)*.
- [ ] The full option list is **never** sent to the browser; search is server-side and bounded.
- [ ] Results are produced by **one query per level with an equality predicate on `level`**, so
      0032's `INDEX(level, normalized_name)` is usable (**D-4**).
- [ ] The search term is folded by **`App\Actions\NormalizeForSearch`** — the same class that
      produced `normalized_name` — with no normalization logic of this story's own, so an accented
      catalog name is findable by its unaccented spelling (**D-13**, **R-1**).
- [ ] Municipio options carry their **province** so same-named municipios are distinguishable.
- [ ] **No UI anywhere offers to create, edit or delete a geography catalog entry** — including in
      the picker's empty state *(PRD §2.4 AC 5, UI half)*.
- [ ] A zone with **zero** coverage is accepted and rendered neutrally, not as an error (0033 D-5).
- [ ] Assigning an entry another zone already covers produces **no error and no warning** (0033 D-2).
- [ ] Saving replaces the zone's coverage with exactly the current selection (0033 D-4).
- [ ] A save carrying **any** stale or invalid geography id is **rejected in full** with a clear
      validation error on the geography field — the save path calls 0022's
      `assertSelectionResolvable()` (or `resolveSelected()` itself) and converts the resulting
      `App\Exceptions\UnresolvedSelectionException` into a `ValidationException`, never silently
      reducing to the valid subset, and with the zone's name and coverage both left untouched
      (**D-12**).
- [ ] The member set is rendered in a **bounded** way that keeps the editor usable at the 500-entry
      ceiling, in **one** idiom with **one** remove control per member, using **0022's
      `maxChipAreaHeight` prop** rather than any bounding mechanism defined here (**D-3**, **D-11**).
- [ ] The delete flow confirms first, names the target, and renders an action-raised validation
      message inside the modal **without** this story adding a `zones.delete_blocked` key (**D-6**).
- [ ] The route is gated with `can:shipping.view` (never `permission:`), and **every** mutating
      component method re-authorizes against `ShippingZonePolicy` as its first statement.
- [ ] `SyncShippingZoneGeography` is unreachable except through the already-authorized edit branch.
- [ ] `$editingZoneId`, `$deletingZoneId` and `$deletingZoneName` are `#[Locked]`, and the zone id
      feeding `Rule::unique()->ignore()` is re-read server-side.
- [ ] Every id interpolated into a `wire:*` argument goes through `@js()` (**D-10**).
- [ ] Row actions the acting user may not perform render **disabled**, with the `data-test` hook on
      both branches.
- [ ] All copy is English source through `__()` in `lang/en/shipping.php`, mirrored key-for-key in
      `lang/es/shipping.php`; no hardcoded literals.
- [ ] The screen renders correctly in light and dark mode and produces **no JavaScript console
      errors**.
- [ ] Nothing owned by 0022, 0032, 0033 or 0035 is modified. `maxChipAreaHeight`,
      `App\Actions\NormalizeForSearch` and `App\Exceptions\UnresolvedSelectionException` (with
      `assertSelectionResolvable()`) are **added by 0022** and only consumed here (**D-11**,
      **D-12**, **D-13**).

## Definition of Done

- [ ] Tests written and green, plus the **full** suite per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Expected focus: that `$geographyEntryIds` is
      client-writable by construction and its only defence is 0033's server-side validation plus the
      FK — and that a tampered id now **rejects** the save via `assertSelectionResolvable()` /
      `UnresolvedSelectionException` rather than being quietly filtered out (**D-12**), which is the
      stronger posture and must be verified rather than assumed (**R-7**);
      that `$editingZoneId` is `#[Locked]` **and** re-read so `Rule::unique()->ignore()` cannot
      be pointed at another row; that every mutating method gates independently of route middleware;
      that the resolver discloses only catalog reference data and needs no row-level authorization
      (0022 **D7**); and that `@js()` wraps every id in a `wire:*` argument, which matters more here
      because geography ids come from an external fixture rather than being UUIDs by construction.
- [ ] **0022's forward obligation discharged**: at least one browser test exercises
      `SearchableMultiSelect` in its real embedding with a real Eloquent-backed resolver, inside a
      modal.
- [ ] **0033's hand-off obligations discharged** and recorded back into 0033: every action is
      `Gate::authorize()`d before invocation, the sync action included; the zone id stays
      server-authoritative. 0033's Definition of Done names *this* story as its consumer, and its
      **OQ-C** is closed by this story's existence.
- [ ] Documentation updated (docs-keeper): [api/routes.md](../../docs/api/routes.md) (the
      `shipping.zones.index` route, its view, its `data-test` row-action hooks, and the sidebar
      entry); [architecture/authorization.md](../../docs/architecture/authorization.md)
      (`ShippingZonePolicy`'s first call site, and the screen-level-vs-per-row capability rule from
      **D-5** alongside the existing per-row `Gate::allows()` note);
      [conventions/naming.md](../../docs/conventions/naming.md) if the `Zones`-not-`Index` component
      naming is worth a second worked example of the subfolder exception's boundary; and
      [testing/frontend/README.md](../../docs/testing/frontend/README.md) if the "drive the control
      like a person, assert server-side" rule warrants promoting from the errors log into the
      browser-testing guidance.
- [ ] Acceptance criteria met.

## Dependencies, risks, open questions

### Dependencies

- **0022 — the shared multi-select.** Hard blocker: this story is one of its two consumers and binds
  to D1–D5 and D11 unchanged. Since 2026-08-18 it is also the owner of the three amended artifacts
  this story consumes: the **`maxChipAreaHeight` prop** (**D-11**), **`App\Actions\NormalizeForSearch`**
  (**D-13**), and **`App\Exceptions\UnresolvedSelectionException`** with its
  `assertSelectionResolvable()` helper (**D-12**).
- **0032 — the geography catalog.** Needs its **migration, model, factory and `GeographyLevel`
  enum**, and needs `normalized_name` to be computed by **the same `App\Actions\NormalizeForSearch`
  this story's resolver calls** (**D-13**) — 0032 is aligned on that class rather than owning a
  normaliser of its own. It does **not** need OQ-1 (the real INE dataset, its licence and vintage)
  resolved — the test plan runs on factory rows. Real search relevance and latency cannot be judged
  until it is, but nothing here is blocked.
- **0033 — zones backend.** Hard blocker: the model, the four actions, the validation trait and the
  policy.
- **0035 — carriers.** Only through the shared `lang/*/shipping.php`. Sequential only.
- **0002 — seeded permissions.** `shipping.*` already exists; nothing to add.
- **Blocks nothing.** 0036 is independent of this screen.

### Risks

- **R-1 — the search term and `normalized_name` folded by two different functions. RESOLVED
  2026-08-18** by the confirmed project-wide alignment on **`App\Actions\NormalizeForSearch`** —
  introduced by 0022 and called by **0022 / 0026 / 0032 / 0033 / 0034 alike**. Two
  implementations cannot drift when there is only one, so the risk is closed at the structural
  level rather than merely mitigated. See **D-13**.

  > ~~The sharpest risk in the story, because it fails silently: searching "Gijón" returns nothing
  > while "gijon" works, with no error anywhere. 0033's **OQ-A** proposes extracting a shared
  > normaliser; this story must consume it, so OQ-A should be settled before 0032, 0023, 0033 *or*
  > this story is implemented — a four-story decision, not a two-story one.~~ **Superseded** — the
  > extraction is confirmed and owned by 0022, so this story waits on no open question for it.

  **Residual risk, downgraded but not zero:** a *caller* can still bypass `NormalizeForSearch` by
  folding inline. That is a code-review-visible mistake rather than an invisible cross-story
  divergence, and it stays guarded by the accent test plus the explicit "routes through
  `App\Actions\NormalizeForSearch` and nowhere else" assertion in the resolver test file.
- **R-2 — the picker inside a `flux:modal`.** 0022 names this as its explicitly untested gap
  (z-index, overflow, scroll context) and this story is the first to hit it. Flux Free has no
  combobox, so 0022's widget is `flux:dropdown` + `flux:menu` used for something it was not designed
  for; a dropdown inside a modal is where that shows. Budget for at least one Flux/Blaze rendering
  surprise of the kind [errors-log.md](../../docs/errors-log.md) already records twice. If the
  dropdown proves unfixable inside a modal, the fallback is **OQ-D**'s full-page editor — which is
  why that option is kept alive rather than closed.
- **R-3 — payload weight at the coverage ceiling.** With 500 entries selected, 0022's
  `$selectedOptions` carries 500 label/group pairs and is dehydrated into **every**
  `/livewire/update` round trip the search box triggers, and `resolveSelected()` re-reads 500 rows
  each time. Bounded and correct, but not free. Not optimised here (no evidence it bites at
  realistic zone sizes); recorded so a Phase 3 slowdown is diagnosed rather than rediscovered.
- **R-4 — mixed id types across one screen.** `geography_entries.id` is `bigint` while
  `shipping_zones.id` is a UUID string, and both live in the same component. 0033 **R-10** already
  notes the two fail *differently* on a malformed route parameter (`HasUuids::resolveRouteBindingQuery()`
  rejects a non-UUID before querying; `GeographyEntry` does not) and that any helper assuming "all
  our ids are UUID strings" breaks here. The stringify-then-cast-back round trip (**D-4**) is the
  concrete place it can go wrong; Larastan level 7 should catch the type slips, not review.
- **R-5 — three stories queued on `lang/*/shipping.php` and two on the sidebar view.** A merge
  hazard with no test that fails; see the shared-file note under *Files*.
- **R-6 — the deferred delete guard's skip rots.** 0033's **R-8** applies unchanged: there is no
  `->skip()` anywhere in the suite yet, a skip naming a story id rots under renumbering, and the
  real enforcement is 0036's Definition of Done rather than the skip itself.
- **R-7 — D-12's reject rule depends on a rule this story does not own.** *(new 2026-08-18)*
  `geographyEntryIdsRules()` lives in 0033's `ShippingZoneValidationRules`, and **D-12** is only
  enforced if that rule actually carries an existence check over `geography_entries` — a `max:500`
  and an `array` rule alone would let a stale id through to `sync()`, where the pivot FK converts it
  into a `23000` rather than a field-level validation error. Two consequences: this story's Phase 3
  must **verify** the rule's shape rather than assume it, and if the check is absent the fix belongs
  in 0033, not in a local override here. **What is *not* at 0033's mercy** is 0022's own layer:
  `assertSelectionResolvable()` throws a `ValidationException` independently of whatever
  `geographyEntryIdsRules()` does, so calling it in `save()` is the belt this story controls
  directly. The mixed valid/stale test named under *Tests* is what fails if this goes wrong; a
  rejection surfacing as a raw database error, or as an uncaught
  `App\Exceptions\UnresolvedSelectionException`, rather than as an error on the geography field is
  the symptom to watch for.

### Open questions

**OQ-A — the bounded chip area needs one additive prop on 0022. RESOLVED 2026-08-18 — approved.**
0022 is being amended to add exactly that purely additive prop, finalized as
`#[Locked] public ?string $maxChipAreaHeight = null;` (0022 **D14**), and this story consumes it by
that name. Recorded as **D-11**; **D-3**'s option (b) is now buildable as designed, and the
refused-branch fallback is dead.

> ~~**(needs a decision before Phase 3)** **D-3** adopts a height-capped, internally-scrolling chip
> area, but 0022 owns the markup that renders chips, and a parent-side wrapper would scroll the
> search input out of view along with them. **Recommend adding one purely additive, defaulted-off
> prop to 0022 (recommended)** — e.g. `chipsMaxHeightClass` — because it breaks no existing binding
> and 0022's own D5 already establishes exactly this "the first consumer that needs it adds it
> additively" precedent. If refused, fall back to the unbounded chip row plus a lower `max:` cap
> owned by this story, and record that as a knowing product restriction.~~ **Superseded** by the
> approval above. The provisional name `chipsMaxHeightClass` was this story's guess and is **not**
> authoritative: the real prop 0022 ships is **`maxChipAreaHeight`**, and it takes a **CSS length
> string** (`'12rem'`), not a Tailwind class name — so the guess was wrong in its value shape as
> well as its name. The "needs 0022's owner in the room" caveat is discharged; the "0022 must land
> first" sequencing is **not**, and still holds.

**OQ-B — search matching: prefix-anchored, and how the limit is shared across levels.** **D-4**
takes `LIKE 'term%'` with a full limit per level and a broad-to-narrow merge. Two consequences are
real if minor: "lava" does not find "Torrelavega", and a term matching more countries than the limit
starves municipios. Both are **recommended as accepted** — the PRD's own example types a prefix,
0022's truncation notice covers the overflow, and a leading wildcard would abandon the index this
whole design is built around. The alternatives (a trigram/full-text approach; proportional per-level
allocation) are Phase 3 tuning, not contract changes. Flagged so Phase 2 reviews them as decisions
rather than inheriting them.

**OQ-C — should a zero-coverage zone be flagged in the list?** 0033 **D-5** permits a warning.
**Recommend a neutral marker, not a warning (recommended)**: the consequence of an empty zone is an
Epic 3 pricing gap, and styling it as an error here asserts a rule nobody has agreed. One line
either way; raised because it is a product judgement, not a technical one.

**OQ-D — modal vs. full-page zone editor.** **D-2** takes the modal, on the Users-screen precedent
and because the prototype's own shipping form is a modal. **Recommend keeping the modal
(recommended)**, but it is kept open rather than closed because **R-2** could force the change: if a
searchable dropdown cannot be made to behave inside `flux:modal`, a dedicated
`shipping/zones/{zone}/edit` page is the fallback and it changes this story's file list (a second
route, route-model binding on a UUID, a second view) without changing any decision above it.

**OQ-E — is the ungated sidebar entry still the right call here?** The Users link is ungated and
[api/routes.md](../../docs/api/routes.md) records that as deliberate and cosmetic-only, with
permission-aware navigation deferred to the sidebar-gating story **0013**. **Recommend following
that precedent unchanged (recommended)** — consistency beats a one-off gate, access is genuinely
refused at the route and in the component, and 0013 will rewrite this file anyway. Raised only
because this is the second such link and a pattern is forming.

## Provenance

> **Amended 2026-08-18**, after the original debate, with three decisions the user confirmed in the
> wider Epic 2 Phase 1 round: **D-11** (consume 0022's new `maxChipAreaHeight` prop — resolves this
> story's **OQ-A**), **D-12** (0022's amended contract **rejects** a save carrying any stale/invalid
> id — via a total `resolveSelected()` throwing `App\Exceptions\UnresolvedSelectionException` and
> the `assertSelectionResolvable()` helper — instead of silently dropping it), and **D-13**
> (`App\Actions\NormalizeForSearch`, shared across 0022 / 0026 / 0032 / 0033 / 0034 — resolves this
> story's **R-1**). Superseded reasoning in
> **D-3**, **D-4**, **OQ-A** and **R-1** is struck through and labelled rather than removed. No
> other file was touched from here; 0022, 0026, 0032 and 0033 are amended by their own owners.

Phase 1 Three Amigos debate, 2026-08-18, for Epic 2. Classified **frontend** per
[workflow.md](../../docs/workflow.md#task-classification-rule), so `frontend-expert` and
`frontend-qa` were the participants convened and `database-expert` was deliberately not (the story
creates no table, migration or index — its two reads run against 0032's existing one).

> **Both subagent dispatches were refused: the concurrent agent pool was saturated.** Per the
> escalation instruction for that case, `product-owner` covered the **frontend-expert** contribution
> (the file list, the component surface, the resolver design in **D-4**, and the member-set
> rendering decision in **D-3**) and the **frontend-qa** contribution (the risk-based test plan, its
> levels, the test-data strategy and the *Traps* section) directly and inline, after reading the
> same grounding those roles would have read. This is recorded rather than glossed because two
> independent voices would plausibly have pushed back on at least **D-3** and **D-2**, and a
> single-author debate is weaker evidence than a real one. **Phase 2 (`code-reviewer`) should treat
> D-2, D-3, D-5 and OQ-A as carrying less scrutiny than the equivalents in 0033, which had four real
> participants.**

Scope derives from [PRD §2.4 Shipping](../../docs/PRD/PRD.md#24-shipping) as rewritten 2026-08-17,
and from the widening [0033's **OQ-C**](0033-shipping-zones-backend.md) recommended and this debate
accepts — which also names this story as the consumer 0033's Definition-of-Done hand-off required,
closing that open question. Grounding read in full: 0033, 0032, 0022 and 0035; PRD §2.4;
`workflow.md`; `contracts.md`; `api/routes.md`; `gherkin-guidelines.md`; `coverage-policy.md`;
`test-quality-checklist.md`; `errors-log.md`; and the real
[`App\Livewire\Users\Index`](../../app/Livewire/Users/Index.php),
`resources/views/livewire/users.blade.php` and
`resources/views/layouts/app/sidebar.blade.php` as the house-style reference. No application code was
written in this phase.
