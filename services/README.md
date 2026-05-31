# Backend Java (MyTreeLibrary)

**Maven:** `services/pom.xml` (`com.mtl:mtl-parent`, Spring Boot 4.0.x, Java 21). **Normas de código:** `.cursor/rules/spring-boot-4-backend.mdc` (tabla módulo ↔ paquete y **plantilla de paquetes** para nuevos microservicios), `backend-generation-standard.mdc`, `microservices-patterns.mdc`, `api-contract.mdc`, `api-security.mdc`.

**E2E (gateway + servicios reales):** `system-e2e-tests` — [README](system-e2e-tests/README.md) (HU-001 esc. 2–4, maestros catálogo); estrategia [testing-java.md](../docs/engineering/testing-java.md) §2.1.

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

- **Topic** (Compose / `kafka-init`): `catalog.ejemplar.evento`. Contrato del mensaje: [docs/events/kafka-events.md](../docs/events/kafka-events.md).
- **Cliente en el host:** bootstrap `localhost:9094` (variable `KAFKA_PORT_HOST` en `infra/compose/.env.example`). Dentro de Docker los servicios usan `kafka:9092`.
- **Propiedades útiles** (perfil `dev` ya fija valores por defecto en `catalog-service`; renombre de claves en bloque C):
  - `mtl.catalog.kafka.enabled` — `true` en dev para publicar **`EJEMPLAR_CREADO`** tras alta exitosa; `false` en el `application.properties` base y en tests.
  - `mtl.catalog.kafka.ejemplar-evento-topic` — topic: `catalog.ejemplar.evento` (ver [kafka-events.md](../docs/events/kafka-events.md) y ADR-0006).
  - `spring.kafka.bootstrap-servers` — equivalente estándar Spring; se puede sobreescribir con **`MTL_KAFKA_BOOTSTRAP_SERVERS`** (p. ej. otro host/puerto).

### Caché Redis y **catalog-service**

- **Por defecto desactivada** (`spring.cache.type=none` en `application.properties`): tests y builds sin Docker no requieren Redis.
- **Perfil `dev`** la activa a Redis (`spring.cache.type=redis`) apuntando al contenedor del Compose en `localhost:6379` (variables opcionales: **`MTL_REDIS_HOST`**, **`MTL_REDIS_PORT`**).
- **Qué se cachea** (lecturas de maestros de baja cardinalidad y alta frecuencia, definido en `CatalogCacheConfig`):
  - `catalog.publicProvinceNames` — `GET /api/catalog/public/provinces` (propiedad `names`), TTL 10 min.
  - `catalog.provincesUnpaged` — `GET /api/catalog/provinces` cuando `unpaged=true` y sin `q`, TTL 5 min.
  - `catalog.speciesUnpaged` — `GET /api/catalog/species` cuando `unpaged=true` y sin `q`, TTL 5 min.
- **Invalidación:** solo por TTL en el MVP (no hay `@CacheEvict`). Para forzar refresco en dev: `docker compose -f infra/compose/docker-compose.yml exec redis redis-cli FLUSHDB`.
- **Smoke manual:** con `dev` arriba, llamar dos veces el mismo endpoint cacheable y comprobar en logs SQL de catálogo que la segunda no ejecuta el `select`; o `redis-cli KEYS 'catalog.*'` para ver las entradas.

### Orden recomendado

1. **Infra de apoyo** (Postgres, Mongo, Redis, MinIO, Kafka, Keycloak, Mailpit, Prometheus, Grafana): [infra/compose/README.md](../infra/compose/README.md) — `docker compose up -d` desde `infra/compose/` con `.env` copiado de `.env.example`.
2. **Microservicios** con perfil **`dev`** (no está fijado en `application.properties`; actívalo con `SPRING_PROFILES_ACTIVE=dev`, `--spring.profiles.active=dev` o Maven `-Dspring-boot.run.profiles=dev`): conexión a Postgres según el punto anterior; usuario/contraseña como en `.env` / `.env.example` (p. ej. `mtl` / `mtl_dev_password`).
3. **Flyway** (servicios con SQL bajo `services/`): scripts **solo** en **`src/main/resources/db/migration/`** (convención `V1__….sql`, `V2__….sql`, …). No hay otra carpeta obligatoria bajo `db/` para el arranque. En **Spring Boot 4** hace falta **`spring-boot-starter-flyway`**. En **catalog-service**: DDL único en `V1__baseline.sql` (tablas, `unaccent`, CHECK e índice parcial de `ejemplar`, secuencia Kafka); semillas en `V2__seed_maestros_inicial.sql`. En **media-service** y **notification-service**: DDL único en `V1__baseline.sql`. No reescribas migraciones ya desplegadas en compartido; añade siempre una versión nueva.

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

