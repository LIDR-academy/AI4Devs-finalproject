# Backend Java (MyTreeLibrary)

**Maven:** `services/pom.xml` (`com.mtl:mtl-parent`, Spring Boot 4.0.x, Java 21). **Normas de código:** `.cursor/rules/spring-boot-4-backend.mdc` (tabla módulo ↔ paquete y **plantilla de paquetes** para nuevos microservicios), `backend-generation-standard.mdc`, `microservices-patterns.mdc`, `api-contract.mdc`, `api-security.mdc`.

**E2E (gateway + servicios reales):** módulo `system-e2e-tests` — [system-e2e-tests/README.md](system-e2e-tests/README.md); guía general en [docs/engineering/testing-java.md](../docs/engineering/testing-java.md) §2.1.

## 1. Arranque local coherente

### Dónde ejecutar Maven

El **POM padre** del backend está en **`services/pom.xml`** (reactor con todos los microservicios). Los comandos `mvn -pl …` deben lanzarse **desde la carpeta `services/`** (es la carpeta padre de cada módulo como `catalog-service/`).

Ejemplos (PowerShell o bash, estando en `services/`):

```bash
mvn verify
mvn -pl catalog-service spring-boot:run -Dspring-boot.run.profiles=dev
```

Si prefieres quedarte en la **raíz del monorepo**:

```bash
mvn -f services/pom.xml -pl catalog-service spring-boot:run -Dspring-boot.run.profiles=dev
```

No ejecutes `mvn -pl catalog-service …` **desde dentro** de `catalog-service/` (sin el reactor del padre, Maven no resuelve `-pl`).

### Spring Boot DevTools (IDE)

Los servicios Boot incluyen `spring-boot-devtools`. El **restart** del contexto se dispara cuando cambian los `.class` en `target/classes` (no basta con guardar el `.java` si no se compila). En la raíz del monorepo, [`.vscode/settings.json`](../.vscode/settings.json) fija autocompilación Maven y actualización automática del proyecto para Cursor/VS Code. Si no ves el reinicio, ejecuta **`Java: Force Java Compilation`** o, con el servicio en marcha, `mvn -f services/pom.xml -pl <módulo> compile` desde otra terminal.

### Postgres en el host (puerto 5433)

Por defecto el proyecto evita ocupar **5432** si ya tienes otro PostgreSQL local. En **`infra/compose/.env.example`** está `POSTGRES_PORT=5433`: el contenedor sigue escuchando en **5432 dentro de Docker**, pero en tu máquina la BD `mtl` queda en **`localhost:5433`**.

Los `application-dev.properties` de los servicios con JDBC usan `jdbc:postgresql://localhost:5433/mtl` (alineado con ese `.env`). Si cambias el puerto en `.env`, actualiza también el JDBC del servicio.

### Kafka y **catalog-service**

- **Topic** (Compose / `kafka-init`): `catalog.arbol.evento`. Contrato del mensaje: [docs/events/kafka-events.md](../docs/events/kafka-events.md).
- **Cliente en el host:** bootstrap `localhost:9094` (variable `KAFKA_PORT_HOST` en `infra/compose/.env.example`). Dentro de Docker los servicios usan `kafka:9092`.
- **Propiedades útiles** (perfil `dev` ya fija valores por defecto en `catalog-service`):
  - `mtl.catalog.kafka.enabled` — `true` en dev para publicar **`ARBOL_CREADO`** tras alta exitosa; `false` en el `application.properties` base y en tests.
  - `mtl.catalog.kafka.arbol-evento-topic` — por defecto `catalog.arbol.evento`.
  - `spring.kafka.bootstrap-servers` — equivalente estándar Spring; se puede sobreescribir con **`MTL_KAFKA_BOOTSTRAP_SERVERS`** (p. ej. otro host/puerto).

### Caché Redis y **catalog-service**

- **Por defecto desactivada** (`spring.cache.type=none` en `application.properties`): tests y builds sin Docker no requieren Redis.
- **Perfil `dev`** la activa a Redis (`spring.cache.type=redis`) apuntando al contenedor del Compose en `localhost:6379` (variables opcionales: **`MTL_REDIS_HOST`**, **`MTL_REDIS_PORT`**).
- **Qué se cachea** (lecturas de maestros de baja cardinalidad y alta frecuencia, definido en `CatalogCacheConfig`):
  - `catalog.publicProvinceNames` — `GET /api/catalog/public/provinces/names`, TTL 10 min.
  - `catalog.provincesUnpaged` — `GET /api/catalog/provinces` cuando `unpaged=true` y sin `q`, TTL 5 min.
  - `catalog.speciesUnpaged` — `GET /api/catalog/species` cuando `unpaged=true` y sin `q`, TTL 5 min.
