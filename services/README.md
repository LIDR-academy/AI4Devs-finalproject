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

### Orden recomendado

1. **Infra de apoyo** (Postgres, Mongo, Redis, MinIO, Kafka, Keycloak): [infra/compose/README.md](../infra/compose/README.md) — `docker compose up -d` desde `infra/compose/` con `.env` copiado de `.env.example`.
2. **Microservicios** con perfil **`dev`** (no está fijado en `application.properties`; actívalo con `SPRING_PROFILES_ACTIVE=dev`, argumentos `--spring.profiles.active=dev`, Maven `-Dspring-boot.run.profiles=dev`, o las configuraciones **`* (dev)`** en [`.vscode/launch.json`](../.vscode/launch.json)): conexión a Postgres según el punto anterior; usuario/contraseña como en `.env` / `.env.example` (p. ej. `mtl` / `mtl_dev_password`).
3. **Flyway** (servicios con SQL bajo `services/`): scripts **solo** en **`src/main/resources/db/migration/`** (convención `V1__….sql`, `V2__….sql`, …). No hay otra carpeta obligatoria bajo `db/` para el arranque. En **Spring Boot 4** hace falta **`spring-boot-starter-flyway`**. En **catalog-service**: DDL en `V1__baseline.sql`, datos iniciales de maestros en `V2__seed_maestros_inicial.sql`. Para más cambios de esquema o semillas en entornos donde ya se aplicó Flyway, añade migraciones **`V3__…`**, **`V4__…`**, **`V5__…`**, etc. (no reescribas migraciones ya desplegadas en compartido).

**Si Flyway ya aplicó versiones antiguas y has cambiado `V1`/`V2`:** en desarrollo, reset de esquema o volumen — [docs/engineering/flyway-dev-reset.md](../docs/engineering/flyway-dev-reset.md).

4. **Tests:** **`mvn test`** (Surefire, p. ej. catálogo con H2). **`mvn verify`** añade Failsafe (`*IT` en `testIT`). En **catalog-service**, los IT con Testcontainers se **omiten** sin Docker (no rompen el build); detalle y JWT de prueba: [testing-java.md](../docs/engineering/testing-java.md) §4 y "Docker y IT". Lanzar una clase: **§7** del mismo doc.

**Puertos HTTP locales (MVP esqueleto)**

| Módulo | Puerto |
|--------|--------|
| api-gateway | 8080 |
| catalog-service | 8081 |
| media-service | 8082 |
| notification-service | 8083 |
| ai-assistant-service | 8084 |
| system-e2e-tests | (no aplica: solo tests contra URLs configurables) |

**Suscripción pública por correo (HU-004):** `POST /api/notifications/subscriptions` está expuesto sin JWT en **`notification-service`** y en el **api-gateway**; en pruebas E2E y desde la SPA use la **URL base del gateway** (`http://localhost:8080`), no el puerto **8083** directo, salvo depuración local consciente.

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
