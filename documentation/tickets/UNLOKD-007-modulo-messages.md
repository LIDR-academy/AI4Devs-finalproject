# [UNLOKD-007] Implementar Módulo de Mensajes (Envío y Recepción)

## Tipo
- [x] Feature

## Épica
EPIC-2: Mensajería Básica

## Prioridad
- [x] P0 - Blocker

## Sprint
Sprint 2 (20/01 - 02/02)

## Estimación
**Story Points**: 5

## Descripción
Implementar módulo de mensajes básicos (texto simple sin condiciones), incluyendo envío, almacenamiento, obtención de timeline con paginación cursor-based.

## Historia de Usuario Relacionada
- HU-005: Enviar mensaje de texto simple
- HU-006: Ver timeline de mensajes

## Caso de Uso Relacionado
- UC-006: Ver Historial de Mensajes

## Criterios de Aceptación
- [ ] POST `/api/v1/messages` (enviar mensaje)
- [ ] GET `/api/v1/chats/{chatId}/messages` (timeline paginado)
- [ ] Paginación cursor-based con `before` y `limit`
- [ ] Validación de permisos (solo miembros pueden enviar/ver)
- [ ] Actualización de last_read_at en CHAT_MEMBERS
- [ ] Tests unitarios + E2E

## Tareas Técnicas
- [ ] Crear módulo `messages/`
- [ ] Implementar `createMessage(userId, chatId, data)`
- [ ] Implementar `getChatMessages(chatId, userId, pagination)`
- [ ] Crear DTOs: CreateMessageDto, MessageDto
- [ ] Escribir tests

## Tablas DB
- MESSAGES

## Labels
`messages`, `backend`, `sprint-2`

