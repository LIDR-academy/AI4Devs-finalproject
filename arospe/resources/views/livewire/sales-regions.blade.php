<?php
/**
 * View for App\Livewire\SalesRegions\Index (story 0018). Flat path, not
 * sales-regions/index.blade.php -- the same Index-in-a-subfolder exception
 * App\Livewire\Users\Index and App\Livewire\Roles\Index already rely on; see
 * docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name.
 *
 * This story owns markup and UI state only. Every query, mutation,
 * validation rule and authorization decision belongs to sibling story
 * 0017's component class (app/Livewire/SalesRegions/Index.php) and its
 * actions -- nothing here re-derives them.
 *
 * D2/D3: grouping is a view-side concern over the flat, already-#[Locked]
 * $regions array. Sorted here (sortOrder, then name) even though
 * loadRegions() already orders the same way -- that ordering is a private
 * implementation detail of a method this story does not own, so the
 * markup must not become the thing that silently depends on it.
 *
 * D7: `kind` drives structure (indentation, chevron, grouping) everywhere
 * in the LIST. The one place it is surfaced as text is the edit modal's
 * read-only context block, per the Gherkin scenario "The edit form offers
 * no control for a structural attribute" -- App\Enums\SalesRegionKind is
 * read (->value / an enum match), never touched, and no label() method is
 * added to it; the two labels live in this story's own lang files instead
 * (sales-regions.labels.kind_country / kind_fiscal_territory). Recorded
 * here per D7's escape-hatch requirement ("must then be recorded, not
 * slipped in").
 */
?>
@php
    $allRegions = collect($regions);

    // D2: whereNull('parentId')->sortBy('sortOrder') then, per parent,
    // where('parentId', $row['id'])->sortBy('sortOrder') -- sortBy() is
    // last-applied-wins with a stable sort (PHP 8's sort functions are
    // stable), so sorting by 'name' first and 'sortOrder' last yields
    // sortOrder-primary, name-secondary ordering in one pass each.
    $topLevelRegions = $allRegions
        ->whereNull('parentId')
        ->sortBy('name')
        ->sortBy('sortOrder')
        ->values();

    $childrenByParent = $allRegions
        ->whereNotNull('parentId')
        ->sortBy('name')
        ->sortBy('sortOrder')
        ->groupBy('parentId');

    // Q1(a): the split that defines the two sections is is_active itself --
    // a real column, not an invented UI concept (Q2's own reasoning).
    $activeTopLevelRegions = $topLevelRegions->where('isActive', true)->values();
    $inactiveTopLevelRegions = $topLevelRegions->where('isActive', false)->values();

    // Alpine's initial state for each expandable parent's disclosure --
    // default-open (D3). @js() renders a plain JS object literal, so a
    // parent with no children today still yields a valid (empty) {}.
    $expandedParentsInit = $activeTopLevelRegions
        ->filter(fn (array $region): bool => $childrenByParent->has($region['id']))
        ->mapWithKeys(fn (array $region): array => [$region['id'] => true])
        ->all();

    $editingRegion = $editingRegionId !== null
        ? $allRegions->firstWhere('id', $editingRegionId)
        : null;

    $editingRegionIsDefault = $editingRegion !== null && $editingRegion['isDefault'] === true;
@endphp

