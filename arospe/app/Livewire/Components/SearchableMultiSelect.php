<?php

namespace App\Livewire\Components;

use App\Actions\NormalizeForSearch;
use App\Exceptions\UnresolvedSelectionException;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Modelable;
use Livewire\Component;
use Livewire\Exceptions\BypassViewHandler;

/**
 * Story 0022 — the reusable, server-side-filtered searchable multi-select. Owns no table, no
 * query and no domain knowledge; a consumer supplies both by implementing
 * MultiSelectOptionsResolver (D1) and passing its class-string as `optionResolver`. This class
 * ships no `Gate::authorize()` call of its own (D7) — authorization belongs to the resolver.
 *
 * @see MultiSelectOptionsResolver
 */
class SearchableMultiSelect extends Component
{
    /**
     * Class-string implementing MultiSelectOptionsResolver — set once, server-side, from the
     * consumer's own Blade attribute. #[Locked] (D6): without it, a tampered /livewire/update
     * payload chooses which server-side class this component instantiates and calls with an
     * attacker-supplied term, an arbitrary disclosure primitive.
     */
    #[Locked]
    public string $optionResolver;

    /**
     * Bare id strings, never labels (D4) — the load-bearing security decision. This is the
     * #[Modelable] surface a consumer's plain `wire:model` binds through, so it is deliberately
     * NOT #[Locked] (locking it would break the binding); the security property is enforced by
     * never reading a label off it, not by locking it. Never null — an empty array is "nothing
     * selected", matching this project's own null-`<select>` errors-log rule applied to every
     * wire:model-bound property.
     *
     * @var array<int, string>
     */
    #[Modelable]
    public array $selected = [];

    /**
     * id => {id, label, group, disabled} — chip display only, refreshed on mount() and after
     * every select/remove (D2). Chip labels come ONLY from resolveSelected(), never from
     * $results, so a chip keeps its correct label even after the search box no longer matches
     * it. #[Locked] (D6): server-derived display state.
     *
     * @var array<string, array{id: string, label: string, group: string|null, disabled: bool}>
     */
    #[Locked]
    public array $selectedOptions = [];

    public string $search = '';

    /**
     * The current page of matches, already excluding already-selected ids (D11) and trimmed to
     * $resultLimit. #[Locked] (D6): server-derived display state.
     *
     * @var array<int, array{id: string, label: string, group: string|null, disabled: bool}>
     */
    #[Locked]
    public array $results = [];

    /**
     * Whether the last fetch, before D11's already-selected exclusion and the $resultLimit trim,
     * held more candidates than $resultLimit — drives the "narrow your search" notice (D9).
     * Internal render-support state, not part of the D1–D5 contract 0027/0034 bind to; #[Locked]
     * for the same server-derived-display-state reason as $results.
     */
    #[Locked]
    public bool $hasMoreResults = false;

    public string $label = '';

    public string $placeholder = '';

    /**
     * Error-bag key, so $errors->has($field) works (D5). Also the key
     * assertSelectionResolvable() raises its ValidationException against. #[Locked] (Phase 4
     * finding F-5): a tampered payload changing $field mid-session could otherwise clear or
     * redirect a consumer's own validation error bag on chip removal -- the security weight is
     * in what this value is used FOR (an error-bag key), not in the string itself, which is why
     * it is locked while purely cosmetic strings like $label/$placeholder/$emptyStateText are
     * not (see D6's own "is this value ever legitimate request input" test).
     */
    #[Locked]
    public string $field = 'selected';

    /**
     * #[Locked] (Phase 4 finding F-3): a client-writable $minSearchLength defeats the debounce
     * hook's own search-cost bound -- setting it to 0 forces a resolver call on every keystroke,
     * including a single character against a resolver backed by an unindexed LIKE scan.
     */
    #[Locked]
    public int $minSearchLength = 1;

    /**
     * #[Locked] (Phase 4 finding F-3): purely a client-side debounce timing hint today, but
     * locked alongside $minSearchLength/$resultLimit since all three are the same "bounded
     * contract" configuration D9 relies on -- a consumer sets it once, server-side.
     */
    #[Locked]
    public int $debounceMs = 300;

