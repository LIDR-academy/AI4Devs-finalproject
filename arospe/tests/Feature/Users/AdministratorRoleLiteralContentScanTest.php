<?php

// Story 0008a acceptance criterion: after centralization, the ONLY place the
// literal string 'Administrator' is written anywhere in the guard path is
// App\Enums\RoleName's own case declaration, and no `auth.administrator.role`
// config key (or an 'administrator' => config block) is ever introduced --
// the locked-name decision (D1) explicitly rules out an override path for
// this tier, unlike the Super Admin tier's config('auth.super_admin.role').
//
// This is DELIBERATELY a plain Pest test that reads raw file contents via
// file_get_contents()/str_contains() -- NOT an arch() expectation. Pest's
// arch() API reasons about namespaces, imports, inheritance and class shape;
// it has no way to express "this file contains no such string literal passed
// as a plain method argument". Do not "convert this back" to arch() -- there
// is no arch() rule that can replace it. See the task file's own instruction
// on this point: ai-spec/tasks/done/0008a-centralize-administrator-role-identification.md,
// "Tests to perform" content-scan bullet.

$guardPathFiles = [
    'app/Policies/UserPolicy.php',
    'app/Livewire/Users/Index.php',
    'app/Actions/Users/CreateUser.php',
    'app/Actions/Users/UpdateUser.php',
];

test('no literal Administrator/Super Admin role-name string survives in the guard path', function (string $relativePath) {
    $contents = file_get_contents(base_path($relativePath));

    expect($contents)->not->toBeFalse()
        ->and($contents)->not->toContain("'Administrator'")
        ->and($contents)->not->toContain("'Super Admin'");
})->with($guardPathFiles);

test('no auth.administrator.role config key or administrator config block exists anywhere in the guard path or config', function (string $relativePath) {
    $contents = file_get_contents(base_path($relativePath));

    expect($contents)->not->toBeFalse()
        ->and($contents)->not->toContain('auth.administrator.role')
        ->and($contents)->not->toContain("'administrator' =>");
})->with([
    ...$guardPathFiles,
    'app/Models/Role.php',
    'config/auth.php',
]);
