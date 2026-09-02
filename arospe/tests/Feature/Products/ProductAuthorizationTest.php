<?php

use App\Actions\Products\CreateProduct;
use App\Actions\Products\DeleteProduct;
use App\Actions\Products\UpdateProduct;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

// Story 0024, Phase 3 (TDD "red" step), new in the split (D-15, reversed at the split — see the
// task file's C-1/RQ-10): the three write actions self-authorize against App\Policies\
// ProductPolicy via App\Actions\Auth\LogRefusedPrivilegedAttempt, with `targetType: 'product'`
// passed explicitly (resolveTarget() auto-resolves only User and Role). See
// CreateProductTest.php's file banner for the assumed CreateProduct/UpdateProduct::__invoke()
// signatures; DeleteProduct's signature (`__invoke(Product $product): bool`) is given verbatim
// by the task file, no ambiguity there.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function authTestProductPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Runner Pro',
        'sku' => 'RNR-'.Str::random(10),
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

// =====================================================================
// create
// =====================================================================

test('CreateProduct is refused for an actor lacking products.create, is logged, and writes no row', function () {
    Log::spy();

    $actor = User::factory()->create();
    $this->actingAs($actor);

    $caught = null;

    try {
        app(CreateProduct::class)(...authTestProductPayload());
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class);
    expect(Product::count())->toBe(0);

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && ($context['target_type'] ?? null) === 'product')
        ->once();
});

test('CreateProduct succeeds for an actor holding products.create, as the control', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('products.create');
    $this->actingAs($actor);

    $product = app(CreateProduct::class)(...authTestProductPayload());

    expect(Product::count())->toBe(1)
        ->and($product->fresh())->not->toBeNull();
});

// =====================================================================
// update
// =====================================================================

test('UpdateProduct is refused for an actor lacking products.edit, is logged, and leaves the row unchanged', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('products.create');
    $this->actingAs($creator);
    $product = app(CreateProduct::class)(...authTestProductPayload(['name' => 'Original Name']));

    $actor = User::factory()->create();
    $this->actingAs($actor);

    Log::spy();

    $caught = null;

    try {
        app(UpdateProduct::class)(...array_merge(
            ['product' => $product],
            authTestProductPayload([
                'name' => 'Should Not Persist',
                'sku' => $product->sku,
                'productCategoryId' => $product->product_category_id,
            ]),
        ));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class);
    expect($product->fresh()->name)->toBe('Original Name');

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'product'
            && ($context['target_id'] ?? null) === $product->id)
        ->once();
});

test('UpdateProduct succeeds for an actor holding products.edit, as the control', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('products.create');
    $this->actingAs($creator);
    $product = app(CreateProduct::class)(...authTestProductPayload(['name' => 'Original Name']));

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');
    $this->actingAs($actor);

    $updated = app(UpdateProduct::class)(...array_merge(
        ['product' => $product],
        authTestProductPayload([
            'name' => 'Updated Name',
            'sku' => $product->sku,
            'productCategoryId' => $product->product_category_id,
        ]),
    ));

    expect($updated->fresh()->name)->toBe('Updated Name');
});

// =====================================================================
// delete
// =====================================================================

test('DeleteProduct is refused for an actor lacking products.delete, is logged, and the product survives', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('products.create');
    $this->actingAs($creator);
    $product = app(CreateProduct::class)(...authTestProductPayload());

    $actor = User::factory()->create();
    $this->actingAs($actor);

    Log::spy();

    $caught = null;

    try {
        app(DeleteProduct::class)($product);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class);
    expect(Product::where('id', $product->id)->exists())->toBeTrue();

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'delete'
            && ($context['target_type'] ?? null) === 'product'
            && ($context['target_id'] ?? null) === $product->id)
        ->once();
});

test('DeleteProduct succeeds for an actor holding products.delete, as the control', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('products.create');
    $this->actingAs($creator);
    $product = app(CreateProduct::class)(...authTestProductPayload());

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.delete');
    $this->actingAs($actor);

    $result = app(DeleteProduct::class)($product);

    expect($result)->toBeTrue()
        ->and(Product::where('id', $product->id)->exists())->toBeFalse();
});

// =====================================================================
// Super Admin bypass
// =====================================================================

test('a Super Admin actor holding zero permission rows passes create, update and delete', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $product = app(CreateProduct::class)(...authTestProductPayload());
    expect($product)->not->toBeNull();

    $updated = app(UpdateProduct::class)(...array_merge(
        ['product' => $product],
        authTestProductPayload([
            'name' => 'Super Admin Update',
            'sku' => $product->sku,
            'productCategoryId' => $product->product_category_id,
        ]),
    ));
    expect($updated->fresh()->name)->toBe('Super Admin Update');

    $result = app(DeleteProduct::class)($product);
    expect($result)->toBeTrue();
});

// =====================================================================
// D-15: SyncProductGallery is a collaborator of two actions that have already authorized, never
// an independently-reachable entry point — this is what makes its deliberate lack of a Gate call
// safe rather than an oversight. This test does not depend on SyncProductGallery existing yet
// (there is nothing under app/ that can reference a class that does not exist), so — like
// tests/Unit/ArchitectureTest.php's own "no blog taxonomy in code yet" scope fence — it is
// honestly a structural constraint expressed as a test rather than something that fails red today.
// =====================================================================

// Phase 4 audit finding F-5: strip comments/docblocks before searching, so a
// legitimate mention in prose (e.g. database/factories/ProductFactory.php's
// own docblock, which names this class to explain why it deliberately does
// NOT call it) can never false-positive this test — only a real `use`
// import, a type-hint, a `new SyncProductGallery`, `SyncProductGallery::class`
// or an `app(SyncProductGallery::class)` call counts. `token_get_all()` is
// used rather than a regex so this can't be fooled by a differently-shaped
// comment either.
function fileReferencesSyncProductGalleryOutsideComments(string $path): bool
{
    $contents = file_get_contents($path);

    if ($contents === false) {
        return false;
    }

    if (! str_contains($contents, 'SyncProductGallery')) {
        return false;
    }

    foreach (token_get_all($contents) as $token) {
        if (is_array($token) && in_array($token[0], [T_COMMENT, T_DOC_COMMENT], true)) {
            continue;
        }

        $text = is_array($token) ? $token[1] : $token;

        if (str_contains($text, 'SyncProductGallery')) {
            return true;
        }
    }

    return false;
}

test('SyncProductGallery is referenced only by CreateProduct and UpdateProduct anywhere under app/, database/ or routes/', function () {
    $allowedFiles = array_map('realpath', [
        app_path('Actions/Products/CreateProduct.php'),
        app_path('Actions/Products/UpdateProduct.php'),
        app_path('Actions/Products/SyncProductGallery.php'),
    ]);

    $offenders = [];

    // Phase 4 audit finding F-5: the scan previously covered app_path()
    // only, so a direct caller added under database/seeders/ or routes/
    // would have gone undetected — widened to all three trees a future
    // caller could plausibly live in.
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

            if (fileReferencesSyncProductGalleryOutsideComments($path)) {
                $offenders[] = $path;
            }
        }
    }

    expect($offenders)->toBe([]);
});