    /**
     * #[Locked] (Phase 4 finding F-3): a client-writable $resultLimit directly drives
     * $fetchLimit (resultLimit + 1 + count($selected)) in updatedSearch() -- a tampered
     * `resultLimit: 999999` would defeat D9's whole "bounded fetch is what makes an 8,100-row
     * resolver safe" contract. updatedSearch() also clamps $fetchLimit to a hard ceiling as
     * defence in depth, independent of this lock.
     */
    #[Locked]
    public int $resultLimit = 20;

    /** Blank => lang fallback (D5). */
    public string $emptyStateText = '';

    /**
     * Consumer-set-once (from the Blade attribute), gating every server-side mutation/disclosure
     * method (D7). #[Locked] (Phase 4 finding F-1): without it, a tampered /livewire/update
     * `updates` payload sets `disabled: false` directly, bypassing every `if ($this->disabled)`
     * guard in selectOption()/removeOption()/updatedSearch() -- the near-exact repeat of story
     * 0021's WysiwygEditor::$disabled finding.
     */
    #[Locked]
    public bool $disabled = false;

    /**
     * CSS length (e.g. '12rem'); null = unbounded (today's behaviour, D14). #[Locked] (D6): flows
     * into a rendered `style` attribute, so a client-writable string here would be a CSS-injection
     * primitive — locked AND format-validated in mount().
     */
    #[Locked]
    public ?string $maxChipAreaHeight = null;

    /**
     * Ids resolveSelected() refused to vouch for (D12) — kept in $selected, never dropped.
     * #[Locked] (D6): a server-derived verdict; if the client could write it, it could clear its
     * own error state and the in-field warning D12 relies on becomes decorative.
     *
     * @var array<int, string>
     */
    #[Locked]
    public array $unresolvableSelected = [];

    public function mount(): void
    {
        // Phase 4 finding F-6: $selected is declared array<int, string>, but a tampered
        // /livewire/update payload can hand it non-string entries (a nested array, an int, null),
        // which reach array_diff()/whereIn()-style operations downstream and emit PHP "Array to
        // string conversion" warnings rather than being rejected outright. Coerce rather than
        // drop -- an int-looking id is still a real id string a resolver may legitimately hold.
        $this->selected = $this->coerceToStringIds($this->selected);

        if (! is_subclass_of($this->optionResolver, MultiSelectOptionsResolver::class)) {
            $this->throwMountValidationError(sprintf(
                '[%s] must implement %s.',
                $this->optionResolver,
                MultiSelectOptionsResolver::class,
            ));
        }

        // Phase 4 finding F-7: a bare `$` anchor matches before a trailing newline, not only at
        // the true end of string, so "12rem\n" would otherwise pass. `\z` anchors to the
        // absolute end of the subject. This value flows into a rendered `style` attribute, so
        // it is tightened even though "12rem\n" is harmless today.
        if ($this->maxChipAreaHeight !== null && ! preg_match('/^\d+(\.\d+)?(rem|em|px|vh)\z/', $this->maxChipAreaHeight)) {
            $this->throwMountValidationError(sprintf(
                '[%s] is not a valid CSS length for maxChipAreaHeight.',
                $this->maxChipAreaHeight,
            ));
        }

        $this->refreshSelectedOptions();
    }

    /**
     * Phase 4 finding F-6: guarantees every entry is actually a `string`, independent of the
     * $selected property's own declared "array of string" docblock type above. That declared
     * type is a promise, not an enforcement -- a tampered `/livewire/update` payload can violate
     * it -- and Larastan trusts the property's declared type on every *other* read of
     * `$this->selected`, which would make an `is_scalar()` check written inline always evaluate
     * true from its point of view. This method's own parameter is deliberately typed wider than
     * that property (a mixed-valued array, not a string-valued one), so the type boundary resets
     * honestly here rather than being suppressed with an ignore comment or an inline type
     * override.
     *
     * @param  array<int, mixed>  $ids
     * @return array<int, string>
     */
    private function coerceToStringIds(array $ids): array
    {
        return array_values(array_map(
            'strval',
            array_filter($ids, fn (mixed $id): bool => is_scalar($id)),
        ));
    }

