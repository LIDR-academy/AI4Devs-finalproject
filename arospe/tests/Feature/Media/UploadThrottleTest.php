<?php

// Story 0019, Phase 4 fix round -- finding F-1 (High, blocking), item 3. NEW file; the frozen
// tests/Feature/Media/UploadTest.php is not touched.
//
// Livewire's own 'throttle:60,1' on the *temporary*-upload endpoint (config/livewire.php) only
// bounds how fast a file can be STAGED there -- a single already-validated temporary-upload token
// can be set on a fresh App\Livewire\Media\Gallery component and passed to upload() again and
// again, replaying StoreUploadedImage's synchronous Imagick decode (D4) with no bound at all
// before this fix. This file drives the real Livewire component through the real RateLimiter
// (RateLimiter::attempt(), the same idiom App\Actions\Users\RequestEmailChange already uses)
// rather than asserting against a mock.
//
// Story 0020 Phase 5 fix round, D9: `$photo` was renamed to the array `$pendingUploads`, and
// Gallery::updatedPendingUploads() fires upload() the instant the batch finishes staging -- so
// title is set BEFORE pendingUploads throughout this file (matching the real UI), with no trailing
// ->call('upload'). A throttle refusal is surfaced via addError('pendingUploads', ...) (the array-
// level key, since the file(s) already passed validation by the time the throttle check runs), so
// this file asserts `assertHasErrors(['pendingUploads'])` for a throttled attempt and
// `assertHasErrors(['pendingUploads.0'])` for a validation-rejected one -- the two are genuinely
// different error-bag keys, not interchangeable.

use App\Livewire\Media\Gallery;
use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
    Storage::fake('public');
});

test('the 11th upload within an hour by the same user is throttled and creates no row', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo(['media.view', 'media.create']);
    $this->actingAs($actor);

    for ($i = 1; $i <= 10; $i++) {
        Livewire::test(Gallery::class)
            ->set('title', "Widget {$i}")
            ->set('pendingUploads', [UploadedFile::fake()->image("product-{$i}.png", 100, 100)])
            ->assertHasNoErrors();
    }

    expect(Media::count())->toBe(10);

    Livewire::test(Gallery::class)
        ->set('title', 'Widget 11')
        ->set('pendingUploads', [UploadedFile::fake()->image('product-11.png', 100, 100)])
        ->assertHasErrors(['pendingUploads']);

    // The throttled 11th attempt created no additional row.
    expect(Media::count())->toBe(10);
});

test('ten rejected uploads that never pass validation do not consume the hourly allowance (N-4)', function () {
    // Story 0019 Phase 4 re-audit, finding N-4 (Low). Gallery::upload() used to call
    // RateLimiter::attempt() BEFORE $this->validate(), so ten failed attempts -- wrong file
    // type, no file at all -- burned the same allowance the limiter exists to protect the
    // expensive Imagick decode with, even though none of them ever reached it. Fixed by moving
    // the RateLimiter::attempt() call to run after validation succeeds.
    $actor = User::factory()->create();
    $actor->givePermissionTo(['media.view', 'media.create']);
    $this->actingAs($actor);

    for ($i = 1; $i <= 10; $i++) {
        Livewire::test(Gallery::class)
            ->set('title', "Rejected {$i}")
            ->set('pendingUploads', [UploadedFile::fake()->createWithContent("not-an-image-{$i}.png", 'plain text, not an image')])
            ->assertHasErrors(['pendingUploads.0']);
    }

    expect(Media::count())->toBe(0);

    // The allowance is still intact -- a genuinely valid upload right after the ten rejections
    // succeeds rather than being throttled.
    Livewire::test(Gallery::class)
        ->set('title', 'Should still be allowed')
        ->set('pendingUploads', [UploadedFile::fake()->image('product.png', 100, 100)])
        ->assertHasNoErrors();

    expect(Media::count())->toBe(1);
});

test('a second users own allowance is unaffected by the first users throttle window', function () {
    $first = User::factory()->create();
    $first->givePermissionTo(['media.view', 'media.create']);

    $second = User::factory()->create();
    $second->givePermissionTo(['media.view', 'media.create']);

    $this->actingAs($first);

    for ($i = 1; $i <= 10; $i++) {
        Livewire::test(Gallery::class)
            ->set('title', "Widget {$i}")
            ->set('pendingUploads', [UploadedFile::fake()->image("first-{$i}.png", 100, 100)])
            ->assertHasNoErrors();
    }

    // The first user's own allowance is now exhausted -- confirmed so the assertion below is
    // meaningful rather than coincidental.
    Livewire::test(Gallery::class)
        ->set('title', 'Should be throttled')
        ->set('pendingUploads', [UploadedFile::fake()->image('first-11.png', 100, 100)])
        ->assertHasErrors(['pendingUploads']);

    $this->actingAs($second);

    Livewire::test(Gallery::class)
        ->set('title', 'Second user widget')
        ->set('pendingUploads', [UploadedFile::fake()->image('second-1.png', 100, 100)])
        ->assertHasNoErrors();

    expect(Media::count())->toBe(11);
});

test('a throttle stop mid-batch surfaces the throttle message, not a silently-first per-file one (F-D)', function () {
    // Phase 4 re-audit finding F-D (Low): only the FIRST entry of $failureMessages used to be
    // rendered, so an administrator whose batch hit both a per-file failure AND the hourly
    // throttle could be shown only the per-file message, with no indication they were also
    // throttled and that any remaining files in the batch were never attempted at all. This
    // exercises the throttle stopping the batch after one file already succeeded in the SAME
    // request -- the scenario where the old $failureMessages[0] happened to still be correct by
    // coincidence (nothing preceded the throttle entry) is not what regressed; what regressed is
    // a *different* failure landing before the throttle entry. The guarantee this test pins is
    // narrower and unconditional: whenever a throttle stop occurs, its message is what the actor
    // sees, never silently dropped in favour of something else in the same batch.
    $actor = User::factory()->create();
    $actor->givePermissionTo(['media.view', 'media.create']);
    $this->actingAs($actor);

    for ($i = 1; $i <= 9; $i++) {
        Livewire::test(Gallery::class)
            ->set('title', "Widget {$i}")
            ->set('pendingUploads', [UploadedFile::fake()->image("product-{$i}.png", 100, 100)])
            ->assertHasNoErrors();
    }

    expect(Media::count())->toBe(9);

    // The 10th and 11th attempts land in the SAME request: the batch's first file consumes the
    // last of the 10 hourly attempts and succeeds, the second is refused by the throttle.
    Livewire::test(Gallery::class)
        ->set('pendingUploads', [
            UploadedFile::fake()->image('batch-a.png', 100, 100),
            UploadedFile::fake()->image('batch-b.png', 100, 100),
        ])
        ->assertHasErrors(['pendingUploads'])
        ->assertSee(__('media.upload_throttled'));

    // One row from the batch's first (successful) file; the second was refused before it could
    // be stored.
    expect(Media::count())->toBe(10);
});
