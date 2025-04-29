# Ticket: TK-072

## Título
CAI-BE: Implementar Algoritmo de Matching y Scoring v1 (Reglas)

## Descripción
Desarrollar la primera versión del algoritmo de matching y scoring dentro del servicio de Evaluación de Core AI. Debe comparar los datos estructurados del candidato (obtenidos en TK-071) con los requisitos de la vacante (también de TK-071) usando un enfoque basado en reglas simple pero efectivo para el MVP. Calculará un `score.valor_general` (0-100).

## User Story Relacionada
US-021: Calcular Score de Idoneidad Candidato vs Vacante (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función/clase `calculateScore(candidateData, vacancyRequirements)` que implementa el algoritmo.
2.  El algoritmo compara al menos:
    * Skills del candidato vs. skills requeridas/deseables (ej. % de coincidencia ponderado).
    * Años de experiencia calculados del candidato vs. años requeridos.
    * Nivel educativo del candidato vs. nivel requerido (si aplica).
3.  Se definen pesos/importancia para cada criterio comparado.
4.  Se calcula un `score.valor_general` final normalizado a 0-100.
5.  (Opcional) Se calculan `score.scores_parciales` por criterio (skills, experiencia, etc.).
6.  El algoritmo es determinista (misma entrada produce misma salida).
7.  El algoritmo maneja datos faltantes o incompletos de forma gracefully (ej. asignando score 0 para ese criterio).
8.  El algoritmo está documentado internamente (reglas, pesos).

## Solución Técnica Propuesta (Opcional)
* **Enfoque MVP:** Basado en reglas:
    * Asignar puntos por cada skill requerida encontrada. Puntos extra por skills deseables.
    * Asignar puntos si los años de experiencia cumplen/superan el mínimo.
    * Asignar puntos por nivel educativo.
    * Normalizar el total a 0-100.
* **Futuro:** Podría evolucionar a modelos ML (requeriría datos etiquetados y re-entrenamiento).

## Dependencias Técnicas (Directas)
* TK-071 (Provee los datos de entrada).
* TK-073 (Almacena los scores calculados).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-021)

## Estimación Técnica Preliminar
[ 8 ] [horas] - [Diseño algoritmo basado en reglas, implementación lógica comparación/ponderación, normalización, pruebas con datos ejemplo]

## Asignación Inicial
Equipo Backend (Core AI) / AI Engineer

## Etiquetas
backend, core-ai, ai, logic, service, evaluation, scoring, algorithm, rules-based, matching

## Comentarios
El corazón del scoring IA para MVP. Su efectividad dependerá del diseño de las reglas y pesos iniciales.

## Enlaces o Referencias
[Investigación sobre técnicas de scoring simples para CVs]