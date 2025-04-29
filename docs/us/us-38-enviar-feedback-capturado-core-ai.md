# User Story: US-038

## Feature Asociada
Feature 6: Sistema de Feedback para IA

## Título
Enviar Feedback Capturado a Core AI

## Narrativa
Como Sistema ATS MVP
Quiero enviar la información del feedback proporcionado por el usuario (básico o detallado) al servicio de Feedback de Core AI
Para que pueda ser almacenado y utilizado para el aprendizaje.

## Detalles
Cubre la comunicación desde el ATS MVP hacia Core AI para transmitir el feedback recogido.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que un usuario ha proporcionado feedback en la interfaz (US-037 o US-040).
2.  El ATS MVP realiza una llamada a la API interna (US-001) del Servicio de Feedback de Core AI (ver US-039).
3.  La llamada incluye: ID de la `EvaluacionCandidatoIA` sobre la que se da feedback, ID del `Usuario` ATS que da el feedback, el tipo de feedback (ej. 'SCORE_VALIDADO_UP', 'SCORE_AJUSTADO', 'SKILL_VALIDADA') y los datos específicos del feedback (ej. nuevo score, ID de skill).
4.  El ATS MVP maneja la respuesta de la API de Core AI (confirmación o error).
5.  Si el envío es exitoso, la interfaz puede indicar que el feedback ha sido enviado (opcional).

## Requisito(s) Funcional(es) Asociado(s)
RF-19

## Prioridad: Must Have
* **Justificación:** Necesario para que el feedback recogido llegue efectivamente al sistema de IA.

## Estimación Preliminar (SP): 1
* **Justificación:** Acción simple de realizar una llamada API desde el ATS al Core AI con los datos del feedback estructurados. Baja complejidad para el ATS.