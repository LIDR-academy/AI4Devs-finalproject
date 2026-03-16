# [UNLOKD-008] Implementar WebSocket Gateway para Tiempo Real

## Tipo
- [x] Feature

## Épica
EPIC-2: Mensajería Básica

## Prioridad
- [x] P0 - Blocker

## Sprint
Sprint 2

## Estimación
**Story Points**: 8

## Descripción
Implementar gateway WebSocket con Socket.IO para mensajería en tiempo real. Autenticación JWT en handshake, rooms por chat, eventos newMessage, messageRead.

## Historia de Usuario Relacionada
- HU-005, HU-006

## Criterios de Aceptación
- [ ] WebSocket Gateway con Socket.IO configurado
- [ ] Autenticación JWT en handshake
- [ ] Rooms por chatId
- [ ] Eventos: `newMessage`, `messageRead`, `userTyping`
- [ ] Tests de conexión y eventos

## Tareas Técnicas
- [ ] Instalar `@nestjs/websockets`, `socket.io`
- [ ] Crear `realtime.gateway.ts`
- [ ] Implementar autenticación en `handleConnection`
- [ ] Implementar join/leave rooms por chatId
- [ ] Emitir eventos newMessage a room
- [ ] Escribir tests

## Labels
`websocket`, `realtime`, `backend`, `sprint-2`, `p0-blocker`

