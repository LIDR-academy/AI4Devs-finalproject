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
            ->set('photo', UploadedFile::fake()->image("product-{$i}.png", 100, 100))
            ->set('title', "Widget {$i}")
            ->call('upload')
            ->assertHasNoErrors();
    }

    expect(Media::count())->toBe(10);

    Livewire::test(Gallery::class)
        ->set('photo', UploadedFile::fake()->image('product-11.png', 100, 100))
        ->set('title', 'Widget 11')
        ->call('upload')
        ->assertHasErrors(['photo']);

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
            ->set('photo', UploadedFile::fake()->createWithContent("not-an-image-{$i}.png", 'plain text, not an image'))
            ->set('title', "Rejected {$i}")
            ->call('upload')
            ->assertHasErrors(['photo']);
    }

    expect(Media::count())->toBe(0);

    // The allowance is still intact -- a genuinely valid upload right after the ten rejections
    // succeeds rather than being throttled.
    Livewire::test(Gallery::class)
        ->set('photo', UploadedFile::fake()->image('product.png', 100, 100))
        ->set('title', 'Should still be allowed')
        ->call('upload')
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
            ->set('photo', UploadedFile::fake()->image("first-{$i}.png", 100, 100))
            ->set('title', "Widget {$i}")
            ->call('upload')
            ->assertHasNoErrors();
    }

    // The first user's own allowance is now exhausted -- confirmed so the assertion below is
    // meaningful rather than coincidental.
    Livewire::test(Gallery::class)
        ->set('photo', UploadedFile::fake()->image('first-11.png', 100, 100))
        ->set('title', 'Should be throttled')
        ->call('upload')
        ->assertHasErrors(['photo']);

    $this->actingAs($second);

    Livewire::test(Gallery::class)
        ->set('photo', UploadedFile::fake()->image('second-1.png', 100, 100))
        ->set('title', 'Second user widget')
        ->call('upload')
        ->assertHasNoErrors();

    expect(Media::count())->toBe(11);
});
