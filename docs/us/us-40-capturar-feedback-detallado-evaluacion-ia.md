# User Story: US-040

## Feature Asociada
Feature 6: Sistema de Feedback para IA

## Título
Capturar Feedback Detallado sobre Evaluación IA

## Narrativa
Como Reclutador/Hiring Manager
Quiero poder proporcionar feedback más específico sobre la evaluación IA, como ajustar el score manualmente, validar/invalidar skills detectadas o añadir comentarios
Para dar una retroalimentación más rica que ayude a la IA a entender mejor mis criterios.

## Detalles
Implementa interfaces más avanzadas en el ATS MVP para recoger feedback granular.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy viendo el detalle de una candidatura con una evaluación IA.
2.  Además del feedback básico (US-037), existen controles para:
    * Editar el score numérico mostrado (US-027).
    * Ver una lista de skills clave detectadas por la IA (requiere US-020 devolverlas) con opciones para marcarlas como "Correcta" / "Incorrecta" / "Relevante" / "Irrelevante".
    * Un campo de texto para añadir comentarios libres sobre la evaluación.
3.  Puedo interactuar con estos controles para proporcionar mi feedback detallado.
4.  Al guardar o enviar el feedback (ver US-038), toda la información detallada introducida (score ajustado, validaciones de skills, comentarios) se incluye en los datos enviados a Core AI.

## Requisito(s) Funcional(es) Asociado(s)
RF-27

## Prioridad: Should Have
* **Justificación:** Proporciona un feedback mucho más útil para el aprendizaje de la IA, pero el sistema puede funcionar con el feedback básico (Must Have).

## Estimación Preliminar (SP): 5
* **Justificación:** Requiere un desarrollo de UI más complejo (campos editables, listas interactivas de skills, campo de texto) y manejar la captura y envío de una estructura de datos de feedback más elaborada. Complejidad moderada.