# Infraestructura local (Docker Compose)

Entorno de **desarrollo** alineado con [readme.md](../../readme.md) (PostgreSQL + PostGIS, MongoDB, Redis, MinIO, Kafka en KRaft, Keycloak, Mailpit).

## Requisitos

- Docker Engine y Docker Compose v2.

## Arranque

```bash
cd infra/compose
copy .env.example .env
docker compose up -d
```

En Unix: `cp .env.example .env`.

La primera vez, Postgres ejecuta los scripts en `init/postgres/` (esquemas, PostGIS, BD `keycloak` y rol `keycloak`). El servicio **`kafka-init`** crea el topic `catalog.ejemplar.evento` si no existe. El servicio **`minio-init`** crea el bucket `mtl-photos`; CORS para la SPA se configura con **`MINIO_API_CORS_ALLOW_ORIGIN`** en el servicio `minio` (véase § MinIO). El servicio **`mailpit`** expone SMTP de prueba y la UI de mensajes capturados (véase § Mailpit).

## Puertos por defecto

| Servicio   | Puerto host | Uso |
|------------|-------------|-----|
| PostgreSQL | 5433 (host; por defecto en `.env.example` para no usar 5432 si ya tienes otro Postgres local) | JDBC `jdbc:postgresql://localhost:5433/mtl` (usuario `POSTGRES_USER`; dentro del contenedor el puerto sigue siendo 5432) |
| MongoDB    | 27017       | URI con `authSource=admin` |
| Redis      | 6379        | — |
| MinIO API  | 9000        | S3 API |
| MinIO consola | 9001   | Interfaz web |
| Kafka (desde el host) | 9094 | `bootstrap.servers=localhost:9094` |
| Keycloak   | 8180        | Consola `http://localhost:8180` |
| Mailpit SMTP (desde el host) | 1025 (`MAILPIT_SMTP_PORT`) | `spring.mail.host=localhost`, `spring.mail.port` = este puerto (notification-service en dev) |
| Mailpit UI | 8025 (`MAILPIT_UI_PORT`) | Bandeja de mensajes capturados: `http://localhost:8025` |
| Prometheus | 9090 (`PROMETHEUS_PORT`) | Métricas: `http://localhost:9090` (targets en **Status → Targets**) |
| Grafana | 3000 (`GRAFANA_PORT`) | Dashboards: `http://localhost:3000` (credenciales `GRAFANA_ADMIN_*` en `.env`) |

Dentro de la red Docker, Kafka PLAINTEXT: `kafka:9092`. El SMTP de Mailpit dentro de Compose: `mailpit:1025`.

## Observabilidad (Prometheus + Grafana)

Stack según [ADR-0005](../../docs/adr/0005-microservices-observabilty-spring-boot.md). Configuración en [platform/observability/](../../platform/observability/README.md).

Prometheus hace **scrape** de los microservicios Spring Boot en el **host** (`localhost:8080`–`8084`, perfil `dev` con `mvn spring-boot:run`). Los contenedores usan `host.docker.internal` (en Linux, `extra_hosts: host-gateway` en el servicio `prometheus`).

Descargar imágenes y levantar solo observabilidad:

```bash
cd infra/compose
docker compose pull prometheus grafana
docker compose up -d prometheus grafana
```

Los microservicios deben estar en marcha en el host para que los cinco targets aparezcan **UP** en Prometheus.

## Mailpit (SMTP de prueba, HU-007)

**Mailpit** recibe correo por SMTP y los muestra en la **interfaz web**; no entrega a dominios reales. Sirve para desarrollar **TASK-HU-007-04** (`notification-service`) sin credenciales de relay externos.

1. Arranque: `docker compose up -d` (el servicio `mailpit` queda en la red `mtl`).
2. **Ver correos:** abre `http://localhost:${MAILPIT_UI_PORT:-8025}` en el navegador.
3. **Microservicio en el host (IDE / `mvn spring-boot:run`):** apunta el cliente SMTP a `localhost` y al puerto **`MAILPIT_SMTP_PORT`** (por defecto **1025**). Sin auth TLS típico en local.
4. **Microservicio dentro de Docker** (si algún día se conteneriza): host SMTP `mailpit`, puerto **1025** en la red `mtl`.

Imagen: `axllent/mailpit` (versión fijada en [docker-compose.yml](docker-compose.yml)).

