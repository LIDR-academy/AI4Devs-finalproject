<div class="w-full max-w-5xl">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <flux:heading size="xl">
            {{ $productId === null ? __('products.editor.title_create') : __('products.editor.title_edit') }}
        </flux:heading>

        <flux:button variant="outline" :href="route('products.index')" wire:navigate>
            {{ __('products.editor.cancel') }}
        </flux:button>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {{-- Core fields --}}
        <div class="space-y-4 lg:col-span-2">
            <flux:input wire:model="name" :label="__('products.editor.name_label')" required />

            <flux:input wire:model="sku" :label="__('products.editor.sku_label')" required />

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <flux:select
                    wire:model="productCategoryId"
                    :label="__('products.editor.category_label')"
                    :placeholder="__('products.editor.category_placeholder')"
                >
                    @foreach ($this->categoryOptions as $category)
                        <flux:select.option value="{{ $category['id'] }}">{{ $category['name'] }}</flux:select.option>
                    @endforeach
                </flux:select>

                {{-- D-5/D-16: the placeholder MUST be disabled AND selected, value="" -- there is no
                coherent state "no type" may ever legitimately persist as. Flux's own :placeholder prop
                already renders `<option value="" disabled selected class="placeholder">`. --}}
                <flux:select
                    wire:model="type"
                    :label="__('products.editor.type_label')"
                    :placeholder="__('products.editor.type_placeholder')"
                >
                    @foreach ($this->typeOptions as $typeCase)
                        <flux:select.option value="{{ $typeCase->value }}">{{ $typeCase->label() }}</flux:select.option>
                    @endforeach
                </flux:select>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {{-- D-6: fed from ProductStatus::cases() ONLY, never ProductDisplayStatus -- an
                option that can never be persisted becomes something the user picks and the server
                then rejects. --}}
                <flux:select wire:model="status" :label="__('products.editor.status_label')">
                    @foreach ($this->statusOptions as $statusCase)
                        <flux:select.option value="{{ $statusCase->value }}">{{ $statusCase->label() }}</flux:select.option>
                    @endforeach
                </flux:select>

                <flux:input wire:model="price" type="text" inputmode="decimal" :label="__('products.editor.price_label')" required />

                <flux:input wire:model="stock" type="text" inputmode="numeric" :label="__('products.editor.stock_label')" required />
            </div>

            <div>
                <livewire:components.wysiwyg-editor
                    wire:model="description"
                    wire:key="product-description-editor"
                    :label="__('products.editor.description_label')"
                />

                {{-- D-13: a static, always-visible notice -- zero mechanism, sets the expectation
                before the paste rather than explaining a surprise afterwards. This screen renders NO
                product description HTML anywhere (the WYSIWYG seeds itself client-side, D9). --}}
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400" data-test="description-sanitization-notice">
                    {{ __('products.editor.description_sanitization_notice') }}
                </p>
            </div>

            <div>
                <livewire:components.searchable-multi-select
                    :option-resolver="\App\Actions\Products\SearchSalesRegions::class"
                    wire:model="regionIds"
                    wire:key="product-region-picker"
                    field="regionIds"
                    :label="__('products.editor.regions_label')"
                />
            </div>
        </div>

        {{-- Imagery --}}
        <div class="space-y-8">
            {{-- Featured image (D-8): a SINGLE-select Gallery instance, fully independent of the
            gallery strip below -- setting one never modifies the other in either direction (0024 D-9). --}}
            <div>
                <flux:heading size="sm">{{ __('products.editor.featured_image_label') }}</flux:heading>

                <div class="mt-2 flex items-center gap-3">
                    @if ($featuredPreview !== null)
                        <div data-test="featured-image-preview" class="flex items-center gap-2">
                            <img src="{{ $featuredPreview['url'] }}" alt="{{ $featuredPreview['title'] }}" class="h-16 w-16 rounded object-cover">
                            <span class="text-sm">{{ $featuredPreview['title'] }}</span>
                            <flux:button
                                size="sm"
                                variant="ghost"
                                data-test="clear-featured-image"
                                wire:click="clearFeaturedImage"
                            >
                                {{ __('products.editor.featured_image_clear') }}
                            </flux:button>
                        </div>
                    @else
                        <div data-test="featured-image-preview"></div>
                    @endif
                </div>

                <flux:error name="featuredMediaId" />

                @can('viewAny', \App\Models\Media::class)
                    <flux:button
                        data-test="open-featured-image-gallery"
                        wire:click="$set('showFeaturedGallery', true)"
                        class="mt-2"
                    >
                        {{ __('products.editor.featured_image_choose') }}
                    </flux:button>

                    <livewire:media.gallery
                        wire:model="showFeaturedGallery"
                        wire:key="featured-image-gallery"
                        :multi="false"
                        select-event="featured-image-selected"
                    />
                @else
                    <flux:tooltip :content="__('products.index.action_not_allowed')" class="cursor-not-allowed! mt-2 inline-block">
                        <flux:button data-test="open-featured-image-gallery" disabled>
                            {{ __('products.editor.featured_image_choose') }}
                        </flux:button>
                    </flux:tooltip>
                @endcan
            </div>

            {{-- Gallery strip (D-8/D-9): a MULTI-select Gallery instance. The strip's array order IS
            its persisted order (D-9a) -- reorder ships as "move earlier"/"move later" buttons, never
            drag (D-9b), and nothing here is persisted until save(). --}}
            <div>
                <flux:heading size="sm">{{ __('products.editor.gallery_label') }}</flux:heading>

                <div data-test="gallery-strip" class="mt-2 flex flex-wrap gap-3">
                    @foreach ($galleryPreviews as $index => $item)
                        <div wire:key="gallery-strip-item-{{ $item['id'] }}" data-test="gallery-strip-item-{{ $item['id'] }}" class="flex flex-col items-center gap-1 rounded border border-zinc-200 p-2 dark:border-zinc-700">
                            <img src="{{ $item['url'] }}" alt="{{ $item['title'] }}" class="h-16 w-16 rounded object-cover">

                            <div class="flex items-center gap-1">
                                <flux:button
                                    size="xs"
                                    variant="ghost"
                                    icon="chevron-left"
                                    aria-label="{{ __('Move earlier') }}"
                                    data-test="move-gallery-image-earlier-{{ $item['id'] }}"
                                    wire:click="moveGalleryImageEarlier(@js($item['id']))"
                                    :disabled="$index === 0"
                                />
                                <flux:button
                                    size="xs"
                                    variant="ghost"
                                    icon="x-mark"
                                    aria-label="{{ __('Remove') }}"
                                    data-test="remove-gallery-image-{{ $item['id'] }}"
                                    wire:click="removeGalleryImage(@js($item['id']))"
                                />
                                <flux:button
                                    size="xs"
                                    variant="ghost"
                                    icon="chevron-right"
                                    aria-label="{{ __('Move later') }}"
                                    data-test="move-gallery-image-later-{{ $item['id'] }}"
                                    wire:click="moveGalleryImageLater(@js($item['id']))"
                                    :disabled="$index === count($galleryPreviews) - 1"
                                />
                            </div>
                        </div>
                    @endforeach
                </div>

                <flux:error name="galleryMediaIds" />

                @can('viewAny', \App\Models\Media::class)
                    <flux:button
                        data-test="open-gallery-strip-picker"
                        wire:click="$set('showStripGallery', true)"
                        class="mt-2"
                    >
                        {{ __('products.editor.gallery_add') }}
                    </flux:button>

                    <livewire:media.gallery
                        wire:model="showStripGallery"
                        wire:key="product-gallery-picker"
                        :multi="true"
                        select-event="product-images-added"
                    />
                @else
                    <flux:tooltip :content="__('products.index.action_not_allowed')" class="cursor-not-allowed! mt-2 inline-block">
                        <flux:button data-test="open-gallery-strip-picker" disabled>
                            {{ __('products.editor.gallery_add') }}
                        </flux:button>
                    </flux:tooltip>
                @endcan
            </div>
        </div>
    </div>

    <div class="mt-8 flex justify-end gap-3">
        <flux:button variant="outline" :href="route('products.index')" wire:navigate>
            {{ __('products.editor.cancel') }}
        </flux:button>

        <flux:button
            variant="primary"
            wire:click="save"
            wire:loading.attr="disabled"
            wire:target="save"
        >
            {{ __('products.editor.save') }}
        </flux:button>
    </div>
</div>
