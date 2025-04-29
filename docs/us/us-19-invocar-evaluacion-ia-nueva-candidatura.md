# User Story: US-019

## Feature Asociada
Feature 4: Evaluación Inteligente de Candidaturas

## Título
Invocar Evaluación IA para Nueva Candidatura

## Narrativa
Como Sistema ATS MVP
Quiero iniciar automáticamente la evaluación IA en TalentIA Core AI cada vez que se recepciona una nueva candidatura
Para asegurar que todos los candidatos sean analizados por la IA de forma oportuna.

## Detalles
Cubre la acción del ATS MVP de llamar a la API de Core AI para solicitar la evaluación.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que una nueva candidatura ha sido recepcionada y almacenada (US-011) y el perfil `CandidatoIA` ha sido gestionado (US-018).
2.  El ATS MVP realiza automáticamente una llamada a la API interna (US-001) del Servicio de Evaluación de Core AI.
3.  La llamada incluye los identificadores necesarios (ID Candidatura ATS, ID Vacante ATS, ID Archivo Candidato ATS/ruta).
4.  El ATS MVP maneja la respuesta inicial de la API (ej. confirmación de recepción de la tarea si es asíncrono, o espera del resultado si es síncrono dentro de un timeout razonable - RNF-03).
5.  Se registra internamente en el ATS MVP que la evaluación para esta candidatura ha sido solicitada.

## Requisito(s) Funcional(es) Asociado(s)
RF-10

## Prioridad: Must Have
* **Justificación:** Dispara el proceso central de evaluación IA para cada candidato.

## Estimación Preliminar (SP): 1
* **Justificación:** Acción simple de realizar una llamada API desde el ATS al Core AI. La complejidad está en el servicio Core AI que recibe la llamada. Baja complejidad para el ATS.