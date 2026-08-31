// Story 0021 -- the shared WYSIWYG rich-text editor's client-side half
// (App\Livewire\Components\WysiwygEditor, resources/views/livewire/components/wysiwyg-editor.blade.php).
// Registered on `alpine:init` per Livewire 4's own convention (Alpine ships bundled inside
// Livewire's build -- V1/V2 in ai-spec/tasks/in-progress/0021-wysiwyg-rich-text-editor-component.md
// -- so there is no separate `alpinejs` import here, and no new npm dependency). This is the app's
// first real JS module; resources/js/app.js was empty before this story.
//
// D1: hand-rolled `contenteditable` + `document.execCommand`, no rich-text library. D2: `execCommand`
// with `styleWithCSS` forced to `false` -- flipping it to `true` switches bold/italic/underline output
// from <b>/<i>/<u> to <span style="...">, and BOTH <span> and `style` are stripped by 0024's
// sanitizer, silently discarding every bit of formatting an administrator applied. Never enable it.

document.addEventListener('alpine:init', () => {
    // `config` is supplied from Blade as `x-data="wysiwygEditor({ linkInvalidScheme: @js(...) })"`
    // -- this file is a plain .js asset, never compiled by Blade, so a translated string can only
    // reach it as data passed in from the view, never via a `@js()`/`__()` call written here.
    window.Alpine.data('wysiwygEditor', (config = {}) => ({
        linkInvalidScheme: config.linkInvalidScheme ?? '',

        // D10: driven from a `document`-level `selectionchange` listener (V9) rather than
        // mouseup/keyup alone, since selectionchange is the only event that also fires for a
        // keyboard-driven selection change (e.g. arrow keys moving the caret into bold text).
        activeStates: {
            bold: false,
            italic: false,
            underline: false,
        },

        // D6 -- the caret captured on blur (step 1), restored just before an image insertion
        // (step 4). A plain `Range`, never re-derived from anything else.
        savedRange: null,

        // D8 -- the link popover's own state. No `window.prompt()` anywhere (V12: the Pest browser
        // plugin has no dialog handling at all, so a prompt()-based action would be silently
        // untestable -- a trap in the implementation, not just the test).
        linkPopoverOpen: false,
        linkUrl: '',
        linkError: '',

        syncTimeoutId: null,

        init() {
            // D2's hard rule: set explicitly, never rely on the (already-false) default, since a
            // future default change upstream would silently reopen the <span style="..."> hole.
            document.execCommand('styleWithCSS', false, false);

            this.selectionChangeHandler = () => this.refreshActiveStates();
            document.addEventListener('selectionchange', this.selectionChangeHandler);
        },

        destroy() {
            document.removeEventListener('selectionchange', this.selectionChangeHandler);
            clearTimeout(this.syncTimeoutId);
        },

        // D10: aria-pressed only reflects the selection while it is genuinely inside THIS editor
        // instance -- selectionchange is document-global, so without this guard a second editor's
        // selection would flip this instance's toolbar state too.
        refreshActiveStates() {
            const selection = window.getSelection();

            if (!selection || selection.rangeCount === 0 || !selection.anchorNode) {
                return;
            }

            if (!this.$refs.editor.contains(selection.anchorNode)) {
                return;
            }

            this.activeStates.bold = document.queryCommandState('bold');
            this.activeStates.italic = document.queryCommandState('italic');
            this.activeStates.underline = document.queryCommandState('underline');
        },

        exec(command, value = null) {
            this.$refs.editor.focus();
            document.execCommand(command, false, value);
            this.refreshActiveStates();
            this.scheduleSync();
        },

        toggleBold() {
            this.exec('bold');
        },

        toggleItalic() {
            this.exec('italic');
        },

        toggleUnderline() {
            this.exec('underline');
        },

        applyHeading() {
            this.exec('formatBlock', '<h2>');
        },

        applyBulletList() {
            this.exec('insertUnorderedList');
        },

        applyNumberedList() {
            this.exec('insertOrderedList');
        },

        // D6 step 1 -- capture on blur, which fires the instant the gallery modal's focus trap
        // takes focus (verified 2026-08-31, technical task 2: synchronously inside
        // dialog.showModal()'s own call). D6 step 3's first guard: no range to capture (nothing
        // selected, or the browser threw) LEAVES `savedRange` UNSET rather than storing a garbage
        // value or clearing a good range this instance already captured earlier -- the SECOND
        // guard, immediately before the restore in insertImage()/applyLink() below, is what
        // covers "never focused the editor at all", since if there is no blur there is no call to
        // this method either.
        //
        // D10/re-entrancy fix: mirrors refreshActiveStates()'s own containment check two methods
        // above. window.getSelection() is DOCUMENT-global -- with two editor instances on one
        // page, the selection at the instant this fires may belong to the OTHER editor entirely
        // (e.g. its "Insert image" button uses mousedown.prevent, so focus is still wherever it
        // was when this editor's own blur/openLinkPopover ran). Capturing it unconditionally would
        // let this editor insert into a range it does not own. If the selection isn't inside THIS
        // editor, do not capture it -- leave any previously-saved range as it was.
        saveCaret() {
            const selection = window.getSelection();

            if (!selection || selection.rangeCount === 0) {
                return;
            }

            if (!this.$refs.editor.contains(selection.anchorNode)) {
                return;
            }

            try {
                this.savedRange = selection.getRangeAt(0).cloneRange();
            } catch (error) {
                // Nothing to capture -- leave any previously-saved range as it was.
            }
        },

        onEditorBlur() {
            this.saveCaret();
        },

        onEditorInput() {
            this.scheduleSync();
        },

        // D9: the editable region is wire:ignore'd, so it syncs at defined points only -- a 400ms
        // debounce on `input`, plus an explicit call after an image insertion (D6 step 6), never
        // `wire:model.live` on every keystroke. `$wire.set('value', ...)` DOES propagate to a
        // host's `wire:model`-bound property through Livewire's nested-#[Modelable] channel (D3) --
        // but, like any non-`.live` `wire:model`, the write is queued client-side and only reaches
        // the host on the host's OWN next request (e.g. its Save button). Verified directly: a
        // diagnostic confirmed the queued value arrives intact the moment an unrelated host-scoped
        // request fires. That is ordinary deferred `wire:model` behaviour, not a defect here.
        scheduleSync() {
            clearTimeout(this.syncTimeoutId);

            this.syncTimeoutId = setTimeout(() => {
                this.$wire.set('value', this.$refs.editor.innerHTML);
            }, 400);
        },

        // D8: a small in-page popover, never window.prompt(). savedRange is captured here (mirrors
        // the toolbar's other mousedown.prevent buttons, D10) so the selection the link applies to
        // is the one that was active when the popover opened, not whatever the popover's own input
        // field leaves selected once it steals focus.
        openLinkPopover() {
            this.saveCaret();
            this.linkUrl = 'https://';
            this.linkError = '';
            this.linkPopoverOpen = true;
        },

        closeLinkPopover() {
            this.linkPopoverOpen = false;
        },

        // D8: the client-side scheme check is the EXPLANATION, never the control -- 0024's
        // sanitizer is the authoritative http/https/mailto restriction on `<a href>`. Refusing here
        // first only avoids the silent-loss failure mode where a javascript:/data: link looks like
        // it worked and then vanishes on save with no feedback at all.
        applyLink() {
            const url = this.linkUrl.trim();

            if (!/^(https?:|mailto:)/i.test(url)) {
                this.linkError = this.linkInvalidScheme;

                return;
            }

            this.$refs.editor.focus();

            // B1/N1 fix: a savedRange captured before saveCaret()'s own containment check existed
            // (or restored from a stale value some other way) could belong to a different editor
            // instance. Restoring it here would apply the link inside the WRONG editor -- the same
            // re-entrancy failure D6 step 3 already guards against for insertImage() below, reached
            // through this method instead. Treat an out-of-scope range as if none had been saved:
            // skip the restore and let createLink() act on the selection already in place.
            if (this.savedRange && this.$refs.editor.contains(this.savedRange.commonAncestorContainer)) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(this.savedRange);
            }

            document.execCommand('createLink', false, url);
            this.scheduleSync();
            this.linkPopoverOpen = false;
        },

        // D6 steps 4-6, the server -> client delivery this method is the target of: a scoped
        // `x-on:wysiwyg-insert-image` (no `.window` modifier) on the component's root, fed by the
        // Livewire component's own re-dispatch of the gallery's confirmed selection (V8 -- a
        // same-component dispatch is a bubbling CustomEvent from THIS component's root, so no
        // page-global name-collision risk exists here the way it does for the gallery listener
        // itself, D5).
        insertImage(url, alt) {
            this.$refs.editor.focus();

            // D6 step 3's second guard: never focused the editor at all before opening the
            // gallery -- append at the end rather than refuse. Built identically to the blur
            // handler's own fallback shape.
            //
            // B1/N1 fix: also fires when savedRange WAS captured but belongs to a different
            // editor instance -- the re-entrancy case, since saveCaret() no longer captures an
            // out-of-scope selection but an older/stale range could still reach here. Treat it
            // identically to "no range at all" rather than restoring a range that isn't ours.
            if (!this.savedRange || !this.$refs.editor.contains(this.savedRange.commonAncestorContainer)) {
                const range = document.createRange();
                range.selectNodeContents(this.$refs.editor);
                range.collapse(false);
                this.savedRange = range;
            }

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.savedRange);

            const image = document.createElement('img');
            image.src = url;
            image.alt = alt ?? '';

            document.execCommand('insertHTML', false, image.outerHTML);

            this.savedRange = null;

            // D6 step 6: sync explicitly rather than trusting insertHTML to fire a native `input`
            // event on every path -- see scheduleSync()'s comment on the deferred-flush behaviour.
            this.$wire.set('value', this.$refs.editor.innerHTML);
        },
    }));
});
