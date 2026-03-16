# [UNLOKD-014] Implementar Servicio de Desbloqueo con Validaciones

## Tipo
- [x] Feature

## Épica
EPIC-3: Motor de Condiciones

## Sprint
Sprint 3

## Estimación
**Story Points**: 5

## Descripción
Implementar UnlockService que coordina validación de condiciones, actualización de estados, registro de intentos y notificaciones.

## Historia de Usuario Relacionada
- HU-009: Intentar desbloquear mensaje condicionado

## Caso de Uso Relacionado
- UC-009: Intentar Desbloquear Mensaje Condicionado

## Criterios de Aceptación
- [ ] POST `/api/v1/messages/{messageId}/unlock` implementado
- [ ] Validación de permisos (miembro del chat, no emisor)
- [ ] Uso de ConditionFactory para obtener strategy
- [ ] Actualización de status a UNLOCKED si éxito
- [ ] Registro de intento en MESSAGE_UNLOCK_ATTEMPTS
- [ ] Notificación al emisor vía WebSocket
- [ ] Tests unitarios + E2E

## Tareas Técnicas
- [ ] Crear `UnlockService`
- [ ] Implementar `unlockMessage(messageId, userId, unlockData)`
- [ ] Validar permisos y estado del mensaje
- [ ] Obtener strategy y validar condición
- [ ] Actualizar MESSAGES si éxito
- [ ] Registrar intento
- [ ] Emitir evento messageUnlocked
- [ ] Escribir tests

## Labels
`conditions`, `unlock`, `backend`, `sprint-3`, `p1-high`

