# 02 - Prompt Library (MS-AUTH)

Plantillas breves para trabajar con LLMs en el microservicio de autenticación. Ajusta rutas/métodos según el código real.

## A. Login y políticas
"Eres dev NestJS. En `auth` implementa/ajusta login con: verificación de horario (ScheduleService), políticas de bloqueo por perfil, auditoría de intentos, y generación de access/refresh tokens. Usa repos `IAuthRepository`, `ISessionRepository`, `IScheduleRepository`, `IAuditRepository`."

## B. Refresh y sesiones
"Implementa RefreshTokenUseCase para validar refresh token hash y familia de tokens, renovar access/refresh tokens, y actualizar sesión (`rrfsesio`). Mantén sesión única si el perfil lo requiere."

## C. Logout y revocación
"Implementa LogoutUseCase y LogoutAllUseCase revocando sesiones activas vía SessionRepository. Asegura auditoría de logout y limpieza de refresh tokens." 

## D. Cambio de contraseña / recuperación
"En `auth` agrega ChangePasswordUseCase y ResetPasswordUseCase: valida política del perfil, verifica historial (`rrfhispw`), registra auditoría, y actualiza hash. Usa PasswordService y AuthRepository."

## E. Auditoría
"Asegura que cada evento (login, fail, lock, logout, refresh, reset) se registre en `rrfaulog` vía AuditRepository con campos de IP, userAgent, sessionUuid, motivo."

## F. Horarios y autorizaciones temporales
"Valida acceso con `rrfjorus` (horarios) y `rrfhisau` (autorizaciones temporales). Implementa ScheduleRepository y su uso en login." 

## G. Seeds y scripts
"Genera/actualiza scripts en `database/run-seed.ts` y `database/update-admin-password.ts` para crear admin y actualizar password conforme a la política del perfil." 

## H. Tests
"Escribe specs para usecases (login, refresh, logout, change/reset password), repos, services y controllers. Mockea repos y servicios de tiempo. Cobertura objetivo ≥80%."

## I. Postman / contratos
"Sincroniza rutas REST y NATS con la colección Postman `postman/MS-AUTH.postman_collection.json`. Mantén paridad entre controller y context." 
