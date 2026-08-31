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
    ],

];
