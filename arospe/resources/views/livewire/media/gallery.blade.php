{{--
    The Shared Media Gallery (PRD §2.3, story 0020). Modal-only -- no page
    chrome, so the file's single root element is the modal itself, entangled
    with the consumer's own boolean via #[Modelable] $open (D2).

    The root element carries NO literal `wire:model` of its own: Livewire
    auto-injects the parent's binding onto a #[Modelable] component's root
    element from the consumer's own `<livewire:media.gallery wire:model="...">`
    tag. Writing `wire:model="open"` here too throws
    Livewire\Exceptions\ModelableRootHasWireModelException the moment this
    component is embedded as a nested child (found via the D16 harness,
    invisible to a standalone `Livewire::test(Gallery::class)` mount, which
    is why neither GalleryTest.php nor GalleryRenderingTest.php caught it).

    Selectors/markup rules carried forward from Users/Roles/SalesRegions
    (D14): icon-only controls carry both an aria-label and a data-test hook
    on both the enabled and disabled branch; a disabled control's tooltip is
    a written-out <flux:tooltip> wrapper on its own @if/@else branch, never
    a conditionally-bound :tooltip prop (the Blaze presence trap); every id
    interpolated into a wire:click argument is wrapped in @js(); no
    wire:model-bound property is ever null.
--}}
<flux:modal name="media-gallery" class="max-w-4xl md:min-w-3xl" @close="cancel">
    {{-- D8: `uploadPhase` distinguishes the two in-flight windows a single
    `wire:loading wire:target="pendingUploads"` cannot tell apart on its
    own -- `livewire-upload-start`/`-progress`/`-finish` (dispatched,
    bubbling, on the hidden input below) mark TRANSPORT, and once transport
    reports 100% this Alpine state flips to `processing` for the remaining,
    percentage-less server-side window (validation + Imagick conversion +
    the row insert) until `-finish`/`-error` closes it back to `idle`. No
    `.window` modifier on any of the listeners below: the events bubble
    from THIS component's own hidden input, so a plain (non-`.window`)
    listener on this root element cannot cross-react to the OTHER gallery
    instance's own upload on a page embedding two (the D16 harness). --}}
    <div
        class="flex flex-col gap-4"
        x-data="{ dragging: false, uploadPhase: 'idle', uploadProgress: 0 }"
        x-on:livewire-upload-start="uploadPhase = 'transport'; uploadProgress = 0"
        x-on:livewire-upload-progress="uploadProgress = $event.detail.progress; if (uploadProgress >= 100) { uploadPhase = 'processing' }"
        x-on:livewire-upload-finish="uploadPhase = 'idle'; uploadProgress = 0"
        x-on:livewire-upload-error="uploadPhase = 'idle'; uploadProgress = 0"
    >
        <div class="flex flex-col gap-1">
            <flux:heading size="lg">{{ __('media.gallery.title') }}</flux:heading>
            <flux:subheading>
                {{ trans_choice('media.gallery.count_summary', count($this->tiles), ['count' => count($this->tiles)]) }}
            </flux:subheading>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <flux:input
                wire:model.live.debounce.300ms="search"
                type="search"
                :placeholder="__('media.gallery.search_placeholder')"
                data-test="media-search"
                class="sm:max-w-xs"
            />

            {{-- One hidden native file input, fed by both triggers (D7): the
            button's click and the dropzone's drop both re-enter Livewire's
            own upload pipeline via this single element's `change` event.
            `multiple` (D9) lets one file-picker selection or one drop stage
            more than one file at once; `pendingUploads` (renamed from the
            singular `photo`, D9) is validated as an array. --}}
            <input
                type="file"
                wire:model="pendingUploads"
                multiple
                accept="image/*"
                class="sr-only"
                x-ref="uploadInput"
                aria-label="{{ __('media.gallery.upload_input_label') }}"
            >

            @if ($this->canCreate)
                <flux:button
                    icon="arrow-up-tray"
                    x-on:click="$refs.uploadInput.click()"
                    wire:loading.attr="disabled"
                    wire:target="pendingUploads"
                    data-test="media-upload-button"
                    class="cursor-pointer!"
                >
                    {{ __('media.gallery.upload_button') }}
                </flux:button>
            @else
                <flux:tooltip :content="__('media.gallery.action_not_allowed')" class="cursor-not-allowed!">
                    <flux:button icon="arrow-up-tray" data-test="media-upload-button" disabled>
                        {{ __('media.gallery.upload_button') }}
                    </flux:button>
                </flux:tooltip>
            @endif
        </div>

        @if ($this->canCreate)
            {{-- D8 guard 1: the dropzone had no in-flight guard at all before
            this fix round (Phase 5 finding F-1) -- a second drop during the
            synchronous Imagick window could stage and process a duplicate
            upload. `pointer-events-none` stops the element (and therefore
            its `x-on:dragover`/`x-on:drop` handlers) from receiving any
            pointer/drag events at all while `pendingUploads` is loading,
            the same mechanism, not merely the same look, as the disabled
            button above. --}}
            <div
                data-test="media-dropzone"
                wire:loading.class="pointer-events-none opacity-50"
                wire:target="pendingUploads"
                x-on:dragover.prevent="dragging = true"
                x-on:dragleave.prevent="dragging = false"
                x-on:drop.prevent="
                    dragging = false;
                    $refs.uploadInput.files = $event.dataTransfer.files;
                    $refs.uploadInput.dispatchEvent(new Event('change'));
                "
                :class="dragging ? 'border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-800' : 'border-zinc-200 dark:border-zinc-700'"
                class="rounded-lg border-2 border-dashed p-4 text-center text-sm text-zinc-500 dark:text-zinc-400"
            >
                <span x-show="! dragging">{{ __('media.gallery.dropzone_label') }}</span>
                <span x-show="dragging" x-cloak>{{ __('media.gallery.dropzone_label_dragging') }}</span>
            </div>
        @else
            <flux:tooltip :content="__('media.gallery.action_not_allowed')" class="cursor-not-allowed!">
                <div data-test="media-dropzone" class="rounded-lg border-2 border-dashed p-4 text-center text-sm text-zinc-400 dark:text-zinc-600 opacity-75">
                    {{ __('media.gallery.dropzone_label') }}
                </div>
            </flux:tooltip>
        @endif

        {{-- `<flux:error>` reads its own `name`/`message` PROPS -- not slot
        content, per vendor/livewire/flux/stubs/resources/views/flux/error.blade.php
        -- matching the two existing call sites this project already has
        (roles.blade.php, sales-regions.blade.php). `deep` defaults to
        `true`, so this ALSO falls back to `pendingUploads.*` (D9's per-file
        validation errors, e.g. a wrong-type file at index 2 of a 4-file
        batch) whenever the array-level `pendingUploads` key itself carries
        no message -- one representative message rendered at a time, never
        both, matching this component's other single-line error outlets. --}}
        <flux:error name="pendingUploads" />

        {{-- D8 phase 1: determinate transport progress, a real percentage
        from `livewire-upload-progress`'s own `$event.detail.progress`.
        `$watch` (rather than a plain `:value` bind) assigns through
        `<ui-progress>`'s own `value` property setter, matching how this
        custom element expects to be driven imperatively. --}}
        <div
            x-show="uploadPhase === 'transport'"
            x-cloak
            data-test="media-upload-progress-transport"
            class="flex flex-col gap-1"
        >
            <span
                class="text-sm text-zinc-500 dark:text-zinc-400"
                x-text="{{ \Illuminate\Support\Js::from(__('media.gallery.uploading_progress')) }}.replace(':percent', uploadProgress)"
            ></span>
            <flux:progress x-init="$watch('uploadProgress', (value) => { $el.value = value })" />
        </div>

        {{-- D8 phase 2: indeterminate server-side processing (validation +
        the synchronous Imagick conversion + the row insert) -- no
        percentage is available here, since transport already reported
        100% while this request is still in flight. --}}
        <div
            x-show="uploadPhase === 'processing'"
            x-cloak
            data-test="media-upload-progress-processing"
            class="flex items-center gap-2"
        >
            <flux:skeleton class="h-4 w-24" />
            <span class="text-sm text-zinc-500 dark:text-zinc-400">{{ __('media.gallery.processing') }}</span>
        </div>

        {{-- Phase 5 re-review finding N-3: aria-live used to sit on the tile-grid
        div alone, so a search that emptied the grid removed the live region along
        with it -- the "no results" swap (D14, PRD's own empty-state scenario) was
        never announced. Wrapping BOTH branches is what keeps the region present
        across the swap. --}}
        <div aria-live="polite">
        @if (count($this->tiles) > 0)
            <div class="grid max-h-96 grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-4">
                @foreach ($this->tiles as $item)
                    <div
                        wire:key="media-tile-{{ $item['id'] }}"
                        data-test="media-tile-{{ $item['id'] }}"
                        aria-pressed="{{ in_array($item['id'], $selectedIds, true) ? 'true' : 'false' }}"
                        wire:click="toggleSelect(@js($item['id']))"
                        role="button"
                        tabindex="0"
                        @class([
                            'relative flex cursor-pointer flex-col gap-1 rounded-lg border p-2 text-left',
                            'border-zinc-800 ring-2 ring-zinc-800 dark:border-white dark:ring-white' => in_array($item['id'], $selectedIds, true),
                            'border-zinc-200 dark:border-zinc-700' => ! in_array($item['id'], $selectedIds, true),
                        ])
                    >
                        <picture>
                            <source srcset="{{ $item['avifUrl'] }}" type="image/avif">
                            <source srcset="{{ $item['webpUrl'] }}" type="image/webp">
                            <img src="{{ $item['url'] }}" alt="{{ $item['title'] }}" loading="lazy" class="aspect-square w-full rounded object-cover">
                        </picture>

                        <div class="truncate text-sm font-medium text-zinc-800 dark:text-white">{{ $item['title'] }}</div>

                        @if ($item['description'])
                            <div class="truncate text-xs text-zinc-500 dark:text-zinc-400">{{ $item['description'] }}</div>
                        @endif

                        <div class="mt-1 flex justify-end">
                            @if ($item['canEdit'])
                                <flux:button
                                    variant="ghost"
                                    size="sm"
                                    icon="pencil-square"
                                    aria-label="{{ __('media.edit.title_label') }}: {{ $item['title'] }}"
                                    data-test="edit-media-{{ $item['id'] }}"
                                    wire:click.stop="startEditing(@js($item['id']))"
                                    class="cursor-pointer!"
                                />
                            @else
                                <flux:tooltip :content="__('media.gallery.action_not_allowed')" class="cursor-not-allowed!">
                                    <flux:button
                                        variant="ghost"
                                        size="sm"
                                        icon="pencil-square"
                                        aria-label="{{ __('media.edit.title_label') }}: {{ $item['title'] }}"
                                        data-test="edit-media-{{ $item['id'] }}"
                                        disabled
                                    />
                                </flux:tooltip>
                            @endif
                        </div>

                        @if ($editingMediaId === $item['id'])
                            <div class="mt-1 flex flex-col gap-2 rounded border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900" wire:click.stop data-test="edit-media-form-{{ $item['id'] }}">
                                <flux:input wire:model="editTitle" :label="__('media.edit.title_label')" size="sm" />
                                <flux:textarea wire:model="editDescription" :label="__('media.edit.description_label')" rows="2" />

                                <div class="flex justify-end gap-2">
                                    <flux:button size="sm" variant="ghost" wire:click="cancelEditing" data-test="cancel-edit-media-{{ $item['id'] }}">
                                        {{ __('media.edit.cancel') }}
                                    </flux:button>
                                    <flux:button
                                        size="sm"
                                        variant="primary"
                                        wire:click="updateMediaDetails(editingMediaId, editTitle, editDescription)"
                                        data-test="save-media-{{ $item['id'] }}"
                                    >
                                        {{ __('media.edit.save') }}
                                    </flux:button>
                                </div>
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>

            @if (count($this->tiles) >= 60)
                {{-- Phase 5 fix round finding F-2: this used to reuse
                `too_many_files`, the D9 5-file UPLOAD-cap message -- wrong
                copy for this context (the D6 60-TILE grid cap). --}}
                <flux:text size="sm" class="text-center text-zinc-500 dark:text-zinc-400" data-test="media-results-truncated">
                    {{ __('media.gallery.results_truncated') }}
                </flux:text>
            @endif
        @else
            <div data-test="media-empty-state" class="flex flex-col items-center gap-1 py-12 text-center">
                <flux:heading size="sm">{{ __('media.gallery.empty_state.title') }}</flux:heading>
                <flux:subheading>{{ __('media.gallery.empty_state.body') }}</flux:subheading>
            </div>
        @endif
        </div>

        <div class="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
            {{-- A single echoed ternary, not an @if/@else block: Livewire 4's
            morph-aware Blade compilation wraps every @if block in an HTML
            comment pair (<!--[if BLOCK]--> ... <!--[endif]-->) for DOM
            diffing, which would sit between this tag's `>` and its text and
            defeat a test asserting on the element's immediate text content. --}}
            <div data-test="media-selection-count" class="text-sm text-zinc-500 dark:text-zinc-400">
                {{ count($selectedIds) === 0
                    ? __('media.gallery.selection_none')
                    : trans_choice('media.gallery.selection_count', count($selectedIds), ['count' => count($selectedIds)]) }}
            </div>

            <div class="flex gap-2">
                <flux:button variant="ghost" wire:click="cancel" data-test="media-cancel">
                    {{ __('media.gallery.cancel') }}
                </flux:button>

                <flux:button
                    variant="primary"
                    wire:click="confirmSelection"
                    data-test="media-confirm"
                    :disabled="count($selectedIds) === 0"
                >
                    {{ $confirmLabel !== '' ? $confirmLabel : ($multi ? __('media.gallery.confirm_default_multi') : __('media.gallery.confirm_default_single')) }}
                </flux:button>
            </div>
        </div>
    </div>
</flux:modal>
