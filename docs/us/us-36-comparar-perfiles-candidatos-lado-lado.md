# User Story: US-036

## Feature Asociada
Feature 5: Visualización y Gestión del Pipeline de Selección

## Título
Comparar Perfiles de Candidatos Lado a Lado

## Narrativa
Como Reclutador/Hiring Manager
Quiero poder seleccionar varios candidatos de una vacante y ver sus perfiles/evaluaciones IA en una vista comparativa
Para facilitar la decisión entre candidatos con perfiles similares o en etapas finales.

## Detalles
Introduce una nueva interfaz de comparación.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy en la vista de lista de candidatos (US-029), puedo seleccionar múltiples candidatos (ej. mediante checkboxes).
2.  Dado que he seleccionado 2 o más candidatos, se habilita una acción "Comparar Seleccionados".
3.  Dado que hago clic en "Comparar", se muestra una nueva pantalla o modal.
4.  La pantalla de comparación presenta la información clave de cada candidato seleccionado en columnas separadas, lado a lado.
5.  La información mostrada incluye como mínimo: Nombre, Score IA (US-027), Resumen IA (US-033 si existe), y enlaces al perfil completo.
6.  La vista de comparación es clara y facilita la identificación de diferencias clave.

## Requisito(s) Funcional(es) Asociado(s)
RF-37

## Prioridad: Could Have
* **Justificación:** Funcionalidad avanzada útil para etapas finales, pero no esencial para el flujo básico del MVP.

## Estimación Preliminar (SP): 8
* **Justificación:** Requiere un diseño y desarrollo de UI específico y potencialmente complejo para la vista de comparación. También implica lógica para recopilar y presentar los datos de múltiples candidatos de forma sincronizada. Alta complejidad relativa.