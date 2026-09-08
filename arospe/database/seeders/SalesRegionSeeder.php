<?php

namespace Database\Seeders;

use App\Enums\SalesRegionKind;
use App\Models\SalesRegion;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SalesRegionSeeder extends Seeder
{
    /**
     * The catalog's canonical default entry: mainland Spain's fiscal territory. Referenced
     * by story 0017's single-default invariant instead of restating the literal string.
     */
    public const DEFAULT_SLUG = 'es-peninsula';

    /**
     * The "España" parent row's slug -- a disclosure node, never independently rateable
     * (D10). Spain's five fiscal territories below relate to it via `parent_id`.
     */
    public const SPAIN_SLUG = 'es';

    /**
     * Spain's five fiscal territories, in real fiscal order (Península, Baleares, Canarias,
     * Ceuta, Melilla) -- not alphabetical, and unrecoverable from any other column, which is
     * exactly why `sort_order` exists. These are fiscal-domain rows with no shipping meaning
     * (PRD §2.4: "neither ISO entities nor autonomous communities"), so they do NOT live in
     * the bundled ISO fixture (database/data/iso-3166-countries.json) -- they are seeded here
     * as a `public const`, the same convention RolePermissionSeeder::MODULES uses.
     *
     * `code`: ES-IB/ES-CN/ES-CE/ES-ML are real ISO 3166-2:ES subdivisions. ES-PEN is
     * synthetic -- "Península" has no ISO subdivision code, and ES-PE was rejected because
     * PE is Peru's alpha-2. Nothing resolves by `code`, so these are starting values, not
     * contracts (see the story's Open Questions).
     *
     * `rate`: placeholder percentages standing in for IVA (Península/Baleares), IGIC
     * (Canarias) and IPSI (Ceuta/Melilla) -- real-world fiscal data that needs sign-off
     * before these numbers are treated as authoritative. Only their non-null-ness is a
     * contract this story guarantees; the story's tests deliberately assert that and
     * nothing more, so a later correction never reddens the suite.
     *
     * @var array<int, array{slug: string, name: string, code: string, rate: string, sort_order: int}>
     */
    public const SPAIN_TERRITORIES = [
        ['slug' => 'es-peninsula', 'name' => 'Península', 'code' => 'ES-PEN', 'rate' => '21.000', 'sort_order' => 1],
        ['slug' => 'es-baleares', 'name' => 'Baleares', 'code' => 'ES-IB', 'rate' => '21.000', 'sort_order' => 2],
        ['slug' => 'es-canarias', 'name' => 'Canarias', 'code' => 'ES-CN', 'rate' => '7.000', 'sort_order' => 3],
        ['slug' => 'es-ceuta', 'name' => 'Ceuta', 'code' => 'ES-CE', 'rate' => '10.000', 'sort_order' => 4],
        ['slug' => 'es-melilla', 'name' => 'Melilla', 'code' => 'ES-ML', 'rate' => '10.000', 'sort_order' => 5],
    ];

    /**
     * Run the database seeds.
     *
     * Two column sets, two re-seed behaviours -- the heart of this story:
     *
     * - Seeder-owned (`slug`, `name`, `parent_id`, `kind`, `sort_order`) are ALWAYS
     *   written/refreshed, even on an existing row -- this is what lets a corrected
     *   canonical name reach an already-deployed install.
     * - Administrator-configurable (`code`, `description`, `rate`, `is_active`,
     *   `is_default`) are written ONLY on insert, and are NEVER touched on update.
     *   `upsert()`/`updateOrCreate()` with a full payload are forbidden here for exactly
     *   this reason -- they would reset every administrator's configured rate, code,
     *   description and flags to seed values on the very next deploy.
     */
    public function run(): void
    {
        $countries = $this->loadIsoCountries();

        DB::transaction(function () use ($countries): void {
            // One preload query -- the loop below issues no per-row SELECT.
            $existing = SalesRegion::query()->get()->keyBy('slug');

            foreach ($countries as $country) {
                $this->writeRegion($existing, [
                    'slug' => strtolower($country['alpha2']),
                    'name' => $country['name_es'],
                    'code' => $country['alpha2'],
                    'kind' => SalesRegionKind::Country,
                    'parent_id' => null,
                    'sort_order' => 0,
                    'is_active' => $country['alpha2'] === 'ES',
                    'rate' => null,
                ]);
            }

            // Parent before children -- the FK on `es-*` rows below rejects them otherwise.
            // Resolve the parent by slug lookup (not a variable held across the loop above),
            // since a partial re-seed may already have created `es`.
            $spain = $existing->get(self::SPAIN_SLUG) ?? SalesRegion::query()->where('slug', self::SPAIN_SLUG)->first();

            // Fail loudly rather than silently commit a broken catalog: a null $spain would
            // write `parent_id = null` on every fiscal territory below, violating
            // SalesRegionKind's own invariant (FiscalTerritory <=> parent_id IS NOT NULL) and
            // defeating the migration's restrictOnDelete() FK protection.
            throw_if(
                $spain === null,
                RuntimeException::class,
                'The ISO fixture is missing the ['.self::SPAIN_SLUG.'] entry; Spain\'s fiscal territories have no parent to bind to.',
            );

            foreach (self::SPAIN_TERRITORIES as $territory) {
                $this->writeRegion($existing, [
                    'slug' => $territory['slug'],
                    'name' => $territory['name'],
                    'code' => $territory['code'],
                    'kind' => SalesRegionKind::FiscalTerritory,
                    'parent_id' => $spain->id,
                    'sort_order' => $territory['sort_order'],
                    'is_active' => true,
                    'rate' => $territory['rate'],
                ]);
            }

            // Default flag: repair-only, and only when nothing is flagged default at all --
            // never move an administrator's own choice back. A zero-row update would silently
            // ship the catalog with no default tier at all, so that outcome must throw too.
            if (SalesRegion::query()->where('is_default', true)->doesntExist()) {
                $repaired = SalesRegion::query()->where('slug', self::DEFAULT_SLUG)->update(['is_default' => true]);

                throw_if(
                    $repaired !== 1,
                    RuntimeException::class,
                    'No row matched the default slug ['.self::DEFAULT_SLUG.']; the catalog would ship with no default.',
                );
            }
        });

        // Seeder::$command is uninitialized (null) when invoked without an Artisan command
        // in context (e.g. directly from a test), matching RolePermissionSeeder's own
        // defensive nullsafe call.
        // @phpstan-ignore nullsafe.neverNull
        $this->command?->info('Sales Region catalog seeded: '.SalesRegion::count().' entries.');
    }

    /**
     * Insert a new Sales Region row, or refresh only the seeder-owned columns of an
     * existing one. The administrator-configurable columns (`code`, `description`, `rate`,
     * `is_active`, `is_default`) are set here only on the insert branch;forceFill() is
     * required because every one of these columns is deliberately absent from
     * SalesRegion's #[Fillable] list.
     *
     * @param  Collection<string, SalesRegion>  $existing
     * @param  array{slug: string, name: string, code: string, kind: SalesRegionKind, parent_id: string|null, sort_order: int, is_active: bool, rate: string|null}  $attributes
     */
    protected function writeRegion(Collection $existing, array $attributes): void
    {
        $region = $existing->get($attributes['slug']);

        if ($region === null) {
            $region = new SalesRegion;
            $region->forceFill([
                'slug' => $attributes['slug'],
                'name' => $attributes['name'],
                'code' => $attributes['code'],
                'kind' => $attributes['kind'],
                'parent_id' => $attributes['parent_id'],
                'sort_order' => $attributes['sort_order'],
                'is_active' => $attributes['is_active'],
                'is_default' => false,
                'rate' => $attributes['rate'],
                'description' => null,
            ])->save();

            $existing->put($attributes['slug'], $region);

            return;
        }

        // Seeder-owned columns only -- `name` is intentionally overwritten every run, which
        // is how a corrected canonical name reaches an already-deployed install. The
        // administrator-configurable columns above are deliberately absent from this list.
        $region->forceFill([
            'name' => $attributes['name'],
            'parent_id' => $attributes['parent_id'],
            'kind' => $attributes['kind'],
            'sort_order' => $attributes['sort_order'],
        ])->save();
    }

    /**
     * Load the bundled ISO 3166-1 fixture. A missing or corrupt fixture must fail loudly,
     * never seed a partial catalog.
     *
     * @return array<int, array{alpha2: string, name_es: string, name_en: string}>
     */
    protected function loadIsoCountries(): array
    {
        $path = database_path('data/iso-3166-countries.json');

        throw_if(
            ! is_file($path),
            RuntimeException::class,
            "Missing ISO 3166 country fixture at [{$path}].",
        );

        $contents = file_get_contents($path);

        throw_if(
            $contents === false,
            RuntimeException::class,
            "Unable to read the ISO 3166 country fixture at [{$path}].",
        );

        $decoded = json_decode($contents, associative: true, flags: JSON_THROW_ON_ERROR);

        $this->assertValidCountryFixture($decoded, $path);

        /** @var array<int, array{alpha2: string, name_es: string, name_en: string}> $decoded */
        return $decoded;
    }

    /**
     * Guard the decoded fixture's shape at runtime -- the `@var` annotation on the caller
     * is trusted by Larastan but never checked when the JSON is actually loaded, so a
     * malformed entry (missing key, wrong type, lowercase alpha2) would otherwise fail with
     * an opaque error deep inside the transaction instead of a clear, actionable message.
     * The alpha2 format check also rejects a lowercase code, which would otherwise cause a
     * case-insensitive slug collision later (see the story's F2 finding).
     */
    protected function assertValidCountryFixture(mixed $decoded, string $path): void
    {
        throw_if(
            ! is_array($decoded) || ! array_is_list($decoded) || $decoded === [],
            RuntimeException::class,
            "The ISO 3166 fixture at [{$path}] is not a non-empty JSON list.",
        );

        foreach ($decoded as $i => $entry) {
            throw_if(
                ! is_array($entry)
                || ! isset($entry['alpha2'], $entry['name_es'])
                || ! is_string($entry['alpha2'])
                || preg_match('/^[A-Z]{2}$/', $entry['alpha2']) !== 1
                || ! is_string($entry['name_es']) || $entry['name_es'] === '',
                RuntimeException::class,
                "Malformed ISO 3166 fixture entry at index [{$i}] in [{$path}].",
            );
        }
    }
}
