# User Story: US-016

## Feature Asociada
Feature 2: Asistencia IA para Descripción de Puesto (JD)

## Título
Almacenar Parámetros de Evaluación IA Asociados a Vacante (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero poder recibir y almacenar de forma persistente los parámetros de evaluación IA (score de corte, etapas sugeridas) asociados a un ID de vacante específico
Para que puedan ser recuperados y utilizados por el servicio de evaluación de candidatos posteriormente.

## Detalles
Describe la capacidad interna del microservicio Core AI para guardar la configuración IA por vacante.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que el servicio Core AI recibe una petición API interna (desde US-013) con un ID de Vacante ATS, score_corte, etapa_aceptacion_id, etapa_rechazo_id.
2.  El servicio busca/crea la entidad `DescripcionPuestoGenerada` correspondiente a ese `vacante_ats_id`.
3.  El servicio actualiza/guarda los valores de `evaluacion_corte`, `etapa_pre_aceptacion`, `etapa_pre_rechazo` en esa entidad.
4.  Los datos se persisten correctamente en la base de datos de Core AI.
5.  El servicio devuelve una respuesta API interna al ATS MVP confirmando el éxito o indicando un error (ej. validación fallida).

## Requisito(s) Funcional(es) Asociado(s)
RF-06B

## Prioridad: Must Have
* **Justificación:** Esencial para persistir la configuración IA por vacante, necesaria para la evaluación posterior (Feature 4).

## Estimación Preliminar (SP): 2
* **Justificación:** Requiere lógica de backend para manejar la petición API, realizar una operación de escritura (INSERT/UPDATE) en la BBDD de Core AI con validaciones básicas. Baja complejidad.