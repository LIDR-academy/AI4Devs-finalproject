# User Story: US-025

## Feature Asociada
Feature 4: Evaluación Inteligente de Candidaturas

## Título
Generar Resumen Ejecutivo del Candidato vs Vacante (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero poder generar un breve resumen textual que destaque los puntos clave del candidato en relación a la vacante
Para proporcionar un contexto cualitativo rápido que complemente el score numérico.

## Detalles
Capacidad interna de Core AI para generar el resumen, probablemente usando un LLM (RF-22).

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que se han extraído datos del CV (US-020) y se conocen los requisitos de la vacante.
2.  El Servicio de Evaluación formula un prompt adecuado para solicitar un resumen comparativo a un LLM (RF-22).
3.  Dado que la llamada al LLM es exitosa, se extrae el texto del resumen de la respuesta.
4.  El texto del resumen generado se almacena en `EvaluacionCandidatoIA.resumen_generado`.
5.  El resumen generado es conciso (ej. menos de 100 palabras o 3-4 bullet points).
6.  El resumen se incluye en la respuesta devuelta al ATS (US-024).

## Requisito(s) Funcional(es) Asociado(s)
RF-24

## Prioridad: Should Have
* **Justificación:** Añade valor significativo para la comprensión rápida del perfil, pero el sistema puede funcionar solo con el score y la etapa sugerida.

## Estimación Preliminar (SP): 5
* **Justificación:** Requiere prompt engineering efectivo, integración con LLM (RF-22), manejo de la respuesta textual, y almacenamiento. Añade latencia y coste al proceso. Complejidad moderada.