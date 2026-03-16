# 01 - Microservice Overview (MS-AUTH)

## Propósito
Microservicio de autenticación y gestión de sesiones del ecosistema FINANTIX. Provee login, refresco de tokens, cierre de sesión, recuperación/cambio de contraseña y control de horarios y bloqueos.

## Stack y runtime
- NestJS 10, Node 20+
- PostgreSQL 15+
- Usa TypeORM para modelos y repos; JWT para access/refresh tokens.

## Dominios clave
- Usuarios (`rrfusuar`) con políticas por perfil (`rrfperfi`).
- Sesiones (`rrfsesio`) con refresh token hash y familia de tokens.
- Horarios de acceso (`rrfjorus` + catálogo `rrfdiasm`).
- Historial de contraseñas (`rrfhispw`).
- Auditoría de autenticación (`rrfaulog`).
- Recuperación de contraseña (`rrfpwrst`).
- Autorizaciones temporales (`rrfhisau`).

## Capacidades principales
- Login con políticas de bloqueo, horarios y auditoría.
- Refresh token y revocación (sesión única opcional por perfil).
- Logout individual y logout global.
- Cambio de contraseña y validación contra historial.
- Recuperación de contraseña (request/reset).
- Auditoría de eventos de autenticación.

## Estado actual (2025-01-27)
- Implementación marcada como completa en `avance_login.md`.
- Esquema TypeORM para usuario, perfil, sesión, horarios, historial, auditoría, reset password, autorizaciones temporales y catálogo de días.
- Scripts de seeding y actualización de password admin disponibles.
- Postman collection incluida.

## Archivos útiles
- Config env: [.env.example](3.%20desarrollo/backend/ms-auth/.env.example)
- Use cases: `src/modules/auth/application/usecases/`
- Models TypeORM: `src/modules/auth/infrastructure/models/`
- Repos: `src/modules/auth/infrastructure/repositories/`
- Controllers/NATS: `src/modules/auth/interface/`
- Migraciones/Seeds: `database/migrations` y `database/seeds`
- Scripts: `database/update-admin-password.ts`, `database/run-seed.ts`
