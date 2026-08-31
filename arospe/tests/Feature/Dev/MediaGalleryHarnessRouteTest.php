<?php

// Story 0020 (Shared media gallery modal -- frontend), D16: the environment-gated harness route
// that exists solely so tests/Browser/Media/GalleryTest.php has a URL to visit(). Per D16's own
// instruction, this file proves TWO things and nothing more:
//   1. The route resolves at all under the `testing` environment (the one this suite always runs
//      under) -- a basic wiring smoke test.
//   2. The route is NOT REGISTERED AT ALL under `production` -- checked against the route
//      collection itself (Route::has()), not against a request's status code. D16 is explicit that
//      the gate is *non-existence*, not refusal: a `can:`/`permission:` middleware would still
//      leave the URL registered and discoverable, which is exactly the mistake this test exists to
//      catch. A request-based check (e.g. asserting a 404) cannot distinguish "the route doesn't
//      exist" from "the route exists and was refused for some other reason", so it is deliberately
//      not used here.
//
// Test 2's mechanics: the real application router already has this route registered by the time
// this test runs (the app was booted once, under `testing`, in TestCase::setUp()) -- re-checking
// Route::has() against THAT router after merely flipping app()->environment() would still read
// true, since nothing un-registers an already-loaded route. So this test re-executes routes/web.php
// from scratch against a brand-new, empty Illuminate\Routing\Router (swapped in as the Route
// facade's root for the duration of the assertion) while app()->environment() reports 'production'
// -- proving the registration-time `if` genuinely gates on environment rather than merely looking
// like it does.

use App\Livewire\Dev\MediaGalleryHarness;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

test('the harness route resolves under the testing environment', function () {
    expect(Route::has('dev.media-gallery-harness'))->toBeTrue();

    // The rendered view gates its two embedded gallery instances behind
    // @can('viewAny', Media::class) (D12), which resolves a real `media.view`
    // permission row -- so the catalog must be seeded for the harness page
    // to render at all, exactly as every other Media test in this suite
    // does (tests/Feature/Media/GalleryTest.php's own beforeEach).
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo('media.view');

    $this->actingAs($actor)
        ->get(route('dev.media-gallery-harness'))
        ->assertOk()
        // Story 0021 D13/OQ-1: the harness hosts TWO WysiwygEditor
        // instances, not one -- assert both data-test roots and both
        // (always-rendered, D9) seeded contents are present, so a
        // regression that drops either embed from the view is caught here
        // rather than only by a browser test discovering D5's re-entrancy
        // acceptance criterion has become unwriteable.
        ->assertSee('data-test="harness-editor-instance"', false)
        ->assertSee('data-test="harness-editor-instance-2"', false)
        ->assertSee('data-test="wysiwyg-editor-region"', false)
        ->assertSee('BEFORE AFTER', false)
        ->assertSee('SECOND BEFORE AFTER', false);
});

test('the harness route is not registered at all under production', function () {
    $originalRouter = app('router');
    $originalEnvironment = app()->environment();

    try {
        app()->detectEnvironment(fn (): string => 'production');

        // A fresh, empty router -- never the real one, which already has this route registered
        // from this test's own (testing-environment) app boot and would read true regardless.
        $freshRouter = new Router(app('events'), app());
        Route::swap($freshRouter);

        require base_path('routes/web.php');

        // RouteCollection::add() indexes a route's name at add-time, before the fluent ->name()
        // call further down the chain has run -- the real app's boot cycle refreshes this lookup
        // once after every route file has loaded, which this manual re-require never triggers on
        // its own. Verified directly: without this call every has() below reads false even though
        // the routes (and their names) are genuinely present in the collection.
        $freshRouter->getRoutes()->refreshNameLookups();

        expect($freshRouter->has('dev.media-gallery-harness'))->toBeFalse();

        // The rest of the app's real routes still register normally under production -- proving
        // the `if` block is the only thing gated, not the whole file silently no-op-ing.
        expect($freshRouter->has('home'))->toBeTrue()
            ->and($freshRouter->has('dashboard'))->toBeTrue();
    } finally {
        Route::swap($originalRouter);
        app()->detectEnvironment(fn (): string => $originalEnvironment);
    }
});

// Phase 4 security audit finding F-2 (Low): the registration-time `if` above is correct for a
// normal boot, but a route:cache built while APP_ENV was still testing/local would ship this
// route to production regardless, since bootstrap/cache/routes-v7.php is loaded verbatim and
// never re-evaluates that `if`. App\Livewire\Dev\MediaGalleryHarness::mount() is the defence in
// depth for exactly that scenario -- proven here by mounting the component directly (bypassing
// the route/middleware layer entirely) under a faked production environment.
test('mounting the harness component directly under production aborts with a 404, not a 403', function () {
    $this->withoutExceptionHandling();
    $originalEnvironment = app()->environment();

    try {
        app()->detectEnvironment(fn (): string => 'production');

        expect(fn () => Livewire::test(MediaGalleryHarness::class))
            ->toThrow(NotFoundHttpException::class);
    } finally {
        app()->detectEnvironment(fn (): string => $originalEnvironment);
    }
});
