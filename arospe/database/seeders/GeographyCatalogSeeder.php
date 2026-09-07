<?php

namespace Database\Seeders;

use App\Actions\NormalizeForSearch;
use App\Enums\GeographyLevel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use SplFileObject;

/**
 * Deliberately no constructor-injected `NormalizeForSearch` on this class,
 * unlike an action's usual shape (code-style.md's default). `Seeder::resolve()`
 * falls back to a bare `new $class` whenever the calling seeder has no
 * container attached -- exactly what `tests/Feature/Seeders/DatabaseSeederTest.php`
 * does throughout (`(new DatabaseSeeder)()`, cascading through
 * `$this->call(GeographyCatalogSeeder::class)`), so a required constructor
 * argument here would fatal every one of those tests. `app(NormalizeForSearch::class)`
 * is used at each call site instead -- the `app()` exception's shape once
 * more: `run()`'s own parameter list is fixed by `Seeder::__invoke()`, not
 * by this class.
 */
class GeographyCatalogSeeder extends Seeder
{
    /**
     * Batch size for every chunked write below. Chosen to stay well under
     * MySQL's `max_allowed_packet` at this table's row width -- see
     * docs/database/migrations.md for the reasoning this mirrors.
     */
    public const CHUNK_SIZE = 500;

    /**
     * Seed the three-level geography catalog: every ISO country, Spain's 17
     * comunidades autónomas, and every municipio in the bundled INE fixture.
     *
     * The whole run is one transaction: a missing/malformed fixture or a
     * duplicate natural key must leave the table exactly as it was, never a
     * half-populated catalog. This does not defeat the chunked-write memory
     * goal -- only the PHP-side row buffer needs to stay O(1); the
     * surrounding transaction costs nothing extra in memory.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $countryIds = $this->seedCountries();

            $spainId = $countryIds['ES'] ?? null;

            throw_if(
                $spainId === null,
                RuntimeException::class,
                'The ISO country fixture is missing the [ES] entry; Spain\'s comunidades autónomas have no parent to bind to.',
            );

            $communityIds = $this->seedCommunities($spainId);
            $municipalityCount = $this->seedMunicipalities($communityIds);

            // Seeder::$command is uninitialized (null) when invoked without an Artisan
            // command in context (e.g. directly from a test), matching
            // RolePermissionSeeder's/SalesRegionSeeder's own defensive nullsafe call.
            // @phpstan-ignore nullsafe.neverNull
            $this->command?->info(
                'Geography catalog seeded: '.count($countryIds).' countries, '
                .count($communityIds).' comunidades autónomas, '.$municipalityCount.' municipios.'
            );
        });
    }

    /**
     * Insert or refresh every country row from the bundled ISO 3166 fixture
     * (shared, read-only, with story 0016's `SalesRegionSeeder`).
     *
     * @return array<string, int> alpha2 => geography_entries.id
     */
    protected function seedCountries(): array
    {
        $path = $this->fixturePath('iso-3166-countries.json');

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

        throw_if(
            ! is_array($decoded) || ! array_is_list($decoded) || $decoded === [],
            RuntimeException::class,
            "The ISO 3166 fixture at [{$path}] is not a non-empty JSON list.",
        );

        $now = now();
        $rows = [];
        $seenAlpha2 = [];

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

            $alpha2 = $entry['alpha2'];

            throw_if(
                isset($seenAlpha2[$alpha2]),
                RuntimeException::class,
                "Duplicate ISO 3166 code [{$alpha2}] in [{$path}]; refusing to seed a corrupt catalog.",
            );
            $seenAlpha2[$alpha2] = true;

            $name = $entry['name_es'];

            $rows[] = [
                'level' => GeographyLevel::Country->value,
                'parent_id' => null,
                'name' => $name,
                'normalized_name' => app(NormalizeForSearch::class)($name),
                'ine_code' => null,
                'iso_alpha2' => $alpha2,
                'province_name' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $this->upsertChunked($rows, ['iso_alpha2']);

        /** @var array<string, int> $ids */
        $ids = DB::table('geography_entries')
            ->where('level', GeographyLevel::Country->value)
            ->whereIn('iso_alpha2', array_keys($seenAlpha2))
            ->pluck('id', 'iso_alpha2')
            ->all();

        return $ids;
    }

    /**
     * Insert or refresh Spain's 17 comunidades autónomas, derived by
     * de-duplicating `(community_ine_code, community_name)` while streaming
     * the municipality fixture -- there is no separate comunidades file to
     * keep in sync with it.
     *
     * @return array<string, int> community_ine_code => geography_entries.id
     */
    protected function seedCommunities(int $spainId): array
    {
        $path = $this->fixturePath('es-municipalities.csv');

        $communities = [];

        foreach ($this->readMunicipalityRows($path) as $row) {
            $code = $row['community_ine_code'];

            $name = $row['community_name'];

            if (isset($communities[$code])) {
                // Phase 4 finding F-2: a conflicting name for an already-seen community
                // code used to be silently first-wins. Refuse instead, matching the
                // duplicate-ine_code/duplicate-alpha2 guards elsewhere in this class.
                throw_if(
                    $communities[$code] !== $name,
                    RuntimeException::class,
                    "Comunidad autónoma code [{$code}] maps to conflicting names [{$communities[$code]}] and [{$name}] in [{$path}]; refusing to seed a corrupt catalog.",
                );
            } else {
                $communities[$code] = $name;
            }
        }

        $now = now();
        $rows = [];

        foreach ($communities as $code => $name) {
            $rows[] = [
                'level' => GeographyLevel::Community->value,
                'parent_id' => $spainId,
                'name' => $name,
                'normalized_name' => app(NormalizeForSearch::class)($name),
                'ine_code' => $code,
                'iso_alpha2' => null,
                'province_name' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $this->upsertChunked($rows, ['ine_code']);

        /** @var array<string, int> $ids */
        $ids = DB::table('geography_entries')
            ->where('level', GeographyLevel::Community->value)
            ->whereIn('ine_code', array_keys($communities))
            ->pluck('id', 'ine_code')
            ->all();

        return $ids;
    }

    /**
     * Insert or refresh every municipio row, in chunks of {@see CHUNK_SIZE},
     * parented to the comunidad autónoma resolved by {@see seedCommunities()}.
     *
     * @param  array<string, int>  $communityIds
     */
    protected function seedMunicipalities(array $communityIds): int
    {
        $path = $this->fixturePath('es-municipalities.csv');

        $now = now();
        $chunk = [];
        $seenIneCodes = [];
        $total = 0;

        foreach ($this->readMunicipalityRows($path) as $row) {
            $ineCode = $row['ine_code'];

            throw_if(
                isset($seenIneCodes[$ineCode]),
                RuntimeException::class,
                "Duplicate INE code [{$ineCode}] in [{$path}]; refusing to seed a corrupt catalog.",
            );
            $seenIneCodes[$ineCode] = true;

            $communityId = $communityIds[$row['community_ine_code']] ?? null;

            throw_if(
                $communityId === null,
                RuntimeException::class,
                "Municipio [{$ineCode}] in [{$path}] references unknown comunidad autónoma code [{$row['community_ine_code']}].",
            );

            $chunk[] = [
                'level' => GeographyLevel::Municipality->value,
                'parent_id' => $communityId,
                'name' => $row['name'],
                'normalized_name' => app(NormalizeForSearch::class)($row['name']),
                'ine_code' => $ineCode,
                'iso_alpha2' => null,
                'province_name' => $row['province_name'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
            $total++;

            if (count($chunk) >= self::CHUNK_SIZE) {
                $this->upsertChunked($chunk, ['ine_code']);
                $chunk = [];
            }
        }

        if ($chunk !== []) {
            $this->upsertChunked($chunk, ['ine_code']);
        }

        return $total;
    }

    /**
     * Stream the municipality CSV, yielding one associative row per line
     * with O(1) memory -- never the whole file decoded into an array.
     *
     * A missing file, a row with the wrong column count, a row missing its
     * INE code, or a row whose `ine_code`/`community_ine_code` does not
     * match its expected digit-count shape aborts the whole seed (via the
     * exception propagating out of the enclosing transaction in
     * {@see run()}) rather than silently skipping or writing a partial row.
     *
     * @return iterable<int, array{ine_code: string, name: string, province_name: string, community_ine_code: string, community_name: string}>
     */
    protected function readMunicipalityRows(string $path): iterable
    {
        throw_if(
            ! is_file($path),
            RuntimeException::class,
            "Missing shipping geography municipality fixture at [{$path}].",
        );

        $file = new SplFileObject($path);
        $file->setFlags(SplFileObject::READ_CSV | SplFileObject::SKIP_EMPTY | SplFileObject::DROP_NEW_LINE);
        // Explicit escape char (PHP 8.5 deprecates the implicit default) -- '\\' matches
        // fgetcsv()'s own historical default, and nothing in this fixture uses it.
        $file->setCsvControl(escape: '\\');

        /** @var list<string>|false $header */
        $header = $file->fgetcsv();

        $expected = ['ine_code', 'name', 'province_name', 'community_ine_code', 'community_name'];

        throw_if(
            $header !== $expected,
            RuntimeException::class,
            "The municipality fixture at [{$path}] does not start with the expected header row.",
        );

        $lineNumber = 1;

        while (! $file->eof()) {
            $lineNumber++;
            /** @var list<string|null>|null|false $row */
            $row = $file->fgetcsv();

            if ($row === null || $row === false || $row === [null]) {
                continue;
            }

            throw_if(
                count($row) !== count($expected),
                RuntimeException::class,
                "Malformed row at line [{$lineNumber}] in [{$path}]: expected ".count($expected).' columns, got '.count($row).'.',
            );

            /** @var array{ine_code: string|null, name: string|null, province_name: string|null, community_ine_code: string|null, community_name: string|null} $associative */
            $associative = array_combine($expected, $row);

            throw_if(
                ! is_string($associative['ine_code']) || trim($associative['ine_code']) === '',
                RuntimeException::class,
                "Row at line [{$lineNumber}] in [{$path}] is missing its INE code.",
            );

            throw_if(
                ! is_string($associative['name']) || trim($associative['name']) === ''
                || ! is_string($associative['province_name'])
                || ! is_string($associative['community_ine_code']) || trim($associative['community_ine_code']) === ''
                || ! is_string($associative['community_name']) || trim($associative['community_name']) === '',
                RuntimeException::class,
                "Row at line [{$lineNumber}] in [{$path}] is missing a required field.",
            );

            // Phase 4 finding F-1: `ine_code` is UNIQUE per column, not per level (see the
            // migration), and upsertChunked()'s update list rewrites `level`/`parent_id` on
            // any unique-key collision. Without a format check, a municipio row carrying a
            // 2-digit code could silently overwrite a comunidad row as a municipality,
            // orphaning every municipio parented to it. Mirrors seedCountries()'s own
            // preg_match guard on `alpha2`.
            throw_if(
                preg_match('/^\d{5}$/', $associative['ine_code']) !== 1,
                RuntimeException::class,
                "Row at line [{$lineNumber}] in [{$path}] has a malformed INE code [{$associative['ine_code']}]; expected 5 digits.",
            );

            throw_if(
                preg_match('/^\d{2}$/', $associative['community_ine_code']) !== 1,
                RuntimeException::class,
                "Row at line [{$lineNumber}] in [{$path}] has a malformed comunidad autónoma INE code [{$associative['community_ine_code']}]; expected 2 digits.",
            );

            /** @var array{ine_code: string, name: string, province_name: string, community_ine_code: string, community_name: string} $associative */
            yield $associative;
        }
    }

    /**
     * Write one chunk with `upsert()` keyed on the natural key -- the
     * idempotency strategy chosen over truncate-and-reload specifically
     * because of story 0033: once the future zone pivot carries FKs into
     * this table, a TRUNCATE would either fail outright or orphan every
     * zone assignment.
     *
     * @param  list<array<string, mixed>>  $rows
     * @param  non-empty-list<non-empty-string>  $uniqueBy
     */
    protected function upsertChunked(array $rows, array $uniqueBy): void
    {
        if ($rows === []) {
            return;
        }

        foreach (array_chunk($rows, self::CHUNK_SIZE) as $chunk) {
            DB::table('geography_entries')->upsert(
                $chunk,
                $uniqueBy,
                ['level', 'parent_id', 'name', 'normalized_name', 'province_name', 'updated_at'],
            );
        }
    }

    /**
     * The bundled fixture's path, overridable so a test can point the
     * seeder at a smaller file without seeding the whole ~8,300-row real
     * catalog. Defaults to `database/data/{$file}` -- the same directory
     * `SalesRegionSeeder` already reads its own ISO fixture from.
     */
    protected function fixturePath(string $file): string
    {
        return database_path("data/{$file}");
    }
}
