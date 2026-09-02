<?php

use App\Actions\Products\CreateProduct;
use App\Actions\Products\SanitizeProductDescription;
use App\Actions\Products\UpdateProduct;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

// Story 0024a, Phase 3 (TDD "red" step): symfony/html-sanitizer is not a dependency of this
// codebase yet, config/html-sanitizer.php does not exist, and App\Actions\Products\
// SanitizeProductDescription does not exist -- every test in this file is expected to fail until
// backend-expert adds the dependency, the config and the action, and wires it into
// CreateProduct/UpdateProduct in the next step of the TDD cycle. Some tests fail with a resolution
// error (anything that instantiates SanitizeProductDescription directly); the rest fail as
// ordinary assertion mismatches, because CreateProduct/UpdateProduct do not sanitize anything
// today and the raw markup is persisted as-is. Both are the correct, intended "red" outcome.
//
// ================================================================================================
// WHAT THIS FILE ASSUMES ABOUT THE (NOT-YET-BUILT) IMPLEMENTATION, AND WHY
// ================================================================================================
//
// (1) SanitizeProductDescription::__invoke(?string $html): ?string -- exactly as the task file's
//     "Files to create/modify" table states.
//
// (2) The D-16 allow-list table is exhaustive and literal: <strong>/<b>, <em>/<i>, <u>, <h2>
//     (only -- not h1/h3-h6), <ul>/<ol>/<li>, <a href> (http/https/mailto only), <img src alt>
//     (http/https only), <p>, <br>. Every test below that exercises an ALLOWED tag/attribute is
//     spec-determined and does not depend on any implementation choice beyond following that
//     table. These were additionally VERIFIED by running the real, unmodified
//     symfony/html-sanitizer v8.1.6 library against exactly this allow-list, in a throwaway,
//     isolated scratch Composer project OUTSIDE this repository -- never added to this repo's
//     composer.json/composer.lock, which are unmodified (verified with `git status` before and
//     after). The exact strings asserted below for the allowed-tag round-trip dataset and the
//     characterization test are real, executed output against that allow-list, not guesses.
//
// (3) Two implementation choices are NOT fully pinned by D-16's table and are genuinely
//     backend-expert's to make -- flagged here rather than silently assumed:
//
//     (a) HtmlSanitizerConfig::defaultAction() for an element that is neither explicitly allowed
//         nor named in D-16's own "everything else is dropped" list (a Word-paste <span>, a <div>
//         wrapper, ...). R-16's own risk statement ("pasting from Word silently loses FORMATTING")
//         and this file's "surrounding legitimate text is still there" requirement on the <script>
//         test both only make sense if such wrapper tags are BLOCKED (tag removed, TEXT kept)
//         rather than DROPPED (tag AND content removed) -- the library's own untouched default is
//         Drop. This file assumes defaultAction(Block). If backend-expert ships the library's own
//         Drop default instead, the R-16 characterization test below will need its expected string
//         re-verified against the real shipped config; every other test in this file is unaffected
//         by this choice (each is written to hold either way -- see inline notes).
//     (b) HtmlSanitizerConfig::withMaxInputLength() -- the library defaults to a 20,000-BYTE cap
//         and silently TRUNCATES anything longer before parsing ever begins. Verified by
//         execution against the real library: at that default, this file's own "ordering" test
//         below (a description just over 65,535 bytes, built as padding-then-real-text) produces
//         an EMPTY sanitized string, because the truncation lands mid-padding, before the real
//         text is ever reached -- a distinct, previously-undocumented data-loss risk this task
//         file's own D-16/constraint-1 text does not mention anywhere. config/html-sanitizer.php
//         MUST set this to -1 (unlimited) or a value >= 65535, or a legitimate long-but-valid
//         description is silently truncated rather than merely stripped of markup. Flagged here
//         for appsec-auditor's Phase 4 pass -- the "ordering" test is written to fail loudly (a
//         real product-creation failure) if this is left at the library default, rather than
//         silently passing for the wrong reason.
//
// (4) Per the task's own instruction ("Every case asserts the PERSISTED value ... never the
//     action's return value"), every test in this file goes through CreateProduct/UpdateProduct
//     and reads `->fresh()->description`, never asserts on SanitizeProductDescription's return
//     value as the target of the test -- with one narrow exception (the null/empty-string
//     pass-through tests, which additionally probe the action directly in isolation, since "no
//     sanitizer error" is a claim about the action's own contract as well as about persistence).
// ================================================================================================

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);
    $this->actingAs($actor);
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function sanitizationProductPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Runner Pro',
        'sku' => 'SAN-'.Str::random(10),
        'productCategoryId' => ProductCategory::factory()->create()->id,
        'type' => 'physical',
        'status' => 'active',
        'price' => '19.99',
        'stock' => 5,
        'description' => null,
        'featuredMediaId' => null,
        'orderedGalleryMediaIds' => [],
    ], $overrides);
}

