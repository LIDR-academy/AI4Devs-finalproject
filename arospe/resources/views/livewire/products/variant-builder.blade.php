{{--
    Story 0031 -- the variant builder, nested under 0027's product editor (D-1). Ordinary
    kebab-case mirror of App\Livewire\Products\VariantBuilder -- NOT the Index-in-a-subfolder
    exception, since the class is not named Index.

    D-12: the create/edit form is an inline expanding panel, never a flux:modal -- opening 0020's
    Gallery (itself a <dialog>) from inside another <dialog> is the nested-<dialog> trap 0027 D-1
    already refused to bet on one level up. flux:modal is reserved for the delete confirmation,
    which never opens a nested modal.
--}}
<div class="mt-8" data-test="variant-builder">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <flux:heading size="lg">{{ __('products.variants.builder.heading') }}</flux:heading>
            @if ($this->attributeTypes()->isNotEmpty())
                <flux:subheading>
                    {{ __('products.variants.builder.summary', ['count' => $this->variants()->total()]) }}
                </flux:subheading>
            @endif
        </div>

        @if ($this->attributeTypes()->isNotEmpty() && ! $showForm)
            @if ($canManageVariants)
                <flux:button
                    variant="primary"
                    icon="plus"
                    data-test="open-create-variant-form"
                    wire:click="openCreateForm"
                    class="cursor-pointer!"
                >
                    {{ __('products.variants.builder.add') }}
                </flux:button>
            @else
                {{-- T3: a Flux `tooltip` prop cannot be conditionally bound (Blaze presence trap) --
                a written-out @if/@else with <flux:tooltip> wrapping only the disabled branch,
                copying users.blade.php/attribute-types.blade.php verbatim. cursor-not-allowed! sits
                on the flux:tooltip WRAPPER, never the disabled:pointer-events-none button (T4). --}}
                <flux:tooltip :content="__('products.variants.builder.action_not_allowed')" class="cursor-not-allowed! inline-block">
                    <flux:button variant="primary" icon="plus" data-test="open-create-variant-form" disabled>
                        {{ __('products.variants.builder.add') }}
                    </flux:button>
                </flux:tooltip>
            @endif
        @endif
    </div>

    @if ($this->attributeTypes()->isEmpty())
        <div class="mt-4 rounded-lg border border-zinc-200 p-6 text-center dark:border-zinc-700" data-test="variant-builder-no-attribute-types">
            <flux:text>{{ __('products.variants.builder.no_attribute_types') }}</flux:text>
            <div class="mt-3">
                <flux:button variant="outline" :href="route('product-attribute-types.index')" wire:navigate>
                    {{ __('Manage attribute types') }}
                </flux:button>
            </div>
        </div>
    @else
        {{-- Create / edit inline panel (D-12). Only rendered while open, so its own "Cancelar"
        control never collides with the delete-confirmation modal's identical label. --}}
        @if ($showForm)
            <flux:card class="mt-4 space-y-6">
                <flux:heading size="sm">
                    {{ $editingVariantId === null ? __('products.variants.form.create_title') : __('products.variants.form.edit_title') }}
                </flux:heading>

                @if ($editingVariantId === null)
                    {{-- D-2/D-9: the keyed repeater. Stable server-generated wire:key per row,
                    POSITIONAL wire:model paths, removal by KEY never index. Both placeholders are
                    disabled+selected via Flux's own :placeholder prop -- never null, never absent. --}}
                    <flux:fieldset :legend="__('products.variants.form.combination_legend')">
                        <div class="space-y-3">
                            @foreach ($combinationRows as $index => $row)
                                <div wire:key="{{ $row['key'] }}" class="flex items-end gap-2">
                                    <div class="flex-1">
                                        <flux:select
                                            wire:model.live="combinationRows.{{ $index }}.typeId"
                                            :label="__('products.variants.form.attribute_type_label')"
                                            :placeholder="__('products.variants.form.attribute_type_placeholder')"
                                        >
                                            @foreach ($this->availableTypesForRow($index) as $type)
                                                <flux:select.option value="{{ $type->id }}">{{ $type->name }}</flux:select.option>
                                            @endforeach
                                        </flux:select>
                                    </div>

                                    <div class="flex-1">
                                        <flux:select
                                            wire:model.live="combinationRows.{{ $index }}.valueId"
                                            :label="__('products.variants.form.attribute_value_label')"
                                            :placeholder="__('products.variants.form.attribute_value_placeholder')"
                                        >
                                            @foreach ($this->valuesForRow($index) as $value)
                                                <flux:select.option value="{{ $value->id }}">{{ $value->value }}</flux:select.option>
                                            @endforeach
                                        </flux:select>
                                    </div>

                                    <flux:button
                                        variant="ghost"
                                        size="sm"
                                        icon="x-mark"
                                        aria-label="{{ __('products.variants.form.remove_attribute_row') }}"
                                        data-test="remove-combination-row-{{ $row['key'] }}"
                                        wire:click="removeCombinationRow(@js($row['key']))"
                                        class="cursor-pointer!"
                                    />
                                </div>
                            @endforeach
                        </div>

                        <flux:error name="combination" />
                        <flux:error name="attributeValueIds" />

                        @if ($this->hasUnusedAttributeTypes())
                            <flux:button
                                variant="ghost"
                                size="sm"
                                icon="plus"
                                wire:click="addCombinationRow"
                                data-test="add-combination-row"
                                class="cursor-pointer!"
                            >
                                {{ __('products.variants.form.add_attribute_row') }}
                            </flux:button>
                        @else
                            <flux:tooltip :content="__('products.variants.builder.action_not_allowed')" class="cursor-not-allowed! inline-block">
                                <flux:button variant="ghost" size="sm" icon="plus" disabled data-test="add-combination-row">
                                    {{ __('products.variants.form.add_attribute_row') }}
                                </flux:button>
                            </flux:tooltip>
                        @endif
                    </flux:fieldset>

                    {{-- D-4: the live SKU preview -- a #[Computed] METHOD, server-derived, never a
                    property, never client-side. Presentation only: no name/wire:model, no hidden
                    input, no readonly flux:input -- there is no SKU field anywhere on this screen. --}}
                    <flux:field>
                        <flux:label>{{ __('products.variants.sku.preview_label') }}</flux:label>

                        <div
                            class="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                            data-test="variant-sku-preview"
                        >
                            {{ $this->skuPreview() ?? __('products.variants.sku.preview_pending') }}
                        </div>

                        @if ($this->skuPreview() !== null)
                            <flux:description>{{ __('products.variants.sku.preview_provisional') }}</flux:description>
                        @endif

                        <flux:description>{{ __('products.variants.sku.derived_notice') }}</flux:description>
                    </flux:field>

                    {{-- D-8: all four SKU refusals (0029) share the single bag key `sku`, rendered
                    immediately under the preview -- never bound to any field, since there is none. --}}
                    @error('sku')
                        <flux:callout variant="danger" icon="x-circle" :heading="$message" data-test="variant-sku-error" />
                        <flux:text size="sm" class="text-zinc-500 dark:text-zinc-400">
                            {{ __('products.variants.sku.remedy_hint') }}
                        </flux:text>
                    @enderror
                @else
                    {{-- D-11: the combination is FIXED once a variant exists -- static badges, never
                    disabled selects (Flux's disabled:pointer-events-none makes a disabled control
                    un-hoverable, and "disabled" reads as temporarily unavailable rather than
                    immutable by design). --}}
                    <div>
                        <flux:label>{{ __('products.variants.form.combination_legend') }}</flux:label>
                        <div class="mt-1 flex flex-wrap items-center gap-2">
                            @foreach ($this->lockedCombination() as $pair)
                                <flux:badge color="zinc">{{ $pair['type'] }}: {{ $pair['value'] }}</flux:badge>
                            @endforeach
                        </div>
                        <flux:description>{{ __('products.variants.combination.immutable_notice') }}</flux:description>
                    </div>
                @endif

                {{-- items-start: Price's optional help text (create mode only) makes this column
                taller than Stock's. Without it, CSS Grid's default align-items:stretch expands
                Stock's <flux:input> to match that height, and Flux's own <ui-field> wrapper then
                vertically CENTERS its label+input inside that taller box -- pushing Stock's input
                visibly lower than Price's. items-start sizes each column to its own content instead. --}}
                <div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                    <div>
                        <flux:input
                            wire:model="price"
                            type="text"
                            inputmode="decimal"
                            :label="__('products.variants.form.price_label')"
                            required
                        />
                        @if ($editingVariantId === null)
                            <flux:description>{{ __('products.variants.form.price_prefilled_help') }}</flux:description>
                        @endif
                    </div>

                    <flux:input
                        wire:model="stock"
                        type="text"
                        inputmode="numeric"
                        :label="__('products.variants.form.stock_label')"
                        required
                    />
                </div>

                {{-- The staged image for the composed/edited variant, chosen through the ONE Gallery
                instance below (D-6/T13). --}}
                <div>
                    <flux:label>{{ __('products.variants.image.choose') }}</flux:label>

                    <div class="mt-2 flex items-center gap-3">
                        @if ($this->featuredMediaPreview !== null)
                            <div data-test="variant-image-preview" class="flex items-center gap-2">
                                <img
                                    src="{{ $this->featuredMediaPreview['url'] }}"
                                    alt="{{ $this->featuredMediaPreview['title'] }}"
                                    class="h-16 w-16 rounded object-cover"
                                >
                                <span class="text-sm">{{ $this->featuredMediaPreview['title'] }}</span>
                                <flux:button
                                    size="sm"
                                    variant="ghost"
                                    data-test="clear-variant-image"
                                    wire:click="clearVariantImage"
                                    class="cursor-pointer!"
                                >
                                    {{ __('products.variants.image.clear') }}
                                </flux:button>
                            </div>
                        @else
                            <div data-test="variant-image-preview"></div>
                        @endif
                    </div>

                    @can('viewAny', \App\Models\Media::class)
                        <div class="mt-2">
                            <flux:button
                                data-test="open-form-variant-image-gallery"
                                wire:click="$set('showGallery', true)"
                                class="cursor-pointer!"
                            >
                                {{ __('products.variants.image.choose') }}
                            </flux:button>
                        </div>
                    @else
                        <flux:tooltip :content="__('products.variants.builder.action_not_allowed')" class="cursor-not-allowed! mt-2 inline-block">
                            <flux:button data-test="open-form-variant-image-gallery" disabled>
                                {{ __('products.variants.image.choose') }}
                            </flux:button>
                        </flux:tooltip>
                    @endcan

                    <flux:error name="featuredMediaId" />
                </div>

                <div class="flex justify-end gap-3">
                    <flux:button variant="outline" wire:click="closeForm" data-test="cancel-variant-form">
                        {{ __('products.variants.form.cancel') }}
                    </flux:button>

                    <flux:button
                        variant="primary"
                        wire:click="saveVariant"
                        wire:loading.attr="disabled"
                        wire:target="saveVariant"
                        data-test="save-variant"
                    >
                        {{ __('products.variants.form.save') }}
                    </flux:button>
                </div>
            </flux:card>
        @endif

        {{-- The variants list -- a #[Computed] over a fresh query (D-5 R1), never a mount()-time
        array, paginated at 25 (D-17). --}}
        <div class="mt-6">
            @if ($this->variants()->isEmpty())
                <div class="rounded-lg border border-zinc-200 p-8 text-center dark:border-zinc-700" data-test="variant-builder-empty">
                    <flux:text>{{ __('products.variants.builder.empty') }}</flux:text>
                </div>
            @else
                <flux:table>
                    <flux:table.columns>
                        <flux:table.column>{{ __('products.variants.columns.combination') }}</flux:table.column>
                        <flux:table.column>{{ __('products.variants.columns.sku') }}</flux:table.column>
                        <flux:table.column>{{ __('products.variants.columns.price') }}</flux:table.column>
                        <flux:table.column>{{ __('products.variants.columns.stock') }}</flux:table.column>
                        <flux:table.column>{{ __('products.variants.columns.image') }}</flux:table.column>
                        <flux:table.column>{{ __('products.variants.columns.actions') }}</flux:table.column>
                    </flux:table.columns>

                    <flux:table.rows>
                        @foreach ($this->variants() as $variant)
                            <flux:table.row :key="$variant->id" data-test="variant-row-{{ $variant->id }}">
                                <flux:table.cell>{{ $variant->label() }}</flux:table.cell>
                                <flux:table.cell class="font-mono text-sm">{{ $variant->sku }}</flux:table.cell>
                                <flux:table.cell>{{ $variant->price }}</flux:table.cell>
                                <flux:table.cell>{{ $variant->stock }}</flux:table.cell>

                                <flux:table.cell>
                                    @php
                                        $isOwnImage = $variant->featured_media_id !== null;
                                        $displayImage = $isOwnImage ? $variant->featuredImage : $this->parentFeaturedImage();
                                    @endphp

                                    <div class="flex items-center gap-2">
                                        @if ($displayImage !== null)
                                            <img
                                                src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($displayImage->path) }}"
                                                alt="{{ $displayImage->title }}"
                                                loading="lazy"
                                                class="h-10 w-10 rounded object-cover"
                                            >
                                            @if ($isOwnImage)
                                                <flux:badge size="sm" color="lime">{{ __('products.variants.image.own_badge') }}</flux:badge>
                                            @else
                                                <flux:badge size="sm" color="zinc">{{ __('products.variants.image.inherited_badge') }}</flux:badge>
                                            @endif
                                        @else
                                            <div
                                                class="flex h-10 w-10 items-center justify-center rounded bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                                                aria-label="{{ __('products.variants.image.none') }}"
                                            >
                                                <flux:icon name="photo" class="size-5" />
                                            </div>
                                        @endif

                                        @if ($canManageVariants)
                                            <flux:button
                                                variant="ghost"
                                                size="xs"
                                                icon="photo"
                                                aria-label="{{ __('products.variants.image.replace') }}"
                                                data-test="open-variant-image-gallery-{{ $variant->id }}"
                                                wire:click="openImagePicker(@js($variant->id))"
                                                class="cursor-pointer!"
                                            />

                                            @if ($isOwnImage)
                                                <flux:button
                                                    variant="ghost"
                                                    size="xs"
                                                    icon="arrow-uturn-left"
                                                    aria-label="{{ __('products.variants.image.revert_to_inherited') }}"
                                                    data-test="revert-variant-image-{{ $variant->id }}"
                                                    wire:click="revertToInheritedImage(@js($variant->id))"
                                                    class="cursor-pointer!"
                                                />
                                            @endif
                                        @else
                                            <flux:tooltip :content="__('products.variants.builder.action_not_allowed')" class="cursor-not-allowed! inline-block">
                                                <flux:button
                                                    variant="ghost"
                                                    size="xs"
                                                    icon="photo"
                                                    aria-label="{{ __('products.variants.image.replace') }}"
                                                    data-test="open-variant-image-gallery-{{ $variant->id }}"
                                                    disabled
                                                />
                                            </flux:tooltip>
                                        @endif
                                    </div>
                                </flux:table.cell>

                                <flux:table.cell>
                                    <div class="flex items-center gap-2">
                                        @if ($canManageVariants)
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="pencil-square"
                                                aria-label="{{ __('Edit :label', ['label' => $variant->label()]) }}"
                                                data-test="edit-variant-{{ $variant->id }}"
                                                wire:click="openEditForm(@js($variant->id))"
                                                class="cursor-pointer!"
                                            />
                                        @else
                                            <flux:tooltip :content="__('products.variants.builder.action_not_allowed')" class="cursor-not-allowed!">
                                                <flux:button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon="pencil-square"
                                                    aria-label="{{ __('Edit :label', ['label' => $variant->label()]) }}"
                                                    data-test="edit-variant-{{ $variant->id }}"
                                                    disabled
                                                />
                                            </flux:tooltip>
                                        @endif

                                        @if ($canManageVariants)
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="trash"
                                                aria-label="{{ __('Delete :label', ['label' => $variant->label()]) }}"
                                                data-test="delete-variant-{{ $variant->id }}"
                                                wire:click="confirmDelete(@js($variant->id))"
                                                class="cursor-pointer! text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                            />
                                        @else
                                            <flux:tooltip :content="__('products.variants.builder.action_not_allowed')" class="cursor-not-allowed!">
                                                <flux:button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon="trash"
                                                    aria-label="{{ __('Delete :label', ['label' => $variant->label()]) }}"
                                                    data-test="delete-variant-{{ $variant->id }}"
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

                <div class="mt-4">
                    {{ $this->variants()->links() }}
                </div>
            @endif
        </div>
    @endif

    {{-- D-6: ONE media.gallery instance, mounted once -- never one per row. Targets whichever
    variant $editingVariantId addresses. Wrapped in @can('viewAny', Media::class) (T13): without
    it, an actor who may edit products but lacks media.view would have the CHILD's own
    Gate::authorize() 403 the whole page. --}}
    @can('viewAny', \App\Models\Media::class)
        <livewire:media.gallery
            wire:model="showGallery"
            wire:key="variant-image-gallery-{{ $productId }}"
            :multi="false"
            select-event="variant-image-selected"
            :confirm-label="__('products.variants.image.confirm_label')"
        />
    @endcan

    {{-- Delete confirmation modal (D-11): the only flux:modal on this screen (D-12) -- it opens no
    nested modal, so the native <dialog> nesting concern never applies here. --}}
    <flux:modal name="delete-variant-modal" class="max-w-md md:min-w-md" wire:model="showDeleteModal" @close="closeDeleteModal">
        @if ($showDeleteModal)
            <div class="space-y-6">
                <div class="space-y-2">
                    <flux:heading size="lg">{{ __('products.variants.delete.title') }}</flux:heading>
                    <flux:text>
                        {{ __('products.variants.delete.confirm', ['label' => $deletingVariantLabel, 'sku' => $deletingVariantSku]) }}
                    </flux:text>
                    <flux:text class="text-zinc-500 dark:text-zinc-400">
                        {{ __('products.variants.delete.irreversible') }}
                    </flux:text>
                </div>

                <div class="flex justify-end gap-3">
                    <flux:button variant="outline" wire:click="closeDeleteModal" data-test="cancel-delete-variant">
                        {{ __('products.variants.form.cancel') }}
                    </flux:button>

                    <flux:button
                        variant="danger"
                        wire:click="deleteVariant"
                        wire:loading.attr="disabled"
                        wire:target="deleteVariant"
                        data-test="confirm-delete-variant"
                    >
                        {{ __('products.variants.delete.title') }}
                    </flux:button>
                </div>
            </div>
        @endif
    </flux:modal>
</div>
