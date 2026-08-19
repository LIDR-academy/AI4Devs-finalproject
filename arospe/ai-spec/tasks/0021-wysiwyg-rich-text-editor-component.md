# [0021] Shared WYSIWYG rich-text editor component (frontend)

## Description
A reusable, content-agnostic rich-text editor Livewire component whose toolbar carries exactly eight
actions — Bold, Italic, Underline, H2, bullet list, numbered list, link, and "Insert image" — and
whose output is the HTML that `products.description` ([0024](0024-products-core-crud-backend.md))
stores and Epic 4's blog body will reuse. "Insert image" opens the shared media gallery
([0020](0020-shared-media-gallery-modal-ui.md)) in **single-select** mode and places the chosen image
inline **at the cursor position**.

The HTML is sanitized **server-side on write** (0024's [D-16](0024-products-core-crud-backend.md), an
already-approved `symfony/html-sanitizer` dependency), so this component performs **no client-side
sanitization**. Its one obligation on that axis is narrower and is the coordination point with 0024:
**every tag it can emit must already be inside that allow-list**, so the sanitizer never silently
destroys an administrator's formatting.

## Type
frontend | includes database-expert: **no**

Not full-stack and not split: this story creates no table, no migration, no query, no action, no
policy, no permission and no server-side domain logic. Its only PHP is a Livewire component class
whose public surface is a `#[Modelable]` string. `database-expert` and `backend-*` are therefore
deliberately not convened, per [workflow.md](../../docs/workflow.md#task-classification-rule).

## Three Amigos participants

`product-owner` (lead) + `frontend-expert` + `frontend-qa`.

> **Process note.** Both experts were convened as subagents and both delivered; their contributions
> are folded in below rather than quoted wholesale. The mechanical claims that decide this story were
> **executed, not reasoned about** — `frontend-expert` drove a real headless Chromium session to
> record what `document.execCommand` actually emits in the engine CI uses, and `frontend-qa` read the
> Pest browser plugin's real method surface. `product-owner` independently re-verified the two
> findings that change another story's contract (V6 and V12) before writing them down. Claims that
> could not be executed — chiefly the caret's survival across a Flux modal, which needs markup that
> does not exist yet — are recorded as **risks, not asserted** ([R-1](#dependencies-risks--open-questions)).

## PRD coverage

This story owns **one** of [§2.3](../../docs/PRD/PRD.md#23-shared-media-gallery)'s Gherkin scenarios
and **half** of one acceptance criterion:

- *"Inserting an image inline from the WYSIWYG editor"*
- AC **7**, the **inline-insertion half** only. The featured-image half (*"Selecting an image in
  featured mode sets the featured image"*) belongs to **0027**.

It also realises the toolbar named in the PRD's
[Design reference & the dashboard shell](../../docs/PRD/PRD.md#design-reference--the-dashboard-shell)
section — *"the **WYSIWYG toolbar** (Bold, Italic, Underline, H2, bullet list, numbered list, link,
Insert image)"* — which fixes the button set exactly and is why this story adds no ninth button.

**The visual reference** is the prototype's `.wysiwyg__toolbar` / `.editor` styling
([`docs/arospe-handoff/project/css/common.css`](../../docs/arospe-handoff/project/css/common.css)
lines 277–305) and its `bindEditor()` / `toolbarHTML()`
([`js/common.js`](../../docs/arospe-handoff/project/js/common.js) lines 356–399). Per the PRD's own
banner, that bundle is **style guide only — none of its markup or JS is ported**.

**Not covered here, deliberately:**

| Out of scope | Owner |
|---|---|
| The gallery modal itself — tiles, search, upload, selection, the confirm payload | **0020**, consumed unchanged |
| Sanitizing the HTML, `config/html-sanitizer.php`, the `products.description` column | **0024** ([D-16](0024-products-core-crud-backend.md)) |
| Any real page hosting this editor (the product editor) | **0027**, not yet debated |
| The blog post editor and its body field | **Epic 4**, which reuses this component unchanged |
| The featured-image picker | **0027** |
| Storefront/front-office rendering of the produced HTML | **Nobody, this phase** — no front office exists |

---

## Gherkin

```gherkin
Feature: Formatting text with the WYSIWYG toolbar

  Scenario Outline: Applying an inline text format from the toolbar
    Given a catalog administrator with the rich-text editor open and some text selected
    When they apply <inline_format> from the toolbar
    Then the selected text is shown in <inline_format>

    Examples:
      | inline_format |
      | bold          |
      | italic        |
      | underline     |

  Scenario Outline: Removing an inline text format already applied
    Given a catalog administrator with the rich-text editor open and some already-<inline_format> text selected
    When they apply <inline_format> from the toolbar again
    Then the selected text is no longer shown in <inline_format>

    Examples:
      | inline_format |
      | bold          |
      | italic        |
      | underline     |

  Scenario: Structuring a line of text as a heading
    Given a catalog administrator with the rich-text editor open and a line of text selected
    When they apply the heading style from the toolbar
    Then that line is shown as a heading

  Scenario: Structuring several lines as a bullet list
    Given a catalog administrator with the rich-text editor open and several lines of text selected
    When they turn those lines into a bullet list from the toolbar
    Then each line is shown as a bulleted list item

  Scenario: Structuring several lines as a numbered list
    Given a catalog administrator with the rich-text editor open and several lines of text selected
    When they turn those lines into a numbered list from the toolbar
    Then each line is shown as a numbered list item

  Scenario: Turning selected text into a link
    Given a catalog administrator with the rich-text editor open and some text selected
    When they turn the selected text into a link pointing at a web address
    Then the selected text is shown as a link to that address

  Scenario: The toolbar reflects the formatting of the text under the cursor
    Given a catalog administrator with the rich-text editor open
    When they place the cursor inside a word that is already bold
    Then the toolbar shows the bold action as active
```

```gherkin
Feature: Inserting an image inline from the WYSIWYG editor

  Scenario: Inserting an image inline from the WYSIWYG editor
    Given a blog editor with the WYSIWYG "insert image" action active
    When they insert a selected image from the gallery
    Then the image is placed inline in the description or body

  Scenario: The insert-image action offers only one image at a time
    Given a catalog administrator with the rich-text editor open
    When they choose the "insert image" action from the toolbar
    Then the shared media gallery opens allowing exactly one image to be chosen

  Scenario: A confirmed image lands where the cursor was
    Given a catalog administrator who has placed the cursor between two words of existing content and opened the gallery from "insert image"
    When they confirm one image in the gallery
    Then the image appears between those two words, with the content on both sides preserved

  Scenario: Inserting an image without having placed a cursor appends it
    Given a catalog administrator who opens the gallery from "insert image" without having placed the cursor in the editor
    When they confirm one image in the gallery
    Then the image is appended at the end of the existing content rather than being refused

  Scenario: Cancelling the gallery leaves the content untouched
    Given a catalog administrator who has opened the gallery from the editor's "insert image" action
    When they cancel the gallery
    Then the editor's content is exactly as it was before the gallery opened

  Scenario: Two editors on one screen never receive each other's image
    Given a catalog administrator on a screen carrying two independent rich-text editors
    When they insert an image from the first editor's gallery
    Then only the first editor receives the image and the second is untouched
```

```gherkin
Feature: The editor's output stays within the HTML the server accepts

  Scenario Outline: Every toolbar action produces only server-accepted HTML
    Given a catalog administrator with the rich-text editor open
    When they apply <toolbar_action>
    Then the editor's content uses only the tags the server is configured to keep

    Examples:
      | toolbar_action   |
      | bold             |
      | italic           |
      | underline        |
      | the heading      |
      | a bullet list    |
      | a numbered list  |
      | a link           |
      | an image         |

  Scenario: A composed description still stays within the server-accepted HTML
    Given a catalog administrator who has composed content using several toolbar actions in sequence
    When they hand the content over to be saved
    Then the content uses only the tags the server is configured to keep

  Scenario: A link to an unsupported address scheme is refused before it is applied
    Given a catalog administrator with the rich-text editor open and some text selected
    When they try to link the selection to an address using an unsupported scheme
    Then they are told the address is not valid and the selection is left unlinked
```

```gherkin
Feature: Authorization on the editor's insert-image action

  Scenario: An administrator without media access is not offered the insert-image action
    Given a signed-in administrator who holds no media permission, on a screen carrying the rich-text editor
    When the screen is displayed
    Then the insert-image action is shown as unavailable with an explanation, and the rest of the toolbar works normally
```

---

## Verified findings that drive the decisions below

Executed against this repository and this machine during the debate. Several decisions below would be
wrong without them. **V6 and V12 change how another story's contract must be consumed** and were
re-verified by `product-owner` independently of the agent that found them.

| # | Finding | How it was verified | Consequence |
|---|---|---|---|
| V1 | **Alpine already ships on every page**, bundled inside Livewire 4's own build and exported as `window.Alpine`. There is no separate `alpinejs` package. | `vendor/livewire/livewire/dist/livewire.js:15816` (`window.Alpine = module_default`); `package.json` has no `alpinejs`. | A hand-rolled Alpine editor needs **zero new dependency**. |
| V2 | **This project ships no rich-text JS library and almost no JS at all.** `package.json` `dependencies` are `@laravel/passkeys`, `@tailwindcss/vite`, `concurrently`, `laravel-vite-plugin`, `tailwindcss`, `vite`; `devDependencies` is `playwright` only. `resources/js/app.js` is **empty**; `passkeys.js` is the only real module. | Read `package.json`, `vite.config.js`, `resources/js/`. | TipTap/Quill/Trix would be this project's **first** bundled UI library — an approval-gated change per project `CLAUDE.md`, not a drop-in. |
| V3 | **`execCommand('bold'\|'italic'\|'underline')` emits `<b>`, `<i>`, `<u>` in Chromium** — not `<strong>`/`<em>`, and **no inline `style`**. `styleWithCSS` defaults to `false`; setting it `true` switches the output to `<span style="font-weight: bold;">`. | Executed in a real headless Chromium session (the `chromium-1228` build in `node_modules/playwright`), reading `innerHTML` off a live `contenteditable`. | **Decisive, and the story's central good news:** `<b>`/`<i>`/`<u>` are explicitly allowed alternates in 0024 [D-16](0024-products-core-crud-backend.md)'s table. The naive output is already inside the allow-list — **no client-side tag-remapping layer is needed.** And `styleWithCSS` must **never** be enabled ([D2](#d2--the-exact-html-tag-set-this-editor-may-emit)). |
| V4 | **`formatBlock '<h2>'` → clean `<h2>…</h2>`; `createLink` → clean `<a href="…">…</a>`; pressing Enter creates a new `<p>`, never a `<div>`.** | Same Chromium session. | Every block/line structure the toolbar produces is inside the allow-list with no post-processing. |
| V5 | **`insertUnorderedList`/`insertOrderedList` nest the list *inside* a `<p>`** in the live DOM — `<p><ul><li>…</li></ul></p>` — which the HTML5 content model forbids. Re-parsing that exact string with a standards parser auto-closes the `<p>` and leaves empty flanking `<p></p>` around the list. | Same session, reproduced two ways (`innerHTML =` assignment and `DOMParser`) — both Chromium's own parser, so this is one confirmation of the mechanism, not two independent engines. | Cosmetic, **not a regression to chase** ([D11](#d11--the-empty-paragraph-around-a-list-is-expected-output-not-a-regression)). Every tag involved is still allow-listed. |
| V6 | **Livewire registers every `#[On]` / `$listeners` entry as `window.addEventListener(name, handler)` — page-global, for every mounted component instance.** The **only** thing separating two same-named listeners is the event **name string**. | `vendor/livewire/livewire/dist/livewire.js:14005-14011`, read directly by `frontend-expert` and **re-verified by `product-owner`**. | **Sharpens 0020's own D2 rationale**, which credits "DOM bubbling + `#[On]`" with the disambiguation. The real mechanism is name uniqueness. A fixed literal `select-event` in *this* component would cross-wire two editors on one page. See [D5](#d5--the-gallery-event-name-is-per-instance-unique-not-a-literal). |
| V7 | **`$this->listeners` is a plain overridable array**, merged with attribute-derived listeners at runtime; **`Component::getId()`** returns a unique per-mount id. | `vendor/livewire/livewire/src/Features/SupportEvents/HandlesEvents.php`; `SupportEvents::getComponentListeners()`; `Component.php:59`. Re-verified by `product-owner`. | The per-instance-unique listener name is implementable: `#[On('literal')]` cannot take a runtime expression (PHP attribute arguments must be compile-time constants), but `$this->listeners[$name] = 'method'` in `mount()` can. |
| V8 | **A same-component `$this->dispatch()` fires a *bubbling* browser `CustomEvent` from that component's own root element.** | Same code region as V6; consistent with 0020's V3. | A **scoped Alpine listener with no `.window` modifier**, inside this component's own markup, catches its own dispatch with **no name-collision risk at all** — a cleaner primitive than the page-global one for the server→client hand-off in [D6](#d6--caret-capture-and-restore-across-the-modal-round-trip). |
| V9 | **`queryCommandSupported()` is `true`** for all eight commands this toolbar needs, and **`queryCommandState('bold')` correctly reports `true`/`false`** for the current selection. | Same Chromium session. | `aria-pressed` on the toolbar has a real, working mechanism — no DOM-inspection hack ([D10](#d10--toolbar-composition-active-state-and-the-markup-rules-carried-forward)). |
| V10 | **Flux Free ships every affordance this toolbar needs** — `flux:button`, `flux:tooltip`, `flux:dropdown`, `flux:input`, `flux:separator`, and icons for `bold`, `italic`, `underline`, `list-bullet`, `numbered-list`, `link`, `photo`, `h2` — but **no rich-text or toolbar primitive**, and **`flux:button` has no `aria-pressed`/toggle prop**. | `ls vendor/livewire/flux/stubs/resources/views/flux/` and `.../flux/icon/`; read `flux/button/index.blade.php` in full. | Hand-rolling the editor is correct here rather than a convention violation — the same judgement 0020's V5 and 0022's D10 already made. `aria-pressed` is set as a plain forwarded attribute, not a Flux prop. |
| V11 | **Flux's modal renders a native `<dialog>` element.** | `vendor/livewire/flux/stubs/resources/views/flux/modal/index.blade.php:106-111`. | `<dialog>.showModal()` moves focus per spec, and moving focus out of a `contenteditable` is the classic trigger for losing the DOM `Selection`. **Not reproduced empirically** — this is [R-1](#dependencies-risks--open-questions), the story's central risk. |
| V12 | **The Pest browser plugin has no dialog/prompt handling of any kind.** A whole-tree grep of `src/` for `dialog`, `prompt`, `alert(` returns nothing. | `grep -rn` over `vendor/pestphp/pest-plugin-browser/src/`, run by `frontend-qa` and **re-verified by `product-owner`**. | **A constraint on the implementation, not just the tests.** Playwright auto-dismisses unhandled JS dialogs, so a `window.prompt()` link action — which is exactly what the prototype does — would be silently untestable. See [D8](#d8--the-link-action-is-an-in-page-popover-never-windowprompt). |
| V13 | **`keys()` is the only public DSL route to a text selection**; `script()` is the only route to a caret at a precise offset; `assertScript()` evaluates arbitrary JS and asserts on the result; `assertSourceInHas()` reads `innerHTML` **scoped to a selector**. `selectText()`/`dblclick()` exist on `Playwright\Locator` but are not wrapped by the friendly DSL (reachable via `$page->page()->locator($sel)`). | `Api/Concerns/InteractsWithElements.php:47`; `Api/Webpage.php:85`; `Api/Concerns/MakesElementAssertions.php:155,204`. Existence re-verified by `product-owner`. | Determines the whole browser-test strategy, and in particular makes the allow-list contract test expressible ([the output-HTML contract](#the-output-html-contract-test)). |
| V14 | **`app/Livewire/Components/` and `lang/{en,es}/components.php` do not exist yet**, and story **0022** plans to create exactly those same paths. `lang/en/` currently holds only `users.php`. | `ls lang/en/`; `find app/Livewire -maxdepth 2 -type d`; `grep` over `0022-searchable-multi-select-component.md`. | A real file-ownership hand-off between two stories with **no dependency ordering between them** ([D12](#d12--translation-keys-and-the-shared-ownership-hand-off-with-0022)). |
| V15 | **No `wire:ignore` exists anywhere in this codebase yet**, though hand-rolled Alpine driving native DOM APIs is well precedented (7 views use `x-data`; 0020 D7's dropzone is the model). | `grep -rn "wire:ignore" resources/views/` → empty. | This story introduces the app's **first** `wire:ignore` region — a docs-keeper note, not a red flag ([D9](#d9--the-editable-region-is-wireignored-with-defined-sync-points)). |

---

## Documented functional decisions

### D1 — No new JS dependency: hand-rolled `contenteditable` + `execCommand` + Alpine

**This is the answer to the brief's dependency question: no npm package is required, so no dependency
approval is needed for this story.** That conclusion rests on V3/V4 rather than on preference.

| Option | Verdict |
|---|---|
| **Hand-rolled `contenteditable` + `document.execCommand`, driven by Alpine — (recommended), adopted** | Zero new dependency (V1, V2). The eight commands this toolbar needs were **executed** in the exact engine CI uses and emit `<b>`/`<i>`/`<u>`/`<h2>`/`<ul>`/`<ol>`/`<li>`/`<a href>`/`<p>` (V3, V4) — **already inside 0024's allow-list**, so no translation layer is needed at all. Matches the project's established "Flux has no primitive for this, hand-roll it" pattern (0019/0020's dropzone, 0022's combobox). |
| TipTap / Quill / Trix / Toast UI | **Rejected — needs approval, and does not remove the problem it would be bought for.** Each ships its own internal document model (ProseMirror schema, Quill Delta) that must still be serialised to HTML and reconciled against D-16's allow-list, so it adds a translation layer rather than removing one. Quill emits `class="ql-*"` and Trix emits `<figure>`/`<div>`/attachment elements, none of which are allow-listed. It would also be this project's first bundled UI library (V2). Given V3/V4 show the native path already produces compatible markup, the cost buys nothing here. |
| A Markdown editor with a preview pane | **Rejected as a scope invention.** The PRD names a WYSIWYG toolbar with these exact eight buttons, and the prototype is a live `contenteditable`. |

**The risk this knowingly accepts, stated plainly:** `document.execCommand` is deprecated and has no
formal specification. It is not being removed from any shipping browser, and CI is Chromium-only, so
the exposure is bounded — but it is real technical debt, recorded as [R-2](#dependencies-risks--open-questions), not hidden. **If
the toolbar ever needs to grow beyond these eight actions (tables, images with captions, embeds), the
library question must be reopened rather than answered by piling more `execCommand` calls on.**

### D2 — The exact HTML tag set this editor may emit

This is the coordination point with 0024 and the section a reviewer should check first. The set below
is **exactly** 0024 [D-16](0024-products-core-crud-backend.md)'s sanitizer allow-list — cited, not
re-derived. **If these two lists ever disagree, 0024's is authoritative and this component is the one
that must change**, because the sanitizer is what actually runs on write.

| Toolbar action | Command executed | Tag emitted (**verified**, V3/V4) | In D-16's allow-list |
|---|---|---|---|
| Bold | `bold` | `<b>` | ✅ (`<strong>` / `<b>`) |
| Italic | `italic` | `<i>` | ✅ (`<em>` / `<i>`) |
| Underline | `underline` | `<u>` | ✅ |
| H2 | `formatBlock '<h2>'` | `<h2>` | ✅ (**h2 only** — not h1, not h3–h6) |
| Bullet list | `insertUnorderedList` | `<ul>`, `<li>` | ✅ |
| Numbered list | `insertOrderedList` | `<ol>`, `<li>` | ✅ |
| Link | `createLink` | `<a href>` | ✅ (**http / https / mailto only**) |
| Insert image | `insertHTML` | `<img src alt>` | ✅ (**http / https only**) |
| (typing / Enter) | — | `<p>`, `<br>` | ✅ |

**Three hard rules follow, each a real bug if broken:**

1. **`styleWithCSS` must never be enabled.** V3 verified that flipping it to `true` switches the
   output from `<b>` to `<span style="font-weight: bold;">` — and **both** `<span>` and `style` are
   dropped by the sanitizer, so every bold, italic and underline the administrator applied would
   vanish on save with no error anywhere. Set it explicitly to `false` on initialisation rather than
   relying on the default.
2. **`<figure>` and `<figcaption>` are not allow-listed, so the inserted image is a bare `<img>`.**
   See [D7](#d7--an-inserted-image-is-a-bare-img-carrying-the-original-url).
3. **Do not widen the allow-list to accommodate something the editor emitted.** D-16 states this
   directly: *"if the toolbar cannot produce it, its presence means the input did not come from the
   toolbar."* The correct direction of repair is always to constrain the editor, never to relax the
   sanitizer.

Note the deliberate asymmetry with the sanitizer: D-16 allows both `<strong>`/`<b>` and `<em>`/`<i>`,
while this editor only ever emits the short forms. That is fine — the allow-list is a superset, and
0024 keeps the long forms because content may arrive from a paste or a future import.

### D3 — Component identity and public surface

`App\Livewire\Components\WysiwygEditor`, class-based per
[base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file),
with the ordinary kebab-case view mirror `resources/views/livewire/components/wysiwyg-editor.blade.php`
(the class is not named `Index`, so the
[subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
does not apply). The folder is the one 0022 also targets — see [D12](#d12--translation-keys-and-the-shared-ownership-hand-off-with-0022).

```php
// app/Livewire/Components/WysiwygEditor.php
#[Modelable]
public string $value = '';        // the HTML; the consumer's wire:model target.
                                  // NEVER null — the errors-log rule; '' is "no content".

#[Locked]
public bool $showGallery = false; // drives the nested gallery's #[Modelable] $open (0020 D2)

#[Locked]
public string $galleryEvent;      // per-instance-unique, derived in mount() — see D5

public string $label = '';
public string $placeholder = '';
public bool $disabled = false;    // read-only mode; a server-enforced no-op, not just a UI state
```

Consumer usage — the **entire** integration surface 0027 and the blog editor write:

```blade
<livewire:components.wysiwyg-editor
    wire:model="description"
    wire:key="product-description-editor"
    :label="__('products.description_label')"
/>
```

`$value` is deliberately **not** `#[Locked]`: it is the model binding, exactly as 0022's `$selected`
is. That is safe here for a reason worth stating, because it looks like a hole: **the value is
untrusted HTML by construction and is treated as such at the only boundary that matters** — 0024's
sanitizer on write. A client that posts hostile HTML into `$value` through a crafted
`/livewire/update` payload achieves nothing a hostile paste would not, and both are neutralised in
the same place. This component must never render `$value` back out unescaped
([D9](#d9--the-editable-region-is-wireignored-with-defined-sync-points) covers how it is seeded).

### D4 — The editor embeds the gallery itself, `@can`-wrapped, single-select

`WysiwygEditor` embeds `<livewire:media.gallery>` **itself** rather than asking its consumer to. The
editor *is* the gallery's consumer; the product/blog editor is in turn the *editor's* consumer. This
is composition, not a breach of 0020's contract — 0020's
[D12](0020-shared-media-gallery-modal-ui.md) rule binds *whoever directly embeds Gallery*, and that
is this component.

The four attributes are fixed by this story and are not consumer-configurable: `:multi="false"`
(single-select is what "insert one image at the cursor" means), the per-instance `select-event`
([D5](#d5--the-gallery-event-name-is-per-instance-unique-not-a-literal)), a `confirm-label` from this
component's own lang file (0020 D3 — the gallery stays ignorant of consumer semantics, and
"Insertar imagen" is this component's vocabulary, not the gallery's), and a `wire:key` derived from
the same unique id.

Per 0020 D12, the embed is wrapped in `@can('viewAny', \App\Models\Media::class)` so a user lacking
`media.view` does not mount a child that would `Gate::authorize()`-403 the entire host page. The
**"Insert image" button itself is not hidden** on that branch: it renders `disabled` inside an
explicit `<flux:tooltip>` explaining why, matching the Users list's per-row convention and 0020 D12's
own within-modal rule. **This story adds no permission of its own and gates nothing else** — the
other seven toolbar actions are pure client-side formatting and are unaffected by media permissions.

### D5 — The gallery event name is per-instance-unique, not a literal

**This is the finding that would have caused a real bug, and it changes how 0020's D2 contract must
be read.** 0020 D2 attributes the disambiguation of two galleries to "ordinary DOM bubbling plus
`#[On(...)]`". **Verified (V6): that is not the mechanism.** Livewire registers every listener as
`window.addEventListener(name, handler)` — page-global, on every mounted instance. **The event name
string is the only thing that separates them.**

The consequence for this story is direct: if `WysiwygEditor` embedded its gallery with a fixed
`select-event="wysiwyg-image-selected"`, then two editors on one page — a plausible near-term shape,
e.g. a blog post's excerpt and body, or a product's short and long description — would **both**
receive **every** confirmed image. So:

```php
public function mount(): void
{
    $this->galleryEvent = 'wysiwyg-image-selected-'.$this->getId();

    // Dynamic listener name: #[On('literal')] cannot take a runtime expression, because PHP
    // attribute arguments must be compile-time constants. $this->listeners is a plain array
    // merged with attribute-derived listeners at runtime (V7), so this is the supported route.
    $this->listeners[$this->galleryEvent] = 'insertImage';
}
```

**0020's contract is not invalidated** — a consumer-supplied event name is still exactly right, and
still the only workable option (its own V3 rules out `->to()`). What changes is the *obligation it
places on the consumer*: **the name must be unique per mounted instance, not merely per consumer
component.** 0027 embedding two galleries with two hand-written distinct names satisfies that; a
shared component like this one, which may be mounted N times on a page nobody has designed yet,
cannot rely on a hand-written literal and must derive one. Flagged to `docs-keeper` in the
[Definition of Done](#definition-of-done) so the rule lands somewhere every future nested-child
component will find it.

### D6 — Caret capture and restore across the modal round-trip

The AC is *"the image is placed inline **at the cursor position**"*, and the obstacle is V11: Flux's
modal is a native `<dialog>`, whose `showModal()` moves focus per spec, and moving focus out of a
`contenteditable` is the classic way to lose the DOM `Selection`. The mechanism:

1. **Capture on `blur`.** `x-on:blur="saveCaret()"` on the editable region stores
   `window.getSelection().getRangeAt(0).cloneRange()`. A `blur` fires the instant the modal's focus
   trap takes focus — earlier and more reliable than trying to hook the moment `showGallery` flips.
2. **The toolbar button must not blur the editor prematurely.** The "Insert image" control uses
   `mousedown.prevent` like every other toolbar button, so the click itself does not steal focus;
   the modal opening is what produces the real `blur`, and step 1 catches it.
3. **No saved range → append, do not refuse.** When the editor was never focused (`rangeCount === 0`,
   or `getRangeAt(0)` throws), build a fallback:
   `range.selectNodeContents(editorEl); range.collapse(false)`. **Refusing the insertion because the
   administrator clicked the toolbar before clicking into the text would be a worse experience than a
   harmless append**, and it is a state a first-time user reaches immediately. This is why the Gherkin
   carries an explicit scenario for it rather than leaving it undefined.
4. **Restore, then insert.** On the confirm round-trip, the client handler does
   `editorEl.focus()` → `removeAllRanges()` → `addRange(savedRange)` →
   `execCommand('insertHTML', false, imgHtml)`.
5. **Deliver server→client with a *scoped* Alpine listener.** `insertImage()` re-dispatches with
   `$this->dispatch('wysiwyg-insert-image', url: …, alt: …)`, caught by
   `x-on:wysiwyg-insert-image` on this component's own root — **no `.window` modifier**. Verified
   (V8): a same-component dispatch is a bubbling `CustomEvent` from that component's own root
   element, so a scoped listener has **no name-collision risk whatsoever** and does not need the
   uniqueness machinery D5 requires for the page-global hop.
6. **Sync explicitly afterwards.** Call the same debounced `$wire.set('value', …)` the `input`
   handler uses, rather than trusting `insertHTML` to fire a native `input` event on every path.

**Steps 1–4 are designed, not verified** — they need markup that does not exist yet. This is
[R-1](#dependencies-risks--open-questions), and [technical task 6](#technical-tasks) makes empirical verification a hard gate
*before* the browser test that depends on it is written, exactly as 0020 required of its dropzone.

### D7 — An inserted image is a bare `<img>` carrying the original URL

Two sub-decisions, both constrained by 0024's allow-list rather than by preference.

**No `<figure>`/`<figcaption>`.** The prototype inserts
`<figure><img …><figcaption>{title}</figcaption></figure>`
([`common.js:378`](../../docs/arospe-handoff/project/js/common.js)). Neither tag is in D-16's
allow-list, so the sanitizer would strip both wrappers and leave the caption text stranded as a bare
orphaned text node beside the image — a visibly broken result, worse than never rendering a caption.
Emit `<img src="…" alt="…">` and nothing else. **This is a deliberate, visible divergence from the
prototype**, and a reviewer should expect it rather than flag it. Widening the allow-list to admit
`<figure>`/`<figcaption>` was considered and **rejected**: it reopens a confirmed decision in another
story for a caption the `alt` text already carries semantically, and D-16 explicitly forbids growing
the list to accommodate emitted markup.

**`src` is the original `url`, not `webpUrl`/`avifUrl`.** 0020's payload carries all three (its D2),
and its own tiles render a `<picture>` with all three sources (its D13) — but `<picture>` and
`<source>` are **not** allow-listed, so no format negotiation is possible in this HTML at all. A
single URL must be chosen, and it must be the one that renders everywhere, because this HTML is
stored long-term in a column whose future consumers (a storefront, an export, an email) are not
specified yet and cannot be assumed to negotiate anything. `alt` comes from the payload's `title`,
matching the prototype's own `esc(item.title)`.

> **Reversible if a size argument wins later.** `webpUrl` would save meaningful bytes and is
> universally supported by evergreen browsers. It is not recommended *now* only because the consumers
> of this stored HTML are undefined; if a decision is ever taken that the description is
> browser-only, switching the emitted `src` is a one-line change in this component with no schema or
> sanitizer impact. Recorded here so the choice is visible rather than accidental.

### D8 — The link action is an in-page popover, never `window.prompt()`

The prototype uses `w.prompt('Introduce la URL del enlace', 'https://')`
([`common.js:371`](../../docs/arospe-handoff/project/js/common.js)). **Do not port that**, for two
independent reasons:

1. **Verified (V12): the Pest browser plugin has no dialog handling of any kind.** Playwright
   auto-dismisses unhandled JS dialogs, so a `prompt()`-based link action would be **silently
   untestable** — the browser test would appear to run and simply never apply a link.
2. A native prompt is unstyleable, inconsistent across browsers, and unreachable by a screen reader
   in the flow of the toolbar.

Instead: a small `flux:dropdown` popover carrying a `flux:input type="url"` and an apply button, both
reachable by `fill()`/`click()`.

**Client-side scheme constraint — UX, not security.** D-16 restricts `<a href>` to http/https/mailto
**server-side**, and that remains the authoritative control. The client should nonetheless refuse a
`javascript:`/`data:` address before calling `createLink`, and say so, because otherwise the link
appears to work and then silently disappears on save with no feedback — the same class of silent loss
D2's `styleWithCSS` rule guards against. **The client check is never the control; it is the
explanation.**

### D9 — The editable region is `wire:ignore`d, with defined sync points

The `contenteditable` is a **client-owned region**: Livewire must not diff or re-render it, or it will
fight the browser's own editing (destroying the caret mid-typing at best, discarding input at worst).
This is the app's first `wire:ignore` (V15).

The consequence is that `$value` and the DOM sync at **defined points, not continuously**:

- **In:** the region is seeded from `$value` on the client at initialisation only (`x-data` receives
  it through `@js($value)`), never re-written by a Livewire re-render.
- **Out:** `$wire.set('value', editorEl.innerHTML)` on a debounced `input` (400 ms) and explicitly
  after an image insertion ([D6](#d6--caret-capture-and-restore-across-the-modal-round-trip) step 6).

`wire:model.live` on every keystroke was considered and **rejected**: it round-trips the whole
description on each character and would make the caret's survival depend on Livewire's morph on every
keystroke, while buying nothing — the value is only needed when the host form saves.

**A consequence the consumer must know, and the reason this is a decision rather than an
implementation detail:** because the region is `wire:ignore`d, **a server-side write to `$value` does
not appear in the editor.** A consumer that resets its form by nulling the bound property will see
the editor keep its old content. If a consumer ever needs programmatic content replacement, this
component must gain an explicit client-side refresh hook — it does not have one, and 0027 should be
told rather than discovering it.

### D10 — Toolbar composition, active state, and the markup rules carried forward

- **Eight buttons, no more.** The PRD's design-reference section fixes the set. Verified (V10) Flux
  Free ships an icon for each.
- **`aria-pressed` reflects real state.** Driven by `queryCommandState()` (V9), updated from a
  `document`-level `selectionchange` listener filtered to selections inside this editor — the only
  event that also fires for keyboard-driven selection changes, which `mouseup`/`keyup` alone miss.
  `flux:button` has **no** `aria-pressed` prop (V10); it is written as a plain forwarded attribute.
- **`role="toolbar"` with an `aria-label`** on the button row.
- **Every button uses `mousedown.prevent`**, not `click` — a `click` handler blurs the editor and
  collapses the selection before the command runs, which is the single most common way a
  hand-rolled toolbar silently does nothing.
- **`data-test` hooks on every control**, present on **both** branches of the `@can`-gated image
  button: `wysiwyg-bold`, `wysiwyg-italic`, `wysiwyg-underline`, `wysiwyg-h2`,
  `wysiwyg-bullet-list`, `wysiwyg-numbered-list`, `wysiwyg-link`, `wysiwyg-link-url`,
  `wysiwyg-insert-image`, `wysiwyg-editor-region`. Icon-only controls also carry an `aria-label`.
- **The disabled image button is a written-out `@if`/`@else` with an explicit `<flux:tooltip>`
  wrapper**, never `:tooltip="$cond ? … : null"` — the Blaze presence trap — and any
  `cursor-not-allowed!` goes on **that wrapper**, never on the `pointer-events-none` button. Both
  traps are recorded in [errors-log.md](../../docs/errors-log.md) with their verification method; do
  not rediscover them.
- **`@js()` on any value interpolated into a `wire:*` argument**
  ([blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md)).
- **No bound property is ever `null`** — `$value`, `$label` and `$placeholder` are all `''`.
- Styling reimplements the prototype's `.wysiwyg__toolbar` / `.tb-btn` / `.editor` look in Tailwind
  v4. **No prototype CSS or markup is copied.**

### D11 — The empty paragraph around a list is expected output, not a regression

Verified (V5): Chromium's list commands produce `<p><ul>…</ul></p>` in the live DOM, and any
standards HTML5 parser re-parsing that string auto-closes the `<p>` and leaves empty flanking
`<p></p>`. Every tag involved is allow-listed, so nothing is lost and nothing is unsafe.

Two consequences, both aimed at stopping someone "fixing" this later:

- **Tests must assert content, not byte-identical HTML.** A test pinning the exact `innerHTML` string
  around a list will break on a Chromium update for no real reason. Assert that the list items exist
  and that every tag is allow-listed.
- **Stripping empty `<p></p>` before sync is a polish item, not a correctness requirement.** It may be
  done; it must not be treated as a bug fix, and it must not grow into a general client-side HTML
  normalisation layer — that responsibility is 0024's.

Whether `symfony/html-sanitizer`'s own parser normalises identically is **unverified** (the package is
not installed yet) and should be confirmed once 0024 ships — see [technical task 0](#technical-tasks).

### D12 — Translation keys, and the shared-ownership hand-off with 0022

Every user-facing string is a key: `components.wysiwyg.*` (toolbar `aria-label`s, `toolbar_label`,
`insert_image`, `insert_image_confirm`, `insert_image_not_allowed`, `link_apply`,
`link_invalid_scheme`, `placeholder`) in `lang/en/components.php` + `lang/es/components.php`,
key-for-key identical.

**Verified (V14): story 0022 plans to create the very same `app/Livewire/Components/` directory and
the very same two lang files, and neither story depends on the other**, so the task-numbering
ordering rule does not sequence them. **Whichever story reaches Phase 3 first creates the directory
and the two lang files; the other extends them under its own top-level key and must be told so at
Phase 2 review rather than discovering it mid-implementation.** This is the same hand-off 0024
already flagged for `lang/en/products.php` versus 0028. 0022's own OQ-3 asks to confirm
`app/Livewire/Components/` as the home for shared Livewire components; this story adopts the same
answer, whichever way it is settled — the two must not diverge.

### D13 — The browser-test harness (pending coordinator confirmation — see OQ-1)

This component has no page of its own: its real consumer (0027) is not debated yet, so **no URL exists
for a browser test to `visit()`** — and unlike 0020, the single highest-value case here
(insert-at-cursor) needs the editor **and** a gallery on the same page, so it cannot be reached with
the component alone.

**Recommended: extend 0020's existing environment-gated `dev/media-gallery-harness`** with a third
embedded instance — a `WysiwygEditor` alongside the two bare `Gallery` instances 0020 already
requires — rather than registering a second throwaway route. Both experts arrived at this
independently. It reuses the identical registration-time environment gate, needs one added assertion
rather than a whole new gating test, keeps the "who deletes this scaffolding" answer singular (story
0027, as 0020's D16 already states), and — usefully — puts three gallery instances on one page, which
makes it the natural place to prove [D5](#d5--the-gallery-event-name-is-per-instance-unique-not-a-literal)'s
re-entrancy fix.

All four of 0020 D16's constraints carry over unchanged, in particular that **the gate is
registration-time non-existence, not a 403**, and that the route must be absent from the route
collection in production.

The cost, stated because it is the reason this is an open question rather than a decision: it makes
0021 modify a file 0020 owns, and 0020's own "deleted by story 0027" comment must be updated to name
both stories as depending on it. The fallback — a separate `dev/wysiwyg-editor-harness` following
D16's identical shape — is a fallback, not a redesign.

---

## Files to create/modify

### Create

- `app/Livewire/Components/WysiwygEditor.php` — the component ([D3](#d3--component-identity-and-public-surface)).
  **First occupant of `app/Livewire/Components/` unless 0022 lands first — see [D12](#d12--translation-keys-and-the-shared-ownership-hand-off-with-0022).**
- `resources/views/livewire/components/wysiwyg-editor.blade.php` — toolbar, the `wire:ignore`d
  editable region, the link popover, and the `@can`-wrapped gallery embed.
- `lang/en/components.php` + `lang/es/components.php` — the `components.wysiwyg.*` group
  ([D12](#d12--translation-keys-and-the-shared-ownership-hand-off-with-0022)). **Extend, do not
  recreate, if 0022 shipped them first.**
- `tests/Feature/Components/WysiwygEditorTest.php` — component-level behaviour.
- `tests/Feature/Components/WysiwygEditorRenderingTest.php` — markup-level assertions, mirroring the
  `IndexTest` / `IndexRenderingTest` split already established for `Users\Index`.
- `tests/Browser/Components/WysiwygEditorTest.php` — real-DOM interaction, in the **mirrored
  subfolder** per [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md).
- `tests/Browser/Components/WysiwygEditorOutputHtmlTest.php` — the allow-list contract test, kept in
  its own file so it is findable from 0024's D-16 ([why](#the-output-html-contract-test)).

### Modify

- `resources/js/app.js` — register the Alpine component. Currently **empty** (V2), and it is already
  a Vite entry point, so **no `vite.config.js` change is needed**. A dedicated
  `resources/js/wysiwyg-editor.js` entry is unwarranted at this size; revisit only if the client
  logic grows materially.
- `app/Livewire/Dev/MediaGalleryHarness.php` + `resources/views/livewire/dev/media-gallery-harness.blade.php`
  — add the editor instance ([D13](#d13--the-browser-test-harness-pending-coordinator-confirmation--see-oq-1)),
  and update the "deleted by story 0027" comment to name both stories. **Only under OQ-1's recommended
  answer**; both files are 0020's.
- `tests/Feature/Dev/MediaGalleryHarnessRouteTest.php` — one added assertion that the harness renders
  the editor. **Same OQ-1 caveat.**
- **Docs (Phase 6, `docs-keeper`)** — `docs/api/routes.md` (the second shared route-less Livewire
  component, plus its selector contract), `docs/conventions/base-standards.md` (the first
  `wire:ignore` region and the client-owned-region pattern it establishes), and the **V6 rule** about
  per-instance-unique event names, which corrects the rationale 0020 will have shipped. Plus
  `docs/README.md`'s index.

### Explicitly NOT touched

No production route and no sidebar entry (the harness is environment-gated scaffolding owned by
0020). No `package.json` / `vite.config.js` change and **no new npm dependency**
([D1](#d1--no-new-js-dependency-hand-rolled-contenteditable--execcommand--alpine)). No
`composer.json` change. No `config/html-sanitizer.php`, no `app/Actions/Products/*`, no
`symfony/html-sanitizer` usage — all 0024's. No migration, no seeder, no `RolePermissionSeeder`
change, no new permission. No change to `App\Models\Media`, `MediaPolicy`, or any part of
`App\Livewire\Media\Gallery`'s own surface — this story is purely a **consumer** of 0020's finished
contract. No new base directory (`app/Livewire/Components/` is a subfolder of the existing
`app/Livewire/`).

---

## Tests to perform

`frontend-qa`'s contribution. The split is load-bearing: **the errors-log's `null`-`<select>` entry
establishes that `Livewire::test()->set()` can never detect a whole class of real UI bug**, and that
applies with unusual force here — a caret, a DOM `Selection`, and `execCommand`'s output simply do
not exist outside a real browser. So the component layer proves wiring cheaply, and everything about
*editing* goes to Chromium.

**Component — `tests/Feature/Components/WysiwygEditorTest.php`**
- [ ] Unit: mounting with an initial HTML value leaves it untouched — the component performs no
      server-side reformatting and no sanitization of its own.
- [ ] Integration: the `#[Modelable]` value round-trips to and from a host component.
- [ ] Integration: `openGallery()` sets `$showGallery` true, and the embedded gallery is mounted with
      `multi === false`.
- [ ] Integration: **the registered gallery listener name is unique per mounted instance** — mount two
      editors and assert their `$galleryEvent` values differ. This is the regression test for
      [D5](#d5--the-gallery-event-name-is-per-instance-unique-not-a-literal); without it, a later
      "simplification" back to a literal passes every other test in this file.
- [ ] Integration: `insertImage()` with 0020's exact payload shape dispatches the client-side event
      carrying the **original** `url` and the `title` as `alt` (D7) — assert the payload, not merely
      that something was dispatched.
- [ ] Negative: `insertImage([])` — the cancel and tampered-id-dropped cases from 0020 D2 — dispatches
      nothing and errors nothing.
- [ ] Negative: with `$disabled` true, `openGallery()` and `insertImage()` are both no-ops.
- [ ] `set('showGallery', …)` / `set('galleryEvent', …)` throw `CannotUpdateLockedPropertyException` —
      a regression-proof against someone dropping a `#[Locked]`.

**Rendering — `tests/Feature/Components/WysiwygEditorRenderingTest.php`**
- [ ] All eight toolbar controls render with their `data-test` hook and `aria-label`, inside a
      `role="toolbar"` region carrying its own label.
- [ ] The editable region renders `wire:ignore` and `contenteditable` — the markup-level proof of
      [D9](#d9--the-editable-region-is-wireignored-with-defined-sync-points); if the implementation
      ever drops `wire:ignore`, this is what catches it.
- [ ] The embedded gallery tag carries `:multi="false"` and the instance-unique `select-event`.
- [ ] For a user **with** `media.view`: the insert-image button renders enabled. For a user
      **without** it: it renders disabled inside a tooltip, **the gallery is not embedded at all**,
      and the `data-test` hook is present on **both** branches.
- [ ] The other seven toolbar buttons render enabled regardless of media permissions (D4's boundary).
- [ ] No hardcoded user-facing string; `lang/en/components.php` and `lang/es/components.php` are
      key-for-key identical.

**Browser — `tests/Browser/Components/WysiwygEditorTest.php`** *(against the D13 harness)*
- [ ] Selecting text and clicking Bold / Italic / Underline wraps it in the expected tag — the case
      `Livewire::test()` provably cannot reach.
- [ ] Re-clicking the same button on still-selected formatted text removes the formatting (toggle).
- [ ] Selecting a line and clicking H2 produces `<h2>`, **not** `<div>` or a class-carrying wrapper.
- [ ] Bullet and numbered list produce real `<ul>`/`<ol>` with `<li>` children — asserting **content
      and structure, never byte-identical HTML** ([D11](#d11--the-empty-paragraph-around-a-list-is-expected-output-not-a-regression)).
- [ ] The link popover applies an `<a href>` with the URL actually typed.
- [ ] **The toolbar's `aria-pressed` follows the selection** — placing the cursor inside bold text
      marks the Bold button pressed (V9's mechanism, and the only proof it is wired at all).
- [ ] "Insert image" opens the gallery; confirming a tile inserts the image and closes the modal.
- [ ] **The positional AC**: with the caret placed mid-content via the `script()`-`Range` technique
      (V13), the inserted `<img>` sits **between** the known before/after fragments — not merely
      present somewhere. **No weaker assertion catches a regression to "append at the end", which is
      the exact failure mode [D6](#d6--caret-capture-and-restore-across-the-modal-round-trip) exists
      to prevent.**
- [ ] Opening the gallery without ever focusing the editor, then confirming, **appends** the image and
      does not error (D6 step 3).
- [ ] Cancelling the gallery leaves the region's `innerHTML` identical to before it opened.
- [ ] **Re-entrancy**: on the harness's two editors, an image confirmed from the first appears only in
      the first. This is the case V6 proves a literal event name would silently fail.
- [ ] `assertNoJavaScriptErrors()` across a representative sequence (type → select → bold → H2 →
      insert image) — the hand-rolled caret logic is exactly the kind of code that otherwise fails
      silently, as 0020's dropzone precedent already established.

**Output-HTML contract — `tests/Browser/Components/WysiwygEditorOutputHtmlTest.php`**
- [ ] Dataset over all eight toolbar actions: **every** element inside the editable region has a tag
      name in D-16's allow-list (`b`, `strong`, `i`, `em`, `u`, `h2`, `ul`, `ol`, `li`, `a`, `img`,
      `p`, `br`) — enumerated exhaustively via `assertScript()` (V13), not spot-checked.
- [ ] No `style` attribute appears anywhere in the region after any action — the direct regression
      test for [D2](#d2--the-exact-html-tag-set-this-editor-may-emit)'s `styleWithCSS` rule.
- [ ] No `<div>`, `<font>`, `<span>`, `<figure>`, `<figcaption>` or `<h1>`/`<h3>`–`<h6>` appears —
      named explicitly rather than left to the generic check, so a reviewer can see what is guarded.
- [ ] The `<a href>` produced carries an http/https/mailto scheme; a `javascript:` address is refused
      client-side before `createLink` runs (D8).
- [ ] The inserted `<img>` carries the gallery payload's **original** `url` and an `alt`, and is
      **not** wrapped in `<figure>` (D7).
- [ ] The composite sequence (bold → H2 → list → link → image, in one flow) passes the same
      exhaustive check — catches interaction effects a single-action test cannot, e.g. a link wrapping
      an already-bold word producing a nested chain.

**Harness gating** — reuses 0020's `tests/Feature/Dev/MediaGalleryHarnessRouteTest.php` under OQ-1's
recommended answer (one added assertion), or a new `WysiwygEditorHarnessRouteTest.php` under the
fallback. Either way, 0020 D16's two assertions are unchanged: it resolves under `testing`, and it is
**absent from the route collection** under `production` — not merely 404ing.

### The output-HTML contract test

Its own file, because its job is different from the interaction tests': it is a **regression guard on
the coordination point with 0024**, and it must be findable by whoever re-reads D-16 later.

**Why exhaustive enumeration, not `assertSourceInHas('<b>')`:** a positive containment check proves
the *wanted* tag arrived and says nothing about an *unwanted* tag sitting beside it. A suite built
only from those checks stays green while Chromium also emits a stray `<div>` wrapper or a `style=`
attribute — which is precisely the failure this story's whole allow-list argument turns on. Only the
"every element is in this list" form (`assertScript()`, V13) fails when something extra appears.

**Scope boundary:** this test asserts what the **editor's DOM** contains, before any sync. It never
touches `symfony/html-sanitizer` and must not be confused with 0024's
`ProductDescriptionSanitizationTest.php`, which asserts what the **stored column** contains after the
sanitizer runs. Keeping them as two independent files is deliberate: D-16 defines the allow-list as
*"exactly the WYSIWYG toolbar's own tag set"*, so a **drift between the two is a real bug**, and
collapsing them into one test would hide which side drifted.

### Test-design traps to avoid

- **`fill()`/`type()` cannot be the acted-on step for "select text, then click Bold."** They replace
  content wholesale via Playwright's `fill()` and create no browser selection at all. Use them to
  seed content; build the selection with `keys()` (e.g. `Control+a`, `Home`+`Shift+End`), with
  `$page->page()->locator($sel)->selectText()`, or with a `script()`-built `Range` (V13).
- **Never use the unscoped `assertSourceHas()`/`assertSourceMissing()` for the allow-list contract** —
  they read the whole page and will match the gallery's own tiles or Flux icon SVGs. Scope with the
  `*In*` variants, or use `assertScript()`.
- **Asserting "an `<img>` exists" does not prove "at the cursor"** — it also passes for "appended at
  the end", the exact regression the AC exists to catch.
- **Keyboard caret placement (`Home` + repeated `ArrowRight`) is brittle** to whitespace collapsing
  and line wrapping. Use it for coarse whole-line selection; use `script()`+`Range` for the one
  precision-critical insert-at-cursor test.
- **`typeSlowly()` is real per-keystroke dispatch but slow** — reserve it for the rare test that
  genuinely needs native keystroke behaviour; do not default to it.
- **`assertSee()` takes one synchronous snapshot** (0020's V8) — any assertion made right after a
  Livewire round-trip, the gallery's confirm dispatch above all, needs a deliberate, documented
  `->wait()`, recorded as a trade-off rather than a stray sleep.
- **A `window.prompt()` link action is untestable here** (V12) — a trap in the *implementation*, not
  just the test. D8 exists to prevent it.

### Deliberately NOT tested here

Per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md) and
[coverage-policy.md](../../docs/testing/frontend/coverage-policy.md):

- **The sanitizer itself** — configuration, idempotence, sanitize-before-length ordering. Entirely
  0024's `ProductDescriptionSanitizationTest.php`. This story proves only what the editor hands over.
- **Persisting and reloading a description.** 0024 (the server round trip) and 0027 (the real page).
- **Malicious paste / XSS payloads.** 0024's sanitizer suite owns hostile input; this story's contract
  test is about what the toolbar produces from *legitimate* use.
- **Paste-from-Word behaviour.** 0024's R-16 already accepts the stored value is lossy; simulating a
  real OS clipboard paste with HTML flavour data is its own undertaking. **An honest gap, recorded,
  not silently dropped** — and worth revisiting when 0027 decides whether to warn the administrator.
- **Cross-browser (Firefox/WebKit).** CI is Chromium-only, and `contenteditable`/`execCommand` is one
  of the more browser-divergent APIs in existence. **A real, named gap**, inseparable from
  [D1](#d1--no-new-js-dependency-hand-rolled-contenteditable--execcommand--alpine)'s accepted
  trade-off — see [R-2](#dependencies-risks--open-questions).
- **The gallery's own behaviour** — search, upload, tiles, selection semantics. All 0020's, already
  covered there; re-driving them through this component would duplicate coverage and CI minutes.
- **A full accessibility audit.** `assertNoAccessibilityIssues()` exists in the plugin but is used
  nowhere in this repo yet; originating that convention is not this story's job. The toolbar's
  `role`/`aria-label`/`aria-pressed` are asserted at the rendering and browser layers instead.

---

## Expected outcome

A catalog administrator editing a product description — and later a blog editor writing a post body —
sees a toolbar of eight controls above an editable area styled like the prototype's. Selecting text
and clicking Bold, Italic or Underline formats it, and clicking again removes the formatting; the
buttons light up to show what the text under the cursor already is. A line can be turned into a
heading, and several lines into a bulleted or numbered list. Selecting text and using the link control
opens a small popover for a web address and turns the selection into a link. "Insert image" opens the
shared media gallery in single-select mode; confirming one image drops it into the text exactly where
the cursor was, leaving the content on both sides intact, and cancelling changes nothing. Two editors
on the same screen never receive each other's images. Everything the toolbar can produce is HTML the
server already accepts, so nothing an administrator formats is silently lost when the description is
saved. No new JavaScript dependency is added to the project.

## Acceptance criteria

- [ ] **(PRD §2.3 AC 7, inline-insertion half)** The "insert image" action places a selected gallery
      image inline in the content **at the cursor position**, with the surrounding content preserved
      on both sides.
- [ ] The toolbar carries exactly the eight actions the PRD names — Bold, Italic, Underline, H2,
      bullet list, numbered list, link, Insert image — and no others.
- [ ] Each of the seven formatting actions applies to the current selection, and the three inline
      ones toggle off when re-applied.
- [ ] **Every tag the editor can emit is inside 0024
      [D-16](0024-products-core-crud-backend.md)'s sanitizer allow-list**, proven by an exhaustive
      per-element assertion rather than positive containment checks; no `style` attribute and no
      `<div>`/`<span>`/`<font>`/`<figure>` is ever produced.
- [ ] The insert-image action opens the shared gallery in **single-select** mode, consuming 0020's
      contract unchanged — this story alters no part of `App\Livewire\Media\Gallery`.
- [ ] The gallery's `select-event` name is **unique per mounted editor instance**, and two editors on
      one page never receive each other's selection.
- [ ] Cancelling the gallery leaves the content byte-identical; opening it with no caret placed
      appends rather than refusing.
- [ ] The inserted image is a bare `<img src alt>` carrying the original URL and the image's title as
      `alt` — no `<figure>`, no `<figcaption>`, no `<picture>`.
- [ ] The link action uses an in-page popover, **never `window.prompt()`**, and refuses an
      unsupported address scheme with a visible explanation before applying it.
- [ ] A user without `media.view` sees the insert-image action disabled with a tooltip, the gallery is
      not embedded, and the other seven toolbar actions still work.
- [ ] **No new npm or Composer dependency is added**; `package.json` and `vite.config.js` are
      unchanged.
- [ ] The editable region is `wire:ignore`d and syncs at defined points only; no bound property is
      ever `null`.
- [ ] No user-facing string is hardcoded; `lang/en/components.php` and `lang/es/components.php` stay
      key-for-key identical.
- [ ] No production route, no sidebar entry, no migration, no permission-catalog change; the only
      route involved is the environment-gated harness, still absent from the production route
      collection.
- [ ] The full suite is green in a single isolated run
      ([contracts.md](../../docs/contracts.md)).

## Definition of Done

- [ ] Tests written and green (full suite, isolated run — [contracts.md](../../docs/contracts.md))
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor) — point the audit at
      [D2](#d2--the-exact-html-tag-set-this-editor-may-emit) (that the emitted set really is a subset
      of D-16's, since this is the assumption letting 0027 render the stored HTML unescaped),
      [D3](#d3--component-identity-and-public-surface) (why `$value` is deliberately not `#[Locked]`),
      and [D8](#d8--the-link-action-is-an-in-page-popover-never-windowprompt) (that the client-side
      scheme check is explicitly *not* the control)
- [ ] Documentation updated (docs-keeper) — including the **V6 rule** (a Livewire listener is
      page-global and disambiguated only by name, so a shared component nesting a re-entrant child
      must derive a per-instance-unique event name), which corrects the rationale story 0020 records
      in its own D2; the app's **first `wire:ignore` region** and the client-owned-region pattern; and
      the harness's amended deletion trigger if [OQ-1](#dependencies-risks--open-questions) is answered as recommended
- [ ] Acceptance criteria met

---

## Technical tasks

Ordered. Steps 0 and 1 are hard gates.

0. **Confirm stories 0019, 0020 and 0024 have completed Phase 7**, and **read their shipped code**.
   None of the three exists yet (0020's own V1 verified this for 0019; the same holds for 0020 and
   0024 today). Reconcile every name this document assumes — the gallery's `$open`/`$multi`/
   `$selectEvent`/`$confirmLabel` props, its payload keys (`url`, `title`), and D-16's final
   `config/html-sanitizer.php` allow-list — against the real code, and **record any divergence in
   this file before writing a line**. Do not reshape their surfaces to match this document.
1. **Resolve [OQ-1](#dependencies-risks--open-questions) with the coordinator** (harness route). It determines which files
   this story touches, so it gates Phase 3, not Phase 2.
2. **Verify the caret mechanism empirically in a real browser** ([D6](#d6--caret-capture-and-restore-across-the-modal-round-trip),
   [R-1](#dependencies-risks--open-questions)) against real markup, **before** the browser test that depends on it is written.
   This is the same discipline 0020 imposed on its drag-and-drop shim, and for the same reason.
3. `frontend-qa` writes the failing component and rendering tests (red).
4. `frontend-expert` implements the component class and its public surface
   ([D3](#d3--component-identity-and-public-surface)), including the per-instance listener name
   ([D5](#d5--the-gallery-event-name-is-per-instance-unique-not-a-literal)) — green.
5. The Alpine module in `resources/js/app.js`: `execCommand` dispatch with `styleWithCSS` forced
   false, caret save/restore, debounced sync, `selectionchange`-driven `aria-pressed`.
6. The Blade view: toolbar (D10), `wire:ignore`d region (D9), link popover (D8), `@can`-wrapped
   gallery embed (D4).
7. `lang/en/components.php` + `lang/es/components.php` — **create or extend** per
   [D12](#d12--translation-keys-and-the-shared-ownership-hand-off-with-0022).
8. The harness change (D13) and its added gating assertion.
9. `frontend-qa` writes the browser tests, including the `script()`-`Range` caret technique and the
   exhaustive allow-list contract test.
10. **Confirm the emitted set against the real installed sanitizer** — round-trip a representative
    document through 0024's `SanitizeProductDescription` and assert nothing the toolbar produced was
    dropped. This is the empirical close-out of [D2](#d2--the-exact-html-tag-set-this-editor-may-emit)
    and of [D11](#d11--the-empty-paragraph-around-a-list-is-expected-output-not-a-regression)'s open
    parser question.
11. Quality gates in order per
    [base-standards](../../docs/conventions/base-standards.md#quality-gates): filtered tests →
    `vendor/bin/pint --dirty --format agent` → Larastan level 7 → full suite.

---

## Dependencies, risks & open questions

**Dependencies**

- **[0020 — shared media gallery modal](0020-shared-media-gallery-modal-ui.md) — hard, Phase 1
  complete, implementation not started.** This story consumes its D2 contract and (recommended)
  extends its D16 harness. 0020 itself is blocked on **0019**, so the real chain is
  0019 → 0020 → 0021. Numbering already satisfies
  [workflow.md](../../docs/workflow.md#task-ordering-rule)'s ordering rule.
- **[0024 — products core CRUD backend](0024-products-core-crud-backend.md) — coordination, not a
  build blocker.** Its D-16 allow-list defines this component's output contract, and its
  `config/html-sanitizer.php` is what technical task 10 verifies against. This story can be built
  before 0024 ships (the allow-list is already confirmed in writing) but **cannot be closed with
  confidence until the emitted set has been round-tripped through the real sanitizer**.
- **[0022 — searchable multi-select](0022-searchable-multi-select-component.md) — no dependency, but a
  file-ownership collision** on `app/Livewire/Components/` and `lang/{en,es}/components.php` (V14,
  [D12](#d12--translation-keys-and-the-shared-ownership-hand-off-with-0022)). Neither story blocks the
  other; whichever runs Phase 3 first creates the shared paths.
- **This story is a blocker for 0027** (product editor, which hosts it) **and for Epic 4's blog post
  editor**, which reuses it unchanged.

**Risks**

1. **R-1 — Caret survival across the Flux modal is designed, not verified (highest).** V11 confirms
   the modal is a native `<dialog>` that takes focus; whether the `blur`-capture / `addRange`-restore
   sequence in D6 survives that in practice was **not** reproducible in this debate, because it needs
   markup that does not exist yet. This is the mechanism the story's headline AC rests on. Mitigated
   by technical task 2 making empirical verification a gate before the dependent test is written.
2. **R-2 — `execCommand` is deprecated technical debt.** Accepted knowingly in
   [D1](#d1--no-new-js-dependency-hand-rolled-contenteditable--execcommand--alpine), bounded by
   Chromium-only CI and by every relevant behaviour having been executed against that exact engine
   (V3–V5, V9). It becomes materially riskier the day a second browser enters the test matrix, or the
   day the toolbar needs a ninth action — either event should reopen the library question rather than
   be absorbed.
3. **R-3 — Livewire re-rendering over the editable region.** `wire:ignore` (D9) is the guard, and this
   is the app's first use of it (V15), so there is no local precedent to copy. A re-render that
   morphs the region would destroy the caret mid-typing. The rendering test asserting `wire:ignore` is
   present is the cheap regression guard; a browser test that types, triggers a round-trip, and keeps
   typing is the honest one.
4. **R-4 — Silent formatting loss is the failure mode of this whole story.** If the editor ever emits
   something outside the allow-list, the administrator sees their formatting applied, saves, and finds
   it gone — with no error anywhere in the stack. The exhaustive contract test is the only thing that
   catches it, which is why it enumerates every element rather than checking for wanted tags.
5. **R-5 — The `app/Livewire/Components/` race with 0022** (V14). Low severity, high annoyance:
   discovered mid-implementation it costs a merge conflict and a duplicated lang file. Mitigated by
   raising it at Phase 2 review for **both** stories, not just this one.
6. **R-6 — Extending 0020's harness couples two stories' scaffolding.** Under OQ-1's recommended
   answer, 0021 writes into files 0020 owns, and the harness's deletion trigger becomes conditional on
   both. The risk is that 0027 deletes it while satisfying only one of the two. Mitigated by naming
   both stories in the file's own comment and in `docs/api/routes.md`.
7. **R-7 — No cross-browser coverage.** Recorded rather than accepted silently; see the coverage
   exclusions. `contenteditable` is among the most divergent web APIs, so "works" here means "works in
   Chromium", and the docs should say so.

**Open questions**

Neither blocks Phase 2. OQ-1 blocks Phase 3 step 8 only.

### OQ-1 — Does this story extend 0020's harness, or register its own?

Both experts independently recommended extending. Recorded as a question rather than a decision
because it makes this story write into another story's files.

- **Option A — extend 0020's `dev/media-gallery-harness` with a `WysiwygEditor` instance
  (recommended).** Reuses the same registration-time environment gate and gating test, keeps the
  deletion answer singular (story 0027), and — because the page then carries three gallery instances —
  makes it the natural place to prove [D5](#d5--the-gallery-event-name-is-per-instance-unique-not-a-literal)'s
  re-entrancy fix. Cost: 0021 modifies 0020's files, and the "deleted by 0027" comment must name both
  stories ([R-6](#dependencies-risks--open-questions)).
- **Option B — a separate `dev/wysiwyg-editor-harness` route**, following D16's identical shape with
  its own gating test. Keeps each story's scaffolding self-contained, at the cost of a second
  throwaway route proving largely the same embedding pattern twice.

### OQ-2 — Should the toolbar auto-focus the editable region on mount?

Low-stakes and deliberately deferred to Phase 3 implementation judgement. Recommend **no** — a page
hosting several fields should not have one of them steal focus on load — but it is not worth a
coordinator's time now.

### OQ-3 — Does `symfony/html-sanitizer` normalise the list markup the same way Chromium's parser does?

[D11](#d11--the-empty-paragraph-around-a-list-is-expected-output-not-a-regression) reasons that it
almost certainly does, because auto-closing a `<p>` before block content is HTML5 spec behaviour
rather than a Chromium quirk — but the package is not installed yet, so this is **unverified**.
Answered empirically by technical task 10, not by a human decision. Recorded here so that an
unexpected answer is treated as new information rather than as a defect in this component.

---

## Provenance

Written in Phase 1 (Three Amigos) on 2026-08-18 for Epic 2, from
[PRD §2.3](../../docs/PRD/PRD.md#23-shared-media-gallery) and the
[Design reference](../../docs/PRD/PRD.md#design-reference--the-dashboard-shell) section, against the
finalized contracts in [0020](0020-shared-media-gallery-modal-ui.md) (D2, D3, D12, D14, D16) and
[0024](0024-products-core-crud-backend.md) (D-16). Participants: `product-owner` (lead),
`frontend-expert`, `frontend-qa` — classified **frontend** per
[workflow.md](../../docs/workflow.md#task-classification-rule)'s task-classification rule, with
`database-expert` and the backend roles deliberately **not** convened, since the story creates no
table, migration, query or server-side domain logic.

Both experts were dispatched concurrently under an explicit read-only instruction (neither wrote any
file), satisfying [contracts.md](../../docs/contracts.md)'s Parallel Agent File-Ownership Rule: their
write sets were empty and therefore disjoint. `frontend-expert` executed a real headless Chromium
session to establish V3–V5 and V9; `frontend-qa` read the Pest browser plugin's source for V12–V13.
`product-owner` independently re-verified **V6, V7, V12, V13 and V14** before recording them, because
V6 corrects a rationale story 0020 states in its own D2 and V14 constrains story 0022. No application
code was written in this phase.
