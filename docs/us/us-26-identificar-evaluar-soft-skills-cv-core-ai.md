# User Story: US-026

## Feature Asociada
Feature 4: Evaluación Inteligente de Candidaturas

## Título
Identificar/Evaluar Soft Skills del CV (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero intentar identificar menciones de soft skills en el CV y potencialmente incluirlas en la evaluación
Para ofrecer una visión un poco más completa del candidato, si es posible y relevante.

## Detalles
Capacidad interna de Core AI para realizar análisis de texto enfocado en soft skills. Probablemente requiera NLP avanzado o LLMs (RF-22).

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que se procesa el texto del CV (US-020).
2.  El sistema aplica técnicas (ej. listas de palabras clave, modelos NLP, llamada a LLM) para identificar posibles menciones de soft skills predefinidas (ej. comunicación, liderazgo).
3.  Las soft skills identificadas (con un nivel de confianza si es posible) se almacenan junto a otros datos extraídos en `EvaluacionCandidatoIA.datos_extraidos_cv`.
4.  (Opcional avanzado) Si la vacante especifica soft skills relevantes, estas se podrían considerar (con baja ponderación inicial) en el cálculo del score (US-021).
5.  La identificación es robusta frente a variaciones en la forma de expresar las skills en el CV.

## Requisito(s) Funcional(es) Asociado(s)
RF-36

## Prioridad: Could Have
* **Justificación:** Funcionalidad avanzada y de precisión limitada basada solo en CV. No esencial para MVP.

## Estimación Preliminar (SP): 8
* **Justificación:** La detección fiable de soft skills a partir de texto libre es muy compleja. Requiere investigación, posiblemente entrenamiento de modelos específicos o uso avanzado de LLMs (RF-22), y validación exhaustiva. Alta complejidad e incertidumbre.