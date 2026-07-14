# MVP Backlog

## Objetivo

Este documento define el MVP recomendado de 5 historias para el CRM de importadora y lo traduce a un backlog técnico inicial listo para refinamiento e implementación.

## MVP de 5 historias

Las 5 historias seleccionadas para el MVP son:

1. US-015 Crear cliente
2. US-014 Ver clientes asignados
3. US-006 Crear proveedor
4. US-007 Crear producto con proveedor principal
5. US-008 Crear orden de cliente

## Por qué este MVP

Este conjunto cubre el flujo mínimo con valor real del negocio:

- Un vendedor registra un cliente.
- El sistema restringe la visibilidad según asignación.
- La empresa registra proveedores.
- Los productos quedan vinculados a un proveedor principal.
- Se pueden crear órdenes de cliente con validaciones clave del dominio.

## Estado de preparación para implementación

El backlog queda en estado casi listo para implementación. La base funcional está definida, pero antes de ejecutar conviene cerrar estas decisiones:

- Qué roles exactos pueden crear proveedores, productos y órdenes.
- Qué campos son obligatorios en cliente, proveedor y producto para la primera versión.
- Qué impuestos, descuentos y moneda se manejarán en la orden inicial.
- Qué estado inicial tendrá cada entidad creada.
- Si los usuarios se provisionarán por seed, panel interno o Supabase Auth manualmente.

Cuando estas decisiones estén cerradas, el backlog puede considerarse listo para implementación.

## Supuestos del MVP

- La autenticación se resuelve con Supabase Auth.
- Los roles mínimos son Administrador, Empresario/Socio y Vendedor.
- El vendedor puede crear clientes.
- El vendedor solo puede ver clientes asignados.
- La creación de proveedores y productos queda restringida a usuarios autorizados.
- La orden de cliente requiere al menos un producto.
- La alerta por mezcla de proveedores no bloquea la creación de la orden.

## Definición de terminado del MVP

El MVP se considera terminado cuando:

- Un vendedor puede iniciar sesión y crear un cliente.
- Ese vendedor solo puede ver sus clientes asignados.
- Un usuario autorizado puede crear proveedores.
- Un usuario autorizado puede crear productos con proveedor principal activo.
- Un usuario autorizado puede crear una orden de cliente.
- El sistema alerta si una orden contiene productos de diferentes proveedores.

## Corte de versión

La primera versión operativa del proyecto se considera cerrada en T-05.

### Alcance de la v1

La v1 incluye únicamente estos tickets:

1. T-01 Configurar autenticación, perfiles y roles
2. T-02 Definir modelo de datos base del MVP
3. T-03 Implementar creación de cliente
4. T-04 Implementar visibilidad de clientes según permisos
5. T-05 Implementar creación de proveedor

### Qué queda fuera de la v1

Los tickets T-06 en adelante quedan planificados para una versión posterior. Eso incluye:

- creación de productos con proveedor principal
- creación de órdenes de cliente
- validación de mezcla de proveedores
- autorización transversal más fina
- seeds y validación completa de demo

En consecuencia, la v1 debe evaluarse y demostrarse solo contra el alcance de T-01 a T-05.

## Checklist de demo v1

Esta checklist sirve para validar y presentar la primera versión del proyecto, limitada al alcance T-01 a T-05.

### Preparación previa

- El proyecto instala dependencias sin errores.
- Las variables de entorno necesarias están configuradas.
- Prisma genera cliente sin errores.
- Existe al menos un usuario autenticable en Supabase Auth.
- Existe un perfil interno asociado a ese usuario en `user_profiles`.

### Demo de T-01 Autenticación, perfiles y roles

- El usuario puede acceder a la pantalla de login.
- El usuario puede iniciar sesión con email y contraseña.
- La aplicación resuelve el usuario autenticado desde backend.
- Si el usuario no tiene sesión, no puede entrar al panel principal.
- Si el usuario está inactivo, el acceso operativo queda bloqueado.

### Demo de T-02 Modelo de datos base

- El esquema Prisma incluye usuarios, clientes, asignaciones y proveedores.
- Las relaciones entre tablas son coherentes.
- Prisma genera el cliente correctamente.

### Demo de T-03 Crear cliente

- Un usuario activo puede abrir el formulario de creación de cliente.
- Puede registrar un cliente con datos comerciales básicos.
- El sistema guarda el cliente correctamente.
- El cliente queda con responsable principal igual al usuario creador.
- El cliente queda asignado automáticamente al usuario creador.

### Demo de T-04 Ver clientes asignados

