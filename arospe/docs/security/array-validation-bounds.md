# Bounding an array of ids at the validation boundary

Established by story 0026's Phase 4 **re-audit** (finding R-1), while verifying that story's own
first-round fix for finding F-3. The rule it establishes is not about sales regions — it is about
every `'field' => ['array', 'max:N']` + `'field.*' => [..., Rule::exists(...)]` pair in this
codebase, of which there are two today and will be more with every list-shaped form Epic 2 and
Epic 3 add.

## Table of Contents

- [A `max:` rule on an array does not gate that array's `.*` rules](#a-max-rule-on-an-array-does-not-gate-that-arrays--rules)
- [No array-level rule gates them — `list` does not either](#no-array-level-rule-gates-them--list-does-not-either)
- [The call sites in this repo today](#the-call-sites-in-this-repo-today)
- [Confirmed: neither `bail` form helps](#confirmed-neither-bail-form-helps)
- [The shapes that do bound it](#the-shapes-that-do-bound-it)
- [Status in story 0026: bounded by a written hand-off, not by code](#status-in-story-0026-bounded-by-a-written-hand-off-not-by-code)
- [Story 0027: the two-pass shape is only half the bound — the mutation point needs one too](#story-0027-the-two-pass-shape-is-only-half-the-bound--the-mutation-point-needs-one-too)
- [Story 0027 re-audit: a cap on the array's *length* is not a cap on the loop's *work*](#story-0027-re-audit-a-cap-on-the-arrays-length-is-not-a-cap-on-the-loops-work)
- [Status in story 0028: the rule's first real, shipped, closed call site](#status-in-story-0028-the-rules-first-real-shipped-closed-call-site)

## A `max:` rule on an array does not gate that array's `.*` rules

**Rule. `max:N` on an array attribute bounds what is allowed to *succeed*; it does not bound what
the request *costs*.** Laravel expands `field.*` against the data it was given, and runs every
expanded rule regardless of whether the parent attribute's own rules already failed. So a submission
carrying 4,000 ids still pays 4,000 `Rule::exists()` queries before the `max:254` message is
returned. If the per-element rule set touches the database, the array-level `max:` is not a
denial-of-service control and must not be documented as one.

This is the specific trap: `max:N` *looks* like a bound on the work, because the number it names is
the number of elements. It is a bound on the accepted result only.

Measured against this repo's own rules (`ProductValidationRules::salesRegionIdsRules()` +
`salesRegionIdRules([])`, executed on this worktree's MySQL, one `DB::listen()` counter registered
once):

| submitted ids | queries issued | wall time | outcome |
| --- | --- | --- | --- |
| 254 (the legal maximum) | 254 | 0.35 s | `ValidationException` |
| 1,000 | 1,000 | 1.40 s | `ValidationException` (`max:254`) |
| 4,000 | 4,000 | 6.60 s | `ValidationException` (`max:254`) |

Exactly one query per submitted element, linear, with the `max:254` verdict arriving only after all
of them have run. Extrapolating is the point: the cost is set by what the client sends, not by what
the rule permits.

❌ **As found (story 0026, and unchanged in shipped story 0024 code).** The array-level bound and the
per-element database rule are declared in the same rule set, so they are evaluated in the same pass:

```php
// app/Concerns/ProductValidationRules.php — the rules, correct in isolation
protected function salesRegionIdsRules(): array
{
    return ['array', 'list', 'max:254'];
}

protected function salesRegionIdRules(array $preservedSalesRegionIds = []): array
{
    return ['required', 'string', 'distinct', Rule::exists('sales_regions', 'id')->where(/* … */)];
}
```

```php
// the composition a consumer is expected to write — this is where the cost is unbounded
Validator::make($input, [
    'salesRegionIds' => $this->salesRegionIdsRules(),
    'salesRegionIds.*' => $this->salesRegionIdRules($preserved),   // runs for EVERY element
])->validate();
```

Note the rules themselves are not wrong, and `max:254` is a well-chosen number — 249 ISO countries
(`database/data/iso-3166-countries.json`) plus `SalesRegionSeeder::SPAIN_TERRITORIES`' five, and the
catalog has no create path, so 254 is a hard ceiling rather than a guess. What is wrong is only the
claim that declaring it bounds the per-request query cost.

## No array-level rule gates them — `list` does not either

The rule above is stated in terms of `max:N` because that is the rule whose *number* invites the
misreading. It is not a property of `max:` — **no rule on the parent attribute gates the `.*` rules**,
because `field` and `field.*` are different attributes and the wildcard is expanded against the data
the request supplied, not against the data that passed. `array`, `list`, `size:`, `between:` and a
custom array-level closure all behave identically.

`list` is worth calling out by name, because it is the *other* rule in
`ProductValidationRules::salesRegionIdsRules()` and its own docblock made the identical claim
`max:254`'s did — that it "refuses a sparse/associative array **before either per-element rule
runs**". It does not. Measured on this worktree, 30 ids submitted as an associative array against
`['ids' => ['array', 'list', 'max:254'], 'ids.*' => ['required', 'string', 'distinct', Rule::exists(…)]]`:

| submitted | `list` verdict | queries issued | error keys returned |
| --- | --- | --- | --- |
| 30 ids, associative (`k0` … `k29`) | fails | **30** | `ids`, `ids.k0` … `ids.k29` |

The wildcard expanded against the *associative* keys and ran the `exists` rule for every one of them.
So an associative array is exactly as expensive as a list one, and `list` bounds the accepted shape
rather than the work — the same sentence, about a different rule, on the same rule set.

The mitigation is the same and needs no second mechanism: in the two-pass shape below, `list` and
`max:254` both live in pass 1, so either one failing throws before pass 2 is ever composed. Measured
at **0 queries** for a 2,000-id submission in both the oversized-list and the associative case.

## The call sites in this repo today

Two are **unreachable in production as of 2026-09-03**, because neither has a Livewire component or
route in front of it yet (the products editor is story 0027). Recorded so the next audit treats them
as known rather than new, and so 0027 does not wire either one as-is:

- `ProductValidationRules::salesRegionIdsRules()` / `salesRegionIdRules()` (story 0026) —
  `max:254` + a per-element `Rule::exists('sales_regions', 'id')`. Story 0026's Definition-of-Done
  hand-off item 3 makes calling this rule **mandatory** for 0027, so 0027 inherits the shape. Its
  hand-off item **5** now also dictates *how* to call it — see
  [Status in story 0026](#status-in-story-0026-bounded-by-a-written-hand-off-not-by-code) below.
- `ProductValidationRules::productGalleryMediaIdsRules()` (story 0024, shipped) — `max:20` +
  `'gallery_media_ids.*' => ['string', 'distinct', Rule::exists('media', 'id')]`, composed in
  `productRules()` and validated by both `CreateProduct` and `UpdateProduct`. Measured on the same
  worktree: 1,000 submitted ids issue **1,000 queries** in 1.16 s despite `max:20`.

The gallery case is the more instructive of the two unreachable sites, because its bound is `20` —
two orders of magnitude below the array a client may send, and still no protection at all.

A **third** site is real, shipped and **closed** rather than unreachable:

- `ProductAttributeValidationRules::attributeValueListRules()` / `attributeValueRules()` (story
  0028) — `max:100` on the `values` array, `distinct:ignore_case` on `values.*.value`. Unlike both
  sites above, `App\Livewire\Products\AttributeTypes\Index::save()` is a real, mounted, permission-
  gated Livewire method that calls it today. See
  [Status in story 0028](#status-in-story-0028-the-rules-first-real-shipped-closed-call-site) below.

## Confirmed: neither `bail` form helps

Verified by execution rather than reasoned about, because `bail` is the reflexive reach here:

| rule set | queries for 300 submitted ids |
| --- | --- |
| `'ids' => ['bail', 'array', 'list', 'max:254']` | 300 |
| `'ids.*' => ['bail', 'required', 'string', 'distinct', Rule::exists(...)]` | 300 |

`bail` stops the remaining rules **for the attribute it is on**, and `ids` and `ids.*` are different
attributes. `bail` on the element rules stops at the first failing rule *per element*, which is no
help when every element reaches the `exists` rule (a well-formed UUID string passes `required`,
`string` and `distinct`).

## The shapes that do bound it

Two, both verified. Prefer the second where the per-element rule is a plain existence check.

✅ **Two passes: validate the array's shape first, and let it throw before the element rules are ever
composed.** Measured at **0 queries, 0.00 s** for a 4,000-id submission:

```php
// Pass 1 — shape only. Throws before anything touches the database.
Validator::make($input, [
    'salesRegionIds' => $this->salesRegionIdsRules(),
])->validate();

// Pass 2 — per-element rules, now provably running against at most 254 elements.
Validator::make($input, [
    'salesRegionIds.*' => $this->salesRegionIdRules($preserved),
])->validate();
```

The cost of this shape is that the two passes produce two `ValidationException`s rather than one
merged error bag, so a caller displaying field-level errors sees the size error alone on an
oversized submission. That is the correct trade: an oversized array has no per-element errors worth
showing.

✅ **One batch query instead of N.** Where the per-element rule is only "does this id exist, subject
to a condition", a single array-level closure rule collapses N queries into one and removes the
unbounded cost by construction rather than by ordering:

```php
// One query for the whole array, whatever its size.
'salesRegionIds' => ['array', 'list', 'max:254', function (string $attribute, mixed $value, Closure $fail): void {
    $submitted = array_values(array_unique((array) $value));

    $valid = SalesRegion::query()
        ->whereIn('id', array_slice($submitted, 0, 254))
        ->where(/* the same assignable-or-preserved condition */)
        ->pluck('id')
        ->all();

    if (array_diff($submitted, $valid) !== []) {
        $fail(/* … */);
    }
}],
```

⚠️ Note the `array_slice()` inside it: a closure rule is itself an array-level rule, so it runs even
when `max:254` has already failed — the same mechanism this whole page is about. Slice inside the
closure, or the batch query inherits an unbounded `IN (…)` list. This is the identical shape story
0022 already ships in `SearchableMultiSelect::resolveIdsAllowingPartialFailure()`
(`array_slice($ids, 0, self::MAX_RESOLVABLE_SELECTED)` before either resolver call) — that component
is this repo's existing worked example of bounding a client-supplied id array before it reaches a
query, and it bounds it in PHP, not in a validation rule, for exactly this reason.

**The review question that catches this class**: for every rule set containing a `.*` wildcard, ask
*what does one element cost, and who chose the element count?* If the answer to the first is "a
query" and to the second is "the client", the array-level `max:` is not the control.

## Status in story 0026: bounded by a written hand-off, not by code

⚠️ **The ❌ above is still the shipped code, and that is the correct outcome for this story rather
than an unfixed finding.** Recording the disposition explicitly, so the next audit meets a decision
rather than a silence.

**Why no code fix was possible here.** The hazard is a property of the **`validate()` call**, not of
the rule sets — two rule arrays composed into one call are expensive, the same two composed into two
calls are not, and the rules themselves are byte-identical either way. Story 0026 ships **no call
site at all**: it has no route, no Livewire component and no `validate()` invocation, because
`salesRegionIdsRules()` / `salesRegionIdRules()` exist for story 0027's not-yet-built product editor
to consume. There is nothing in this story's own tree that could be changed to close it.

**What shipped instead**, in commit `945e59e`:

- `ProductValidationRules::salesRegionIdsRules()`'s own docblock had claimed `max:254` closes the
  per-request query cost. That claim is **deleted** and replaced by a ⚠️ block stating the real
  mechanism and naming the required mitigation, so the next reader of the rule meets the hazard at
  the rule rather than in a doc they may not open.
- Story 0026's **Definition-of-Done hand-off item 5** instructs 0027 to validate the two rule sets in
  two separate, sequential `Validator::make(…)->validate()` calls — the ✅ two-pass shape above — and
  states that this is *not* a reopening of D12's rejected delta-validation shape (that one split ids
  into **different** rule sets by preserved/new; this one uses the identical per-element rule, only
  sequenced).

**Why the batch-query ✅ was not adopted in its place**, even though it would bound the cost inside
this story's own code and therefore need no hand-off at all. It was re-examined against D12 and
rejected on three grounds, none of them about the SQL:

1. **It only bounds anything if `salesRegionIdRules()` is deleted.** A batch closure added *beside*
   the per-element rule changes nothing — the per-element rule still runs N times. So adopting it
   means replacing D12's validated per-element shape wholesale, in the one rule that carries this
   story's sharpest correctness requirement (the preserved-vs-assignable nested `OR` group,
   reviewed by `database-expert` and re-confirmed at audit). That is a redesign of working
   security-relevant logic to close a hazard with no reachable call site.
2. **It hand-rolls what the framework already guarantees per element.** `required`, `string` and
   `distinct` — and the per-element error keys (`salesRegionIds.3`) a form needs — would have to be
   re-implemented in PHP inside the closure. A non-string element reaching `whereIn` is a `TypeError`
   or a silent MySQL type coercion, and both are new failure modes the current shape cannot have.
3. **Its own bound is a convention, not a construction.** A closure rule is an array-level rule, so
   it runs *after* `max:254` has already failed (this whole page's mechanism) — the `array_slice()`
   inside it is the only thing bounding the `IN (…)` list, and nothing enforces that it stays there.
   The two-pass shape has no equivalent load-bearing line to lose.

**What remains open, stated plainly**: there is **no code-level cost bound today**, and there will
not be one until 0027 writes its save path. If 0027 ships a bare `$this->validate([...])` combining
both rule sets, this hazard is live in production with nothing behind it. The controls that exist are
the docblock and hand-off item 5 — writing, not enforcement — and the check that closes this is a
review of 0027's save path, not a test in this story.

## Story 0027: the two-pass shape is only half the bound — the mutation point needs one too

Story 0027 (products list + editor UI) is the story the section above hands off to, and it is the
**review of 0027's save path** that section names as the check which closes this. That review found
the hand-off half-discharged, and — more usefully than the miss itself — found that the hand-off was
**not sufficient on its own**, because it addresses the `validate()` call and says nothing about how
the array gets its length in the first place.

✅ **`salesRegionIds` — the hand-off followed exactly.** `App\Livewire\Products\Editor::save()`
validates the two rule sets in two sequential calls, with an inline comment naming the obligation:

```php
// app/Livewire/Products/Editor.php — save()
// 2. The region array's SHAPE AND BOUND, alone, in its own call -- must throw before a
//    single per-element exists() query runs (obligation 7, D-12(b2)).
Validator::make(
    ['regionIds' => $this->regionIds],
    ['regionIds' => $this->salesRegionIdsRules()],
)->validate();

// 3. Only now the per-element rules, provably against at most 254 elements.
Validator::make(
    ['regionIds' => $this->regionIds],
    ['regionIds.*' => $this->salesRegionIdRules($preserved)],
)->validate();
```

❌ **As found (story 0027, Phase 4) — `galleryMediaIds`, the *other* call site this page names, wired
as-is in the same method, twelve lines above the ✅.** **Closed 2026-09-04** — the block below is the
code *as found* and is no longer in the file; see
[the re-audit section](#story-0027-re-audit-a-cap-on-the-arrays-length-is-not-a-cap-on-the-loops-work)
for the shipped two-pass replacement and for the residual its companion fix introduced. Both halves
sat in one `$this->validate([...])` call, which is the exact shape this page's ❌ describes:

```php
// app/Livewire/Products/Editor.php — save(), step 1
$this->validate([
    // … the scalar fields …
    'galleryMediaIds' => $this->productGalleryMediaIdsRules(),          // ['array', 'max:20']
    'galleryMediaIds.*' => ['string', 'distinct', Rule::exists('media', 'id')],
]);
```

Measured on this worktree with the rule pair above, 2,000 submitted ids:

| shape | queries issued | wall time | error messages returned |
| --- | --- | --- | --- |
| one pass (as found) | **2,000** | 3.28 s | 2,001 |
| two passes (the ✅ above) | **0** | 0.00 s | 1 |

**The generalisable half, and the reason this is a new section rather than a repeat.** The hand-off
in the section above is phrased entirely in terms of the `validate()` call, and that framing quietly
assumes the array's *length* is somebody else's problem. It is not, and this call site is where that
shows:

- `Editor::$galleryMediaIds` is `#[Locked]`, so no `$set` / `wire:model` write can reach it — which
  reads as "the client does not control this array". It does. `#[Locked]` binds the **property write
  channel**, never the component's own public methods, and `addGalleryImages(array $media)` is a
  public Livewire method (also an `#[On('product-images-added')]` listener, which
  [api/routes.md](../api/routes.md#applivewirecomponentswysiwygeditor--the-gallerys-first-real-consumer-and-the-second-routeless-gated-component)
  already records is registered page-globally and therefore client-reachable). It appends every item
  it is handed, with no cap, so the client picks the length regardless of the lock.
- Even with the validation fixed, the array still lives in **component state**: it is serialised into
  the snapshot and shipped both ways on every later round trip, and `addGalleryImages()`'s own
  `in_array()` dedupe over the growing array is quadratic across repeated calls. A bound that exists
  only inside `save()` does not touch either.

**Rule.** For a client-supplied id array, the two-pass validation bounds the *save*; only a bound at
the **mutation point** bounds the *component*. Cap the array in PHP where it grows — the
`array_slice($ids, 0, self::MAX_RESOLVABLE_SELECTED)` shape
`App\Livewire\Components\SearchableMultiSelect::resolveIdsAllowingPartialFailure()` already ships —
and validate in two passes as well. The review question at the end of
[The shapes that do bound it](#the-shapes-that-do-bound-it) gains a second half: *who chose the
element count, and is there any path that grows this array without passing the rule that bounds it?*

⚠️ **Also worth knowing for whichever story fixes this:** the one-pass shape does not only cost
queries, it returns **one error message per element** (2,001 above). Livewire persists the error bag
across requests, so an oversized submission bloats every subsequent round trip until the bag is
reset — a second, independent reason the shape check must throw first.

## Story 0027 re-audit: a cap on the array's *length* is not a cap on the loop's *work*

Both halves of the section above shipped, and were re-verified against the real files rather than
taken on the fix commit's word:

✅ **The save-path ❌ above is closed.** `Editor::save()` now validates `galleryMediaIds`'s shape and
bound in its own `Validator::make(...)->validate()` call, then `galleryMediaIds.*` in a second — the
identical two-pass shape `regionIds` already used, twelve lines below it. The one-pass block quoted
in that ❌ no longer exists in the file.

✅ **The mutation point gained a cap.** `Editor::addGalleryImages()` now carries
`self::MAX_GALLERY_SIZE = 20`, derived from and documented against
`productGalleryMediaIdsRules()`'s own `max:20`, and breaks out of its loop once the strip is full.

❌ **As found (story 0027 Phase 4 re-audit round 2; closed by round 3 — see the ✅ below): the cap
bounds how much the array *grows*, not how
much the loop *does*.** The same round's other fix (F-4, "derive the preview server-side, never from
the event payload") put a `Media::query()->find($id)` **inside** that loop, and the loop's only exit
is the array-length check — which a payload of ids that never make it into the array never trips:

```php
// app/Livewire/Products/Editor.php — addGalleryImages(), as found
foreach ($media as $item) {                                    // ← unbounded: $media is client-sized
    if (count($this->galleryMediaIds) >= self::MAX_GALLERY_SIZE) {
        break;                                                 // ← only fires once the array GROWS
    }
    // … isset / in_array dedupe …
    $selected = Media::query()->find($id);                     // ← one query per item, always
    if ($selected === null) {
        continue;                                              // ← array unchanged, loop continues
    }
    // …
}
```

Measured on this worktree (`app/Livewire/Products/Editor.php` at the time of the re-audit), 500
freshly-generated UUIDs matching no `media` row, passed straight to the public method:

| payload | `media` SELECTs issued | wall time | final array length |
| --- | --- | --- | --- |
| 500 ids, all non-existent | **500** | 492 ms | 0 |
| 500 ids, all real and distinct | 20 | — | 20 (cap works) |

So the cost is linear in what the *client* sends, not in what the component keeps — the same
one-query-per-submitted-element profile as the save-path ❌ this page opened with, arriving through a
method rather than through a validator. Three ways to reach it, all cheap: non-existent ids, ids of
rows deleted since, or (in the deduped branch) nothing at all. `addGalleryImages()` is
`#[On('product-images-added')]`, so `Livewire.dispatch(...)` from the console is sufficient; the
actor needs `products.create`/`products.edit` only because `Editor::mount()` gates on them.

**Rule, extending the one above.** *Capping an accumulator does not cap a loop that can iterate
without filling it.* When a fix moves a database read (or any per-item cost) inside a loop over
client-supplied input, the bound must be on the **iteration count**, not on the collection the loop
writes into — `foreach (array_slice($media, 0, self::MAX_GALLERY_SIZE) as $item)`, or better, slice
first and resolve the whole slice in one `Media::query()->whereIn('id', $ids)->get()`, which also
collapses the legitimate path from N queries to one. And note the companion test gap this round
exposed: `regionIds` has an explicit zero-query regression test
(`tests/Feature/Products/EditorTest.php`, "an oversized regionIds submission issues zero
sales_regions existence queries") while the gallery path — the call site this page is *about* — has
no query-count test at either the validator or the mutation point, so both bounds there are asserted
only by behaviour.

✅ **Closed (story 0027 Phase 4 re-audit round 3), and the slot above was written for exactly this.**
The candidate list is sliced to the remaining capacity **before any query runs**, and the whole slice
is resolved in **one** `whereIn()` — so both the iteration count and the query count are bounded by
`MAX_GALLERY_SIZE`, never by what the client sends:

```php
// app/Livewire/Products/Editor.php — addGalleryImages(), shipped
$remainingCapacity = self::MAX_GALLERY_SIZE - count($this->galleryMediaIds);

$candidateIds = collect($media)
    ->pluck('id')
    ->filter()
    ->map(fn (mixed $id): string => (string) $id)
    ->take(max($remainingCapacity, 0))   // ← bounds the LOOP, before the database is touched
    ->all();

$foundMedia = Media::query()->whereIn('id', $candidateIds)->get()->keyBy('id');   // ← exactly one

foreach ($candidateIds as $id) {
    // … the array-length break, the in_array() dedupe, and $this->toPreview($selected) …
}
```

Three properties re-verified by execution rather than read off the diff. **(a)** 500 non-existent ids
now issue **1** `media` SELECT, down from 500 — pinned by `tests/Feature/Products/EditorTest.php`,
*"addGalleryImages() with an oversized non-existent-id submission issues exactly one media query, not
one per item"*, which closes the companion test gap the ❌ above named. **(b)** `max($remainingCapacity, 0)`
is load-bearing, not defensive noise: `Collection::take()` with a **negative** argument takes from the
**end** of the collection, so an unguarded negative would silently resurrect an unbounded-ish slice
rather than yielding nothing. **(c)** An empty `$candidateIds` still issues one query, compiled to
`select * from `media` where 0 = 1` — no unbound placeholder, no error, and one query is the floor for
a Livewire round trip anyway, so an early `return` would be a micro-optimisation rather than a bound.

⚠️ **The shipped query-count test cannot distinguish "sliced before the query" from "not sliced at
all".** Both shapes issue exactly one SELECT; only the *binding count* differs (20 versus 500). If a
later refactor moves the `take()` after the query — or drops it, reasoning that one query is already
cheap — that test stays green while the whereIn's placeholder list becomes client-sized again.
Assert the bindings, not only the query count: `expect(count($query->bindings))->toBeLessThanOrEqual(20)`
inside the existing `DB::listen()` closure is the one-line strengthening, and it is the only assertion
that actually pins the slice.

⚠️ **Two residuals in the same method, both Low and both deliberately recorded rather than fixed in
this round.** First, `(string) $id` throws `ErrorException: Array to string conversion` — a 500 on
`/livewire/update` — for a payload item whose `id` is itself an array (`[['id' => ['a','b']]]`),
verified by executing the pipeline with `HandleExceptions` bootstrapped, which is what turns PHP's
warning into a throw on the real request path; `filter()` already absorbs a missing key, a `null` and
a non-array item, so an array-valued id is the one shape that escapes it. This is **not** introduced
by the slice — `setFeaturedImage()` has carried the identical `(string) $item['id']` since F-4 — and
the fix for both is one predicate, `->filter(fn (mixed $id): bool => is_string($id) || is_int($id))`,
in place of the bare `filter()`. Second, the slice runs **before** the dedupe, so an id already in the
strip consumes a slot: with 19 images held and a payload of `[alreadyInStrip, newImage]`, the slice
keeps only the first, the loop skips it as a duplicate, and `newImage` is dropped even though there
was room for it. Fail-closed (it can only add fewer images, never more) and invisible except at the
boundary; `->unique()` plus a `->reject()` of the ids already held, applied **before** `->take()`,
restores the pre-slice semantics while keeping every bound above intact.

## Status in story 0028: the rule's first real, shipped, closed call site

Unlike both sites above, this one had a real Livewire caller from day one, so the fix is code — the
✅ two-pass shape from this page, extended by one pass this domain specifically needs.

**The finding.** `App\Livewire\Products\AttributeTypes\Index::save()`'s Phase 4 audit reproduced the
identical mechanism this page already documents: `values.*.value`'s `distinct:ignore_case` rule is
O(n²) in the number of submitted values, and the parent `values` array's own `max:100` rule does not
gate it. A single forged submission ignoring the `max:100` bound was measured burning **51 s of CPU
at 20,000 rows** in this story's own Phase 4 audit — past PHP's default 30 s `max_execution_time` —
while still ultimately returning only the `max:100` message.

**Why three passes, not the two-pass shape verbatim.** `$values` is the component's own client-
writable form input (deliberately not `#[Locked]`, per [database/schema.md](../database/schema.md#product_attribute_values)),
so a forged payload can carry a scalar where a row object is expected, or a non-string where a
row's `id`/`value` is expected — reaching `SyncProductAttributeValues`' `array_key_exists()` lookup
directly and raising an unhandled `TypeError` (a 500) rather than a validation error, a **second**,
independent Phase 4 finding this story closed in the same pass (see `attributeValueRowRules()` /
`attributeValueIdRules()` in [database/schema.md](../database/schema.md#product_attribute_values)).
Establishing each row's *shape* has to run before `Str::squish()` normalises the text, so it cannot
share pass 1 (which validates `name`, an O(1) uniqueness query, and the array's own size) or pass 3
(the O(n²) per-value text rule) — it needs its own pass in between:

```php
// app/Livewire/Products/AttributeTypes/Index.php — save()
// Pass 1 -- shape only (size + name). Throws before anything per-element runs.
$sizePass = ['name' => $this->attributeTypeNameRules($this->editingTypeId)];
if ($this->values !== []) {
    $sizePass['values'] = $this->attributeValueListRules();
}
$validated = $this->validate($sizePass);

// Pass 2 -- each row's SHAPE, before normalisation. O(n), and can only ever see
// the <=100 rows pass 1 allowed.
$this->validate([
    'values.*' => $this->attributeValueRowRules(),
    'values.*.id' => $this->attributeValueIdRules(),
    'values.*.value' => ['required', 'string'],
]);

// (squish every value's text here)

// Pass 3 -- the O(n^2) per-value domain rule, on the now-bounded, now-shaped,
// now-normalised set.
$this->validate(['values.*.value' => $this->attributeValueRules()]);
```

**Verified**: with the three-pass structure in place, an oversized or malformed submission is
refused by pass 1 or pass 2 before `distinct:ignore_case` ever runs against it — the identical "0
queries/0 cost before the bound" property this page's own two-pass ✅ demonstrates for
`salesRegionIdsRules()`, confirmed here by the story's own Phase 4 re-verification rather than
assumed from the shape alone.

**What this closes, and what it does not.** This is the rule's first instance closed with *code*
rather than a written hand-off, because — unlike story 0026's two sites — a real, mounted, gated
caller exists today. It does not retire the rule itself: `salesRegionIdRules()` and
`productGalleryMediaIdsRules()` remain exactly as open as [Status in story 0026](#status-in-story-0026-bounded-by-a-written-hand-off-not-by-code)
records, and a future rule set with a `.*` wildcard and a database-hitting per-element rule still
needs the same review question asked of it: *what does one element cost, and who chose the element
count?*

_Last updated: 2026-09-04 — Story 0027 (products list + editor UI), Phase 4 **re-audit round 3**.
Closed the ❌ this page opened one round earlier with a ✅ quoting the shipped `take()`-before-`whereIn()`
shape and the three properties re-verified by execution, plus the ⚠️ that the new regression test pins
the query *count* but not the *slice* (both shapes issue one query; only the binding count moves) and
the ⚠️ recording the two Low residuals left in the method — an array-valued `id` reaching `(string)`,
and the slice running ahead of the dedupe. The ❌ is relabelled **as found** rather than deleted, per
this project's [audit-authored-page rule](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20):
a page written during an audit describes a state the next round is expected to change, so the fix gets
a slot rather than a rewrite._

_Previously: 2026-09-04 — Story 0027 (products list + editor UI), Phase 4 **re-audit**. Added the
section directly above, verifying the previous round's two fixes and recording the residual the
second of them introduced, per this project's rule that a security fix is new code and is audited as
such ([errors-log-archive.md](../errors-log-archive.md#two-of-the-three-security-audit-rounds-found-the-flaw-in-the-previous-rounds-fix--2026-08-19)).
The save-path ❌ in the section above it is now **closed** and is marked so in place rather than left
describing a tree that no longer exists; the new ❌ is marked **open** so the next round has a slot to
fill rather than a framing to rewrite._

_Previously: 2026-09-03 — Story 0028 (Product variant attribute types & values — backend), Phase 4.
Added [Status in story 0028](#status-in-story-0028-the-rules-first-real-shipped-closed-call-site) and
a third bullet under [The call sites in this repo today](#the-call-sites-in-this-repo-today):
`App\Livewire\Products\AttributeTypes\Index::save()` is this page's first real, mounted, permission-
gated caller of the pattern — a Phase 4 finding this time, reproducing the identical O(n²) cost this
page already documents against `values.*.value`'s `distinct:ignore_case` rule, measured at 51 s of
CPU at 20,000 submitted rows. Closed with code, not a hand-off: a **three**-pass sequential
`validate()` structure, the existing two-pass ✅ shape plus one extra pass this domain specifically
needs (a row-shape check, closing a related but distinct `TypeError` finding on the same submission)
between the size pass and the O(n²) text-comparison pass. Story 0026's two sites are unchanged and
remain exactly as open as [Status in story 0026](#status-in-story-0026-bounded-by-a-written-hand-off-not-by-code)
already records._

_Previously: 2026-09-03 — Story 0026 (Product ↔ Sales Region assignment and tax resolution
backend), Phase 4 **second re-audit**. Written in the previous round as a ❌/✅ pair with the ❌ marked
**as found and open**, per [errors-log.md](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20)'s
rule that an audit-authored page must leave a slot for the fix rather than need its framing
rewritten — and this pass is that slot being filled, which is the first time on this doc set the rule
has paid off inside the same story rather than a story later. **The ❌ is still the shipped code and
is now recorded as a decision** in [Status in story 0026](#status-in-story-0026-bounded-by-a-written-hand-off-not-by-code):
no code-level cost bound exists or can exist here, because the hazard lives at a `validate()` call
site this story does not ship; what changed is that the false claim in
`salesRegionIdsRules()`'s own docblock is gone and the mitigation is now dictated in writing to the
story that owns the call site (DoD hand-off item 5). That section also records why the batch-query ✅
was re-examined against D12 and **not** adopted in its place. Added
[No array-level rule gates them — `list` does not either](#no-array-level-rule-gates-them--list-does-not-either):
`salesRegionIdsRules()`'s docblock made the identical "runs before the per-element rules" claim about
`list` that it made about `max:254`, and it is false for the same reason — measured at 30 queries for
a 30-element associative array, with the same two-pass shape closing it at 0. Every number on this
page was measured by execution against this worktree's MySQL, not extrapolated; the first measurement
attempt was discarded because it registered a `DB::listen()` callback per loop iteration and
therefore multiplied its own counts._
