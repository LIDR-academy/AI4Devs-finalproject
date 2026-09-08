<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Geography catalog levels (story 0034)
    |--------------------------------------------------------------------------
    |
    | Copy for App\Enums\GeographyLevel::label(). This is the first rendering
    | site for the geography catalog (App\Actions\Shipping\SearchGeographyEntries
    | uses these as the shipping-zone geography picker's option `group`
    | headings) -- keep key-for-key identical to lang/es/geography.php.
    |
    */

    'levels' => [
        'country' => 'Country',
        'community' => 'Autonomous community',
        'municipality' => 'Municipality',
    ],

];
