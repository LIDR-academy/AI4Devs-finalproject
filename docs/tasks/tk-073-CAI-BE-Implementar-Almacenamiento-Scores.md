# Ticket: TK-073

## Título
CAI-BE: Implementar Almacenamiento de Scores Calculados

## Descripción
Desarrollar la lógica dentro del servicio Core AI para tomar los scores calculados por el algoritmo (TK-072) y almacenarlos de forma persistente en la entidad `EvaluacionCandidatoIA` asociada a la evaluación en curso.

## User Story Relacionada
US-021: Calcular Score de Idoneidad Candidato vs Vacante (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función/método `saveScoreData(evaluacionId, scoreData)` que recibe el ID de la evaluación y el objeto con los scores (`valor_general`, `scores_parciales` opcional).
2.  Busca la entidad `EvaluacionCandidatoIA` correspondiente a `evaluacionId`.
3.  Actualiza los campos correspondientes en `EvaluacionCandidatoIA` (ej. un subdocumento/JSON `score` con los valores calculados).
4.  Guarda (UPDATE) la entidad `EvaluacionCandidatoIA` en la base de datos de Core AI.
5.  Maneja errores de base de datos.

## Solución Técnica Propuesta (Opcional)
Usar el ORM/ODM para actualizar los campos de score en la entidad `EvaluacionCandidatoIA`.

## Dependencias Técnicas (Directas)
* TK-072 (Provee los scores calculados).
* Lógica de creación/obtención de `EvaluacionCandidatoIA`.
* Esquema BBDD Core AI con entidad `EvaluacionCandidatoIA` y campos/estructura para almacenar el score (necesita ticket de BBDD si no existe).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-021)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Implementación lógica de actualización BBDD para los campos de score]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, database, save, evaluation, scoring

## Comentarios
Requiere definición del esquema de `EvaluacionCandidatoIA` para el score.

## Enlaces o Referencias
[Modelo de Datos Fase 5], [Documentación ORM/ODM]