## MinIO y subida de fotos (media-service)

El **media-service** genera URLs prefirmadas (SigV4) para que el navegador haga `PUT` directamente contra MinIO. Hace falta el bucket **`mtl-photos`** y cabeceras **CORS** que permitan el origen del Vite. Flujo y propiedades `mtl.media.*`: [docs/engineering/media-upload-hu006.md](../../docs/engineering/media-upload-hu006.md).

### Arranque automático (sin pasos manuales)

1. **Bucket:** el servicio **`minio-init`** (imagen `minio/mc`) espera a que MinIO responda y ejecuta `mc mb` idempotente sobre `mtl-photos`. No necesitas instalar `mc` en el host.

2. **CORS (MinIO community):** la API S3 de CORS **por bucket** no está disponible en la edición community; el `docker-compose` fija **`MINIO_API_CORS_ALLOW_ORIGIN`** en el servicio `minio` (orígenes típicos de Vite: `http://localhost:5173` y `http://127.0.0.1:5173`). Para otros orígenes o puertos, define en tu `.env` la variable `MINIO_API_CORS_ALLOW_ORIGIN` (lista separada por comas) y recrea el contenedor `minio`.

Para repetir solo la creación del bucket (p. ej. tras borrar el volumen de MinIO):

```bash
cd infra/compose
docker compose run --rm minio-init
```

### Consola web (opcional)

Sigue disponible en `http://localhost:${MINIO_CONSOLE_PORT:-9001}` con las mismas credenciales que `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` del `.env`.

## Credenciales de desarrollo

Valores por defecto pensados **solo para local**; están en `.env.example` y en el SQL de init de Keycloak. Si cambias `KEYCLOAK_DB_PASSWORD` en `.env`, actualiza la misma cadena en `init/postgres/01-init.sql` y **elimina el volumen** `mtl_pgdata` antes de volver a levantar.

## Detener y borrar datos

```bash
docker compose down
docker compose down -v
```

`-v` elimina volúmenes (Postgres, Mongo, Kafka, etc.).

## Keycloak (realm `mtl` y JWT)

### `start-dev` solo para desarrollo

El comando **`start-dev`** de Keycloak está pensado para **entorno local**: configuración relajada, sin el endurecimiento operativo de producción. **No** usar esta imagen/comando tal cual en producción; allí se aplicará TLS, hostname estricto, modo de arranque y secretos según el despliegue (véase [readme.md](../../readme.md) §2.4–2.5).

### Import del realm al levantar Compose

- Los ficheros JSON en [init/keycloak/](init/keycloak/) se montan en `/opt/keycloak/data/import` y Keycloak arranca con **`--import-realm`**: se importa el realm **`mtl`** cuando la base de datos de Keycloak está vacía (primera vez tras crear el volumen de Postgres que contiene la BD `keycloak`).
- Si el realm **ya existe**, Keycloak aplica la estrategia configurada para imports (p. ej. `IGNORE_EXISTING`): puede **omitir** sobrescribir un realm ya presente. Para **forzar** una reimportación coherente con un JSON nuevo, suele hacer falta eliminar datos de la BD `keycloak` o usar export/import desde la consola de administración según la documentación de Keycloak.

### Parámetros útiles para front y back

| Concepto | Valor por defecto (dev) |
|----------|-------------------------|
| Realm | `mtl` |
| Issuer (URL absoluta, host) | `http://localhost:8180/realms/mtl` (puerto = `KEYCLOAK_PORT`, por defecto 8180) |
| Cliente SPA (público, PKCE) | `mtl-spa` |
| Redirect URIs | Vite: `http://localhost:5173/*`, `http://127.0.0.1:5173/*`. Postman OAuth: `https://oauth.pstmn.io/v1/callback`, `https://oauth.pstmn.io/v1/browser-callback` (misma cadena en el campo **Callback URL** de Postman que en Keycloak) |
| Web origins | `http://localhost:5173`, `http://127.0.0.1:5173`, `https://oauth.pstmn.io` |
| Roles de realm | `COLABORADOR`, `ADMIN` (asignar a usuarios desde la consola de administración) |
| Scopes OIDC (`mtl-spa`) | `fullScopeAllowed: true` en dev: el realm importado hereda los *default client scopes* estándar de Keycloak (incluye **`roles`** → `realm_access.roles` en el access token, y **`profile`** / **`email`**) |
| Uso con **catalog-service** (`POST /api/catalog/ejemplares`) | El access token debe traer al menos **`email`** y datos de perfil para `nombre` (`name` o `given_name`/`family_name`). En la SPA OIDC, pedir explícitamente `scope=openid profile email` al obtener el token (véase [ADR-0004](../../docs/adr/0004-catalog-rest-write-and-audit.md)). |
| PKCE | Obligatorio **S256** (`pkce.code.challenge.method` en el cliente) |
| Post-logout redirect | Mismos orígenes Vite que redirect URIs (`post.logout.redirect.uris` en el cliente) |

