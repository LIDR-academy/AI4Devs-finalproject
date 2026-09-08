<div class="w-full">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <flux:heading size="xl">{{ __('shipping.zones.index.heading') }}</flux:heading>

        @if ($this->canCreate)
            <flux:button variant="primary" icon="plus" wire:click="openCreateModal" data-test="new-zone-button">
                {{ __('shipping.zones.index.new_zone') }}
            </flux:button>
        @else
            {{-- Same tooltip-presence trap as every other disabled row action in this app: an
            explicit flux:tooltip wrapper only on the disabled branch, never a conditionally-bound
            `tooltip` prop -- see docs/errors-log.md. --}}
            <flux:tooltip :content="__('shipping.zones.index.action_not_allowed')" class="cursor-not-allowed!">
                <flux:button variant="primary" icon="plus" disabled data-test="new-zone-button">
                    {{ __('shipping.zones.index.new_zone') }}
                </flux:button>
            </flux:tooltip>
        @endif
    </div>

    <div class="mt-6">
        @if (count($zones) > 0)
            <flux:table>
                <flux:table.columns>
                    <flux:table.column>{{ __('shipping.zones.index.column_name') }}</flux:table.column>
                    <flux:table.column>{{ __('shipping.zones.index.column_coverage') }}</flux:table.column>
                    <flux:table.column>{{ __('shipping.zones.index.column_actions') }}</flux:table.column>
                </flux:table.columns>

                <flux:table.rows>
                    @foreach ($zones as $zone)
                        <flux:table.row :key="$zone['id']">
                            <flux:table.cell>
                                <div class="font-medium text-zinc-800 dark:text-white">{{ $zone['name'] }}</div>
                            </flux:table.cell>

                            <flux:table.cell data-test="zone-coverage-{{ $zone['id'] }}">
                                {{ $zone['entriesCount'] === 0
                                    ? __('shipping.zones.index.coverage_empty')
                                    : trans_choice('shipping.zones.index.coverage_count', $zone['entriesCount'], ['count' => $zone['entriesCount']]) }}
                            </flux:table.cell>

                            <flux:table.cell>
                                <div class="flex items-center gap-2">
                                    {{-- D-5: screen-level $this->canEdit/$this->canDelete, not a per-row flag --
                                    ShippingZonePolicy carries no per-target rule, so every row's disabled
                                    state is identical and re-evaluating it per row would say nothing more. --}}
                                    @if ($this->canEdit)
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="pencil-square"
                                            aria-label="{{ __('shipping.zones.index.edit_zone', ['name' => $zone['name']]) }}"
                                            data-test="edit-zone-{{ $zone['id'] }}"
                                            wire:click="openEditModal(@js($zone['id']))"
                                            class="cursor-pointer!"
                                        />
                                    @else
                                        <flux:tooltip :content="__('shipping.zones.index.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="pencil-square"
                                                aria-label="{{ __('shipping.zones.index.edit_zone', ['name' => $zone['name']]) }}"
                                                data-test="edit-zone-{{ $zone['id'] }}"
                                                disabled
                                            />
                                        </flux:tooltip>
                                    @endif

                                    @if ($this->canDelete)
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="trash"
                                            aria-label="{{ __('shipping.zones.index.delete_zone', ['name' => $zone['name']]) }}"
                                            data-test="delete-zone-{{ $zone['id'] }}"
                                            wire:click="confirmDelete(@js($zone['id']))"
                                            class="cursor-pointer! text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                        />
                                    @else
                                        <flux:tooltip :content="__('shipping.zones.index.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="trash"
                                                aria-label="{{ __('shipping.zones.index.delete_zone', ['name' => $zone['name']]) }}"
                                                data-test="delete-zone-{{ $zone['id'] }}"
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
            <div class="p-8 text-center border rounded-lg border-zinc-200 dark:border-zinc-700" data-test="shipping-zones-empty-state">
                <flux:text>{{ __('shipping.zones.index.empty') }}</flux:text>
            </div>
        @endif
    </div>

    {{-- Create / edit modal. D-2: name only in create mode; the geography picker and coverage
    summary render only once a zone exists (edit mode). Wrapped in @if ($showModal) so only one
    "Cancel" control is ever in the DOM, matching users.blade.php/product-categories.blade.php. --}}
    <flux:modal name="shipping-zone-modal" class="max-w-2xl" @close="closeModal" wire:model="showModal">
        @if ($showModal)
            <div class="space-y-6">
                <flux:heading size="lg">
                    {{ $editingZoneId === null
                        ? __('shipping.zones.editor.create_title')
                        : __('shipping.zones.editor.edit_title') }}
                </flux:heading>

                <div class="space-y-4">
                    <flux:input
                        wire:model="name"
                        :label="__('shipping.zones.editor.name_label')"
                        required
                        autofocus
                        data-test="zone-name-input"
                    />

                    @if ($editingZoneId !== null)
                        <livewire:components.searchable-multi-select
                            :option-resolver="\App\Actions\Shipping\SearchGeographyEntries::class"
                            wire:model="geographyEntryIds"
                            wire:key="zone-geography-picker-{{ $editingZoneId }}"
                            field="geographyEntryIds"
                            :label="__('shipping.zones.editor.geography_label')"
                            :disabled="! $this->canEdit"
                            {{-- 0022 D14: a CSS length string, validated there. Omitting it
                            means unbounded -- see D-3/D-11 for why this screen bounds it. --}}
                            :max-chip-area-height="'12rem'"
                        />

                        {{-- Phase 4 security-audit finding F-2: save()'s ValidationException lands
                        in THIS component's error bag, not the nested picker's own -- the picker's
                        internal <flux:error :name="$field" /> reads a different, per-component bag
                        (SupportValidation::viewErrorBag() clones per component), so D-12's
                        rejection message was landing in the bag correctly but rendering nowhere.
                        This outlet is what makes the refusal visible rather than only detectable
                        via assertHasErrors(). --}}
                        <flux:error name="geographyEntryIds" />

                        <div class="text-sm text-zinc-500 dark:text-zinc-400" data-test="zone-coverage-summary">
                            @if ($this->coverageSummary['total'] === 0)
                                {{ __('shipping.zones.editor.coverage_summary_empty') }}
                            @else
                                {{ collect($this->coverageSummary['byLevel'])
                                    ->map(fn (array $item): string => __('shipping.zones.editor.coverage_summary_item', $item))
                                    ->implode(' · ') }}
                                &mdash;
                                {{ trans_choice('shipping.zones.editor.coverage_summary_total', $this->coverageSummary['total'], ['count' => $this->coverageSummary['total']]) }}
                            @endif
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
                        data-test="save-zone-button"
                    >
                        {{ __('Save') }}
                    </flux:button>
                </div>
            </div>
        @endif
    </flux:modal>

    {{-- Delete confirmation modal. D-6: renders whatever ValidationException DeleteShippingZone
    raises, message-agnostic -- no zones.delete_blocked key exists in this story. --}}
    <flux:modal name="delete-shipping-zone-modal" class="max-w-md md:min-w-md" @close="closeDeleteModal" wire:model="showDeleteModal">
        @if ($showDeleteModal)
            <div class="space-y-6">
                <div class="space-y-2">
                    <flux:heading size="lg">{{ __('shipping.zones.index.delete_confirm_title') }}</flux:heading>
                    <flux:text>
                        {{ __('shipping.zones.index.delete_confirm_text', ['name' => $deletingZoneName]) }}
                    </flux:text>
                </div>

                {{-- D-6: message-agnostic on purpose -- no zones.delete_blocked key exists
                yet (that is story 0036's, once shipping_rates exists). 'shippingZoneId'
                matches this codebase's own <model>Id validation-key convention
                (see App\Actions\ProductCategories\DeleteProductCategory's 'productCategoryId'
                and App\Actions\Products\DeleteProductAttributeType's 'productAttributeTypeId'),
                which DeleteShippingZone::__invoke(ShippingZone $shippingZone) is expected to
                follow the day it gains an in-use guard.

                Phase 4 security-audit finding F-4 (Low, hand-off note, no fix needed today):
                Livewire's SupportValidation::dehydrate() filters the persisted error bag through
                Utils::hasProperty(), so this outlet renders correctly on the throwing request but
                would silently drop the message on the NEXT round trip unless story 0036 either
                declares a real #[Locked] public ?string $shippingZoneId property on
                App\Livewire\Shipping\Zones, or keys its guard on `deletingZoneId` (an existing
                declared property) instead. --}}
                @error('shippingZoneId')
                    <flux:callout variant="danger" icon="x-circle" heading="{{ $message }}" data-test="shipping-zone-delete-blocked" />
                @enderror

                <div class="flex gap-3 justify-end">
                    <flux:button variant="outline" wire:click="closeDeleteModal">
                        {{ __('Cancel') }}
                    </flux:button>

                    <flux:button
                        variant="danger"
                        wire:click="deleteZone"
                        wire:loading.attr="disabled"
                        wire:target="deleteZone"
                        data-test="confirm-delete-zone-button"
                    >
                        {{ __('shipping.zones.index.delete_zone', ['name' => $deletingZoneName]) }}
                    </flux:button>
                </div>
            </div>
        @endif
    </flux:modal>
</div>