**Verificación manual (TASK-HU-007-04, cierre):** Compose con **`mailpit`** arriba; Postgres, Kafka y **notification-service** en **`dev`** (`mtl.notification.kafka.enabled=true`). Al menos un **suscriptor** en **ACTIVA** (p. ej. vía `POST /api/notifications/subscriptions` por el gateway). Tras publicar **`EJEMPLAR_CREADO`** (alta de ejemplar con **catalog-service** en dev o productor equivalente; contrato en [kafka-events.md](../docs/events/kafka-events.md)), comprobar en Mailpit **http://localhost:8025** los mensajes capturados y en BD esquema **`notification`** filas coherentes en **`evento_catalogo`** (**`PROCESADO`**), **`notificacion`** y **`envio_notificacion`** (**`ENVIADA`** o **`ERROR`** si SMTP falla).

Desde **`services/`**: **`mvn verify`** o **`mvn -pl catalog-service spring-boot:run -Dspring-boot.run.profiles=dev`** (tras tener Postgres en marcha).

---

## 2. Perfil `prod` y variables de entorno JDBC

Cuando exista un entorno de **producción** (o staging con credenciales reales), activar **`SPRING_PROFILES_ACTIVE=prod`** en cada microservicio con JDBC. Los ficheros `application-prod.properties` **no** incluyen URLs ni contraseñas por defecto: deben inyectarse desde el orquestador (Kubernetes, VM, PaaS, etc.).

### Variables obligatorias por servicio (JDBC)

| Servicio | Esquema Flyway / JPA | Variables requeridas |
|----------|----------------------|----------------------|
| **catalog-service** | `catalog` | `MTL_DATASOURCE_URL`, `MTL_DATASOURCE_USERNAME`, `MTL_DATASOURCE_PASSWORD` |
| **media-service** | `media` | Idem |
| **notification-service** | `notification` | Idem |
| **ai-assistant-service** | `ai` | Idem |

**Formato típico de URL** (una sola instancia PostgreSQL, varios esquemas):

```text
MTL_DATASOURCE_URL=jdbc:postgresql://<host>:5432/mtl
MTL_DATASOURCE_USERNAME=<usuario_aplicacion>
MTL_DATASOURCE_PASSWORD=<secreto>
```

En **catalog-service**, `application-prod.properties` fija además `spring.datasource.hikari.connection-init-sql=SET search_path TO catalog, public` para que Hibernate y consultas nativas resuelvan el esquema correcto.

### Otras variables habituales en `prod`

| Variable | Servicios | Uso |
|----------|-----------|-----|
| `MTL_JWT_ISSUER_URI` | Todos con OAuth2 resource server | Issuer Keycloak (sin default en prod) |
| `MTL_KAFKA_BOOTSTRAP_SERVERS` | catalog, notification | Bootstrap Kafka |
| `MTL_CATALOG_KAFKA_ENABLED` | catalog | Publicación de eventos (`true`/`false`) |
| `MTL_NOTIFICATION_KAFKA_ENABLED` | notification | Consumo de eventos |
| `MTL_REDIS_HOST`, `MTL_REDIS_PORT`, `MTL_CACHE_TYPE` | catalog | Caché Redis (por defecto `redis` en prod) |
| `MTL_MEDIA_BASE_URL` | catalog | Cliente HTTP hacia media-service |
| `MTL_CATALOG_BASE_URL` | media | Permiso de subida vía catálogo |
| `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MTL_MEDIA_STORAGE_ENDPOINT` | media | Almacenamiento S3/MinIO |
| `MTL_NOTIFICATION_MAIL_*` | notification | SMTP saliente |

**Flyway en prod:** `spring.flyway.clean-disabled=true` y `spring.flyway.create-schemas=false` (los esquemas los crea el DBA o el aprovisionamiento inicial). No usar `ddl-auto=update`; solo **`validate`**.

**Local vs prod:** en **`dev`**, JDBC apunta a `localhost:5433` con credenciales del Compose (`.env.example`). En **`prod`**, las tres variables `MTL_DATASOURCE_*` sustituyen por completo esa configuración.

---

## 3. Contrato HTTP

**Keycloak y `catalog-service` (alta de ejemplar):** el access token debe incluir claims **`email`** y perfil para **`nombre`** (`name` o `given_name`/`family_name`); en el flujo OIDC de la SPA usar `scope=openid profile email`. Detalle: [ADR-0004](../docs/adr/0004-catalog-rest-write-and-audit.md).


- **Fuente de verdad:** [docs/api/openapi.yaml](../docs/api/openapi.yaml).
- Cambios de API: actualizar OpenAPI y, si afecta a convenciones, `.cursor/rules/api-design.mdc` / `api-contract.mdc`. Rutas públicas vs JWT: alineación con [docs/security/jwt-gateway-strategy.md](../docs/security/jwt-gateway-strategy.md).

---

## 4. Gateway y seguridad JWT

