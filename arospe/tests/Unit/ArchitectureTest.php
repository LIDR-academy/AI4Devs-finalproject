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

// Story 0023, D-11: App\Models\ProductCategory must remain structurally independent from any
// future blog taxonomy -- own table, own model, own action namespace, own policy, no shared
// storage or identity, no polymorphic taxonomy. There is no blog taxonomy in code yet (PRD Epic 4
// -- Blog Categories/Tags/Posts do not exist), so this is honestly a SCOPE FENCE expressed as an
// executable test rather than a behavioral assertion today: it cannot fail yet, because there is
// nothing under a blog-taxonomy namespace for ProductCategory to import in the first place. It
// starts genuinely biting the moment Epic 4 lands a real blog taxonomy namespace under
// App\Models\Blog.
//
// A single-namespace `expect()` target, matching this file's own established one-rule-per-namespace
// convention (see the comment above the first two rules) -- not because this specific rule is at
// risk of the disjunctive-array-evaluation bug that convention exists to avoid (there is only one
// target here), but because every rule in this file follows the same shape for consistency.
arch('App\Models\ProductCategory does not reference any blog taxonomy namespace')
    ->expect('App\Models\ProductCategory')
    ->not->toUse('App\Models\Blog');

// Story 0024: App\Models\Product must remain structurally independent from any future blog
// taxonomy, matching App\Models\ProductCategory's identical fence directly above (0023, D-11).
// There is no blog taxonomy in code yet (PRD Epic 4 -- Blog Categories/Tags/Posts do not exist),
// so this is honestly a SCOPE FENCE expressed as an executable test rather than a behavioral
// assertion today: it cannot fail yet, because there is nothing under a blog-taxonomy namespace
// for Product to import in the first place. It starts genuinely biting the moment Epic 4 lands a
// real blog taxonomy namespace under App\Models\Blog.
//
// A single-namespace `expect()` target, matching this file's own established one-rule-per-
// namespace convention (see the comment above the first two rules) -- not because this specific
// rule is at risk of the disjunctive-array-evaluation bug that convention exists to avoid (there
// is only one target here), but for consistency with every other rule in this file.
arch('App\Models\Product does not reference any blog taxonomy namespace')
    ->expect('App\Models\Product')
    ->not->toUse('App\Models\Blog');

// Story 0025 (D-9): App\Livewire\ProductCategories\* must remain structurally independent from
// any future blog taxonomy, matching App\Models\ProductCategory's and App\Models\Product's
// identical fences directly above (0023 D-11, 0024). There is no blog taxonomy in code yet (PRD
// Epic 4 -- Blog Categories/Tags/Posts do not exist), so this is honestly a SCOPE FENCE expressed
// as an executable test rather than a behavioral assertion today: it cannot fail yet, because
// there is nothing under a blog-taxonomy namespace for the component to import in the first
// place. It starts genuinely biting the moment Epic 4 lands a real blog taxonomy namespace under
// App\Models\Blog.
//
// A single-namespace `expect()` target, per this file's own established one-rule-per-namespace
// convention (see the comment above the first two rules) and per this story's own note about a
// prior vacuous arch() rule (docs/errors-log.md): expect(array $targets) evaluates
// DISJUNCTIVELY, so `expect(['App\Models\ProductCategory', 'App\Livewire\ProductCategories'])`
// would stay green even if only one of the two namespaces violated it.
arch('App\Livewire\ProductCategories does not reference any blog taxonomy namespace')
    ->expect('App\Livewire\ProductCategories')
    ->not->toUse('App\Models\Blog');

// Story 0027 (Tests to perform, "tests/Unit/ArchitectureTest.php -- Modify -- extend the existing
// scope fence to cover App\Livewire\Products\*, matching 0025 D-9"): App\Livewire\Products\* must
// remain structurally independent from any future blog taxonomy, matching App\Models\ProductCategory's,
// App\Models\Product's and App\Livewire\ProductCategories's identical fences above. There is no blog
// taxonomy in code yet (PRD Epic 4 -- Blog Categories/Tags/Posts do not exist), so this is honestly
// a SCOPE FENCE expressed as an executable test rather than a behavioral assertion today: it cannot
// fail yet, because there is nothing under a blog-taxonomy namespace for the component to import in
// the first place. It starts genuinely biting the moment Epic 4 lands a real blog taxonomy namespace
// under App\Models\Blog.
//
// A single-namespace `expect()` target, per this file's own established one-rule-per-namespace
// convention and per the errors-log's own vacuous-arch()-rule entry: expect(array $targets)
// evaluates DISJUNCTIVELY, so a combined array target would stay green even if only one of several
// namespaces violated it.
arch('App\Livewire\Products does not reference any blog taxonomy namespace')
    ->expect('App\Livewire\Products')
    ->not->toUse('App\Models\Blog');
