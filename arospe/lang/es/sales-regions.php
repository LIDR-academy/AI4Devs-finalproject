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

    /*
    |--------------------------------------------------------------------------
    | Textos de la pantalla (historia 0018)
    |--------------------------------------------------------------------------
    |
    | Adición a los grupos errors/attributes anteriores -- usados por
    | resources/views/livewire/sales-regions.blade.php. Mantener esta
    | sección idéntica, clave por clave, a lang/en/sales-regions.php.
    |
    */

    'index' => [
        'title' => 'Regiones de venta',
        'summary' => ':active activas de :total entradas totales',
        'action_not_allowed' => 'Acción no permitida',
        'default_toggle_tooltip' => 'Esta es la entrada predeterminada. Abre su formulario de edición para indicar una entrada predeterminada sustituta antes de desactivarla.',
        'empty' => 'No se encontraron entradas de regiones de venta.',
    ],

    'fields' => [
        'code' => 'Código',
        'name' => 'Nombre',
        'description' => 'Descripción',
        'rate' => 'Tipo %',
        'active' => 'Activa',
        'slug' => 'Slug',
        'kind' => 'Tipo de entrada',
        'replacement_default' => 'Entrada predeterminada sustituta',
    ],

    'labels' => [
        'default' => 'Predeterminada',
        'show_all_countries' => 'Mostrar todos los países',
        'filter_countries_placeholder' => 'Filtrar por nombre o código…',
        'toggle_active' => 'Activar o desactivar :name',
        'set_default' => 'Marcar :name como predeterminada',
        'toggle_expand' => 'Expandir o contraer :name',
        'select_replacement' => 'Selecciona una entrada predeterminada sustituta',
        'kind_country' => 'País',
        'kind_fiscal_territory' => 'Territorio fiscal',
    ],

];