function createProductWithDescription(?string $description): Product
{
    return app(CreateProduct::class)(...sanitizationProductPayload(['description' => $description]));
}

/**
 * Re-saves $product through UpdateProduct with every field but `description` held at its current
 * value, so a test can isolate what the update path does to the description alone.
 */
function updateProductDescription(Product $product, ?string $description): Product
{
    return app(UpdateProduct::class)(
        product: $product,
        name: $product->name,
        sku: $product->sku,
        productCategoryId: $product->product_category_id,
        type: $product->type?->value,
        status: $product->status->value,
        price: $product->price,
        stock: $product->stock,
        featuredMediaId: null,
        orderedGalleryMediaIds: [],
        description: $description,
    );
}

// ------------------------------------------------------------------------------------------------
// The highest-value case in the file (spec's own words): without this, a sanitizer configured too
// tightly would silently destroy legitimate content and every "is it stripped?" test below would
// still pass. This is the only case that fails in the SAFE direction.
//
// The dataset is deliberately exactly 0021's eight toolbar actions (Bold, Italic, Underline, H2,
// bullet list, numbered list, link, insert image) plus <p>/<br> -- ten cases, matching the task
// file's own "Tests to perform" checklist literally. Every expected value below is real, executed
// output from the real symfony/html-sanitizer library against exactly D-16's allow-list (see the
// file banner) -- not a guess, and not dependent on assumption (3)(a)/(3)(b) above, since none of
// these tags is ever anything but explicitly Allowed.
// ------------------------------------------------------------------------------------------------
test('each tag the WYSIWYG toolbar can produce survives a round-trip unchanged', function (string $html, string $expected) {
    $product = createProductWithDescription($html);

    expect($product->fresh()->description)->toBe($expected);
})->with([
    // Phase 5 code review finding F-2: story 0021's WYSIWYG editor's real, execution-verified
    // output for the Bold/Italic toolbar buttons is <b>/<i> (see done/0021's D2 table, verified
    // live in Chromium) -- not <strong>/<em>. The allow-list correctly permits BOTH pairs (D-16),
    // so this is not a functional bug; the dataset was simply missing the tags the toolbar itself
    // actually emits for two of its eight actions. Both <strong>/<em> and <b>/<i> are kept: all
    // four are legitimately-allowed tags and this is the highest-value case in the file precisely
    // because it must cover everything the toolbar can produce, not merely its allow-listed
    // synonyms.
    'bold (strong)' => ['<strong>Bold</strong>', '<strong>Bold</strong>'],
    'bold (b) -- the toolbar\'s real output' => ['<b>Bold</b>', '<b>Bold</b>'],
    'italic (em)' => ['<em>Italic</em>', '<em>Italic</em>'],
    'italic (i) -- the toolbar\'s real output' => ['<i>Italic</i>', '<i>Italic</i>'],
    'underline (u)' => ['<u>Underline</u>', '<u>Underline</u>'],
    'heading (h2 only)' => ['<h2>Heading</h2>', '<h2>Heading</h2>'],
    'bullet list' => ['<ul><li>Item</li></ul>', '<ul><li>Item</li></ul>'],
    'numbered list' => ['<ol><li>Item</li></ol>', '<ol><li>Item</li></ol>'],
    'link (http/https allowed)' => [
        '<a href="https://example.com">Link</a>',
        '<a href="https://example.com">Link</a>',
    ],
    'insert image (http/https allowed)' => [
        '<img src="https://example.com/x.png" alt="An image">',
        '<img src="https://example.com/x.png" alt="An image" />',
    ],
    'paragraph' => ['<p>Paragraph</p>', '<p>Paragraph</p>'],
    'line break' => ['Line1<br>Line2', 'Line1<br />Line2'],
]);

