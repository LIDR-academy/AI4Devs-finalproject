# Ticket: TK-026

## Título
BE: Implementar Endpoint Actualizar Estado Vacante (`PATCH /api/v1/jobs/{jobId}/status`)

## Descripción
Crear y exponer un endpoint específico `PATCH /api/v1/jobs/{jobId}/status` en el backend del ATS MVP que reciba el nuevo estado deseado para la vacante (ej. 'PUBLICADA', 'CERRADA', 'ARCHIVADA'). Debe validar la transición de estado permitida, invocar la lógica de negocio (TK-027) y devolver la vacante actualizada. Protegido por autenticación.

## User Story Relacionada
US-007: Publicar y Despublicar una Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `PATCH /api/v1/jobs/{jobId}/status` que acepta el ID en la ruta y un cuerpo JSON con el nuevo estado, ej. `{"estado": "PUBLICADA"}`.
2.  El endpoint está protegido por el middleware de autenticación (TK-005).
3.  Invoca la lógica de negocio (TK-027) para validar la transición y actualizar el estado, pasando el ID de la vacante y el nuevo estado deseado.
4.  Si la lógica de negocio es exitosa, devuelve 200 OK con la representación completa de la vacante actualizada (incluyendo el nuevo estado y fechas actualizadas si aplica).
5.  Si la vacante no existe, la lógica devuelve error y el endpoint retorna 404 Not Found.
6.  Si la transición de estado no es válida (ej. publicar una archivada), la lógica devuelve error y el endpoint retorna 400 Bad Request o 409 Conflict.
7.  Si ocurre otro error, devuelve el código apropiado (500).

## Solución Técnica Propuesta (Opcional)
Usar un endpoint dedicado para la acción de cambio de estado en lugar del PATCH genérico de TK-022 clarifica la intención.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-027 (Lógica de Negocio Actualización Estado)
* TK-016 (Esquema BBDD `Vacante` con campo `estado`)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-007)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Creación ruta/controlador específico, integración middleware, llamada a servicio]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, vacancy, job, status, publish, close

## Comentarios
Endpoint clave para el ciclo de vida de la vacante.

## Enlaces o Referencias
[TK-001 - Especificación API], [Anexo I]