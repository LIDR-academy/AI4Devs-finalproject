# User Story: US-009

## Feature Asociada
Feature 3: Portal de Empleo y Proceso de Aplicación

## Título
Visualizar Lista de Vacantes Públicas

## Narrativa
Como Candidato potencial
Quiero poder ver una lista de las ofertas de empleo que están actualmente publicadas
Para conocer las oportunidades disponibles y poder aplicar a ellas.

## Detalles
Proporciona la vista pública básica de las vacantes activas.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que accedo a la URL pública del portal de empleo, se muestra una página web.
2.  Dado que existen vacantes en estado "Publicada" en el ATS, la página muestra una lista de estas vacantes.
3.  Dado que existen vacantes en otros estados ("Borrador", "Cerrada", "Archivada"), estas NO aparecen en la lista pública.
4.  Para cada vacante listada, se muestra como mínimo: Título del puesto y Ubicación.
5.  Cada vacante listada tiene un enlace o botón claro (ej. "Ver Detalles" o "Aplicar") que dirige al formulario de aplicación (US-010) para esa vacante específica.
6.  La lista se presenta de forma clara y legible.

## Requisito(s) Funcional(es) Asociado(s)
RF-07

## Prioridad: Must Have
* **Justificación:** Esencial para que los candidatos puedan descubrir las ofertas; sin esto, no pueden aplicar.

## Estimación Preliminar (SP): 3
* **Justificación:** Requiere crear una página pública simple (frontend) que consulte y muestre datos filtrados del backend (vacantes publicadas). Complejidad baja-moderada.