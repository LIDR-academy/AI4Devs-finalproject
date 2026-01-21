# 06 · Modelo de Datos

## Componentes sin estado directo en MS-CORE
- MS-CORE no posee tablas propias; es un orquestador/gateway.
- Accede a BD compartida (PostgreSQL) para métodos de métricas (pool de BD, observabilidad).

## Dominio de observabilidad (in-memory/Prometheus)
- Métricas Prometheus (prom-client):
  - `core_nest_http_request_duration_seconds`: Histogram [method, route, status_code]
  - `core_nest_http_requests_total`: Counter [method, route, status_code]
  - `core_nest_circuit_breaker_open_total`: Counter [service, target]
  - `core_nest_db_pool_in_use`: Gauge
  - `core_nest_db_pool_waiting`: Gauge
  - `core_nest_ms_dependency_latency_seconds`: Histogram [target, method]
  - `core_nest_business_events_total`: Counter [event_type, status]

## Dominio de resiliencia (in-memory state machine)
- CircuitBreaker state machine: CLOSED, OPEN, HALF_OPEN; transiciones vía threshold de fallos/éxitos.
- Per-instance: factory crea una por service/target.

## Observaciones
- OTEL spans: generados automáticamente; almacenados en backend (Jaeger, Datadog, etc.; endpoint .env).
- Alertas: definidas en prometheus.yml; evaluadas por Prometheus server externo.
