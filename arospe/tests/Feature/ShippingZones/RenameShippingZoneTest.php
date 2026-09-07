<?php

use App\Actions\Shipping\CreateShippingZone;
use App\Actions\Shipping\RenameShippingZone;
use App\Models\GeographyEntry;
use App\Models\ShippingZone;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// Story 0033, Phase 3 (TDD "red" step) -- see CreateShippingZoneTest.php's file banner; the same
// applies here. App\Actions\Shipping\RenameShippingZone::__invoke(ShippingZone $shippingZone,
// string $name): ShippingZone does not exist yet.
//
// Corrected at Phase 4 security audit (finding F-1) -- see CreateShippingZoneTest.php's own
// corrected banner. RenameShippingZone now authorizes `update` on $shippingZone as its own first
// statement, so every test below runs actingAs() an actor holding both `shipping.create` (used
// here only to set up fixtures via CreateShippingZone) and `shipping.edit`, matching
// tests/Feature/ProductCategories/RenameProductCategoryTest.php's identical fix.

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->actor = User::factory()->create();
    $this->actor->givePermissionTo(['shipping.create', 'shipping.edit']);
    $this->actingAs($this->actor);
});

test('renaming to a free name updates the row and leaves the old name unused', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');

    $renamed = app(RenameShippingZone::class)($zone, 'Cornisa Cantábrica');

    expect($renamed->fresh()->name)->toBe('Cornisa Cantábrica')
        ->and(ShippingZone::where('name', 'Zona Norte')->exists())->toBeFalse();
});

test("renaming onto another zone's name is refused and the target keeps its original name", function () {
    app(CreateShippingZone::class)('Zona Norte');
    $asturias = app(CreateShippingZone::class)('Asturias Centro');

    $caught = null;

    try {
        app(RenameShippingZone::class)($asturias, 'Zona Norte');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect($asturias->fresh()->name)->toBe('Asturias Centro');
});

// R-2: the single most likely bug in this story -- the missing ->ignore() trap. Written as THREE
// tests, not one, so a rule that rejects everything cannot pass the first trivially.

test('saving a zone under its own current name (a no-op rename) succeeds', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');

    $result = app(RenameShippingZone::class)($zone, 'Zona Norte');

    expect($result)->not->toBeNull();
});

test('after a no-op rename to the identical name, the row is genuinely unchanged', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');

    app(RenameShippingZone::class)($zone, 'Zona Norte');

    expect(ShippingZone::where('name', 'Zona Norte')->count())->toBe(1)
        ->and($zone->fresh()->id)->toBe($zone->id)
        ->and($zone->fresh()->name)->toBe('Zona Norte');
});

test('a genuinely free name is still accepted when renaming, as the control for the no-op case above', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');

    $renamed = app(RenameShippingZone::class)($zone, 'Cornisa Cantábrica');

    expect($renamed->fresh()->name)->toBe('Cornisa Cantábrica');
});

// R-7: the validation rules helper reused asymmetrically -- an id threaded through one call site
// and not the other fails silently in one direction only. Full validation depth (blank/
// whitespace-only/boundary pair) re-asserted independently on the rename path here, never assumed
// symmetric with create.

test('renaming to a blank name is refused and the zone keeps its original name', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');

    $caught = null;

    try {
        app(RenameShippingZone::class)($zone, '');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('name');

    expect($zone->fresh()->name)->toBe('Zona Norte');
});

test('renaming to a whitespace-only name is refused and the zone keeps its original name', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');

    $caught = null;

    try {
        app(RenameShippingZone::class)($zone, '   ');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect($zone->fresh()->name)->toBe('Zona Norte');
});

test('renaming to a name of exactly the maximum length (150) is accepted', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $name = str_repeat('b', CreateShippingZone::MAX_NAME_LENGTH);

    $renamed = app(RenameShippingZone::class)($zone, $name);

    expect($renamed->fresh()->name)->toBe($name);
});

test('renaming to a name one character over the maximum length (151) is refused', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $name = str_repeat('b', CreateShippingZone::MAX_NAME_LENGTH + 1);

    $caught = null;

    try {
        app(RenameShippingZone::class)($zone, $name);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect($zone->fresh()->name)->toBe('Zona Norte');
});

// R-2/D-6, rename path: mirrors CreateShippingZoneTest's identical race test, driving the
// collision through the real unique index rather than a hand-written assertion about the catch
// block -- proves RenameShippingZone's own 23000 catch independently of CreateShippingZone's,
// rather than assuming the two actions share the same behaviour.
test('a duplicate that bypasses validation via a simulated race surfaces as a ValidationException on name when renaming, not a 500', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $racedName = 'Race Condition Rename';
    $raced = false;

    DB::listen(function ($query) use (&$raced, $racedName): void {
        if ($raced || ! str_contains($query->sql, 'shipping_zones')) {
            return;
        }

        $raced = true;

        DB::table('shipping_zones')->insert([
            'id' => (string) Str::uuid7(),
            'name' => $racedName,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    $caught = null;

    try {
        app(RenameShippingZone::class)($zone, $racedName);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($raced)->toBeTrue()
        ->and($caught)->toBeInstanceOf(ValidationException::class);

    expect(ShippingZone::where('name', $racedName)->count())->toBeLessThan(2);
});

// Renaming must never touch the zone's geography memberships -- assert count AND exact ids, so a
// rename that (wrongly) re-derives the pivot rows (rather than leaving them alone) is caught even
// if it happens to leave the count unchanged.
test("renaming leaves the zone's geography memberships untouched, by count and by exact ids", function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $gijon = GeographyEntry::factory()->municipality(
        GeographyEntry::factory()->community(GeographyEntry::factory()->create())->create()
    )->create();
    $aviles = GeographyEntry::factory()->municipality(
        GeographyEntry::factory()->community(GeographyEntry::factory()->create())->create()
    )->create();

    $zone->geographyEntries()->attach([$gijon->id, $aviles->id]);

    app(RenameShippingZone::class)($zone, 'Cornisa Cantábrica');

    $ids = $zone->geographyEntries()->pluck('geography_entries.id')->sort()->values()->all();

    expect($ids)->toBe(collect([$gijon->id, $aviles->id])->sort()->values()->all());
});
