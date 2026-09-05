<?php

// View-level rendering tests for App\Livewire\Products\AttributeTypes\Index /
// resources/views/livewire/products/attribute-types.blade.php, per
// ai-spec/tasks/0030-product-attribute-types-and-values-ui.md's "Tests to perform" section.
//
// Component logic, persistence, validation-rule enforcement and both authorization layers are
// covered by tests/Feature/Products/AttributeTypesIndexTest.php (story 0028) -- nothing here
// duplicates that. Every test below asserts against the RENDERED HTML or the component's own
// $values array, which that file never does for markup.
//
// Mirrors tests/Feature/ProductCategories/IndexRenderingTest.php's shape. Helper function named
// attributeTypesRenderingActor() (not attributeTypesFullActor(), already declared in
// AttributeTypesIndexTest.php) to avoid a PHP "cannot redeclare function" fatal when the full
// suite loads every Feature test file in one process.

use App\Actions\Products\CreateProductAttributeType;
use App\Livewire\Products\AttributeTypes\Index;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Str;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function attributeTypesRenderingActor(array $permissions = ['products.view', 'products.create', 'products.edit', 'products.delete']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

/**
 * @param  array<int, string>  $values
 */
function createAttributeTypeWithValues(string $name, array $values = []): ProductAttributeType
{
    return app(CreateProductAttributeType::class)(
        $name,
        array_map(fn (string $value): array => ['value' => $value], $values),
    );
}

/**
 * The exact HTML slice for one repeater row, from its own `wire:key="{key}"` up to (but not
 * including) the next row's `wire:key`, or the end of the string for the last row -- this is
 * what lets a test scope an assertion to "this row's own markup" rather than the whole modal,
 * per FP-UI3 (a validation message asserted without checking which row it is attached to).
 */
function attributeTypeValueRowHtml(string $html, string $key): string
{
    $needle = 'wire:key="'.$key.'"';
    $start = strpos($html, $needle);
    expect($start)->not->toBeFalse();

    $nextRow = strpos($html, 'wire:key="', $start + strlen($needle));
    $end = $nextRow !== false ? $nextRow : strlen($html);

    return substr($html, $start, $end - $start);
}

/**
 * A window of HTML around a given data-test hook, wide enough to capture the whole
 * <flux:button>/<flux:tooltip> markup around it without bleeding into an unrelated sibling row.
 */
function attributeTypeHookSnippet(string $html, string $dataTest): string
{
    $pos = strpos($html, 'data-test="'.$dataTest.'"');
    expect($pos)->not->toBeFalse();

    // Wide enough to reach back past a compiled <flux:button>'s own long utility-class attribute
    // AND the enclosing <ui-tooltip ...> wrapper's own attributes on the disabled branch -- a
    // narrower window here silently missed the wrapper (Phase 5 review follow-up).
    return substr($html, max(0, $pos - 1000), 1600);
}

test('the list renders each types name, value count and value preview', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    $type = createAttributeTypeWithValues('Size', ['38', '39', '40']);

    $html = Livewire::test(Index::class)->assertSee('Size')->html();

    // Scoped to the count badge's own hook and its actual rendered digit -- a bare assertSee('3')
    // can never fail here, since '3' also appears in the header's live totals and inside the
    // '38, 39, 40' preview string itself (Phase 5 review finding F-4).
    $matched = preg_match('/data-test="value-count-'.preg_quote($type->id, '/').'"[^>]*>\s*(\d+)\s*</s', $html, $matches);
    expect($matched)->toBe(1)
        ->and($matches[1])->toBe('3');

    expect($html)->toContain('38, 39, 40');
});

test('the header renders live totals for types and their combined values', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    createAttributeTypeWithValues('Size', ['38', '39', '40']);
    createAttributeTypeWithValues('Color', ['Black', 'White']);
    createAttributeTypeWithValues('Material');

    $component = Livewire::test(Index::class);

    expect($component->get('typesSummary'))->toBe(['total' => 3, 'values' => 5]);

    $component->assertSee(__('products.attribute_types.summary', ['total' => 3, 'values' => 5]));
});

test('the empty state renders when no attribute types exist', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    expect(ProductAttributeType::count())->toBe(0);

    $html = Livewire::test(Index::class)->html();

    expect($html)->toContain('data-test="attribute-types-empty-state"');
});

test('a type holding no values renders a zero count and the em dash preview, not a broken cell', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    $type = createAttributeTypeWithValues('Material');

    $html = Livewire::test(Index::class)->html();

    // The exact intended rendering (FP-UI8), not merely "no exception".
    $snippet = attributeTypeHookSnippet($html, 'value-preview-'.$type->id);

    expect($snippet)->toContain('&mdash;');
});

