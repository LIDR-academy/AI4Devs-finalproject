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
        // Story 0020 Phase 5 fix round, D9: the single `photo` property was
        // superseded by the array `pendingUploads` (`wire:model="pendingUploads"
        // multiple`) -- `pendingUploads.*` is Laravel's documented wildcard
        // form for naming every element of an array-validated field.
        'pendingUploads' => 'image',
        'pendingUploads.*' => 'image',
        'title' => 'title',
        'description' => 'description',
    ],

    /*
    |--------------------------------------------------------------------------
    | Gallery copy
    |--------------------------------------------------------------------------
    |
    | Consumed by resources/views/livewire/media/gallery.blade.php (story
    | 0020, D15).
    |
    */

    'gallery' => [
        'title' => 'Media library',
        'count_summary' => '{0} No images|{1} :count image|[2,*] :count images',
        'search_placeholder' => 'Search by title or description',
        'upload_button' => 'Upload image',
        'upload_input_label' => 'Choose an image file to upload',
        'dropzone_label' => 'Drag and drop an image here, or use the Upload button',
        'dropzone_label_dragging' => 'Drop to upload',
        'empty_state' => [
            'title' => 'No images found',
            'body' => 'Try a different search term, or upload a new image.',
        ],
        'selection_none' => 'No images selected',
        'selection_count' => '{1} :count image selected|[2,*] :count images selected',
        'confirm_default_single' => 'Select image',
        'confirm_default_multi' => 'Add images',
        'cancel' => 'Cancel',
        'uploading_progress' => 'Uploading… :percent%',
        'processing' => 'Processing…',
        'too_many_files' => 'You can upload at most 3 images at a time.',
        'results_truncated' => 'Showing the 60 most recent images. Narrow your search to see others.',
        'action_not_allowed' => 'Action not allowed',
        'untitled_fallback' => 'Untitled',
    ],

    /*
    |--------------------------------------------------------------------------
    | Inline title/description editing (story 0020, D10/D15)
    |--------------------------------------------------------------------------
    */

    'edit' => [
        'title_label' => 'Title',
        'description_label' => 'Description',
        'save' => 'Save',
        'cancel' => 'Cancel',
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
