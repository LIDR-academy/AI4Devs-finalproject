<?php

// Story 0024 -- created here; extended (never recreated) by 0024a, 0024b,
// 0026, 0027 and 0028. Key-for-key identical to lang/en/products.php.
return [
    'types' => [
        'physical' => 'Físico',
        'virtual' => 'Virtual',
    ],

    'statuses' => [
        'active' => 'Activo',
        'draft' => 'Borrador',
    ],

    'display_statuses' => [
        'out_of_stock' => 'Agotado',
    ],

    'categories' => [
        // Phase 5 review finding N-10: leads with the refusal, matching lang/es/roles.php's
        // house style (index.delete_blocked), rather than leading with the category.
        'delete_blocked' => 'No se puede eliminar esta categoría porque la utiliza :count producto.'
            .'|No se puede eliminar esta categoría porque la utilizan :count productos.',
    ],
];
