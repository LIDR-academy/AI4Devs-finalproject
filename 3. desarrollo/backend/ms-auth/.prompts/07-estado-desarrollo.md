# 07 - Estado de Desarrollo (Sprint Actual)

## Implementado
- Login con políticas de bloqueo, horario y auditoría (según `avance_login.md`).
- Refresh token, logout y logout global.
- Cambio y recuperación de contraseña con historial.
- Gestión de sesiones (sesión única opcional), auditoría de eventos, políticas por perfil.
- Modelos TypeORM y repos para usuario, perfil, sesión, horarios, historial, auditoría, reset password, autorizaciones temporales, catálogo de días.
- Scripts: seed admin y actualización de password admin.
- Colección Postman incluida.

## Parcialmente implementado
- No se documenta cobertura de tests ni resultados en el repo; requiere verificación en CI.

## Pendiente
- Confirmar ejecución de migraciones/seeds en entornos.
- Validar política de contraseña y hashing en entorno real contra `PerfilModel`.
- Revisar manejo de tokenFamily y token reuse en refresh en ambientes integrados.
- Añadir resumen/estado de tests (unit/integration/E2E) en documentación.

## Deuda técnica
- Falta de reporte de cobertura y pipeline automatizado en la documentación.
- Dependencia de datos de horarios/autorizaciones para pruebas reales.

## Riesgos
- Seguridad: si no se valida token reuse/familia de tokens puede haber sesión no revocada.
- Operación: seeds/migraciones no ejecutadas pueden bloquear login.
- UX: si no se comunica política de password, puede aumentar fallas de login.
