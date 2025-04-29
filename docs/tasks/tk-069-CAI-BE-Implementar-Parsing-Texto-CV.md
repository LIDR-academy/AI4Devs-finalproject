# Ticket: TK-069

## Título
CAI-BE: Implementar Parsing de Texto de CV para Datos Estructurados

## Descripción
Desarrollar la lógica principal de parsing dentro del servicio Core AI que toma el texto plano extraído de un CV (TK-068) y lo analiza para identificar y extraer información estructurada clave: Experiencia Laboral (empresa, puesto, fechas), Educación (institución, título, fechas), y Habilidades/Skills. Puede usar una combinación de reglas, NLP o llamadas a LLM (vía TK-057).

## User Story Relacionada
US-020: Extraer Datos Estructurados del CV (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función/método `parseCVText(cvText)` que recibe el texto plano del CV.
2.  Identifica secciones relevantes (Experiencia, Educación, Skills, etc.) usando heurísticas, regex, o modelos NLP/LLM.
3.  Dentro de cada sección identificada, extrae los datos estructurados correspondientes (ej. para experiencia: extraer triplets [empresa, puesto, rango_fechas]).
4.  Extrae una lista de skills/palabras clave técnicas mencionadas en el CV.
5.  Maneja la variabilidad de formatos y lenguajes (inicialmente enfocado en Español/Inglés según RX-09).
6.  Devuelve un objeto estructurado (ej. JSON) que contiene toda la información extraída.
7.  Si el parsing falla significativamente o no puede extraer información clave, devuelve una estructura vacía o un indicador de fallo parcial.
8.  La precisión del parsing cumple un umbral objetivo (KPI Fase 1).

## Solución Técnica Propuesta (Opcional)
* **Enfoque Híbrido:** Usar reglas/regex para datos muy estructurados (fechas, emails) y NLP/LLM (vía TK-057) para la identificación de secciones, extracción de skills y datos menos estructurados (descripción de puestos).
* Considerar librerías NLP como spaCy, NLTK o el LLM para Named Entity Recognition (NER) y relación de entidades.

## Dependencias Técnicas (Directas)
* TK-068 (Provee el texto a parsear).
* TK-057 (Si se usa LLM para el parsing).
* TK-070 (Almacena los datos parseados).
* (Opcional) Librerías NLP.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-020)

## Estimación Técnica Preliminar
[ 13 ] [horas] - [Alta complejidad: Diseño algoritmo parsing, implementación reglas/NLP/integración LLM, manejo múltiples formatos CV, pruebas exhaustivas]

## Asignación Inicial
Equipo Backend (Core AI) / AI Engineer

## Etiquetas
backend, core-ai, nlp, parsing, cv, information-extraction, regex, llm, ai, skills, experience, education

## Comentarios
Ticket técnicamente más complejo y crítico para la calidad de la evaluación IA. Requiere iteración y pruebas.

## Enlaces o Referencias
[Documentación librerías NLP, guías de parsing de CVs]