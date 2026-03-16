# Arquitectura — Lineamientos

## Vista General
- Microservicios **NestJS** (ms-auth, ms-person, ms-core, etc.) con mensajería/eventos.
- **PostgreSQL** 15+ con PgBouncer, transacciones ACID y locking por entidad crítica.
- **Angular** para backoffice/front, control de roles y MFA.
- Observabilidad: Prometheus/Grafana + OpenTelemetry (trazas).

## Decisiones (ADRs)
- Autenticación centralizada (ms-auth) con JWT + rotación de claves.
- Rate limiting per-IP y per-user.
- Auditoría unificada (`security_events`).

## Diagramas
- Contexto (C4): clientes → gateways → ms-* → DB/Redis
- Contenedores: pods/servicios si se usa K8s; o ECS/App Runner en AWS.