- **Invalidación:** solo por TTL en el MVP (no hay `@CacheEvict`). Para forzar refresco en dev: `docker compose -f infra/compose/docker-compose.yml exec redis redis-cli FLUSHDB`.
- **Smoke manual:** con `dev` arriba, llamar dos veces el mismo endpoint cacheable y comprobar en logs SQL de catálogo que la segunda no ejecuta el `select`; o `redis-cli KEYS 'catalog.*'` para ver las entradas.

### Orden recomendado

1. **Infra de apoyo** (Postgres, Mongo, Redis, MinIO, Kafka, Keycloak, Mailpit, Prometheus, Grafana): [infra/compose/README.md](../infra/compose/README.md) — `docker compose up -d` desde `infra/compose/` con `.env` copiado de `.env.example`.
2. **Microservicios** con perfil **`dev`** (no está fijado en `application.properties`; actívalo con `SPRING_PROFILES_ACTIVE=dev`, argumentos `--spring.profiles.active=dev`, Maven `-Dspring-boot.run.profiles=dev`, o las configuraciones **`* (dev)`** en [`.vscode/launch.json`](../.vscode/launch.json)): conexión a Postgres según el punto anterior; usuario/contraseña como en `.env` / `.env.example` (p. ej. `mtl` / `mtl_dev_password`).
3. **Flyway** (servicios con SQL bajo `services/`): scripts **solo** en **`src/main/resources/db/migration/`** (convención `V1__….sql`, `V2__….sql`, …). No hay otra carpeta obligatoria bajo `db/` para el arranque. En **Spring Boot 4** hace falta **`spring-boot-starter-flyway`**. En **catalog-service**: DDL en `V1__baseline.sql`, datos iniciales de maestros en `V2__seed_maestros_inicial.sql`. Para más cambios de esquema o semillas en entornos donde ya se aplicó Flyway, añade migraciones **`V3__…`**, **`V4__…`**, **`V5__…`**, etc. (no reescribas migraciones ya desplegadas en compartido).

**Si Flyway ya aplicó versiones antiguas y has cambiado `V1`/`V2`:** en desarrollo, reset de esquema o volumen — [docs/engineering/flyway-dev-reset.md](../docs/engineering/flyway-dev-reset.md).

4. **Tests:** **`mvn test`** (Surefire, p. ej. catálogo con H2). **`mvn verify`** añade Failsafe (`*IT` en `testIT`). En **catalog-service** y **notification-service**, los IT con Testcontainers se **omiten** sin Docker (no rompen el build); detalle y JWT de prueba: [testing-java.md](../docs/engineering/testing-java.md) §4 y "Docker y IT". Dónde colocar properties y scripts de IT en classpath: **§1** del mismo doc. Lanzar una clase: **§7** del mismo doc.

**Puertos HTTP locales (MVP esqueleto)**

| Módulo | Puerto |
|--------|--------|
| api-gateway | 8080 |
| catalog-service | 8081 |
| media-service | 8082 |
| notification-service | 8083 |
| ai-assistant-service | 8084 |
| system-e2e-tests | (no aplica: solo tests contra URLs configurables) |

### Observabilidad (ADR-0005)

Cada microservicio expone Actuator con **`/actuator/health`**, **`/actuator/prometheus`** y logs **JSON** en consola (`logging.structured.format.console=logstash`). Etiquetas Micrometer: `application` (`spring.application.name`) y `environment` (`APP_ENV`, por defecto `local`).

En **desarrollo local**, `/actuator/prometheus` está en lista blanca (sin JWT) para que Prometheus en Docker pueda hacer scrape; en producción conviene restringir por red o puerto de management.

**Imágenes Docker (Compose)** — configuración en [platform/observability/](../platform/observability/README.md):

| Servicio | Imagen | Puerto host (por defecto) | Uso |
|----------|--------|---------------------------|-----|
| Prometheus | `prom/prometheus:v3.2.1` | 9090 (`PROMETHEUS_PORT`) | Scrape de `http://host.docker.internal:8080`–`8084/actuator/prometheus` |
| Grafana | `grafana/grafana:11.5.2` | 3000 (`GRAFANA_PORT`) | Dashboard **MTL Microservices**; login `GRAFANA_ADMIN_*` en `.env` |

**Arranque:**

```bash
cd infra/compose
docker compose pull prometheus grafana
docker compose up -d prometheus grafana
```

Orden recomendado: infra de apoyo → microservicios en **`dev`** (puertos de la tabla anterior) → Prometheus/Grafana. Comprobar targets en http://localhost:9090/targets y el dashboard en http://localhost:3000.

Documentación: [platform/observability/README.md](../platform/observability/README.md) · [infra/compose/README.md](../infra/compose/README.md) · [ADR-0005](../docs/adr/0005-microservices-observabilty-spring-boot.md).

