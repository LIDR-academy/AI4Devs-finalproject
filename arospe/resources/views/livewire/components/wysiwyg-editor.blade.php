{{--
    Story 0021 -- the shared WYSIWYG rich-text editor. `x-data="wysiwygEditor(...)"` (registered in
    resources/js/app.js on `alpine:init`) owns every bit of client-side state: the three inline
    aria-pressed flags (D10), the D6 caret capture/restore pair, and the D8 link popover. The Blade
    side supplies only what JS cannot: the translated `linkInvalidScheme` string (this file is the
    only place `@js()`/`__()` can run at all -- resources/js/app.js is a plain asset, never compiled
    by Blade) and the server-authoritative gates (D4's @can-wrapped image controls).

    D13 (Phase 2 finding): the harness mounts TWO editor instances on one page, and every data-test
    hook below is a STATIC string -- exactly the trap docs/testing/frontend/playwright-setup.md
    already documents for the gallery. `data-test="wysiwyg-editor-{{ $this->getId() }}"` on this
    file's own root is the per-instance scoping root a browser test descendant-selects from, using
    the component's own opaque Livewire id rather than inventing a second identifier.
--}}
<div
    x-data="wysiwygEditor({ linkInvalidScheme: @js(__('components.wysiwyg.link_invalid_scheme')) })"
    data-test="wysiwyg-editor-{{ $this->getId() }}"
    class="flex flex-col gap-1"
    x-on:wysiwyg-insert-image="insertImage($event.detail.url, $event.detail.alt)"
>
    {{--
        D6 step 5 -- FIXED (found by a throwaway diagnostic browser test, since removed):
        `$this->dispatch('wysiwyg-insert-image', ...)` fires from THIS
        COMPONENT'S ROOT element (this <div>), and a CustomEvent only ever bubbles UPWARD from its
        dispatch point toward `document` -- it never propagates back DOWN into descendants. The
        listener was first written on the wire:ignore'd editable region below, a CHILD of this root,
        which put it outside the event's entire propagation path (neither the bubble target's
        ancestor chain nor the capture path reaches a sibling/descendant that isn't the target
        itself) -- so it silently never fired. The diagnostic's own `document.addEventListener(...,
        true)` looked like proof the wiring worked because a document-level CAPTURE listener sees
        every event on the page regardless of where it originated; it proved nothing about whether
        THIS component's own handler received it. The listener now lives on the x-data root itself,
        the actual dispatch target, where `$refs.editor` remains reachable exactly as before --
        `$refs` resolves against the x-data SCOPE, not against whichever element the listener
        happens to sit on.
    --}}
    {{-- N6: `id` referenced by the editable region's `aria-labelledby` below, so the region has an
    accessible name whenever a label is supplied -- this label is otherwise a bare <label> with no
    `for`/`aria-labelledby` pairing, since the control it names is a contenteditable div rather
    than a native form control a `for` attribute could target. --}}
    @if ($label !== '')
        <flux:label id="wysiwyg-editor-label-{{ $this->getId() }}">{{ $label }}</flux:label>
    @endif

    {{-- D10: role="toolbar" with its own aria-label; every button uses mousedown.prevent, not
    click -- a click handler blurs the editor and collapses the selection before the command runs,
    the single most common way a hand-rolled toolbar silently does nothing. --}}
    <div
        role="toolbar"
        aria-label="{{ __('components.wysiwyg.toolbar_label') }}"
        class="flex flex-wrap items-center gap-1 rounded-t-lg border border-zinc-200 bg-zinc-50 p-1.5 dark:border-zinc-700 dark:bg-zinc-800"
    >
        {{-- Every toolbar button below is a written-out @if($disabled)/@else pair, never a bare
        `@disabled($disabled)`/`:disabled="$disabled"` directive inside a <flux:button> tag. Found
        the hard way: a bare `@disabled(...)` inside a Blaze-folded component tag's attribute list
        does not compile the way it would on a plain HTML tag -- it corrupts the tag's whole
        attribute string into invalid PHP (`<?php if: echo 'disabled'; endif; ?>="..."`), which is a
        PHP SYNTAX ERROR that breaks the ENTIRE compiled view, not just this button's disabled state.
        The same family as the already-documented tooltip-presence and cursor-not-allowed traps
        (docs/errors-log.md) -- do not "simplify" this back into a single conditional attribute. --}}
        @if ($disabled)
            <flux:button
                variant="ghost"
                size="sm"
                icon="bold"
                aria-label="{{ __('components.wysiwyg.bold') }}"
                data-test="wysiwyg-bold"
                disabled
            />
        @else
            <flux:button
                variant="ghost"
                size="sm"
                icon="bold"
                aria-label="{{ __('components.wysiwyg.bold') }}"
                data-test="wysiwyg-bold"
                x-on:mousedown.prevent="toggleBold()"
                x-bind:aria-pressed="activeStates.bold ? 'true' : 'false'"
                class="cursor-pointer!"
            />
        @endif

        @if ($disabled)
            <flux:button
                variant="ghost"
                size="sm"
                icon="italic"
                aria-label="{{ __('components.wysiwyg.italic') }}"
                data-test="wysiwyg-italic"
                disabled
            />
        @else
            <flux:button
                variant="ghost"
                size="sm"
                icon="italic"
                aria-label="{{ __('components.wysiwyg.italic') }}"
                data-test="wysiwyg-italic"
                x-on:mousedown.prevent="toggleItalic()"
                x-bind:aria-pressed="activeStates.italic ? 'true' : 'false'"
                class="cursor-pointer!"
            />
        @endif

        @if ($disabled)
            <flux:button
                variant="ghost"
                size="sm"
                icon="underline"
                aria-label="{{ __('components.wysiwyg.underline') }}"
                data-test="wysiwyg-underline"
                disabled
            />
        @else
            <flux:button
                variant="ghost"
                size="sm"
                icon="underline"
                aria-label="{{ __('components.wysiwyg.underline') }}"
                data-test="wysiwyg-underline"
                x-on:mousedown.prevent="toggleUnderline()"
                x-bind:aria-pressed="activeStates.underline ? 'true' : 'false'"
                class="cursor-pointer!"
            />
        @endif

        <flux:separator vertical class="mx-1 h-6" />

        @if ($disabled)
            <flux:button
                variant="ghost"
                size="sm"
                icon="h2"
                aria-label="{{ __('components.wysiwyg.heading') }}"
                data-test="wysiwyg-h2"
                disabled
            />
        @else
            <flux:button
                variant="ghost"
                size="sm"
                icon="h2"
                aria-label="{{ __('components.wysiwyg.heading') }}"
                data-test="wysiwyg-h2"
                x-on:mousedown.prevent="applyHeading()"
                class="cursor-pointer!"
            />
        @endif

        @if ($disabled)
            <flux:button
                variant="ghost"
                size="sm"
                icon="list-bullet"
                aria-label="{{ __('components.wysiwyg.bullet_list') }}"
                data-test="wysiwyg-bullet-list"
                disabled
            />
        @else
            <flux:button
                variant="ghost"
                size="sm"
                icon="list-bullet"
                aria-label="{{ __('components.wysiwyg.bullet_list') }}"
                data-test="wysiwyg-bullet-list"
                x-on:mousedown.prevent="applyBulletList()"
                class="cursor-pointer!"
            />
        @endif

        @if ($disabled)
            <flux:button
                variant="ghost"
                size="sm"
                icon="numbered-list"
                aria-label="{{ __('components.wysiwyg.numbered_list') }}"
                data-test="wysiwyg-numbered-list"
                disabled
            />
        @else
            <flux:button
                variant="ghost"
                size="sm"
                icon="numbered-list"
                aria-label="{{ __('components.wysiwyg.numbered_list') }}"
                data-test="wysiwyg-numbered-list"
                x-on:mousedown.prevent="applyNumberedList()"
                class="cursor-pointer!"
            />
        @endif

        <flux:separator vertical class="mx-1 h-6" />

        {{-- D8: an in-page popover, never window.prompt(). Positioning is a plain relative/absolute
        pair rather than <flux:dropdown> -- ui-dropdown's own toggle mechanics are unverified against
        this exact "typed input + apply button" content shape, and this component's own
        linkPopoverOpen/x-show pairing is what the browser tests (a later technical task) drive
        through fill()/click() either way. --}}
        <div class="relative">
            @if ($disabled)
                <flux:button
                    variant="ghost"
                    size="sm"
                    icon="link"
                    aria-label="{{ __('components.wysiwyg.link') }}"
                    data-test="wysiwyg-link"
                    disabled
                />
            @else
                <flux:button
                    variant="ghost"
                    size="sm"
                    icon="link"
                    aria-label="{{ __('components.wysiwyg.link') }}"
                    data-test="wysiwyg-link"
                    x-on:mousedown.prevent="openLinkPopover()"
                    class="cursor-pointer!"
                />
            @endif

            <div
                x-show="linkPopoverOpen"
                x-cloak
                x-on:click.outside="closeLinkPopover()"
                x-on:keydown.escape.window="closeLinkPopover()"
                class="absolute z-10 mt-1 flex w-64 flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
            >
                <flux:input
                    type="url"
                    x-model="linkUrl"
                    :label="__('components.wysiwyg.link_url_label')"
                    data-test="wysiwyg-link-url"
                    size="sm"
                />

                <p x-show="linkError" x-cloak x-text="linkError" class="text-xs text-red-600 dark:text-red-400"></p>

                <div class="flex justify-end">
                    <flux:button
                        size="sm"
                        variant="primary"
                        data-test="wysiwyg-link-apply"
                        x-on:click.prevent="applyLink()"
                        class="cursor-pointer!"
                    >
                        {{ __('components.wysiwyg.link_apply') }}
                    </flux:button>
                </div>
            </div>
        </div>

        {{-- D4: the "Insert image" control is not hidden for a user lacking media.view -- it
        renders disabled inside a tooltip explaining why, matching the Users list's per-row
        convention. An explicit <flux:tooltip> wrapper on its own branch, never a conditionally-
        bound :tooltip prop -- the Blaze presence trap docs/errors-log.md records. --}}
        @can('viewAny', \App\Models\Media::class)
            @if ($disabled)
                <flux:button
                    variant="ghost"
                    size="sm"
                    icon="photo"
                    aria-label="{{ __('components.wysiwyg.insert_image') }}"
                    data-test="wysiwyg-insert-image"
                    disabled
                />
            @else
                <flux:button
                    variant="ghost"
                    size="sm"
                    icon="photo"
                    aria-label="{{ __('components.wysiwyg.insert_image') }}"
                    data-test="wysiwyg-insert-image"
                    x-on:mousedown.prevent="saveCaret()"
                    wire:click="openGallery"
                    class="cursor-pointer!"
                />
            @endif
        @else
            <flux:tooltip :content="__('components.wysiwyg.insert_image_not_allowed')" class="cursor-not-allowed!">
                <flux:button
                    variant="ghost"
                    size="sm"
                    icon="photo"
                    aria-label="{{ __('components.wysiwyg.insert_image') }}"
                    data-test="wysiwyg-insert-image"
                    disabled
                />
            </flux:tooltip>
        @endcan
    </div>

    {{-- D9: the app's first wire:ignore region -- Livewire must never diff/re-render this subtree,
    or it will fight the browser's own editing (destroying the caret mid-typing at best, discarding
    input at worst). Seeded from $value once, in the server-rendered HTML itself ({!! $value !!}),
    never re-injected via JS -- because the div is wire:ignore'd, a later server re-render of $value
    (e.g. a host resetting its bound property) intentionally does NOT reach this DOM, which is a
    documented consequence (D9) a consumer must know rather than a bug. --}}
    <div
        x-ref="editor"
        wire:ignore
        contenteditable="{{ $disabled ? 'false' : 'true' }}"
        role="textbox"
        aria-multiline="true"
        @if ($label !== '')
            aria-labelledby="wysiwyg-editor-label-{{ $this->getId() }}"
        @endif
        data-test="wysiwyg-editor-region"
        data-placeholder="{{ $placeholder !== '' ? $placeholder : __('components.wysiwyg.placeholder') }}"
        x-on:input="onEditorInput()"
        x-on:blur="onEditorBlur()"
        class="wysiwyg-editor-region min-h-40 rounded-b-lg border border-t-0 border-zinc-200 p-3 text-sm outline-hidden focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-accent-foreground dark:border-zinc-700 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_h2]:text-lg [&_h2]:font-semibold [&_a]:underline"
    >{!! $value !!}</div>

    {{-- D4: the editor embeds the gallery itself, single-select, per-instance-unique select-event
    (D5). @can-wrapped per 0020 D12 -- a user lacking media.view never mounts a child that would
    Gate::authorize()-403 the entire host page. --}}
    @can('viewAny', \App\Models\Media::class)
        <livewire:media.gallery
            wire:model="showGallery"
            wire:key="wysiwyg-editor-gallery-{{ $this->getId() }}"
            :multi="false"
            :select-event="$galleryEvent"
            :confirm-label="__('components.wysiwyg.insert_image_confirm')"
        />
    @endcan
</div>
