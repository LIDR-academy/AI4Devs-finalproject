# Ticket: TK-107

## Título
BE-API: Asegurar/Incluir campo `resumen_ia` en Respuesta API Detalle Candidatura

## Descripción
Verificar y, si es necesario, modificar el endpoint de la API del backend ATS que devuelve los detalles de una candidatura (ej. `GET /api/v1/applications/{applicationId}`) para que incluya el campo `resumen_ia` en la respuesta JSON, si este campo existe y tiene valor en la base de datos (almacenado por TK-108).

## User Story Relacionada
US-033: Mostrar Resumen Generado por IA en Perfil de Candidatura

## Criterios de Aceptación Técnicos (Verificables)
1.  El endpoint `GET /api/v1/applications/{applicationId}` (o similar para obtener detalle) existe y funciona.
2.  La estructura de la respuesta JSON incluye un campo `resumen_ia` (String, nullable).
3.  Si la candidatura correspondiente tiene un resumen almacenado (por TK-108), el campo `resumen_ia` en la respuesta contiene ese texto.
4.  Si la candidatura no tiene resumen almacenado, el campo `resumen_ia` es `null` o no se incluye (según convención API).

## Solución Técnica Propuesta (Opcional)
Modificar el DTO (Data Transfer Object) o la lógica de serialización de la respuesta del endpoint para incluir el campo `resumen_ia` leído desde la entidad `Candidatura`.

## Dependencias Técnicas (Directas)
* Endpoint API existente de detalle de candidatura (necesita ticket si no existe formalmente).
* TK-108 (Lógica que almacena/recupera el resumen en BBDD ATS).

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-033)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Modificación DTO/serializador respuesta API]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, application, detail, ai-summary

## Comentarios
Asegura que el dato esté disponible para el frontend.

## Enlaces o Referencias
[TK-001 - Especificación API]