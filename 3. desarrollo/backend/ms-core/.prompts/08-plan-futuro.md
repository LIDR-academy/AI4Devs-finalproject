# 08 · Plan Futuro

## Prioridad alta
- Configurar OTEL endpoint (.env OTEL_EXPORTER_OTLP_ENDPOINT) y validar tracing distribuido end-to-end (cliente → ms-core → ms-*).
- Implementar tests unitarios para MetricsService, CircuitBreakerFactory y AuthGuard.
- Documentar Swagger consolidado del gateway (agregando rutas expuestas de ms-* con operacionId y tags).

## Prioridad media
- Validar y documentar thresholds de alertas en prometheus.yml (circuit-breaker open count, latencia P95, error rate).
- Agregar métricas de negocio (ej. "login_total", "transaction_total") como custom counters.
- Implementar health checks granulares por microservicio (no solo endpoint global).

## Prioridad baja
- Evaluar load balancer externo (nginx, envoy) para múltiples instancias de ms-core.
- Agregar observabilidad a level de NATS (eventos/latency).
- Documentar runbook para incident response (circuit-breaker abierto, high latency).

## Definición de listo
- Tracing OTEL en producción validado.
- Tests: ≥70% cobertura en common/monitoring y common/resilience.
- Alertas: configuradas y testeadas en environment de staging.
- Swagger: 100% rutas expuestas documentadas.
