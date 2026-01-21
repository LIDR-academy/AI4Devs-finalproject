# Rollout, Migraciones y Rollback

## Feature Flags
- `auth.lockout.enabled`: activar progresivo por segmentos de usuarios

## Migraciones
- Crear tablas `auth_login_attempts` y `security_events`
- Índices por `user_id` y `ts`

## Plan de Deploy
- Staging → pruebas automáticas → aprobación → producción gradual
- Monitoreo de KPIs (errores, latencia, bloqueos/min)

## Rollback
- Desactivar flag
- Reversión de migraciones solo si no hay datos críticos

## Observabilidad
- Dashboards preconfigurados
- Alertas sobre tasa de bloqueos y latencia
