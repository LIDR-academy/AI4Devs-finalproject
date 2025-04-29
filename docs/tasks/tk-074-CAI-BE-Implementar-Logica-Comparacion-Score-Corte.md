# Ticket: TK-074

## Título
CAI-BE: Implementar Lógica Comparación Score vs Umbral de Corte

## Descripción
Desarrollar la lógica dentro del servicio de Evaluación de Core AI que toma el `score.valor_general` calculado (TK-072) y el `evaluacion_corte` recuperado para la vacante (TK-071), y realiza la comparación numérica (`score >= corte`).

## User Story Relacionada
US-022: Comparar Score Calculado con Umbral de Corte (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método recibe como entrada el `score_general` (número) y el `umbral_corte` (número).
2.  Realiza la comparación `>=`.
3.  Devuelve un resultado booleano (`true` si `score_general >= umbral_corte`, `false` en caso contrario).
4.  Maneja correctamente casos donde alguna entrada sea inválida o nula (según la lógica definida en TK-071).

## Solución Técnica Propuesta (Opcional)
Implementar como un método simple dentro del servicio de Evaluación, invocado después del cálculo del score (TK-072) y antes de determinar la etapa sugerida (TK-075).

## Dependencias Técnicas (Directas)
* TK-071 (Provee el `umbral_corte`).
* TK-072 (Provee el `score_general`).
* TK-075 (Consume el resultado booleano - ticket siguiente).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-022)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Implementación de la comparación numérica simple y manejo básico de tipos]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, logic, service, evaluation, scoring, comparison

## Comentarios
Paso lógico simple pero necesario en el flujo de decisión.

## Enlaces o Referencias
N/A