test('a type holding more than five values renders the first five plus a remaining count', function () {
    // OQ-3's truncation is the only real logic in the view (Phase 5 review finding F-3) and had
    // no test at all -- a type at the max:100 ceiling exercised nothing.
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    $values = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'];
    $type = createAttributeTypeWithValues('Size', $values);

    $html = Livewire::test(Index::class)->html();
    $snippet = attributeTypeHookSnippet($html, 'value-preview-'.$type->id);

    expect($snippet)
        ->toContain('A1, A2, A3, A4, A5')
        ->toContain(__('products.attribute_types.value_preview_more', ['count' => 2]))
        ->not->toContain('A6')
        ->not->toContain('A7');
});

test('row actions render disabled with a tooltip for an actor who may not edit or delete, and enabled for a full administrator', function () {
    // FP-UI7: a second, deliberately under-permissioned actor is required -- an Administrator
    // alone would say nothing about the disabled branch, since attribute types have no per-row
    // distinction (0028 D6). The type is seeded first, as the full actor, since
    // CreateProductAttributeType authorizes its own operation and needs a signed-in user.
    $full = attributeTypesRenderingActor();
    $this->actingAs($full);

    $type = createAttributeTypeWithValues('Size', ['38']);

    $fullHtml = Livewire::test(Index::class)->html();

    $fullEditSnippet = attributeTypeHookSnippet($fullHtml, 'edit-type-'.$type->id);
    $fullDeleteSnippet = attributeTypeHookSnippet($fullHtml, 'delete-type-'.$type->id);

    expect($fullEditSnippet)->toContain('wire:click="openEditModal')
        ->and($fullDeleteSnippet)->toContain('wire:click="confirmDelete');

    $limited = attributeTypesRenderingActor(['products.view']);
    $this->actingAs($limited);

    $limitedHtml = Livewire::test(Index::class)->html();

    $editSnippet = attributeTypeHookSnippet($limitedHtml, 'edit-type-'.$type->id);
    $deleteSnippet = attributeTypeHookSnippet($limitedHtml, 'delete-type-'.$type->id);

    // 'disabled' alone is not a safe substring here -- Flux's own disabled:opacity-75/
    // disabled:cursor-default/disabled:pointer-events-none utility classes carry the literal word
    // "disabled" on the ENABLED branch too (Phase 5 review finding F-2). The real marker is the
    // rendered boolean attribute, and the tooltip wrapper this branch adds.
    expect($editSnippet)->toContain('disabled="disabled"')->toContain('ui-tooltip')->not->toContain('wire:click="openEditModal')
        ->and($deleteSnippet)->toContain('disabled="disabled"')->toContain('ui-tooltip')->not->toContain('wire:click="confirmDelete')
        ->and($limitedHtml)->toContain(__('products.attribute_types.action_not_allowed'));
});

test('opening the create form shows an empty name field and zero value rows', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class)->call('openCreateModal');

    $component->assertSet('name', '')->assertSet('values', []);

    $html = $component->html();

    expect($html)
        ->toContain('data-test="attribute-type-values-empty"')
        ->not->toContain('data-test="attribute-type-values-list"');
});

test('opening the edit form shows the type name and its values in their saved order', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    // Submitted (and therefore stored) in a deliberately non-alphabetical order, so this test
    // fails if the view or the component silently re-sorts by value text.
    $type = createAttributeTypeWithValues('Size', ['40', '38', '39']);

    $component = Livewire::test(Index::class)->call('openEditModal', $type->id);

    $component->assertSet('name', 'Size');

    expect(array_column($component->get('values'), 'value'))->toBe(['40', '38', '39']);
});

test('a blank name and a duplicate type name each render a message next to the name field, with the modal open', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    createAttributeTypeWithValues('Size');

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', '')
        ->call('save')
        ->assertSee(__('validation.required', ['attribute' => 'name']))
        ->assertSet('showModal', true);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Size')
        ->call('save')
        ->assertSee(__('validation.unique', ['attribute' => 'name']))
        ->assertSet('showModal', true);
});

test('a duplicate value within one submission renders a message against that value row, and the type keeps a single value', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    $type = createAttributeTypeWithValues('Size', ['38']);

    $component = Livewire::test(Index::class)->call('openEditModal', $type->id);
    $component->call('addValue');
    $newKey = $component->get('values')[1]['key'];

    $component->set('values.1.value', '38')->call('save');

    $component->assertHasErrors();

    $html = $component->html();
    $rowHtml = attributeTypeValueRowHtml($html, $newKey);

    // flux:error renders 'text-red-500' unconditionally in its class list, toggled visible by
    // the absence of a 'hidden' class when a message is present -- see vendor/livewire/flux/
    // stubs/resources/views/flux/error.blade.php. Presence of the message text itself, scoped to
    // this row's own slice, is what proves it landed against the offending row rather than
    // floating at the top of the form (FP-UI3).
    expect($rowHtml)->toContain(__('validation.distinct', ['attribute' => 'values.1.value']));

    $type->refresh();
    expect($type->values()->count())->toBe(1)
        ->and($type->values()->first()->value)->toBe('38');
});

