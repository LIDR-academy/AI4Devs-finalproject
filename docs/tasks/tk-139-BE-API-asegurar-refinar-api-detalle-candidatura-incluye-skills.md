# Ticket: TK-139

## Título
BE-API: (Asegurar/Refinar) API Detalle Candidatura Incluye Skills Detectadas

## Descripción
Asegurar o refinar que el endpoint de la API del backend ATS que devuelve los detalles de una candidatura (ej. `GET /api/v1/applications/{applicationId}`) incluya también la lista de *skills detectadas* por Core AI durante la evaluación (si Core AI las devuelve y ATS las almacena - ver TK-140). Esta información es necesaria para la funcionalidad de validación de skills en US-040.

## User Story Relacionada
US-040: Capturar Feedback Detallado sobre Evaluación IA (depende de esta data)

## Criterios de Aceptación Técnicos (Verificables)
1.  La estructura de la respuesta JSON del endpoint de detalle de candidatura incluye un campo opcional `detected_skills` (Array de Strings o Array de Objetos con {skill: string, confidence: number}).
2.  Este campo se puebla con los datos almacenados/recuperados por la lógica del ATS (TK-140).
3.  Si no hay skills detectadas o la evaluación no las devolvió, el campo es `null` o un array vacío.

## Solución Técnica Propuesta (Opcional)
Modificar el DTO/serializador de la respuesta API para incluir este campo, leyéndolo de la entidad `Candidatura` o de donde se almacene (TK-140).

## Dependencias Técnicas (Directas)
* Endpoint API existente de detalle de candidatura.
* TK-140 (Lógica ATS que almacena/recupera las skills).
* Necesidad de que Core AI (US-020/US-024) devuelva las skills detectadas al ATS.

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-040, ya que es prerrequisito para validación de skills)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Modificación DTO/serializador respuesta API. Asume que Core AI ya devuelve las skills]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, application, detail, skills, ai

## Comentarios
Requiere que el flujo de evaluación de Core AI provea esta información al ATS.

## Enlaces o Referencias
[TK-001 - Especificación API]