**Suscripción pública por correo (HU-004):** `POST /api/notifications/subscriptions` está expuesto sin JWT en **`notification-service`** y en el **api-gateway**; en pruebas E2E y desde la SPA use la **URL base del gateway** (`http://localhost:8080`), no el puerto **8083** directo, salvo depuración local consciente.

**Gestión administrativa de suscripciones (HU-012 / UC-08):** `GET /api/notifications/subscriptions` y `PATCH /api/notifications/subscriptions/{subscriptionId}` requieren JWT con rol de realm **ADMIN**; la SPA los invoca vía el mismo gateway. Contrato: [docs/api/openapi.yaml](../docs/api/openapi.yaml).

**Correo saliente en desarrollo (HU-007, Mailpit):** con perfil **`dev`**, **notification-service** usa `spring.mail.host` / `spring.mail.port` hacia **Mailpit** del Compose (por defecto `localhost:1025`; UI en [infra/compose/README.md](../infra/compose/README.md)). Variables opcionales: **`MTL_NOTIFICATION_MAIL_HOST`**, **`MTL_NOTIFICATION_MAIL_PORT`**, **`MTL_NOTIFICATION_MAIL_FROM`**. En perfil **`test`** no se define `spring.mail.host` (no hay `JavaMailSender` real; los tests de envío usan mock).

**Verificación manual (TASK-HU-007-04, cierre):** Compose con **`mailpit`** arriba; Postgres, Kafka y **notification-service** en **`dev`** (`mtl.notification.kafka.enabled=true`). Al menos un **suscriptor** en **ACTIVA** (p. ej. vía `POST /api/notifications/subscriptions` por el gateway). Tras publicar **`ARBOL_CREADO`** (alta de árbol con **catalog-service** en dev o productor equivalente), comprobar en Mailpit **http://localhost:8025** los mensajes capturados y en BD esquema **`notification`** filas coherentes en **`evento_catalogo`** (**`PROCESADO`**), **`notificacion`** y **`envio_notificacion`** (**`ENVIADA`** o **`ERROR`** si SMTP falla).

Desde **`services/`**: **`mvn verify`** o **`mvn -pl catalog-service spring-boot:run -Dspring-boot.run.profiles=dev`** (tras tener Postgres en marcha).

---

## 2. Contrato HTTP

**Keycloak y `catalog-service` (alta de árbol):** el access token debe incluir claims **`email`** y perfil para **`nombre`** (`name` o `given_name`/`family_name`); en el flujo OIDC de la SPA usar `scope=openid profile email`. Detalle: [ADR-0004](../docs/adr/0004-catalog-rest-write-and-audit.md).


- **Fuente de verdad:** [docs/api/openapi.yaml](../docs/api/openapi.yaml).
- Cambios de API: actualizar OpenAPI y, si afecta a convenciones, `.cursor/rules/api-design.mdc` / `api-contract.mdc`. Rutas públicas vs JWT: alineación con [docs/security/jwt-gateway-strategy.md](../docs/security/jwt-gateway-strategy.md).

---

## 3. Gateway y seguridad JWT

- **Arranque del módulo:** `mvn -pl api-gateway spring-boot:run -Dspring-boot.run.profiles=dev` (infra lista; Keycloak accesible si pruebas JWT reales).
- **Microservicios aguas abajo:** si el gateway responde **502** con título *Servicio de destino no disponible*, el destino (p. ej. **catalog-service** en **8081**) no acepta conexión: arranca ese servicio o revisa `mtl.catalog.uri` / `MTL_*`. Sin **catalog-service**, rutas como **`/api/catalog/public/trees`** fallan (no es un fallo de **media-service**).
- **Stack, rutas (`spring.cloud.gateway.server.webflux.*`), variables (`mtl.*.uri` / `MTL_*`), issuer, token relay, lista blanca, CORS y pendientes (correlación, timeouts):** [docs/security/jwt-gateway-strategy.md](../docs/security/jwt-gateway-strategy.md).
- **Reglas para implementación:** `.cursor/rules/api-security.mdc`. Código: `services/api-gateway/`.

---

## 4. Enfoque por historias de usuario

Los puntos **5 en adelante** del roadmap (dominio, Kafka, media, IA, front, CI, etc.) se irán desarrollando **historia a historia**; este README puede ampliarse cuando cerréis el primer flujo extremo a extremo (JWT + catálogo + notificación, etc.).

**Subida de fotografías al árbol (HU-006):** flujo **presign → PUT en MinIO → confirmación** en `media-service`, propiedades `mtl.media.upload.*` / `mtl.media.storage.*` / `mtl.media.presign.*`, criterio de **foto principal** (primera confirmación en servidor; orden en cliente) y **EXIF** solo en la SPA. Guía técnica: [docs/engineering/media-upload-hu006.md](../docs/engineering/media-upload-hu006.md). Arranque local: gateway **8080**, **media-service** **8082**, MinIO **9000** (véase [infra/compose/README.md](../infra/compose/README.md)).