    /**
     * Phase 4 re-audit finding R-1 (Low): $selected is #[Modelable], not #[Locked] (D4), so it is
     * writable on every /livewire/update round trip -- not only at mount(). Before this fix,
     * coerceToStringIds() ran once, in mount(), so a post-mount tampered `->set('selected', [...])`
     * payload carrying a non-string entry (a nested array, an int, null) reached the Blade view's
     * `{{ $id }}` echo (resources/views/livewire/components/searchable-multi-select.blade.php)
     * still un-coerced, throwing `TypeError: htmlspecialchars(): Argument #1 ($string) must be of
     * type string, array given` -- a 500 on the HOST page, not a scoped failure, reproduced by a
     * direct Livewire::test()->set('selected', [...]) call. Livewire's own updated<Property>()
     * lifecycle hook is what re-runs the same coercion on every subsequent write, guaranteeing
     * array<int, string> after every request rather than only the first.
     */
    public function updatedSelected(): void
    {
        $this->selected = $this->coerceToStringIds($this->selected);
    }

    /**
     * Resolves $optionResolver into a real instance, typed. `app($this->optionResolver)` alone
     * returns `mixed` to static analysis -- the class-string is read from a property, not a
     * literal, so Larastan's Laravel-specific `app()` narrowing cannot apply -- and every caller
     * immediately chains a method call (`->search(...)`, `->resolveSelected(...)`) that a
     * `collect()` around its result needs a real array-shape type for. The `instanceof` guard
     * below is the narrowing PHPStan actually understands (throw in the false branch, narrow by
     * elimination) rather than an `@var` override or `assert()`; mount()'s own
     * `is_subclass_of()` check already makes the throw here unreachable in practice, so this is
     * belt-and-braces, not a new runtime rule.
     *
     * Phase 4 finding F-4, confirmed by construction rather than by a second runtime check: this
     * method is only ever called from updatedSearch()/selectOption()/removeOption()/
     * assertSelectionResolvable()/refreshSelectedOptions(), and Livewire always runs mount() to
     * completion before any of those can be reached — so `app($this->optionResolver)` is never
     * asked to build an arbitrary, unvalidated class string; `is_subclass_of()` has already
     * passed by the time this line can execute. `$optionResolver` being #[Locked] additionally
     * means that check, once passed, cannot be invalidated by a later request.
     */
    private function resolver(): MultiSelectOptionsResolver
    {
        $resolver = app($this->optionResolver);

        if (! $resolver instanceof MultiSelectOptionsResolver) {
            throw new InvalidArgumentException(sprintf(
                '[%s] must implement %s.',
                $this->optionResolver,
                MultiSelectOptionsResolver::class,
            ));
        }

        return $resolver;
    }

    /**
     * Throws a developer-error InvalidArgumentException from mount() in a shape that survives
     * Livewire::test() unwrapped. Livewire's own ExtendedCompilerEngine::shouldBypassExceptionForLivewire()
     * (vendor/livewire/livewire/src/Mechanisms/ExtendBlade/ExtendedCompilerEngine.php) rewraps
     * ANY exception thrown from a component's initial mount() into Illuminate\View\ViewException
     * UNLESS it is an AuthorizationException, an Http*Exception, or uses Livewire's own
     * Livewire\Exceptions\BypassViewHandler trait — verified by execution, not assumed: a bare
     * `throw new InvalidArgumentException(...)` here surfaced through Livewire::test() as
     * ViewException, not InvalidArgumentException, which the D5/D14 mount() guard tests assert
     * against directly. An anonymous class extending InvalidArgumentException with that trait
     * mixed in stays a true `instanceof InvalidArgumentException` (so those assertions still
     * pass) while opting out of the rewrap.
     */
    private function throwMountValidationError(string $message): never
    {
        throw new class($message) extends InvalidArgumentException
        {
            use BypassViewHandler;
        };
    }

