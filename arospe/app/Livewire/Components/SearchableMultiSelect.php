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
     * assertSelectionResolvable() raises its ValidationException against.
     */
    public string $field = 'selected';

    public int $minSearchLength = 1;

    public int $debounceMs = 300;

    public int $resultLimit = 20;

    /** Blank => lang fallback (D5). */
    public string $emptyStateText = '';

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
        if (! is_subclass_of($this->optionResolver, MultiSelectOptionsResolver::class)) {
            $this->throwMountValidationError(sprintf(
                '[%s] must implement %s.',
                $this->optionResolver,
                MultiSelectOptionsResolver::class,
            ));
        }

        if ($this->maxChipAreaHeight !== null && ! preg_match('/^\d+(\.\d+)?(rem|em|px|vh)$/', $this->maxChipAreaHeight)) {
            $this->throwMountValidationError(sprintf(
                '[%s] is not a valid CSS length for maxChipAreaHeight.',
                $this->maxChipAreaHeight,
            ));
        }

        $this->refreshSelectedOptions();
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
     * The debounce hook (D9) — `wire:model.live.debounce.{$debounceMs}ms="search"` in the view
     * drives this. Resolved with `app()`, deliberately: this is a Livewire `updated<Property>()`
     * lifecycle hook, invoked through `wrap($component)->__call($name, $params)` with FIXED
     * parameters rather than a container `call()`, so a type-hinted parameter here would never be
     * resolved — the same `app()` carve-out story 0020's Gallery::updatedPendingUploads() and this
     * class-style docblock precedent already establish
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

        if (mb_strlen($term) < $this->minSearchLength) {
            $this->results = [];
            $this->hasMoreResults = false;

            return;
        }

        // Over-fetch by the current selection count so excluding already-selected rows (D11)
        // can never leave fewer than $resultLimit + 1 candidates behind.
        $fetchLimit = $this->resultLimit + 1 + count($this->selected);

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
     * @throws ValidationException when any selected id is unresolvable
     */
    public function assertSelectionResolvable(): void
    {
        try {
            $this->resolver()->resolveSelected($this->selected);
        } catch (UnresolvedSelectionException) {
            throw ValidationException::withMessages([
                $this->field => __('components.searchable_multi_select.unresolvable_selection'),
            ]);
        }
    }

    /**
     * D2's chip-label refresh, and D12's reject-never-drop mechanism — called on mount() and
     * after every select/remove. resolveSelected() is a total function (D12): it either returns
     * one entry per requested id, or throws carrying every id it could not vouch for. On a throw,
     * a second, narrower call is attempted for the ids NOT named in the exception, so a mix of
     * one bad id and several good ones still renders correct labels for the good ones — that
     * second call's own failure (a race, or a still-misbehaving resolver) degrades to treating
     * every one of those ids as unresolvable too, rather than throwing out of here and 500-ing
     * the host screen.
     *
     * Defence in depth against a resolver that (wrongly) returns a short array instead of
     * throwing (D12): any requested id absent from whatever was actually returned is folded into
     * $unresolvableSelected regardless of whether an exception was thrown at all.
     */
    private function refreshSelectedOptions(): void
    {
        if ($this->selected === []) {
            $this->selectedOptions = [];
            $this->unresolvableSelected = [];
            $this->resetErrorBag($this->field);

            return;
        }

        $resolved = [];
        $missingIds = [];

        try {
            $resolved = $this->resolver()->resolveSelected($this->selected);
        } catch (UnresolvedSelectionException $exception) {
            $missingIds = $exception->missingIds;

            $resolvableIds = array_values(array_diff($this->selected, $missingIds));

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
            array_diff($this->selected, $returnedIds, $missingIds),
        )));

        $this->selectedOptions = collect($resolved)->keyBy('id')->all();
        $this->unresolvableSelected = $missingIds;

        $this->resetErrorBag($this->field);

        if ($missingIds !== []) {
            $this->addError($this->field, __('components.searchable_multi_select.unresolvable_selection'));
        }
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
