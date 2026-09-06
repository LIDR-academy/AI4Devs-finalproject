<?php

// Parses the REAL bundled fixtures directly, with no database and no seeder --
// deliberately its own file so a fast run can exclude it (per the story's own "Tests to
// perform" section). Checks header shape, no duplicate INE/ISO codes, and referential
// closure (every municipio's community_ine_code appears among the derived comunidad rows).
//
// tests/Unit is NOT bound to Tests\TestCase in tests/Pest.php, so database_path() is
// unavailable here (see GeographyCatalogSeederParsingTest.php's own note) -- paths are
// built from __DIR__ instead.
function geographyDataPath(string $file): string
{
    return dirname(__DIR__, 3).'/database/data/'.$file;
}

test('the bundled municipality fixture has the expected header', function () {
    $path = geographyDataPath('es-municipalities.csv');
    expect(is_file($path))->toBeTrue();

    $handle = fopen($path, 'r');
    $header = fgetcsv($handle, escape: '\\');
    fclose($handle);

    expect($header)->toBe(['ine_code', 'name', 'province_name', 'community_ine_code', 'community_name']);
});

test('the bundled municipality fixture has no duplicate INE codes', function () {
    $rows = array_slice(array_map(fn (string $line): array => str_getcsv($line, escape: '\\'), file(geographyDataPath('es-municipalities.csv'))), 1);
    $codes = array_column($rows, 0);

    expect(array_unique($codes))->toHaveCount(count($codes));
});

test('every municipio\'s community_ine_code appears among the derived comunidad rows', function () {
    $rows = array_slice(array_map(fn (string $line): array => str_getcsv($line, escape: '\\'), file(geographyDataPath('es-municipalities.csv'))), 1);

    $communityCodes = array_unique(array_column($rows, 3));
    $communityNames = [];
    foreach ($rows as $row) {
        $communityNames[$row[3]] = $row[4];
    }

    expect($communityCodes)->toHaveCount(17)
        ->and($communityNames)->toHaveCount(17);
});

test('the bundled ISO country fixture has no duplicate alpha2 codes and every code is two uppercase letters', function () {
    $path = geographyDataPath('iso-3166-countries.json');
    expect(is_file($path))->toBeTrue();

    $countries = json_decode(file_get_contents($path), associative: true);
    $codes = array_column($countries, 'alpha2');

    expect(array_unique($codes))->toHaveCount(count($codes));

    foreach ($codes as $code) {
        expect($code)->toMatch('/^[A-Z]{2}$/');
    }
});

test('the bundled ISO country fixture includes España (ES)', function () {
    $countries = json_decode(file_get_contents(geographyDataPath('iso-3166-countries.json')), associative: true);
    $spain = collect($countries)->firstWhere('alpha2', 'ES');

    expect($spain)->not->toBeNull()
        ->and($spain['name_es'])->toBe('España');
});
