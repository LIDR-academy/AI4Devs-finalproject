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

        // Story 0025 -- key-for-key identical to lang/en/products.php.
        'index' => [
            'action_not_allowed' => 'Acción no permitida',
        ],
    ],

    // Story 0026 -- key-for-key identical to lang/en/products.php.
    'sales_regions' => [
        'not_in_catalog' => 'Una de las zonas de venta seleccionadas no está en el catálogo.',
        'not_assignable' => 'Una de las zonas de venta seleccionadas no se puede asignar -- puede estar desactivada, o puede ser una cabecera sobre territorios fiscales en lugar de una entrada asignable.',
        'unresolvable' => 'No se pudo verificar una de las zonas de venta seleccionadas. Revisa tu selección e inténtalo de nuevo.',
    ],

    // Historia 0027 -- clave por clave idéntico a lang/en/products.php.
    'index' => [
        'title' => 'Productos',
        'new_product' => 'Nuevo producto',
        'empty' => 'No se encontraron productos.',
        'thumbnail_alt' => 'Miniatura del producto',
        'action_not_allowed' => 'Acción no permitida',
        'delete_confirm_title' => 'Eliminar producto',
        'delete_confirm_text' => '¿Seguro que quieres eliminar ":name"? Esta acción no se puede deshacer.',
    ],

    // Historia 0029 -- clave por clave idéntico a lang/en/products.php.
    'variants' => [
        'duplicate_combination' => 'Esta combinación de valores de atributo ya existe en este producto.',
        'derived_sku_taken' => 'El SKU derivado :sku ya está en uso por otro producto o variante.',
        'derived_sku_empty_segment' => 'El valor de atributo ":value" no se puede usar para derivar un SKU -- por favor, renómbralo.',
        'derived_sku_too_long' => 'El SKU derivado superaría los :max caracteres. Renombra un valor de atributo o el SKU del producto para acortarlo.',
        'parent_sku_change_collides' => 'Cambiar el SKU del producto crearía un SKU duplicado para una de sus variantes. No se guardaron los cambios.',

        // Historia 0029a -- clave por clave idéntico a lang/en/products.php.
        'value_in_use' => 'Este valor no se puede eliminar: lo utiliza :count variante.|Este valor no se puede eliminar: lo utilizan :count variantes.',
        'type_in_use' => 'Este tipo no se puede eliminar: lo utiliza :count variante.|Este tipo no se puede eliminar: lo utilizan :count variantes.',

        // Historia 0030a -- clave por clave idéntico a lang/en/products.php.
        'rename_notice' => 'Renombrar este valor actualizará el SKU de :count variante.|Renombrar este valor actualizará el SKU de :count variantes.',

        // Historia 0029b -- clave por clave idéntico a lang/en/products.php.
        'generate' => [
            'empty_type' => 'El tipo de atributo ":type" no tiene valores, por lo que no se puede usar para generar combinaciones.',
            'too_many' => 'Generar estos tipos crearía :attempted combinaciones, por encima del límite de :limit. Selecciona menos tipos o valores.',
            'summary' => ':count variante creada.|:count variantes creadas.',
        ],
    ],

    // Historia 0027 -- clave por clave idéntico a lang/en/products.php.
    'editor' => [
        'title_create' => 'Nuevo producto',
        'title_edit' => 'Editar producto',
        'name_label' => 'Nombre',
        'sku_label' => 'SKU',
        'category_label' => 'Categoría',
        'category_placeholder' => 'Selecciona una categoría',
        'type_label' => 'Tipo',
        'type_placeholder' => 'Selecciona un tipo',
        'status_label' => 'Estado',
        'price_label' => 'Precio',
        'stock_label' => 'Stock',
        'description_label' => 'Descripción',
        'description_sanitization_notice' => 'El formato se limita a las opciones de la barra de herramientas; cualquier otro se elimina al guardar el producto.',
        'featured_image_label' => 'Imagen destacada',
        'featured_image_choose' => 'Elegir de la galería',
        'featured_image_clear' => 'Quitar',
        'gallery_label' => 'Galería',
        'gallery_add' => 'Añadir imágenes',
        'regions_label' => 'Zonas de venta',
        'save' => 'Guardar',
        'cancel' => 'Cancelar',
    ],

    // Historia 0030 -- clave por clave idéntico a lang/en/products.php.
    'attribute_types' => [
        'summary' => ':total tipos · :values valores',
        'no_types' => 'No se encontraron tipos de atributos.',
        'no_values' => 'Aún no hay valores.',
        'action_not_allowed' => 'Acción no permitida',
        'value_preview_more' => '+:count más',
    ],
];
