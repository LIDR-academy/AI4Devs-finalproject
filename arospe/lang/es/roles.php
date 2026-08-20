<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Pantalla de gestión de roles y permisos
    |--------------------------------------------------------------------------
    |
    | Textos para el área de gestión de roles y permisos (App\Livewire\Roles\Index,
    | historia 0010). La historia 0011 es responsable de la maquetación de la
    | pantalla; esta clave la utiliza el rechazo de borrado por número de
    | titulares de esta historia, resuelta mediante trans_choice() para que
    | siempre se indique el número exacto de titulares.
    |
    */

    'index' => [
        'delete_blocked' => 'Este rol no se puede eliminar porque todavía lo tiene :count usuario.|Este rol no se puede eliminar porque todavía lo tienen :count usuarios.',
        'self_lockout_blocked' => 'No puedes quitar el permiso de gestión de roles a un rol que tú mismo ostentas.',
    ],

];