Consola de administración: `http://localhost:8180` (credenciales de arranque `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD` del `.env`).

### Verificación TASK-HU-001-01 (realm + cliente SPA)

Criterios de cierre para [HU-001-ticket-breakdown](../../docs/backlog/HU-001-ticket-breakdown.md) — **TASK-HU-001-01**:

1. **Descubrimiento OIDC** (Keycloak levantado, `KEYCLOAK_PORT` por defecto 8180):

   ```bash
   curl -s http://localhost:8180/realms/mtl/.well-known/openid-configuration | head
   ```

   Debe existir `issuer` `http://localhost:8180/realms/mtl` (o el host/puerto que uses) y endpoints `authorization_endpoint`, `token_endpoint`, `jwks_uri`.

2. **Consola (realm `mtl` → Clients → `mtl-spa`)**: Client authentication **Off** (público); **Standard flow** activo; **Direct access grants** desactivado; **Valid redirect URIs** y **Web origins** como en la tabla superior; **PKCE Method** S256; **Client scopes** → *Assigned default client scopes*: debe figurar el alcance **`roles`** (y típicamente `profile`, `email`, `web-origins`, `acr`), coherente con [mtl-realm.json](init/keycloak/mtl-realm.json).

3. **Token con roles**: Tras un login real (Authorization Code + PKCE desde la SPA o flujo manual en navegador), el **access token** JWT debe incluir **`realm_access.roles`** con los roles de realm del usuario (p. ej. `COLABORADOR` o `ADMIN`). Compruébalo en una herramienta de inspección de JWT (sin pegar tokens en chats públicos).

4. **Cambios en `mtl-realm.json`**: no se aplican solos a un realm ya importado; hace falta **reimportación** (véase arriba «Import del realm») o ajuste manual en consola hasta el siguiente `docker compose down -v` + arranque limpio.

### Usuarios del realm `mtl` (solo desarrollo)

Definidos en [init/keycloak/mtl-realm.json](init/keycloak/mtl-realm.json); se crean en el **primer import** del realm (BD `keycloak` vacía). Contraseñas **débiles a propósito**: no reutilizar fuera de local.

| Usuario realm `mtl` | Contraseña | Roles realm |
|---------------------|------------|-------------|
| `colaborador` | `colaborador_dev` | `COLABORADOR` |
| `admin_mtl` | `admin_mtl_dev` | `ADMIN`, `COLABORADOR` |

`admin_mtl` lleva también `COLABORADOR` para poder probar flujos de colaborador con la misma cuenta (alineado con la generalización Administrador → Colaborador en el modelo de casos de uso).

Si el realm **ya existía** y no ves estos usuarios (import `IGNORE_EXISTING`), borra el realm `mtl` desde la consola de administración de Keycloak y reinicia el contenedor, o bien crea los usuarios a mano y asigna los roles.

Estrategia de validación JWT en gateway y microservicios: [docs/security/jwt-gateway-strategy.md](../../docs/security/jwt-gateway-strategy.md). El gateway lee el issuer desde **`MTL_JWT_ISSUER_URI`** (por defecto la misma URL absoluta que la tabla de arriba); variables de enrutado hacia microservicios: [services/README.md](../../services/README.md) (sección API Gateway).

## Notas

- **Microservicios** no están en este compose: solo dependencias. El gateway y los `services/*` se ejecutan aparte (IDE, Maven): orden y puertos en [services/README.md](../../services/README.md).
- **Keycloak** arranca en modo `start-dev` con administrador de arranque (`KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD`); el realm `mtl` se importa como se indica arriba.
- **Mailpit** captura el correo enviado por SMTP en local (sin entrega a Internet); puertos y uso con **notification-service** en la sección Mailpit y en la tabla de puertos.
