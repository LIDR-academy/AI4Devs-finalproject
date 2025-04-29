# User Story: US-012

## Feature Asociada
Feature 2: Asistencia IA para Descripción de Puesto (JD)

## Título
Solicitar Generación de Descripción de Puesto (JD) con IA

## Narrativa
Como Reclutador
Quiero poder solicitar la generación automática del contenido de la JD haciendo clic en un botón
Para ahorrar tiempo y obtener un borrador inicial rápidamente.

## Detalles
Cubre la acción del usuario en la interfaz del ATS MVP para iniciar la generación de JD por IA.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy editando una vacante (US-006), existe un botón claramente visible "Generar Descripción con IA".
2.  Dado que hago clic en el botón "Generar Descripción con IA", el ATS MVP realiza una llamada (API interna US-001) al servicio de generación de JD de Core AI (ver US-015), pasando la información básica disponible de la vacante (título, requisitos clave iniciales).
3.  Dado que la llamada está en proceso, la interfaz muestra un indicador visual de carga (ej. spinner).
4.  Dado que la llamada finaliza (con éxito o error), el indicador de carga desaparece.

## Requisito(s) Funcional(es) Asociado(s)
RF-04

## Prioridad: Must Have
* **Justificación:** Es la acción que inicia una de las funcionalidades clave de IA del sistema.

## Estimación Preliminar (SP): 1
* **Justificación:** Desarrollo de UI muy simple (un botón) y la lógica para iniciar una llamada API ya definida (US-001). Baja complejidad.