# Ticket: TK-031

## Título
BE: Implementar Endpoints API RESTful para CRUD de Plantillas de Vacante

## Descripción
Desarrollar y exponer los endpoints de la API interna v1 necesarios para gestionar las plantillas de vacantes. Incluir endpoints para: Listar Plantillas, Obtener Detalles de Plantilla, Crear Plantilla (desde una Vacante existente o datos directos), Eliminar Plantilla. Protegido por autenticación.

## User Story Relacionada
US-008: Utilizar Plantillas para Crear Vacantes

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe `GET /api/v1/job-templates` que devuelve una lista de plantillas (id, nombre). Protegido.
2.  Existe `GET /api/v1/job-templates/{templateId}` que devuelve los detalles de una plantilla (id, nombre, datos_vacante). Protegido. Devuelve 404 si no existe.
3.  Existe `POST /api/v1/job-templates` que acepta `{ nombre: "...", vacante_id: "..." }` (para crear desde existente) O `{ nombre: "...", datos_vacante: {...} }` (para crear directo). Protegido. Llama a TK-032. Devuelve 201 con la plantilla creada.
4.  Existe `DELETE /api/v1/job-templates/{templateId}` para eliminar una plantilla. Protegido. Llama a TK-032. Devuelve 204 si éxito, 404 si no existe.

## Solución Técnica Propuesta (Opcional)
El endpoint POST podría tener dos lógicas o usar parámetros opcionales para diferenciar creación desde vacante vs. directa.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-032 (Lógica de Negocio Plantillas)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-008)

## Estimación Técnica Preliminar
[ 6 ] [horas] - [Creación de 4 endpoints, controladores, integración middleware, validación input]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, crud, vacancy, job, template

## Comentarios
Definir bien el payload del POST para crear plantillas.

## Enlaces o Referencias
[TK-001 - Especificación API]