# User Story: US-018

## Feature Asociada
Feature 4: Evaluación Inteligente de Candidaturas

## Título
Gestionar Perfil Unificado de Candidato en IA (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero poder crear un perfil único para cada candidato (basado en email) y actualizarlo con todas sus candidaturas
Para mantener un registro centralizado y permitir vistas de historial unificado.

## Detalles
Cubre la creación y mantenimiento de la entidad `CandidatoIA` en Core AI, que agrega información a través de diferentes postulaciones. Habilita RF-26B.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que Core AI recibe una petición (API interna US-001) para registrar una nueva candidatura con un email y un ID de candidatura ATS (desde RF-09/US-011).
2.  El sistema busca un `CandidatoIA` existente por ese email.
3.  Si no existe, crea un nuevo `CandidatoIA`, almacena el email y añade el ID de la candidatura ATS a la lista `candidaturas_ids`.
4.  Si existe, añade el nuevo ID de la candidatura ATS a la lista `candidaturas_ids` del `CandidatoIA` existente (asegurando que no haya duplicados en la lista) y actualiza la `fecha_actualizacion`.
5.  Los cambios en `CandidatoIA` se persisten correctamente en la BBDD de Core AI.
6.  Se devuelve una confirmación de éxito (o error) a la llamada de la API.

## Requisito(s) Funcional(es) Asociado(s)
RF-09B

## Prioridad: Must Have
* **Justificación:** Estructura de datos fundamental en Core AI para vincular evaluaciones y permitir funcionalidades futuras como el historial unificado.

## Estimación Preliminar (SP): 3
* **Justificación:** Lógica de backend para buscar-o-crear, actualizar un array en la BBDD, y manejar la respuesta API. Complejidad baja-moderada.