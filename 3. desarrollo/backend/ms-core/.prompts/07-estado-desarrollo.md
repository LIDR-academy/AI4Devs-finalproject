# 07 · Estado de Desarrollo

## Observabilidad
- MetricsService: 7 métrica tipos implementadas y registradas (HTTP, circuit-breaker, DB pool, MS latency, business events).
- OTEL: auto-instrumentación de Node.js integrada; endpoint configurable via .env.
- Prometheus: alerts.yml con reglas de threshold (observadas pero no detalles de activación actuales).
- Métricas inicializadas sin errores; flag estático para prevenir re-registros.

## Resiliencia
- CircuitBreakerFactory: implementado; crea instancias por servicio.
- CircuitBreakerInterceptor: envuelve llamadas; registra openings en metrics.
- Throttler: configurado global 100 req/60s; funcionando.

## Seguridad y Gatekeeping
- Helmet: configurado en AppModule.
- AuthGuard: presente; decoradores @Token, @User funcionales.
- JWT integration: via ms-auth module.

## Integración de módulos
- ms-auth, ms-perso, ms-confi: importados y expuestos en AppModule.
- Health endpoint: operativo.
- Logger: centralizado en LoggerService.

## Infra
- NestJS 11; npm scripts funcionales (start, start:dev, lint, test, test:cov).
- Docker support (Dockerfile, Dockerfile.prod).
