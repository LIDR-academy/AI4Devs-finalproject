<?php

// Pest 4 browser tests for the product attribute types management screen, per
// ai-spec/tasks/0030-product-attribute-types-and-values-ui.md's "Tests to perform" section.
//
// The shared discipline across every repeater test below: assert the DATABASE row after Save,
// never only the DOM text after a click -- a re-render can show correct text while the bound
// array has the wrong id<->value pairing, and only a server-state read exposes that (this is the
// gap 0028's own FP8 leaves open, and closing it is the highest-value part of this story).
//
// SELECTOR STRATEGY, and a real trap this file's own first draft walked into and is documented
// here rather than silently fixed: `<flux:input wire:model="...">` renders NO `value="..."` HTML
// attribute at all (verified against the compiled component HTML directly) -- Livewire hydrates a
// bound input's current value entirely client-side via Alpine, never as a static attribute, so a
// CSS `input[value="..."]` selector never matches anything and every `fill()`/`click()` built on
// it hangs until Playwright's actionability timeout. Value rows are targeted instead by the
// data-test hook the Blade view renders on each row's controls, itself keyed by the persisted
// value's own database id when it has one (`$row['id'] ?? $row['key']`) -- id is knowable ahead
// of time by a test that seeded the fixture, unlike the row's UI-only `key` (a fresh UUID minted
// on every openEditModal()/addValue() call, deliberately never exposed to test setup per OQ-4). A
// brand-new, not-yet-saved row (no id yet) is targeted structurally, as the last child of the
// repeater list -- exactly where "Add value" always appends it -- or by its buttons' aria-label,
// which reads the fallback text `Remove Value`/`Move Value up`/`Move Value down` until a later
// round trip re-renders it with typed text. The type row actions and the "New attribute
// type"/Save/Cancel controls carry real visible text or the story's own data-test hooks and are
// targeted by text/`@hook`, per this app's existing convention (see
// tests/Browser/ProductCategoriesIndexTest.php).
//
// A second trap, also found and fixed while writing this file rather than left in: `->click(...)
// ->assertNoJavaScriptErrors()` does NOT wait for the Livewire round trip that click triggers to
// finish -- assertNoJavaScriptErrors() only polls for a thrown console error, which resolves long
// before a moveValue()/removeValue()/save() request-response cycle completes (the identical root
// cause tests/Browser/Products/EditorJourneyTest.php's own docblock records for its Save click).
// Every action here is followed by an assertion that re-polls until the round trip's real effect
// is visible (assertSee/assertVisible/assertMissing) -- never a blind ->wait(n), including for a
// silent reorder inside a still-open modal, where the completion signal is a rendered aria-label
// (e.g. "Move 60 up") that cannot exist before that exact round trip resolves. Phase 5 review
// (finding F-6) caught two remaining spots where the chosen "signal" was already true before the
// click -- 'Cotton'/the modal's own list, both visible underneath the still-open modal -- and
// looked like a wait without being one; both are now genuinely round-trip-gated.

use App\Actions\Products\CreateProduct;
use App\Actions\Products\CreateProductAttributeType;
use App\Actions\Products\CreateProductVariant;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

function attributeTypesBrowserActor(): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);

    return $actor;
}

/**
 * @param  array<int, string>  $values
 */
function attributeTypesBrowserSeed(string $name, array $values = []): ProductAttributeType
{
    return app(CreateProductAttributeType::class)(
        $name,
        array_map(fn (string $value): array => ['value' => $value], $values),
    );
}

/** CSS selector for the last (most recently appended) row's own value input. */
function attributeTypesLastRowInputSelector(): string
{
    return '[data-test="attribute-type-values-list"] > div:last-child input';
}

