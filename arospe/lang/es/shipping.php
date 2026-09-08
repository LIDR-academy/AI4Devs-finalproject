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
    | `index.*`/`editor.*` añadidos por la historia 0034 (la pantalla de
    | listado/creación/renombrado/borrado y asignación de geografía de las
    | zonas). Sigue sin haber clave `zones.delete_blocked` (D-6):
    | DeleteShippingZone no lanza ninguna ValidationException hoy, y esta
    | pantalla renderiza el mensaje que un futuro guard lance sin necesitar
    | una clave propia.
    |
    */

    'zones' => [
        'fields' => [
            'name' => 'Nombre',
        ],

        'index' => [
            'heading' => 'Zonas de envío',
            'new_zone' => 'Nueva zona',
            'column_name' => 'Nombre',
            'column_coverage' => 'Cobertura',
            'column_actions' => 'Acciones',
            // Solo se llama con un total positivo -- una zona sin cobertura muestra
            // 'coverage_empty' en su lugar, de forma neutral y no como una advertencia (D-8).
            'coverage_count' => ':count entrada|:count entradas',
            'coverage_empty' => '—',
            'empty' => 'Todavía no hay zonas de envío. Crea la primera para empezar.',
            'action_not_allowed' => 'Acción no permitida',
            'edit_zone' => 'Editar :name',
            'delete_zone' => 'Eliminar :name',
            'delete_confirm_title' => 'Eliminar zona de envío',
            'delete_confirm_text' => '¿Seguro que quieres eliminar ":name"? Esta acción no se puede deshacer.',
        ],

        'editor' => [
            'create_title' => 'Crear zona de envío',
            'edit_title' => 'Editar zona de envío',
            'name_label' => 'Nombre',
            'geography_label' => 'Cobertura geográfica',
            // D-12: se muestra cuando SearchGeographyEntries::resolveSelected() no puede
            // verificar alguno de los ids enviados -- el guardado se rechaza por completo,
            // nunca se guarda un subconjunto parcial.
            'geography_unresolvable' => 'Una o varias de las entradas geográficas seleccionadas no se pudieron verificar. Revisa tu selección e inténtalo de nuevo.',
            // D-3: el resumen de cobertura por nivel, de solo lectura, junto al área de chips
            // acotada. 'coverage_summary_item' compone un segmento "<etiqueta> <total>" por
            // nivel (p. ej. "País 1"), unidos con ' · ' en la vista -- nunca una clave por nivel.
            'coverage_summary_empty' => 'Esta zona todavía no cubre ninguna entrada geográfica.',
            'coverage_summary_item' => ':label :count',
            'coverage_summary_total' => ':count entrada seleccionada en total.|:count entradas seleccionadas en total.',
        ],
    ],

];
