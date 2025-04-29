# User Story: US-021

## Feature Asociada
Feature 4: Evaluación Inteligente de Candidaturas

## Título
Calcular Score de Idoneidad Candidato vs Vacante (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero poder comparar los datos extraídos del CV de un candidato con los requisitos de la vacante y calcular un score numérico de idoneidad
Para proporcionar una medida objetiva inicial que facilite la priorización.

## Detalles
Capacidad interna de Core AI para realizar el matching y scoring.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que se han extraído datos estructurados del CV (US-020).
2.  El Servicio de Evaluación recupera los requisitos de la vacante (ya sea de la JD o de parámetros específicos asociados a `DescripcionPuestoGenerada`).
3.  Se aplica un algoritmo de matching/scoring definido que compara los datos del candidato (skills, años de experiencia, tipo de formación) con los requisitos.
4.  El algoritmo calcula un `score.valor_general` numérico (ej. 0-100).
5.  (Opcional) El algoritmo calcula `score.scores_parciales` por categorías si está definido.
6.  El/los score(s) calculados se almacenan en la entidad `EvaluacionCandidatoIA`.
7.  La lógica de scoring es consistente y reproducible para la misma entrada.

## Requisito(s) Funcional(es) Asociado(s)
RF-12

## Prioridad: Must Have
* **Justificación:** Es el núcleo de la evaluación IA, entrega el valor principal de priorización objetiva.

## Estimación Preliminar (SP): 5
* **Justificación:** Requiere definir e implementar la lógica de matching y ponderación. La complejidad depende del algoritmo elegido (puede ir de simple a complejo), pero es moderada asumiendo un enfoque inicial pragmático. Depende fuertemente de la calidad de la entrada del parsing (US-020).