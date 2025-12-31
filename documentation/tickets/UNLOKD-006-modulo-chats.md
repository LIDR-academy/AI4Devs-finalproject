# [UNLOKD-006] Implementar Módulo de Chats (Crear Chat 1-a-1)

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
Implementar módulo de chats que permita crear chats 1-a-1 entre usuarios. Detectar chats duplicados y redirigir al existente. Incluye gestión de miembros de chat con roles.

## Historia de Usuario Relacionada
- HU-004: Crear chat 1-a-1 con un contacto

## Caso de Uso Relacionado
- UC-005: Crear Chat 1-a-1

## Criterios de Aceptación
- [ ] Endpoint `POST /api/v1/chats` (crear chat)
- [ ] Endpoint `GET /api/v1/chats` (listar chats del usuario)
- [ ] Endpoint `GET /api/v1/chats/{chatId}` (detalles del chat)
- [ ] Detección de chat duplicado (retornar existente si ya hay uno entre ambos usuarios)
- [ ] Generación de public_id (UUID) para el chat
- [ ] Creación de miembros con roles (OWNER para creador, MEMBER para contacto)
- [ ] Validación de permisos (solo miembros pueden ver el chat)
- [ ] Tests unitarios + E2E

## Tareas Técnicas
- [ ] Crear módulo `chats/` con controller, service, repository
- [ ] Implementar `createDirectChat(creatorId, contactId)`
- [ ] Implementar `findDirectChatBetweenUsers(user1Id, user2Id)`
- [ ] Implementar `getChatsByUserId(userId)`
- [ ] Implementar `getChatDetails(chatId, userId)`
- [ ] Crear DTOs: CreateChatDto, ChatDto, ChatMemberDto
- [ ] Proteger endpoints con JwtAuthGuard
- [ ] Escribir tests

## Dependencias
- UNLOKD-001: Setup proyecto
- UNLOKD-002: Módulo auth
- UNLOKD-003: Módulo users (para contactos)

## Endpoints API
- POST `/api/v1/chats`
- GET `/api/v1/chats`
- GET `/api/v1/chats/{chatId}`

## Tablas DB
- CHATS (public_id, type='DIRECT', created_by, created_at)
- CHAT_MEMBERS (chat_id, user_id, role, joined_at)

## Labels
`chats`, `backend`, `sprint-2`, `p0-blocker`

