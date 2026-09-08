<?php

namespace App\Actions\Products;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerAction;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Symfony\Component\HtmlSanitizer\Visitor\AttributeSanitizer\AttributeSanitizerInterface;

/**
 * Sanitize a product description's HTML against the allow-list in
 * config/html-sanitizer.php, before it is ever persisted (story 0024a, D-16).
 *
 * This is the ONLY class in app/ that imports symfony/html-sanitizer, mirroring how
 * App\Actions\Media\GenerateImageConversions confines the imaging library to one class — see
 * docs/conventions/base-standards.md. Every caller works with the sanitized string, never with
 * the library's own types.
 *
 * Sanitizing is idempotent for well-formed markup: sanitize(sanitize($x)) === sanitize($x) holds
 * for every allowed-tag shape this action ever produces (including everything the WYSIWYG toolbar
 * itself can emit — nested links, nested headings, nested lists, div-wrapped anchors, all verified
 * stable at pass 1). It is NOT an absolute guarantee for pathological/malformed input: fuzzing this
 * action against the shipped config (Phase 4 audit) found rare cases where libxml's own auto-nesting
 * normalisation needs a SECOND pass to reach a fixed point after a blocked wrapper is removed
 * between two same-name elements (e.g. adjacent `<li>` tags separated by a now-removed wrapper) —
 * every intermediate value stays safe HTML throughout, so this is content drift, not a security
 * window, but it means "one pass is always enough" is stronger than what actually holds. What IS
 * guaranteed, and load-bearing for the callers below: sanitizing twice always CONVERGES — a third
 * application never differs from the second. This is what lets an edit round-trip re-sanitize an
 * already-clean description with no further drift, and it is a property three later stories (0076
 * D-8, 0077 D-6, 0079) depend on directly by applying this action a second time over the same value
 * at a different layer.
 */
class SanitizeProductDescription
{
    /**
     * Sanitize a product description's HTML, or pass `null` through untouched.
     */
    public function __invoke(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        return $this->sanitizer()->sanitize($html);
    }

    /**
     * Build the sanitizer from config/html-sanitizer.php's allow-list. Built fresh per call
     * rather than cached on the instance: this action carries no other state, the config values
     * never change within a request, and constructing it is cheap relative to a database write.
     */
    private function sanitizer(): HtmlSanitizer
    {
        /** @var array<string, list<string>> $allowedElements */
        $allowedElements = config('html-sanitizer.allowed_elements', []);

        /** @var list<string> $allowedLinkSchemes */
        $allowedLinkSchemes = config('html-sanitizer.allowed_link_schemes', []);

        /** @var list<string> $allowedMediaSchemes */
        $allowedMediaSchemes = config('html-sanitizer.allowed_media_schemes', []);

        /** @var list<string> $droppedElements */
        $droppedElements = config('html-sanitizer.dropped_elements', []);

        $config = (new HtmlSanitizerConfig)
            ->defaultAction(HtmlSanitizerAction::from((string) config('html-sanitizer.default_action')))
            ->allowLinkSchemes($allowedLinkSchemes)
            ->allowMediaSchemes($allowedMediaSchemes)
            ->withMaxInputLength((int) config('html-sanitizer.max_input_length', -1));

        foreach ($allowedElements as $element => $allowedAttributes) {
            $config = $config->allowElement($element, $allowedAttributes);
        }

        // `class` on `code` is not a free-form attribute: this anonymous sanitizer constrains it
        // to exactly `language-<allowed_code_languages entry>` (a finite enumeration, not a
        // regex-shaped allow-anything-that-matches rule) before the value ever reaches the DOM
        // this action returns. An out-of-list value is DROPPED (sanitizeAttribute returning null
        // removes only that one attribute, per the library's own DomVisitor -- verified by reading
        // it rather than assumed), never rejects the whole element: `<code class="evil">text</code>`
        // survives as `<code>text</code>`, matching this file's "unwrap, don't destroy legitimate
        // content" philosophy for everything else. Defined here, not as a named class elsewhere in
        // app/, so this action remains the ONLY class in app/ that imports symfony/html-sanitizer
        // at all -- the import above is this file's alone.
        /** @var list<string> $allowedCodeLanguages */
        $allowedCodeLanguages = array_values(array_map(
            fn (mixed $language): string => (string) $language,
            (array) config('html-sanitizer.allowed_code_languages', []),
        ));

        $config = $config->withAttributeSanitizer(new class($allowedCodeLanguages) implements AttributeSanitizerInterface
        {
            /**
             * @param  list<string>  $allowedCodeLanguages
             */
            public function __construct(private readonly array $allowedCodeLanguages) {}

            /**
             * @return list<string> never null -- the interface's own return type is nullable
             *                      (null would mean "supports every element"), which this sanitizer never needs; the
             *                      `?` stays because it is the interface's own signature, not a choice made here.
             */
            // @phpstan-ignore return.unusedType
            public function getSupportedElements(): ?array
            {
                return ['code'];
            }

            /**
             * @return list<string> never null, for the identical reason getSupportedElements()
             *                      above states.
             */
            // @phpstan-ignore return.unusedType
            public function getSupportedAttributes(): ?array
            {
                return ['class'];
            }

            public function sanitizeAttribute(string $element, string $attribute, string $value, HtmlSanitizerConfig $config): ?string
            {
                return in_array($value, array_map(
                    fn (string $language): string => 'language-'.$language,
                    $this->allowedCodeLanguages,
                ), true) ? $value : null;
            }
        });

        // Phase 4 audit finding F-1: `default_action` ('block') keeps a blocked element's TEXT
        // CONTENT by design, which is correct for an ordinary wrapper tag but wrong for a
        // genuinely dangerous one (a <script>/<style> body survives as inert text). Every
        // dangerous element must be explicitly DROPPED (tag + content both removed) rather than
        // left to the default — see config/html-sanitizer.php's `dropped_elements` comment.
        foreach ($droppedElements as $element) {
            $config = $config->dropElement($element);
        }

        return new HtmlSanitizer($config);
    }
}
