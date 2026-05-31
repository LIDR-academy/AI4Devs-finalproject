# Estrategia JWT y API Gateway (MyTreeLibrary)

Documento operativo alineado con [readme.md](../../readme.md) §2.5, [infra/compose/README.md](../../infra/compose/README.md) y [.cursor/rules/api-security.mdc](../../.cursor/rules/api-security.mdc).

## 1. Rol del Keycloak y del JWT

- La **SPA** obtiene **access token** (JWT) mediante **OIDC Authorization Code + PKCE** contra el realm **`mtl`**.
- Las llamadas a la API van al **API Gateway** con cabecera `Authorization: Bearer <access_token>`.
- Los roles de negocio se expresan como **roles de realm** en Keycloak: **`COLABORADOR`** y **`ADMIN`** (aparecen en el JWT bajo `realm_access.roles` salvo configuración contraria).

## 2. Validación en el Gateway (MVP)

1. El gateway actúa como **OAuth2 Resource Server** y valida el JWT (firma, `iss`, `exp`, etc.) frente al **issuer** del realm. En código, `spring.security.oauth2.resourceserver.jwt.issuer-uri` se parametriza con **`MTL_JWT_ISSUER_URI`** (por defecto `http://localhost:8180/realms/mtl` desde el host de desarrollo; ajustar host/puerto con `KEYCLOAK_PORT` u orígenes internos Docker, véase §5).
2. **Lista blanca de rutas públicas** alineada con [docs/api/openapi.yaml](../api/openapi.yaml): p. ej. `/api/catalog/public/**`, `GET /api/media/public/**` (p. ej. miniatura de foto principal en listado público), `POST /api/notifications/subscriptions`, y endpoints de actuator acordados (`/actuator/health`, `/actuator/info`). El resto de rutas bajo `/api/**` exigen JWT válido. Peticiones **fuera** de `/api/**` quedan bloqueadas; Spring Security + OAuth2 RS pueden responder **401** (`WWW-Authenticate: Bearer`) o **403** según el caso — en ambos casos no hay API anónima fuera del prefijo acordado.
3. **Autorización por roles en el gateway** (opcional en MVP): reglas por ruta para exigir `ADMIN` donde el contrato de producto lo reserve (p. ej. maestros); el resto puede delegarse en microservicios.

### 2.1. Implementación actual (`services/api-gateway`)

- Stack: **Spring Boot 4**, **Spring Cloud Gateway** en modo servidor **WebFlux**; dependencia Maven **`spring-cloud-starter-gateway-server-webflux`** (train Spring Cloud **2025.1.x** / Gateway **5.x**; el artefacto histórico `spring-cloud-starter-gateway` ya no aplica en ese train).
- Rutas proxy: definidas en **`spring.cloud.gateway.server.webflux.routes`**. URIs de destino en YAML como **`mtl.catalog.uri`**, **`mtl.media.uri`**, **`mtl.notification.uri`**, **`mtl.ai.uri`** (por defecto `http://localhost:8081` … `8084`); en despliegue suelen mapearse desde **`MTL_CATALOG_URI`**, **`MTL_MEDIA_URI`**, etc., vía *relaxed binding* de Spring Boot. Prefijos `/api/catalog/**`, `/api/media/**`, `/api/notifications/**`, `/api/ai/**`.
- Tras validar el JWT, el cliente HTTP del gateway **reenvía** `Authorization: Bearer` al upstream (**token relay**); los microservicios deben configurar su propio resource server con el mismo criterio de `issuer-uri` cuando expongan API.
- **Roadmap técnico del módulo gateway** (no bloquean la descripción anterior): timeouts y resiliencia del proxy hacia upstreams; documentación de despliegue en contenedor/red Docker. **CORS** explícito y **correlación** `X-Correlation-Id` (normalización, reenvío al upstream y Problem): **implementados** — ver §5–6.

## 3. Propagación hacia microservicios (decisión MVP)

**Modo por defecto (MVP / desarrollo): token relay**

