# User Story: US-028

## Feature Asociada
Feature 5: Visualización y Gestión del Pipeline de Selección

## Título
Mostrar Etapa de Pipeline Sugerida por IA

## Narrativa
Como Reclutador/Hiring Manager
Quiero ver claramente la etapa de pipeline que la IA sugiere para un candidato basado en su score y la configuración de la vacante
Para tener una recomendación de acción inicial y acelerar la clasificación.

## Detalles
Visualiza la recomendación de etapa generada por Core AI (RF-12C) en la interfaz del ATS MVP.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que la evaluación IA ha determinado una `etapa_sugerida` (US-023) y ha sido devuelta (US-024).
2.  Dado que accedo a la vista de detalle o a la lista/Kanban de candidatos de una vacante en el ATS MVP.
3.  Se muestra claramente la `etapa_sugerida` para esa candidatura (ej. texto "Sugerencia IA: Mover a X", un icono distintivo).
4.  La interfaz diferencia claramente entre la etapa *actual* del candidato y la etapa *sugerida* por la IA.

## Requisito(s) Funcional(es) Asociado(s)
RF-14B

## Prioridad: Must Have
* **Justificación:** Muestra la recomendación de acción clave generada por la IA, completando el valor de la evaluación inteligente.

## Estimación Preliminar (SP): 1
* **Justificación:** Requiere desarrollo de UI para mostrar un dato de texto/icono que ya está disponible en el backend del ATS. Baja complejidad.