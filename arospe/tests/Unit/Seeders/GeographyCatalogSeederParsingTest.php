<?php

use Database\Seeders\GeographyCatalogSeeder;

// Row/column parsing, comma and quote handling, and duplicate-code detection --
// exercised directly against GeographyCatalogSeeder::readMunicipalityRows() (via
// reflection, since it is protected and this is the CSV-parsing helper's real home) with
// no database at all: the method is a pure generator over a file on disk.
//
// tests/Unit is NOT bound to Tests\TestCase in tests/Pest.php, so the container behind
// app()/base_path() here is a bare Illuminate\Container\Container, not the full booted
// Application -- base_path()/database_path() throw "Call to undefined method ...
// basePath()" in this context. Fixture paths are built from __DIR__ instead.
function geographyFixturesPath(string $file): string
{
    return dirname(__DIR__, 2).'/Fixtures/geography/'.$file;
}

function readMunicipalityRowsFor(string $path): array
{
    $seeder = app(GeographyCatalogSeeder::class);

    // No setAccessible(true) -- deprecated as a no-op since PHP 8.1; ReflectionMethod can
    // invoke a protected method directly since PHP 8.1 without it.
    $method = new ReflectionMethod($seeder, 'readMunicipalityRows');

    return iterator_to_array($method->invoke($seeder, $path), preserve_keys: false);
}

test('a well-formed CSV parses one row per data line with all five columns', function () {
    $rows = readMunicipalityRowsFor(geographyFixturesPath('es-municipalities-small.csv'));

    expect($rows)->not->toBeEmpty();

    foreach (array_slice($rows, 0, 5) as $row) {
        expect($row)->toHaveKeys(['ine_code', 'name', 'province_name', 'community_ine_code', 'community_name']);
    }
});

test('a field containing a comma is parsed as a single field, not split', function () {
    $rows = readMunicipalityRowsFor(geographyFixturesPath('es-municipalities-quoting.csv'));

    expect($rows)->toHaveCount(2)
        ->and($rows[0]['name'])->toBe('Test, Comma Name');
});

test('a field containing embedded quotes is parsed correctly', function () {
    $rows = readMunicipalityRowsFor(geographyFixturesPath('es-municipalities-quoting.csv'));

    expect($rows[1]['name'])->toBe('Test "Quoted" Name');
});

test('a row missing its INE code throws before yielding it', function () {
    expect(fn () => readMunicipalityRowsFor(geographyFixturesPath('es-municipalities-malformed.csv')))
        ->toThrow(RuntimeException::class);
});

test('a missing file throws naming the missing path', function () {
    $missing = geographyFixturesPath('does-not-exist.csv');

    expect(fn () => readMunicipalityRowsFor($missing))
        ->toThrow(RuntimeException::class, $missing);
});

test('duplicate-code detection: two rows sharing the same ine_code both parse individually -- deduplication is the caller\'s job', function () {
    // readMunicipalityRows() itself yields every row it parses; duplicate-code REFUSAL is
    // GeographyCatalogSeeder::seedMunicipalities()'s job (covered with a database in
    // GeographyCatalogSeederTest.php), not this pure parser's. This test pins that
    // boundary: the parser sees both rows.
    $rows = readMunicipalityRowsFor(geographyFixturesPath('es-municipalities-duplicate.csv'));

    $codes = array_column($rows, 'ine_code');

    expect(array_count_values($codes))->toContain(2);
});
