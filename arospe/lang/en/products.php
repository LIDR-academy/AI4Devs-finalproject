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
];
