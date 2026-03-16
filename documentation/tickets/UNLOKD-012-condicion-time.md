# [UNLOKD-012] Implementar Condición TIME (Temporal)

## Tipo
- [x] Feature

## Épica
EPIC-3: Motor de Condiciones

## Sprint
Sprint 3

## Estimación
**Story Points**: 5

## Descripción
Implementar condición TIME: mensajes que se desbloquean en fecha/hora específica. Incluye scheduler con BullMQ para desbloqueos automáticos.

## Historia de Usuario Relacionada
- HU-007: Enviar mensaje con condición temporal

## Caso de Uso Relacionado
- UC-007: Enviar Mensaje con Condición Temporal

## Criterios de Aceptación
- [ ] TimeConditionStrategy implementado
- [ ] Validación: available_from > NOW()
- [ ] Scheduler con BullMQ para notificaciones
- [ ] Job programado al crear mensaje TIME
- [ ] Desbloqueo automático al llegar la hora
- [ ] Notificación push al receptor
- [ ] Tests unitarios + E2E

## Tareas Técnicas
- [ ] Implementar `TimeConditionStrategy.validate()`
- [ ] Configurar BullMQ queue
- [ ] Crear `NotificationScheduler.scheduleUnlock()`
- [ ] Procesar jobs al llegar available_from
- [ ] Actualizar status mensaje a UNLOCKED
- [ ] Emitir evento WebSocket
- [ ] Escribir tests

## Labels
`conditions`, `time`, `scheduler`, `bullmq`, `sprint-3`, `p1-high`

