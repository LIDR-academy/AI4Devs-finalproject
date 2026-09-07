<?php

use App\Actions\Shipping\CreateShippingZone;
use App\Models\ShippingZone;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// Story 0033, Phase 3 (TDD "red" step): App\Models\ShippingZone,
// App\Actions\Shipping\CreateShippingZone, the shipping_zones migration and
// App\Concerns\ShippingZoneValidationRules do not exist yet. Every test in this file is expected
// to fail (class/table not found) until backend-expert/database-expert implement them in the next
// step of the TDD cycle -- that is the correct, intended "red" outcome.
//
// Corrected at Phase 4 security audit (finding F-1): this banner previously claimed the four
// app/Actions/Shipping/ actions "deliberately self-authorize NOTHING, matching
// App\Actions\Users\CreateUser/UpdateUser" -- that citation was FALSE (CreateUser/UpdateUser both
// self-authorize as their own first statement). CreateShippingZone now authorizes `create` on
// ShippingZone::class as its own first statement, the identical self-authorizing shape
// App\Actions\ProductCategories\CreateProductCategory (story 0025) already uses -- see
// CreateShippingZone's own corrected docblock. Every test below now runs actingAs() an actor
// holding `shipping.create`, matching
// tests/Feature/ProductCategories/CreateProductCategoryTest.php's identical fix, or the call
// throws AuthorizationException before validation ever runs.
//
// Every assertion goes through the ACTION directly (`app(CreateShippingZone::class)(...)`), never
// a Livewire component -- D-8 is explicit this story ships no screen at all.

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->actor = User::factory()->create();
    $this->actor->givePermissionTo('shipping.create');
    $this->actingAs($this->actor);
});

test('a valid name persists exactly one row with that name and populates both timestamps', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');

    expect(ShippingZone::where('name', 'Zona Norte')->count())->toBe(1);

    $fresh = $zone->fresh();

    expect($fresh->name)->toBe('Zona Norte')
        ->and($fresh->created_at)->not->toBeNull()
        ->and($fresh->updated_at)->not->toBeNull();
});

test('a blank name is refused with a ValidationException on name and writes no row', function () {
    $caught = null;

    try {
        app(CreateShippingZone::class)('');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('name');

    expect(ShippingZone::count())->toBe(0);
});

// Highest-value single case in the file (task's own words): Laravel's `required` treats a string
// of spaces as PRESENT, so a bare ['required', 'string', 'max:150'] rule set lets a whitespace-
// only name validate and persist. This proves the trim runs BEFORE validation, not after.
test('a whitespace-only name is refused', function () {
    $caught = null;

    try {
        app(CreateShippingZone::class)('   ');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(ShippingZone::count())->toBe(0);
});

// Without a trim, 'Zona Norte' and '  Zona Norte  ' would be two rows indistinguishable to a
// human that do not collide as duplicates -- assert the exact PERSISTED value, not merely "no
// error".
test('a name with leading and trailing whitespace is stored trimmed', function () {
    $zone = app(CreateShippingZone::class)('  Zona Norte  ');

    expect($zone->fresh()->name)->toBe('Zona Norte');
});

// The migration length (150, per D-6/OQ-D) and the validation max: must stay in lockstep. Written
// as a pair so a future length change (should OQ-D resolve differently) forces both sides to move
// together, per the story's own R-4-style constant-derivation rule.
test('a name of exactly the maximum length (150) is accepted', function () {
    $name = str_repeat('a', CreateShippingZone::MAX_NAME_LENGTH);

    $zone = app(CreateShippingZone::class)($name);

    expect($zone->fresh()->name)->toBe($name);
});

test('a name one character over the maximum length (151) is refused', function () {
    $name = str_repeat('a', CreateShippingZone::MAX_NAME_LENGTH + 1);

    $caught = null;

    try {
        app(CreateShippingZone::class)($name);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(ShippingZone::count())->toBe(0);
});

test('a duplicate name is refused at the validation layer, never as a QueryException', function () {
    app(CreateShippingZone::class)('Zona Norte');

    $caught = null;

    try {
        app(CreateShippingZone::class)('Zona Norte');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('name');

    expect(ShippingZone::where('name', 'Zona Norte')->count())->toBe(1);
});

// D-6: pins the fold-at-least-as-hard-as-utf8mb4_unicode_ci rule -- without it, a normaliser
// folding only case (or only accents) would let PHP accept one of these pairs and hand the
// refusal to the index as a raw 23000, which the dataset's shared assertion below would catch as
// a wrong exception class.
test('a case-only or accent-only duplicate name is refused by validation, never as a QueryException', function (string $duplicateName) {
    app(CreateShippingZone::class)('Península');

    $caught = null;

    try {
        app(CreateShippingZone::class)($duplicateName);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('name');

    expect(ShippingZone::count())->toBe(1);
})->with([
    'lowercase, no accent' => ['península'],
    'uppercase with accent' => ['PENÍNSULA'],
    'titlecase, no accent' => ['Peninsula'],
]);

// R-2/D-6: the exception CLASS is the whole point of this test -- drives the collision through
// the REAL MySQL unique index rather than a hand-written assertion about the catch block. A
// DB::listen() callback fires the instant the action's OWN uniqueness check issues its first
// query touching `shipping_zones` -- necessarily before the action's real INSERT -- and inserts
// the colliding row directly via the query builder at that exact moment, bypassing the action's
// PHP-level validation entirely. This reproduces two concurrent creates that both pass
// validation, which is exactly what the `23000` catch (not the pre-flight validation rule) exists
// to catch -- the same technique docs/security/signed-link-verification.md's "a pre-flight check
// is not a race guard" section documents for `users.pending_email`.
test('a duplicate that bypasses validation via a simulated race surfaces as a ValidationException on name, not a 500', function () {
    $name = 'Race Condition Zone';
    $raced = false;

    DB::listen(function ($query) use (&$raced, $name): void {
        if ($raced || ! str_contains($query->sql, 'shipping_zones')) {
            return;
        }

        $raced = true;

        DB::table('shipping_zones')->insert([
            'id' => (string) Str::uuid7(),
            'name' => $name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    $caught = null;

    try {
        app(CreateShippingZone::class)($name);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($raced)->toBeTrue()
        ->and($caught)->toBeInstanceOf(ValidationException::class);

    // Whatever happened to the racer row (it may or may not survive a wrapping transaction's
    // rollback, depending on implementation), the action's own create must never have produced a
    // second row -- exactly one or zero rows named "Race Condition Zone" may exist, never two.
    expect(ShippingZone::where('name', $name)->count())->toBeLessThan(2);
});

// Guards a create path that helpfully attaches something -- CreateShippingZone takes a name only
// (D-4: membership is a separate operation, via SyncShippingZoneGeography).
test('a newly created zone has no geography memberships', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');

    expect($zone->geographyEntries()->count())->toBe(0);
});
