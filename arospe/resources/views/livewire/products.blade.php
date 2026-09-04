<div class="w-full">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <flux:heading size="xl">{{ __('products.index.title') }}</flux:heading>
        </div>

        @can('create', \App\Models\Product::class)
            <flux:button variant="primary" icon="plus" :href="route('products.create')" wire:navigate>
                {{ __('products.index.new_product') }}
            </flux:button>
        @endcan
    </div>

    <div class="mt-6">
        @if ($this->products->count() > 0)
            <flux:table>
                <flux:table.columns>
                    <flux:table.column>{{ __('products.editor.name_label') }}</flux:table.column>
                    <flux:table.column>{{ __('products.editor.price_label') }}</flux:table.column>
                    <flux:table.column>{{ __('products.editor.stock_label') }}</flux:table.column>
                    <flux:table.column>{{ __('products.editor.status_label') }}</flux:table.column>
                    <flux:table.column>{{ __('Actions') }}</flux:table.column>
                </flux:table.columns>

                <flux:table.rows>
                    @foreach ($this->products as $product)
                        <flux:table.row :key="$product['id']">
                            <flux:table.cell>
                                <div class="flex items-center gap-3">
                                    @if ($product['thumbnail'])
                                        <picture>
                                            <source srcset="{{ $product['thumbnail']['avifUrl'] }}" type="image/avif">
                                            <source srcset="{{ $product['thumbnail']['webpUrl'] }}" type="image/webp">
                                            <img src="{{ $product['thumbnail']['url'] }}" alt="{{ $product['thumbnail']['title'] }}" loading="lazy" class="h-10 w-10 rounded object-cover">
                                        </picture>
                                    @else
                                        <div
                                            data-test="product-thumbnail-placeholder"
                                            class="flex h-10 w-10 items-center justify-center rounded bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                                            aria-label="{{ __('products.index.thumbnail_alt') }}"
                                        >
                                            <flux:icon name="photo" class="size-5" />
                                        </div>
                                    @endif

                                    <div>
                                        <div class="font-medium text-zinc-800 dark:text-white">{{ $product['name'] }}</div>
                                        <div class="text-xs text-zinc-500 dark:text-zinc-400">{{ $product['sku'] }}</div>
                                    </div>
                                </div>
                            </flux:table.cell>

                            <flux:table.cell>{{ $product['price'] }}</flux:table.cell>

                            <flux:table.cell>
                                <span
                                    data-test="stock-{{ $product['stockBand'] }}"
                                    @class([
                                        'font-medium',
                                        'text-red-600 dark:text-red-400' => $product['stockBand'] === 'out',
                                        'text-amber-600 dark:text-amber-400' => $product['stockBand'] === 'low',
                                        'text-zinc-700 dark:text-zinc-300' => $product['stockBand'] === 'ok',
                                    ])
                                >
                                    {{ $product['stock'] }}
                                </span>
                            </flux:table.cell>

                            <flux:table.cell>
                                <flux:badge :color="match ($product['displayStatus']->value) {
                                    'active' => 'lime',
                                    'out_of_stock' => 'red',
                                    default => 'zinc',
                                }">
                                    {{ $product['displayStatus']->label() }}
                                </flux:badge>
                            </flux:table.cell>

                            <flux:table.cell>
                                <div class="flex items-center gap-2">
                                    {{-- flux:button's own `tooltip` prop can't be bound conditionally --
                                    Livewire/Blaze renders an empty tooltip bubble on every ENABLED row
                                    action otherwise (docs/errors-log.md). Wrapping with flux:tooltip
                                    ourselves, only in the disabled branch, keeps the attribute off the
                                    tag entirely when it doesn't apply. --}}
                                    @if ($product['canEdit'])
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="pencil-square"
                                            aria-label="{{ __('Edit :name', ['name' => $product['name']]) }}"
                                            data-test="edit-product-{{ $product['id'] }}"
                                            :href="route('products.edit', $product['id'])"
                                            wire:navigate
                                            class="cursor-pointer!"
                                        />
                                    @else
                                        <flux:tooltip :content="__('products.index.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="pencil-square"
                                                aria-label="{{ __('Edit :name', ['name' => $product['name']]) }}"
                                                data-test="edit-product-{{ $product['id'] }}"
                                                disabled
                                            />
                                        </flux:tooltip>
                                    @endif

                                    @if ($product['canDelete'])
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="trash"
                                            aria-label="{{ __('Delete :name', ['name' => $product['name']]) }}"
                                            data-test="delete-product-{{ $product['id'] }}"
                                            wire:click="confirmDelete(@js($product['id']))"
                                            class="cursor-pointer! text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                        />
                                    @else
                                        <flux:tooltip :content="__('products.index.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="trash"
                                                aria-label="{{ __('Delete :name', ['name' => $product['name']]) }}"
                                                data-test="delete-product-{{ $product['id'] }}"
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
                {{ $this->products->links() }}
            </div>
        @else
            <div class="p-8 text-center border rounded-lg border-zinc-200 dark:border-zinc-700" data-test="products-empty-state">
                <flux:text>{{ __('products.index.empty') }}</flux:text>
            </div>
        @endif
    </div>

    {{-- Delete confirmation modal --}}
    <flux:modal name="delete-product-modal" class="max-w-md md:min-w-md" @close="closeDeleteModal" wire:model="showDeleteModal">
        @if ($showDeleteModal)
            <div class="space-y-6">
                <div class="space-y-2">
                    <flux:heading size="lg">{{ __('products.index.delete_confirm_title') }}</flux:heading>
                    <flux:text>
                        {{ __('products.index.delete_confirm_text', ['name' => $deletingProductName]) }}
                    </flux:text>
                </div>

                <div class="flex gap-3 justify-end">
                    <flux:button variant="outline" wire:click="closeDeleteModal">
                        {{ __('Cancel') }}
                    </flux:button>

                    <flux:button
                        variant="danger"
                        wire:click="deleteProduct"
                        wire:loading.attr="disabled"
                        wire:target="deleteProduct"
                    >
                        {{ __('Delete :name', ['name' => $deletingProductName]) }}
                    </flux:button>
                </div>
            </div>
        @endif
    </flux:modal>
</div>
