# Plan de Pruebas

## Unit
- Servicios de dominio (NestJS): validaciones, cálculo de ventanas de tiempo
- Repositorios: interacciones con Postgres/Redis (mocks)

## E2E
- Flujo `/auth/login` con intentos y bloqueo
- Flujo `/admin/users/:id/unlock` protegido por roles

## Performance
- Escenarios con picos de intentos en paralelo
- Latencia y throughput medidos (p95, p99)

## Seguridad
- Pruebas de rate limiting y CAPTCHA
- Verificación de logs de auditoría sin PII sensible

## Aprobación
- Criterios de aceptación de `01-feature-spec-example.md` deben pasar
