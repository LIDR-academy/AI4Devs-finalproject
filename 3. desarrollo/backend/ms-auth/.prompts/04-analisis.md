# 04 - Análisis del Microservicio MS-AUTH

## Propósito
Proveer autenticación, emisión/renovación de tokens y control de sesiones para el ecosistema FINANTIX, con políticas de seguridad basadas en perfiles.

## Problema que resuelve
Centraliza login y control de acceso, aplica políticas de contraseña, bloqueo, horario y auditoría de eventos de autenticación, garantizando sesiones y tokens consistentes.

## Alcance funcional
- Login con verificación de estado, bloqueo, horario y auditoría.
- Refresh token y manejo de familias de tokens/sesiones.
- Logout individual y global.
- Cambio y recuperación de contraseña (request/reset) con historial.
- Gestión de sesiones activas y revocación.
- Auditoría de eventos de autenticación.

## Alcance no funcional
- NestJS + TypeORM + PostgreSQL + JWT.
- Policies derivadas de `PerfilModel` (contraseña, tokens, bloqueo, sesión única).
- Hash de refresh token almacenado; soft delete en usuarios.
- Logging/auditoría en `rrfaulog`.

## Supuestos y restricciones
- PostgreSQL operativo con esquema rrf* cargado; migraciones aplicadas.
- Seeds ejecutados para admin (`database/seeds`, `database/run-seed.ts`).
- NATS/REST expuestos según controllers/contexts del módulo auth.

## Relaciones con otros microservicios
- No se documentan dependencias externas explícitas en el repo; el servicio es autónomo para autenticación dentro del dominio FINANTIX.

## Estado de desarrollo (real)
- Avance marcado como "Implementación Completa" (2025-01-27) en `avance_login.md`.
- Scripts de seed y actualización de password admin presentes.
- Colección Postman incluida.
- Sin resumen de cobertura de tests en el repo; requiere verificación.