// A script block is refused, and the legitimate text around it survives -- a sanitizer that
// dropped everything (turning the whole description empty) would satisfy only the first half.
test('a script block does not survive, and the surrounding legitimate text is still there', function () {
    $product = createProductWithDescription('Before text <script>alert(1)</script> After text');

    $stored = $product->fresh()->description;

    expect($stored)->not->toContain('<script')
        ->and($stored)->toContain('Before text')
        ->and($stored)->toContain('After text');
});

// Phase 4 security audit finding F-1 (Medium), added at the fix: the sanitizer's own untouched
// `default_action` semantics (Block: remove the tag, keep the text child) let a <script>'s TEXT
// CONTENT resurface as inert, escaped text -- libxml parses a raw-text element's body as an
// ordinary text child, and a Blocked element keeps its text children by design. `<script>` is now
// explicitly DROPPED (tag AND content) via config/html-sanitizer.php's `dropped_elements`, so this
// asserts the EXACT surviving string -- not just "no `<script` substring", which the pre-fix
// implementation would also have satisfied while still leaking "alert(1)" as plain text.
test('a script block is dropped tag-and-content, not merely unwrapped -- its text does not survive either', function () {
    $product = createProductWithDescription('Before text <script>alert(1)</script> After text');

    expect($product->fresh()->description)->toBe('Before text  After text');
});

// Phase 4 security audit finding F-1's own residual, pinned rather than assumed away.
// HtmlSanitizer::createDomVisitorForContext() filters getDroppedElements()/getBlockedElements()
// against W3CReference::HEAD_ELEMENTS (head, link, meta, style, title) and DISCARDS any drop/block
// configuration for them in BODY context -- verified by reading that method directly. So <style>
// (and <title>) CANNOT be dropped or blocked via config in a body-context sanitize() call, no
// matter what this app's own config/html-sanitizer.php says: the tag itself is always removed, but
// its raw CSS text content survives as inert, escaped text. This is a known, accepted, unavoidable
// residual of the library's own design, not a bug in this app's configuration -- the point of this
// test is that a future symfony/html-sanitizer upgrade that changes this behaviour shows up as a
// diff here, rather than silently being assumed still true.
test('a style tag in the body is stripped, but its inert CSS text survives -- a documented, unavoidable residual', function () {
    $product = createProductWithDescription('<p>A</p><style>body { color: red }</style><p>B</p>');

    $stored = $product->fresh()->description;

    expect($stored)->not->toContain('<style')
        ->and($stored)->toContain('body { color: red }');
});

