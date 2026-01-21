# 05 - Diseño y Arquitectura (MS-AUTH)

## Diseño lógico
- Módulo `auth` con subcapas domain/application/infrastructure/interface.
- Perfiles definen políticas de contraseña, tokens, bloqueo y sesión única.
- Sesiones gestionadas con refresh token hash y familia de tokens.
- Horarios y autorizaciones temporales condicionan el acceso en login.

## Arquitectura interna
- Hexagonal / Ports & Adapters:
  - **domain**: entidades (Usuario, Perfil, Sesión, HorarioUsuario, AutorizacionTemporal, ResetPassword, Auditoría), value objects, ports.
  - **application**: usecases (login, refresh, logout, logoutAll, changePassword, forgotPassword, resetPassword, getProfile, getSessions, revokeSession).
  - **infrastructure**: repos TypeORM, services (password, tokens, schedule, auditoría), DTOs, enums, models.
  - **interface**: controllers REST y contexts NATS; módulos Nest.
- Tokens: access/refresh vía JwtTokenService; refresh token se guarda hasheado en `rrfsesio`.
- Políticas: se leen del `PerfilModel` (longitud, complejidad, historial, lockout, sesión única, tiempo de tokens).

## Flujos de negocio clave
1) Login: verifica usuario, estado, bloqueo, horario, políticas; genera tokens; crea sesión; audita éxito/falla; resetea intentos.
2) Refresh: valida hash/familia de refresh token, revoca/renueva según políticas, emite nuevos tokens.
3) Logout/LogoutAll: revoca sesión actual o todas las sesiones; audita.
4) Cambio/Recuperación de contraseña: valida política e historial; registra auditoría.

## Decisiones técnicas
- Hash de refresh token almacenado; familia de tokens para revocación.
- Auditoría persistente en `rrfaulog` para todos los eventos críticos.
- Horarios y autorizaciones temporales aplicados solo a usuarios no SISTEMA.
- Soft delete y flags de estado en usuarios; bloqueo con ventana y motivo.

## Patrones
- Hexagonal, Repository Pattern (TypeORM), Service Layer, DTOs, ApiResponse, auditoría centralizada.

## Contratos expuestos
- REST: controllers en `src/module/interface/controller` y `src/modules/auth/interface/controllers` (según estructura actual).
- NATS: contexts equivalentes en `interface/context` y `interface/nats`.
- Seeds/scripts: `database/run-seed.ts`, `database/update-admin-password.ts` para bootstrap.

## Notas de consistencia
- Mantener paridad entre REST y NATS con la colección Postman.
- Políticas de perfil deben reflejarse en servicios de password/tokens.
