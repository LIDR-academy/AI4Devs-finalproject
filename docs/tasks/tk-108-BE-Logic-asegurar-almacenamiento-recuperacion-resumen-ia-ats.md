# Ticket: TK-108

## Título
BE-Logic: Asegurar Almacenamiento/Recuperación de `resumen_ia` en ATS

## Descripción
Implementar o modificar la lógica de negocio en el backend ATS que procesa la respuesta de evaluación completa recibida desde Core AI (RF-13/US-024). Si la respuesta de Core AI incluye un `resumen_generado`, este debe almacenarse en un campo adecuado (ej. `resumen_ia`) en la tabla `Candidatura` del ATS MVP. También asegurar que la lógica que obtiene detalles de candidatura pueda leer este campo.

## User Story Relacionada
US-033: Mostrar Resumen Generado por IA en Perfil de Candidatura

## Criterios de Aceptación Técnicos (Verificables)
1.  La tabla `Candidatura` en la BBDD del ATS tiene un campo `resumen_ia` (Text, Nullable). (Requiere migración si no existe).
2.  La lógica que maneja la respuesta de la API de evaluación de Core AI extrae el `resumen_generado` si está presente.
3.  Si se extrae un resumen, se guarda en el campo `Candidatura.resumen_ia` de la candidatura correspondiente.
4.  La lógica que obtiene los detalles de una candidatura (usada por TK-107) recupera el valor de `Candidatura.resumen_ia`.

## Solución Técnica Propuesta (Opcional)
Añadir el campo a la entidad/modelo `Candidatura` y al script de migración. Modificar el servicio que procesa la respuesta de Core AI para guardar el resumen.

## Dependencias Técnicas (Directas)
* Esquema BBDD `Candidatura` (definición de TK-044 necesita actualización).
* Lógica de procesamiento de respuesta de evaluación Core AI (implícita en el flujo post-US-019/US-024).
* TK-107 (Lógica API que lee este campo).

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-033)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Modificación schema BBDD + migración, modificar lógica de procesamiento respuesta Core AI]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, database, application, ai-summary, save, read

## Comentarios
Almacenar el resumen en ATS (denormalizar) simplifica su recuperación para mostrarlo en la UI.

## Enlaces o Referencias
[Documentación ORM/Migraciones]