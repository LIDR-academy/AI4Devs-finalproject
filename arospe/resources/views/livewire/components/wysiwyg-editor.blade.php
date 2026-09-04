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
        {{-- The whole formatting group (everything through the "Insert image" button) is wrapped
        in a `display: contents` element hidden via `x-show` while the HTML-source view is open --
        every command here acts on `$refs.editor`'s live selection, which is meaningless (and, for
        insertCodeBlock()/insertImage(), actively wrong) while that region is hidden and a <textarea>
        holds focus instead. `class="contents"` rather than a plain wrapper `<div>` so this toggle
        adds no extra flex item to the parent toolbar's own `flex flex-wrap` layout -- every child
        below still participates in that layout directly. --}}
        <div class="contents" x-show="!htmlSourceMode">
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
        {{--
            The trigger button and the popover it opens must share the SAME element that carries
            `x-on:click.outside` -- Alpine's outside-click check excludes only clicks landing on
            that bound element or its descendants, never clicks on a sibling. The button used to sit
            OUTSIDE the popover `<div>` that alone carried `click.outside`, so the button's own click
            (which follows the mousedown that opens the popover) was itself read as "outside" and
            closed the popover a moment after opening it -- reproduced live as the popover flashing
            open then immediately shut. Moving `click.outside`/the escape listener up to this
            wrapper, which contains both the button and the popover, is the fix: a click on the
            trigger is now a click on a descendant of the bound element, so it is correctly excluded.
        --}}
        <div
            class="relative"
            x-on:click.outside="closeLinkPopover()"
            x-on:keydown.escape.window="closeLinkPopover()"
        >
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

        <flux:separator vertical class="mx-1 h-6" />

        {{-- The code-block insert control: a language <select> (populated from
        config('html-sanitizer.allowed_code_languages') -- the exact same list the sanitizer
        constrains `class` against, so the editor can never offer a language the server would then
        strip on save) plus a button that wraps the current selection (or inserts an empty block)
        in `<pre><code class="language-{lang}">`. Syntax colouring is deliberately NOT applied here
        -- the code stays plain text in the editor, per this feature's own D-X (display-only
        highlighting): a highlighting LIBRARY runs only wherever the description is later
        RENDERED, never inside this admin editor, so this toolbar adds no new script dependency. --}}
        @if ($disabled)
            <flux:select disabled data-test="wysiwyg-code-language" class="w-auto">
                <flux:select.option value="plaintext">{{ __('components.wysiwyg.code_language_plaintext') }}</flux:select.option>
            </flux:select>
            <flux:button
                variant="ghost"
                size="sm"
                icon="code-bracket"
                aria-label="{{ __('components.wysiwyg.insert_code') }}"
                data-test="wysiwyg-insert-code"
                disabled
            />
        @else
            <flux:select x-model="codeLanguage" data-test="wysiwyg-code-language" class="w-auto">
                @foreach ($this->codeLanguages as $language)
                    <flux:select.option value="{{ $language }}">{{ __('components.wysiwyg.code_language_'.$language) }}</flux:select.option>
                @endforeach
            </flux:select>
            <flux:button
                variant="ghost"
                size="sm"
                icon="code-bracket"
                aria-label="{{ __('components.wysiwyg.insert_code') }}"
                data-test="wysiwyg-insert-code"
                x-on:mousedown.prevent="insertCodeBlock()"
                class="cursor-pointer!"
            />
        @endif
        </div>

        <flux:separator vertical class="mx-1 h-6" />

        {{-- The HTML-source toggle is deliberately OUTSIDE the `x-show="!htmlSourceMode"` group
        above -- it is the one control that must stay reachable WHILE source mode is open, or
        there would be no way back to the normal view. `aria-pressed` mirrors the three inline
        formatting buttons' own pattern (D10) rather than inventing a new state-reflection shape. --}}
        @if ($disabled)
            <flux:button
                variant="ghost"
                size="sm"
                icon="code-bracket-square"
                aria-label="{{ __('components.wysiwyg.toggle_html_source') }}"
                data-test="wysiwyg-html-source-toggle"
                disabled
            />
        @else
            <flux:button
                variant="ghost"
                size="sm"
                icon="code-bracket-square"
                aria-label="{{ __('components.wysiwyg.toggle_html_source') }}"
                data-test="wysiwyg-html-source-toggle"
                x-on:mousedown.prevent="toggleHtmlSource()"
                x-bind:aria-pressed="htmlSourceMode ? 'true' : 'false'"
                class="cursor-pointer!"
            />
        @endif
    </div>

    {{-- D9: the app's first wire:ignore region -- Livewire must never diff/re-render this subtree,
    or it will fight the browser's own editing (destroying the caret mid-typing at best, discarding
    input at worst). Seeded from $value once, in the server-rendered HTML itself ({!! $value !!}),
    never re-injected via JS -- because the div is wire:ignore'd, a later server re-render of $value
    (e.g. a host resetting its bound property) intentionally does NOT reach this DOM, which is a
    documented consequence (D9) a consumer must know rather than a bug. --}}
    <div
        x-ref="editor"
        x-show="!htmlSourceMode"
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
        class="wysiwyg-editor-region min-h-40 rounded-b-lg border border-t-0 border-zinc-200 p-3 text-sm outline-hidden focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-accent-foreground dark:border-zinc-700 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_h2]:text-lg [&_h2]:font-semibold [&_a]:underline [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-zinc-100 [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs dark:[&_pre]:bg-zinc-800"
    >{!! $value !!}</div>

    {{-- The HTML-source view: a plain <textarea>, never itself contenteditable, so nothing in this
    region is subject to the wire:ignore'd editor's own concerns (D9) -- it is populated and read
    back purely through Alpine's `x-model`, with no `wire:model` of its own at all. `wire:ignore` on
    the wrapper anyway, defensively: this element is not part of the component's normal server-
    rendered output once mounted (it starts empty, per `htmlSource`'s own initial value), so there
    is nothing for a Livewire re-render to legitimately touch here either. --}}
    <div wire:ignore>
        <textarea
            x-show="htmlSourceMode"
            x-cloak
            x-model="htmlSource"
            aria-label="{{ __('components.wysiwyg.html_source_label') }}"
            data-test="wysiwyg-html-source"
            spellcheck="false"
            class="min-h-40 w-full rounded-b-lg border border-t-0 border-zinc-200 p-3 font-mono text-xs outline-hidden focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-accent-foreground dark:border-zinc-700"
        ></textarea>
    </div>

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
