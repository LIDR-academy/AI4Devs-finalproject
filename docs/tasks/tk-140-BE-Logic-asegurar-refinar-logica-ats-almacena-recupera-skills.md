# Ticket: TK-140

## Título
BE-Logic: (Asegurar/Refinar) Lógica ATS Almacena/Recupera Skills Detectadas

## Descripción
Asegurar o refinar la lógica de negocio en el backend ATS que procesa la respuesta de evaluación completa recibida desde Core AI (RF-13/US-024). Si la respuesta de Core AI incluye una lista de `detected_skills`, esta lista debe almacenarse en un campo adecuado (ej. `detected_skills` de tipo JSON o Array) en la tabla `Candidatura` o una tabla relacionada en el ATS MVP. Asegurar también que la lógica que obtiene detalles de candidatura pueda leer este campo.

## User Story Relacionada
US-040: Capturar Feedback Detallado sobre Evaluación IA (depende de esta data)

## Criterios de Aceptación Técnicos (Verificables)
1.  La tabla `Candidatura` (o relacionada) en la BBDD del ATS tiene un campo `detected_skills` (JSON/Array, Nullable). (Requiere migración si no existe).
2.  La lógica que maneja la respuesta de la API de evaluación de Core AI extrae la lista `detected_skills` si está presente.
3.  Si se extrae una lista de skills, se guarda en el campo `Candidatura.detected_skills` (o relacionado).
4.  La lógica que obtiene los detalles de una candidatura (usada por TK-139) recupera el valor de `detected_skills`.

## Solución Técnica Propuesta (Opcional)
Añadir/modificar el campo en la entidad/modelo `Candidatura` y el script de migración. Modificar el servicio que procesa la respuesta de Core AI para guardar las skills. Usar JSONB/Array nativo de la BBDD.

## Dependencias Técnicas (Directas)
* Esquema BBDD `Candidatura`.
* Lógica de procesamiento de respuesta de evaluación Core AI.
* TK-139 (Lógica API que lee este campo).
* Necesidad de que Core AI (US-020/US-024) devuelva las skills detectadas al ATS.

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-040)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Modificación schema BBDD + migración, modificar lógica procesamiento respuesta Core AI]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, database, application, skills, save, read, json

## Comentarios
Almacenar las skills detectadas en ATS simplifica su recuperación para la UI de feedback.

## Enlaces o Referencias
[Documentación ORM/Migraciones sobre JSON/Arrays]