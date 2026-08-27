<?php

// Story 0019, Phase 4 fix round -- finding F-5 (Low). NEW file.
//
// Livewire's temporary-upload endpoint (the one a browser actually posts a file to while the
// user is still filling in the form, before App\Livewire\Media\Gallery::upload() ever runs) had
// no published config/livewire.php, so its unrestricted vendor default applied
// (['required', 'file', 'max:12288'] -- 12 MB, no mimes check at all) -- looser than this app's
// own App\Concerns\MediaValidationRules::imageUploadRules() and reachable by anyone holding just
// media.view. This is a config assertion rather than an HTTP round-trip against Livewire's
// temporary-upload route: that route's own rule-application is vendor-owned and already covered
// by Livewire's own test suite -- what this project's code can regress is the CONFIG VALUE itself
// being silently reverted or hand-edited back to null.

use App\Concerns\MediaValidationRules;

test('the published Livewire config restricts temporary uploads to this apps own image rules', function () {
    expect(config('livewire.temporary_file_upload.rules'))->toBe([
        'required', 'file', 'mimes:jpg,jpeg,png', 'max:8192',
    ]);
});

test('the published max: KB ceiling never drifts from MediaValidationRules::MAX_UPLOAD_KB (N-5)', function () {
    // Story 0019 Phase 4 re-audit, finding N-5 (Low). The test above pins the CURRENT literal
    // ('max:8192'), but config/livewire.php's own comment admits this is a hand-copied literal,
    // never a class-constant reference, "to keep this vendor-published config file free of a
    // coupling to an app class -- if MAX_UPLOAD_KB ever changes, update this too". Nothing
    // previously enforced that "update this too" -- a lone edit to
    // MediaValidationRules::MAX_UPLOAD_KB would leave the two silently mismatched, with the
    // above test still green because it only re-asserts today's literal against itself. This
    // mirrors tests/Feature/Navigation/SidebarModuleGatingTest.php's own "assert the coupling,
    // not just today's literal" idiom for a comparable registry<->route mismatch.
    $rules = config('livewire.temporary_file_upload.rules');

    $maxRule = collect($rules)->first(fn (string $rule): bool => str_starts_with($rule, 'max:'));

    expect($maxRule)->not->toBeNull();

    $publishedMaxKb = (int) substr($maxRule, strlen('max:'));

    // A trait constant cannot be referenced as MediaValidationRules::MAX_UPLOAD_KB directly (PHP:
    // "Cannot access trait constant ... directly") -- only through a class that `use`s the trait,
    // matching the exact reasoning App\Actions\Media\GenerateImageConversions' own docblock gives
    // for the identical constraint on MAX_DIMENSION.
    $ruleHolder = new class
    {
        use MediaValidationRules;
    };

    expect($publishedMaxKb)->toBe($ruleHolder::MAX_UPLOAD_KB);
});
