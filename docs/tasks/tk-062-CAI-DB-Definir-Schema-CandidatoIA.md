# Ticket: TK-062

## Título
CAI-BE: Definir Esquema BBDD Core AI para Entidad `CandidatoIA`

## Descripción
Crear la tabla/colección `CandidatoIA` en la base de datos de Core AI para almacenar el perfil unificado del candidato. Debe incluir campos como `id` (PK), `email` (Unique Key), `nombre_completo`, `telefono`, `candidaturas_ids` (Array de UUIDs), `fecha_creacion`, `fecha_actualizacion`, y opcionalmente `tags_agregados`, `perfil_enriquecido`.

## User Story Relacionada
US-018: Gestionar Perfil Unificado de Candidato en IA (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un script de migración de BBDD o definición de modelo (ORM/ODM) para la entidad `CandidatoIA`.
2.  La entidad incluye los campos: `id` (UUID, PK), `email` (String, Unique, Not Null), `nombre_completo` (String, Nullable), `telefono` (String, Nullable), `candidaturas_ids` (Array de UUIDs, Not Null), `fecha_creacion` (Timestamp), `fecha_actualizacion` (Timestamp).
3.  (Opcional Should/Could Have) Se incluyen campos `tags_agregados` (Array String), `perfil_enriquecido` (JSON/Text).
4.  Se ha aplicado la definición/migración correctamente en el entorno de desarrollo de Core AI.
5.  El índice UNIQUE en `email` está creado.

## Solución Técnica Propuesta (Opcional)
Usar BBDD Relacional (PostgreSQL) o NoSQL/Documental (MongoDB) para Core AI. Un array de UUIDs es factible en ambos. JSONB/Documento para `perfil_enriquecido`.

## Dependencias Técnicas (Directas)
* Elección de Base de Datos para Core AI.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-018)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Definición modelo, script migración/definición, aplicación inicial]

## Asignación Inicial
Equipo Backend (Core AI) / DBA

## Etiquetas
backend, core-ai, database, schema, migration, candidate, profile

## Comentarios
Estructura central para la vista unificada del candidato en IA.

## Enlaces o Referencias
[Modelo de Datos Fase 5], [Documentación ORM/ODM]