<div class="w-full">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <flux:heading size="xl">{{ __('sales-regions.index.title') }}</flux:heading>
            <flux:subheading>
                {{ __('sales-regions.index.summary', [
                    'active' => $activeTopLevelRegions->count() + $childrenByParent->collapse()->count(),
                    'total' => $allRegions->count(),
                ]) }}
            </flux:subheading>
        </div>
    </div>

    {{-- A4-a: an orphaned replacementDefaultId refusal (SetSalesRegionActive re-reading
    is_default under lock and finding a row that became the default between paint and
    click) has no field on screen when it arrives from the inline row switch. Rendered
    only while the modal is closed -- the modal's own replacement select (below) carries
    the field-level copy of this same error, and the two must never both render at once. --}}
    @unless ($showModal)
        <div class="mt-4">
            <flux:error name="replacementDefaultId" />
        </div>
    @endunless

    {{-- Active entries: rendered open, Spain's fiscal territories grouped and
    collapsible (default-open) beneath "España" via Alpine (D2/D3). --}}
    <div class="mt-6" x-data="{ expandedParents: @js($expandedParentsInit) }">
        <flux:table>
            <flux:table.columns>
                <flux:table.column>{{ __('sales-regions.fields.code') }}</flux:table.column>
                <flux:table.column>{{ __('sales-regions.fields.name') }}</flux:table.column>
                <flux:table.column>{{ __('sales-regions.fields.description') }}</flux:table.column>
                <flux:table.column class="text-right">{{ __('sales-regions.fields.rate') }}</flux:table.column>
                <flux:table.column>{{ __('sales-regions.fields.active') }}</flux:table.column>
                <flux:table.column>{{ __('Actions') }}</flux:table.column>
            </flux:table.columns>

            <flux:table.rows>
                @foreach ($activeTopLevelRegions as $region)
                    @php $hasChildren = $childrenByParent->has($region['id']); @endphp

                    <flux:table.row :key="$region['id']">
                        <flux:table.cell>
                            @if ($region['code'])
                                <span class="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-700 dark:bg-white/10 dark:text-zinc-300">{{ $region['code'] }}</span>
                            @else
                                <span class="text-zinc-400 dark:text-zinc-500"></span>
                            @endif
                        </flux:table.cell>

                        <flux:table.cell>
                            <div class="flex items-center gap-2">
                                @if ($hasChildren)
                                    <button
                                        type="button"
                                        data-test="expand-region-{{ $region['id'] }}"
                                        aria-label="{{ __('sales-regions.labels.toggle_expand', ['name' => $region['name']]) }}"
                                        :aria-expanded="(expandedParents[@js($region['id'])] ?? true).toString()"
                                        @click="expandedParents[@js($region['id'])] = ! expandedParents[@js($region['id'])]"
                                        class="inline-flex items-center justify-center rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-200"
                                    >
                                        <flux:icon
                                            name="chevron-down"
                                            variant="micro"
                                            class="size-4 transition-transform"
                                            x-bind:class="{ '-rotate-90': ! expandedParents[@js($region['id'])] }"
                                        />
                                    </button>
                                @endif

                                <span class="font-medium text-zinc-800 dark:text-white">{{ $region['name'] }}</span>

                                @if ($region['isDefault'])
                                    <flux:badge color="amber" data-test="default-badge-region-{{ $region['id'] }}">
                                        {{ __('sales-regions.labels.default') }}
                                    </flux:badge>
                                @endif
                            </div>
                        </flux:table.cell>

                        <flux:table.cell class="max-w-xs truncate text-zinc-500 dark:text-zinc-400">
                            {{ $region['description'] }}
                        </flux:table.cell>

                        {{-- D6: NULL renders an em dash, never "0%"; a real 0.000 renders
                        "0%", never the em dash. String manipulation only -- rate is a
                        string|null from a decimal:3 cast, never (float) cast or compared. --}}
                        <flux:table.cell class="text-right tabular-nums">
                            {{ $region['rate'] === null ? '—' : rtrim(rtrim($region['rate'], '0'), '.').'%' }}
                        </flux:table.cell>

                        <flux:table.cell>
                            {{-- D5: inactive->active and active-but-not-default->inactive
                            never throw, so the inline switch handles both directly. D4:
                            deactivating the CURRENT DEFAULT is refused here -- disabled with
                            a tooltip routing to the edit modal (A3-a), never wired to
                            setActive() from this row. --}}
                            @if ($region['canEdit'] && ! $region['isDefault'])
                                <flux:switch
                                    wire:click="setActive({{ \Illuminate\Support\Js::from($region['id']) }}, {{ \Illuminate\Support\Js::from(! $region['isActive']) }}, '')"
                                    :checked="$region['isActive']"
                                    data-test="toggle-active-region-{{ $region['id'] }}"
                                    aria-label="{{ __('sales-regions.labels.toggle_active', ['name' => $region['name']]) }}"
                                    class="cursor-pointer!"
                                />
                            @else
                                {{-- Both documented Flux/Blaze traps (docs/errors-log.md): an
                                explicit @if/@else with a written-out <flux:tooltip> wrapper
                                (a conditionally-bound :tooltip prop renders on every row
                                regardless of the bound value), and cursor-not-allowed! on the
                                tooltip wrapper, never the disabled:pointer-events-none button. --}}
                                <flux:tooltip
                                    :content="! $region['canEdit'] ? __('sales-regions.index.action_not_allowed') : __('sales-regions.index.default_toggle_tooltip')"
                                    class="cursor-not-allowed!"
                                >
                                    <flux:switch
                                        :checked="$region['isActive']"
                                        data-test="toggle-active-region-{{ $region['id'] }}"
                                        aria-label="{{ __('sales-regions.labels.toggle_active', ['name' => $region['name']]) }}"
                                        disabled
                                    />
                                </flux:tooltip>
                            @endif
                        </flux:table.cell>

                        <flux:table.cell>
                            <div class="flex items-center gap-2">
                                @if ($region['canEdit'])
                                    <flux:button
                                        variant="ghost"
                                        size="sm"
                                        icon="pencil-square"
                                        aria-label="{{ __('Edit :name', ['name' => $region['name']]) }}"
                                        data-test="edit-region-{{ $region['id'] }}"
                                        data-parent-id="{{ $region['parentId'] ?? '' }}"
                                        wire:click="openEditModal(@js($region['id']))"
                                        class="cursor-pointer!"
                                    />
                                @else
                                    <flux:tooltip :content="__('sales-regions.index.action_not_allowed')" class="cursor-not-allowed!">
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="pencil-square"
                                            aria-label="{{ __('Edit :name', ['name' => $region['name']]) }}"
                                            data-test="edit-region-{{ $region['id'] }}"
                                            data-parent-id="{{ $region['parentId'] ?? '' }}"
                                            disabled
                                        />
                                    </flux:tooltip>
                                @endif

                                {{-- D10: never offerable on an already-default or an inactive
                                row -- both are refused here structurally, not only by the
                                action's own guard. --}}
                                @if ($region['canEdit'] && $region['isActive'] && ! $region['isDefault'])
                                    <flux:button
                                        variant="ghost"
                                        size="sm"
                                        icon="star"
                                        aria-label="{{ __('sales-regions.labels.set_default', ['name' => $region['name']]) }}"
                                        data-test="set-default-region-{{ $region['id'] }}"
                                        wire:click="setDefault(@js($region['id']))"
                                        class="cursor-pointer!"
                                    />
                                @else
                                    <flux:tooltip :content="__('sales-regions.index.action_not_allowed')" class="cursor-not-allowed!">
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="star"
                                            aria-label="{{ __('sales-regions.labels.set_default', ['name' => $region['name']]) }}"
                                            data-test="set-default-region-{{ $region['id'] }}"
                                            disabled
                                        />
                                    </flux:tooltip>
                                @endif
                            </div>
                        </flux:table.cell>
                    </flux:table.row>

                    @if ($hasChildren)
                        @foreach ($childrenByParent[$region['id']] as $child)
                            <flux:table.row :key="$child['id']" x-show="expandedParents[@js($region['id'])] ?? true">
                                <flux:table.cell>
                                    @if ($child['code'])
                                        <span class="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-700 dark:bg-white/10 dark:text-zinc-300">{{ $child['code'] }}</span>
                                    @else
                                        <span class="text-zinc-400 dark:text-zinc-500"></span>
                                    @endif
                                </flux:table.cell>

                                <flux:table.cell>
                                    <div class="flex items-center gap-2 pl-6">
                                        <span class="font-medium text-zinc-800 dark:text-white">{{ $child['name'] }}</span>

                                        @if ($child['isDefault'])
                                            <flux:badge color="amber" data-test="default-badge-region-{{ $child['id'] }}">
                                                {{ __('sales-regions.labels.default') }}
                                            </flux:badge>
                                        @endif
                                    </div>
                                </flux:table.cell>

                                <flux:table.cell class="max-w-xs truncate text-zinc-500 dark:text-zinc-400">
                                    {{ $child['description'] }}
                                </flux:table.cell>

                                <flux:table.cell class="text-right tabular-nums">
                                    {{ $child['rate'] === null ? '—' : rtrim(rtrim($child['rate'], '0'), '.').'%' }}
                                </flux:table.cell>

                                <flux:table.cell>
                                    @if ($child['canEdit'] && ! $child['isDefault'])
                                        <flux:switch
                                            wire:click="setActive({{ \Illuminate\Support\Js::from($child['id']) }}, {{ \Illuminate\Support\Js::from(! $child['isActive']) }}, '')"
                                            :checked="$child['isActive']"
                                            data-test="toggle-active-region-{{ $child['id'] }}"
                                            aria-label="{{ __('sales-regions.labels.toggle_active', ['name' => $child['name']]) }}"
                                            class="cursor-pointer!"
                                        />
                                    @else
                                        <flux:tooltip
                                            :content="! $child['canEdit'] ? __('sales-regions.index.action_not_allowed') : __('sales-regions.index.default_toggle_tooltip')"
                                            class="cursor-not-allowed!"
                                        >
                                            <flux:switch
                                                :checked="$child['isActive']"
                                                data-test="toggle-active-region-{{ $child['id'] }}"
                                                aria-label="{{ __('sales-regions.labels.toggle_active', ['name' => $child['name']]) }}"
                                                disabled
                                            />
                                        </flux:tooltip>
                                    @endif
                                </flux:table.cell>

                                <flux:table.cell>
                                    <div class="flex items-center gap-2">
                                        @if ($child['canEdit'])
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="pencil-square"
                                                aria-label="{{ __('Edit :name', ['name' => $child['name']]) }}"
                                                data-test="edit-region-{{ $child['id'] }}"
                                                data-parent-id="{{ $child['parentId'] ?? '' }}"
                                                wire:click="openEditModal(@js($child['id']))"
                                                class="cursor-pointer!"
                                            />
                                        @else
                                            <flux:tooltip :content="__('sales-regions.index.action_not_allowed')" class="cursor-not-allowed!">
                                                <flux:button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon="pencil-square"
                                                    aria-label="{{ __('Edit :name', ['name' => $child['name']]) }}"
                                                    data-test="edit-region-{{ $child['id'] }}"
                                                    data-parent-id="{{ $child['parentId'] ?? '' }}"
                                                    disabled
                                                />
                                            </flux:tooltip>
                                        @endif

                                        @if ($child['canEdit'] && $child['isActive'] && ! $child['isDefault'])
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="star"
                                                aria-label="{{ __('sales-regions.labels.set_default', ['name' => $child['name']]) }}"
                                                data-test="set-default-region-{{ $child['id'] }}"
                                                wire:click="setDefault(@js($child['id']))"
                                                class="cursor-pointer!"
                                            />
                                        @else
                                            <flux:tooltip :content="__('sales-regions.index.action_not_allowed')" class="cursor-not-allowed!">
                                                <flux:button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon="star"
                                                    aria-label="{{ __('sales-regions.labels.set_default', ['name' => $child['name']]) }}"
                                                    data-test="set-default-region-{{ $child['id'] }}"
                                                    disabled
                                                />
                                            </flux:tooltip>
                                        @endif
                                    </div>
                                </flux:table.cell>
                            </flux:table.row>
                        @endforeach
                    @endif
                @endforeach
            </flux:table.rows>
        </flux:table>
    </div>

    {{-- Q1(a): the 248 seeded-but-unconfigured countries sit behind one collapsed,
    closed-on-first-paint "Show all countries" section with a client-side text filter
    over name/code. A1-a: activating a row from here is what moves it into the active
    table on the next render -- no stability hack keeps it in place. A1-b: `open` and
    `filterText` live on this single, un-looped element, which Livewire's morph
    preserves across a round trip (the same mechanism D3's expandedParents relies on),
    so the disclosure state and the filter text both survive an inline setActive() call.
    x-show over the 248 rows (not <template x-if>), consistent with D3's expansion --
    left to Phase 3 by Q1, and this is the choice made; revisit only if paint jank is
    measured against the real ~248-row seeded catalog. --}}
    <div
        class="mt-6"
        x-data="{
            open: false,
            filterText: '',
            matchesFilter(name, code) {
                const query = this.filterText.trim().toLowerCase();

                return query === '' || name.includes(query) || code.includes(query);
            },
        }"
    >
        <flux:button
            variant="ghost"
            data-test="show-all-countries-toggle"
            @click="open = ! open"
            x-bind:aria-expanded="open.toString()"
            class="cursor-pointer!"
        >
            <flux:icon name="chevron-down" variant="micro" class="size-4 transition-transform" x-bind:class="{ '-rotate-90': ! open }" />
            {{ __('sales-regions.labels.show_all_countries') }} ({{ $inactiveTopLevelRegions->count() }})
        </flux:button>

        <div x-show="open" class="mt-3 space-y-3">
            <flux:input
                type="text"
                data-test="show-all-countries-filter"
                x-model="filterText"
                :placeholder="__('sales-regions.labels.filter_countries_placeholder')"
            />

            <flux:table>
                <flux:table.columns>
                    <flux:table.column>{{ __('sales-regions.fields.code') }}</flux:table.column>
                    <flux:table.column>{{ __('sales-regions.fields.name') }}</flux:table.column>
                    <flux:table.column>{{ __('sales-regions.fields.description') }}</flux:table.column>
                    <flux:table.column class="text-right">{{ __('sales-regions.fields.rate') }}</flux:table.column>
                    <flux:table.column>{{ __('sales-regions.fields.active') }}</flux:table.column>
                    <flux:table.column>{{ __('Actions') }}</flux:table.column>
                </flux:table.columns>

                <flux:table.rows>
                    @foreach ($inactiveTopLevelRegions as $region)
                        <flux:table.row
                            :key="$region['id']"
                            x-show="matchesFilter(@js(\Illuminate\Support\Str::lower($region['name'])), @js(\Illuminate\Support\Str::lower($region['code'] ?? '')))"
                        >
                            <flux:table.cell>
                                @if ($region['code'])
                                    <span class="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-700 dark:bg-white/10 dark:text-zinc-300">{{ $region['code'] }}</span>
                                @else
                                    <span class="text-zinc-400 dark:text-zinc-500"></span>
                                @endif
                            </flux:table.cell>

                            <flux:table.cell>
                                <span class="font-medium text-zinc-800 dark:text-white">{{ $region['name'] }}</span>
                            </flux:table.cell>

                            <flux:table.cell class="max-w-xs truncate text-zinc-500 dark:text-zinc-400">
                                {{ $region['description'] }}
                            </flux:table.cell>

                            <flux:table.cell class="text-right tabular-nums">
                                {{ $region['rate'] === null ? '—' : rtrim(rtrim($region['rate'], '0'), '.').'%' }}
                            </flux:table.cell>

                            <flux:table.cell>
                                @if ($region['canEdit'])
                                    <flux:switch
                                        wire:click="setActive({{ \Illuminate\Support\Js::from($region['id']) }}, {{ \Illuminate\Support\Js::from(! $region['isActive']) }}, '')"
                                        :checked="$region['isActive']"
                                        data-test="toggle-active-region-{{ $region['id'] }}"
                                        aria-label="{{ __('sales-regions.labels.toggle_active', ['name' => $region['name']]) }}"
                                        class="cursor-pointer!"
                                    />
                                @else
                                    <flux:tooltip :content="__('sales-regions.index.action_not_allowed')" class="cursor-not-allowed!">
                                        <flux:switch
                                            :checked="$region['isActive']"
                                            data-test="toggle-active-region-{{ $region['id'] }}"
                                            aria-label="{{ __('sales-regions.labels.toggle_active', ['name' => $region['name']]) }}"
                                            disabled
                                        />
                                    </flux:tooltip>
                                @endif
                            </flux:table.cell>

                            <flux:table.cell>
                                <div class="flex items-center gap-2">
                                    @if ($region['canEdit'])
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="pencil-square"
                                            aria-label="{{ __('Edit :name', ['name' => $region['name']]) }}"
                                            data-test="edit-region-{{ $region['id'] }}"
                                            data-parent-id="{{ $region['parentId'] ?? '' }}"
                                            wire:click="openEditModal(@js($region['id']))"
                                            class="cursor-pointer!"
                                        />
                                    @else
                                        <flux:tooltip :content="__('sales-regions.index.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="pencil-square"
                                                aria-label="{{ __('Edit :name', ['name' => $region['name']]) }}"
                                                data-test="edit-region-{{ $region['id'] }}"
                                                data-parent-id="{{ $region['parentId'] ?? '' }}"
                                                disabled
                                            />
                                        </flux:tooltip>
                                    @endif

                                    {{-- D10: an inactive row can never be the default. --}}
                                    <flux:tooltip :content="__('sales-regions.index.action_not_allowed')" class="cursor-not-allowed!">
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="star"
                                            aria-label="{{ __('sales-regions.labels.set_default', ['name' => $region['name']]) }}"
                                            data-test="set-default-region-{{ $region['id'] }}"
                                            disabled
                                        />
                                    </flux:tooltip>
                                </div>
                            </flux:table.cell>
                        </flux:table.row>
                    @endforeach
                </flux:table.rows>
            </flux:table>
        </div>
    </div>

    {{-- Edit modal (D4/D5): code/description/rate only. Name, slug and kind are
    read-only context with no form control at all -- the PRD's "a structural
    attribute cannot be changed" requirement, satisfied structurally rather than by
    filtering input. --}}
    <flux:modal name="sales-region-modal" class="max-w-md md:min-w-md" @close="closeModal" wire:model="showModal">
        @if ($showModal)
            <div class="space-y-6">
                <div class="space-y-1">
                    <flux:heading size="lg">{{ __('Edit :name', ['name' => $editingRegion['name'] ?? '']) }}</flux:heading>

                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                        <span>
                            <span class="font-medium">{{ __('sales-regions.fields.slug') }}:</span>
                            {{ $editingRegion['slug'] ?? '' }}
                        </span>
                        <span>
                            <span class="font-medium">{{ __('sales-regions.fields.kind') }}:</span>
                            {{ ($editingRegion['kind'] ?? null) === \App\Enums\SalesRegionKind::FiscalTerritory
                                ? __('sales-regions.labels.kind_fiscal_territory')
                                : __('sales-regions.labels.kind_country') }}
                        </span>
                    </div>
                </div>

                <div class="space-y-4">
                    <flux:input wire:model="code" :label="__('sales-regions.fields.code')" maxlength="10" />

                    <flux:textarea wire:model="description" :label="__('sales-regions.fields.description')" rows="3" />

                    {{-- D1: type="text" inputmode="decimal", never type="number" -- a
                    native number input performs its own client-side parsing and the
                    Spanish-locale decimal comma never reaches the wire payload. --}}
                    <flux:input
                        type="text"
                        inputmode="decimal"
                        wire:model="rate"
                        :label="__('sales-regions.fields.rate')"
                    />

                    {{-- D4: the replacement select is only ever relevant while the entry being
                    edited IS the current default -- revealed the instant the switch below is
                    flipped off, with no round trip.

                    The "switch" is a plain native <input type="checkbox">, styled with
                    Tailwind's has-checked variant to look like one, deliberately NOT
                    <flux:switch>: a Flux <ui-switch> dispatches its own "input"/"change" events
                    with bubbles:false (verified in vendor/livewire/flux/dist/flux-lite.min.js).

                    Bound via wire:click="$toggle('active')" -- a real Livewire ACTION call, not
                    wire:model -- rather than the form's other fields (code/description/rate),
                    which all use plain wire:model successfully. This is a deliberate, verified
                    asymmetry: under real-browser Pest/Playwright automation in this environment,
                    a bare wire:model on this checkbox left the DOM's own wire:snapshot attribute
                    (the ground truth of what the next request will send) stuck at the PRE-click
                    value even though the checkbox's own DOM state and Livewire's client-side
                    reactive proxy ($wire.active / Livewire.first().active) both correctly showed
                    the toggled value -- confirmed by reading that attribute directly, not by
                    inferring it from a flaky test run. wire:click="$toggle(...)" sidesteps this
                    because it is a genuine round-trip action (same mechanism the row-level
                    setActive() switch already uses reliably), not a deferred property sync. x-show
                    below reads $wire.active directly, which stays correct either way. --}}
                    <label class="group inline-flex items-center gap-2 cursor-pointer">
                        <span class="relative inline-flex h-5 w-8 shrink-0 items-center rounded-full bg-zinc-800/15 transition group-has-checked:bg-(--color-accent) dark:border dark:border-white/20 dark:bg-transparent dark:group-has-checked:border-0">
                            <input
                                type="checkbox"
                                @checked($active)
                                wire:click="$toggle('active')"
                                data-test="modal-active-switch"
                                aria-label="{{ __('sales-regions.fields.active') }}"
                                class="absolute inset-0 size-full cursor-pointer opacity-0"
                            />
                            <span class="pointer-events-none inline-block size-3.5 translate-x-0.5 rounded-full bg-white transition group-has-checked:translate-x-[0.9375rem]"></span>
                        </span>
                        <span class="text-sm text-zinc-700 dark:text-zinc-300">{{ __('sales-regions.fields.active') }}</span>
                    </label>

                    @if ($editingRegionIsDefault)
                        <div x-show="! $wire.active" class="mt-4">
                            <flux:select
                                wire:model="replacementDefaultId"
                                :label="__('sales-regions.fields.replacement_default')"
                                :placeholder="__('sales-regions.labels.select_replacement')"
                                data-test="modal-replacement-select"
                            >
                                @foreach ($this->replacementCandidates as $candidate)
                                    <flux:select.option value="{{ $candidate['id'] }}">{{ $candidate['name'] }}</flux:select.option>
                                @endforeach
                            </flux:select>
                        </div>
                    @endif
                </div>

                <div class="flex gap-3 justify-end">
                    <flux:button variant="outline" wire:click="closeModal">
                        {{ __('Cancel') }}
                    </flux:button>

                    <flux:button
                        variant="primary"
                        wire:click="save"
                        wire:loading.attr="disabled"
                        wire:target="save"
                    >
                        {{ __('Save') }}
                    </flux:button>
                </div>
            </div>
        @endif
    </flux:modal>
</div>