// Every dangerous vector D-16 names, each asserted absent from the stored value. Every needle
// below is chosen so the assertion holds regardless of assumption (3)(a) -- none of these depends
// on whether an unlisted element is Blocked or Dropped by default, because none of the vectors
// below is ever anything but explicitly disallowed (an unlisted tag's own opening-tag string can
// never be serialized, and an allowed tag's disallowed attribute is stripped by attribute-level
// allow-listing regardless of the element's own default action).
test('a dangerous vector never reaches the stored description', function (string $description, string $mustNotContain) {
    $product = createProductWithDescription($description);

    expect($product->fresh()->description)->not->toContain($mustNotContain);
})->with([
    'on* handler on an otherwise-allowed img' => [
        '<img src="https://example.com/x.png" onerror="alert(1)" alt="x">', 'onerror',
    ],
    'javascript: scheme in an a href' => ['<a href="javascript:alert(1)">Click</a>', 'javascript:'],
    'data: scheme in an a href' => ['<a href="data:text/html,alert(1)">Click</a>', 'data:'],
    'data: scheme in an img src' => ['<img src="data:image/png;base64,AAAA" alt="x">', 'data:'],
    'iframe' => ['<iframe src="https://evil.example.com/x"></iframe>', '<iframe'],
    'style tag' => ['<style>body { background: url(javascript:alert(1)) }</style>', '<style'],
    'form' => ['<form action="https://evil.example.com"><input type="text"></form>', '<form'],
    'h1 (only h2 is allowed)' => ['<h1>Big Title</h1>', '<h1'],
    'h3 (only h2 is allowed)' => ['<h3>Sub Title</h3>', '<h3'],
    'style attribute on an otherwise-allowed p' => [
        '<p style="background:url(javascript:alert(1))">Text</p>', 'style=',
    ],
    // Same reason 0019 excluded SVG from uploads: inline SVG is the same vector by another door.
    'inline SVG payload' => ['<svg onload="alert(1)"><script>alert(2)</script></svg>', '<svg'],
]);

// The case a regex-based strip fails and a real HTML parser passes: a naive
// preg_replace('/<script.*?<\/script>/is', '', $html) is fooled by the nested opening tag, but a
// real parser tokenizes "<scr<script" as one bogus, non-"script" element name and never produces a
// live <script> tag either way.
test('a mangled, unclosed script vector does not reassemble into a live tag', function () {
    $product = createProductWithDescription('<scr<script>ipt>alert(1)</script>');

    $stored = $product->fresh()->description;

    expect($stored)->not->toContain('<script')
        ->and($stored)->not->toContain('<scr');
});

// D-16 constraint 2. Deliberately self-referential rather than pinned to any assumed intermediate
// output: it reads back whatever the FIRST save actually persisted, then re-saves that exact value
// through the update path, and asserts the SECOND save leaves it byte-for-byte unchanged. This
// holds regardless of assumption (3)(a) -- it never asserts what the first sanitization produced,
// only that a second pass over it changes nothing. Two later stories (0076 D-8, 0077 D-6) apply
// the sanitizer a second time on the same value and are safe ONLY because of this property.
test('sanitizing an already-sanitized description is a no-op, so an edit round-trip does not mutate it', function () {
    $product = createProductWithDescription(
        '<strong>Bold</strong> and <span class="mso">a Word span</span> and '
        .'<script>alert(1)</script> and <img src="https://example.com/x.png" onerror="alert(1)" alt="pic">'
    );

    $onceSanitized = $product->fresh()->description;

    $updated = updateProductDescription($product, $onceSanitized);

    expect($updated->fresh()->description)->toBe($onceSanitized);
});

