# Observabilidad local (MyTreeLibrary)

Stack mínimo según [ADR-0005](../../docs/adr/0005-microservices-observabilty-spring-boot.md): **Spring Boot Actuator**, **Micrometer**, **Prometheus**, **Grafana** y logs JSON en consola.

## Requisitos

- Microservicios en el **host** (`mvn spring-boot:run` con perfil `dev`) en los puertos **8080–8084** (véase [services/README.md](../../services/README.md)).
- Docker Compose con los servicios `prometheus` y `grafana` (definidos en [infra/compose/docker-compose.yml](../../infra/compose/docker-compose.yml)).

## Arranque

```bash
cd infra/compose
copy .env.example .env
docker compose pull prometheus grafana
docker compose up -d prometheus grafana
```

En Unix: `cp .env.example .env`.

Levantar los microservicios desde `services/` (perfil `dev`) **antes** de comprobar targets en Prometheus.

## URLs

| Herramienta | URL por defecto | Uso |
|-------------|-----------------|-----|
| Prometheus | http://localhost:9090 | Targets en **Status → Targets** |
| Grafana | http://localhost:3000 | Usuario/contraseña: `GRAFANA_ADMIN_*` del `.env` |
| Actuator (ej. catálogo) | http://localhost:8081/actuator/health | Salud por servicio |
| Métricas scrape | http://localhost:8081/actuator/prometheus | Formato Prometheus |

## Dashboard

Grafana provisiona el dashboard **MTL Microservices** (carpeta *MyTreeLibrary*) con variable **Aplicación** para filtrar por microservicio.

Paneles: estado UP, tráfico HTTP, latencia p95 y memoria JVM heap.

## Verificación rápida

1. `curl -s http://localhost:8081/actuator/health` → `"status":"UP"`.
2. `curl -s http://localhost:8081/actuator/prometheus | findstr jvm_` (Windows) o `| head` (Unix).
3. En Prometheus (`/targets`), los cinco jobs deben estar **UP** con los servicios en marcha.
4. En Grafana, abrir **MTL Microservices** y generar tráfico (p. ej. `GET` público vía gateway).
5. Consola del servicio: líneas de log en JSON (formato logstash).

## Etiquetas de métricas

Cada servicio publica:

- `application` = `spring.application.name`
- `environment` = `APP_ENV` (por defecto `local`)

## Evolución

Trazas (Tempo), logs centralizados (Loki) y OpenTelemetry Collector quedan para fases posteriores del ADR.
