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

        'insert_code' => 'Insert code block',
        'code_language_plaintext' => 'Plain text',
        'code_language_php' => 'PHP',
        'code_language_html' => 'HTML',
        'code_language_css' => 'CSS',
        'code_language_javascript' => 'JavaScript',
        'code_language_json' => 'JSON',
        'code_language_sql' => 'SQL',
        'code_language_bash' => 'Bash',
        'code_language_xml' => 'XML',

        'toggle_html_source' => 'Edit HTML source',
        'html_source_label' => 'HTML source',

        'toggle_preview' => 'Preview',
        'preview_label' => 'Description preview',
    ],

    /*
    |--------------------------------------------------------------------------
    | Shared searchable, server-side-filtered multi-select (story 0022)
    |--------------------------------------------------------------------------
    |
    | Consumed by resources/views/livewire/components/searchable-multi-select.blade.php. Second
    | occupant of this file, appended as its own sibling top-level key -- never nested under
    | 'wysiwyg' above.
    |
    */

    'searchable_multi_select' => [
        'empty_state' => 'No matching options found.',
        'truncated' => 'More matches exist — narrow your search to see the rest.',
        'remove_chip' => 'Remove :label',
        'unavailable_option' => 'Unavailable option',
        'unavailable_option_reason' => 'This option is not available for selection.',
        'unresolvable_selection' => 'One or more selected values no longer exist and must be removed before saving.',
        'chip_area_label' => 'Selected values',
    ],

];
