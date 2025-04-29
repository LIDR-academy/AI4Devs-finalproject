# User Story: US-027

## Feature Asociada
Feature 5: Visualización y Gestión del Pipeline de Selección

## Título
Mostrar Evaluación IA en Perfil de Candidatura

## Narrativa
Como Reclutador/Hiring Manager
Quiero ver claramente el score de IA calculado para un candidato en su perfil
Para entender rápidamente su nivel de ajuste inicial según la IA.

## Detalles
Cubre la visualización del resultado principal de la evaluación IA (el score) en la interfaz del ATS MVP.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que la evaluación IA para una candidatura ha sido completada y devuelta (US-024).
2.  Dado que accedo a la vista de detalle de esa candidatura en el ATS MVP.
3.  Se muestra de forma destacada el `puntuacion_ia_general` (ej. como número, porcentaje o barra de progreso) que fue almacenado (RF-14).
4.  La visualización es clara y se identifica fácilmente como el "Score IA".

## Requisito(s) Funcional(es) Asociado(s)
RF-14

## Prioridad: Must Have
* **Justificación:** Hace visible el resultado principal de la evaluación IA, fundamental para que el usuario la utilice.

## Estimación Preliminar (SP): 2
* **Justificación:** Requiere desarrollo de UI para mostrar un dato numérico/gráfico simple que ya está disponible en el backend del ATS tras la evaluación. Baja complejidad.