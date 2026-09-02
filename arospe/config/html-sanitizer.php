<?php

// Story 0024a (D-16) — allow-list configuration for symfony/html-sanitizer, applied to
// `products.description` on write, before persistence. See
// App\Actions\Products\SanitizeProductDescription, the only class in app/ that reads this file
// and turns it into a real Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig instance.
//
// This is the app's SECOND app-owned config file (after config/modules.php) and inherits that
// file's two hard rules, per docs/conventions/base-standards.md:
//   - NO closures anywhere — `php artisan config:cache` serialises the merged config with
//     var_export(), which cannot represent a Closure (or an arbitrary object). Every value below
//     is a scalar, string, or array of scalars/strings.
//   - NO user-facing copy — there is none to carry here; this file is pure security
//     configuration, not a UI registry, so the "translation key, not literal copy" half of that
//     rule does not apply, but the "no behavior" half does: this file is data only.
//
// The allow-list is deliberately EXACTLY the WYSIWYG toolbar's own tag set (see
// App\Livewire\Components\WysiwygEditor / PRD §2.2 — Bold, Italic, Underline, H2, bullet list,
// numbered list, link, insert image) plus <p>/<br>, the block/line structure any contenteditable
// emits. Do NOT add a tag here because the sanitizer stripped something a user pasted — if the
// toolbar cannot produce it, its presence in a submission means the input did not come from the
// toolbar (D-16).
return [

    /*
    |--------------------------------------------------------------------------
    | Allowed elements
    |--------------------------------------------------------------------------
    |
    | One entry per allowed tag, mapping to the list of attributes that tag may carry (an empty
    | array means "allowed, with no attributes at all"). Everything not listed here is subject to
    | `default_action` below rather than being individually enumerated as dropped/blocked — this
    | keeps the allow-list the single source of truth instead of also maintaining a deny-list that
    | could drift from it.
    */
    'allowed_elements' => [
        'strong' => [],
        'b' => [],
        'em' => [],
        'i' => [],
        'u' => [],
        // Only h2 — not h1 (belongs to the page chrome) and not h3-h6 (the toolbar cannot
        // produce them).
        'h2' => [],
        'ul' => [],
        'ol' => [],
        'li' => [],
        'a' => ['href'],
        'img' => ['src', 'alt'],
        'p' => [],
        'br' => [],
    ],

    /*
    |--------------------------------------------------------------------------
    | Allowed link (<a href>) schemes
    |--------------------------------------------------------------------------
    |
    | Symfony's own default additionally allows `tel`, which the WYSIWYG toolbar's link button has
    | no use for. Restricted explicitly rather than left to the library default, per D-16.
    |
    | Host restriction (allowedLinkHosts) is deliberately left at the library default (null — all
    | hosts allowed): D-16 names schemes as the control, not hosts, and an outbound link to an
    | arbitrary site is the WYSIWYG link button's whole purpose (Phase 4 audit finding F-3,
    | informational). Recorded as an accepted decision, not an oversight.
    */
    'allowed_link_schemes' => ['http', 'https', 'mailto'],

    /*
    |--------------------------------------------------------------------------
    | Allowed media (<img src>) schemes
    |--------------------------------------------------------------------------
    |
    | Symfony's own default additionally allows `data`, which is exactly the vector this story's
    | own test suite refuses (a data: URI is a way to smuggle an arbitrary inline payload past a
    | scheme check that only looks at the URL, not its content). Restricted explicitly rather than
    | left to the library default, per D-16.
    |
    | Host restriction (allowedMediaHosts) is ALSO deliberately left at the library default (null —
    | all hosts allowed), even though every legitimate image today comes from this app's own
    | storage (App\Livewire\Components\WysiwygEditor::insertImage() -> Storage::disk('public')
    | ->url()) — Phase 4 audit finding F-3, informational, accepted rather than fixed. A future
    | third-party <img src> is a real, recorded residual (mixed content / a tracking pixel / IP
    | leakage to a third party per storefront visitor), left open because D-16 names schemes as the
    | control here and PRD §2.2 does not ask for host restriction. If this needs closing later,
    | restrict to config('app.url')'s host via allowedMediaHosts rather than reopening this file's
    | scheme design.
    */
    'allowed_media_schemes' => ['http', 'https'],

    /*
    |--------------------------------------------------------------------------
    | Dropped elements — genuinely dangerous body elements, removed tag AND content
    |--------------------------------------------------------------------------
    |
    | `default_action` below is 'block' (unwrap-but-keep-text), which is correct for an ordinary
    | unrecognised wrapper tag (a Word-paste <span>) but WRONG for a genuinely dangerous element:
    | verified by execution against this exact allow-list (Phase 4 audit finding F-1, Medium) that
    | 'block' lets a raw-text element's TEXT CONTENT survive as inert, unwrapped text —
    | `<script>alert(1)</script>` blocks down to the literal string `alert(1)` sitting in the
    | stored description, and `<style>...</style>` down to raw CSS text. The library's own claim
    | that "scripts are removed but the output may still contain other dangerous behaviors" is
    | true, but this file's PREVIOUS revision additionally and incorrectly assumed script/style
    | CONTENT could never resurface as sanitizable text at all — libxml parses a raw-text element's
    | body as an ordinary text child, and a Blocked element keeps its text children by design.
    |
    | Every element below CAN be dropped (tag + content both removed) via HtmlSanitizerConfig::
    | dropElement(), applied in App\Actions\Products\SanitizeProductDescription, and is verified to
    | still leave 'block' fully intact for legitimate wrapper tags (a <div>/<span>/<font> wrapping
    | real text is unaffected by dropping this list).
    |
    | Do NOT add <style> or <title> here expecting it to work: HtmlSanitizer::
    | createDomVisitorForContext() filters getDroppedElements()/getBlockedElements() against
    | W3CReference::HEAD_ELEMENTS (head, link, meta, style, title) and DISCARDS a drop/block
    | configuration for any of them in BODY context — verified by reading that method directly.
    | <style>/<title> in body context are therefore a KNOWN, ACCEPTED, UNAVOIDABLE residual: their
    | text content (e.g. raw CSS) can survive as inert, escaped text no matter how this config is
    | written, because the library gives body-context code no lever to drop or block them at all.
    | See ProductDescriptionSanitizationTest.php's dedicated <style>-in-body pin, which asserts this
    | residual explicitly rather than assuming it away, so a future library upgrade that changes it
    | is visible in a diff.
    */
    'dropped_elements' => [
        'script', 'textarea', 'noembed', 'xmp', 'plaintext', 'iframe', 'form',
        'template', 'noscript', 'svg', 'math', 'object', 'embed', 'applet',
        'select', 'option', 'button', 'input',
    ],

    /*
    |--------------------------------------------------------------------------
    | Default action for an element that is neither allowed nor dropped above
    |--------------------------------------------------------------------------
    |
    | 'block' (Symfony\Component\HtmlSanitizer\HtmlSanitizerAction::Block): the element's own tag
    | is removed but its TEXT CONTENT is retained. This is deliberately NOT the library's own
    | untouched default, 'drop', which removes the element AND its content. A Word-paste <span>
    | wrapper or any other unknown wrapper tag should lose its formatting, not the legitimate text
    | inside it — see D-16 constraint 3 / R-16, and the "script block" test which asserts the
    | surrounding legitimate text survives.
    |
    | 'block' is safe here ONLY because every genuinely dangerous element is explicitly DROPPED
    | above rather than left to this default — see `dropped_elements`'s comment for the finding
    | that made that split necessary (Phase 4 audit finding F-1). This value on its own does NOT
    | neutralise <script>/<style>/<iframe>/etc.; it governs ordinary elements like an unrecognised
    | <span> or <div> only, once the drop list has already removed the dangerous ones.
    */
    'default_action' => 'block',

    /*
    |--------------------------------------------------------------------------
    | Relative links/media (allowRelativeLinks / allowRelativeMedias) — left at the library default
    |--------------------------------------------------------------------------
    |
    | Both default to `false` (Symfony's own safe default) and are NOT overridden here, deliberately
    | — Phase 4 audit finding F-4, informational, no fix needed. The consequence: an administrator
    | typing a relative URL into the link popover (`/products/1`, `#anchor`) has that `href`
    | silently STRIPPED rather than rejected with a message — content loss in the safe direction,
    | with no warning surfaced today. Recorded here because this file otherwise documents every
    | scheme/host default it inherits versus overrides, and a caller relying on this one should not
    | have to rediscover it by testing a relative link and wondering where it went. A "warn the
    | administrator" UX is correctly out of scope for this story (R-16 / 0027's).
    */

    /*
    |--------------------------------------------------------------------------
    | Maximum input length, in bytes, before the sanitizer even begins parsing
    |--------------------------------------------------------------------------
    |
    | Symfony's own default is 20,000 BYTES, and it is a SILENT TRUNCATION applied to the raw
    | input before parsing ever begins — a distinct, separate concern from the application's own
    | `max:65535`-CHARACTER validation rule on the sanitized value (see App\Concerns\
    | ProductValidationRules::productDescriptionRules()). At the library default, a legitimate
    | description that is long only because of markup the sanitizer is about to remove (padding
    | that collapses well under 65535 characters once sanitized) would be silently truncated mid-
    | markup before the sanitizer ever reaches the real content — a data-loss bug distinct from,
    | and unrelated to, the "everything else is dropped" allow-list above.
    |
    | Set comfortably above the validation rule's 65535-character ceiling so that ceiling — not an
    | unconfigured library default — is what actually bounds a description. 262144 (256 KiB) is
    | roughly 4x the worst case of 65535 four-byte UTF-8 characters with no markup at all, which
    | leaves real headroom for allowed-tag markup surviving sanitization while still bounding the
    | sanitizer's own parse work against an arbitrarily large raw submission (rather than passing
    | -1/unlimited, which removes that bound entirely).
    */
    'max_input_length' => 262_144,

];
