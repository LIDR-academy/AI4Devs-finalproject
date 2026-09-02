# Epic 2 decision digest (Products, Taxes & Sales Regions, Shipping)

Append-only. See [workflow.md#decision-digest-per-epic](../../../docs/workflow.md#decision-digest-per-epic)
for what belongs here and what doesn't — facts and decisions a later story in this epic must not
re-derive, never the full prose of a finalized story.

## Story 0024a — Product description HTML sanitization on write

- `App\Actions\Products\SanitizeProductDescription` — invokable, `__invoke(?string $html): ?string`,
  the **only** class in `app/` that imports `symfony/html-sanitizer` — story 0024a.
- Wired as the **third** constructor-injected collaborator (after `LogRefusedPrivilegedAttempt`,
  `SyncProductGallery`) into both `App\Actions\Products\CreateProduct` and `UpdateProduct`, called on
  `$description` and reassigned immediately before `Validator::make()`, so `max:65535` measures the
  stored value rather than markup about to be dropped — story 0024a.
- Allow-list config lives entirely in `config/html-sanitizer.php`: `strong`/`b`, `em`/`i`, `u`, `h2`
  (only h2), `ul`/`ol`/`li`, `a[href]` (`allowed_link_schemes: ['http','https','mailto']`),
  `img[src,alt]` (`allowed_media_schemes: ['http','https']`), `p`, `br`. `default_action: 'block'`
  keeps a removed element's text — a genuinely dangerous element (script/iframe/form/svg/input/etc.)
  must be in the explicit `dropped_elements` list instead, or its content survives as inert text —
  story 0024a.
- Idempotence is guaranteed only as **convergence by the second pass**, not strict one-pass
  byte-for-byte equality — a third sanitize pass never differs from the second, but a second pass can
  differ from the first for pathological/malformed input. Any story applying the sanitizer a second
  time over an already-sanitized value (0076's model-event layer, 0077/0079's Livewire call sites)
  must rely on convergence, not on `sanitize(sanitize($x)) === sanitize($x)` holding unconditionally —
  story 0024a.
- `config/html-sanitizer.php` is a **fixed security allow-list to be reused exactly**, not a registry
  a later story extends by appending entries — a second consumer (e.g. 0061's blog `body` column)
  must reuse this file as-is rather than fork a second allow-list for the same trust boundary —
  story 0024a.
- Known, unavoidable residual: `<style>`/`<title>` in body context cannot be fully dropped/blocked by
  this library in any configuration (`HtmlSanitizer::createDomVisitorForContext()` discards a
  drop/block config for `W3CReference::HEAD_ELEMENTS` in body context) — their text content can
  survive as inert, escaped text regardless of config. Do not attempt to "fix" this in
  `config/html-sanitizer.php` — story 0024a.
- Full mechanism and both Phase 4 findings (F-1 block-vs-drop, F-2 idempotence-to-convergence) are
  documented at [docs/security/html-sanitization.md](../../../docs/security/html-sanitization.md).
