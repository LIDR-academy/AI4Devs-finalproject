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
        'photo' => 'imagen',
        'title' => 'título',
        'description' => 'descripción',
    ],

    /*
    |--------------------------------------------------------------------------
    | Textos de la galería
    |--------------------------------------------------------------------------
    |
    | Todavía sin consumidor -- la historia 0019 solo publica la vista de
    | marcador de posición (D10); la historia 0020 la sustituirá por el
    | modal real y será previsiblemente el primer consumidor de este grupo.
    |
    */

    'gallery' => [
        'title' => 'Biblioteca multimedia',
        'upload_button' => 'Subir imagen',
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