    /**
     * The debounce hook (D9). Since the N1 code-review fix, the view no longer drives this via a
     * `wire:model.live.debounce.Xms` attribute modifier (a Blade compile-time trap prevents that
     * modifier's duration from being interpolated from $debounceMs at all — see the file banner
     * comment in searchable-multi-select.blade.php) — instead a hand-rolled Alpine `setTimeout()`
     * calls `$wire.set('search', ...)` after $debounceMs elapses, which triggers this same
     * `updated<Property>()` lifecycle hook exactly as a `wire:model.live` write would. Resolved
     * with `app()`, deliberately: this is invoked through `wrap($component)->__call($name,
     * $params)` with FIXED parameters rather than a container `call()`, so a type-hinted
     * parameter here would never be resolved — the same `app()` carve-out story 0020's
     * Gallery::updatedPendingUploads() and this class-style docblock precedent already establish
     * (docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract).
     */
    public function updatedSearch(): void
    {
        if ($this->disabled) {
            $this->results = [];
            $this->hasMoreResults = false;

            return;
        }

        $term = app(NormalizeForSearch::class)->__invoke($this->search);

        // Phase 4 finding F-3, defence in depth independent of $search NOT being #[Locked] (it
        // is the live search-box wire:model.live target, correctly writable): cap the
        // normalized term's length before it is ever handed to a resolver, so an oversized
        // $search payload cannot be used as an amplification vector against a resolver backed
        // by an unindexed LIKE scan.
        $term = mb_substr($term, 0, 255);

        if (mb_strlen($term) < $this->minSearchLength) {
            $this->results = [];
            $this->hasMoreResults = false;

            return;
        }

        // Over-fetch by the current selection count so excluding already-selected rows (D11)
        // can never leave fewer than $resultLimit + 1 candidates behind. Phase 4 finding F-3:
        // $resultLimit/$minSearchLength are now #[Locked], but this ceiling is defence in
        // depth independent of the lock, capping $fetchLimit at a value that comfortably
        // covers every legitimate use in this codebase's Epic 2 datasets (~254 sales regions,
        // ~10^2-10^3 users) without depending on the lock alone to bound the resolver call.
        $fetchLimit = min($this->resultLimit + 1 + count($this->selected), 500);

        $fetched = $this->resolver()->search($term, $fetchLimit);

        $afterExclusion = collect($fetched)
            ->reject(fn (array $option): bool => in_array($option['id'], $this->selected, true))
            ->values();

        $this->hasMoreResults = $afterExclusion->count() > $this->resultLimit;
        $this->results = $afterExclusion->take($this->resultLimit)->all();
    }

    /**
     * Adds $id to the selection. A defensive no-op — server-side, for the /livewire/update entry
     * point a tampered call reaches independently of the UI — when: the field is disabled (D7);
     * the id is already selected (D11); or the resolver marks it `disabled` (D3). The `disabled`
     * check is asked of $this->results first (the common, UI-driven path costs no extra call) and
     * falls back to a resolveSelected() lookup only when the id isn't already known — the shape a
     * direct method call with no prior search needs, since $results may be empty in that case.
     */
    public function selectOption(string $id): void
    {
        if ($this->disabled) {
            return;
        }

        if (in_array($id, $this->selected, true)) {
            return;
        }

        $option = collect($this->results)->firstWhere('id', $id);

        if ($option === null) {
            try {
                $records = $this->resolver()->resolveSelected([$id]);
            } catch (UnresolvedSelectionException) {
                return;
            }

            $option = collect($records)->firstWhere('id', $id);
        }

        if ($option === null || $option['disabled']) {
            return;
        }

        $this->selected[] = $id;

        // D11: the selected option disappears from the result list entirely.
        $this->results = collect($this->results)
            ->reject(fn (array $row): bool => $row['id'] === $id)
            ->values()
            ->all();

        $this->refreshSelectedOptions();
    }

    /**
     * Removes $id from the selection. A no-op, server-side, when the field is disabled (D7).
     * Re-runs the current search afterward: the last-fetched $results excluded $id while it was
     * still selected (D11), and Livewire's own `updated<Property>()` hook only fires when a
     * property's incoming value differs from what the component already holds -- since removing
     * a chip does not change $search, a plain re-render would leave $results stuck at its stale,
     * still-excluding-$id state. Re-running the search is what makes the removed option
     * "offerable again" match the current term immediately, not only after the next keystroke.
     */
    public function removeOption(string $id): void
    {
        if ($this->disabled) {
            return;
        }

        $this->selected = collect($this->selected)
            ->reject(fn (string $selectedId): bool => $selectedId === $id)
            ->values()
            ->all();

        $this->refreshSelectedOptions();
        $this->updatedSearch();
    }

