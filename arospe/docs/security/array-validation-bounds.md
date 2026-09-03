# Bounding an array of ids at the validation boundary

Established by story 0026's Phase 4 **re-audit** (finding R-1), while verifying that story's own
first-round fix for finding F-3. The rule it establishes is not about sales regions — it is about
every `'field' => ['array', 'max:N']` + `'field.*' => [..., Rule::exists(...)]` pair in this
codebase, of which there are two today and will be more with every list-shaped form Epic 2 and
Epic 3 add.

## Table of Contents

- [A `max:` rule on an array does not gate that array's `.*` rules](#a-max-rule-on-an-array-does-not-gate-that-arrays--rules)
- [No array-level rule gates them — `list` does not either](#no-array-level-rule-gates-them--list-does-not-either)
- [The two call sites in this repo today](#the-two-call-sites-in-this-repo-today)
- [Confirmed: neither `bail` form helps](#confirmed-neither-bail-form-helps)
- [The shapes that do bound it](#the-shapes-that-do-bound-it)
- [Status in story 0026: bounded by a written hand-off, not by code](#status-in-story-0026-bounded-by-a-written-hand-off-not-by-code)

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

## The two call sites in this repo today

Both are **unreachable in production as of 2026-09-03**, because neither has a Livewire component or
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

The gallery case is the more instructive of the two, because its bound is `20` — two orders of
magnitude below the array a client may send, and still no protection at all.

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

_Last updated: 2026-09-03 — Story 0026 (Product ↔ Sales Region assignment and tax resolution
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
