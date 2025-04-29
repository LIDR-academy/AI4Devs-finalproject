# User Story: US-030

## Feature Asociada
Feature 5: Visualización y Gestión del Pipeline de Selección

## Título
Visualizar Pipeline de Selección en Tablero Kanban

## Narrativa
Como Reclutador/Hiring Manager
Quiero poder ver a los candidatos de una vacante organizados por columnas que representan las etapas del pipeline
Para entender visualmente el flujo y estado del proceso de selección.

## Detalles
Implementa la vista Kanban para la gestión del pipeline.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que selecciono una vacante, puedo acceder a una vista de "Pipeline" o "Kanban".
2.  La vista muestra columnas correspondientes a las etapas configuradas (US-002) en su orden correcto.
3.  Cada candidatura asociada a la vacante se representa como una tarjeta dentro de la columna de su etapa actual.
4.  Cada tarjeta muestra información mínima: Nombre del candidato, y opcionalmente Score IA (US-027) y Etapa Sugerida IA (US-028).
5.  Las tarjetas se pueden arrastrar entre columnas para cambiar de etapa (ver US-031).

## Requisito(s) Funcional(es) Asociado(s)
RF-16

## Prioridad: Must Have
* **Justificación:** Proporciona una forma visual e interactiva clave para gestionar el flujo de candidatos.

## Estimación Preliminar (SP): 5
* **Justificación:** Requiere desarrollo de un componente UI más complejo (Kanban) con drag-and-drop, además de la lógica de backend para obtener los datos y agruparlos por etapa. Complejidad moderada.