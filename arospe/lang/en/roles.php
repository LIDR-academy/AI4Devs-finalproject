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
    ],

];
