# User Story: US-024

## Feature Asociada
Feature 4: Evaluación Inteligente de Candidaturas

## Título
Devolver Resultados Completos de Evaluación IA al ATS (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero poder enviar una respuesta estructurada al ATS MVP que incluya el score calculado, la etapa sugerida y opcionalmente el resumen generado
Para entregar toda la información relevante producto de la evaluación.

## Detalles
Capacidad interna de Core AI para comunicar los resultados de vuelta al sistema principal.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que el proceso de evaluación ha finalizado (US-020, US-021, US-022, US-023, opcionalmente US-025/US-026).
2.  El Servicio de Evaluación construye un objeto/mensaje de respuesta (JSON) conforme a la API interna definida (US-001).
3.  La respuesta contiene obligatoriamente: el `score.valor_general` y la `etapa_sugerida`.
4.  La respuesta contiene opcionalmente (si se generaron): `score.scores_parciales`, `resumen_generado`, y/o una referencia a `datos_extraidos_cv`.
5.  La respuesta incluye el ID de la `Candidatura` ATS para que el ATS pueda asociarla correctamente.
6.  La respuesta se envía al ATS MVP (como respuesta a la llamada API de US-019 o mediante un mecanismo de callback si fue asíncrono).

## Requisito(s) Funcional(es) Asociado(s)
RF-13

## Prioridad: Must Have
* **Justificación:** Fundamental para que los resultados de la IA sean utilizados por el ATS y visibles para el usuario.

## Estimación Preliminar (SP): 1
* **Justificación:** Lógica de backend simple para formatear y enviar una respuesta API estructurada. Baja complejidad.