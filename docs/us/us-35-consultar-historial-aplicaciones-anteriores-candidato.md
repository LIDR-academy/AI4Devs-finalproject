# User Story: US-035

## Feature Asociada
Feature 5: Visualización y Gestión del Pipeline de Selección

## Título
Consultar Historial de Aplicaciones Anteriores del Candidato

## Narrativa
Como Reclutador/Hiring Manager
Quiero poder ver, en el perfil de una candidatura, si el mismo candidato ha aplicado a otras vacantes anteriormente en nuestro sistema
Para tener un contexto completo de su relación con la empresa y tomar decisiones más informadas.

## Detalles
Implementa la consulta y visualización de la información agregada del `CandidatoIA` mantenida por Core AI (RF-09B).

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy viendo el detalle de una candidatura y el perfil `CandidatoIA` asociado (US-018) tiene más de una entrada en `candidaturas_ids`.
2.  El ATS MVP realiza una llamada a la API de Core AI (US-001) para obtener la lista completa de `candidaturas_ids` para ese candidato.
3.  El ATS MVP recibe la lista de IDs.
4.  Para cada ID de candidatura *diferente* a la actual, el ATS MVP consulta su propia BBDD para obtener datos básicos (ej. Título Vacante, Fecha Aplicación, Estado Final si aplica).
5.  Se muestra una sección en el perfil (ej. "Historial de Aplicaciones") que lista estas otras aplicaciones con sus datos básicos.
6.  Si el `CandidatoIA` solo tiene la candidatura actual en `candidaturas_ids`, la sección de historial no se muestra o indica que no hay historial.
7.  La llamada a Core AI y las consultas subsiguientes se completan dentro de un tiempo razonable (ej. < 2 segundos).

## Requisito(s) Funcional(es) Asociado(s)
RF-26B

## Prioridad: Should Have
* **Justificación:** Proporciona información contextual valiosa para el reclutador.

## Estimación Preliminar (SP): 5
* **Justificación:** Requiere coordinación entre ATS y Core AI: ATS necesita llamar a la API de Core AI, procesar la respuesta (lista de IDs), y luego realizar múltiples consultas a su propia BBDD para obtener detalles. También necesita desarrollo de UI para mostrar el historial. Complejidad moderada.