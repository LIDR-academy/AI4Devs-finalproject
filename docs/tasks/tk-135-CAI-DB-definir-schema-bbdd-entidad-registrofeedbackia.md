# Ticket: TK-135

## Título
CAI-DB: Definir Esquema BBDD para Entidad `RegistroFeedbackIA`

## Descripción
Crear o definir la tabla/colección `RegistroFeedbackIA` en la base de datos de Core AI. Debe incluir campos para identificar la evaluación asociada (`evaluacion_ia_id`), el usuario que dio el feedback (`usuario_ats_id`), el tipo de feedback (`tipo_feedback`), los datos específicos del feedback (`datos_feedback`), y la fecha (`fecha_feedback`).

## User Story Relacionada
US-039: Recibir y Almacenar Feedback de Usuario (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un script de migración o definición ORM/ODM para la entidad `RegistroFeedbackIA`.
2.  La entidad incluye campos como: `id` (PK, UUID), `evaluacion_ia_id` (FK/UUID, IDX), `candidatura_ats_id` (UUID, IDX, para contexto), `usuario_ats_id` (UUID), `tipo_feedback` (String/Enum, Not Null), `datos_feedback` (JSON/Text, Nullable), `fecha_feedback` (Timestamp, Not Null).
3.  Se definen los posibles valores para `tipo_feedback` (ej. 'SCORE_VALIDADO_UP', 'SCORE_VALIDADO_DOWN', 'SCORE_AJUSTADO', 'SKILL_VALIDADA', etc.).
4.  El campo `datos_feedback` es flexible (JSON/TEXT) para acomodar diferentes tipos de feedback.
5.  La definición se ha aplicado en el entorno de desarrollo de Core AI.
6.  Se consideran índices necesarios (ej. en `evaluacion_ia_id`).

## Solución Técnica Propuesta (Opcional)
Usar la base de datos elegida para Core AI (Relacional o NoSQL). JSONB/Documento es ideal para `datos_feedback`.

## Dependencias Técnicas (Directas)
* Elección de Base de Datos Core AI.
* Definición de los tipos de feedback a almacenar.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-039)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Definición modelo/tabla, script migración, aplicación inicial]

## Asignación Inicial
Equipo Backend (Core AI) / DBA

## Etiquetas
backend, core-ai, database, schema, migration, feedback, learning

## Comentarios
Define dónde y cómo se guarda el feedback para el aprendizaje futuro.

## Enlaces o Referencias
[Modelo de Datos Fase 5], [Documentación ORM/ODM]