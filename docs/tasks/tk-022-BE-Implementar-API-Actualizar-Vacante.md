# Ticket: TK-022

## Título
BE: Implementar Endpoint Actualizar Vacante (`PATCH /api/v1/jobs/{jobId}`)

## Descripción
Crear y exponer el endpoint `PATCH /api/v1/jobs/{jobId}` en el backend del ATS MVP que reciba un cuerpo JSON con los campos de la vacante a actualizar (ej. titulo, departamento, ubicacion_texto, requisitos_clave, descripcion_html). Debe validar la entrada, invocar la lógica de actualización (TK-023) y devolver la vacante actualizada. Protegido por autenticación.

## User Story Relacionada
US-006: Editar Información de Vacante Existente

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `PATCH /api/v1/jobs/{jobId}` que acepta el ID en la ruta y un cuerpo JSON con los campos a actualizar.
2.  El endpoint está protegido por el middleware de autenticación (TK-005).
3.  Valida que si se proporcionan campos obligatorios (`titulo`, `ubicacion_texto`), estos no estén vacíos. Devuelve 400 si falla.
4.  Invoca la lógica de negocio (TK-023) para actualizar la vacante, pasando el ID y los datos validados.
5.  Si la lógica de negocio es exitosa, devuelve 200 OK con la representación completa de la vacante actualizada.
6.  Si la vacante no existe (`jobId` inválido), la lógica de negocio devuelve error y el endpoint retorna 404 Not Found.
7.  Si ocurre otro error (validación, BBDD), devuelve el código apropiado (400, 500).

## Solución Técnica Propuesta (Opcional)
Usar método PATCH para actualizaciones parciales. Validar solo los campos presentes en la petición.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-023 (Lógica de Negocio Actualización Vacante)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-006)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Creación ruta/controlador, integración middleware, validación input parcial, llamada a servicio]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, crud, vacancy, job, update, patch

## Comentarios
Asegurar que solo los campos enviados se actualicen (si se usa PATCH).

## Enlaces o Referencias
[TK-001 - Especificación API], [Anexo I]