// Phase 4 security audit finding F-2 (Low): fuzzing 4,000 randomized markup-soup inputs against
// the shipped config found 6 that violate one-pass idempotence -- libxml's own auto-nesting
// normalisation needs a SECOND parse to reach a fixed point when a blocked wrapper is removed
// from between two same-name elements. Every intermediate value stays safe HTML throughout (this
// is content drift, not a security window), and every case CONVERGES by the second pass. This
// test pins convergence -- sanitize, sanitize again, sanitize a third time, and assert the second
// and third applications agree -- rather than the stronger (and false) one-pass claim the class
// docblock used to make. `<li>A<center><li>B</li></center></li>` is a concrete, reproduced
// counter-example to one-pass idempotence: the first pass leaves a malformed `<li>` nested
// directly inside another `<li>` (libxml's own re-nesting has not yet run to a fixed point), and
// only the second pass produces the well-formed, stable result.
test('sanitizing twice always converges, even for malformed nesting where one pass does not', function () {
    $raw = '<ul><li>A<center><li>B</li></center></li></ul>';

    $product = createProductWithDescription($raw);
    $firstPass = $product->fresh()->description;

    // Confirms the premise this test exists to guard: the first pass alone is NOT yet the stable
    // value (proves the counter-example still reproduces against the shipped config, rather than
    // silently testing nothing if a library upgrade changes this).
    expect($firstPass)->toBe('<ul><li>A<li>B</li></li></ul>');

    $secondPassProduct = updateProductDescription($product, $firstPass);
    $secondPass = $secondPassProduct->fresh()->description;

    $thirdPassProduct = updateProductDescription($secondPassProduct, $secondPass);
    $thirdPass = $thirdPassProduct->fresh()->description;

    expect($secondPass)->not->toBe($firstPass)
        ->and($secondPass)->toBe($thirdPass);
});

// D-16 constraint 1, and the one test that fails if the two steps are ever swapped. The raw
// description is well over the 65,535-character limit ONLY because of <span> padding the
// sanitizer removes; if validation ran on the SUBMITTED value (validate-then-sanitize), this would
// be refused. Deliberately does not assert what the sanitizer's exact output is (only that it is
// short enough to have been accepted) so this test does not depend on assumption (3)(a) -- but it
// DOES depend on assumption (3)(b): at the library's own default 20,000-byte input cap, the
// padding truncates before the real text is ever reached and this fails for an unrelated reason
// (an over-aggressive truncation, not an ordering bug) -- see the file banner.
test('a description over the length limit only because of markup the sanitizer removes is accepted', function () {
    $padding = str_repeat('<span>', 6_000).'Short surviving text.'.str_repeat('</span>', 6_000);

    expect(strlen($padding))->toBeGreaterThan(65_535);

    $product = createProductWithDescription($padding);

    expect(Product::count())->toBe(1);

    $stored = $product->fresh()->description;

    expect($stored)->not->toBeNull()
        ->and(mb_strlen($stored))->toBeLessThanOrEqual(65_535);
});

// null and '' pass through untouched, with no sanitizer error -- checked against the action's own
// contract directly (SanitizeProductDescription::__invoke(?string): ?string) AND against the
// persisted column, since "no sanitizer error" is a claim about the action as much as about
// storage.
test('a null description passes through untouched, with no sanitizer error', function () {
    expect(app(SanitizeProductDescription::class)(null))->toBeNull();

    $product = createProductWithDescription(null);

    expect($product->fresh()->description)->toBeNull();
});

test('an empty-string description passes through untouched, with no sanitizer error', function () {
    expect(app(SanitizeProductDescription::class)(''))->toBe('');

    $product = createProductWithDescription('');

    expect($product->fresh()->description)->toBe('');
});

// The update path sanitizes too, asserted completely independently of the create-path tests above
// -- a sanitizer wired into CreateProduct only would be a silent hole reachable by editing any
// product, and this is the test that would catch exactly that regression.
test('the update path sanitizes the description too, independently of create', function () {
    $product = createProductWithDescription('A clean initial description.');

    $updated = updateProductDescription($product, 'Before <script>alert(1)</script> After');

    $stored = $updated->fresh()->description;

    expect($stored)->not->toContain('<script')
        ->and($stored)->toContain('Before')
        ->and($stored)->toContain('After');
});

