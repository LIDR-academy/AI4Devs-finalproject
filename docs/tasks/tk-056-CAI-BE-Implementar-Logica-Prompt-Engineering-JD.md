# Ticket: TK-056

## Título
CAI-BE: Implementar Lógica de Prompt Engineering para Generación de JD

## Descripción
Desarrollar la lógica dentro del servicio Core AI que construye el prompt (instrucción textual) que se enviará al LLM externo para solicitar la generación de la JD. El prompt debe ser diseñado para maximizar la calidad, estructura y relevancia de la JD generada, utilizando los datos básicos de la vacante recibidos como input y aplicando las mejores prácticas de prompt engineering.

## User Story Relacionada
US-015: Generar Borrador de JD Usando IA (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función/clase responsable de generar el prompt para la JD.
2.  Recibe como entrada los datos básicos de la vacante (título, reqs clave, depto, etc.).
3.  Construye un prompt textual que incluye:
    * Instrucciones claras sobre el formato deseado (secciones: Responsabilidades, Requisitos, Beneficios, etc.).
    * El rol/tono deseado (ej. profesional, atractivo).
    * Los datos específicos de la vacante incorporados en las instrucciones.
    * (Opcional) Técnicas de prompt como few-shot examples si mejoran el resultado.
4.  (Opcional US-017) Si TK-059 (Usar datos internos) está implementado, incorpora información relevante de fuentes internas en el prompt.
5.  El prompt generado es pasado a la lógica de integración con LLM (TK-057).
6.  El diseño del prompt es versionable/configurable para facilitar iteraciones y mejoras.

## Solución Técnica Propuesta (Opcional)
Usar plantillas de texto (templating engines) o simplemente construcción de strings. Iterar en el diseño del prompt basándose en pruebas con el LLM elegido.

## Dependencias Técnicas (Directas)
* TK-055 (Invoca esta lógica)
* TK-057 (Recibe el prompt generado)
* TK-059 (Opcional, para usar datos internos)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-015)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Diseño inicial del prompt, implementación de la construcción, pruebas/iteraciones básicas]

## Asignación Inicial
Equipo Backend (Core AI) / AI Engineer

## Etiquetas
backend, core-ai, ai, llm, prompt-engineering, generate-jd, nlp

## Comentarios
La calidad del prompt es CRÍTICA para la calidad de la JD generada. Requiere experimentación.

## Enlaces o Referencias
[Guías de Prompt Engineering para el LLM elegido]