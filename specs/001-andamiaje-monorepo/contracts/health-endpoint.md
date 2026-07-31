# Contract — Health Endpoints

**Feature**: `001-andamiaje-monorepo`

Cada microservicio DEBE exponer chequeos de salud (Principio X de la constitución). Contrato mínimo para el andamiaje:

## Liveness — `GET /health`

- **Respuesta esperada**: `200 OK`.
- **Cuerpo (forma)**:

```json
{ "status": "UP" }
```

## Readiness — `GET /health/readiness`

- **Respuesta esperada**: `200 OK` cuando el servicio está listo para recibir tráfico.
- **Cuerpo (forma)**:

```json
{ "status": "UP" }
```

## Aplicabilidad

| Servicio | Base URL (local) |
|---|---|
| solicitudes | `http://localhost:8081` |
| descargas | `http://localhost:8082` |
| verificacion | `http://localhost:8083` |

## Notas

- Se implementa con Spring Boot Actuator (health groups liveness/readiness), no con endpoints caseros.
- En el andamiaje el estado `UP` refleja únicamente que la aplicación arranca; los *health indicators* de dependencias (BD, Redis, S3) se añaden cuando esas integraciones existan.
- El endpoint de verificacion de salud NO expone información sensible ni detalles internos por defecto.
