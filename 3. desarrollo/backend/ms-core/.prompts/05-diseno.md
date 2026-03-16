# 05 · Diseño

## Arquitectura
- NestJS 11 modular: AppModule orquesta ResilienceModule, MetricsModule, HealthModule y módulos de microservicios (MsPersoModule, AuthModule, MsConfigModule).
- Capas por preocupación:
  - common/monitoring: Prometheus metrics, OTEL, circuit-breaker, alerts.yml.
  - common/transports: NATS, Auth (JWT).
  - common/health: liveness/readiness endpoints.
  - module/: cada ms-* expone su propia estructura (controller, module, guardians, DTOs).

## Observabilidad integrada
- MetricsService: inyectable en cualquier controlador/servicio para registrar eventos.
- Métricas Prometheus: 7 tipos (HTTP duration/count, circuit-breaker, DB pool, MS latency, business events).
- CircuitBreakerInterceptor: registra automáticamente openings.
- OTEL auto-instrumentación: tracing distribuido con spans auto-generados.
- Prometheus alerts.yml: reglas para circuit-breaker, latencia, tasa de error.

## Resiliencia
- CircuitBreakerFactory: crea instancias por servicio/target; maneja transiciones CLOSED→OPEN→HALF_OPEN.
- CircuitBreakerInterceptor: envuelve llamadas outbound a microservicios.
- Throttler: límite global 100 req/60s; configurable por decorador en ruta específica.

## Seguridad
- Helmet: CSP, X-Frame-Options, HSTS, etc.
- AuthGuard: valida JWT; decoradores @Token(required), @User(required) en rutas.
- Auth transport module: maneja validación vía ms-auth.

## Notas de calidad
- ESLint + Prettier configurados.
- Jest para testing; cobertura observable.
- Dockerfile y Dockerfile.prod para containerización.
