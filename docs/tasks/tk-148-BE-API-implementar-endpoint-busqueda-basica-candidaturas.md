# Ticket: TK-148

## Título
BE-API: Implementar Endpoint API para Búsqueda Básica de Candidaturas

## Descripción
Crear y exponer un endpoint en el backend ATS (ej. `GET /api/v1/search/applications`) que acepte un parámetro de query `q` con el término de búsqueda. Debe invocar la lógica de búsqueda (TK-149) y devolver una lista paginada de candidaturas coincidentes. Protegido por autenticación.

## User Story Relacionada
US-042: Buscar Candidatos por Nombre o Palabra Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `GET /api/v1/search/applications`.
2.  Acepta un parámetro de query `q` (término de búsqueda, obligatorio, no vacío).
3.  Acepta parámetros de query para paginación (ej. `page`, `pageSize`).
4.  El endpoint está protegido por autenticación (TK-005).
5.  Valida el parámetro `q`. Devuelve 400 si falta o está vacío.
6.  Invoca la lógica de negocio (TK-149) pasando el término de búsqueda y parámetros de paginación.
7.  Devuelve 200 OK con una estructura paginada de resultados (similar a TK-085 pero con candidaturas coincidentes). Cada resultado incluye info para mostrar en la lista (ID candidatura, Nombre Candidato, Título Vacante, Etapa Actual).
8.  Maneja errores de la lógica de negocio (500).

## Solución Técnica Propuesta (Opcional)
Endpoint GET estándar con query parameter para la búsqueda.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-149 (Lógica de Negocio Búsqueda)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-042)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Creación ruta/controlador, validación input query, llamada a servicio]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, search, application, candidate

## Comentarios
Define la interfaz para la búsqueda.

## Enlaces o Referencias
[TK-001 - Especificación API]