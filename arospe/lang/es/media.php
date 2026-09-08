<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Nombres de atributos de validación
    |--------------------------------------------------------------------------
    |
    | Se usan como tercer argumento de App\Livewire\Media\Gallery::validate()
    | para que un campo rechazado se nombre en lenguaje natural en lugar del
    | nombre de la propiedad.
    |
    */

    'attributes' => [
        // Historia 0020, ronda de correcciones de la Fase 5, D9: la
        // propiedad singular `photo` fue reemplazada por el array
        // `pendingUploads` (`wire:model="pendingUploads" multiple`) --
        // `pendingUploads.*` es la forma comodín documentada de Laravel
        // para nombrar cada elemento de un campo validado como array.
        'pendingUploads' => 'imagen',
        'pendingUploads.*' => 'imagen',
        'title' => 'título',
        'description' => 'descripción',
    ],

    /*
    |--------------------------------------------------------------------------
    | Textos de la galería
    |--------------------------------------------------------------------------
    |
    | Consumidos por resources/views/livewire/media/gallery.blade.php
    | (historia 0020, D15).
    |
    */

    'gallery' => [
        'title' => 'Biblioteca multimedia',
        'count_summary' => '{0} Sin imágenes|{1} :count imagen|[2,*] :count imágenes',
        'search_placeholder' => 'Buscar por título o descripción',
        'upload_button' => 'Subir imagen',
        'upload_input_label' => 'Elige un archivo de imagen para subir',
        'dropzone_label' => 'Arrastra y suelta una imagen aquí, o usa el botón Subir',
        'dropzone_label_dragging' => 'Suelta para subir',
        'upload_hint' => 'JPG, JPEG o PNG, hasta :size MB, máximo :dimension×:dimension px',
        'empty_state' => [
            'title' => 'No se encontraron imágenes',
            'body' => 'Prueba con otro término de búsqueda, o sube una imagen nueva.',
        ],
        'selection_none' => 'Ninguna imagen seleccionada',
        'selection_count' => '{1} :count imagen seleccionada|[2,*] :count imágenes seleccionadas',
        'confirm_default_single' => 'Seleccionar imagen',
        'confirm_default_multi' => 'Añadir imágenes',
        'cancel' => 'Cancelar',
        'uploading_progress' => 'Subiendo… :percent%',
        'processing' => 'Procesando…',
        'too_many_files' => 'Puedes subir como máximo 3 imágenes a la vez.',
        'results_truncated' => 'Mostrando las 60 imágenes más recientes. Acota tu búsqueda para ver otras.',
        'action_not_allowed' => 'Acción no permitida',
        'untitled_fallback' => 'Sin título',
    ],

    /*
    |--------------------------------------------------------------------------
    | Edición en línea de título/descripción (historia 0020, D10/D15)
    |--------------------------------------------------------------------------
    */

    'edit' => [
        'title_label' => 'Título',
        'description_label' => 'Descripción',
        'save' => 'Guardar',
        'cancel' => 'Cancelar',
    ],

    /*
    |--------------------------------------------------------------------------
    | Mensajes de rechazo de subida
    |--------------------------------------------------------------------------
    |
    | Ronda de correcciones de la Fase 4 de la historia 0019 (hallazgo F-1).
    | Deliberadamente genéricos -- no mencionan Imagick, un límite de
    | recursos ni una ventana de limitación de frecuencia, para que una
    | subida forzada o patológica reciba un mensaje de validación corriente
    | en lugar de una pista sobre qué lo activó.
    |
    */

    'upload_rejected' => 'No se pudo procesar esta imagen. Prueba con otro archivo.',
    'upload_throttled' => 'Demasiadas subidas. Inténtalo de nuevo dentro de un rato.',

];