- **Arranque del módulo:** `mvn -pl api-gateway spring-boot:run -Dspring-boot.run.profiles=dev` (infra lista; Keycloak accesible si pruebas JWT reales).
- **Microservicios aguas abajo:** si el gateway responde **502** con título *Servicio de destino no disponible*, el destino (p. ej. **catalog-service** en **8081**) no acepta conexión: arranca ese servicio o revisa `mtl.catalog.uri` / `MTL_*`. Sin **catalog-service**, rutas como **`/api/catalog/public/trees`** fallan (no es un fallo de **media-service**).
- **Stack, rutas (`spring.cloud.gateway.server.webflux.*`), variables (`mtl.*.uri` / `MTL_*`), issuer, token relay, lista blanca, CORS, correlación `X-Correlation-Id` y pendientes (timeouts):** [docs/security/jwt-gateway-strategy.md](../docs/security/jwt-gateway-strategy.md).
- **Reglas para implementación:** `.cursor/rules/api-security.mdc`. Código: `services/api-gateway/`.

---

## 5. Enfoque por historias de usuario

Los puntos **5 en adelante** del roadmap (dominio, Kafka, media, IA, front, CI, etc.) se irán desarrollando **historia a historia**; este README puede ampliarse cuando cerréis el primer flujo extremo a extremo (JWT + catálogo + notificación, etc.).

**Subida de fotografías al árbol (HU-006):** flujo **presign → PUT en MinIO → confirmación** en `media-service`, propiedades `mtl.media.upload.*` / `mtl.media.storage.*` / `mtl.media.presign.*`, criterio de **foto principal** (primera confirmación en servidor; orden en cliente) y **EXIF** solo en la SPA. Guía técnica: [docs/engineering/media-upload-hu006.md](../docs/engineering/media-upload-hu006.md). Arranque local: gateway **8080**, **media-service** **8082**, MinIO **9000** (véase [infra/compose/README.md](../infra/compose/README.md)).

**Edición y baja de fichas (HU-008, UC-04):**

- **API catálogo** (`catalog-service`, JWT **COLABORADOR** / **ADMIN**): `GET /api/catalog/trees` (listado con filtros y paginación), `GET|PUT|DELETE /api/catalog/trees/{treeId}`. **COLABORADOR:** solo fichas propias (`usuario_app_id` del actor). **ADMIN:** cualquier ficha; filtro opcional `createdByUserId` en listado. Validación de rango de fechas `createdFrom` ≤ `createdTo` (**400**). Actualización solo **`PUT`** (sin **`PATCH`** en MVP). **PUT**/**DELETE** no publican Kafka ni disparan notificación (**R7**); auditoría en **`AUDITORIA_CATALOGO`** (**R3**, [ADR-0004](../docs/adr/0004-catalog-rest-write-and-audit.md)).
- **API media** (borrado en cascada y galería en edición): `DELETE /api/media/trees/{treeId}/photos` (todas las fotos del ejemplar: metadatos + objetos en bucket; no-op si no hay filas); `DELETE /api/media/photos/{photoId}` (una foto, **HU-006**). Media valida permiso llamando a catálogo (`GET /api/catalog/trees/{treeId}/media-submission-permission`).
- **Orden de baja** (`EjemplarDeletionService` en **catalog-service**): (1) `DELETE` en **media-service** con relay del Bearer del cliente; si media responde error → **abort** (el ejemplar **no** se borra en PostgreSQL); (2) borrado físico de `ejemplar` en PostgreSQL; (3) puerto `EjemplarEnrichmentDeletionPort` → implementación **stub** `NoOpEjemplarEnrichmentDeletionPort` hasta **[TASK-HU-015-01](../docs/backlog/HU-015-ticket-breakdown.md)**. La llamada HTTP a media queda **fuera** de la transacción JPA del catálogo.
- **Límites MVP:** no hay **rollback compensatorio** si falla el paso SQL (o Mongo real) **después** de haber borrado fotos en media (escenario BDD 8 de [HU-008-edicion-de-mis-arboles.md](../docs/backlog/HU-008-edicion-de-mis-arboles.md)); no saga distribuida.
- **Cliente catalog → media:** `mtl.media.base-url` (por defecto `http://localhost:8082` en `application.properties`; en **`dev`**: `${MTL_MEDIA_BASE_URL:http://localhost:8082}`). Sin **media-service** en marcha, `DELETE` de árbol con fotos devuelve **502** al cliente.
- **Tests automáticos:** `mvn -pl catalog-service,media-service test` (unitarios/WebMvc; orden media→SQL: `EjemplarDeletionServiceTest`). **IT** catalog↔media en runtime (**TASK-HU-008-11**): **rechazado** en el desglose; verificación manual en [frontend/README.md](../frontend/README.md) (apartado HU-008).
- **Arranque local típico:** Compose + **catalog-service** **8081** + **media-service** **8082** + gateway **8080** (o llamadas directas a 8081/8082 en depuración). Contrato: [openapi.yaml](../docs/api/openapi.yaml).
