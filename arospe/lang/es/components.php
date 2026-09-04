<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Editor de texto enriquecido compartido (historia 0021)
    |--------------------------------------------------------------------------
    |
    | Consumido por resources/views/livewire/components/wysiwyg-editor.blade.php.
    | Primer ocupante de este fichero -- la historia 0022 (componente de
    | selección múltiple con búsqueda) apunta a la misma ruta compartida
    | app/Livewire/Components/ + lang/{en,es}/components.php (D12); la
    | historia que llegue primero a la Fase 3 crea estas rutas, la otra las
    | extiende bajo su propia clave de nivel superior.
    |
    */

    'wysiwyg' => [
        'toolbar_label' => 'Barra de herramientas de formato de texto',
        'placeholder' => 'Empieza a escribir…',

        'bold' => 'Negrita',
        'italic' => 'Cursiva',
        'underline' => 'Subrayado',
        'heading' => 'Encabezado',
        'bullet_list' => 'Lista con viñetas',
        'numbered_list' => 'Lista numerada',

        'link' => 'Enlace',
        'link_url_label' => 'Dirección web',
        'link_apply' => 'Aplicar',
        'link_invalid_scheme' => 'Introduce una dirección web que empiece por http://, https:// o mailto:.',

        'insert_image' => 'Insertar imagen',
        'insert_image_confirm' => 'Insertar imagen',
        'insert_image_not_allowed' => 'No tienes permiso para insertar imágenes.',

        'insert_code' => 'Insertar bloque de código',
        'code_language_plaintext' => 'Texto plano',
        'code_language_php' => 'PHP',
        'code_language_html' => 'HTML',
        'code_language_css' => 'CSS',
        'code_language_javascript' => 'JavaScript',
        'code_language_json' => 'JSON',
        'code_language_sql' => 'SQL',
        'code_language_bash' => 'Bash',
        'code_language_xml' => 'XML',

        'toggle_html_source' => 'Editar código HTML',
        'html_source_label' => 'Código HTML',
    ],

    /*
    |--------------------------------------------------------------------------
    | Selección múltiple compartida con búsqueda del lado del servidor (historia 0022)
    |--------------------------------------------------------------------------
    |
    | Consumido por resources/views/livewire/components/searchable-multi-select.blade.php.
    | Segundo ocupante de este fichero, añadido como clave de nivel superior hermana -- nunca
    | anidada bajo 'wysiwyg' de arriba.
    |
    */

    'searchable_multi_select' => [
        'empty_state' => 'No se han encontrado opciones coincidentes.',
        'truncated' => 'Hay más coincidencias — acota la búsqueda para ver el resto.',
        'remove_chip' => 'Quitar :label',
        'unavailable_option' => 'Opción no disponible',
        'unavailable_option_reason' => 'Esta opción no está disponible para su selección.',
        'unresolvable_selection' => 'Uno o más valores seleccionados ya no existen y deben eliminarse antes de guardar.',
        'chip_area_label' => 'Valores seleccionados',
    ],

];
