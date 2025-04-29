# Ticket: TK-076

## Título
CAI-BE: Implementar Formateo y Retorno de Respuesta de Evaluación Completa

## Descripción
Desarrollar la lógica final dentro del servicio de Evaluación de Core AI que recopila todos los resultados generados durante el proceso de evaluación (score de TK-073, etapa sugerida de TK-075, opcionalmente resumen de US-025, opcionalmente datos parseados de TK-070) y los formatea en el objeto JSON de respuesta final, según lo definido en el contrato API (TK-001), para ser devuelto por el endpoint (TK-065) al ATS MVP.

## User Story Relacionada
US-024: Devolver Evaluación Completa (Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método final del flujo de evaluación (orquestado por TK-066) recibe como entrada los resultados de los pasos anteriores (score, etapa_sugerida, [resumen], [datos_parseados]).
2.  Construye un objeto de respuesta JSON que coincide exactamente con la estructura definida en la especificación OpenAPI (TK-001) para la respuesta exitosa del endpoint de evaluación (TK-065).
3.  El objeto de respuesta incluye obligatoriamente el `score.valor_general` y la `etapa_sugerida`.
4.  El objeto de respuesta incluye opcionalmente el `resumen_generado` y/o los `datos_extraidos_cv` si fueron generados y si el contrato API especifica que deben devolverse.
5.  El objeto de respuesta se devuelve correctamente al controlador del endpoint (TK-065) para ser enviado al ATS MVP.

## Solución Técnica Propuesta (Opcional)
Implementar como el paso final dentro del método de orquestación de evaluación (TK-066). Usar DTOs (Data Transfer Objects) o clases específicas para construir la respuesta estructurada.

## Dependencias Técnicas (Directas)
* TK-073 (Provee el score).
* TK-075 (Provee la etapa sugerida).
* TK-070 (Opcional, provee datos parseados).
* Ticket de US-025 (Opcional, provee resumen).
* TK-066 (Orquesta el flujo y llama a esta lógica de formateo).
* TK-065 (Endpoint que envía esta respuesta).
* TK-001 (Define la estructura exacta de la respuesta).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-024)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Construcción del objeto/DTO de respuesta final según contrato API]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, logic, service, evaluation, response, format, api

## Comentarios
Paso final para ensamblar la respuesta de evaluación.

## Enlaces o Referencias
[TK-001 - Especificación API]