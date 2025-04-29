# Ticket: TK-070

## Título
CAI-BE: Implementar Almacenamiento de Datos Parseados del CV

## Descripción
Desarrollar la lógica dentro del servicio Core AI para tomar el objeto estructurado con los datos parseados del CV (generado en TK-069) y almacenarlo de forma persistente, típicamente como parte de la entidad `EvaluacionCandidatoIA` asociada a la evaluación en curso.

## User Story Relacionada
US-020: Extraer Datos Estructurados del CV (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función/método `saveParsedData(evaluacionId, parsedData)` que recibe el ID de la evaluación y el objeto JSON con los datos parseados.
2.  Busca la entidad `EvaluacionCandidatoIA` correspondiente a `evaluacionId`.
3.  Actualiza un campo específico en `EvaluacionCandidatoIA` (ej. `datos_extraidos_cv` de tipo JSON/Document) con el `parsedData` recibido.
4.  Guarda (UPDATE) la entidad `EvaluacionCandidatoIA` en la base de datos de Core AI.
5.  Maneja errores de base de datos.

## Solución Técnica Propuesta (Opcional)
Usar el ORM/ODM para actualizar el campo JSON/Documento en la entidad `EvaluacionCandidatoIA`.

## Dependencias Técnicas (Directas)
* TK-069 (Provee los datos parseados).
* Lógica de creación/obtención de `EvaluacionCandidatoIA` (necesita ticket si no está implícita en el flujo de TK-066). *Asumimos que se crea una entidad `EvaluacionCandidatoIA` al inicio del flujo TK-066*.
* Esquema BBDD Core AI con entidad `EvaluacionCandidatoIA` y campo `datos_extraidos_cv` (necesita ticket de BBDD si no existe).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-020)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Implementación lógica de actualización BBDD, manejo JSON/Documento]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, database, save, parsing, cv, json

## Comentarios
Requiere definición del esquema de `EvaluacionCandidatoIA`.

## Enlaces o Referencias
[Modelo de Datos Fase 5], [Documentación ORM/ODM sobre JSON/Document]