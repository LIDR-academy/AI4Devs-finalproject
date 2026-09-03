<?php

// Story 0024 -- created here; extended (never recreated) by 0024a, 0024b,
// 0026, 0027 and 0028. See docs/api's file-ownership hand-off note (R-13):
// if any of those runs uncoordinated, one silently overwrites another's
// keys, and a key missing from lang/es renders as its own raw key with no
// error.
return [
    'types' => [
        'physical' => 'Physical',
        'virtual' => 'Virtual',
    ],

    'statuses' => [
        'active' => 'Active',
        'draft' => 'Draft',
    ],

    'display_statuses' => [
        'out_of_stock' => 'Out of stock',
    ],

    'categories' => [
        'delete_blocked' => 'This category is used by :count product and cannot be deleted.'
            .'|This category is used by :count products and cannot be deleted.',

        // Story 0025 -- the product categories management screen. OQ-2 resolved: no header
        // summary key (nothing in the PRD or brief asks for one, unlike users.index.summary).
        'index' => [
            'action_not_allowed' => 'Action not allowed',
        ],
    ],

    // Story 0026 -- refusal messages for App\Concerns\ProductValidationRules'
    // salesRegionIdRules(). Both keys back the same Rule::exists()->where() match, so a
    // consumer's validate() call cannot distinguish which of the two conditions failed
    // (nonexistent vs. not assignable) from the closure alone -- either key is a reasonable
    // choice for the field-level message; 0027's save path decides which.
    'sales_regions' => [
        'not_in_catalog' => 'One of the selected sales regions is not in the catalog.',
        'not_assignable' => 'One of the selected sales regions cannot be assigned -- it may be disabled, or it may be a heading over fiscal territories rather than an assignable entry.',
    ],
];
