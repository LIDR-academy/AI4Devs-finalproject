# 04 · Análisis

## Rol y dominios
- Gateway central: punto único de entrada REST para cliente externo.
- Orquestador: expone y rutea peticiones a ms-auth (autenticación), ms-perso (personas/clientes), ms-confi (catálogos).
- Observabilidad: centraliza métricas, tracing, alertas para todo el ecosystem de microservicios.

## Actores
- Clientes externos (Web, mobile) que solicitan via REST al gateway.
- Otros microservicios (ms-auth, ms-perso, ms-confi) que publican rutas y comportamientos.
- Operadores y SREs que monitorean métricas Prometheus y traces OTEL.

## Reglas y políticas
- Autenticación obligatoria vía JWT (decorador @Token/@User guards).
- Rate limiting: 100 req/60s global (throttler).
- Seguridad headers vía Helmet (CSP, X-Frame-Options, etc.).
- Soft fail en métricas: inicialización idempotente para evitar re-registro.
- Circuit-breaker: previene cascadas de fallos en llamadas a microservicios.

## Integraciones
- REST expuesto en puerto 8000.
- NATS para mensajería inter-MS.
- Prometheus en /metrics (estándar).
- OTEL exporter a OTLP (HTTP, endpoint via .env).
- PostgreSQL compartida (DatabaseModule centralizado).
