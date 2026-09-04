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

// Live code-block syntax colouring (revises this story's earlier "display-only" decision --
// D-16bis, per an explicit user request to colour code AS IT IS TYPED, not only when shown
// elsewhere). `highlight.js/lib/core` + one `import` per allowed language, rather than the
// `highlight.js` index -- the index registers ~190 languages and would bloat the admin bundle for
// the 8 this project's own allow-list (config('html-sanitizer.allowed_code_languages')) will ever
// ask for. 'html' is never separately imported: highlight.js's own `xml` grammar declares 'html' as
// one of its built-in aliases (verified directly -- `hljs.getLanguage('html')` resolves once `xml`
// is registered), so registering `xml` alone covers both. 'plaintext' has no grammar at all and is
// never passed to hljs -- see `isHighlightable()` below.
import hljs from 'highlight.js/lib/core';
import bashLang from 'highlight.js/lib/languages/bash';
import cssLang from 'highlight.js/lib/languages/css';
import javascriptLang from 'highlight.js/lib/languages/javascript';
import jsonLang from 'highlight.js/lib/languages/json';
import phpLang from 'highlight.js/lib/languages/php';
import sqlLang from 'highlight.js/lib/languages/sql';
import xmlLang from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('bash', bashLang);
hljs.registerLanguage('css', cssLang);
hljs.registerLanguage('javascript', javascriptLang);
hljs.registerLanguage('json', jsonLang);
hljs.registerLanguage('php', phpLang);
hljs.registerLanguage('sql', sqlLang);
hljs.registerLanguage('xml', xmlLang);

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

        // The HTML-source toggle's own state: when true, `$refs.editor` (the contenteditable
        // region) and the formatting toolbar are hidden, and `htmlSource` -- a plain <textarea>,
        // never itself contenteditable -- shows/edits the region's raw markup instead. `htmlSource`
        // is populated ONLY at the moment of toggling INTO source mode (toggleHtmlSource() below)
        // and is written back into `$refs.editor.innerHTML` ONLY at the moment of toggling back OUT
        // -- there is no live two-way sync while source mode is open, matching D9's "sync at
        // defined points only" rule for the contenteditable region itself.
        htmlSourceMode: false,
        htmlSource: '',

        // Preview mode's own state (D-16bis): a third, read-only view alongside Edit/HTML source
        // in the same toolbar panel. `previewHtml` is a plain snapshot string, written only at the
        // moment Preview is opened (togglePreview() below) -- never live-bound to the editor, the
        // same "sync at defined points only" shape `htmlSource` above already uses.
        previewMode: false,
        previewHtml: '',

        // The code-block insert control's own state: the toolbar <select> this is bound to lists
        // exactly config('html-sanitizer.allowed_code_languages') (passed in from Blade, D-16 --
        // the two lists cannot drift because one is the source of the other).
        codeLanguage: 'plaintext',

        syncTimeoutId: null,

        init() {
            // D2's hard rule: set explicitly, never rely on the (already-false) default, since a
            // future default change upstream would silently reopen the <span style="..."> hole.
            document.execCommand('styleWithCSS', false, false);

            this.selectionChangeHandler = () => this.refreshActiveStates();
            document.addEventListener('selectionchange', this.selectionChangeHandler);

            // Colour any code blocks already present in the server-seeded `{!! $value !!}` markup
            // (D9) -- without this, reopening a product with existing code shows it as plain text
            // until the administrator edits it.
            this.highlightAllCodeBlocks();
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

        // Live per-keystroke code colouring (D-16bis): if the caret is currently inside a
        // `<code class="language-x">` block, re-highlight ONLY that block on every input event --
        // never the whole editor, which would also fight the caret inside any prose being typed
        // elsewhere. `closest()` is resolved from the input event's own selection rather than from
        // `event.target`, because a native `input` event on a contenteditable region always targets
        // the region itself, not the specific descendant the caret is in.
        onEditorInput() {
            const selection = window.getSelection();

            if (selection && selection.rangeCount > 0) {
                const anchor = selection.anchorNode;
                const anchorElement = anchor && anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : anchor;
                const codeEl = anchorElement && anchorElement.closest
                    ? anchorElement.closest('code[class*="language-"]')
                    : null;

                if (codeEl && this.$refs.editor.contains(codeEl)) {
                    this.highlightCodeElement(codeEl);
                }
            }

            this.scheduleSync();
        },

        // 'plaintext' (and any language hljs has no grammar registered for) is never passed to
        // hljs -- there is nothing to colour, and hljs.highlight() would throw on an unregistered
        // language name rather than silently no-op.
        isHighlightable(language) {
            return language !== 'plaintext' && Boolean(hljs.getLanguage(language));
        },

        // Re-colours ONE code block in place, preserving the caret across the innerHTML rewrite a
        // fresh highlight pass requires. The offset is a plain character count from the start of
        // the block's OWN text (getCaretOffset/setCaretOffset below), not a DOM node/index pair --
        // the set of text nodes changes shape on every re-highlight (that is the whole point of
        // re-highlighting), so a node reference captured before the rewrite would already be
        // detached by the time it needs restoring.
        highlightCodeElement(codeEl) {
            const language = (codeEl.className.match(/language-(\S+)/) || [])[1] || 'plaintext';

            if (! this.isHighlightable(language)) {
                return;
            }

            const offset = this.getCaretOffset(codeEl);
            codeEl.innerHTML = hljs.highlight(codeEl.textContent, { language }).value;

            if (offset !== null) {
                this.setCaretOffset(codeEl, offset);
            }
        },

        // Re-colours every code block currently in the editor -- used at mount (init() above), when
        // leaving HTML-source mode (toggleHtmlSource() below, since the administrator may have
        // typed/pasted a fresh `<pre><code class="language-x">` block there), and right after
        // insertCodeBlock() inserts a new one. No caret to preserve in any of these three callers
        // (the caret is not inside a code block yet, or the region is about to be hidden), unlike
        // highlightCodeElement() above.
        highlightAllCodeBlocks() {
            this.$refs.editor.querySelectorAll('pre code[class*="language-"]').forEach((codeEl) => {
                const language = (codeEl.className.match(/language-(\S+)/) || [])[1] || 'plaintext';

                if (this.isHighlightable(language)) {
                    codeEl.innerHTML = hljs.highlight(codeEl.textContent, { language }).value;
                }
            });
        },

        // Character offset of the caret from the start of `container`'s own text, or `null` if the
        // selection is not inside it at all. Built on a Range spanning [start of container, caret]
        // and its own `.toString()` rather than walking text nodes by hand -- the Range's string
        // form already collapses exactly the way `.textContent` does, which is what
        // highlightCodeElement() above re-highlights FROM, so the two stay in the same coordinate
        // space.
        getCaretOffset(container) {
            const selection = window.getSelection();

            if (!selection || selection.rangeCount === 0) {
                return null;
            }

            const range = selection.getRangeAt(0);

            if (!container.contains(range.startContainer)) {
                return null;
            }

            const preCaretRange = document.createRange();
            preCaretRange.selectNodeContents(container);
            preCaretRange.setEnd(range.startContainer, range.startOffset);

            return preCaretRange.toString().length;
        },

        // The inverse of getCaretOffset() above: walks `container`'s text nodes in document order,
        // finds the one the offset falls inside, and collapses the selection there. Falls back to
        // the end of the container if `offset` runs past the end of its text (defensive only -- the
        // offset this is always called with was captured from the SAME text a moment earlier).
        setCaretOffset(container, offset) {
            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
            let remaining = offset;
            let node = walker.nextNode();

            while (node) {
                if (remaining <= node.textContent.length) {
                    const range = document.createRange();
                    range.setStart(node, remaining);
                    range.collapse(true);

                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);

                    return;
                }

                remaining -= node.textContent.length;
                node = walker.nextNode();
            }

            const range = document.createRange();
            range.selectNodeContents(container);
            range.collapse(false);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        },

        // The value this component ever hands to the server: a CLONE of the live editor with every
        // `<code>` element's children collapsed back to a single plain-text node, discarding the
        // `hljs-*` colouring spans highlightCodeElement()/highlightAllCodeBlocks() above insert.
        // Reading `.textContent` off a `<code>` element already returns its plain text regardless of
        // how many colouring spans are inside it, so re-assigning that same string as `.textContent`
        // is enough to strip them -- this keeps config('html-sanitizer.allowed_elements') free of
        // `<span class="hljs-*">` entirely: colouring is purely a live-editor/preview affordance,
        // never part of what is persisted. The LIVE editor DOM itself is never touched here (this
        // clones first), so the administrator's own colour view is undisturbed by every sync.
        buildCleanValue() {
            const clone = this.$refs.editor.cloneNode(true);

            clone.querySelectorAll('code').forEach((codeEl) => {
                codeEl.textContent = codeEl.textContent;
            });

            return clone.innerHTML;
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
                this.$wire.set('value', this.buildCleanValue());
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

        // Switches the editable region between the normal contenteditable view and a plain
        // <textarea> showing/editing `$refs.editor.innerHTML` verbatim as text. Reading and writing
        // `.innerHTML` is what this project's own D9 rule already relies on for the initial
        // server-rendered seed ({!! $value !!}); this reuses exactly that mechanism at a second,
        // administrator-triggered point rather than inventing a new one. Setting `.innerHTML` from
        // a string never EXECUTES any markup in it (browsers do not run <script> content assigned
        // this way), so toggling back out with an administrator's pasted markup is inert in this
        // browser tab regardless of what it contains -- the authoritative check remains
        // App\Actions\Products\SanitizeProductDescription on save, exactly as it already is for
        // every other insertion path in this file. Toggling OUT syncs immediately (not the
        // debounced scheduleSync()) since this is a deliberate, discrete edit, not a keystroke.
        toggleHtmlSource() {
            if (this.htmlSourceMode) {
                this.$refs.editor.innerHTML = this.htmlSource;
                this.htmlSourceMode = false;
                this.highlightAllCodeBlocks();
                this.refreshActiveStates();
                this.$wire.set('value', this.buildCleanValue());

                return;
            }

            // Mutual exclusivity with Preview (D-16bis): only one of the three modes is ever open
            // at once. `htmlSource` is seeded from the CLEAN value, not the live colour-highlighted
            // DOM -- source mode shows the markup that will actually be persisted, matching this
            // toggle's own pre-existing contract (a save/reload round trip already proves this in
            // tests/Browser/Components/WysiwygEditorTest.php).
            this.previewMode = false;
            this.htmlSource = this.buildCleanValue();
            this.htmlSourceMode = true;
        },

        // Preview mode (D-16bis): a third, read-only view showing exactly how the description will
        // render, alongside Edit/HTML source in the same toolbar panel. Toggling it OFF is a plain
        // flip back to Edit -- `previewHtml` is left as-is (stale) until the next time Preview is
        // opened, since nothing reads it while `previewMode` is false.
        togglePreview() {
            if (this.previewMode) {
                this.previewMode = false;

                return;
            }

            // If HTML-source mode was open, commit its content back into the editor first (the
            // same transition toggleHtmlSource()'s own OUT branch performs) so Preview reflects the
            // administrator's latest edit rather than markup from before the source-mode edit.
            if (this.htmlSourceMode) {
                this.$refs.editor.innerHTML = this.htmlSource;
                this.htmlSourceMode = false;
                this.highlightAllCodeBlocks();
                this.refreshActiveStates();
            }

            // A plain snapshot of the editor's own current (already colour-highlighted) markup --
            // Preview is meant to show the SAME colouring the editor already displays live, not a
            // second independent render of it.
            this.previewHtml = this.$refs.editor.innerHTML;
            this.previewMode = true;
        },

        // Inserts an empty `<pre><code class="language-{codeLanguage}">` block at the caret (or
        // wrapping the current selection's text, if any), followed by an empty paragraph so the
        // caret always has somewhere to land AFTER the block -- without it, a `<pre>` landing as
        // the region's last child leaves no way to click past it to keep typing prose, the same
        // "no exit" trap a block-level insertion at the end of a contenteditable region always
        // risks. Built via createElement + .textContent (never a template string interpolating the
        // selected text into HTML), so a selection containing `<`/`&`/`>` is rendered as literal
        // code text rather than being re-parsed as markup -- the identical safe-insertion shape
        // insertImage() below already uses for `alt`.
        insertCodeBlock() {
            this.$refs.editor.focus();

            const selection = window.getSelection();
            const selectedText = selection && this.$refs.editor.contains(selection.anchorNode)
                ? selection.toString()
                : '';

            const code = document.createElement('code');
            code.className = 'language-' + this.codeLanguage;
            code.textContent = selectedText;

            const pre = document.createElement('pre');
            pre.appendChild(code);

            document.execCommand('insertHTML', false, pre.outerHTML + '<p><br></p>');

            // Colour the freshly-inserted block immediately, rather than waiting for the next
            // keystroke inside it -- otherwise a block inserted from a non-empty selection would
            // show as plain text until the administrator typed something.
            this.highlightAllCodeBlocks();
            this.scheduleSync();
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
            this.$wire.set('value', this.buildCleanValue());
        },
    }));
});
