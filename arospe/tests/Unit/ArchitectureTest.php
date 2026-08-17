<?php

use Spatie\Permission\Models\Role;

// Story 0008 (re-audit F1): App\Models\Role is the only role model class application code may
// use -- a direct Spatie\Permission\Models\Role import reaches the same `roles` table but
// carries none of this story's guards (the deleting/updating/creating guards, the
// permission-pivot overrides, the selectable() scope), so it is a live bypass of every
// invariant this story builds, not a hypothetical one. Scoped to the two real PSR-4 roots this
// story's file list touches (composer.json has no bare `Database\` root) -- config/permission.php
// is outside both and is the one deliberate exception where the two classes are joined
// (`models.role` binding). App\Models\Role itself is `->ignoring()`'d: it legitimately extends
// the Spatie class, which arch() otherwise flags as "using" it.
//
// Two SEPARATE single-namespace rules, not `expect(['App', 'Database\Seeders'])`: Pest's
// `expect(array $targets)` evaluates disjunctively across the given targets -- it passes as soon
// as ANY ONE target satisfies the rule, even if another target in the same array violates it.
// A combined rule here would stay green even if `Database\Seeders` alone imported the raw
// Spatie model, as long as `App` didn't -- which is exactly how this test shipped vacuous the
// first time (verified: `expect(['App', 'Database\Seeders'])->not->toUse(Gate::class)` passes
// today even though Gate IS imported in app/Livewire/Users/Index.php).
arch('no application code imports the raw Spatie role model directly')
    ->expect('App')
    ->not->toUse(Role::class)
    ->ignoring('App\Models\Role');

arch('no seeder imports the raw Spatie role model directly')
    ->expect('Database\Seeders')
    ->not->toUse(Role::class);
