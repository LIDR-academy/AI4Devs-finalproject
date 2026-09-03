<div class="w-full">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <flux:heading size="xl">{{ __('Product categories') }}</flux:heading>
        </div>

        <flux:button variant="primary" icon="plus" wire:click="openCreateModal">
            {{ __('New category') }}
        </flux:button>
    </div>

    <div class="mt-6">
        @if (count($productCategories) > 0)
            <flux:table>
                <flux:table.columns>
                    <flux:table.column>{{ __('Name') }}</flux:table.column>
                    <flux:table.column>{{ __('Products') }}</flux:table.column>
                    <flux:table.column>{{ __('Actions') }}</flux:table.column>
                </flux:table.columns>

                <flux:table.rows>
                    @foreach ($productCategories as $category)
                        <flux:table.row :key="$category['id']">
                            <flux:table.cell>
                                <div class="font-medium text-zinc-800 dark:text-white">{{ $category['name'] }}</div>
                            </flux:table.cell>

                            <flux:table.cell>
                                {{ $category['productCount'] }}
                            </flux:table.cell>

                            <flux:table.cell>
                                <div class="flex items-center gap-2">
                                    {{-- flux:button's own `tooltip` prop can't be bound conditionally
                                    (e.g. :tooltip="... ? null : '...'"): Livewire/Blaze's compiled
                                    attribute handling treats the prop as present whenever
                                    `tooltip=`/`:tooltip=` is written on the tag at all, regardless of
                                    the bound value, which renders an empty tooltip bubble on every
                                    enabled row action. Wrapping with flux:tooltip ourselves, only in
                                    the disabled branch, keeps the attribute off the tag entirely when
                                    it doesn't apply -- see docs/errors-log.md. --}}
                                    @if ($category['canEdit'])
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="pencil-square"
                                            aria-label="{{ __('Edit :name', ['name' => $category['name']]) }}"
                                            data-test="edit-product-category-{{ $category['id'] }}"
                                            wire:click="openEditModal(@js($category['id']))"
                                            class="cursor-pointer!"
                                        />
                                    @else
                                        {{-- cursor-not-allowed! lives on <flux:tooltip> (-> <ui-tooltip>),
                                        not on the disabled <button> -- Flux's own
                                        disabled:pointer-events-none takes the button out of
                                        hit-testing, so the browser resolves the hovered element (and
                                        its cursor) to the nearest ancestor that still receives pointer
                                        events. See docs/errors-log.md. --}}
                                        <flux:tooltip :content="__('products.categories.index.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="pencil-square"
                                                aria-label="{{ __('Edit :name', ['name' => $category['name']]) }}"
                                                data-test="edit-product-category-{{ $category['id'] }}"
                                                disabled
                                            />
                                        </flux:tooltip>
                                    @endif

                                    @if ($category['canDelete'])
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="trash"
                                            aria-label="{{ __('Delete :name', ['name' => $category['name']]) }}"
                                            data-test="delete-product-category-{{ $category['id'] }}"
                                            wire:click="confirmDelete(@js($category['id']))"
                                            class="cursor-pointer! text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                        />
                                    @else
                                        <flux:tooltip :content="__('products.categories.index.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="trash"
                                                aria-label="{{ __('Delete :name', ['name' => $category['name']]) }}"
                                                data-test="delete-product-category-{{ $category['id'] }}"
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
            <div class="p-8 text-center border rounded-lg border-zinc-200 dark:border-zinc-700" data-test="product-categories-empty-state">
                <flux:text>{{ __('No product categories found.') }}</flux:text>
            </div>
        @endif
    </div>

    {{-- Create / edit modal --}}
    <flux:modal name="product-category-modal" class="max-w-md md:min-w-md" @close="closeModal" wire:model="showModal">
        {{-- Only renders while the modal is open (rather than being present-but-hidden), so its
        "Cancel" text never collides with the delete-confirmation modal's own "Cancel" button for
        text-based lookups -- matching users.blade.php's identical convention. --}}
        @if ($showModal)
            <div class="space-y-6">
                <flux:heading size="lg">
                    {{ $editingCategoryId === null ? __('Create product category') : __('Edit product category') }}
                </flux:heading>

                <div class="space-y-4">
                    <flux:input wire:model="name" :label="__('Name')" required autofocus />
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

    {{-- Delete confirmation modal --}}
    <flux:modal name="delete-product-category-modal" class="max-w-md md:min-w-md" @close="closeDeleteModal" wire:model="showDeleteModal">
        @if ($showDeleteModal)
            <div class="space-y-6">
                <div class="space-y-2">
                    <flux:heading size="lg">{{ __('Delete product category') }}</flux:heading>
                    <flux:text>
                        {{ __('Are you sure you want to delete ":name"? This cannot be undone.', ['name' => $deletingCategoryName]) }}
                    </flux:text>
                </div>

                {{-- D-2: the hard-block-with-count refusal renders here, inline, in the STILL-OPEN
                modal. DeleteProductCategory throws a ValidationException keyed on
                'productCategoryId' -- the one exception Livewire already routes into the
                component's error bag with no plumbing at the call site -- so no @if/catch is
                needed to keep this modal open; the throw aborts deleteProductCategory() before
                closeDeleteModal() ever runs. Mirrors settings/security.blade.php's identical
                @error('setupData') / flux:callout pattern for a non-field error key. --}}
                @error('productCategoryId')
                    <flux:callout variant="danger" icon="x-circle" heading="{{ $message }}" data-test="product-category-delete-blocked" />
                @enderror

                <div class="flex gap-3 justify-end">
                    <flux:button variant="outline" wire:click="closeDeleteModal">
                        {{ __('Cancel') }}
                    </flux:button>

                    <flux:button
                        variant="danger"
                        wire:click="deleteProductCategory"
                        wire:loading.attr="disabled"
                        wire:target="deleteProductCategory"
                    >
                        {{ __('Delete :name', ['name' => $deletingCategoryName]) }}
                    </flux:button>
                </div>
            </div>
        @endif
    </flux:modal>
</div>
