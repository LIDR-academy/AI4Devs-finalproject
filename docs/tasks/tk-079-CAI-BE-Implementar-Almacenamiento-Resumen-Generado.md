# Ticket: TK-078

## Título
CAI-BE: Implementar Orquestación de Llamada a LLM para Generación de Resumen

## Descripción
Desarrollar la lógica dentro del servicio de Evaluación de Core AI que orquesta la generación del resumen. Debe: 1) Invocar la lógica de prompt engineering (TK-077). 2) Realizar la llamada al LLM externo usando la integración existente (TK-057) con el prompt específico para resumen. 3) Recibir la respuesta del LLM y extraer el texto del resumen. 4) Manejar errores específicos de este proceso.

## User Story Relacionada
US-025: Generar Resumen Ejecutivo del Candidato vs Vacante (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función/método `generateCandidateSummary(candidateData, vacancyRequirements)` que orquesta el proceso.
2.  Invoca a TK-077 para obtener el prompt de resumen.
3.  Invoca a TK-057 para realizar la llamada al LLM con ese prompt.
4.  Recibe la respuesta del LLM. Si hay error en la llamada, lo maneja y devuelve indicación de fallo.
5.  Si la llamada es exitosa, parsea la respuesta del LLM para extraer el texto del resumen generado.
6.  Devuelve el texto del resumen extraído (o null/error si falla la extracción).

## Solución Técnica Propuesta (Opcional)
Implementar como un método dentro del servicio de Evaluación, invocado opcionalmente durante el flujo principal de evaluación (TK-066). Reutilizar el cliente LLM de TK-057.

## Dependencias Técnicas (Directas)
* TK-077 (Generación del prompt).
* TK-057 (Integración/llamada LLM).
* TK-079 (Almacena el resumen generado).
* TK-066 (Orquestador que podría invocar esta lógica).

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-025)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Orquestación llamada, manejo respuesta/error específico de resumen]

## Asignación Inicial
Equipo Backend (Core AI) / AI Engineer

## Etiquetas
backend, core-ai, ai, llm, summary, evaluation, orchestrator

## Comentarios
Coordina la generación específica del resumen.

## Enlaces o Referencias
[Documentación API LLM sobre formato respuesta]