// R-16: a characterization test pinning what the sanitizer's real, shipped configuration actually
// does to a realistic Word-style paste (a <span style=...> wrapper, an Office-only <o:p> element,
// and smart quotes/apostrophes), so a later package upgrade that changes this output is visible in
// a diff rather than silent. The point is the pin, not the prettiness.
//
// The expected value below is REAL, EXECUTED output from the actual symfony/html-sanitizer v8.1.6
// library against exactly D-16's allow-list plus assumption (3)(a) (defaultAction(Block)) -- run
// in an isolated scratch Composer project outside this repository, never added to this repo's own
// composer.json/composer.lock. If the shipped config resolves assumption (3)(a) differently (the
// library's own Drop default, left unconfigured), re-verify and update this literal string against
// the real installed library rather than guessing a second time.
test('a realistic Word-style paste is sanitized to the pinned, verified output (R-16)', function () {
    $wordPaste = '<p class="MsoNormal"><span style="font-size:11.0pt;font-family:&quot;Calibri&quot;,sans-serif">'
        ."This is \u{201C}quoted\u{201D} text with an \u{2018}apostrophe\u{2019}."
        .'</span><o:p>&nbsp;</o:p></p>';

    $product = createProductWithDescription($wordPaste);

    expect($product->fresh()->description)->toBe(
        "<p>This is \u{201C}quoted\u{201D} text with an \u{2018}apostrophe\u{2019}.\u{00A0}</p>"
    );
});

/**
 * Mirrors ProductAuthorizationTest.php's fileReferencesSyncProductGalleryOutsideComments()
 * verbatim in mechanism (tokenize, skip comments, look for the needle) -- reused here rather than
 * invented afresh, applied to a different needle: the sanitizer library's own namespace rather
 * than a class name, so it catches every symbol under Symfony\Component\HtmlSanitizer\* in one
 * pass (HtmlSanitizer, HtmlSanitizerConfig, HtmlSanitizerAction, ...), not just one of them.
 */
function fileReferencesHtmlSanitizerOutsideComments(string $path): bool
{
    $contents = file_get_contents($path);

    if ($contents === false) {
        return false;
    }

    if (! str_contains($contents, 'Symfony\Component\HtmlSanitizer')) {
        return false;
    }

    foreach (token_get_all($contents) as $token) {
        if (is_array($token) && in_array($token[0], [T_COMMENT, T_DOC_COMMENT], true)) {
            continue;
        }

        $text = is_array($token) ? $token[1] : $token;

        if (str_contains($text, 'Symfony\Component\HtmlSanitizer')) {
            return true;
        }
    }

    return false;
}

// Phase 5 code review finding F-1 (blocking): the task file's own acceptance criterion --
// "App\Actions\Products\SanitizeProductDescription is the ONLY class in app/ that imports the
// sanitizer -- asserted by a test, not by convention" -- had no test. The fact was true (verified
// by grep across two independent Phase 4 audit rounds) but unenforced, so a future caller reaching
// for symfony/html-sanitizer directly (a seeder, an Artisan command, a second action) would ship
// silently. Scan roots and allow-list shape mirror the SyncProductGallery reachability test
// exactly: app_path(), base_path('database'), base_path('routes') -- deliberately NOT tests/,
// since a test file legitimately constructing a fixture against the real library is fine and is
// not what this criterion is about. (resources/js/app.js has two comments mentioning "sanitizer"
// generically -- grep-verified neither contains this needle nor the class name -- and sits outside
// every scanned root regardless, so it is a non-issue either way.)
test('the sanitizer is imported only by SanitizeProductDescription anywhere under app/, database/ or routes/', function () {
    $allowedFiles = array_map('realpath', [
        app_path('Actions/Products/SanitizeProductDescription.php'),
    ]);

    $offenders = [];

    $scanRoots = [app_path(), base_path('database'), base_path('routes')];

    foreach ($scanRoots as $root) {
        if (! is_dir($root)) {
            continue;
        }

        foreach (File::allFiles($root) as $file) {
            $path = $file->getRealPath();

            if ($path === false || $file->getExtension() !== 'php' || in_array($path, $allowedFiles, true)) {
                continue;
            }

            if (fileReferencesHtmlSanitizerOutsideComments($path)) {
                $offenders[] = $path;
            }
        }
    }

    expect($offenders)->toBe([]);
});