    /**
     * Removes the id currently at $index within $selected. D12's own reasoning ("the ids travel
     * in the exception message and the log, not the DOM") extends to an unresolvable chip's own
     * remove control: the raw id must never appear ANYWHERE in that chip's markup, including a
     * wire:click argument, so the view calls this by array position instead of
     * removeOption(string $id) for that one branch. A no-op, server-side, when the field is
     * disabled (D7) or the index no longer resolves to a selected id (a stale click racing a
     * concurrent removal).
     */
    public function removeOptionAt(int $index): void
    {
        if ($this->disabled) {
            return;
        }

        $id = $this->selected[$index] ?? null;

        if ($id === null) {
            return;
        }

        $this->removeOption($id);
    }

    /**
     * D12's consumer-facing helper — the second sanctioned way (besides a resolver's own
     * resolveSelected() call) a consumer's save path re-checks the selection independently of
     * this component's own $unresolvableSelected flag, which is UI state and must never be
     * trusted by a save: /livewire/update is an independent entry point.
     *
     * Phase 4 finding F-2: this used to catch only a thrown UnresolvedSelectionException, which
     * a resolver that (wrongly) returns a short array instead of throwing defeats entirely --
     * the exact defence in depth refreshSelectedOptions() already has. It now shares
     * resolveIdsAllowingPartialFailure() with refreshSelectedOptions(), so the two can never
     * disagree about what "resolved" means and this gate independently verifies coverage via
     * the same diff regardless of whether an exception was thrown at all.
     *
     * @throws ValidationException when any selected id is unresolvable
     */
    public function assertSelectionResolvable(): void
    {
        if ($this->selected === []) {
            return;
        }

        ['missingIds' => $missingIds] = $this->resolveIdsAllowingPartialFailure($this->selected);

        if ($missingIds !== []) {
            throw ValidationException::withMessages([
                $this->field => __('components.searchable_multi_select.unresolvable_selection'),
            ]);
        }
    }

    /**
     * D2's chip-label refresh, and D12's reject-never-drop mechanism — called on mount() and
     * after every select/remove.
     */
    private function refreshSelectedOptions(): void
    {
        if ($this->selected === []) {
            $this->selectedOptions = [];
            $this->unresolvableSelected = [];
            $this->resetErrorBag($this->field);

            return;
        }

        ['resolved' => $resolved, 'missingIds' => $missingIds] = $this->resolveIdsAllowingPartialFailure($this->selected);

        $this->selectedOptions = collect($resolved)->keyBy('id')->all();
        $this->unresolvableSelected = $missingIds;

        $this->resetErrorBag($this->field);

        if ($missingIds !== []) {
            $this->addError($this->field, __('components.searchable_multi_select.unresolvable_selection'));
        }
    }

    /**
     * Phase 4 re-audit finding R-2 (Low): a defence-in-depth CEILING on how many ids
     * resolveIdsAllowingPartialFailure() will ever hand to the resolver in one request — never a
     * product-facing selection limit. D5's own note is explicit that this component ships with no
     * `maxSelections` prop ("a shipping zone may bundle arbitrarily many geography entries"), so
     * this constant must never reject or silently drop a legitimate large selection; it exists
     * purely to bound a *tampered* `$selected` payload's cost against a future database-backed
     * resolver (0026/0027/0034), where an unbounded `whereIn(...)` is sized entirely by client
     * input. 500 sits far above any plausible real administrator selection (500+ geography
     * entries is already well beyond a real shipping zone) and matches the magnitude of the
     * existing defence-in-depth clamp on $fetchLimit in updatedSearch() (Phase 4 finding F-3),
     * for consistency rather than by coincidence.
     */
    private const MAX_RESOLVABLE_SELECTED = 500;

