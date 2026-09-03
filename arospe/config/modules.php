<?php

// Story 0013 — declarative sidebar module registry, consumed by
// resources/views/components/sidebar-nav.blade.php. Split into `groups` and
// `items` so the shipped "Settings" expandable group's icon/expand-on-route
// behaviour survives the gating retrofit alongside the plain "Platform"
// heading -- see ai-spec/tasks/done/0013-sidebar-module-gating-ui.md.
//
// Scope boundary: this file is NOT the permission catalog. The catalog --
// every permission across all epics, most with no screen yet -- is owned by
// database/seeders/RolePermissionSeeder.php. This file lists only entries
// that have a real route to link to today; a later epic appends a line when
// its screen ships, not when its permissions are seeded.
//
// A registry entry's `permissions` must be exactly the ability its route's
// `can:` middleware enforces -- never a broader or related set. `users` is
// ['users.view'] because routes/users.php gates users.index on exactly
// can:users.view; `roles` is ['roles.manage'] because routes/roles.php gates
// roles.index on exactly can:roles.manage. A broader list would show an
// entry to a role the route itself then 403s -- see
// docs/architecture/authorization.md's "copyable module-gate pattern" ⚠️.
//
// No closures anywhere in this file -- it must survive `config:cache`.
return [
    'groups' => [
        'platform' => [
            'heading' => 'navigation.groups.platform',
            'icon' => null,
            'expandable' => false,
            'expanded_when' => null,
            'class' => 'grid',              // matches the shipped group's class="grid" exactly
        ],
        'settings' => [
            'heading' => 'navigation.groups.settings',
            'icon' => 'cog-6-tooth',
            'expandable' => true,
            'expanded_when' => 'roles.*',   // route-name pattern passed to request()->routeIs()
            'class' => null,
        ],
        'taxes' => [
            'heading' => 'navigation.groups.taxes',
            'icon' => 'receipt-percent',
            'expandable' => false,   // one entry today; revisit if a second Taxes screen ships
            'expanded_when' => null,
            'class' => null,
        ],
    ],
    'items' => [
        'dashboard' => [
            'group' => 'platform',
            'label' => 'navigation.items.dashboard',
            'icon' => 'home',
            'route' => 'dashboard',
            'current_when' => 'dashboard',
            'permissions' => [],             // ungated -- see the empty-permissions rule in sidebar-nav.blade.php
        ],
        'users' => [
            'group' => 'platform',
            'label' => 'navigation.items.users',
            'icon' => 'users',
            'route' => 'users.index',
            'current_when' => 'users.*',
            'permissions' => ['users.view'],
        ],
        'roles' => [
            'group' => 'settings',
            'label' => 'navigation.items.roles',
            'icon' => 'shield-check',
            'route' => 'roles.index',
            'current_when' => 'roles.*',
            'permissions' => ['roles.manage'],
        ],
        'sales_regions' => [
            'group' => 'taxes',
            'label' => 'navigation.items.sales_regions',
            'icon' => 'globe-americas',
            'route' => 'sales-regions.index',
            'current_when' => 'sales-regions.*',
            'permissions' => ['sales-regions.view'],
        ],
        'product_categories' => [
            'group' => 'platform',
            'label' => 'navigation.items.product_categories',
            'icon' => 'tag',
            'route' => 'product-categories.index',
            'current_when' => 'product-categories.*',
            'permissions' => ['products.view'],
        ],
    ],
];