- Un vendedor solo ve los clientes que tiene asignados.
- Un administrador o empresario/socio puede ver todos los clientes.
- El detalle de cliente no queda expuesto a un vendedor no asignado.
- El listado de clientes muestra datos básicos suficientes para navegación.

### Demo de T-05 Crear proveedor

- Un usuario autorizado puede abrir el formulario de proveedor.
- Puede registrar un proveedor con datos mínimos.
- El proveedor queda visible en el listado correspondiente.
- Un usuario no autorizado no puede gestionar proveedores.

### Validación técnica mínima de la v1

- `npm run lint` ejecuta sin errores.
- `npx prisma generate` ejecuta sin errores.
- `npm run build` ejecuta sin errores.

### Criterio de cierre de demo v1

La demo de la v1 se considera satisfactoria si:

- el acceso está controlado por autenticación y estado del usuario,
- se puede crear al menos un cliente,
- la visibilidad de clientes respeta la asignación,
- y se puede crear al menos un proveedor desde un usuario autorizado.

## Tickets del backlog

### T-01 Configurar autenticación, perfiles y roles

- Tipo: Backend + Base de datos
- Historias relacionadas: US-014, US-015, US-006, US-007, US-008
- Objetivo: habilitar autenticación y control básico por rol.
- Alcance:
  - Integrar Supabase Auth.
  - Crear tabla de perfil de usuario con nombre, rol y estado.
  - Resolver el usuario autenticado desde backend.
  - Impedir operación si el usuario está inactivo.
- Criterios de aceptación:
  - Un usuario autenticado puede iniciar sesión.
  - El sistema conoce el rol del usuario actual.
  - Un usuario inactivo no puede operar en la aplicación.
- Dependencias: ninguna
- Estimación: 5 puntos

### T-02 Definir modelo de datos base del MVP

- Tipo: Base de datos
- Historias relacionadas: US-014, US-015, US-006, US-007, US-008
- Objetivo: crear las entidades mínimas necesarias para el MVP.
- Alcance:
  - Crear tablas de clientes, asignaciones cliente-vendedor, proveedores, productos, órdenes de cliente e ítems de orden.
  - Definir enums y estados mínimos.
  - Crear claves foráneas e índices esenciales.
- Criterios de aceptación:
  - Las migraciones se ejecutan sin errores.
  - Las relaciones entre entidades quedan consistentes.
  - Existen índices para búsquedas frecuentes por cliente, vendedor y proveedor.
- Dependencias: T-01
- Estimación: 5 puntos

### T-03 Implementar creación de cliente

- Tipo: Full stack
- Historia relacionada: US-015
- Objetivo: permitir que un vendedor cree clientes y quede asignado automáticamente.
- Alcance:
  - Formulario de alta de cliente.
  - Validación con Zod.
  - Server Action o endpoint para persistencia.
  - Asignación automática en la tabla de relación con el vendedor creador.
- Criterios de aceptación:
  - El vendedor puede crear un cliente con datos comerciales básicos.
  - El cliente queda asignado automáticamente al usuario creador.
  - Empresario/Socio y Administrador pueden verlo.
- Dependencias: T-01, T-02
- Estimación: 5 puntos

### T-04 Implementar visibilidad de clientes según permisos

- Tipo: Full stack
- Historia relacionada: US-014
- Objetivo: garantizar que cada vendedor vea solo su cartera y que los roles altos vean todo.
- Alcance:
  - Listado de clientes.
  - Filtro por permisos en backend.
  - Protección frente a acceso directo por URL a clientes no asignados.
- Criterios de aceptación:
  - Un vendedor solo ve clientes asignados.
  - Empresario/Socio y Administrador pueden ver todos los clientes.
  - Un vendedor no puede abrir el detalle de un cliente no asignado.
- Dependencias: T-03
- Estimación: 5 puntos

### T-05 Implementar creación de proveedor

- Tipo: Full stack
- Historia relacionada: US-006
- Objetivo: registrar proveedores con datos comerciales mínimos.
- Alcance:
  - Listado básico de proveedores.
  - Formulario de alta de proveedor.
  - Validaciones de campos requeridos.
  - Persistencia de estado inicial.
- Criterios de aceptación:
  - Un usuario autorizado puede crear un proveedor.
  - El proveedor queda disponible para asociarse a productos.
  - El proveedor se almacena con sus datos de contacto y estado.
- Dependencias: T-01, T-02
- Estimación: 3 puntos

### T-06 Implementar creación de producto con proveedor principal