- Tras validar el JWT, el gateway **reenvía** la misma cabecera `Authorization: Bearer` al microservicio de destino.
- Cada microservicio **revalida** el JWT con el mismo `issuer-uri` (misma clave pública / JWKS). Así se mantiene defensa en profundidad si algún servicio fuera alcanzable sin pasar por el gateway.
- **Autorización de negocio** (p. ej. comprobar `COLABORADOR` vs `ADMIN`, propiedad del árbol): se implementa en el servicio leyendo claims del token ya validado.

**Mapeo en `catalog-service` (OAuth2 Resource Server):** el servicio revalida el JWT con el mismo `issuer-uri` que el gateway y convierte **`realm_access.roles`** en `GrantedAuthority` con prefijo **`ROLE_`** (p. ej. `COLABORADOR` → `ROLE_COLABORADOR`) mediante un `JwtAuthenticationConverter` dedicado, alineado con `hasRole("COLABORADOR")` / `hasRole("ADMIN")` en Spring Security.

**Alternativa (solo con red de confianza en producción): cabeceras internas**

- El gateway valida el JWT y **no** reenvía el Bearer; inyecta cabeceras internas (`X-User-Sub`, roles) y un secreto compartido o política de red que impida saltarse el gateway.
- Los microservicios **no** ejecutan resource server JWT; confían en esas cabeceras solo para tráfico interno. Requiere **aislamiento de red** (p. ej. NetworkPolicy en Kubernetes) para no ser explotable.

El código del gateway sigue el **modo token relay** por defecto; cualquier cambio (p. ej. solo cabeceras internas) requiere decisión explícita en ADR o en este fichero.

## 4. Front (Vue)

- Usuarios de prueba del realm (solo desarrollo, ver [infra/compose/README.md](../../infra/compose/README.md)): `colaborador` / `colaborador_dev` (rol `COLABORADOR`), `admin_mtl` / `admin_mtl_dev` (roles `ADMIN` y `COLABORADOR`).
- Variables de entorno típicas (ej. prefijo `VITE_` en Vue): URL base de Keycloak (p. ej. `http://localhost:8180` si `KEYCLOAK_PORT=8180`), realm `mtl`, `client_id` **`mtl-spa`**.
- **Redirect URIs** y **Web origins** deben coincidir con el origen real del dev server (por defecto `http://localhost:5173` en el realm importado).
- Usar el **access token** como Bearer hacia el gateway; no usar el ID token como sustituto del access token para la API REST.

## 5. Back (Spring Boot)

- **Gateway y microservicios** que validen JWT: `spring.security.oauth2.resourceserver.jwt.issuer-uri` apuntando al issuer del realm (desde host: `http://localhost:8180/realms/mtl`; desde contenedor en la misma red Docker: `http://keycloak:8080/realms/mtl` si el runtime resuelve por nombre de servicio).
- Evitar discrepancias entre la URL con la que el navegador obtiene el token y la URL con la que el backend resuelve el JWKS (problemas típicos de `issuer` mismatch).
- **CORS (implementado en gateway):** política explícita para `/api/**` con orígenes `http://localhost:5173` y `http://127.0.0.1:5173`, métodos `GET, POST, PUT, PATCH, DELETE, OPTIONS`, cabeceras `Authorization, Content-Type, Accept, X-Correlation-Id` y `allowCredentials=false`.

## 6. Correlación y logs

- **`CorrelationIdWebFilter`** en el gateway: lee o genera `X-Correlation-Id`, lo fija en la petición reenviada al upstream (proxy), en la cabecera de respuesta y en atributos del exchange para respuestas Problem (`correlationId`).
- Los microservicios MVC (`catalog-service`, `media-service`, `notification-service`) leen la misma cabecera en **`CorrelationIdFilter`** (MDC `correlationId` para logs y Problem).
- No registrar tokens ni PII en logs ([logging.mdc](../../.cursor/rules/logging.mdc)).
