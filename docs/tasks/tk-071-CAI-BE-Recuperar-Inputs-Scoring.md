# Ticket: TK-071

## Título
CAI-BE: Recuperar Inputs Necesarios para Scoring (Datos CV y Requisitos Vacante)

## Descripción
Implementar la lógica dentro del servicio de Evaluación de Core AI para obtener toda la información necesaria antes de ejecutar el algoritmo de scoring. Esto incluye: 1) Recuperar los datos estructurados del CV parseado (almacenados por TK-070 en `EvaluacionCandidatoIA`). 2) Recuperar los requisitos relevantes de la vacante (ej. skills requeridas, años experiencia, nivel estudios) a partir de la entidad `DescripcionPuestoGenerada` asociada a la `vacante_ats_id`.

## User Story Relacionada
US-021: Calcular Score de Idoneidad Candidato vs Vacante (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función/método que, dado un `evaluacionId` o `vacante_ats_id`, puede recuperar los `datos_extraidos_cv` de la `EvaluacionCandidatoIA` correspondiente.
2.  Existe una función/método que, dado un `vacante_ats_id`, puede recuperar la entidad `DescripcionPuestoGenerada` asociada.
3.  Se extraen/interpretan los requisitos clave de la vacante desde `DescripcionPuestoGenerada` (ej. lista de skills obligatorias/deseables, años de experiencia mínima). *Nota: Esto puede requerir que la JD generada (US-015) o los parámetros (US-013) definan estos requisitos de forma estructurada o semi-estructurada.*
4.  Los datos del CV y los requisitos de la vacante están disponibles en un formato utilizable por el algoritmo de scoring (TK-072).
5.  Maneja errores si los datos del CV o los requisitos de la vacante no están disponibles o son incompletos.

## Solución Técnica Propuesta (Opcional)
Implementar como paso previo dentro del flujo de evaluación orquestado por TK-066. Usar ORM/ODM para leer de las entidades `EvaluacionCandidatoIA` y `DescripcionPuestoGenerada`.

## Dependencias Técnicas (Directas)
* TK-070 (Almacenamiento datos parseados CV)
* TK-060 (Almacenamiento params IA / `DescripcionPuestoGenerada`)
* TK-062 (Schema `CandidatoIA` - aunque no directo, conceptualmente relacionado)
* Esquema BBDD `EvaluacionCandidatoIA` y `DescripcionPuestoGenerada`.
* TK-072 (Consume estos inputs).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-021)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Implementación lógica de recuperación de datos desde 2 entidades BBDD, interpretación básica de requisitos]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, logic, service, evaluation, scoring, data-retrieval

## Comentarios
La interpretación de los requisitos de la vacante puede volverse compleja si no están bien estructurados.

## Enlaces o Referencias
[Modelo de Datos Fase 5]