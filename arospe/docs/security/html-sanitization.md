# HTML sanitization (stored, untrusted HTML)

The rules established by story **0024a**'s Phase 4 audit and re-audit — the app's first security page
about a genuinely new domain: **untrusted-HTML-storage**, distinct from every other page in this
knowledge base, which is about *who may act* (authorization) or *what a decoded file may cost*
(image processing). This one is about what happens once a client-supplied string that is allowed to
contain markup reaches a database column that a later screen will render **unescaped**.

## The risk this closes: a `wire:ignore`d region echoes its bound value raw, by design

[`App\Livewire\Components\WysiwygEditor`](../../app/Livewire/Components/WysiwygEditor.php) —
story 0021 — seeds its editable region with `{!! $value !!}`, an unescaped Blade echo, because the
region is `wire:ignore`d and the seeded value must render as real, formatted HTML rather than as
escaped text. [conventions/base-standards.md](../conventions/base-standards.md#a-wireignored-client-owned-region--the-apps-first-instance)
already names the consequence directly: *"an unescaped `{!! !!}` echo inside such a region is safe
only because of what the seeded value already is — sanitized elsewhere, on write — never because the
region is client-owned"* — stated there as **a hard, load-bearing dependency** on whichever persisted
column ends up bound to that component.

`products.description` is exactly such a column: story 0027 (not yet built) binds it to
`WysiwygEditor` and renders it unescaped, which is only defensible because this story guarantees the
stored value is already safe HTML. Before this story, [0024](../../ai-spec/tasks/done/0024-products-core-crud-backend.md)'s
own scope fence forbade any code from rendering `description` at all — the interim window (0024's
**R-12**, this story's **R-A1**) was safe only because nothing read the column, not because anything
sanitized it.

- ❌ **Before this story** — `CreateProduct`/`UpdateProduct` persisted `$description` exactly as
  submitted, and the only thing preventing a stored-XSS payload from reaching a browser was that no
  renderer existed yet:
  ```php
  // conceptual — the pre-0024a shape; description flowed straight from input to the column
  Product::forceCreate([
      // ...
      'description' => $description, // whatever the caller passed, unexamined
  ]);
  ```
- ✅ **Shipped** — both actions sanitize `$description` as the first thing done to it, before
  `Validator::make()` ever sees it:
  ```php
  // app/Actions/Products/CreateProduct.php (identical wiring in UpdateProduct.php)
  $name = trim($name);
  $sku = Str::upper(trim($sku));
  // 0024a D-16/D-A1: sanitize BEFORE validating, so max:65535 measures the
  // stored value rather than markup the sanitizer is about to remove, and
  // reassign $description so both the Validator::make() array below and the
  // DB::transaction() closure further down read the sanitized value.
  $description = ($this->sanitizeProductDescription)($description);
  ```

`App\Actions\Products\SanitizeProductDescription` is the **only** class in `app/` that imports
`symfony/html-sanitizer` (mirroring how `App\Actions\Media\GenerateImageConversions` confines the
imaging library to one class — see [conventions/base-standards.md](../conventions/base-standards.md#directory-structure)),
and it is constructor-injected into both actions as their **third** collaborator, matching the
`code-style.md`-documented exception for an action whose `__invoke()` signature is a public contract
(see [code-style.md](../conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)).
`tests/Feature/Products/ProductDescriptionSanitizationTest.php` asserts reachability directly, mirroring
`ProductAuthorizationTest.php`'s `SyncProductGallery` sole-importer pattern.

## The mechanism: a config-driven allow-list — and `block` is not enough on its own

[`config/html-sanitizer.php`](../../config/html-sanitizer.php) is the allow-list, and it is built
**by construction** as an allow-list sanitizer (modelled on the W3C HTML Sanitizer API): unknown
elements and attributes are the ones that must be actively decided about, never the ones assumed
safe. It holds exactly the WYSIWYG toolbar's own tag set:

| Allowed | For |
| --- | --- |
| `strong`/`b`, `em`/`i`, `u` | Bold, Italic, Underline |
| `h2` | the H2 button — **only** h2, never h1 (page chrome) or h3–h6 (unproducible by the toolbar) |
| `ul`, `ol`, `li` | bullet and numbered lists |
| `a[href]` | link — `allowed_link_schemes: ['http', 'https', 'mailto']`, explicit rather than the library default (which additionally allows `tel`) |
| `img[src, alt]` | insert image — `allowed_media_schemes: ['http', 'https']`, explicit rather than the library default (which additionally allows `data:`) |
| `p`, `br` | the block/line structure any `contenteditable` emits |

Everything else falls to `default_action`, and this is the finding worth understanding rather than
copying blindly. **Phase 4 audit finding F-1 (Medium)**: the shipped config initially set
`default_action: 'block'` with no further thought, on the reasoning that "block" sounds like the
stronger of the two available actions (`Block` vs. `Drop`). It is the *opposite* — `Block` removes an
unrecognised element's own tag but **keeps its text content**, which is correct for an ordinary
unknown wrapper (a Word-paste `<span>` should lose its formatting, not its words) but was proven, by
execution against this exact config, to let a raw-text element's *content* survive as inert, unwrapped
text:

```php
// config/html-sanitizer.php — the comment recording the finding
// ... verified by execution against this exact allow-list (Phase 4 audit finding F-1, Medium) that
// 'block' lets a raw-text element's TEXT CONTENT survive as inert, unwrapped text —
// `<script>alert(1)</script>` blocks down to the literal string `alert(1)` sitting in the
// stored description, and `<style>...</style>` down to raw CSS text.
```

- ❌ **`default_action: 'block'` alone** — `<script>alert(1)</script>` sanitizes down to the bare
  string `alert(1)`, present in the stored column. Not executable as a `<script>` tag any more, but
  content that should never have survived at all did.
- ✅ **The shipped fix** — every genuinely dangerous element is explicitly listed in
  `dropped_elements` and passed through `HtmlSanitizerConfig::dropElement()`, which removes the tag
  **and** its content, applied in the same pass as the allow-list:
  ```php
  // config/html-sanitizer.php
  'dropped_elements' => [
      'script', 'textarea', 'noembed', 'xmp', 'plaintext', 'iframe', 'form',
      'template', 'noscript', 'svg', 'math', 'object', 'embed', 'applet',
      'select', 'option', 'button', 'input',
  ],
  ```
  ```php
  // app/Actions/Products/SanitizeProductDescription.php
  foreach ($droppedElements as $element) {
      $config = $config->dropElement($element);
  }
  ```

**The rule this generalises**: `default_action: 'block'` is safe *only* as the fallback for ordinary,
non-dangerous unknown markup, once every element whose *content* is unsafe on its own — a raw-text
element (`script`, `style`, `textarea`, `xmp`, …), an interactive form control, an embedded
document/object, inline SVG/MathML — is explicitly dropped ahead of it. Choosing `Block` over `Drop`
as a library-wide default without an explicit drop-list for the dangerous subset is the mistake this
finding exists to prevent a later config from repeating.

**Known, accepted residual**: `<style>`/`<title>` in body context cannot be fully neutralised by
*any* configuration of this library. `config/html-sanitizer.php`'s own comment records why, verified
by reading `HtmlSanitizer::createDomVisitorForContext()` directly: it filters a drop/block
configuration for those two tags against `W3CReference::HEAD_ELEMENTS` and discards it in body
context, so their text content (e.g. raw CSS) can survive as inert, escaped text regardless of this
file's settings. `ProductDescriptionSanitizationTest.php` pins this explicitly as a dedicated
`<style>`-in-body test, rather than assuming it away, so a future library upgrade that changes it is
visible in a diff instead of silent.

Two further scheme/host decisions are recorded as **informational, accepted** (Phase 4 findings F-3,
F-4) rather than fixed: `allowed_link_schemes`/`allowed_media_schemes` restrict *schemes* but not
*hosts* (an outbound link to an arbitrary site is the link button's whole purpose, and every image
today already comes from this app's own storage by construction, not by a host restriction), and
relative links/media are left at the library's own safe default (`false` — silently stripped, not
rejected with a message), which is a content-loss residual in the safe direction rather than a
security one.

## Idempotence is guaranteed as convergence, not as one-pass equality

Three later stories (0076's model-event layer, 0077's Livewire-component call site, 0079's
constructor injection) apply `SanitizeProductDescription` a **second** time over an already-sanitized
value, and each depends on that second pass being a no-op. **Phase 4 audit finding F-2** narrowed what
is actually guaranteed: fuzzing the shipped config found rare cases where libxml's own auto-nesting
normalisation needs a **second** pass to reach a fixed point after a blocked wrapper is removed
between two same-name elements (adjacent `<li>` tags separated by a now-removed wrapper, for example)
— every intermediate value stays safe HTML throughout, so this is content drift, not a security
window, but `sanitize(sanitize($x)) === sanitize($x)` with no qualification overstates what the code
guarantees.

```php
// app/Actions/Products/SanitizeProductDescription.php — the corrected docblock
 * Sanitizing is idempotent for well-formed markup: sanitize(sanitize($x)) === sanitize($x) holds
 * for every allowed-tag shape this action ever produces ... It is NOT an absolute guarantee for
 * pathological/malformed input ... What IS guaranteed, and load-bearing for the callers below:
 * sanitizing twice always CONVERGES — a third application never differs from the second.
```

- ❌ **The original, overstated claim** — "sanitizing is idempotent: `sanitize(sanitize($x)) ===
  sanitize($x)`, asserted byte-for-byte", with no qualification for malformed input.
- ✅ **The corrected, shipped guarantee** — idempotent for every well-formed shape the WYSIWYG
  toolbar can produce (verified across 15 real shapes), and **convergent** otherwise: a third pass
  never differs from the second, which is what 0076/0077/0079 actually depend on.

## Two residual exposures, recorded rather than assumed closed (R-12)

1. **A future writer that bypasses the two actions re-opens the hole.** The guarantee lives in
   `CreateProduct`/`UpdateProduct`, not in the column — a seeder, an Artisan command, an import, or a
   raw `Product::query()->update([...])` call would write unsanitized HTML with nothing to stop it.
   Story 0076's later model-event layer is the acknowledgement that this is real, not a
   hypothetical.
2. **The allow-list itself is now the control.** A tag added to `config/html-sanitizer.php` later
   without the same scrutiny this page documents (is its *content* safe on its own, does it need
   `dropped_elements` rather than the `block` default, does it need a scheme restriction) is a new
   sink, indistinguishable in review from any other one-line config change.

## Consumers unblocked

This story's closure lifts [0024](../../ai-spec/tasks/done/0024-products-core-crud-backend.md)'s
own scope fence forbidding any code from rendering, echoing or returning `products.description`.
0027 (products list/editor UI), 0061 (blog posts, reusing this exact config for the `body` column),
0076 (products i18n retrofit), 0077 and 0079 (language-tab editors) each depend on this closure; see
[api/routes.md](../api/routes.md#applivewirecomponentswysiwygeditor--the-gallerys-first-real-consumer-and-the-second-routeless-gated-component)
for the correction to that page's own prior, speculative attribution of this class to stories other
than the one that actually created it.

_Last updated: 2026-09-02 — Story 0024a (Product description — HTML sanitization on write). First
version of this page, written after Phase 4's audit and re-audit closed both findings it documents
(F-1, the `block`-vs-`drop` distinction; F-2, the idempotence-to-convergence correction), so both are
recorded here as ❌/✅ pairs describing the shipped, closed state from the outset rather than the
vulnerable state the audit found — per [errors-log.md](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20)'s
rule for an audit-authored page._