- Tipo: Full stack
- Historia relacionada: US-007
- Objetivo: permitir alta de productos vinculados a un proveedor principal activo.
- Alcance:
  - Formulario de producto con SKU, nombre y proveedor principal.
  - Selector de proveedores activos.
  - Validación para evitar productos activos sin proveedor principal.
- Criterios de aceptación:
  - No se puede activar un producto sin proveedor principal.
  - Solo se pueden asociar proveedores activos.
  - El producto queda disponible para órdenes de cliente.
- Dependencias: T-05
- Estimación: 5 puntos

### T-07 Implementar creación de orden de cliente

- Tipo: Full stack
- Historia relacionada: US-008
- Objetivo: crear órdenes asociadas a un cliente con uno o varios productos.
- Alcance:
  - Formulario de orden con selección de cliente.
  - Tabla de líneas con producto, cantidad, precio y subtotal.
  - Persistencia de orden e ítems.
  - Estado inicial de la orden.
- Criterios de aceptación:
  - La orden debe estar asociada a un cliente existente.
  - La orden debe tener al menos un producto.
  - El sistema calcula subtotal y total.
  - La orden queda guardada con sus ítems.
- Dependencias: T-03, T-06
- Estimación: 8 puntos

### T-08 Detectar mezcla de proveedores en la orden

- Tipo: Backend + Frontend
- Historia relacionada: US-008
- Objetivo: alertar si una orden contiene productos con distintos proveedores principales.
- Alcance:
  - Resolver el proveedor principal de cada producto al crear la orden.
  - Comparar proveedores presentes en la orden.
  - Mostrar advertencia no bloqueante en interfaz.
- Criterios de aceptación:
  - Si todos los productos son del mismo proveedor, no se muestra alerta.
  - Si hay productos de distintos proveedores, se muestra advertencia.
  - La advertencia no bloquea la creación de la orden.
- Dependencias: T-07
- Estimación: 3 puntos

### T-09 Implementar autorización transversal por rol

- Tipo: Backend + Frontend
- Historias relacionadas: US-014, US-006, US-007, US-008
- Objetivo: cerrar huecos de seguridad del MVP.
- Alcance:
  - Ocultar acciones no permitidas en UI.
  - Validar permisos en backend para crear proveedor, producto y orden.
  - Centralizar helpers de autorización.
- Criterios de aceptación:
  - Un vendedor no puede ejecutar acciones restringidas si el rol no lo permite.
  - La UI no expone acciones prohibidas.
  - El backend bloquea intentos manuales no autorizados.
- Dependencias: T-01, T-04, T-05, T-06, T-07
- Estimación: 5 puntos

### T-10 Preparar seeds y validación del flujo MVP

- Tipo: Base de datos + QA técnico
- Historias relacionadas: US-014, US-015, US-006, US-007, US-008
- Objetivo: dejar el entorno utilizable para demo y validación funcional.
- Alcance:
  - Seed de usuarios demo por rol.
  - Seed de proveedores y productos.
  - Validación manual del flujo completo del MVP.
- Criterios de aceptación:
  - El proyecto puede arrancar con datos mínimos de prueba.
  - El flujo login, cliente, visibilidad, proveedor, producto y orden funciona extremo a extremo.
  - Los errores críticos detectados quedan documentados.
- Dependencias: T-01 a T-09
- Estimación: 3 puntos

## Propuesta de implementación por sprint

### Sprint 1

- T-01 Configurar autenticación, perfiles y roles
- T-02 Definir modelo de datos base del MVP
- T-03 Implementar creación de cliente
- T-04 Implementar visibilidad de clientes según permisos

Objetivo del sprint: dejar operativo el eje autenticación + clientes + visibilidad por vendedor.

### Sprint 2

- T-05 Implementar creación de proveedor
- T-06 Implementar creación de producto con proveedor principal
- T-07 Implementar creación de orden de cliente
- T-08 Detectar mezcla de proveedores en la orden

Objetivo del sprint: cerrar el flujo de operación comercial mínima.

### Sprint 3

- T-09 Implementar autorización transversal por rol
- T-10 Preparar seeds y validación del flujo MVP

Objetivo del sprint: endurecer permisos, estabilizar y dejar una demo sólida.

## Formato recomendado para evolución futura

Este archivo debe actuar como fuente maestra funcional del backlog. Si el proyecto pasa a ejecución formal, se recomienda replicar estos tickets en Jira, Trello o GitHub Projects con estos campos:

- ID
- Título
- Historia asociada
- Tipo
- Descripción
- Alcance
- Criterios de aceptación
- Dependencias
- Prioridad
- Estimación
- Estado
