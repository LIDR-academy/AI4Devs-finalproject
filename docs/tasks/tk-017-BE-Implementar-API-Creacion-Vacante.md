# Ticket: TK-017

## Título
BE: Implementar Endpoint Creación Vacante (`POST /api/v1/jobs`)

## Descripción
Crear y exponer el endpoint `POST /api/v1/jobs` en el backend del ATS MVP (alineado con Anexo I) que reciba los datos básicos para una nueva vacante en formato JSON. Debe validar la entrada, invocar la lógica de creación (TK-018) y devolver la vacante creada. Protegido por autenticación (TK-005).

## User Story Relacionada
US-005: Crear Nueva Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `POST /api/v1/jobs` que acepta un cuerpo JSON con `titulo`, `departamento` (opc), `ubicacion_texto`, `requisitos_clave` (opc).
2.  El endpoint está protegido por el middleware de autenticación (TK-005).
3.  Valida que los campos obligatorios (`titulo`, `ubicacion_texto`) no estén vacíos. Devuelve 400 Bad Request si falla.
4.  Invoca la lógica de negocio (TK-018) para crear la vacante, pasando los datos validados y el ID del usuario autenticado (Reclutador).
5.  Si la lógica de negocio es exitosa, devuelve 201 Created con la representación completa de la vacante recién creada (incluyendo su ID y estado 'BORRADOR').
6.  Si la lógica de negocio devuelve un error, propaga el error apropiado (ej. 500 Internal Server Error).

## Solución Técnica Propuesta (Opcional)
Usar el framework backend (Node/Express, Python/Django, etc.) y su sistema de routing/controladores. Usar librerías de validación de entrada (Joi, Cerberus, etc.).

## Dependencias Técnicas (Directas)
* TK-001 (Definición API, aunque endpoint `/jobs` viene de Anexo I)
* TK-005 (Middleware Autenticación)
* TK-018 (Lógica de Negocio Creación Vacante)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-005)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Creación ruta/controlador, integración middleware, validación input, llamada a servicio]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, crud, vacancy, job, creation

## Comentarios
Asegurar alineación con Anexo I y TK-001 si hay solapamiento/ajuste.

## Enlaces o Referencias
[TK-001 - Especificación API], [Anexo I]