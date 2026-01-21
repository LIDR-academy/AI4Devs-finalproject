# 06 - Modelo de Datos (MS-AUTH)

Tablas usadas por el microservicio según las implementaciones descritas.

## Tablas núcleo
### rrfusuar (Usuario)
- **Descripción**: Credenciales y estado del usuario.
- **Campos clave (según modelos)**: id, uuid, username, nombreCompleto, email, passwordHash, empresaId, oficinaId, perfilId, empleadoId, tipoUsuario, esAdmin, accesoGlobal, fechaUltimoPassword, forzarCambioPassword, passwordNuncaExpira, intentosFallidos, fechaPrimerIntentoFallido, bloqueadoHasta, motivoBloqueo, fechaUltimoLogin, ultimaIpLogin, mfaActivado, totpSecret, activo, esSistema, fechaEliminacion.
- **PK**: id.
- **FK**: perfilId → rrfperfi.
- **Uso**: Lectura/Escritura (login, cambio/reset password, bloqueo, auditoría). Soft delete.

### rrfperfi (Perfil)
- **Descripción**: Políticas de seguridad por perfil.
- **Campos clave**: nombre, descripcion, accessTokenMinutes, refreshTokenDays, min/max password length, requiereMayuscula/minuscula/numero/especial, diasVigenciaPassword, historialPasswordCount, maxIntentosFallidos, minutosBloqueo, ventanaMinutos, sesionUnica, timeoutMinutos, requiereMFA, activo, esDefecto.
- **PK**: id.
- **Uso**: Lectura en login/refresh para aplicar políticas.

### rrfsesio (Sesión)
- **Descripción**: Gestión de sesiones y refresh tokens.
- **Campos clave**: id, uuid, usuarioId, refreshTokenHash, tokenFamily, ipLogin, userAgent, deviceFingerprint, deviceName, activo, fechaCreacion, fechaExpiracion, fechaUltimaActividad, fechaRevocacion, motivoRevocacion.
- **PK**: id.
- **FK**: usuarioId → rrfusuar.
- **Uso**: Lectura/Escritura (crear/renovar/revocar sesiones, refresh, logout).

## Tablas de soporte
### rrfjorus (HorarioUsuario)
- **Descripción**: Horarios habilitados por usuario.
- **PK**: id; **FK**: usuarioId → rrfusuar; diaSemanaId → rrfdiasm.
- **Uso**: Lectura en login para validar acceso por horario.

### rrfdiasm (DiaSemana catálogo)
- **Descripción**: Catálogo de días de la semana.
- **PK**: id.
- **Uso**: Lectura (soporte a horarios).

### rrfhispw (HistorialPassword)
- **Descripción**: Historial de contraseñas para evitar reutilización.
- **PK**: id; **FK**: usuarioId → rrfusuar.
- **Uso**: Lectura/Escritura en cambio/reset de contraseña.

### rrfaulog (AuditoriaAuth)
- **Descripción**: Log de eventos de autenticación.
- **PK**: id.
- **Uso**: Escritura en login/refresh/logout/reset; lectura para auditoría.

### rrfpwrst (ResetPassword)
- **Descripción**: Tokens de recuperación de contraseña.
- **PK**: id; **FK**: usuarioId → rrfusuar.
- **Uso**: Lectura/Escritura en flujos de recuperación.

### rrfhisau (AutorizacionTemporal)
- **Descripción**: Autorizaciones temporales de acceso.
- **PK**: id; **FK**: usuarioId → rrfusuar.
- **Uso**: Lectura en login para otorgar acceso temporal.

## Uso general
- Soft delete en usuarios; flags de estado/bloqueo.
- Refresh tokens almacenados como hash; familia de tokens para revocación.
- Auditoría persistente para todos los eventos críticos.
