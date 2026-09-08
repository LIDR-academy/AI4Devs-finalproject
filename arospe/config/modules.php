<?php

// Story 0013 — declarative sidebar module registry, consumed by
// resources/views/components/sidebar-nav.blade.php. Split into `groups` and
// `items` so the shipped "Settings" expandable group's icon/expand-on-route
// behaviour survives the gating retrofit -- see
// ai-spec/tasks/done/0013-sidebar-module-gating-ui.md. Story 0080 adds a
// third array, `clusters` (see below) -- the flat "Platform" group task 0013
// introduced is retired by that story.
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
// BEFORE ADDING A NEW ENTRY: place it under the top-level group the PRD's
// dashboard mockup assigns it to (docs/PRD/PRD.md's "Design reference & the
// dashboard shell", docs/PRD/images/01-inicio.png) -- do not default to a
// flat catch-all group just because it needs no new group. When the new
// entry is a SUB-RESOURCE of an already-shipped module (a second screen for
// the same conceptual module -- e.g. a type/category/attribute editor for an
// existing catalog), nest it under that module's own cluster instead of
// adding it as a flat sibling. Five prior additions did the opposite and
// that is exactly the drift docs/architecture/authorization.md's sidebar-
// registry rule #6 and ai-spec/tasks/done/0080-sidebar-navigation-
// grouping-and-nesting.md exist to close -- read both before appending an
// entry.
//
// Story 0080 -- the registry grows a THIRD flat sibling array, `clusters`, to
// express one level of nesting (a cluster renders inside its own `group`'s
// slot, and an item nests inside a cluster via `cluster` instead of `group`).
// `items` stays FLAT -- no nested `children` array anywhere -- so every
// existing and future drift guard iterating config('modules.items') already
// covers every item regardless of nesting depth; see
// docs/architecture/authorization.md's sidebar-registry section and
// ai-spec/tasks/done/0080-sidebar-navigation-grouping-and-nesting.md D-1.
//
// Each item carries two mutually exclusive, independently-nullable keys:
//   group === null, cluster === null  -> bare top-level item, no wrapper (D-2)
//   group === set,  cluster === null  -> direct child of that group (unchanged)
//   group === null, cluster === set   -> nested inside that cluster, which
//                                        itself renders inside the cluster's
//                                        own `group`
//
// A `clusters` entry carries no `route` and no `permissions` of its own -- it
// is purely presentational, and its expand/current state is DERIVED from its
// visible children's `current_when` values at render time (D-3), never a
// separately-maintained `expanded_when` pattern -- which is why a `clusters`
// entry has one fewer key than a `groups` entry.
//
// No closures anywhere in this file -- it must survive `config:cache`.
return [
    'groups' => [
        // Story 0080 -- `platform` is RETIRED (not merely emptied): once
        // Dashboard/Users became bare top-level items (D-2) and the three
        // products-family items moved into the `products` cluster (D-4),
        // nothing referenced this group any more, so the key itself is
        // removed from the registry and both lang files, per the
        // registry-mirroring rule (naming.md) and D-4's own instruction.
        //
        // `store` is declared BEFORE `settings` -- array order is render
        // order (the same `foreach (config('modules.groups') as ...)` loop
        // sidebar-nav.blade.php has always used), and D-1's own target shape
        // lists `store` first too, matching the PRD mockup's top-to-bottom
        // reading: ungrouped Dashboard/Users, then Store, then Settings.
        'store' => [
            'heading' => 'navigation.groups.store',
            'icon' => 'building-storefront',
            'expandable' => false,
            'expanded_when' => null,
            'class' => null,
        ],
        'settings' => [
            'heading' => 'navigation.groups.settings',
            'icon' => 'cog-6-tooth',
            'expandable' => true,
            'expanded_when' => 'roles.*',   // route-name pattern passed to request()->routeIs()
            'class' => null,
        ],
        // `groups.content` is deliberately NOT declared here -- it is story
        // 0060 (or whichever Blog story ships first)'s to add, alongside its
        // own `blog` cluster (D-5). An empty group with nothing referencing
        // it yet is exactly the premature scaffolding this registry's own
        // "append when the screen ships" convention avoids.
    ],
    'clusters' => [
        // Story 0080 -- Products, Product Categories and Product Attribute
        // Types are facets of one catalog concern; nested here instead of
        // three flat `store` siblings (D-1/D-4).
        'products' => [
            'group' => 'store',
            'label' => 'navigation.clusters.products',
            'icon' => 'cube',
        ],
        // Story 0080 -- Sales Regions today; Shipping (story 0034) joins here, exactly as
        // this comment's own forward note predicted.
        'store_settings' => [
            'group' => 'store',
            'label' => 'navigation.clusters.store_settings',
            'icon' => 'adjustments-horizontal',
        ],
    ],
    'items' => [
        // Story 0080 D-2 -- Dashboard and Users are bare top-level items now,
        // no wrapping group at all (matching the PRD mockup's own "no
        // heading above Inicio/Usuarios" shape).
        'dashboard' => [
            'group' => null,
            'cluster' => null,
            'label' => 'navigation.items.dashboard',
            'icon' => 'home',
            'route' => 'dashboard',
            'current_when' => 'dashboard',
            'permissions' => [],             // ungated -- see the empty-permissions rule in sidebar-nav.blade.php
        ],
        'users' => [
            'group' => null,
            'cluster' => null,
            'label' => 'navigation.items.users',
            'icon' => 'users',
            'route' => 'users.index',
            'current_when' => 'users.*',
            'permissions' => ['users.view'],
        ],
        'roles' => [
            'group' => 'settings',
            'cluster' => null,
            'label' => 'navigation.items.roles',
            'icon' => 'shield-check',
            'route' => 'roles.index',
            'current_when' => 'roles.*',
            'permissions' => ['roles.manage'],
        ],
        // Story 0080 -- moved from the retired `taxes` group into the
        // `store_settings` cluster (D-4): Impuestos and Envíos are the same
        // *kind* of thing (store-wide configuration) and belong grouped
        // together rather than as bare `store` siblings.
        'sales_regions' => [
            'group' => null,
            'cluster' => 'store_settings',
            'label' => 'navigation.items.sales_regions',
            'icon' => 'globe-americas',
            'route' => 'sales-regions.index',
            'current_when' => 'sales-regions.*',
            'permissions' => ['sales-regions.view'],
        ],
        'product_categories' => [
            'group' => null,
            'cluster' => 'products',
            'label' => 'navigation.items.product_categories',
            'icon' => 'tag',
            'route' => 'product-categories.index',
            'current_when' => 'product-categories.*',
            'permissions' => ['products.view'],
        ],
        // Story 0027 -- 'current_when' is 'products.*', not 'products.index', so the item stays
        // highlighted on products.create and products.edit too. 'permissions' is EXACTLY the
        // ability routes/products.php's own `can:` middleware enforces on all three routes --
        // never a broader set (see this file's own header note). Story 0080 -- 'products' is
        // just another equal child of the `products` cluster it happens to share a name with,
        // never the cluster's own "home" link (Q-1, resolved (a)) -- the cluster itself carries
        // no route/current_when of its own.
        'products' => [
            'group' => null,
            'cluster' => 'products',
            'label' => 'navigation.items.products',
            'icon' => 'cube',
            'route' => 'products.index',
            'current_when' => 'products.*',
            'permissions' => ['products.view'],
        ],
        // Story 0030 -- attribute types are a product sub-resource, so this entry gates on the
        // same 'products.view' ability as 'product_categories' and 'products' above (0028's
        // ProductAttributeTypePolicy adds no new permission module).
        'product_attribute_types' => [
            'group' => null,
            'cluster' => 'products',
            'label' => 'navigation.items.product_attribute_types',
            'icon' => 'swatch',
            'route' => 'product-attribute-types.index',
            'current_when' => 'product-attribute-types.*',
            'permissions' => ['products.view'],
        ],
        // Story 0034 -- RE-TARGETED at merge time into story 0080's new nested schema
        // (0080 shipped after 0034's own branch): 'shipping' was a flat top-level group in
        // 0034's own commit, matching the now-retired 'taxes' shape; sales_regions and
        // shipping_zones are both store-wide configuration screens in the same sense
        // (D-1/D-4), so this entry nests into the SAME `store_settings` cluster as
        // sales_regions rather than keeping its own now-nonexistent flat group.
        // 'permissions' is EXACTLY the ability routes/shipping.php's own `can:` middleware
        // enforces -- never a broader set (see this file's header note).
        'shipping_zones' => [
            'group' => null,
            'cluster' => 'store_settings',
            'label' => 'navigation.items.shipping_zones',
            'icon' => 'truck',
            'route' => 'shipping.zones.index',
            'current_when' => 'shipping.zones.*',
            'permissions' => ['shipping.view'],
        ],
    ],
];
