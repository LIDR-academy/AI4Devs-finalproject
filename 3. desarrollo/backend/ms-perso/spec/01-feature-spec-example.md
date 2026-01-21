# Feature Spec — Bloqueo temporal por intentos fallidos de autenticación

## Contexto
Como institución financiera, necesitamos proteger el acceso a las cuentas de usuario evitando ataques de fuerza bruta y asegurando trazabilidad para auditoría (SEPS).

## Historias de Usuario
- **HU1**: Como usuario, si ingreso mi clave incorrecta 5 veces en 15 minutos, mi cuenta queda bloqueada por 30 minutos.
- **HU2**: Como administrador, puedo **desbloquear** manualmente a un usuario desde el backoffice con auditoría del evento.

## Criterios de Aceptación (Gherkin)
- **CA1**  
  Given un usuario válido  
  When realiza 5 intentos fallidos en ≤15m  
  Then el sistema bloquea su login por 30m y registra el evento de auditoría.
- **CA2**  
  Given un usuario bloqueado  
  When un admin ejecuta la acción "Desbloquear"  
  Then el sistema limpia contadores, levanta el bloqueo y registra auditoría.

## Requisitos No Funcionales
- p99 login < 150ms sin bloqueo; < 300ms con verificación de bloqueo
- Disponibilidad 99.9%
- Cumplimiento de retención de logs (≥ 90 días) y protección de PII

## Datos y Esquema
- Tabla `auth_login_attempts(user_id, ts)`
- Cache/Redis para ventana deslizante 15m
- Tabla `security_events(id, user_id, type, ts, metadata)`

## API / Contratos
- `POST /auth/login` — agrega intento fallido, calcula bloqueo, retorna estado
- `POST /admin/users/:id/unlock` — requiere rol; registra `security_events`

## Riesgos y Mitigaciones
- **Lockout por terceros (DoS)** → Rate limiting por IP + CAPTCHA desde 3er intento
- **Sobrecarga en Redis** → TTL y limpieza; métricas

## Plan de Pruebas
Ver `spec/04-test-plan.md` (unit, e2e, carga).
