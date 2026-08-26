<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Domain error messages
    |--------------------------------------------------------------------------
    |
    | Copy for App\Actions\SalesRegions\SetDefaultSalesRegion's D10 refusal
    | and App\Actions\SalesRegions\SetSalesRegionActive's D3 refusal (story
    | 0017). Both actions throw a ValidationException keyed on the
    | component's `replacementDefaultId` property (D4) rather than a bare
    | exception, so these messages land in the form's own error bag.
    |
    */

    'errors' => [
        'default_deactivation_requires_replacement' => 'The current default entry cannot be disabled without naming an active replacement default.',
        'default_must_be_active' => 'Only an active entry can be marked as the default.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Validation attribute names
    |--------------------------------------------------------------------------
    |
    | Used as the third argument to App\Livewire\SalesRegions\Index::validate()
    | so a rejected field is named in plain language rather than as the raw
    | camelCase property name.
    |
    */

    'attributes' => [
        'code' => 'code',
        'description' => 'description',
        'rate' => 'tax rate',
        'replacementDefaultId' => 'replacement default',
    ],

    /*
    |--------------------------------------------------------------------------
    | Screen copy (story 0018)
    |--------------------------------------------------------------------------
    |
    | Additive to the errors/attributes groups above -- consumed by
    | resources/views/livewire/sales-regions.blade.php. Keep this section
    | key-for-key identical to lang/es/sales-regions.php.
    |
    */

    'index' => [
        'title' => 'Sales Regions',
        'summary' => ':active active of :total total entries',
        'action_not_allowed' => 'You do not have permission to perform this action.',
        'default_toggle_tooltip' => 'This is the default entry. Open its edit form to name a replacement default before disabling it.',
        'empty' => 'No sales region entries found.',
    ],

    'fields' => [
        'code' => 'Code',
        'name' => 'Name',
        'description' => 'Description',
        'rate' => 'Rate %',
        'active' => 'Active',
        'slug' => 'Slug',
        'kind' => 'Type',
        'replacement_default' => 'Replacement default',
    ],

    'labels' => [
        'default' => 'Default',
        'show_all_countries' => 'Show all countries',
        'filter_countries_placeholder' => 'Filter by name or code…',
        'toggle_active' => 'Toggle active for :name',
        'set_default' => 'Set :name as default',
        'toggle_expand' => 'Expand or collapse :name',
        'select_replacement' => 'Select a replacement default',
        'kind_country' => 'Country',
        'kind_fiscal_territory' => 'Fiscal territory',
    ],

];
