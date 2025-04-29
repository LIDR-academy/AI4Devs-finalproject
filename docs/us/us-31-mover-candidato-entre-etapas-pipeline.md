# User Story: US-031

## Feature Asociada
Feature 5: Visualización y Gestión del Pipeline de Selección

## Título
Mover Candidato entre Etapas del Pipeline

## Narrativa
Como Reclutador/Hiring Manager
Quiero poder cambiar la etapa de un candidato arrastrándolo en el Kanban o seleccionando una nueva etapa en su perfil
Para reflejar el progreso o la decisión tomada sobre su candidatura.

## Detalles
Permite la acción principal de gestión del flujo de candidatos.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy en la vista Kanban (US-030), puedo hacer clic y arrastrar una tarjeta de candidato de una columna a otra columna válida.
2.  Dado que suelto la tarjeta en una nueva columna, el sistema actualiza la `etapa_pipeline_actual_id` de la `Candidatura` a la nueva etapa correspondiente.
3.  Dado que estoy en la vista de detalle de una candidatura, existe un control (ej. desplegable) que muestra la etapa actual y permite seleccionar una nueva etapa válida de la lista.
4.  Dado que selecciono una nueva etapa y confirmo, el sistema actualiza la `etapa_pipeline_actual_id` de la `Candidatura`.
5.  En ambos casos (Kanban o detalle), el cambio de etapa se registra en la tabla `HistorialEtapa` con la fecha, usuario y etapa anterior/nueva.
6.  La interfaz (Kanban y/o detalle) se actualiza inmediatamente para reflejar la nueva etapa del candidato.
7.  Puedo mover a cualquier etapa válida, incluso si es diferente a la `etapa_sugerida` por la IA (US-028).

## Requisito(s) Funcional(es) Asociado(s)
RF-17

## Prioridad: Must Have
* **Justificación:** Acción fundamental para gestionar el avance de los candidatos en el proceso.

## Estimación Preliminar (SP): 3
* **Justificación:** Requiere manejar la interacción de UI (drag-and-drop o selección) y la lógica de backend para actualizar el estado de la candidatura y registrar el historial. Complejidad baja-moderada.