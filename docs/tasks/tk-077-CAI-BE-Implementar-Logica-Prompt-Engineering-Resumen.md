# Ticket: TK-077

## Título
CAI-BE: Implementar Lógica de Prompt Engineering para Generación de Resumen de Candidato

## Descripción
Desarrollar la lógica dentro del servicio Core AI (Evaluación) que construye el prompt que se enviará al LLM externo para solicitar la generación de un resumen conciso del candidato en relación a la vacante. Debe usar los datos parseados del CV (TK-070) y los requisitos de la vacante (TK-071) para crear un prompt que pida destacar puntos fuertes/débiles y adecuación general.

## User Story Relacionada
US-025: Generar Resumen Ejecutivo del Candidato vs Vacante (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función/clase responsable de generar el prompt para el resumen.
2.  Recibe como entrada los datos estructurados del candidato y los requisitos de la vacante.
3.  Construye un prompt textual que instruye al LLM para:
    * Generar un resumen breve (ej. <100 palabras).
    * Comparar al candidato con los requisitos clave de la vacante.
    * Mencionar puntos fuertes y/o débiles relevantes.
4.  El prompt generado se pasa a la lógica de generación de resumen (TK-078).
5.  El diseño del prompt es configurable/mejorable.

## Solución Técnica Propuesta (Opcional)
Similar a TK-056, usar plantillas o construcción de strings. Requiere experimentación para obtener resúmenes útiles y concisos.

## Dependencias Técnicas (Directas)
* TK-071 (Provee los inputs: datos candidato y requisitos).
* TK-078 (Consume el prompt generado).

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-025)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Diseño inicial del prompt, implementación construcción, pruebas/iteraciones básicas]

## Asignación Inicial
Equipo Backend (Core AI) / AI Engineer

## Etiquetas
backend, core-ai, ai, llm, prompt-engineering, summary, evaluation, nlp

## Comentarios
La calidad del resumen depende críticamente de este prompt.

## Enlaces o Referencias
[Guías de Prompt Engineering para el LLM elegido]