# User Story: US-033

## Feature Asociada
Feature 5: Visualización y Gestión del Pipeline de Selección

## Título
Mostrar Resumen Generado por IA en Perfil de Candidatura

## Narrativa
Como Reclutador/Hiring Manager
Quiero poder ver el resumen textual generado por la IA sobre un candidato en su perfil
Para obtener rápidamente un contexto cualitativo de su adecuación a la vacante.

## Detalles
Visualiza el resumen opcional generado por Core AI (RF-24) en la interfaz del ATS MVP.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que la evaluación IA para una candidatura ha generado un `resumen_generado` (US-025) y ha sido devuelto (US-024).
2.  Dado que accedo a la vista de detalle de esa candidatura en el ATS MVP.
3.  Se muestra el texto del `resumen_generado` en una sección claramente identificada (ej. "Resumen IA").

## Requisito(s) Funcional(es) Asociado(s)
RF-25

## Prioridad: Should Have
* **Justificación:** Aporta valor significativo para la revisión rápida, complementando el score.

## Estimación Preliminar (SP): 1
* **Justificación:** Requiere desarrollo de UI simple para mostrar un campo de texto que ya está disponible en el backend del ATS (asumiendo que se almacena o se pasa desde Core AI). Baja complejidad.