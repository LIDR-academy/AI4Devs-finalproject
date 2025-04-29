# Ticket: TK-106

## Título
BE-Logic: Modificar Lógica Post-Evaluación para Mover Candidato Automáticamente según Config

## Descripción
Modificar la lógica de negocio en el backend del ATS MVP que se ejecuta después de recibir una evaluación exitosa con una `etapa_sugerida` de Core AI. Debe leer la configuración global `enable_auto_stage_move` (usando TK-103). Si está habilitada, debe invocar la lógica de actualización de etapa (TK-097) usando la `etapa_sugerida` como destino.

## User Story Relacionada
US-032: Automatizar (Opcionalmente) Movimiento Inicial a Etapa Sugerida

## Criterios de Aceptación Técnicos (Verificables)
1.  En el punto del flujo donde el ATS recibe la `etapa_sugerida` válida de Core AI.
2.  Se invoca la lógica `getSystemSettings()` (TK-103) para obtener el valor de `enable_auto_stage_move`.
3.  Si `enable_auto_stage_move` es `true`:
    * Se invoca la lógica `updateApplicationStage()` (TK-097) pasando el `applicationId`, la `etapa_sugerida` como `newStageId`, y un ID de usuario de sistema/proceso (o null si se permite).
    * Se maneja el posible error de la actualización de etapa (ej. loguear).
4.  Si `enable_auto_stage_move` es `false`, no se invoca la lógica de actualización de etapa (el comportamiento sigue siendo el de US-028).
5.  El flujo principal continúa independientemente de si se realizó o no el movimiento automático.

## Solución Técnica Propuesta (Opcional)
Identificar el punto exacto en el flujo de recepción de evaluación (probablemente dentro o después de TK-045) donde añadir esta lógica condicional.

## Dependencias Técnicas (Directas)
* TK-103 (Lógica para leer la configuración)
* TK-097 (Lógica para actualizar la etapa, que será invocada)
* Flujo de recepción de evaluación de Core AI (punto de integración).

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-032)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Añadir lectura de config e invocación condicional a lógica existente]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, application, stage, update, automation, configuration

## Comentarios
Modifica un flujo existente para añadir el comportamiento automático opcional.

## Enlaces o Referencias
[TK-097]