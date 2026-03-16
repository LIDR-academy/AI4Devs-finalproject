# 01 · Microservice Overview

## Propósito
MS-CORE es el Gateway central de RRFinances: orquesta las rutas de MicroServicios (ms-auth, ms-perso, ms-confi), proporciona observabilidad (Prometheus, OpenTelemetry), resiliencia (circuit-breaker, throttle) y seguridad (Helmet, JWT guards).

## Alcance funcional actual
- Agregación de módulos ms-auth, ms-perso, ms-confi bajo una sola entrada REST en puerto 8000.
- Observabilidad: métricas Prometheus (prom-client) con histogramas, contadores y gauges; soporte OTEL para tracing distribuido.
- Resiliencia: circuit-breaker factory e interceptor; throttler global (100 req/60s).
- Seguridad: Helmet, AuthGuard, decoradores @Token y @User.
- Health y logger centralizado.

## Stack
- Framework: NestJS 11 (REST + microservices).
- Observabilidad: Prometheus (prom-client), OpenTelemetry, auto-instrumentación.
- Resiliencia: Circuit-breaker custom, @nestjs/throttler.
- Seguridad: Helmet, JWT (via ms-auth).
- Persistence: PostgreSQL (compartida; ORM vía TypeORM disponible).
- Mensajería: NATS (soporte integrado).

## Despliegue y entorno
- Puerto default: 8000 (observado en README).
- Métricas expuestas en endpoint Prometheus (estándar /metrics o similar).
- Scripts npm: start, start:dev, lint, test, test:cov, e2e.
- Configuración via .env; DatabaseModule central.

## Estructura de módulos (src)
- module/: ms-auth (guards, decorators, DTOs), ms-confi (param, management, operation, search), ms-perso (health, management, operation, parameter, search).
- common/: monitoring (metrics, OTEL, Prometheus alerts), resilience (circuit-breaker), transports (auth, nats), health, log, config.
- constant/, shared/: utilidades globales.

## Referencias clave
- README.md: breve descripción del gateway.
- src/common/monitoring: métricas Prometheus, OTEL, circuit-breaker, alerts.yml.
- src/module: integraciones de ms-auth, ms-confi, ms-perso.