test('the same value text under two different types is accepted for both', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    createAttributeTypeWithValues('Color', ['Black']);
    createAttributeTypeWithValues('Material', ['Black']);

    Livewire::test(Index::class)
        ->assertSee('Color')
        ->assertSee('Material');

    expect(ProductAttributeValue::where('value', 'Black')->count())->toBe(2);
});

test('confirmDelete renders a confirmation naming the type', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    $type = createAttributeTypeWithValues('Material');

    $component = Livewire::test(Index::class)->call('confirmDelete', $type->id);

    $component
        ->assertSet('deletingTypeName', 'Material')
        ->assertSet('showDeleteModal', true)
        ->assertSee('Material');
});

test('the delete confirmation renders no usage-count copy at all', function () {
    // Decision 6: deletingTypeUsageCount is always 0 until story 0029, and rendering it would
    // imply a check that does not exist -- a negative assertion, so the 0029 count cannot be
    // added here by accident.
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    $type = createAttributeTypeWithValues('Material');

    $html = Livewire::test(Index::class)->call('confirmDelete', $type->id)->html();

    expect($html)->not->toMatch('/used by|variant/i');
});

test('moveValue reorders the values array exactly, and the rendered rows follow', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    $type = createAttributeTypeWithValues('Size', ['40', '38', '39']);

    $component = Livewire::test(Index::class)->call('openEditModal', $type->id);
    $keys = array_column($component->get('values'), 'key');

    // Move the first row (value 40) down one position -> 38, 40, 39.
    $component->call('moveValue', $keys[0], 1);

    // Exact ordered sequence (FP-UI1) -- never toContain, which passes in any order.
    expect(array_column($component->get('values'), 'value'))->toBe(['38', '40', '39']);

    $html = $component->html();
    $posFirst = strpos($html, 'wire:key="'.$keys[1].'"');   // 38, now first
    $posSecond = strpos($html, 'wire:key="'.$keys[0].'"');  // 40, now second
    $posThird = strpos($html, 'wire:key="'.$keys[2].'"');   // 39, still third

    expect($posFirst)->toBeLessThan($posSecond)
        ->and($posSecond)->toBeLessThan($posThird);
});

test('saving a type with zero value rows succeeds and lists it holding zero values', function () {
    $actor = attributeTypesRenderingActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Material')
        ->call('save')
        ->assertHasNoErrors();

    $type = ProductAttributeType::where('name', 'Material')->firstOrFail();
    expect($type->values()->count())->toBe(0);

    $html = Livewire::test(Index::class)->html();

    expect($html)
        ->toContain('data-test="value-count-'.$type->id.'"')
        ->toContain('data-test="value-preview-'.$type->id.'"');
});

// Phase 4 security audit finding F-1: $values (and $showModal) are the form's own
// client-writable input, so a products.view-only actor can force this branch open with a forged
// $set('values', ...) -- without ever passing the products.create gate -- before save()'s own
// validation runs. The view's @continue guard must fail closed on every row shape it
// dereferences (missing 'key', or a non-string 'value'), not only a bare scalar row -- the
// narrower guard this test would have caught crashed the render with an unhandled ViewException.
test('a forged malformed value row is skipped by the render guard rather than crashing the page', function () {
    // Deliberately the weaker actor the finding names -- products.view alone, never having
    // authorized create -- to prove the crash is reachable without the create gate too.
    $actor = attributeTypesRenderingActor(['products.view']);
    $this->actingAs($actor);

    $html = Livewire::test(Index::class)
        ->set('showModal', true)
        ->set('values', [
            ['value' => 'missing a key entirely'],
            ['id' => null, 'key' => 'k', 'value' => ['not', 'a', 'string']],
            'a bare scalar row',
        ])
        ->html();

    expect($html)->toContain('data-test="attribute-type-values-list"');
});

// Found by the full, unscoped Definition-of-Done suite run (never by a scoped one) --
// 0028's own AttributeTypesValidationHardeningTest forges an ARRAY id with an otherwise
// well-shaped row (a legal client payload per attributeValueIdRules()'s own docblock: a
// non-owned id of any shape is a legitimate "treat this as a new row" submission), and the
// render's own $rowHook = $row['id'] ?? $row['key'] happily interpolated that array into a
// data-test attribute -- htmlspecialchars() crashing on an array argument, not a validation
// error. The guard above must reject a non-string, non-null id too.
test('a forged array id with an otherwise well-shaped row is skipped rather than crashing on interpolation', function () {
    $actor = attributeTypesRenderingActor(['products.view']);
    $this->actingAs($actor);

    $html = Livewire::test(Index::class)
        ->set('showModal', true)
        ->set('values', [
            ['id' => ['forged', 'array'], 'key' => (string) Str::uuid(), 'value' => 'Black'],
        ])
        ->html();

    expect($html)->toContain('data-test="attribute-type-values-list"');
});
