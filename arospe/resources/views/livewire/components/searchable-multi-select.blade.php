{{--
    Story 0022 -- the shared searchable, server-side-filtered multi-select. Assembled from
    flux:input + flux:menu.group/.heading/.item + flux:badge/flux:badge.close (D10 -- Flux Free has
    no combobox). Grouped results render when any result carries a `group` (D3), flat when none do.

    D9 names `flux:dropdown` as the mechanism for open/close, citing
    resources/views/components/desktop-user-menu.blade.php as prior art. Verified NOT to work for
    this composition, by executing a real browser rather than reasoning about it: Flux's own
    `ui-dropdown` custom element resolves its trigger with `this.querySelector("button")`
    (vendor/livewire/flux/dist/flux.min.js) -- a hard requirement that the trigger contain a real
    `<button>` descendant. desktop-user-menu's trigger is `<flux:sidebar.profile>`, which renders a
    `<button>`; `<flux:input>` renders only an `<input>`, so `trigger()` returns null and `ui-menu`'s
    own boot() -- which unconditionally calls `w(e.trigger(), "keydown", ...)` when nested under a
    `ui-dropdown` parent -- throws `Cannot read properties of null (reading 'addEventListener')` on
    EVERY page load, confirmed live via `assertNoJavaScriptErrors()`. This view uses the same manual
    x-show/x-cloak/click.outside popover shape `wysiwyg-editor.blade.php`'s own D8 link popover
    already established for an identical reason ("ui-dropdown's own toggle mechanics are unverified
    against this exact content shape") -- not a new pattern, this component's second use of it.
    `flux:menu.group` / `.heading` / `.item` (plain presentational components, no `ui-menu` custom
    element) are kept for their styling; only the `<flux:menu>` OUTER wrapper -- the one that renders
    `<ui-menu popover="manual">` -- is replaced.

    `wire:model.live.debounce.{{ $debounceMs }}ms` cannot be written as an ATTRIBUTE NAME:
    Blade's ComponentTagCompiler parses a component tag's attribute NAMES with the regex
    `[\w\-:.@%]+`, which does not include `{`/`}`/`$` -- an interpolated
    `wire:model.live.debounce.{{ $debounceMs }}ms` attribute NAME does not compile the way a
    value would, since compileComponentTags() runs before Blade's own `{{ }}` echo compiler even
    sees the string. This is the reason resources/views/livewire/media/gallery.blade.php hard-
    codes its own "300ms" literal for the identical directive shape.

    Fixed here (N1, code review) rather than left as a documented gap, because $debounceMs is
    part of D5's public contract and a consumer setting `debounceMs={100}` silently getting
    300ms anyway contradicts it. The fix follows the working precedent this codebase already
    has for a debounce whose duration is not bakeable into a wire:*.debounce.Xms modifier --
    resources/views/livewire/components/wysiwyg-editor.blade.php's wire:ignore'd region, which
    debounces via a hand-rolled Alpine setTimeout() + $wire.set() instead of a Livewire
    attribute modifier. The trap above is specific to an interpolated ATTRIBUTE NAME on a
    component tag; {{ $debounceMs }} interpolated inside an ordinary attribute VALUE (the
    x-on:input expression below) is not that shape at all -- Blade echoes inside a component
    tag's attribute VALUES compile correctly throughout this file (:name, data-test="...-{{
    $id }}", etc.), and $debounceMs here is no different.
--}}
<div
    x-data="{ multiSelectOpen: false, searchDebounceTimeout: null }"
    x-on:click.outside="multiSelectOpen = false"
    class="relative w-full"
