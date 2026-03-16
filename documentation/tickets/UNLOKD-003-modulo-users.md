# [UNLOKD-003] Implementar Módulo de Usuarios y Perfiles

## Tipo
- [x] Feature

## Épica
EPIC-1: Fundación - Autenticación y Usuarios

## Prioridad
- [x] P0 - High

## Sprint
Sprint 1 (06/01 - 19/01)

## Estimación
**Story Points**: 5

## Descripción
Implementar módulo de usuarios que permita obtener y actualizar perfil (display_name, avatar, presencia). Incluye integración con S3 para subida de avatares.

## Historia de Usuario Relacionada
- HU-003: Actualizar perfil de usuario

## Caso de Uso Relacionado
- UC-003: Gestionar Perfil

## Criterios de Aceptación
- [ ] Endpoint `GET /api/v1/users/me` (obtener perfil propio)
- [ ] Endpoint `PUT /api/v1/users/me` (actualizar perfil)
- [ ] Endpoint `PUT /api/v1/users/me/avatar` (subir avatar)
- [ ] Validación display_name (1-255 caracteres)
- [ ] Subida de imagen a S3 con redimensionamiento a 512x512px
- [ ] Eliminación de avatar anterior al subir nuevo
- [ ] Tests unitarios + E2E

## Tareas Técnicas
- [ ] Crear módulo `users/` con controller, service, repository
- [ ] Implementar `getProfile(userId)`
- [ ] Implementar `updateProfile(userId, data)`
- [ ] Implementar `uploadAvatar(userId, file)` con Sharp para redimensionar
- [ ] Configurar cliente S3 (AWS SDK o compatible)
- [ ] Crear DTOs: UserProfileDto, UpdateProfileDto
- [ ] Proteger endpoints con JwtAuthGuard
- [ ] Escribir tests

## Dependencias
- UNLOKD-001: Setup proyecto
- UNLOKD-002: Módulo auth (para JwtAuthGuard)

## Endpoints API
- GET `/api/v1/users/me`
- PUT `/api/v1/users/me`
- PUT `/api/v1/users/me/avatar` (multipart/form-data)

## Tablas DB
- USERS (display_name, avatar_url, presence_status, updated_at)

## Labels
`users`, `profile`, `backend`, `s3`, `sprint-1`

