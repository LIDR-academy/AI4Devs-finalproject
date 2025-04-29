# Ticket: TK-036

## Título
BE: Adaptar/Implementar Endpoint API Listar Vacantes Públicas (`GET /api/v1/jobs`)

## Descripción
Asegurar que el endpoint `GET /api/v1/jobs` (o crear uno público específico si se prefiere, ej. `/api/public/v1/jobs`) pueda filtrar las vacantes por estado, permitiendo específicamente obtener solo aquellas con estado 'PUBLICADA'. Este endpoint NO debe requerir autenticación.

## User Story Relacionada
US-009: Visualizar Lista de Vacantes Públicas

## Criterios de Aceptación Técnicos (Verificables)
1.  Se puede realizar una petición `GET /api/v1/jobs?status=PUBLISHED` (o a la ruta pública definida).
2.  La petición NO requiere token de autenticación.
3.  El endpoint invoca la lógica de negocio (TK-037) para obtener solo las vacantes con `estado = 'PUBLICADA'`.
4.  Devuelve 200 OK con un array (posiblemente paginado) de las vacantes publicadas, incluyendo al menos `id`, `titulo`, `ubicacion_texto`.
5.  Si no hay vacantes publicadas, devuelve 200 OK con un array vacío.
6.  Si se consulta sin el filtro `status=PUBLISHED` (o se accede al endpoint interno `GET /api/v1/jobs`), sí requiere autenticación (TK-005) y devuelve todas las vacantes accesibles al usuario. *(Esto asegura la separación entre vista pública y privada)*.

## Solución Técnica Propuesta (Opcional)
Adaptar el endpoint `GET /api/v1/jobs` existente para aceptar un parámetro `status` y desactivar condicionalmente la autenticación si `status=PUBLISHED`. O crear un nuevo controlador/ruta pública. Adaptar es más DRY si la lógica de consulta es similar.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-037 (Lógica de Negocio Listar Vacantes Públicas)
* TK-016 (Esquema BBDD `Vacante` con campo `estado`)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-009)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Modificación endpoint existente o creación nuevo, lógica filtro, desactivación condicional auth]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, vacancy, job, public, list, filter

## Comentarios
Importante asegurar que solo se exponen los datos necesarios públicamente y que no se requiere autenticación.

## Enlaces o Referencias
[TK-001 - Especificación API], [Anexo I]