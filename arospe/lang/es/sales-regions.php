<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mensajes de error de dominio
    |--------------------------------------------------------------------------
    |
    | Textos para el rechazo D10 de App\Actions\SalesRegions\SetDefaultSalesRegion
    | y el rechazo D3 de App\Actions\SalesRegions\SetSalesRegionActive
    | (historia 0017). Ambas acciones lanzan una ValidationException con la
    | clave de la propiedad `replacementDefaultId` del componente (D4), por
    | lo que estos mensajes llegan directamente a los errores del formulario.
    |
    */

    'errors' => [
        'default_deactivation_requires_replacement' => 'La entrada predeterminada actual no se puede desactivar sin indicar una entrada activa que la sustituya.',
        'default_must_be_active' => 'Solo una entrada activa puede marcarse como predeterminada.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Nombres de atributos de validación
    |--------------------------------------------------------------------------
    |
    | Usados como tercer argumento de App\Livewire\SalesRegions\Index::validate()
    | para que un campo rechazado se nombre en lenguaje natural en vez de con
    | el nombre de la propiedad en camelCase.
    |
    */

    'attributes' => [
        'code' => 'código',
        'description' => 'descripción',
        'rate' => 'tipo impositivo',
        'replacementDefaultId' => 'entrada predeterminada sustituta',
    ],

];
