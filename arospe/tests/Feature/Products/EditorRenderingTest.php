<?php

// Option-set and embedded-component markup guards for App\Livewire\Products\Editor /
// resources/views/livewire/products/editor.blade.php, per
// ai-spec/tasks/in-progress/0027-products-list-and-editor-ui.md's "Tests to perform" section.
// WRITTEN AGAINST THE ORIGINAL (pre-0077) contract: ONE wysiwyg-editor bound to `description`,
// not N per-language panels.
//
// Written at TDD Phase 3 step 1 (red), before the real component/view exist.
//
// The three embedded-component assertions (distinct wire:keys, literal select-event names, the
// searchable-multi-select's option-resolver/field) read the compiled BLADE VIEW SOURCE directly
// via file_get_contents(), not the rendered HTML output -- a Livewire child component's own
// attributes (select-event, option-resolver, wire:key) are consumed by the child's mount/render
// and are NOT preserved as literal text in the parent's rendered output. This is the only way to
// pin an "exact static attribute" regression guard for a Livewire component TAG, and it fails red
// right now for the correct reason: the view file does not exist yet.

use App\Livewire\Products\Editor;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function productsEditorRenderingActor(array $permissions = ['products.view', 'products.create', 'products.edit', 'media.view']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

function productsEditorViewSource(): string
{
    $path = resource_path('views/livewire/products/editor.blade.php');

    return file_exists($path) ? (string) file_get_contents($path) : '';
}

// =====================================================================
// Status control (D-6)
// =====================================================================

test('the status selects option set is exactly ProductStatus::cases()', function () {
    $actor = productsEditorRenderingActor();
    $this->actingAs($actor);

    $html = Livewire::test(Editor::class)->html();

    expect($html)->toContain(__('products.statuses.active'))
        ->and($html)->toContain(__('products.statuses.draft'));

    // Regression guard against anyone feeding it ProductDisplayStatus::cases() instead.
    expect(mb_strtolower($html))->not->toContain('agotado')
        ->and($html)->not->toContain(__('products.display_statuses.out_of_stock'));
});

// =====================================================================
// Type control (D-5)
// =====================================================================

test('the type control renders a disabled placeholder with value empty and no real option pre-selected', function () {
    $actor = productsEditorRenderingActor();
    $this->actingAs($actor);

    $html = Livewire::test(Editor::class)->html();

    // D-5/D-16: the placeholder must be disabled AND selected, with value="".
    expect($html)->toMatch('/<option[^>]*value=""[^>]*disabled[^>]*>/')
        ->toMatch('/<option[^>]*value=""[^>]*selected[^>]*>|<option[^>]*selected[^>]*value=""[^>]*>/');

    // Neither real option carries `selected` on a fresh create form.
    expect($html)->not->toMatch('/<option[^>]*value="physical"[^>]*selected/')
        ->not->toMatch('/<option[^>]*value="virtual"[^>]*selected/');
});

// =====================================================================
// Category control
// =====================================================================

test('the category select is fed from real product_categories rows, ordered by name', function () {
    $actor = productsEditorRenderingActor();
    $this->actingAs($actor);

    ProductCategory::factory()->create(['name' => 'Zapatos']);
    ProductCategory::factory()->create(['name' => 'Abrigos']);

    $html = Livewire::test(Editor::class)->html();

    $posAbrigos = mb_strpos($html, 'Abrigos');
    $posZapatos = mb_strpos($html, 'Zapatos');

    expect($posAbrigos)->not->toBeFalse()
        ->and($posZapatos)->not->toBeFalse()
        ->and($posAbrigos)->toBeLessThan($posZapatos);
});

// =====================================================================
// Embedded components -- exact static attributes (D-8, D-10)
// =====================================================================

test('the two direct gallery embeds carry distinct wire keys and the literal select-event names', function () {
    $source = productsEditorViewSource();

    expect($source)->not->toBe('');

    expect($source)->toContain('wire:key="featured-image-gallery"')
        ->and($source)->toContain('wire:key="product-gallery-picker"')
        ->and($source)->toContain('select-event="featured-image-selected"')
        ->and($source)->toContain('select-event="product-images-added"');
});

test('one wysiwyg editor is bound to description', function () {
    $source = productsEditorViewSource();

    expect($source)->not->toBe('');
    expect($source)->toContain('components.wysiwyg-editor')
        ->and($source)->toContain('wire:model="description"');
});

test('the searchable multi-select is bound to regionIds with SearchSalesRegions as its option resolver', function () {
    $source = productsEditorViewSource();

    expect($source)->not->toBe('');
    expect($source)->toContain('components.searchable-multi-select')
        ->and($source)->toContain('SearchSalesRegions::class')
        ->and($source)->toContain('field="regionIds"')
        ->and($source)->toContain('wire:model="regionIds"');
});

test('both direct gallery embeds sit inside a can viewAny Media branch, and the page still renders without it', function () {
    $source = productsEditorViewSource();

    expect($source)->not->toBe('');
    expect($source)->toContain("@can('viewAny', \\App\\Models\\Media::class)");

    $actorWithoutMediaView = User::factory()->create();
    $actorWithoutMediaView->givePermissionTo(['products.view', 'products.create']);
    $this->actingAs($actorWithoutMediaView);

    Livewire::test(Editor::class)->assertOk();
});

// =====================================================================
// Lossy-sanitization notice (D-13)
// =====================================================================

test('the description field carries the static lossy-sanitization notice', function () {
    $actor = productsEditorRenderingActor();
    $this->actingAs($actor);

    $html = Livewire::test(Editor::class)->html();

    expect($html)->toContain('data-test="description-sanitization-notice"');
});
