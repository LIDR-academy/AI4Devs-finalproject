<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Shared WYSIWYG rich-text editor (story 0021)
    |--------------------------------------------------------------------------
    |
    | Consumed by resources/views/livewire/components/wysiwyg-editor.blade.php.
    | First occupant of this file -- story 0022 (searchable multi-select
    | component) targets the same app/Livewire/Components/ + lang/{en,es}/
    | components.php pair (D12); whichever story reaches Phase 3 first
    | creates these paths, the other extends them under its own top-level
    | key.
    |
    */

    'wysiwyg' => [
        'toolbar_label' => 'Text formatting toolbar',
        'placeholder' => 'Start writing…',

        'bold' => 'Bold',
        'italic' => 'Italic',
        'underline' => 'Underline',
        'heading' => 'Heading',
        'bullet_list' => 'Bullet list',
        'numbered_list' => 'Numbered list',

        'link' => 'Link',
        'link_url_label' => 'Web address',
        'link_apply' => 'Apply',
        'link_invalid_scheme' => 'Enter a web address starting with http://, https:// or mailto:.',

        'insert_image' => 'Insert image',
        'insert_image_confirm' => 'Insert image',
        'insert_image_not_allowed' => 'You do not have permission to insert images.',
    ],

];
