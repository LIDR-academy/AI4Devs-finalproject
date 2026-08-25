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

];
