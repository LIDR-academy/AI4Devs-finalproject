{{--
    Story 0030 -- the real screen replacing 0028's placeholder. Flat `flux:table` of types (no
    accordion/master-detail -- Flux Free ships neither primitive, and 0028's valuePreview field
    only makes sense for a flat summary row, see the task file's decision 1). Editing happens
    entirely inside one create/edit modal that also holds the inline, reorderable values
    repeater.

    App\Livewire\Products\AttributeTypes\Index resolves to THIS flat path
    (products/attribute-types.blade.php), one level shallower than the class, per the
    Index-in-a-subfolder exception in docs/conventions/naming.md -- do NOT create
    resources/views/livewire/products/attribute-types/index.blade.php.
--}}
<div class="w-full">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <flux:heading size="xl">{{ __('Attribute types') }}</flux:heading>
            <flux:subheading>
                {{ __('products.attribute_types.summary', ['total' => $this->typesSummary['total'], 'values' => $this->typesSummary['values']]) }}
            </flux:subheading>
        </div>

        <flux:button variant="primary" icon="plus" wire:click="openCreateModal">
            {{ __('New attribute type') }}
        </flux:button>
    </div>

    <div class="mt-6">
        @if (count($types) > 0)
            <flux:table>
                <flux:table.columns>
                    <flux:table.column>{{ __('Name') }}</flux:table.column>
                    <flux:table.column>{{ __('Values') }}</flux:table.column>
                    <flux:table.column>{{ __('Actions') }}</flux:table.column>
                </flux:table.columns>

                <flux:table.rows>
                    @foreach ($types as $type)
                        <flux:table.row :key="$type['id']">
                            <flux:table.cell>
                                <div class="font-medium text-zinc-800 dark:text-white">{{ $type['name'] }}</div>
                            </flux:table.cell>

                            <flux:table.cell>
                                <div class="flex items-center gap-2">
                                    <flux:badge size="sm" data-test="value-count-{{ $type['id'] }}">{{ $type['valueCount'] }}</flux:badge>

                                    {{-- valuePreview (0028) is the FULL, un-truncated comma-joined
                                    string -- 0028's own Q2/OQ-3 resolution left truncation to this
                                    view. Truncated here to the first five values plus a "+N more"
                                    suffix built from valueCount, matching OQ-3's recommendation;
                                    valueCount === 0 renders an em dash, the same convention
                                    users.blade.php already uses for a roleless user's role cell. --}}
                                    @if ($type['valueCount'] === 0)
                                        <span class="text-zinc-500 dark:text-zinc-400 text-sm" data-test="value-preview-{{ $type['id'] }}">&mdash;</span>
                                    @else
                                        @php
                                            // Splitting valuePreview on ', ' assumes no individual
                                            // value's own text contains that exact substring --
                                            // true for every value in this domain's own examples
                                            // (sizes, colors) and accepted as a known limitation
                                            // rather than re-deriving the array from a string 0028
                                            // already joined.
                                            $previewParts = explode(', ', $type['valuePreview']);
                                            $previewShown = array_slice($previewParts, 0, 5);
                                            $previewRemaining = $type['valueCount'] - count($previewShown);
                                        @endphp
                                        <span class="text-zinc-500 dark:text-zinc-400 text-sm truncate" data-test="value-preview-{{ $type['id'] }}">
                                            {{ implode(', ', $previewShown) }}@if ($previewRemaining > 0) {{ __('products.attribute_types.value_preview_more', ['count' => $previewRemaining]) }}@endif
                                        </span>
                                    @endif
                                </div>
                            </flux:table.cell>

                            <flux:table.cell>
                                <div class="flex items-center gap-2">
                                    {{-- flux:button's own `tooltip` prop can't be bound conditionally:
                                    Livewire/Blaze's compiled attribute handling treats the prop as
                                    present whenever `tooltip=`/`:tooltip=` is written on the tag at
                                    all, regardless of the bound value -- an empty tooltip bubble on
                                    every enabled row. Wrapping with flux:tooltip ourselves, only in
                                    the disabled branch, keeps the attribute off the tag entirely when
                                    it doesn't apply. See docs/errors-log.md. --}}
                                    @if ($type['canEdit'])
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="pencil-square"
                                            aria-label="{{ __('Edit :name', ['name' => $type['name']]) }}"
                                            data-test="edit-type-{{ $type['id'] }}"
                                            wire:click="openEditModal(@js($type['id']))"
                                            class="cursor-pointer!"
                                        />
                                    @else
                                        {{-- cursor-not-allowed! lives on <flux:tooltip> (-> <ui-tooltip>),
                                        not on the disabled <button> -- Flux's own
                                        disabled:pointer-events-none takes the button out of
                                        hit-testing, so a cursor rule on the button itself never
                                        renders. See docs/errors-log.md. --}}
                                        <flux:tooltip :content="__('products.attribute_types.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="pencil-square"
                                                aria-label="{{ __('Edit :name', ['name' => $type['name']]) }}"
                                                data-test="edit-type-{{ $type['id'] }}"
                                                disabled
                                            />
                                        </flux:tooltip>
                                    @endif

                                    @if ($type['canDelete'])
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="trash"
                                            aria-label="{{ __('Delete :name', ['name' => $type['name']]) }}"
                                            data-test="delete-type-{{ $type['id'] }}"
                                            wire:click="confirmDelete(@js($type['id']))"
                                            class="cursor-pointer! text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                        />
                                    @else
                                        <flux:tooltip :content="__('products.attribute_types.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="trash"
                                                aria-label="{{ __('Delete :name', ['name' => $type['name']]) }}"
                                                data-test="delete-type-{{ $type['id'] }}"
                                                disabled
                                                class="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                            />
                                        </flux:tooltip>
                                    @endif
                                </div>
                            </flux:table.cell>
                        </flux:table.row>
                    @endforeach
                </flux:table.rows>
            </flux:table>
        @else
            <div class="p-8 text-center border rounded-lg border-zinc-200 dark:border-zinc-700" data-test="attribute-types-empty-state">
                <flux:text>{{ __('products.attribute_types.no_types') }}</flux:text>
            </div>
        @endif
    </div>

    {{-- Create / edit modal + inline values repeater --}}
    <flux:modal name="attribute-type-modal" class="max-w-lg md:min-w-lg" @close="closeModal" wire:model="showModal">
        {{-- Only renders while the modal is open, so its "Cancel" text never collides with the
        delete-confirmation modal's own "Cancel" for text-based lookups -- matching every other
        module screen's identical convention. --}}
        @if ($showModal)
            <div class="space-y-6">
                <flux:heading size="lg">
                    {{ $editingTypeId === null ? __('New attribute type') : __('Edit attribute type') }}
                </flux:heading>

                <div class="space-y-4">
                    <flux:input wire:model="name" :label="__('Name')" required autofocus />

                    <div class="space-y-2">
                        <flux:label>{{ __('Values') }}</flux:label>

                        @if (count($values) === 0)
                            <flux:text class="text-zinc-500 dark:text-zinc-400" data-test="attribute-type-values-empty">
                                {{ __('products.attribute_types.no_values') }}
                            </flux:text>
                        @else
                            <div class="space-y-2" data-test="attribute-type-values-list">
                                @foreach ($values as $index => $row)
                                    {{-- $values is the form's own client-writable input (never
                                    #[Locked] -- see the component's own docblock), and so is
                                    $showModal (flux:modal binds it via wire:model), so a
                                    products.view-only actor can force this whole branch open with
                                    a forged $set('values', ...) -- never having passed the
                                    products.create gate at all -- before save()'s own three-pass
                                    validation ever runs: every set() call re-renders the component
                                    immediately, reaching this loop with the malformed shape still
                                    in place. The guard checks every key this loop actually
                                    dereferences below, not only the row's outer type, per
                                    appsec-auditor's Phase 4 finding F-1: a forged row that IS an
                                    array but is missing `key`, or whose `value` is itself
                                    non-scalar, reached mb_substr()/array-key interpolation below
                                    and crashed the render. `id` is checked too, as of the full
                                    unscoped Definition-of-Done suite run that caught it: 0028's
                                    own AttributeTypesValidationHardeningTest forges `'id' =>
                                    ['forged', 'array']` (an array id is legal client input --
                                    save()'s attributeValueIdRules() re-scopes any non-owned id as
                                    a new row regardless of shape) with an otherwise well-shaped
                                    row, which passed every check below until $rowHook's own `??`
                                    interpolated that array id into a data-test attribute and
                                    crashed on htmlspecialchars(). None of this is a security
                                    bypass either way -- editingTypeId and the modal's own
                                    authorization are unaffected. Rendering must fail closed here
                                    (skip the row) rather than crash the whole page -- save()'s
                                    attributeValueRowRules()/attributeValueIdRules() are still what
                                    turn a forged payload into a real validation error. --}}
                                    @continue(! is_array($row) || ! isset($row['key']) || ! is_string($row['key']) || ! isset($row['value']) || ! is_string($row['value']) || (isset($row['id']) && ! is_string($row['id'])))

                                    {{-- data-test hooks are keyed by the persisted value's own id
                                    when it has one, falling back to the row's UI-only `key` for a
                                    brand-new, not-yet-saved row -- both are stable identities, and
                                    id is additionally knowable ahead of time by a test that seeded
                                    the fixture, which the UI-only key (a fresh UUID minted on
                                    every openEditModal()/addValue() call) never is. wire:key stays
                                    on `key` regardless: Livewire's own DOM-identity mechanism has
                                    nothing to do with what a test targets. --}}
                                    @php $rowHook = $row['id'] ?? $row['key']; @endphp

                                    <div wire:key="{{ $row['key'] }}">
                                        <div class="flex items-center gap-2">
                                            <div class="flex-1">
                                                <flux:input
                                                    wire:model="values.{{ $index }}.value"
                                                    data-test="value-input-{{ $rowHook }}"
                                                    :placeholder="__('Value')"
                                                />
                                            </div>

                                            {{-- Reorder controls: two icon-only buttons per row,
                                            :disabled bound directly on the <flux:button> tag -- a
                                            colon-bound attribute expression, NOT a bare @disabled(...)
                                            directive call, which is the shape that corrupts a
                                            <flux:*> tag's compiled attribute list. Verified safe by
                                            resources/views/livewire/products/editor.blade.php's own
                                            gallery-reorder buttons using the identical form. See
                                            docs/errors-log.md. --}}
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="chevron-up"
                                                aria-label="{{ __('Move :value up', ['value' => $row['value'] !== '' ? $row['value'] : __('Value')]) }}"
                                                data-test="move-value-up-{{ $rowHook }}"
                                                wire:click="moveValue(@js($row['key']), -1)"
                                                :disabled="$loop->first"
                                            />

                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="chevron-down"
                                                aria-label="{{ __('Move :value down', ['value' => $row['value'] !== '' ? $row['value'] : __('Value')]) }}"
                                                data-test="move-value-down-{{ $rowHook }}"
                                                wire:click="moveValue(@js($row['key']), 1)"
                                                :disabled="$loop->last"
                                            />

                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="trash"
                                                aria-label="{{ __('Remove :value', ['value' => $row['value'] !== '' ? $row['value'] : __('Value')]) }}"
                                                data-test="remove-value-{{ $rowHook }}"
                                                wire:click="removeValue(@js($row['key']))"
                                                class="cursor-pointer! text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                            />
                                        </div>

                                        {{-- values.{index}.value is the error-bag key both
                                        attributeValueRules() and flux:input's own auto-derived
                                        `name` prop use, so this outlet needs no extra wiring. See
                                        the task file's runtime trap 2. --}}
                                        <flux:error name="values.{{ $index }}.value" />
                                    </div>
                                @endforeach
                            </div>
                        @endif

                        <flux:button variant="ghost" size="sm" icon="plus" wire:click="addValue" data-test="add-value">
                            {{ __('Add value') }}
                        </flux:button>
                    </div>
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

    {{-- Delete confirmation modal. deletingTypeUsageCount is deliberately NEVER rendered here
    (decision 6) -- it is always 0 until story 0029, and a "used by 0 variants" line would be
    filler that also implies a check exists when it does not. --}}
    <flux:modal name="delete-attribute-type-modal" class="max-w-md md:min-w-md" @close="closeDeleteModal" wire:model="showDeleteModal">
        @if ($showDeleteModal)
            <div class="space-y-6">
                <div class="space-y-2">
                    <flux:heading size="lg">{{ __('Delete attribute type') }}</flux:heading>
                    <flux:text>
                        {{ __('Are you sure you want to delete ":name"? This cannot be undone.', ['name' => $deletingTypeName]) }}
                    </flux:text>
                </div>

                <div class="flex gap-3 justify-end">
                    <flux:button variant="outline" wire:click="closeDeleteModal">
                        {{ __('Cancel') }}
                    </flux:button>

                    <flux:button
                        variant="danger"
                        wire:click="deleteType"
                        wire:loading.attr="disabled"
                        wire:target="deleteType"
                    >
                        {{ __('Delete :name', ['name' => $deletingTypeName]) }}
                    </flux:button>
                </div>
            </div>
        @endif
    </flux:modal>
</div>