    /**
     * The single place that decides "is this id set fully resolved" (Phase 4 finding F-2) —
     * shared by assertSelectionResolvable() (D12's save-time gate) and refreshSelectedOptions()
     * (D2's chip-label refresh), so the two can never drift about what counts as resolved.
     *
     * resolveSelected() is a total function (D12): it either returns one entry per requested
     * id, or throws carrying every id it could not vouch for. On a throw, a second, narrower
     * call is attempted for the ids NOT named in the exception, so a mix of one bad id and
     * several good ones still resolves the good ones — that second call's own failure (a race,
     * or a still-misbehaving resolver) degrades to treating every one of those ids as
     * unresolvable too, rather than throwing out of here.
     *
     * Defence in depth against a resolver that (wrongly) returns a short array instead of
     * throwing (D12): any requested id absent from whatever was actually returned is folded
     * into the returned missingIds regardless of whether an exception was thrown at all — this
     * is what makes assertSelectionResolvable() catch a misbehaving resolver too, not only
     * refreshSelectedOptions()'s display path.
     *
     * Phase 4 re-audit finding R-2 (Low): $ids is drawn from $this->selected, client-writable on
     * every request (D4/D6 leave it unlocked so the #[Modelable] binding works). Before this fix,
     * a tampered several-thousand-id $selected reached resolveSelected() in full — and, because
     * this method's own retry branch above re-calls resolveSelected() whenever even one id is
     * unresolvable, a single call here could hand the resolver nearly the same huge id set
     * *twice* in one request (verified by execution: two calls, each carrying almost the full
     * tampered count). Slicing to self::MAX_RESOLVABLE_SELECTED here — before either the primary
     * or the retry call runs — fixes both problems with one change: neither call can ever exceed
     * the ceiling, so the pre-existing retry logic is left completely intact rather than
     * duplicated with a second cap. Every id beyond the ceiling is folded into the returned
     * missingIds via the *same* D12 mechanism a genuinely-unresolvable id uses — never a second
     * "too many" concept — so it renders exactly like any other unresolvable chip and is never
     * silently dropped from the selection, and it is never handed to the resolver at all. This
     * component has no `Gate::authorize()` call of its own (D7 — authorization belongs to the
     * resolver), so App\Actions\Auth\LogRefusedPrivilegedAttempt does not apply here: it is
     * shaped around a Gate ability plus a User/Role target, and this ceiling is neither.
     *
     * @param  array<int, string>  $ids
     * @return array{resolved: array<int, array{id: string, label: string, group: string|null, disabled: bool}>, missingIds: array<int, string>}
     */
    private function resolveIdsAllowingPartialFailure(array $ids): array
    {
        $boundedIds = array_slice($ids, 0, self::MAX_RESOLVABLE_SELECTED);
        $overflowIds = array_slice($ids, self::MAX_RESOLVABLE_SELECTED);

        $resolved = [];
        $missingIds = [];

        try {
            $resolved = $this->resolver()->resolveSelected($boundedIds);
        } catch (UnresolvedSelectionException $exception) {
            $missingIds = $exception->missingIds;

            $resolvableIds = array_values(array_diff($boundedIds, $missingIds));

            if ($resolvableIds !== []) {
                try {
                    $resolved = $this->resolver()->resolveSelected($resolvableIds);
                } catch (UnresolvedSelectionException) {
                    $resolved = [];
                }
            }
        }

        $returnedIds = collect($resolved)->pluck('id')->all();
        $missingIds = array_values(array_unique(array_merge(
            $missingIds,
            array_diff($boundedIds, $returnedIds, $missingIds),
            $overflowIds,
        )));

        return ['resolved' => $resolved, 'missingIds' => $missingIds];
    }

    /**
     * Whether the current $search, once normalized (D13), meets $minSearchLength — the view's
     * signal for "a search was actually performed" versus "too short, nothing offered, no
     * request made" (deliberately not re-derived inline in the Blade view, which would
     * reimplement the normalization D13 centralizes).
     */
    public function hasSearchedEnough(): bool
    {
        return mb_strlen(app(NormalizeForSearch::class)->__invoke($this->search)) >= $this->minSearchLength;
    }
}
