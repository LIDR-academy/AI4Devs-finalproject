<?php

namespace Tests\Support\Seeders;

use Database\Seeders\GeographyCatalogSeeder;

/**
 * A `GeographyCatalogSeeder` whose fixture paths can be redirected to the
 * small fixtures under `tests/Fixtures/geography/` -- this is what
 * `GeographyCatalogSeeder::fixturePath()`'s override hook exists for (see
 * the story's own hard design requirement): without it, testing the seeder
 * in isolation means either seeding all ~8,300 real rows on every
 * `RefreshDatabase` test, or not testing it at all.
 *
 * Resolved through `$this->seed(TestableGeographyCatalogSeeder::class)`,
 * which goes through the `db:seed` Artisan command and therefore a fresh
 * container-resolved instance -- these overrides are static so a test can
 * set them before calling `seed()` and the instance the command builds
 * still sees them.
 */
class TestableGeographyCatalogSeeder extends GeographyCatalogSeeder
{
    public static ?string $municipalityFixture = null;

    public static ?string $countryFixture = null;

    /**
     * Reset both overrides back to "use the real bundled fixture" -- call
     * this in a test's `afterEach()`/teardown so one test's override can
     * never leak into the next.
     */
    public static function reset(): void
    {
        self::$municipalityFixture = null;
        self::$countryFixture = null;
    }

    protected function fixturePath(string $file): string
    {
        return match ($file) {
            'es-municipalities.csv' => self::$municipalityFixture ?? parent::fixturePath($file),
            'iso-3166-countries.json' => self::$countryFixture ?? parent::fixturePath($file),
            default => parent::fixturePath($file),
        };
    }
}
