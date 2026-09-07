<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Zonas de envío (historia 0033)
    |--------------------------------------------------------------------------
    |
    | Este archivo se CREA aquí aunque la historia 0035 (transportistas de
    | envío) sea su propietaria nominal en adelante -- 0035 todavía no ha
    | aterrizado en este worktree, así que según la Parallel Agent
    | File-Ownership Rule de contracts.md (0033 y 0035 nunca deben
    | implementarse de forma concurrente), esta historia crea el archivo solo
    | con el grupo `zones.*` que necesita. 0035 añadirá sus propios grupos de
    | nivel superior junto a este cuando aterrice.
    |
    | Sin clave `zones.delete_blocked` aquí -- diferida deliberadamente a la
    | historia 0036, que posee el guard de bloqueo por uso en una regla de
    | tarifa (D-1). Un texto con `:count` cuya redacción ningún product owner
    | ha aprobado es copia muerta en dos idiomas hasta entonces.
    |
    */

    'zones' => [
        'fields' => [
            'name' => 'Nombre',
        ],
    ],

];
