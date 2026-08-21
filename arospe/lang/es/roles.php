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
        'summary' => ':count rol|:count roles',
        'permission_count' => ':count permiso|:count permisos',
        'empty' => 'Todavía no se ha creado ningún rol personalizado.',
        'action_not_allowed' => 'Acción no permitida',
    ],

    /*
    |--------------------------------------------------------------------------
    | Etiquetas de módulo de permisos (historia 0011, punto abierto 3)
    |--------------------------------------------------------------------------
    |
    | Una etiqueta por cada módulo bajo el que el catálogo de permisos
    | sembrado agrupa sus permisos (database/seeders/RolePermissionSeeder::
    | MODULES), más el pseudo-módulo "roles" bajo el que se agrupan los dos
    | permisos no CRUD (roles.manage, roles.manage-administrators) al
    | renderizar. Las claves usan el slug del módulo con los guiones
    | convertidos en guiones bajos (sales-regions -> sales_regions), según
    | la regla de claves de traducción en snake_case de
    | docs/conventions/naming.md -- el nombre del permiso en sí nunca se
    | renombra.
    |
    */

    'modules' => [
        'users' => 'Usuarios',
        'products' => 'Productos',
        'sales_regions' => 'Regiones de venta',
        'shipping' => 'Envíos',
        'payment_methods' => 'Métodos de pago',
        'customers' => 'Clientes',
        'orders' => 'Pedidos',
        'blog' => 'Blog',
        'store_languages' => 'Idiomas de la tienda',
        'roles' => 'Roles',
    ],

    /*
    |--------------------------------------------------------------------------
    | Etiquetas de acción de permisos (historia 0011, punto abierto 3)
    |--------------------------------------------------------------------------
    |
    | Una etiqueta por cada segmento de acción distinto presente en el
    | catálogo sembrado: las cuatro acciones CRUD (RolePermissionSeeder::
    | ACTIONS) más los dos segmentos no CRUD de ROLE_PERMISSIONS.
    | "manage-administrators" se mapea a "manage_administrators" por el
    | mismo motivo que las claves de módulo anteriores -- ver
    | docs/conventions/naming.md.
    |
    */

    'actions' => [
        'view' => 'Ver',
        'create' => 'Crear',
        'edit' => 'Editar',
        'delete' => 'Eliminar',
        'manage' => 'Gestionar',
        'manage_administrators' => 'Gestionar roles/usuarios de nivel administrador',
    ],

];
