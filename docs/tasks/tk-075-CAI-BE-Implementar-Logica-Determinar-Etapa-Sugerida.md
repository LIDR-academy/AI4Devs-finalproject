# Ticket: TK-075

## Título
CAI-BE: Implementar Lógica Determinar Etapa Sugerida

## Descripción
Desarrollar la lógica dentro del servicio de Evaluación de Core AI que, basándose en el resultado booleano de la comparación score vs corte (TK-074) y los identificadores de `etapa_pre_aceptacion` y `etapa_pre_rechazo` recuperados de la `DescripcionPuestoGenerada` (TK-071), determina cuál es la `etapa_sugerida` final.

## User Story Relacionada
US-023: Determinar Etapa de Pipeline Sugerida (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método recibe como entrada el resultado booleano `supera_corte` (de TK-074) y los identificadores `id_etapa_aceptacion`, `id_etapa_rechazo` (de TK-071).
2.  Si `supera_corte` es `true`, la función devuelve el `id_etapa_aceptacion`.
3.  Si `supera_corte` es `false`, la función devuelve el `id_etapa_rechazo`.
4.  Maneja correctamente casos donde los IDs de etapa de entrada sean inválidos o nulos (según lógica definida en TK-071).

## Solución Técnica Propuesta (Opcional)
Implementar como un método simple dentro del servicio de Evaluación, invocado después de la comparación (TK-074) y antes de construir la respuesta final (TK-076).

## Dependencias Técnicas (Directas)
* TK-074 (Provee el resultado booleano `supera_corte`).
* TK-071 (Provee los `id_etapa_aceptacion`, `id_etapa_rechazo`).
* TK-076 (Consume el resultado `etapa_sugerida` - ticket siguiente).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-023)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Implementación de la lógica condicional simple]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, logic, service, evaluation, scoring, stage-suggestion

## Comentarios
Lógica muy simple pero crucial para la funcionalidad de sugerencia de etapa.

## Enlaces o Referencias
N/A