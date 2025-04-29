# Ticket: TK-020

## Título
FE: Implementar Lógica Frontend para API de Creación de Vacante

## Descripción
Desarrollar la lógica en el frontend para manejar el envío del formulario "Crear Nueva Vacante" (TK-019). Esto incluye recopilar los datos del formulario, realizar la llamada POST a la API del backend (TK-017), y manejar la respuesta (redirigir a la vista de edición/detalle en caso de éxito, mostrar errores en caso de fallo).

## User Story Relacionada
US-005: Crear Nueva Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  Al hacer clic en "Guardar Vacante" en el formulario (TK-019), se recopilan los datos introducidos.
2.  Se realiza una llamada POST a `/api/v1/jobs` (TK-017) con los datos en el cuerpo JSON, incluyendo el token de autenticación.
3.  Se muestra un indicador de carga durante la llamada API.
4.  Si la respuesta es 201 Created, se extrae el ID de la vacante creada de la respuesta y se redirige al usuario a la vista de detalle/edición de esa vacante (ej. `/vacantes/{id}`).
5.  Si la respuesta es un error (ej. 400 por validación), se muestra un mensaje de error específico al usuario en el formulario.
6.  Si la respuesta es un error 401/403, se maneja el caso (ej. redirigir a login).

## Solución Técnica Propuesta (Opcional)
Usar servicios/stores y librería HTTP (axios/fetch). Implementar lógica de redirección post-creación.

## Dependencias Técnicas (Directas)
* TK-017 (Endpoint Backend API)
* TK-019 (Formulario UI que invoca esta lógica)
* Mecanismo de autenticación frontend (TK-002) para enviar token.
* Definición de la ruta de detalle/edición de vacante (parte de US-006).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-005)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación llamada API, manejo de datos form, manejo de respuesta/redirección, manejo errores]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, vacancy, job, creation

## Comentarios
La redirección a la vista de detalle/edición es importante para el flujo de usuario.

## Enlaces o Referencias
[TK-001/Anexo I - Especificación API]