# Ticket: TK-010

## Título
FE: Implementar Lógica Frontend para API de Gestión de Usuarios

## Descripción
Desarrollar la lógica en el frontend (ej. servicios, stores de estado) para interactuar con los endpoints de la API de gestión de usuarios del backend (TK-007). Esto incluye realizar llamadas para listar, crear y actualizar usuarios, manejar las respuestas (éxito, errores) y actualizar el estado de la UI correspondientemente.

## User Story Relacionada
US-003: Gestionar Cuentas de Usuario y Roles

## Criterios de Aceptación Técnicos (Verificables)
1.  Al cargar la página de gestión de usuarios (TK-009), se realiza una llamada GET a `/api/v1/users` y la tabla se puebla con la respuesta.
2.  Al enviar el formulario de creación (TK-009), se realiza una llamada POST a `/api/v1/users` con los datos del formulario. Si la respuesta es 201, se cierra el formulario y se refresca la lista de usuarios. Si hay error (400, 409), se muestra el mensaje de error en el formulario.
3.  Al enviar el formulario de edición (TK-009), se realiza una llamada PATCH (o PUT) a `/api/v1/users/{userId}` con los datos modificados (rol, activo). Si la respuesta es 200, se cierra el formulario y se refresca la lista. Si hay error (400, 404), se muestra el mensaje.
4.  Se manejan adecuadamente los estados de carga durante las llamadas API.
5.  Las llamadas a la API incluyen el token/credencial de autenticación requerido (obtenido tras login TK-002).

## Solución Técnica Propuesta (Opcional)
Usar servicios dedicados o stores (Pinia, Redux, Zustand) para manejar el estado de los usuarios y la lógica API. Usar axios/fetch para las llamadas.

## Dependencias Técnicas (Directas)
* TK-007 (Endpoints Backend API)
* TK-009 (Componentes UI que invocan esta lógica)
* Mecanismo de autenticación frontend (TK-002) para enviar token.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-003)

## Estimación Técnica Preliminar
[ 6 ] [horas] - [Implementación llamadas API, manejo estado, integración con UI, manejo errores]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, user-management

## Comentarios
Asegurar buen manejo de errores y feedback al usuario.

## Enlaces o Referencias
[TK-001 - Especificación API]