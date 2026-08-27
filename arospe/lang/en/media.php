<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation attribute names
    |--------------------------------------------------------------------------
    |
    | Used as the third argument to App\Livewire\Media\Gallery::validate()
    | so a rejected field is named in plain language rather than as the raw
    | property name.
    |
    */

    'attributes' => [
        'photo' => 'image',
        'title' => 'title',
        'description' => 'description',
    ],

    /*
    |--------------------------------------------------------------------------
    | Gallery copy
    |--------------------------------------------------------------------------
    |
    | Not yet consumed by any view -- story 0019 ships the placeholder view
    | (D10); story 0020 replaces it with the real modal and is expected to
    | be the first consumer of this group.
    |
    */

    'gallery' => [
        'title' => 'Media library',
        'upload_button' => 'Upload image',
    ],

    /*
    |--------------------------------------------------------------------------
    | Upload rejection messages
    |--------------------------------------------------------------------------
    |
    | Story 0019 Phase 4 fix round (finding F-1). Deliberately generic --
    | neither names Imagick, a resource limit, nor a rate-limit window, so a
    | forged/pathological upload gets an ordinary-sounding validation
    | message rather than a hint about what tripped it.
    |
    */

    'upload_rejected' => 'This image could not be processed. Please try a different file.',
    'upload_throttled' => 'Too many uploads. Please try again in a little while.',

];
