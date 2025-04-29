# Ticket: TK-080

## Título
CAI-BE: Investigar e Implementar Identificación de Soft Skills en Texto de CV

## Descripción
Investigar y desarrollar métodos dentro del servicio Core AI (Evaluación) para intentar identificar menciones o indicadores de soft skills (ej. comunicación, liderazgo, trabajo en equipo) a partir del texto extraído del CV (TK-068). Almacenar las soft skills identificadas (potencialmente con un nivel de confianza) junto con otros datos parseados (TK-070). (Opcional avanzado: considerar cómo podrían influir marginalmente en el scoring - TK-072).

## User Story Relacionada
US-026: Identificar/Evaluar Soft Skills del CV (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Se ha investigado y seleccionado un enfoque técnico viable para la identificación de soft skills (ej. basado en léxicos/keywords, modelos NLP específicos, o prompt a LLM).
2.  Se ha implementado la lógica para aplicar este enfoque al texto del CV extraído (TK-068).
3.  La lógica puede identificar un conjunto predefinido de soft skills objetivo.
4.  Las soft skills identificadas se almacenan en el campo `datos_extraidos_cv` de `EvaluacionCandidatoIA` (junto con los datos de TK-070).
5.  (Opcional avanzado) El algoritmo de scoring (TK-072) se modifica opcionalmente para considerar las soft skills identificadas (si aplica y con baja ponderación).
6.  La implementación maneja casos donde no se identifican soft skills y no genera errores.
7.  Se documenta el enfoque implementado y sus limitaciones conocidas.

## Solución Técnica Propuesta (Opcional)
* **Enfoque Léxico:** Crear/utilizar diccionarios de términos asociados a soft skills.
* **Enfoque NLP:** Usar técnicas como clasificación de texto o NER sobre frases/párrafos del CV.
* **Enfoque LLM:** Diseñar un prompt específico (vía TK-057) que pida al LLM identificar y listar soft skills del texto. Este es probablemente el enfoque más flexible pero requiere validación cuidadosa.

## Dependencias Técnicas (Directas)
* TK-068 (Provee el texto del CV).
* TK-070 (Almacena los resultados junto a otros datos parseados).
* (Opcional) TK-057 (Si se usa LLM).
* (Opcional) TK-072 (Si afecta al scoring).

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-026)

## Estimación Técnica Preliminar
[ 8 ] [horas] - [Alta incertidumbre y complejidad. Incluye investigación (2h), implementación enfoque elegido (4h), pruebas y documentación de limitaciones (2h).]

## Asignación Inicial
Equipo Backend (Core AI) / AI Engineer

## Etiquetas
backend, core-ai, ai, nlp, soft-skills, text-analysis, cv, parsing, research

## Comentarios
Ticket exploratorio y de baja prioridad para MVP. La fiabilidad de la identificación automática de soft skills es inherentemente limitada y debe tratarse con precaución.

## Enlaces o Referencias
[Artículos/Investigación sobre detección de soft skills en texto]