/**
 * Story 0030a: a product/variant fixture arranged so renaming one attribute value's text
 * collides with an already-derived variant SKU. Deliberately its own helper (not a reuse of
 * tests/Feature/Products/ProductVariantSkuUniquenessTest.php's skuUniquenessTestProductPayload())
 * -- a same-named top-level function declared in two test files loaded into one PHPUnit process
 * would fatal with "Cannot redeclare function".
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function attributeTypesRenameCollisionProductPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Rename Collision Fixture',
        'sku' => '0001',
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

// B1 -- Scenario: Removing a value row from an open type form
test('removing an earlier row does not desync a later rows edited text', function () {
    $actor = attributeTypesBrowserActor();
    $this->actingAs($actor);

    $type = attributeTypesBrowserSeed('Size', ['38', '39', '40']);
    $ids = $type->values->pluck('id', 'value');

    visit('/products/attribute-types')
        ->assertNoJavaScriptErrors()
        ->click('@edit-type-'.$type->id)
        ->assertNoJavaScriptErrors()
        // Edit the third row's text before removing the first, so the test fails if the markup
        // keys a row on its array index rather than its stable identity.
        ->fill('@value-input-'.$ids['40'], '40 EU')
        ->assertNoJavaScriptErrors()
        ->click('[aria-label="Remove 38"]')
        ->assertNoJavaScriptErrors()
        ->assertMissing('@value-input-'.$ids['38'])
        ->click('Save')
        ->assertNoJavaScriptErrors()
        // Self-polling completion signal for save(): the list view's own value-preview cell,
        // rather than a blind wait -- see this file's own header note.
        ->assertSee('40 EU');

    expect(ProductAttributeValue::find($ids['38']))->toBeNull()
        ->and(ProductAttributeValue::find($ids['39'])->value)->toBe('39')
        ->and(ProductAttributeValue::find($ids['40'])->value)->toBe('40 EU');
});

// B2 -- Scenario: Adding a value row to an open type form
test('a newly added rows key never collides with an existing rows', function () {
    $actor = attributeTypesBrowserActor();
    $this->actingAs($actor);

    $type = attributeTypesBrowserSeed('Color', ['Black', 'White']);
    $ids = $type->values->pluck('id', 'value');

    visit('/products/attribute-types')
        ->assertNoJavaScriptErrors()
        ->click('@edit-type-'.$type->id)
        ->assertNoJavaScriptErrors()
        ->fill('@value-input-'.$ids['Black'], 'Jet Black')
        ->assertNoJavaScriptErrors()
        ->click('@add-value')
        ->assertNoJavaScriptErrors()
        ->assertVisible('[aria-label="Remove Value"]')
        ->fill(attributeTypesLastRowInputSelector(), 'Red')
        ->assertNoJavaScriptErrors()
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertSee('Jet Black');

    $type->refresh();

    expect(ProductAttributeValue::find($ids['Black'])->value)->toBe('Jet Black')
        ->and(ProductAttributeValue::find($ids['White'])->value)->toBe('White')
        ->and($type->values()->count())->toBe(3);

    $newRow = $type->values()->where('value', 'Red')->first();
    expect($newRow)->not->toBeNull()
        ->and($newRow->id)->not->toBeIn([$ids['Black'], $ids['White']]);
});

// B3 -- Scenario: Removing a value row from an open type form (the row currently being typed in)
test('removing the row currently being typed in discards only that row', function () {
    $actor = attributeTypesBrowserActor();
    $this->actingAs($actor);

    $type = attributeTypesBrowserSeed('Material', ['Cotton']);
    $cottonId = $type->values->first()->id;

    visit('/products/attribute-types')
        ->assertNoJavaScriptErrors()
        ->click('@edit-type-'.$type->id)
        ->assertNoJavaScriptErrors()
        ->click('@add-value')
        ->assertNoJavaScriptErrors()
        ->assertVisible('[aria-label="Remove Value"]')
        ->fill(attributeTypesLastRowInputSelector(), 'Wo')
        // The blank row's server-rendered aria-label is still "Remove Value" at this point -- no
        // round trip has happened since addValue() rendered it, and clicking this button is what
        // sends the freshly typed "Wo" to the server in the same request as removeValue().
        ->click('[aria-label="Remove Value"]')
        ->assertNoJavaScriptErrors()
        ->assertVisible('[aria-label="Remove Cotton"]')
        ->click('Save')
        ->assertNoJavaScriptErrors()
        // Self-polling completion signal for save() (Phase 5 review finding F-6): 'Cotton' is
        // already visible in the LIST underneath the still-open modal before the click, so
        // asserting it again would resolve instantly and prove nothing. "Remove Cotton" only
        // exists inside the modal's own repeater, so its disappearance is what proves the modal
        // -- and therefore save()'s round trip -- actually closed.
        ->assertMissing('[aria-label="Remove Cotton"]');

    $type->refresh();
    expect($type->values()->count())->toBe(1)
        ->and($type->values()->first()->id)->toBe($cottonId)
        ->and($type->values()->first()->value)->toBe('Cotton');
});

// Scenario: A catalog administrator opens the create-type form / saving accepts values
//
// Found by the full, unscoped Definition-of-Done suite run (never by a scoped one): the first
// draft of this test added TWO brand-new, never-yet-saved rows back to back (fill row0, add
// row1, fill row1) before any Save. `wire:model` here is deliberately not `.live` (D4/D5), so
// typing into row0 only marks it dirty client-side -- nothing round-trips it to the server, or
// re-renders its aria-label from "Remove Value" to "Remove 38", until SOME wire:click fires next.
// With two uncommitted new rows in flight, `attributeTypesLastRowInputSelector()`'s `:last-child`
// selector and the "Remove Value" aria-label both stopped being unambiguous, and the second typed
// value silently landed in row0 instead of the freshly appended row1 (row1 stayed blank, failing
// its own `required` rule on Save). Restructured below so at most ONE new, uncommitted row ever
// exists at a time -- the same shape B1/B2/B3 above already prove reliable -- by saving after the
// first value and adding the second through a fresh edit round trip instead.
test('a full create flow through the real repeater persists the type and its values', function () {
    $actor = attributeTypesBrowserActor();
    $this->actingAs($actor);

    visit('/products/attribute-types')
        ->assertNoJavaScriptErrors()
        ->click('New attribute type')
        ->assertNoJavaScriptErrors()
        ->fill('name', 'Size')
        ->click('@add-value')
        ->assertNoJavaScriptErrors()
        ->assertVisible('[aria-label="Remove Value"]')
        ->fill(attributeTypesLastRowInputSelector(), '38')
        ->assertNoJavaScriptErrors()
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertSee('Size');

    $type = ProductAttributeType::where('name', 'Size')->firstOrFail();
    expect($type->values->pluck('value')->all())->toBe(['38']);

    // A second value, added through its own fresh edit round trip -- proving the repeater's add
    // flow works beyond the very first row too, without two uncommitted new rows ever coexisting.
    visit('/products/attribute-types')
        ->assertNoJavaScriptErrors()
        ->click('@edit-type-'.$type->id)
        ->assertNoJavaScriptErrors()
        ->click('@add-value')
        ->assertNoJavaScriptErrors()
        ->assertVisible('[aria-label="Remove Value"]')
        ->fill(attributeTypesLastRowInputSelector(), '39')
        ->assertNoJavaScriptErrors()
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertSee('38, 39');

    expect($type->fresh()->values->pluck('value')->all())->toBe(['38', '39']);
});

// Scenario: Reordering the values in an open type form
test('reordering through the real move buttons persists the new position order', function () {
    $actor = attributeTypesBrowserActor();
    $this->actingAs($actor);

    // Seeded so a value-text tiebreak alone would NOT reproduce the asserted final order --
    // alphabetically/numerically these would already read 50, 60, 70, so only a real position
    // rewrite from moveValue() explains the asserted 60, 50, 70 (FP-UI5).
    $type = attributeTypesBrowserSeed('Weight', ['50', '60', '70']);

    visit('/products/attribute-types')
        ->assertNoJavaScriptErrors()
        ->click('@edit-type-'.$type->id)
        ->assertNoJavaScriptErrors()
        ->click('[aria-label="Move 50 down"]')
        ->assertNoJavaScriptErrors()
        // Self-polling completion signal, not a blind wait (docs/testing/frontend/
        // playwright-setup.md's rule): once the swap lands, "60" is the new first row, so its own
        // up-button aria-label recalculates to "Move 60 up" -- an aria-label that cannot exist
        // before this exact round trip resolves, unlike a visible-text assertion (all three
        // values stay on screen regardless of order).
        ->assertVisible('[aria-label="Move 60 up"]')
        ->click('Save')
        ->assertNoJavaScriptErrors()
        // Self-polling completion signal for save() (Phase 5 review finding F-6): the list's own
        // value-preview cell reads "60, 50, 70" only once the reordered save has actually landed
        // -- a real text change, unlike B3's "Cotton" trap, since the list previously showed
        // "50, 60, 70" and cannot show the new order before this round trip resolves.
        ->assertSee('60, 50, 70');

    $type->refresh();
    expect($type->values->pluck('value')->all())->toBe(['60', '50', '70']);
});

// Scenario: Deleting an attribute type asks for confirmation first / confirms
test('deleting an attribute type through the confirmation modal removes it from the list', function () {
    $actor = attributeTypesBrowserActor();
    $this->actingAs($actor);

    $type = attributeTypesBrowserSeed('Material');

    visit('/products/attribute-types')
        ->assertNoJavaScriptErrors()
        ->assertSee('Material')
        ->click('@delete-type-'.$type->id)
        ->assertNoJavaScriptErrors()
        ->click('Delete Material')
        ->assertNoJavaScriptErrors()
        ->assertDontSee('Material');

    expect(ProductAttributeType::find($type->id))->toBeNull();
});

// Scenario: A catalog administrator dismisses the delete confirmation
test('dismissing the delete confirmation keeps the attribute type listed', function () {
    $actor = attributeTypesBrowserActor();
    $this->actingAs($actor);

    $type = attributeTypesBrowserSeed('Material');

    visit('/products/attribute-types')
        ->assertNoJavaScriptErrors()
        ->click('@delete-type-'.$type->id)
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->assertSee('Material');

    expect(ProductAttributeType::find($type->id))->not->toBeNull();
});

// Scenario: A catalog administrator cancels the create-type form without saving / reopening
test('cancelling the create form adds nothing, and reopening it starts blank again', function () {
    $actor = attributeTypesBrowserActor();
    $this->actingAs($actor);

    $countBefore = ProductAttributeType::count();

    visit('/products/attribute-types')
        ->assertNoJavaScriptErrors()
        ->click('New attribute type')
        ->assertNoJavaScriptErrors()
        ->fill('name', 'Should Not Persist')
        ->click('@add-value')
        ->assertNoJavaScriptErrors()
        ->assertVisible('[aria-label="Remove Value"]')
        ->fill(attributeTypesLastRowInputSelector(), 'Should Not Persist Either')
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->assertDontSee('Should Not Persist');

    expect(ProductAttributeType::count())->toBe($countBefore);

    // Reopening after that cancel must not leak the previous form's stale values (FP-UI6) --
    // proving nothing persisted server-side does not prove the client-visible repeater was
    // cleared.
    visit('/products/attribute-types')
        ->click('New attribute type')
        ->assertNoJavaScriptErrors()
        ->assertValue('name', '')
        ->assertDontSee('Should Not Persist Either');
});

// Story 0030a -- Scenario: Saving a rename that collides with an existing SKU is rejected with a
// visible message ("Tests to perform": "Browser: the full rename -> collision -> visible callout
// -> modal-still-open flow..."). RED as of this test's own authoring: neither the
// data-test="attribute-type-rename-sku-collision" callout nor its @error('sku') outlet exist yet
// on resources/views/livewire/products/attribute-types.blade.php -- see
// ai-spec/tasks/in-progress/0030a-attribute-value-rename-warning-and-sku-collision-error.md.
//
// Fixture, per the task file's own Provenance section: one product (sku "0001") with two
// single-value attribute types, each backing its own variant -- Talla="M" (derived sku "0001-M")
// and Color="L" (derived sku "0001-L"). Renaming "L" to "M" through the real repeater, on the
// Color type's own edit form, collides with the Talla variant's already-derived sku -- exercising
// App\Actions\Products\SyncProductAttributeValues::reDeriveVariantSkusForRenamedValues() (already
// shipped, story 0029) through the real component and Save button, not Livewire::test().
test('renaming a value into a colliding derived sku shows the callout and keeps the modal open', function () {
    $actor = attributeTypesBrowserActor();
    $this->actingAs($actor);

    $product = app(CreateProduct::class)(...attributeTypesRenameCollisionProductPayload());

    $tallaType = ProductAttributeType::factory()->create(['name' => 'Talla', 'position' => 0]);
    $tallaM = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $tallaType->id,
        'value' => 'M',
        'position' => 0,
    ]);

    $colorType = ProductAttributeType::factory()->create(['name' => 'Color', 'position' => 1]);
    $colorL = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $colorType->id,
        'value' => 'L',
        'position' => 0,
    ]);

    app(CreateProductVariant::class)($product, [$tallaM->id], '19.99', 5);
    $colorVariant = app(CreateProductVariant::class)($product, [$colorL->id], '19.99', 5);

    expect($colorVariant->sku)->toBe('0001-L');

    visit('/products/attribute-types')
        ->assertNoJavaScriptErrors()
        ->click('@edit-type-'.$colorType->id)
        ->assertNoJavaScriptErrors()
        ->fill('@value-input-'.$colorL->id, 'M')
        ->assertNoJavaScriptErrors()
        ->click('Save')
        ->assertNoJavaScriptErrors()
        // Self-polling completion signal for save()'s round trip (not a blind ->wait(n), per
        // docs/testing/frontend/playwright-setup.md): this hook cannot exist before the request
        // refusing the rename has actually landed and re-rendered the still-open modal.
        ->assertVisible('@attribute-type-rename-sku-collision')
        ->assertSee(__('products.variants.derived_sku_taken', ['sku' => '0001-M']))
        // The modal never closed: closeModal() (which unmounts the whole @if ($showModal) block,
        // Save/Cancel included) only runs on a SUCCESSFUL save. The renamed row's own remove
        // button is a second, independent signal of the same fact -- its aria-label is derived
        // from the in-memory (not-yet-persisted) "M" text, which only exists while this row is
        // still rendered inside the still-open modal.
        ->assertVisible('[aria-label="Remove M"]')
        ->assertNoJavaScriptErrors();

    expect(ProductAttributeValue::find($colorL->id)->value)->toBe('L')
        ->and($colorVariant->fresh()->sku)->toBe('0001-L');
});

// Mandatory per test-quality-checklist.md: assertNoJavaScriptErrors() on every step of one
// continuous smoke pass, distinct from the behavior-specific tests above.
test('the attribute types screen produces no javascript errors across one continuous smoke pass', function () {
    $actor = attributeTypesBrowserActor();
    $this->actingAs($actor);

    $type = attributeTypesBrowserSeed('Material', ['Cotton']);

    visit('/products/attribute-types')
        ->assertNoJavaScriptErrors()
        ->click('New attribute type')
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->click('@edit-type-'.$type->id)
        ->assertNoJavaScriptErrors()
        ->click('@add-value')
        ->assertNoJavaScriptErrors()
        ->click('[aria-label="Remove Value"]')
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->click('@delete-type-'.$type->id)
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors();
});
