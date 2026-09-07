<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Shipping zones (story 0033)
    |--------------------------------------------------------------------------
    |
    | This file is CREATED here even though story 0035 (shipping carriers) is
    | its nominal owner going forward -- 0035 has not landed yet in this
    | worktree, so per contracts.md's Parallel Agent File-Ownership Rule
    | (0033 and 0035 must never be implemented concurrently), this story
    | creates the file with only the `zones.*` group it needs. 0035 adds its
    | own top-level groups alongside this one when it lands.
    |
    | No `zones.delete_blocked` key here -- deliberately deferred to story
    | 0036, which owns the in-use-by-a-rate-rule count guard (D-1). A
    | `:count`-bearing string whose wording no product owner has approved is
    | dead copy in two locales until then.
    |
    */

    'zones' => [
        'fields' => [
            'name' => 'Name',
        ],
    ],

];
