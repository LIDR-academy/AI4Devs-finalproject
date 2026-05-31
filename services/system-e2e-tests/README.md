# system-e2e-tests

HTTP contra el **API Gateway** y microservicios reales (JWT Keycloak, sin WireMock).

- **Estrategia back vs UI:** [testing-java.md](../../docs/engineering/testing-java.md) §2.1.1  
- **Diseño del módulo:** [testing-java.md](../../docs/engineering/testing-java.md) §2.1.2  

## Requisitos

Stack según [services/README.md](../README.md): Keycloak, PostgreSQL (Flyway catálogo, semilla maestros), **catalog-service** (8081), **api-gateway** (8080), perfil `dev`.

El `iss` del token debe coincidir con `MTL_JWT_ISSUER_URI` (por defecto `http://localhost:8180/realms/mtl`); no mezclar `localhost` y `127.0.0.1` al obtener el token.

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `MTL_E2E_TOKEN_COLABORADOR` | Token manual (preferido) |
| `MTL_E2E_ACCESS_TOKEN` | Legacy (misma prioridad que colaborador si falta el anterior) |
| `MTL_E2E_AUTO_KEYCLOAK_TOKEN=true` | Token automático vía Admin API; activa `directAccessGrants` en `mtl-spa` solo durante el IT (dev) |
| `MTL_E2E_RUN_SECURITY=true` | Habilita esc. 3 sin token en env (stack arriba) |
| `MTL_E2E_GATEWAY_BASE_URL` | Default `http://127.0.0.1:8080` |
| `MTL_KEYCLOAK_BASE_URL` | Default derivado de `MTL_JWT_ISSUER_URI` |
| `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD` | Para modo automático (compose: `admin` / `admin_dev_password`) |

Sin token ni `MTL_E2E_AUTO_KEYCLOAK_TOKEN`, los `*GatewayE2EIT` quedan deshabilitados (`@EnabledIf`); `mvn verify` sigue en verde (smoke unitario).

## Ejecución

Desde `services/`:

```powershell
$env:MTL_E2E_AUTO_KEYCLOAK_TOKEN = "true"
mvn -pl system-e2e-tests "-Dit.test=Hu001Scenario*" verify          # HU-001 esc. 2–4
mvn -pl system-e2e-tests verify                                      # + maestros (CatalogMasters…)
```

```bash
export MTL_E2E_TOKEN_COLABORADOR="<token>"
mvn -pl system-e2e-tests verify
```

## Clases y escenarios

| Clase | Comprueba |
|-------|-----------|
| `Hu001Scenario02…` | Esc. 2: COLABORADOR → species **200**; eco `X-Correlation-Id` |
| `Hu001Scenario03…` | Esc. 3: sin Bearer / Bearer inválido → **401** Problem + correlación |
| `Hu001Scenario04…` | Esc. 4: COLABORADOR → `families`, `species/1` → **403** (id `1` en semilla) |
| `CatalogMastersGatewayE2EIT` | Maestros species/provinces, búsqueda `q` / `unaccent` |

Tags: `hu001`, `hu001-s0N`. Convención Maven/IT: [testing-java.md](../../docs/engineering/testing-java.md).

## Postman (gateway + maestros catálogo)

Objetivo: llamar al **API Gateway** (puerto **8080** por defecto) con un **access token** del realm **`mtl`**, igual que la SPA. Los endpoints `/api/catalog/species` y `/api/catalog/provinces` **no** son públicos: hace falta usuario con rol **COLABORADOR** o **ADMIN** (usuarios de prueba y SPA: [jwt-gateway-strategy.md](../../docs/security/jwt-gateway-strategy.md) §4 *Front (Vue)*).

### 1. Redirect de Postman y Keycloak

El error **`Invalid parameter: redirect_uri`** aparece cuando la URL de callback que envía Postman **no está** en la lista **Valid redirect URIs** del cliente **`mtl-spa`** en Keycloak (coincidencia estricta: sin barra final de más, `https` correcto).

Postman usa **una de estas dos** según cómo autentiques:

| Situación | Callback URL que debes poner en Postman **y** registrar en Keycloak |
|-----------|----------------------------------------------------------------------|
| Postman **escritorio**, “Authorize using browser” o flujo clásico | `https://oauth.pstmn.io/v1/callback` |
| Postman **web** o callback por defecto en configuración reciente | `https://oauth.pstmn.io/v1/browser-callback` |

En el **realm import** del repo (`infra/compose/init/keycloak/mtl-realm.json`) ya van ambas URIs en **`mtl-spa`**. Si tu Keycloak se creó **antes** de ese cambio, o usas un volumen con realm antiguo, añádelas a mano: **Clients → mtl-spa → Valid redirect URIs** (una línea por URI, exactas como arriba) y **Web origins** incluye `https://oauth.pstmn.io` para el login desde el navegador. Luego **Save**.

### 2. Obtener el token en Postman

1. Crea una petición cualquiera (p. ej. `GET {{gateway}}/api/catalog/species`).
2. Pestaña **Authorization** → Type **OAuth 2.0** → **Get New Access Token**.
3. Configuración típica (ajusta host/puerto si tu Keycloak no está en 8180):

| Campo | Valor |
|--------|--------|
| **Grant Type** | Authorization Code (with PKCE) |
| **Callback URL** | `https://oauth.pstmn.io/v1/callback` |
| **Auth URL** | `http://localhost:8180/realms/mtl/protocol/openid-connect/auth` |
| **Access Token URL** | `http://localhost:8180/realms/mtl/protocol/openid-connect/token` |
| **Client ID** | `mtl-spa` |
| **Client Secret** | (vacío: cliente público) |
| **Code Challenge Method** | SHA-256 |
| **Scope** | `openid profile email` (o el scope que tengáis acordado) |

4. **Get New Access Token** → inicia sesión (usuarios de dev: `colaborador` / `colaborador_dev` o `admin_mtl` / `admin_mtl_dev`, según [jwt-gateway-strategy.md](../../docs/security/jwt-gateway-strategy.md) §4 *Front (Vue)*).
5. **Use Token** y, si quieres reutilizarlo, **Sync** o copia el token a una variable de entorno de colección `{{access_token}}`.

### 3. Peticiones

Variables de colección sugeridas:

- `gateway` → `http://localhost:8080` (o la URL base de tu gateway).
- `access_token` → el token obtenido (o usa la pestaña Authorization OAuth 2.0 en cada request).

**Cabeceras**

- `Authorization`: `Bearer <access_token>` (Postman lo rellena si eliges OAuth 2.0 y el token vigente).
- Opcional: `X-Correlation-Id`: un UUID (trazabilidad alineada con el backend).

**Ejemplos**

| Método | URL |
|--------|-----|
| GET | `{{gateway}}/api/catalog/species?page=0&size=20` |
| GET | `{{gateway}}/api/catalog/species?page=0&size=5&q=cina` (búsqueda con `unaccent`, alineado con E2E) |
| GET | `{{gateway}}/api/catalog/provinces?page=0&size=20` |
| GET | `{{gateway}}/api/catalog/provinces?page=0&size=5&q=01` (código provincia en semilla, alineado con E2E) |

Query opcionales: `q` (búsqueda), `unpaged=true` (según el contrato del controlador).

### 4. Probar solo el catálogo (sin gateway)

Misma cabecera `Authorization: Bearer …` contra **`http://localhost:8081`** (catalog-service), mismas rutas:  
`http://localhost:8081/api/catalog/species`, etc. Útil para aislar si un fallo viene del gateway o del servicio.