>
    @if ($disabled)
        <flux:input
            type="text"
            :label="$label !== '' ? $label : null"
            :placeholder="$placeholder"
            disabled
            data-test="searchable-multi-select-search"
        />
    @else
        {{--
            :name overrides flux:input's own wire:model-derived default ("search") with the
            component's own $label -- deliberately, so a browser test can resolve this field the
            way this project's own convention resolves every other flux:input (Pest browser's
            GuessLocator tries `[name="..."]` before falling back to a text search), which a
            generic reusable component's per-consumer $label is the only stable, human-meaningful
            name available for. Flux's own label association (<ui-label>, no `for`/`id`) is a
            plain unassociated tag, not a real <label>, so GuessLocator's text-search fallback
            resolves to it and fails actionability -- verified live, not assumed.
        --}}
        {{--
            wire:model (NOT .live): the debounce dispatch below is what triggers the request,
            never a native Livewire debounce modifier -- see the file banner comment. A plain
            wire:model still keeps this input's DOM value deferred-bound to $search as a
            fallback, matching every other non-.live field's behaviour in this codebase.
        --}}
        <flux:input
            type="text"
            :label="$label !== '' ? $label : null"
            :name="$label !== '' ? $label : 'search'"
            :placeholder="$placeholder"
            wire:model="search"
            autocomplete="off"
            x-on:focus="multiSelectOpen = true"
            x-on:input="clearTimeout(searchDebounceTimeout); searchDebounceTimeout = setTimeout(() => $wire.set('search', $event.target.value), {{ $debounceMs }})"
            data-test="searchable-multi-select-search"
        />
    @endif

    <flux:error :name="$field" />

    {{-- D14: purely additive. When $maxChipAreaHeight is null the chip container renders with no
    `style` attribute and no overflow class at all -- byte-identical to the markup before this
    prop existed. Written as two full branches, not one conditionally-bound `style`/`class`
    attribute, matching this file's own disabled-option pattern above (the trap the errors log
    records is specific to a directive folded INSIDE a <flux:*> tag's attribute list; this <div>
    is plain HTML, but the two-branch shape is kept for consistency and because it is the only
    way to guarantee zero extra attributes in the unbounded case). --}}
    @if ($maxChipAreaHeight !== null)
        <div
            data-test="searchable-multi-select-chip-area"
            role="group"
            aria-label="{{ __('components.searchable_multi_select.chip_area_label') }}"
            style="max-height: {{ $maxChipAreaHeight }}"
            class="mt-2 flex max-w-md flex-wrap gap-2 overflow-y-auto"
        >
            {{-- D12: iterate $selected (every selected id, resolvable or not), never
            $selectedOptions -- an id resolveSelected() could not vouch for at all has no
            entry in $selectedOptions, and rendering from that map would silently drop its
            chip instead of showing the required "unavailable" variant. --}}
            @foreach ($selected as $id)
                @if (in_array($id, $unresolvableSelected, true))
                    {{-- D12: "the ids travel in the exception message and the log, not the DOM" --
                    this extends to the remove control's own wire:click argument. Never @js($id)
                    here: removeOptionAt() takes the loop's array POSITION instead of the raw id,
                    so an unresolvable id never appears anywhere in this branch's markup. --}}
                    <flux:badge color="red" data-test="searchable-multi-select-chip-unavailable-{{ $loop->index }}">
                        {{ __('components.searchable_multi_select.unavailable_option') }}
                        <flux:badge.close
                            wire:click="removeOptionAt({{ $loop->index }})"
                            aria-label="{{ __('components.searchable_multi_select.remove_chip', ['label' => __('components.searchable_multi_select.unavailable_option')]) }}"
                            data-test="searchable-multi-select-chip-remove-unavailable-{{ $loop->index }}"
                        />
                    </flux:badge>
                @else
                    <flux:badge data-test="searchable-multi-select-chip-{{ $id }}">
                        {{ $selectedOptions[$id]['label'] ?? '' }}
                        <flux:badge.close
                            wire:click="removeOption(@js($id))"
                            aria-label="{{ __('components.searchable_multi_select.remove_chip', ['label' => $selectedOptions[$id]['label'] ?? '']) }}"
                            data-test="searchable-multi-select-chip-remove-{{ $id }}"
                        />
                    </flux:badge>
                @endif
            @endforeach
        </div>
    @else
        <div data-test="searchable-multi-select-chip-area" class="mt-2 flex flex-wrap gap-2">
            @foreach ($selected as $id)
                @if (in_array($id, $unresolvableSelected, true))
                    <flux:badge color="red" data-test="searchable-multi-select-chip-unavailable-{{ $loop->index }}">
                        {{ __('components.searchable_multi_select.unavailable_option') }}
                        <flux:badge.close
                            wire:click="removeOptionAt({{ $loop->index }})"
                            aria-label="{{ __('components.searchable_multi_select.remove_chip', ['label' => __('components.searchable_multi_select.unavailable_option')]) }}"
                            data-test="searchable-multi-select-chip-remove-unavailable-{{ $loop->index }}"
                        />
                    </flux:badge>
                @else
                    <flux:badge data-test="searchable-multi-select-chip-{{ $id }}">
                        {{ $selectedOptions[$id]['label'] ?? '' }}
                        <flux:badge.close
                            wire:click="removeOption(@js($id))"
                            aria-label="{{ __('components.searchable_multi_select.remove_chip', ['label' => $selectedOptions[$id]['label'] ?? '']) }}"
                            data-test="searchable-multi-select-chip-remove-{{ $id }}"
                        />
                    </flux:badge>
                @endif
            @endforeach
        </div>
    @endif

    {{-- Rendered AFTER the chip area, not right after the input, so its `position: absolute`
    box's static-position offset (no explicit `top-*` is set anywhere on this element -- it has
    always relied on document flow, hence the plain `mt-1`) falls below the chips rather than on
    top of them. Before this reordering, an open dropdown with any rendered height (including
    just the empty-state message) visually and interactively covered the chip area beneath it --
    document.elementFromPoint() at a chip's own remove control's coordinates returned the
    dropdown's empty-state div, not the button, so a real click on it (Playwright's
    actionability-checked click, not Livewire::test()->call()) never reached the control and hung
    until Playwright's own click timeout. Confirmed by direct browser reproduction, not assumed;
    do not move this back next to the input for "readability" without re-checking that. --}}
    <div
        x-show="multiSelectOpen"
        x-cloak
        x-on:keydown.escape.window="multiSelectOpen = false"
        class="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-[.3125rem] shadow-xs dark:border-zinc-600 dark:bg-zinc-700"
    >
        @if ($this->hasSearchedEnough())
            @php
                $hasGroups = collect($results)->contains(fn (array $option): bool => $option['group'] !== null);
            @endphp

            @if ($results === [])
                <div data-test="searchable-multi-select-empty-state" class="px-3 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    {{ $emptyStateText !== '' ? $emptyStateText : __('components.searchable_multi_select.empty_state') }}
                </div>
            @elseif ($hasGroups)
                @foreach (collect($results)->groupBy('group') as $groupName => $groupOptions)
                    <flux:menu.group>
                        @if ($groupName !== null && $groupName !== '')
                            <flux:menu.heading data-test="searchable-multi-select-group-heading">{{ $groupName }}</flux:menu.heading>
                        @endif

                        @foreach ($groupOptions as $option)
                            @if ($option['disabled'])
                                <flux:tooltip :content="__('components.searchable_multi_select.unavailable_option_reason')" class="cursor-not-allowed!">
                                    <flux:menu.item data-test="searchable-multi-select-option-{{ $option['id'] }}" disabled>
                                        {{ $option['label'] }}
                                    </flux:menu.item>
                                </flux:tooltip>
                            @else
                                <flux:menu.item
                                    data-test="searchable-multi-select-option-{{ $option['id'] }}"
                                    wire:click="selectOption(@js($option['id']))"
                                >
                                    {{ $option['label'] }}
                                </flux:menu.item>
                            @endif
                        @endforeach
                    </flux:menu.group>
                @endforeach
            @else
                @foreach ($results as $option)
                    @if ($option['disabled'])
                        <flux:tooltip :content="__('components.searchable_multi_select.unavailable_option_reason')" class="cursor-not-allowed!">
                            <flux:menu.item data-test="searchable-multi-select-option-{{ $option['id'] }}" disabled>
                                {{ $option['label'] }}
                            </flux:menu.item>
                        </flux:tooltip>
                    @else
                        <flux:menu.item
                            data-test="searchable-multi-select-option-{{ $option['id'] }}"
                            wire:click="selectOption(@js($option['id']))"
                        >
                            {{ $option['label'] }}
                        </flux:menu.item>
                    @endif
                @endforeach
            @endif

            @if ($hasMoreResults)
                <flux:menu.separator />
                <div data-test="searchable-multi-select-truncated" class="px-3 py-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    {{ __('components.searchable_multi_select.truncated') }}
                </div>
            @endif
        @endif
    </div>
</div>
