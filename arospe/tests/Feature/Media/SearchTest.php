<?php

// Story 0019 (media library backend), Phase 3 step 1 (RED). App\Models\Media does not exist yet
// -- every test below is expected to fail with a "class not found" error, never a syntax error in
// this file.
//
// The task file says the model "carries the #[Scope] search scope" (Laravel 11+'s
// Illuminate\Database\Eloquent\Attributes\Scope), so this file tests it directly as
// Media::search($term) -- a plain Eloquent local scope -- rather than through the Livewire
// component: the "Tests to perform" section for this file names no Livewire::test() usage at all,
// and D7 frames search as "a title/description search query the gallery modal (story 0020) will
// call", i.e. the model scope IS the surface story 0020 consumes; the modal itself is out of
// scope here per D10.
//
// No permission/actor arrangement is needed -- searching the model directly exercises no
// authorization layer (that is covered by MediaPolicyTest.php and UploadTest.php's mount-level
// tests instead).
//
// Storage::fake('public') is set anyway, defensively, even though nothing here should touch the
// disk (Media::factory() must produce plausible paths without real files, per the task file's own
// MediaFactory instruction) -- this stays true only once the eventual factory honours that rule.

use App\Models\Media;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('a term appearing in a title returns that row', function () {
    $match = Media::factory()->create(['title' => 'Red Widget', 'description' => 'unrelated']);
    Media::factory()->create(['title' => 'Blue Gadget', 'description' => 'also unrelated']);

    $results = Media::search('Widget')->get();

    expect($results)->toHaveCount(1)
        ->and($results->first()->id)->toBe($match->id);
});

test('a term appearing only in a description returns that row', function () {
    $match = Media::factory()->create(['title' => 'Widget', 'description' => 'A shiny red item']);
    Media::factory()->create(['title' => 'Gadget', 'description' => 'A dull blue item']);

    $results = Media::search('shiny')->get();

    expect($results)->toHaveCount(1)
        ->and($results->first()->id)->toBe($match->id);
});

test('a partial substring term matches -- the assertion a FULLTEXT index would break (D7)', function () {
    $match = Media::factory()->create(['title' => 'Photograph of a widget', 'description' => null]);
    Media::factory()->create(['title' => 'Unrelated entry', 'description' => null]);

    $results = Media::search('tograph')->get();

    expect($results->pluck('id'))->toContain($match->id)
        ->and($results)->toHaveCount(1);
});

test('matching is case-insensitive', function () {
    $match = Media::factory()->create(['title' => 'RED WIDGET', 'description' => null]);

    $results = Media::search('red widget')->get();

    expect($results->pluck('id'))->toContain($match->id);
});

test('a term matching nothing returns an empty collection', function () {
    Media::factory()->create(['title' => 'Red Widget', 'description' => null]);

    $results = Media::search('nonexistent-term-xyz')->get();

    expect($results)->toBeEmpty();
});

test('a search term containing a percent sign is treated as a literal character, not a wildcard', function () {
    // Unescaped, "50%" interpolated into `LIKE '%50%%'` is functionally equivalent to
    // `LIKE '%50%'` -- i.e. "contains 50 followed by anything" -- which would ALSO match a title
    // that merely contains the digits "50" with no percent sign at all. This second row exists
    // specifically to make an unescaped implementation fail this test.
    $literalMatch = Media::factory()->create(['title' => 'Save 50% today', 'description' => null]);
    $wouldFalselyMatchIfUnescaped = Media::factory()->create(['title' => 'It costs 1500 dollars', 'description' => null]);

    $results = Media::search('50%')->get();

    expect($results->pluck('id'))
        ->toContain($literalMatch->id)
        ->not->toContain($wouldFalselyMatchIfUnescaped->id);
});

test('a search term containing an underscore is treated as a literal character, not a single-character wildcard', function () {
    // Unescaped, "_" is SQL LIKE's single-character wildcard, so a title differing by exactly one
    // character in that position would also match if the term is not escaped.
    $literalMatch = Media::factory()->create(['title' => 'file_v2 backup', 'description' => null]);
    $wouldFalselyMatchIfUnescaped = Media::factory()->create(['title' => 'fileXv2 backup', 'description' => null]);

    $results = Media::search('file_v2')->get();

    expect($results->pluck('id'))
        ->toContain($literalMatch->id)
        ->not->toContain($wouldFalselyMatchIfUnescaped->id);
});

test('an empty search term returns the full library rather than nothing', function () {
    Media::factory()->count(3)->create();

    $results = Media::search('')->get();

    expect($results)->toHaveCount(3);
});
