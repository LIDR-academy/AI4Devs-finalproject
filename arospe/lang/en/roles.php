<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Roles & Permissions Management Screen
    |--------------------------------------------------------------------------
    |
    | Copy for the Roles & Permissions management area (App\Livewire\Roles\Index,
    | story 0010). Story 0011 owns the screen's markup; this key is consumed
    | by this story's holder-count delete refusal, resolved via
    | trans_choice() so the exact holder count is always named.
    |
    */

    'index' => [
        'delete_blocked' => 'This role cannot be deleted while it is still held by :count user.|This role cannot be deleted while it is still held by :count users.',
        'self_lockout_blocked' => 'You cannot remove the role-management permission from a role you hold yourself.',
        'summary' => ':count role|:count roles',
        'permission_count' => ':count permission|:count permissions',
        'empty' => 'No custom roles have been created yet.',
        'action_not_allowed' => 'Action not allowed',
    ],

    /*
    |--------------------------------------------------------------------------
    | Permission module labels (story 0011, Phase 2 review open item 3)
    |--------------------------------------------------------------------------
    |
    | One label per module the seeded permission catalog groups its
    | permissions under (database/seeders/RolePermissionSeeder::MODULES),
    | plus the "roles" pseudo-module the two non-CRUD permissions
    | (roles.manage, roles.manage-administrators) are grouped under at
    | render time. Keys are the module slug with any hyphen mapped to an
    | underscore (sales-regions -> sales_regions), per
    | docs/conventions/naming.md's snake_case translation-key-leaf rule --
    | the permission name itself is never renamed.
    |
    */

    'modules' => [
        'users' => 'Users',
        'products' => 'Products',
        'sales_regions' => 'Sales regions',
        'shipping' => 'Shipping',
        'payment_methods' => 'Payment methods',
        'customers' => 'Customers',
        'orders' => 'Orders',
        'blog' => 'Blog',
        'store_languages' => 'Store languages',
        'roles' => 'Roles',
    ],

    /*
    |--------------------------------------------------------------------------
    | Permission action labels (story 0011, Phase 2 review open item 3)
    |--------------------------------------------------------------------------
    |
    | One label per distinct action segment present in the seeded catalog:
    | the four CRUD actions (RolePermissionSeeder::ACTIONS) plus the two
    | non-CRUD segments carried by ROLE_PERMISSIONS. "manage-administrators"
    | is mapped to "manage_administrators" for the same reason the module
    | keys above are -- see docs/conventions/naming.md.
    |
    */

    'actions' => [
        'view' => 'View',
        'create' => 'Create',
        'edit' => 'Edit',
        'delete' => 'Delete',
        'manage' => 'Manage',
        'manage_administrators' => 'Manage administrator-level roles/users',
    ],

];
