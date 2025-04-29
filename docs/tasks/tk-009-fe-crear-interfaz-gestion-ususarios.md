# Ticket: TK-009

## Título
FE: Crear Interfaz de Usuario para Gestión de Usuarios

## Descripción
Desarrollar los componentes de UI en el frontend del ATS MVP para permitir a los Administradores gestionar usuarios. Incluir una vista de tabla/lista para mostrar los usuarios existentes y un formulario (modal o página separada) para crear y editar usuarios (campos: Nombre, Email, Rol, Estado Activo/Inactivo).

## User Story Relacionada
US-003: Gestionar Cuentas de Usuario y Roles

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una ruta/página accesible desde el menú de administración para "Gestión de Usuarios".
2.  La página muestra una tabla/lista con los usuarios obtenidos de la API (TK-007), mostrando Nombre, Email, Rol, Estado. La tabla soporta paginación si aplica.
3.  Existe un botón "Crear Nuevo Usuario" que abre un formulario/modal.
4.  El formulario de creación contiene campos para Nombre, Email, Contraseña (inicial), y un selector para Rol.
5.  Existe una opción (ej. botón "Editar" en cada fila de la lista) que abre el mismo formulario/modal precargado con los datos del usuario seleccionado (excepto contraseña) y permite modificar Nombre, Rol y Estado (ej. un checkbox Activo/Inactivo).
6.  El formulario incluye botones "Guardar" y "Cancelar".

## Solución Técnica Propuesta (Opcional)
Usar el framework frontend y librerías de componentes UI establecidas.

## Dependencias Técnicas (Directas)
* TK-010 (Lógica Frontend para llamar a APIs)
* Diseño de UI/Mockups para la gestión de usuarios.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-003)

## Estimación Técnica Preliminar
[ 8 ] [horas] - [Desarrollo componente lista/tabla, componente formulario, routing]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, user-management, crud, component, table, form

## Comentarios
Asegurar que solo los Admins puedan acceder a esta sección.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]