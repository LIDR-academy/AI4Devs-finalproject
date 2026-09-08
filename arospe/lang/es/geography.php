<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Niveles del catálogo de geografía (historia 0034)
    |--------------------------------------------------------------------------
    |
    | Texto para App\Enums\GeographyLevel::label(). Es el primer punto donde
    | se renderiza el catálogo de geografía (App\Actions\Shipping\SearchGeographyEntries
    | lo usa como encabezado `group` en el selector de geografía de las zonas
    | de envío) -- mantener idéntico, clave por clave, a lang/en/geography.php.
    |
    */

    'levels' => [
        'country' => 'País',
        'community' => 'Comunidad autónoma',
        'municipality' => 'Municipio',
    ],

];
